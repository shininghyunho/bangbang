# MySQL EXPLAIN 완전 가이드

> 이 문서 하나로 `EXPLAIN`의 모든 것을 파악할 수 있도록 작성된 레퍼런스입니다.  
> 처음 접하는 분도, 실무 중 빠르게 확인이 필요한 분도 모두 활용할 수 있습니다.

---

## 목차

1. [EXPLAIN이란?](#1-explain이란)
2. [기본 사용법](#2-기본-사용법)
3. [출력 컬럼 전체 해설](#3-출력-컬럼-전체-해설)
   - [id](#id)
   - [select_type](#select_type)
   - [table](#table)
   - [partitions](#partitions)
   - [type (가장 중요)](#type-가장-중요)
   - [possible_keys](#possible_keys)
   - [key](#key)
   - [key_len](#key_len)
   - [ref](#ref)
   - [rows](#rows)
   - [filtered](#filtered)
   - [Extra](#extra)
4. [type 빠른 판단표](#4-type-빠른-판단표)
5. [Extra 빠른 판단표](#5-extra-빠른-판단표)
6. [EXPLAIN ANALYZE (MySQL 8.0.18+)](#6-explain-analyze-mysql-8018)
7. [출력 포맷 옵션](#7-출력-포맷-옵션)
8. [분석 체크리스트 (실무용)](#8-분석-체크리스트-실무용)
9. [자주 나오는 문제 패턴과 해결법](#9-자주-나오는-문제-패턴과-해결법)

---

## 1. EXPLAIN이란?

`EXPLAIN`은 MySQL이 쿼리를 **어떻게 실행할 계획인지** 보여주는 명령어입니다.  
실제로 쿼리를 실행하지 않고 실행 계획만 출력하므로, 느린 쿼리의 원인을 파악하거나 인덱스가 제대로 타는지 확인할 때 사용합니다.

`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `REPLACE` 문 모두 앞에 붙여서 사용할 수 있습니다.

---

## 2. 기본 사용법

```sql
-- 기본
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- JSON 형식 (더 상세한 정보)
EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE user_id = 1;

-- 트리 형식 (MySQL 8.0+)
EXPLAIN FORMAT=TREE SELECT * FROM orders WHERE user_id = 1;

-- 실제 실행 + 측정 (MySQL 8.0.18+)
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;

-- 현재 실행 중인 쿼리의 실행 계획
EXPLAIN FOR CONNECTION {connection_id};
```

---

## 3. 출력 컬럼 전체 해설

### `id`

**SELECT 식별자.** 쿼리 안에서 각 SELECT가 몇 번째인지를 나타냅니다.

| 값 | 의미 |
|---|---|
| 같은 숫자 | 같은 SELECT 블록 (JOIN 등) |
| 숫자가 클수록 | 먼저 실행되는 경우가 많음 (서브쿼리) |
| `NULL` | UNION의 최종 결과를 나타내는 행 |

```sql
-- 예시: 서브쿼리가 있으면 id가 여러 개 나옴
EXPLAIN
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE grade = 'VIP');
-- id=1: orders, id=2: users (서브쿼리)
```

---

### `select_type`

**SELECT의 종류.** 쿼리 구조가 어떻게 생겼는지 알려줍니다.

| 값 | 의미 | 주의 여부 |
|---|---|---|
| `SIMPLE` | 서브쿼리/UNION 없는 단순 SELECT | ✅ 정상 |
| `PRIMARY` | 가장 바깥쪽 SELECT | ✅ 정상 |
| `SUBQUERY` | WHERE/SELECT 절의 서브쿼리 | ⚠️ 캐싱됨 |
| `DEPENDENT SUBQUERY` | 외부 쿼리에 의존하는 서브쿼리 (상관 서브쿼리) | ❌ 행마다 재실행 |
| `UNCACHEABLE SUBQUERY` | 결과를 캐싱할 수 없는 서브쿼리 | ❌ 행마다 재실행 |
| `DERIVED` | FROM 절의 서브쿼리 (파생 테이블) | ⚠️ 임시 테이블 생성 |
| `MATERIALIZED` | 서브쿼리를 임시 테이블로 구체화 | ⚠️ 임시 테이블 생성 |
| `UNION` | UNION의 두 번째 이후 SELECT | ✅ 보통 정상 |
| `UNION RESULT` | UNION 결과를 합치는 과정 | ⚠️ 임시 테이블 사용 |

> **핵심:** `DEPENDENT SUBQUERY`와 `UNCACHEABLE SUBQUERY`는 외부 쿼리의 각 행마다 서브쿼리가 재실행되므로 성능에 가장 나쁩니다. 가능하면 JOIN으로 변경하세요.

---

### `table`

**대상 테이블 이름.** 일반적으로 테이블명이 그대로 나오지만, 특수한 경우 아래처럼 표시됩니다.

| 값 | 의미 |
|---|---|
| `테이블명` | 일반 테이블 |
| `<unionM,N>` | id M과 N의 UNION 결과 |
| `<derivedN>` | id N에 해당하는 서브쿼리로 만들어진 파생 테이블 |
| `<subqueryN>` | id N의 구체화된(Materialized) 서브쿼리 결과 |

---

### `partitions`

파티셔닝된 테이블에서 **어떤 파티션을 읽는지** 보여줍니다.  
파티셔닝하지 않은 테이블은 항상 `NULL`입니다.  
파티션 프루닝(Pruning)이 잘 되고 있는지 확인할 때 사용합니다.

---

### `type` (가장 중요)

**테이블 접근 방식.** EXPLAIN에서 가장 먼저 확인해야 하는 컬럼입니다.  
성능 순서대로 나열하면 다음과 같습니다. **위쪽일수록 좋습니다.**

#### system
테이블에 행이 정확히 1개인 경우. `const`의 특수한 케이스입니다.

```sql
-- MyISAM 시스템 테이블에서만 주로 발생
```

#### const
PK 또는 UNIQUE 인덱스의 모든 컬럼을 상수값으로 조회할 때 발생합니다.  
쿼리 시작 시 단 1번만 읽으므로 매우 빠릅니다.

```sql
-- type = const 예시
SELECT * FROM users WHERE id = 1;  -- id가 PK인 경우
SELECT * FROM users WHERE email = 'test@example.com';  -- email이 UNIQUE인 경우
```

#### eq_ref
JOIN에서 앞 테이블의 각 행에 대해 PK 또는 UNIQUE NOT NULL 인덱스를 이용해  
정확히 1개의 행을 읽는 경우입니다. JOIN에서 볼 수 있는 가장 좋은 타입입니다.

```sql
-- type = eq_ref 예시
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id;  -- u.id가 PK
```

#### ref
UNIQUE가 아닌 일반 인덱스로, 같은 인덱스 값을 가진 여러 행을 읽습니다.  
상수 또는 이전 테이블의 컬럼과 `=` 비교를 할 때 발생합니다.

```sql
-- type = ref 예시 (user_id에 일반 인덱스가 있는 경우)
SELECT * FROM orders WHERE user_id = 1;
```

#### fulltext
FULLTEXT 인덱스를 이용한 접근입니다.

#### ref_or_null
`ref`와 동일하지만 NULL 값도 추가로 검색합니다.

```sql
-- type = ref_or_null 예시
SELECT * FROM orders WHERE user_id = 1 OR user_id IS NULL;
```

#### index_merge
두 개 이상의 인덱스를 병합하여 사용하는 경우입니다.  
`Extra`에 `Using union(...)` 또는 `Using intersect(...)` 등이 표시됩니다.

#### range
인덱스를 이용하여 특정 범위의 행만 읽습니다.  
`=`, `<>`, `>`, `>=`, `<`, `<=`, `IS NULL`, `BETWEEN`, `LIKE`, `IN()` 등을 사용할 때 발생합니다.

```sql
-- type = range 예시
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM orders WHERE status IN ('pending', 'processing');
```

#### index
인덱스 트리 전체를 스캔합니다. 풀 테이블 스캔보다는 빠르지만 여전히 느린 편입니다.  
`Extra`에 `Using index`가 함께 뜨면 커버링 인덱스로 인덱스만 읽는 경우이고,  
없다면 인덱스를 순서대로 읽어 테이블에 접근하는 비효율적인 경우입니다.

#### ALL
**풀 테이블 스캔.** 테이블의 모든 행을 읽습니다.  
인덱스를 전혀 타지 않는 상황입니다. 대용량 테이블에서는 큰 문제가 됩니다.

```sql
-- type = ALL 예시 (인덱스 없는 컬럼 조회)
SELECT * FROM orders WHERE memo LIKE '%환불%';
```

---

### `possible_keys`

**사용 가능한 인덱스 후보 목록.** MySQL이 이 쿼리에 쓸 수 있다고 판단한 인덱스들입니다.  
`NULL`이면 쓸 수 있는 인덱스가 없다는 뜻입니다.

> ⚠️ `possible_keys`에 있다고 해서 반드시 사용하는 것은 아닙니다.  
> 실제 사용 여부는 `key` 컬럼으로 확인해야 합니다.

---

### `key`

**실제로 선택된 인덱스.** MySQL 옵티마이저가 최종적으로 선택한 인덱스입니다.

| 값 | 의미 |
|---|---|
| 인덱스 이름 | 해당 인덱스 사용 중 |
| `NULL` | 인덱스 미사용 (풀 스캔 가능성) |

> `possible_keys`에 없는 인덱스가 `key`에 나타날 수 있습니다.  
> 이는 커버링 인덱스로 동작하는 경우입니다 (모든 SELECT 컬럼이 인덱스 안에 포함).

**인덱스 힌트 (강제 지정):**
```sql
-- 특정 인덱스 강제 사용
SELECT * FROM orders USE INDEX (idx_user_id) WHERE user_id = 1;
SELECT * FROM orders FORCE INDEX (idx_user_id) WHERE user_id = 1;

-- 특정 인덱스 무시
SELECT * FROM orders IGNORE INDEX (idx_user_id) WHERE user_id = 1;
```

---

### `key_len`

**실제로 사용된 인덱스의 길이 (바이트).** 복합 인덱스에서 몇 개의 컬럼이 활용되는지 계산할 때 사용합니다.

**key_len 계산 규칙:**

| 타입 | 길이 | NOT NULL | NULL 허용 |
|---|---|---|---|
| INT | 4 bytes | 4 | 5 (+1 for NULL flag) |
| BIGINT | 8 bytes | 8 | 9 |
| CHAR(n) | n × charset_bytes | n×bytes | n×bytes+1 |
| VARCHAR(n) | n × charset_bytes + 2 | n×bytes+2 | n×bytes+3 |
| DATE | 3 bytes | 3 | 4 |
| DATETIME | 5~8 bytes | 5 | 6 |

**utf8mb4 기준 (1문자 = 4bytes):**
```
VARCHAR(50) NOT NULL utf8mb4 → key_len = 50*4 + 2 = 202
VARCHAR(50) NULL    utf8mb4 → key_len = 50*4 + 2 + 1 = 203
INT NOT NULL                → key_len = 4
INT NULL                    → key_len = 5
```

**복합 인덱스 활용도 확인 예시:**
```sql
-- 복합 인덱스: (user_id INT, status VARCHAR(20))
-- user_id만 사용: key_len = 4
-- 둘 다 사용: key_len = 4 + (20*4+2) = 4 + 82 = 86
```

---

### `ref`

**인덱스와 비교하는 값.** `key` 컬럼의 인덱스와 어떤 값을 비교하는지 보여줍니다.

| 값 | 의미 |
|---|---|
| `const` | 상수값과 비교 |
| `db명.테이블명.컬럼명` | 다른 테이블의 컬럼과 비교 (JOIN) |
| `func` | 함수 결과값과 비교 |
| `NULL` | range, index, ALL 타입에서는 표시 안됨 |

> `ref = func`가 나오면 인덱스 컬럼에 함수가 적용되어 있다는 신호일 수 있습니다.  
> 이 경우 인덱스가 제대로 활용되지 않을 수 있으므로 주의가 필요합니다.

---

### `rows`

**읽을 것으로 예상하는 행의 수.** 옵티마이저의 추정값입니다.

- InnoDB는 통계 기반 **추정치**이므로 실제와 다를 수 있습니다.
- 이 값이 클수록 비효율적인 쿼리일 가능성이 높습니다.
- JOIN이 있는 경우, 각 행의 `rows`를 곱한 값이 전체 처리량의 대략적인 기준이 됩니다.

```
-- 예시: rows = 1000, 1000, 100 → 총 100,000,000 행 처리 가능성
```

> 통계가 오래된 경우 `ANALYZE TABLE 테이블명;`으로 통계를 갱신할 수 있습니다.

---

### `filtered`

**조건에 의해 필터링되는 비율 (%).** `rows × (filtered/100)`이 실제로 다음 단계로 넘어가는 행 수입니다.

| 값 | 의미 |
|---|---|
| 100 | 읽은 행이 모두 조건을 만족 (필터링 없음) |
| 50 | 읽은 행 중 50%만 조건 통과 |
| 10 | 읽은 행 중 10%만 조건 통과 (90% 낭비) |

```
rows=1000, filtered=10.00 → 실제 결과에 기여하는 행 = 100개
→ 900개는 읽었지만 버려짐
```

---

### `Extra`

**추가 정보.** 실행 방식에 대한 보조 설명입니다. 아래에서 핵심 값들을 정리합니다.

#### ✅ 좋은 신호

| 값 | 의미 |
|---|---|
| `Using index` | **커버링 인덱스** 사용. 인덱스만으로 쿼리를 처리해 테이블 접근 없음 |
| `Using index condition` | **Index Condition Pushdown(ICP)**. 인덱스에서 먼저 필터링 후 테이블 읽기 |
| `Using where` | WHERE 조건으로 필터링 중. 일반적으로 정상 |
| `Distinct` | DISTINCT 처리를 최적화함 |
| `Not exists` | LEFT JOIN에서 NULL 체크 최적화 |
| `Select tables optimized away` | 인덱스만으로 집계 결과를 도출 (MIN/MAX 최적화) |

#### ⚠️ 주의 신호

| 값 | 의미 | 대처 방법 |
|---|---|---|
| `Using filesort` | **추가 정렬 작업** 필요. ORDER BY가 인덱스를 타지 못함 | ORDER BY 컬럼에 인덱스 추가 또는 인덱스 순서 조정 |
| `Using temporary` | **임시 테이블** 생성. GROUP BY, DISTINCT, UNION 등에서 발생 | GROUP BY 컬럼에 인덱스 추가 |
| `Using join buffer (Block Nested Loop)` | 조인 시 버퍼를 이용한 중첩 루프. 인덱스가 없는 조인 | 조인 조건 컬럼에 인덱스 추가 |
| `Using join buffer (hash join)` | 해시 조인 사용. 인덱스 없을 때 대용량 조인에서 발생 | 조인 컬럼 인덱스화 |
| `Range checked for each record` | 선행 테이블 행마다 최적 인덱스를 매번 재탐색 | 조인 관련 컬럼 인덱스 추가 |

#### ❌ 나쁜 신호

| 값 | 의미 | 대처 방법 |
|---|---|---|
| `Using filesort` + `Using temporary` 동시에 | 임시 테이블 + 추가 정렬. 쿼리 성능 크게 저하 | 쿼리 구조 개선 필수 |
| `Full scan on NULL key` | 서브쿼리 최적화 실패, NULL로 인한 풀스캔 | 서브쿼리 → JOIN 변환 |

---

## 4. type 빠른 판단표

| type | 성능 | 설명 | 언제 발생 |
|---|---|---|---|
| `system` | ★★★★★ | 행이 1개인 테이블 | 특수 케이스 |
| `const` | ★★★★★ | PK/UNIQUE 상수 조회 | `WHERE pk = 1` |
| `eq_ref` | ★★★★★ | JOIN에서 PK/UNIQUE | `JOIN ON pk` |
| `ref` | ★★★★☆ | 일반 인덱스 = 조회 | `WHERE idx_col = val` |
| `fulltext` | ★★★☆☆ | FULLTEXT 인덱스 | `MATCH ... AGAINST` |
| `ref_or_null` | ★★★☆☆ | ref + NULL 체크 | `WHERE col = val OR col IS NULL` |
| `index_merge` | ★★★☆☆ | 인덱스 병합 | 복수 인덱스 조건 |
| `range` | ★★★☆☆ | 인덱스 범위 스캔 | `BETWEEN`, `IN`, `>`, `<` |
| `index` | ★★☆☆☆ | 인덱스 풀 스캔 | 커버링 인덱스 또는 인덱스 순서 스캔 |
| `ALL` | ★☆☆☆☆ | **풀 테이블 스캔** | 인덱스 없거나 옵티마이저가 포기 |

> **기준:** `range` 이상이면 일반적으로 허용. `index`부터 의심, `ALL`은 반드시 개선 필요.

---

## 5. Extra 빠른 판단표

| Extra | 판정 | 설명 |
|---|---|---|
| `Using index` | ✅ 최고 | 커버링 인덱스, 테이블 접근 없음 |
| `Using index condition` | ✅ 좋음 | ICP 최적화 동작 |
| `Using where` | ✅ 보통 | 일반적인 WHERE 필터링 |
| `Using MRR` | ✅ 좋음 | Multi-Range Read 최적화 |
| `Distinct` | ✅ 보통 | DISTINCT 최적화 |
| `Not exists` | ✅ 좋음 | LEFT JOIN 최적화 |
| `Select tables optimized away` | ✅ 최고 | 인덱스로 집계 최적화 |
| `Using filesort` | ⚠️ 주의 | 별도 정렬 필요, 메모리 or 디스크 사용 |
| `Using temporary` | ⚠️ 주의 | 임시 테이블 생성 |
| `Using join buffer` | ⚠️ 주의 | 조인 인덱스 없음 |
| `Using filesort` + `Using temporary` | ❌ 나쁨 | 반드시 개선 필요 |
| `Full scan on NULL key` | ❌ 나쁨 | 서브쿼리 최적화 실패 |

---

## 6. EXPLAIN ANALYZE (MySQL 8.0.18+)

`EXPLAIN ANALYZE`는 쿼리를 **실제로 실행**하여 측정값까지 보여줍니다.  
일반 `EXPLAIN`이 "예상"을 보여준다면, `EXPLAIN ANALYZE`는 "실제"를 보여줍니다.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;
```

**출력 형식 (TREE 포맷):**
```
-> Index lookup on orders using idx_user_id (user_id=1)
   (cost=3.20 rows=5) (actual time=0.045..0.051 rows=5 loops=1)
```

**출력 값 해석:**

| 항목 | 의미 |
|---|---|
| `cost=N` | 옵티마이저가 예상한 비용 |
| `rows=N` | 옵티마이저가 예상한 행 수 |
| `actual time=A..B` | 첫 행까지 걸린 시간..전체 행까지 걸린 시간 (ms, loops 평균) |
| `rows=N` (actual) | 실제로 읽은 행 수 (loops 평균) |
| `loops=N` | 해당 노드가 실행된 횟수 |

> `actual time`은 **loops의 평균값**입니다.  
> 실제 총 소요 시간 = `actual time × loops`

**추정 vs 실제 비교가 핵심:**
- `rows=100` (예상) vs `rows=10000` (실제) → 통계 오래됨, `ANALYZE TABLE` 필요
- `cost=500` (예상) vs `actual time=5000ms` → 예상보다 훨씬 느림, 실행 계획 개선 필요

> ⚠️ `EXPLAIN ANALYZE`는 쿼리를 **실제로 실행**합니다.  
> DML 쿼리(`UPDATE`, `DELETE`)에 쓸 때는 트랜잭션 안에서 사용하거나 주의가 필요합니다.

---

## 7. 출력 포맷 옵션

```sql
-- 기본 테이블 형식
EXPLAIN SELECT ...;

-- JSON 형식 (가장 상세, 비용 정보 포함)
EXPLAIN FORMAT=JSON SELECT ...;

-- 트리 형식 (가독성 좋음, MySQL 8.0+)
EXPLAIN FORMAT=TREE SELECT ...;

-- ANALYZE와 조합 (실제 실행 + 측정)
EXPLAIN ANALYZE SELECT ...;  -- FORMAT=TREE가 기본
EXPLAIN ANALYZE FORMAT=JSON SELECT ...;  -- MySQL 8.0.32+
```

**JSON 포맷에서만 볼 수 있는 추가 정보:**
- 각 노드의 상세 비용 (`cost_info`)
- 조인 버퍼 크기
- 정렬에 사용된 인덱스 정보

---

## 8. 분석 체크리스트 (실무용)

EXPLAIN 결과를 받았을 때 아래 순서로 확인합니다.

### Step 1. `type` 컬럼 확인
- [ ] `ALL`이 있는가? → 풀 테이블 스캔, 즉시 개선 필요
- [ ] `index`가 있는가? → 인덱스 풀 스캔, 개선 검토 필요
- [ ] `range` 이상인가? → 일반적으로 양호

### Step 2. `key` 컬럼 확인
- [ ] `key`가 `NULL`인가? → 인덱스 미사용
- [ ] 의도한 인덱스가 선택되었는가?
- [ ] `possible_keys`에 있는데 `key`가 다른가? → 옵티마이저가 더 유리하다고 판단한 것, 통계 확인 필요

### Step 3. `rows` 컬럼 확인
- [ ] 예상 rows가 지나치게 큰가? (실제 결과 대비 몇 배인가?)
- [ ] JOIN 시 rows 곱이 너무 크지 않은가?

### Step 4. `filtered` 컬럼 확인
- [ ] `filtered`가 너무 낮은가? (10% 미만이면 90%가 버려지는 것)
- [ ] `rows × (filtered/100)`이 실제 결과 행 수와 비슷한가?

### Step 5. `Extra` 컬럼 확인
- [ ] `Using filesort`가 있는가? → ORDER BY 인덱스 확인
- [ ] `Using temporary`가 있는가? → GROUP BY 인덱스 확인
- [ ] `Using filesort` + `Using temporary`가 동시에 있는가? → 반드시 개선

### Step 6. `select_type` 확인
- [ ] `DEPENDENT SUBQUERY`가 있는가? → JOIN으로 변환 검토
- [ ] `DERIVED`가 있는가? → 임시 테이블 생성 여부 확인

### Step 7. `id` 확인 (복잡한 쿼리)
- [ ] 실행 순서가 의도한 대로인가?
- [ ] 서브쿼리가 너무 많이 중첩되지 않았는가?

---

## 9. 자주 나오는 문제 패턴과 해결법

### 패턴 1: 풀 테이블 스캔 (type = ALL)

```sql
-- ❌ 문제: 인덱스 없는 컬럼 조회
EXPLAIN SELECT * FROM orders WHERE status = 'pending';
-- type: ALL, key: NULL

-- ✅ 해결: 인덱스 추가
ALTER TABLE orders ADD INDEX idx_status (status);
```

---

### 패턴 2: 인덱스 컬럼에 함수 적용

```sql
-- ❌ 문제: 인덱스가 있어도 함수 사용 시 인덱스 무효화
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- type: ALL (인덱스 있어도 풀 스캔)

-- ✅ 해결: 함수 제거, 범위 조건으로 변경
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- type: range
```

---

### 패턴 3: 복합 인덱스 순서 불일치

```sql
-- 복합 인덱스: (user_id, status, created_at)
-- ❌ 문제: 첫 번째 컬럼을 빠뜨리면 인덱스 미사용
SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';
-- type: ALL (user_id 없음)

-- ✅ 해결: 복합 인덱스는 왼쪽부터 순서대로 사용
SELECT * FROM orders
WHERE user_id = 1 AND status = 'pending' AND created_at > '2024-01-01';
-- type: range
```

---

### 패턴 4: Using filesort (ORDER BY 최적화)

```sql
-- 인덱스: (user_id)
-- ❌ 문제: ORDER BY 컬럼이 인덱스에 없음
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;
-- Extra: Using filesort

-- ✅ 해결: 복합 인덱스로 조회 + 정렬을 한 번에
ALTER TABLE orders ADD INDEX idx_user_created (user_id, created_at);
-- Extra: (없음, 인덱스로 정렬됨)
```

---

### 패턴 5: Using temporary (GROUP BY 최적화)

```sql
-- ❌ 문제: GROUP BY 컬럼에 인덱스 없음
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
-- Extra: Using temporary; Using filesort

-- ✅ 해결: GROUP BY 컬럼에 인덱스 추가
ALTER TABLE orders ADD INDEX idx_user_id (user_id);
-- Extra: (없음)
```

---

### 패턴 6: DEPENDENT SUBQUERY → JOIN 변환

```sql
-- ❌ 문제: 상관 서브쿼리, 외부 쿼리 행마다 재실행
SELECT * FROM users u
WHERE u.id IN (
  SELECT user_id FROM orders WHERE amount > 1000
);
-- select_type: DEPENDENT SUBQUERY → 행마다 서브쿼리 실행

-- ✅ 해결: JOIN으로 변환
SELECT DISTINCT u.*
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.amount > 1000;
```

---

### 패턴 7: 커버링 인덱스 활용

```sql
-- 테이블에 컬럼이 많고, SELECT 컬럼이 제한적인 경우
-- ❌ 기본: 인덱스로 행을 찾고, 테이블에서 실제 데이터 읽기
SELECT user_id, created_at FROM orders WHERE user_id = 1;
-- Extra: Using where

-- ✅ 커버링 인덱스: SELECT 컬럼 전부를 인덱스에 포함
ALTER TABLE orders ADD INDEX idx_covering (user_id, created_at);
-- Extra: Using index (테이블 접근 없음, 매우 빠름)
```

---

### 패턴 8: 타입 불일치로 인한 인덱스 미사용

```sql
-- user_id 컬럼이 INT인데 문자열로 비교
-- ❌ 문제
SELECT * FROM orders WHERE user_id = '1';  -- 묵시적 타입 변환
-- type: ALL (인덱스 무효화 가능)

-- ✅ 해결: 동일 타입으로 비교
SELECT * FROM orders WHERE user_id = 1;
```

---

### 패턴 9: OR 조건 처리

```sql
-- ❌ OR 조건은 인덱스를 못 탈 수 있음
SELECT * FROM orders WHERE user_id = 1 OR status = 'pending';
-- type: ALL

-- ✅ UNION으로 분리 (각각 인덱스 활용)
SELECT * FROM orders WHERE user_id = 1
UNION
SELECT * FROM orders WHERE status = 'pending';

-- 또는 index_merge 힌트 활용 (MySQL이 자동으로 처리하기도 함)
```

---

## 빠른 요약 카드

```
EXPLAIN 분석 5초 요약:

1. type이 ALL이면 → 풀스캔, 인덱스 추가 검토
2. key가 NULL이면 → 인덱스 안 탐, 이유 파악
3. rows가 크면   → 읽는 양이 많음, 인덱스 또는 쿼리 개선
4. Extra에 filesort/temporary 있으면 → 정렬/그룹핑 인덱스 최적화
5. select_type이 DEPENDENT SUBQUERY면 → JOIN으로 변환 검토
```

---

*참고: MySQL 8.4 공식 문서 (dev.mysql.com/doc/en/explain-output.html)*
