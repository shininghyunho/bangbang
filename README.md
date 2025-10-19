# 🏠web-p4-bangbang
- 부스트캠프 맴버십 4번째 미션.
- Airbnb 만들어보기.

# WK 1
## 이번주 목표.
- React를 밑바닥부터 학습하자.
- ERD 설계, 배포, API 설계는 평소에도 해봤다.
- 그러나 React를 활용한 기초적인 구현은 지금 하지 않으면 다음에 또 해야한다.
- 그래서 이번주는 useState, useEffect, useRef를 실질적으로 활용할 수 있는 `인원 조절 모달창` 구현을 목표로한다.

## Quick Start
- [배포한 Vercel](https://bangbang-henna.vercel.app/)에 접속한다.
- 인원 버튼을 눌러본다.
- 모달창 내부를 눌렀을때 모달창이 닫히지 않음을 확인한다.
- 유아는 성인이 필수인 조건이 만족되는지 확인해본다.
- 성인, 어린이, 유아 +,- 버튼을 눌러보며 합계 로직이 제대로 동작하는지 확인한다.
![시뮬](./모달창시뮬.gif)

## 컴포넌트 구조.
```mermaid
graph TD
    App --> SearchBar;
    SearchBar --> GuestInput;
    GuestInput --> GuestSelector;
    GuestInput --> GuestModal;
    GuestModal --> GuestCategory;
```

## 컴포넌트 시각 구조
```mermaid
graph LR
    subgraph SearchBar
        direction LR
        A[체크인]
        B[체크아웃]
        C[요금]
        subgraph GuestInput
            인원-GuestSelector
        end
        E[검색]
    end

    subgraph "GuestModal (Dialog)"
        direction TB
        subgraph "GuestCategory (성인)"
            direction LR
            Title1[성인]
            Counter1[...]
        end
        subgraph "GuestCategory (어린이)"
            direction LR
            Title2[어린이]
            Counter2[...]
        end
        subgraph "GuestCategory (유아)"
            direction LR
            Title3[유아]
            Counter3[...]
        end
    end

    인원-GuestSelector -- Click --> GuestModal
```