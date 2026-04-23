# REFACTORING_GUIDE.md

본 문서는 숙소 검색 시스템의 성능 병목(9초 이상 지연)을 해결하기 위해, **"Logic Push-down"** 및 **"Covering Index"** 전략을 실제 코드에 적용하기 위한 기술 지시서입니다.

---

## 1. 최적화 목표
- **성능**: 400만 건 기준 검색 속도를 10ms 내외로 단축 (약 1,500배 향상).
- **구조**: 애플리케이션(Node.js)의 집계/정렬/페이징 로직을 DB(SQL)로 전격 이관.
- **가독성**: 서비스 레이어의 복잡한 루프문과 정렬 코드를 제거하여 "Clean Code" 달성.

---

## 2. 인프라 계층: 인덱스 최적화 (Database)

`listing_schedule` 테이블에 실험 결과 최적의 성능을 보인 **커버링 인덱스(Covering Index)**를 생성하십시오.

```sql
-- 기존의 비효율적인 개별 보조 인덱스는 모두 삭제 후 실행 권장
CREATE INDEX idx_covering_search ON listing_schedule(isAvailable, date, price, listingId);
ANALYZE TABLE listing_schedule;
```

---

## 3. 인터페이스 계층: DTO 신규 정의 (Data Transfer Object)

DB에서 계산된 `totalPrice`를 포함하여 클라이언트에 최적화된 응답을 보낼 수 있도록 DTO를 정의하십시오.

- **DTO명**: `ListingSearchResponseDto` (또는 기존 `ListingResponseDto` 수정)
- **포함 필드**:
    - `name`, `description`, `address`, `guestCapacity`, `infantCapacity`
    - **`totalPrice`**: DB에서 계산되어 돌아온 최종 합계 금액 (필수)

---

## 4. 데이터 액세스 계층: SEARCH 3 쿼리 이식 (Repository)

`listing.repository.ts`의 `searchListings` 메서드를 **윈도우 함수 기반의 SEARCH 3** 로직으로 리팩토링하십시오.

### **핵심 SQL 템플릿**
단 한 번의 스캔(Single Scan)으로 결과를 추출하십시오. 파라미터(`:checkIn`, `:checkOut`, `:minPrice`, `:maxPrice`, `:guestCount`, `:infantCount`)는 동적으로 매핑하십시오.

```sql
SELECT 
    l.name, l.description, l.address, l.guestCapacity, l.infantCapacity,
    s.totalPrice -- DB에서 이미 계산됨
FROM listings AS l
INNER JOIN (
    SELECT 
        ls.listingId,
        COUNT(*) OVER(PARTITION BY ls.listingId) as availableDays,
        SUM(ls.price) OVER(PARTITION BY ls.listingId) as totalPrice
    FROM listing_schedule AS ls
    WHERE ls.date BETWEEN :checkIn AND :checkOut -- 검색 기간
      AND ls.isAvailable = 1
      AND ls.price BETWEEN :minPrice AND :maxPrice -- 가격 범위
) AS s ON l.id = s.listingId
WHERE l.guestCapacity >= :guestCount
  AND l.infantCapacity >= :infantCount
  AND s.availableDays = :diffDays -- 검색 기간(일수)과 일치하는 숙소만 필터링
ORDER BY s.totalPrice ASC, l.id -- DB 레벨 정렬
LIMIT 100; -- DB 레벨 페이징 (상위 100개)
```

---

## 5. 서비스 계층: 로직 슬림화 (Service)

`listing.service.ts`는 더 이상 데이터를 직접 가공하지 않고 리포지토리가 반환한 결과를 그대로 반환하는 **"Pass-through"** 구조로 변경하십시오.

### **리팩토링 지침**
1.  **제거**: `l.schedules.reduce(...)` 로직을 완전히 삭제하십시오.
2.  **제거**: `results.sort(...)` 코드를 삭제하십시오.
3.  **제거**: `results.slice(...)` 코드를 삭제하십시오.
4.  **변경**: 리포지토리로부터 이미 정렬되고 제한된 데이터를 받아 즉시 반환하십시오.

---

## 6. 테스트 및 검증 전략 (Testing & Validation)

본 리팩토링은 실제 SQL의 동작과 API의 정합성을 **운영 환경과 격리된 테스트용 DBMS**에서 반드시 검증해야 합니다.

### **6.1 Repository 통합 테스트 (Query Validation)**
- **목적**: `SEARCH 3` 윈도우 함수가 실제 DB 엔진에서 정확한 값과 성능을 내는지 검증합니다.
- **환경**: 별도의 테스트용 DB(예: `Testcontainers`, Docker 기반 MySQL 등)를 사용하십시오.
- **검증 항목**:
    - 기간/가격 필터링이 정확하며, `totalPrice` 합계가 기존 비즈니스 로직과 일치하는가?
    - 대용량 데이터 환경에서 `EXPLAIN` 실행 시 **Covering Index Scan**이 작동하는가?

### **6.2 Controller 통합 테스트 (API E2E Validation)**
- **목적**: API 요청 시 최종 응답 스펙이 올바른지 검증합니다.
- **환경**: `supertest` 등을 활용한 NestJS 통합 테스트 환경.
- **검증 항목**:
    - 응답 데이터에 `totalPrice` 필드가 포함되어 있는가?
    - 결과가 가격 오름차순으로 정렬되어 있으며 최대 100개로 제한되는가?

---

## 7. 최종 검증 체크리스트
- [ ] **Infrastructure**: `idx_covering_search` 인덱스가 생성되었는가?
- [ ] **SQL**: `SEARCH 3` 로직이 리포지토리에 이식되었는가? (LIMIT 100 확인)
- [ ] **Service**: `sort()`, `reduce()`, `slice()` 등 애플리케이션 레벨 가공 코드가 삭제되었는가?
- [ ] **Testing**: 격리된 테스트용 DBMS 환경에서 통합 테스트가 모두 통과되었는가?
- [ ] **Performance**: 400만 건 기준 응답 시간이 10ms 내외를 기록하는가?

---

**[주의]**
- 윈도우 함수(`OVER`) 지원을 위해 테스트 DBMS 버전도 **MySQL 8.0 이상**으로 설정하십시오.
- `availableDays` 필터링 시 사용되는 `diffDays` 파라미터는 검색 시작/종료일의 정확한 날짜 차이여야 합니다.
