# [ADR-004] 환경 격리 및 개발 일관성 확보를 위한 Docker & Testcontainers 인프라 전략

## 1. Summary
- **결정**: 애플리케이션 및 데이터베이스의 실행 환경을 Docker 컨테이너로 표준화하고, 테스트 환경에는 `Testcontainers`를 도입하여 고수준의 환경 격리와 수행 효율성을 확보한다.
- **날짜**: 2026-04-29

## 2. Context (배경)
- **문제 상황**: 개발자마다 로컬 PC 설정이 달라 코드가 다르게 동작하는 환경 불일치 문제가 발생. 또한, 통합 테스트 시 이전 테스트가 변경한 데이터가 다음 테스트에 영향을 미치는 오염 문제가 발생함.
- **요구 사항 및 제약**: Prod, Dev, Test 3개의 환경이 각각 독립적인 목적에 맞게 구성되어야 함.
  - **Prod**: 초기 데이터(Seed) + 데이터 영속성 보장.
  - **Dev**: 초기 데이터(Seed) + 데이터 영속성 + (필요시 초기화 가능).
  - **Test**: 데이터 영속성 불필요, **빠른 속도를 위해 초기 데이터 없이 빈 스키마(DDL)** 만 제공.

## 3. Alternatives (대안 목록)
### 배포 및 실행 환경 대안
- **대안 A**: 직접 배포 및 로컬 실행 (Docker 미사용)
  - 가볍고 직관적이나, 로컬 환경(OS, Node 버전 등)에 따라 설정이 달라짐.
- **대안 B (선택)**: 개별 Docker Container 운영
  - 컨테이너 실행을 위한 추가 리소스(메모리 등)가 필요하지만, 모든 환경에서 동일한 설정이 보장되고 관리가 쉬워짐.

### 테스트 DB 환경 대안
- **대안 A**: 인메모리 DB (SQLite) 사용
  - 가볍지만, MySQL 전용 Query나 Index 구조가 다르게 동작하여 운영 환경과의 일치성이 떨어짐.
- **대안 B**: 개발자가 수동으로 Test DB 컨테이너 관리
  - 직관적이나 자동화된 CI/CD 파이프라인에 적용하기 부적절함.
- **대안 C (선택)**: `Testcontainers` 라이브러리 활용
  - 테스트 코드가 실행될 때 프로덕션과 100% 동일한 MySQL 컨테이너를 자동으로 띄우고, 종료 시 자동으로 제거하여 완벽한 환경 격리 보장.

## 4. Decision (결정)
- **결론**: **Docker 기반의 환경 표준화 및 Testcontainers를 활용한 일회성 테스트 환경 구축.**

- **구조적 시각화**:
```mermaid
graph LR
    subgraph Env_Prod ["Prod (docker-compose)"]
        direction TB
        Prod_App(["Prod Server<br>[Docker]"])
        Prod_DB[("Prod DB(MySQL)<br>[Docker]")]
        Init_Prod[init.sql]

        %% 세로 배치 연결
        Init_Prod --> |"Volume Mount<br>(Full Data)"| Prod_DB
        Prod_DB --> Prod_App
    end

    subgraph Env_Dev ["Dev (docker-compose)"]
        direction TB
        Dev_App(["Dev Server<br>[Docker]"])
        Dev_DB[("Dev DB(MySQL)<br>[Docker]")]
        Init_Dev[init.sql]

        %% 세로 배치 연결
        Init_Dev --> |"Volume Mount<br>(Full Data)"| Dev_DB
        Dev_DB --> Dev_App
    end

    subgraph Env_Test ["Test (Testcontainers)"]
        direction TB
        Test_App(["Test Server<br>[Local]"])
        Test_DB[("Test DB(MySQL)<br>[Docker]")]
        Init_Test["init.sql"]
        %% 세로 배치 연결
        Init_Test --> |Only DDL|Test_DB
        Test_DB --> |Init Per Test|Test_App
    end

    %% 서브그래프 간 가로 배치를 강제하기 위한 투명 연결선
    Env_Prod ~~~ Env_Dev
    Env_Dev ~~~ Env_Test
```

- **환경별 실행 전략**:
  - **운영(Prod)**: Docker로 실행 환경을 고정하고, 볼륨 마운트를 통해 실제 데이터를 보존함.
  - **개발(Dev)**: 운영 환경과 구성 요소를 일치화하여 일관적인 개발을 가능하게 함.
  - **테스트(Test)**: **독립적인 테스트**. `Testcontainers`로 매번 깨끗한 DB를 제공하되, 무거운 데이터 없이 DDL만 주입하여 검증 속도를 높임.

## 5. Trade-offs (Pros/Cons)
- **Pros (얻은 것)**
  - **신뢰성 확보**: 인메모리 DB가 아닌 실제 MySQL 환경에서 테스트를 수행하여 `EXPLAIN` 최적화 등의 결과를 완벽하게 보장함.
  - **환경 격리**: `Testcontainers`를 통해 테스트 간의 간섭(데이터 오염)을 원천 차단함.
- **Cons (포기한 것)**
  - **테스트 기동 시간**: 컨테이너 자체를 띄우고 파싱된 DDL을 주입하는 시간(Boot time)이 추가됨. (그러나 400만 건을 통째로 넣는 것보다는 압도적으로 빠름)

## 6. Retrospective (회고)
- 처음에 테스트 환경을 구성할 때 속도가 빠른 인메모리 DB(SQLite 등)를 사용하려고 했으나, 검색용 쿼리와 인덱스(커버링 인덱스 등)가 SQLite 환경에서는 실제 MySQL과 다르게 동작할 수 있다는 점이 가장 큰 고민이었습니다.
- 그래서 테스트용 MySQL 컨테이너를 수동으로 띄우는 방식을 고려했지만, 이 역시 테스트가 끝날 때마다 데이터를 비워주거나 상태를 관리해야 하는 번거로움이 있었습니다. 게다가 매번 400만 건의 데이터가 들어있는 `init.sql` 전체가 실행되면 테스트 구동 시간 자체가 비현실적으로 길어지는 딜레마에 빠졌습니다.
- 결과적으로 `Testcontainers`를 도입하고, 코드 단에서 `init.sql`을 읽어와 무거운 `INSERT` 문만 정규식으로 걸러내어 DDL만 실행하도록 타협점을 찾았습니다. 처음에는 인프라 설정이 여러 곳으로 파편화되는 것 같아 찝찝했지만, 결과적으로 운영 환경과 100% 동일한 DB 위에서 속도 저하 없이 독립된 테스트를 돌릴 수 있다는 점이 가장 큰 수확이었습니다.