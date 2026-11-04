const flow = `flowchart TD
    A([프로젝트 시작]) --> B[요구사항 분석]
    B --> C{승인되었나요?}
    C -->|Yes| D[디자인 및 설계]
    C -->|No| B
    D --> E[개발 및 구현]
    E --> F{테스트 통과?}
    F -->|Yes| G([배포 완료])
    F -->|No| E

    classDef start fill:#e8f5ef,stroke:#78b89b,color:#286548
    classDef process fill:#f0edff,stroke:#b0a0e5,color:#57458d
    classDef decision fill:#fff5e4,stroke:#dec080,color:#8b6b31
    class A,G start
    class B,D,E process
    class C,F decision`;

const item = (id, title, english, icon, group, description, uses, syntax, code, alternate, doc) => ({ id, title, english, icon, group, description, uses, syntax, presets: [{ name: '기본 예제', code }, { name: alternate[0], code: alternate[1] }], doc });

export const diagrams = [
  item('flowchart-td', '플로우차트 (TD)', 'Flowchart · Top to bottom', 'workflow', '구조와 흐름', '위에서 아래로, 프로세스의 흐름과 의사결정을 한눈에 확인하세요.', ['비즈니스 프로세스|업무의 시작부터 완료까지 흐름 정리', '알고리즘 설계|조건과 분기를 명확한 로직으로 표현', '의사결정 트리|선택에 따른 결과와 경로 시각화'], [['flowchart TD', '위에서 아래 방향으로 흐름 정의'], ['A[작업] → B{조건}', '사각형은 작업, 마름모는 의사결정'], ['A -->|Yes| B', '연결선에 조건이나 설명 추가']], flow, ['로그인 프로세스', `flowchart TD
    A([로그인 요청]) --> B[이메일 및 비밀번호 입력]
    B --> C{사용자 인증}
    C -->|성공| D[세션 생성]
    C -->|실패| E[오류 메시지 표시]
    E --> B
    D --> F([대시보드 이동])`], 'flowchart'),
  item('flowchart-lr', '플로우차트 (LR)', 'Flowchart · Left to right', 'git-commit-horizontal', '구조와 흐름', '왼쪽에서 오른쪽으로 이어지는 파이프라인과 데이터 흐름을 표현하세요.', ['자동화 파이프라인|단계별 데이터 처리와 변환', '서비스 흐름|요청에서 응답까지 처리 구조', '문서 자동화|생성·검증·출력 과정을 시각화'], [['flowchart LR', '왼쪽에서 오른쪽 방향'], ['A --> B', '작업 사이 연결'], ['subgraph 제목', '관련 노드를 그룹으로 묶기']], `flowchart LR
    A[입력 데이터] --> B[Mermaid 코드 생성]
    B --> C{구문 검증}
    C -->|성공| D[SVG 렌더링]
    C -->|실패| E[오류 로그 및 수정]
    E --> B
    D --> F[HTML 및 PDF 문서]`, ['CI/CD 파이프라인', `flowchart LR
    A[Git Push] --> B[테스트]
    B --> C[빌드]
    C --> D{승인}
    D -->|승인| E[프로덕션 배포]
    D -->|반려| A`], 'flowchart'),
  item('sequence', '시퀀스 다이어그램', 'Sequence diagram', 'arrow-right-left', '구조와 흐름', '시간의 순서에 따라 시스템 사이의 메시지와 상호작용을 표현하세요.', ['API 호출 흐름|클라이언트와 서버 간 요청과 응답', '인증 프로토콜|토큰 발급과 사용자 인증 과정', '서비스 상호작용|분산 시스템의 메시지 순서'], [['sequenceDiagram', '시퀀스 다이어그램 선언'], ['participant A as 사용자', '참여자와 표시 이름 지정'], ['A->>B: 요청', '화살표로 메시지 전달']], `sequenceDiagram
    autonumber
    actor U as 사용자
    participant W as 웹 앱
    participant A as API 서버
    participant D as 데이터베이스
    U->>W: 로그인
    W->>A: 인증 요청
    A->>D: 사용자 조회
    D-->>A: 사용자 정보
    A-->>W: 액세스 토큰
    W-->>U: 대시보드 표시`, ['결제 요청', `sequenceDiagram
    actor U as 고객
    participant S as 주문 서버
    participant P as 결제 서비스
    U->>S: 주문하기
    S->>P: 결제 요청
    alt 결제 성공
        P-->>S: 승인
        S-->>U: 주문 완료
    else 결제 실패
        P-->>S: 거절
        S-->>U: 다시 시도
    end`], 'sequenceDiagram'),
  item('er', 'ER 다이어그램', 'Entity relationship diagram', 'database', '구조와 흐름', '테이블의 속성과 관계를 연결해 데이터베이스 구조를 설계하세요.', ['DB 스키마 설계|테이블과 PK·FK 관계 정의', '데이터 모델링|도메인 엔티티와 관계 표현', '스키마 문서화|개발팀이 공유하는 데이터 구조'], [['erDiagram', 'ER 다이어그램 선언'], ['USER ||--o{ ORDER : places', '일대다 관계 정의'], ['string email UK', '속성 타입과 키 지정']], `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes
    USER {
        int id PK
        string name
        string email UK
    }
    ORDER {
        int id PK
        int user_id FK
        date created_at
    }
    PRODUCT {
        int id PK
        string name
        float price
    }
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
    }`, ['블로그 스키마', `erDiagram
    AUTHOR ||--o{ POST : writes
    POST ||--o{ COMMENT : receives
    AUTHOR {
        int id PK
        string name
    }
    POST {
        int id PK
        string title
        int author_id FK
    }
    COMMENT {
        int id PK
        string content
        int post_id FK
    }`], 'entityRelationshipDiagram'),
  item('state', '상태 다이어그램', 'State diagram', 'circle-dot', '구조와 흐름', '객체의 생명주기와 이벤트에 따른 상태 전환을 시각화하세요.', ['상태 머신|이벤트에 따른 시스템 동작', '주문 생명주기|접수부터 완료·취소까지 관리', 'UI 상태 흐름|로딩·성공·실패 상태 표현'], [['stateDiagram-v2', '상태 다이어그램 선언'], ['[*] --> 대기', '시작 상태 지정'], ['대기 --> 진행: 시작', '이벤트에 따른 상태 전환']], `stateDiagram-v2
    [*] --> 대기
    대기 --> 처리중: 요청 접수
    처리중 --> 검토중: 처리 완료
    검토중 --> 완료: 승인
    검토중 --> 처리중: 수정 요청
    대기 --> 취소: 요청 취소
    완료 --> [*]
    취소 --> [*]`, ['신호등', `stateDiagram-v2
    [*] --> 빨강
    빨강 --> 초록: 30초 경과
    초록 --> 노랑: 25초 경과
    노랑 --> 빨강: 5초 경과`], 'stateDiagram'),
  item('mindmap', '마인드맵', 'Mindmap', 'brain', '기획과 설계', '하나의 아이디어에서 뻗어 나가는 생각과 요구사항을 구조화하세요.', ['브레인스토밍|연관 아이디어를 자유롭게 확장', '요구사항 정리|기능과 과제를 계층별로 분류', '지식 구조화|주제를 연결하는 개념 지도'], [['mindmap', '마인드맵 선언'], ['root((중심 주제))', '중앙 노드 정의'], ['  하위 아이디어', '들여쓰기로 계층 표현']], `mindmap
  root((Mermaid Studio))
    다이어그램
      프로세스
      데이터 모델
      아키텍처
    편집
      실시간 미리보기
      코드 검증
    출력
      SVG
      PNG
      PDF
    연동
      웹 프로젝트
      자동화 파이프라인`, ['서비스 기획', `mindmap
  root((신규 서비스))
    사용자
      페르소나
      문제 정의
    제품
      핵심 기능
      사용자 경험
    실행
      일정
      팀 구성`], 'mindmap'),
  item('c4', 'C4 컨텍스트', 'C4 context diagram', 'network', '기획과 설계', '사용자, 시스템, 외부 서비스의 관계로 아키텍처의 큰 그림을 그리세요.', ['시스템 구조|서비스 경계와 주요 의존 관계', '아키텍처 설계|이해관계자와 기술 구조 공유', '통합 지점 파악|외부 시스템 연결 방식 표현'], [['C4Context', '컨텍스트 다이어그램 선언'], ['Person(user, "사용자")', '시스템 사용자 정의'], ['Rel(user, app, "사용")', '구성 요소 사이 관계 지정']], `C4Context
    title 다이어그램 자동화 시스템
    Person(user, "콘텐츠 제작자", "문서 및 다이어그램 작성")
    System(studio, "Mermaid Studio", "코드 편집 및 시각화")
    System_Ext(ai, "LLM API", "텍스트 기반 코드 생성")
    System_Ext(automation, "n8n", "문서 자동화")
    Rel(user, studio, "코드 편집")
    Rel(studio, ai, "코드 생성 요청")
    Rel(automation, studio, "렌더러 모듈 연동")`, ['온라인 쇼핑몰', `C4Context
    title 온라인 쇼핑 서비스
    Person(customer, "고객", "상품 주문")
    System(shop, "쇼핑몰", "상품 및 주문 관리")
    System_Ext(payment, "결제 시스템", "결제 승인")
    System_Ext(delivery, "배송 서비스", "주문 배송")
    Rel(customer, shop, "구매")
    Rel(shop, payment, "결제 요청")
    Rel(shop, delivery, "배송 요청")`], 'c4'),
  item('gantt', '간트 차트', 'Gantt chart', 'chart-no-axes-gantt', '기획과 설계', '작업 일정과 의존 관계를 시간축 위에 배치해 프로젝트를 계획하세요.', ['프로젝트 관리|작업별 기간과 진행 상태 확인', '로드맵 기획|단계별 마일스톤과 목표 정리', '리소스 일정|작업 간 의존성과 병렬 흐름'], [['gantt', '간트 차트 선언'], ['dateFormat YYYY-MM-DD', '날짜 형식 지정'], ['개발 :a, 2026-11-09, 7d', '작업 시작일과 기간 지정']], `gantt
    title Mermaid Studio 제작 일정
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    section 기획
    요구사항 정리 :done, a, 2026-11-02, 3d
    화면 설계 :done, b, after a, 2d
    section 제작
    대시보드 구성 :active, c, after b, 5d
    렌더링 모듈 :d, after b, 4d
    section 검증
    통합 테스트 :e, after c, 3d
    배포 :milestone, after e, 0d`, ['콘텐츠 캘린더', `gantt
    title 콘텐츠 제작 일정
    dateFormat YYYY-MM-DD
    section 콘텐츠
    주제 조사 :a, 2026-11-02, 2d
    원고 작성 :b, after a, 3d
    디자인 :c, after b, 2d
    검수 :d, after c, 1d
    발행 :milestone, after d, 0d`], 'gantt'),
  item('journey', '사용자 여정 지도', 'User journey map', 'route', '기획과 설계', '사용자의 단계별 경험과 감정을 따라 서비스의 개선점을 발견하세요.', ['고객 경험 분석|서비스 접점별 만족도 이해', 'UX 개선|사용자 불편 구간과 기회 발견', '페인 포인트 식별|여정의 감정 변화를 시각화'], [['journey', '사용자 여정 선언'], ['section 탐색', '여정 단계 구분'], ['상품 검색: 4: 고객', '작업: 만족도 1~5: 참여자']], `journey
    title 다이어그램 제작 경험
    section 탐색
      도구 발견: 4: 사용자
      예제 살펴보기: 5: 사용자
    section 편집
      코드 작성: 3: 사용자
      미리보기 확인: 5: 사용자
    section 활용
      이미지 내보내기: 5: 사용자
      팀 문서에 공유: 4: 사용자`, ['온라인 구매 여정', `journey
    title 온라인 구매 경험
    section 탐색
      상품 검색: 4: 고객
      리뷰 확인: 3: 고객
    section 구매
      장바구니 추가: 5: 고객
      결제 진행: 2: 고객
    section 배송
      배송 조회: 3: 고객
      상품 수령: 5: 고객`], 'userJourney'),
  item('git', '깃 그래프', 'Git graph', 'git-branch', '데이터와 분석', '브랜치와 커밋, 병합으로 이어지는 버전 관리 히스토리를 표현하세요.', ['브랜치 전략|Git Flow와 협업 방식 공유', '버전 관리 교육|커밋과 병합의 원리 이해', '릴리스 흐름|기능 개발부터 배포까지 추적'], [['gitGraph', 'Git 그래프 선언'], ['branch feature', '새 브랜치 생성'], ['merge feature', '현재 브랜치로 병합']], `gitGraph
    commit id: "프로젝트 시작"
    branch develop
    checkout develop
    commit id: "기본 구조"
    branch feature
    checkout feature
    commit id: "대시보드"
    commit id: "렌더러"
    checkout develop
    merge feature
    checkout main
    merge develop tag: "v1.0"`, ['핫픽스 흐름', `gitGraph
    commit id: "v1.0"
    branch hotfix
    checkout hotfix
    commit id: "오류 수정"
    checkout main
    merge hotfix tag: "v1.0.1"
    commit id: "후속 작업"`], 'gitgraph'),
  item('pie', '파이 차트', 'Pie chart', 'chart-pie', '데이터와 분석', '전체에서 차지하는 비중과 구성을 직관적으로 비교하세요.', ['데이터 비율 비교|카테고리별 점유율 시각화', '예산·인구 분석|자원과 대상의 분포 파악', '구성 비율 표시|전체와 부분의 관계 이해'], [['pie showData', '값을 함께 표시하는 파이 차트'], ['title 구성 비율', '차트 제목 지정'], ['"항목" : 35', '항목 이름과 수치 지정']], `pie showData
    title 프로젝트 리소스 구성
    "프론트엔드" : 35
    "백엔드" : 25
    "디자인" : 20
    "기획" : 12
    "테스트" : 8`, ['트래픽 유입', `pie showData
    title 웹사이트 유입 경로
    "검색" : 45
    "직접 방문" : 25
    "소셜 미디어" : 20
    "기타" : 10`], 'pie'),
  item('xy', 'XY 차트', 'XY chart', 'chart-column-increasing', '데이터와 분석', '수치의 변화와 추세를 막대·선 그래프로 함께 확인하세요.', ['시계열 데이터|시간에 따른 변화와 추세', '항목별 수치 비교|여러 카테고리의 실적 분석', '성과 모니터링|목표 대비 실적 추적'], [['xychart-beta', 'XY 차트 선언'], ['x-axis [Jan, Feb, Mar]', '가로축 범주 지정'], ['bar [30, 45, 60]', '막대 또는 line으로 수치 표시']], `xychart-beta
    title "월별 프로젝트 완료 수"
    x-axis [Jun, Jul, Aug, Sep, Oct, Nov]
    y-axis "완료 수" 0 --> 100
    bar [30, 45, 42, 68, 73, 90]
    line [30, 45, 42, 68, 73, 90]`, ['서비스 성장', `xychart-beta
    title "주간 활성 사용자"
    x-axis [W1, W2, W3, W4, W5]
    y-axis "사용자" 0 --> 500
    line [120, 180, 250, 320, 460]`], 'xyChart'),
  item('quadrant', '사분면 차트', 'Quadrant chart', 'scatter-chart', '데이터와 분석', '두 가지 기준으로 항목을 배치해 우선순위와 포지셔닝을 비교하세요.', ['아이젠하워 매트릭스|중요도와 긴급도로 우선순위 설정', '시장 포지셔닝|비용과 가치 기준으로 서비스 비교', '전략 분석|두 축을 기준으로 항목의 위치 파악'], [['quadrantChart', '사분면 차트 선언'], ['x-axis 낮음 --> 높음', '가로축의 방향과 기준'], ['항목: [0.3, 0.7]', '0~1 범위의 좌표로 배치']], `quadrantChart
    title 기능 우선순위
    x-axis 낮은 노력 --> 높은 노력
    y-axis 낮은 효과 --> 높은 효과
    quadrant-1 전략적 투자
    quadrant-2 빠른 실행
    quadrant-3 후순위
    quadrant-4 재검토
    실시간 미리보기: [0.3, 0.85]
    SVG 출력: [0.2, 0.65]
    API 연동: [0.8, 0.8]
    테마 설정: [0.25, 0.35]
    고급 분석: [0.75, 0.3]`, ['업무 우선순위', `quadrantChart
    title 업무 우선순위
    x-axis 덜 긴급 --> 긴급
    y-axis 덜 중요 --> 중요
    quadrant-1 즉시 실행
    quadrant-2 일정 계획
    quadrant-3 제거
    quadrant-4 위임
    장애 대응: [0.9, 0.9]
    분기 계획: [0.2, 0.8]
    단순 문의: [0.8, 0.3]
    불필요 회의: [0.2, 0.2]`], 'quadrantChart'),
];
