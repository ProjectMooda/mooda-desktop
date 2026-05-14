# 📁 Mooda Desktop 프로젝트 구조 정리

이 문서는 현재 `mooda-desktop` Electron + Vue3 + TypeScript 프로젝트 구조를 기준으로
도메인 기반 폴더 구조와 역할을 정리한 문서임.

---

# 1. 전체 구조 개요 (Domain 기반 구조)

현재 구조는 기능 기준으로 나눈 **도메인 기반 구조**임.

```
src/
 ├── assets/              # 정적 리소스
 ├── global-components/   # 공용 컴포넌트
 ├── pages/               # 페이지 단위 (라우팅 기준)
 ├── stores/             # Pinia 상태 관리
 ├── utils/              # 공통 유틸 함수
```

핵심 특징

- “기능 기준”으로 나눔 (feature/domain 기반)
- 재사용 가능한 건 global-components로 분리
- 상태는 stores로 집중 관리
- 페이지는 pages 기준으로 라우팅 연결

---

# 2. 폴더별 상세 설명

## 📌 2.1 pages (페이지 도메인)

```
pages/
 ├── calendar1/
 │    ├── todoCard/
 │    └── CalendarPage.vue
 ├── goalplanner2/
 │    ├── goalCard/
 │    │     └── GoalCard.vue
 │    ├── goalDetailModal/
 │    │     └── GoalDetailModal.vue
 │    └── GoalPlanner.vue
```

### 역할

- 실제 화면 단위 (route 기준)
- 하나의 페이지 + 그 페이지 전용 컴포넌트 포함

### 규칙

- 페이지 관련 컴포넌트는 여기서만 관리
- 다른 페이지에서 재사용하면 global-components로 이동

---

## 📌 2.2 global-components (공용 컴포넌트)

```
global-components/
```

### 역할

- 프로젝트 전체에서 재사용 가능한 컴포넌트

### 예시

- 버튼
- 모달
- 카드 UI
- input components

### 규칙

- 특정 페이지에 종속되면 안 됨
- 디자인 시스템 느낌으로 관리

---

## 📌 2.3 stores (Pinia 상태 관리)

```
stores/
 └── useScheduleStore.ts
```

### 역할

- 전역 상태 관리
- API 데이터, UI 상태 공유

### 예시

- 일정 데이터
- 유저 상태
- 캘린더 상태

### 특징

- Vue Composition API 기반
- `useXXXStore` 네이밍 통일

---

## 📌 2.4 utils (유틸 함수)

```
utils/
 └── useFormatter.ts
```

### 역할

- 순수 함수 모음
- UI/상태랑 무관한 로직

### 예시

- 날짜 포맷
- 문자열 처리
- 데이터 변환

---

## 📌 2.5 assets (정적 리소스)

```
assets/
```

### 역할

- 이미지, 아이콘, 폰트 등

### 특징

- 빌드 시 포함되는 정적 파일

---

## 📌 2.6 electron (데스크탑 프로세스)

```
electron/
 └── main.ts
```

### 역할

- Electron 메인 프로세스
- 윈도우 생성
- 앱 lifecycle 관리

---

# 3. ESLint + Prettier 구조 정리

---

## Prettier 설정 파일

```
.prettierrc

```

---

## 📌 3.3 둘 관계 (핵심)

현재 구조는 이렇게 되어 있음:

```
ESLint + Prettier 통합 구조
```

```
Prettier → 코드 스타일 결정
ESLint → Prettier 결과를 규칙으로 검사
```

---

## 📌 3.5 VSCode 필수 설정

```json
{
  "editor.formatOnSave": true,

  "editor.defaultFormatter": "esbenp.prettier-vscode",

  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
