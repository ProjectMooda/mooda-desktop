// src/constants/validation.ts

// 인풋 텍스트 길이 제한 상수
export const INPUT_MAX_LENGTH = {
  // StudioQuickAdd 에서 쓰는 일정 입력
  taskTitle: 20,
  eventTitle: 30,

  // ScheduleDetailModal에서 사용
  subtask: 30, // 하위 할 일용 추가

  // SearchInput에서 사용
  search: 20,

  // GoalPlanner 에서 사용
  // milseStoneCreateModal 에서도 사용하고 있음
  goalTitle: 30,

  // 아직 미정
  category: 15,

  // 경로 지정
  routeName: 10
} as const
