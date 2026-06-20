<div align="center">

<br/>

# 🎯 Mooda

### 목표 달성을 위한 스마트 일정 관리 데스크탑 앱

> **Goal → Milestone → Task**, 큰 꿈을 오늘의 실천으로

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

<!-- 대표 스크린샷 (메인 캘린더 화면) -->
![Mooda Main](https://github.com/user-attachments/assets/af2a5ab5-9965-4e3e-8cc9-14e91ce64861)
</div>

---

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 특징](#-주요-특징)
- [기능 상세 설명](#-기능-상세-설명)
- [DockHeader 편의 기능](#-dockheader-편의-기능)
- [향후 추가 예정 기능 Roadmap](#-향후-추가-예정-기능-roadmap)
- [설치 안내](#-설치-안내)
- [컴퓨터 구성 / 필수 조건](#-컴퓨터-구성--필수-조건)
- [기술 스택](#-기술-스택)
- [팀 정보](#-팀-정보)
- [저작권 및 사용권 정보](#-저작권-및-사용권-정보)

---

## 📚 프로젝트 소개

### 💡 배경

> "할 일은 매일 있는데, 정작 내가 원하는 목표는 어디로 갔을까?"

할 일 앱은 많습니다. 오늘 해야 할 것들을 체크하는 앱도 많죠.  
하지만 그 할 일들이 **진짜 내가 원하는 것**을 향해 나아가고 있다는 감각을 주는 앱은 드뭅니다.

Mooda는 이 질문에서 출발했습니다.

- 단순히 오늘 할 일을 적는 것이 아니라, **목표(Goal)** 를 먼저 세우고
- 목표를 기간별 **마일스톤(Milestone)** 으로 나누어
- 매일의 **Task** 를 목표의 흐름 위에 배치하는

**목표 중심의 일정 관리** 를 제공합니다.

그 어느 날의 할 일도 의미 없이 떠 있지 않고, 내가 원하는 곳을 향한 한 걸음이 될 수 있도록.

---

## 👍 주요 특징

**목표에서 실천까지 한 흐름으로**
Goal > Milestone > Task의 계층 구조로 큰 목표를 오늘의 할 일로 자연스럽게 연결합니다.

**직관적인 캘린더**
메인 화면에서 월별 캘린더와 날짜별 일정을 한눈에 확인하고, 달성률도 바로 볼 수 있습니다.

**나만의 카테고리 & 중요도**
이모지와 이름을 직접 설정해 나에게 맞는 분류 체계를 구성할 수 있습니다.

**반복 일정 지원**
요일별 반복 설정으로 매주 루틴을 손쉽게 관리합니다.

**포커스 타이머**
목표 달성을 위한 집중 시간 측정 기능을 GoalPlanner와 함께 제공합니다.

**DockHeader 편의 기능**
퀵 메모, 클립보드 히스토리, 로컬 파일 링커, 파일 드롭존, 미니 모드로 하루의 생산성을 높입니다.

**라이트 / 다크 / 자연 테마**
사용 환경과 취향에 맞게 세 가지 테마 중 선택할 수 있습니다.

---

## 📃 기능 상세 설명

### 1. 📅 캘린더 (Calendar)

메인 화면은 **월별 캘린더**와 **날짜별 일정 패널**로 구성됩니다.  
날짜를 클릭하면 우측에 해당 날짜의 할 일 목록이 표시되며, **Goal 소속 일정**과 **일반 일정**을 구분해서 확인할 수 있습니다.  
상단의 달성률 진행 바로 오늘 하루를 얼마나 채웠는지 한눈에 파악할 수 있습니다.  
캘린더 날짜 셀의 컬러 점(●)으로 일정 유무와 종류도 빠르게 식별 가능합니다.

![Calendar](https://github.com/user-attachments/assets/c3d7c73f-e554-4961-b9a2-5c8e67558729)

---

### 2. 🎯 GoalPlanner

**어떤 멋진 목표를 달성하고 싶으신가요?**  
상단 입력란에 목표를 입력하면 Goal 카드가 생성됩니다.

각 Goal 카드에는 다음이 표시됩니다.
- 진행 상태 (시작 전 / 진행 중 / 완료)
- 목표 기간
- 마일스톤 목록
- Task 진행률

당장 진행하지 않을 목표는 **보관하기** 기능으로 잠시 보관함에 넣어둘 수 있습니다.  
우측 **집중과 성취** 패널에서는 보관함 목록과 **포커스 타이머**를 바로 활용할 수 있습니다.

![GoalPlanner](https://github.com/user-attachments/assets/df9b4ff2-665a-4e88-b9a6-ec075eefb5be)

---

### 3. 🗂️ 목표 상세 설정 (Goal Detail)

Goal 카드를 클릭하면 목표 상세 설정 화면이 열립니다.

- **목표 타이틀** 편집
- **목표 기간** 설정 (시작일 → 종료일)
- **테마 색상** 선택 (레드, 오렌지, 옐로, 그린, 블루, 인디고, 핑크, 퍼플 등)
- **마일스톤 추가** 및 목록 관리
- 전체 Task **진행률** 실시간 확인

목표 하나에 최대 20개의 마일스톤을 추가하고, 마일스톤 타이틀로 빠르게 검색할 수 있습니다.

![Goal Detail](https://github.com/user-attachments/assets/9c3af701-2e5f-4bf9-a5f3-d47b02411fe9)

---

### 4. 📐 마일스톤 상세 (Milestone Detail)

마일스톤을 클릭하면 해당 기간만을 보여주는 **미니 캘린더**가 펼쳐집니다.  
날짜를 선택하면 그날의 Task를 바로 입력하거나 확인할 수 있습니다.

- 마일스톤 소속 **Goal 일정**과 그 외 **일반 일정**을 함께 조회
- Task 입력창에서 Enter로 빠르게 일정 추가
- 상세 버튼으로 시간, 카테고리 등 세부 설정으로 이동

![Milestone Detail](https://github.com/user-attachments/assets/f9858adc-479b-4d06-86d4-a7ac389ff516)

---

### 5. ✅ Task 관리

#### 일반 Task

하루 단위 Task로 시간, 카테고리, 중요도, SubTask를 설정할 수 있습니다.

- **시간 설정** : 시작 ~ 종료 시간 입력
- **카테고리** : 직접 만든 카테고리 중 선택
- **중요도** : 커스텀 중요도 중 선택
- **SubTask (하위 할 일)** : Task를 더 잘게 쪼개어 진행률 관리

![Task Detail](https://github.com/user-attachments/assets/e811b125-4a7f-4e42-89ca-8eb448dc069e)

#### 반복 & 다중 일정 Task

기간을 설정하고 **요일별 반복**을 지정할 수 있어 매주 루틴을 한 번에 관리합니다.  
반복 요일 체크박스로 월·화·수·목·금·토·일 중 원하는 요일만 선택하면 됩니다.  
카테고리, 중요도 역시 반복 Task에도 동일하게 적용됩니다.

![Repeat Task](https://github.com/user-attachments/assets/9f7589a0-81ee-47ff-b3ac-301b44d5ce8d)


---

### 6. 🏷️ 카테고리 & 중요도 커스텀 편집기

Task에 적용할 카테고리와 중요도를 **이모지와 이름**으로 직접 설정합니다.  
최대 10개의 카테고리를 등록할 수 있으며, 카테고리마다 원하는 이모지 아이콘을 지정할 수 있습니다.  
중요도도 동일한 방식으로 커스텀 설정이 가능합니다.

![Category Edit](https://github.com/user-attachments/assets/0621f55d-82fe-400b-bcca-fd76d8c440cb)

Task 생성·편집 화면에서 등록된 카테고리와 중요도를 바로 선택할 수 있습니다.

---

## 🛠️ DockHeader 편의 기능

Mooda는 일정 관리를 넘어 **하루의 생산성**을 높여주는 편의 기능들을 DockHeader로 제공합니다.

| 기능 | 설명 |
|------|------|
| 📝 **퀵 메모** | 화면 전환 없이 바로 메모 입력 |
| 📋 **클립보드 히스토리** | 웹이든 앱이든 복사한 내용을 자동으로 누적 저장 |
| 📁 **로컬 파일 링커** | 자주 쓰는 파일을 등록해 빠르게 열기 |
| 🗂️ **임시 파일 드롭존** | 파일·폴더 등록 보관, 구글·웹 이미지 복사 붙여넣기 지원 |
| 📌 **미니 모드** | 오늘의 일정만 간결하게 표시 |

---

## 🌗 테마 설정

라이트, 다크, 자연(Nature) 3가지 테마를 지원합니다.  
설정 메뉴에서 원하는 테마로 언제든지 전환할 수 있습니다.

| 모드 | 설명 |
|------|------|
| ☀️ 라이트 | 밝고 깔끔한 기본 테마 |
| 🌙 다크 | 눈의 피로를 줄여주는 어두운 테마 |
| 🌿 자연 | 따뜻하고 편안한 자연 색감 테마 |

---

## 🔮 향후 추가 예정 기능 (Roadmap)

- [ ] 🌐 **Goal Library 공유 생태계** — 다른 사용자의 Goal 템플릿을 공유하고 활용
- [ ] 🎨 **컬러 커스텀** — 더욱 다양한 색상 테마 및 커스텀 색상 지정
- [ ] 🔔 **알림 기능** — 일정 마감 및 마일스톤 알림
- [ ] 📊 **통계 & 분석** — 목표 달성률 추이 시각화

---

## 🔧 설치 안내 (Installation)

### 레포지토리 클론

```bash
git clone https://github.com/your-username/mooda.git
cd mooda
```

### 패키지 설치

```bash
yarn install
# 또는
npm install
```

### 개발 모드 실행

```bash
yarn dev
# 또는
npm run dev
```

### 프로덕션 빌드

```bash
yarn build
# 또는
npm run build
```

빌드가 완료되면 `/dist` 또는 `/release` 폴더에서 플랫폼별 설치 파일을 확인할 수 있습니다.

---

## 💻 컴퓨터 구성 / 필수 조건 (Prerequisites)

### 지원 환경

| 운영체제 | 지원 여부 |
|----------|----------|
| Windows 10 / 11 | ✅ |
| macOS 아직 미구현 |
| Linux 미구현 |

### 권장 사양

- **RAM** : 4GB 이상
- **해상도** : 1440 × 960 이상 권장
- **Node.js** : v18.x 이상
- **패키지 매니저** : yarn 또는 npm

---

## 🔨 기술 스택 (Tech Stack)

### Desktop App

| 기술 | 설명 |
|------|------|
| **Electron** | 크로스 플랫폼 데스크탑 앱 프레임워크 |

### Frontend

| 기술 | 설명 |
|------|------|
| **React** | UI 컴포넌트 라이브러리 |
| **TypeScript** | 타입 안전성 및 개발 편의성 향상 |
| **TailwindCSS** | 유틸리티 기반 CSS 프레임워크로 직관적인 UI 구성 |

### Data

| 기술 | 설명 |
|------|------|
| **SQLite / Local Storage** | 로컬 데이터 영속성 관리 |

> Mooda는 인터넷 연결 없이도 완전히 동작하는 **오프라인 우선(Offline-First)** 앱입니다.

---

## 🏃 팀 정보 (Team Information)

| 이름 | 역할 | GitHub | 이메일 |
|------|------|--------|--------|
| (1인개발) 이원형 | PM / FE Developer | [@github](#https://github.com/codingle2) | kpss0337@gmail.com |

---

## 📝 저작권 및 사용권 정보 (License)

```

Copyright (c) 2026 Mooda Team
```

---

<div align="center">

**Mooda** — 목표를 세우고, 오늘을 채우세요. 🎯

</div>
