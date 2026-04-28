import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 타입 정의 (기존 코드와 동일)
interface Task {
  id: number
  text: string
  done: boolean
}

// 일반 일정
export interface Milestone {
  id: number
  date: string
  text: string
  done: boolean
  startTime?: string;  // 추가: 시작 시간
  endTime?: string     // 추가: 종료 시간
  category?: string    // 카테고리 (예: 기획, 디자인, 개발 등)
  priority?: 'Low' | 'Medium' | 'High' // 중요도
  summary?: string
  description?: string // 상세 메모
}

// 한달 일정
export interface Goal {
  id: number
  title: string
  startDate: string
  endDate: string
  milestones: Milestone[]
  color?: string
  newMilestoneDate?: string // 컴포넌트에서 v-model로 사용 중이므로 필요할 수 있습니다.
  newMilestoneText?: string // 컴포넌트에서 v-model로 사용 중이므로 필요할 수 있습니다.
}

export const useScheduleStore = defineStore('schedule', () => {
  const today = new Date().toISOString().split('T')[0]

  // State
  const selectedDate = ref(today)
  const dateTasks = ref<Record<string, Task[]>>({})
  const dailyFocus = ref('') // 메인 컴포넌트에서 가져옴

  const goals = ref<Goal[]>([]) // 장기 목표 연동을 위해 필요

  // 💡 [수정됨] Getters: 순수하게 데이터만 반환하도록 수정 (상태 변경 X)
  const currentTasks = computed(() => {
    return dateTasks.value[selectedDate.value] || []
  })
  // 💡 [수정됨] 에러 방지를 위한 안전한 배열 길이 체크
  const hasTasks = (date: string) => {
    return dateTasks.value[date] && dateTasks.value[date].length > 0
  }

  const currentMilestones = computed(() => {
    const targetDate = selectedDate.value
    const result: { ms: Milestone; goalTitle: string }[] = []

    // 전체 목표를 순회하면서 선택된 날짜와 일치하는 마일스톤만 추출
    goals.value.forEach((goal) => {
      goal.milestones.forEach((ms) => {
        if (ms.date === targetDate) {
          result.push({
            ms, // 참조(reference)를 넘겨서 체크박스로 바로 수정 가능하게 함
            goalTitle: goal.title // 어떤 목표의 일정인지 표시하기 위함
          })
        }
      })
    })

    return result
  })

  // 장기 목표에서 특정 날짜의 마일스톤 가져오기
  const getGoalMilestonesForDate = (date: string) => {
    // ... 기존 구현 로직 동일
  }

  // 💡 [수정됨] Actions: 원본 데이터(dateTasks)를 직접 조작하도록 수정
  const addTask = (text: string = '') => {
    // 해당 날짜의 배열이 없으면 먼저 생성
    if (!dateTasks.value[selectedDate.value]) {
      dateTasks.value[selectedDate.value] = []
    }
    // 원본 데이터에 새로운 Task 추가
    dateTasks.value[selectedDate.value].push({
      id: Date.now(),
      text: text,
      done: false
    })
    saveData()
  }

  const addMilestone = (goalId: number | string, msData: any) => {
  // 1. 해당 ID의 목표를 찾습니다.
  const goal = goals.value.find((g: any) => g.id === goalId)
  
  if (goal) {
    // milestones 배열이 없으면 초기화
    if (!goal.milestones) {
      goal.milestones = []
    }

    // 2. 새로운 마일스톤 객체 추가
    goal.milestones.push({
      id: Date.now(),
      done: false,
      summary: '',
      ...msData // text, date, startTime 등이 들어옵니다.
    })

    // 3. 날짜순 정렬
    goal.milestones.sort((a: any, b: any) => a.date.localeCompare(b.date))
    
    // 4. 저장
    saveData()
  }
}



  // 💡 [수정됨] 원본 데이터 배열에서 삭제하도록 수정
  const removeTask = (id: number) => {
    const tasks = dateTasks.value[selectedDate.value]
    if (tasks) {
      const idx = tasks.findIndex((t) => t.id === id)
      if (idx > -1) {
        tasks.splice(idx, 1)
        saveData()
      }
    }
  }

  const loadData = () => {
    const saved = localStorage.getItem('jarvis_ts_v1')
    if (saved) {
      const parsed = JSON.parse(saved)
      dailyFocus.value = parsed.dailyFocus || '' // Focus 불러오기 추가
      dateTasks.value = parsed.dateTasks || {}

      // 저장된 목표가 있으면 덮어쓰고, 없으면 초기값(Cashfolio) 유지
      if (parsed.goals && parsed.goals.length > 0) {
        goals.value = parsed.goals
      }
    }
  }

  const saveData = () => {
    const currentState = {
      dailyFocus: dailyFocus.value, // Focus 저장 추가
      dateTasks: dateTasks.value,
      goals: goals.value
    }
    localStorage.setItem('jarvis_ts_v1', JSON.stringify(currentState))
  }

  const removeGoal = (id: number) => {
    const idx = goals.value.findIndex((g) => g.id === id)
    if (idx > -1) {
      goals.value.splice(idx, 1)
      saveData()
    }
  }

  return {
    selectedDate,
    dailyFocus,
    dateTasks,
    goals,
    currentTasks,
    currentMilestones,
    addMilestone,
    hasTasks,
    getGoalMilestonesForDate,
    addTask,
    removeTask,
    removeGoal,
    loadData,
    saveData
  }
})
