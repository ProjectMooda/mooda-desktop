import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ScheduleItem {
  id: number

  type: 'task' | 'milestone' | 'event'

  goalId?: number | null

  summary?: string
  memo?: string

  done: boolean

  startDate?: string
  endDate?: string

  startTime?: string
  endTime?: string

  category?: string
  priority?: 'Low' | 'Medium' | 'High'

  subtasks?: {
    id: number
    text: string
    done: boolean
  }[]

  isPinned?: boolean
  orderIndex?: number
}

export interface Goal {
  id: number
  title: string
  startDate: string
  endDate: string
  color?: string
}

export const useScheduleStore = defineStore('schedule', () => {
  const today = new Date().toISOString().split('T')[0]

  // ✅ 단일 데이터 소스
  const schedules = ref<ScheduleItem[]>([])
  const goals = ref<Goal[]>([])

  const selectedDate = ref(today)
  const dailyFocus = ref('')

  // =========================
  // GETTERS
  // =========================

  const currentSchedules = computed(() => {
    return schedules.value.filter(s => {
      const start = s.startDate || s.endDate || selectedDate.value
      const end = s.endDate || s.startDate || selectedDate.value

      return start <= selectedDate.value && end >= selectedDate.value
    })
  })

  const tasks = computed(() =>
    currentSchedules.value.filter(s => s.type === 'task')
  )

  const milestones = computed(() =>
    currentSchedules.value.filter(s => s.type === 'milestone')
  )

  const events = computed(() =>
    currentSchedules.value.filter(s => s.type === 'event')
  )

  const pinnedItems = computed(() =>
    currentSchedules.value.filter(s => s.isPinned)
  )

  const completedItems = computed(() =>
    currentSchedules.value.filter(s => s.done)
  )

  // =========================
  // ACTIONS
  // =========================


  // 일정 생성 최강 함수입니다.
  const addSchedule = (item: Partial<ScheduleItem>) => {
    const isMilestone = item.type === 'milestone'
    schedules.value.push({
      id: Date.now(),
      type: item.type || 'task',
      summary: item.summary || '',
      memo: '',
      done: false,
      startDate: item.startDate,
      startTime: isMilestone ? undefined : item.startTime, 
      endTime: isMilestone ? undefined : item.endTime,
      category: item.category,
      priority: item.priority,
      goalId: item.goalId || null,
      isPinned: false,
      orderIndex: schedules.value.length
    })
    saveData()
  }

  // 일정 생성 도와주는 Helper 함수들입니다.
  // 빠른 생성이라 날짜가 같은 값이 들어갑니다. => 그냥 임시로 그 day로 시작과 끝나는 날짜 처리합니다.
  
  // 빠른 일반 일정 추가 함수
  const addTask = (summary: string, date: string) => {
    addSchedule({ type: 'task', summary, startDate: date, endDate: date })
  }

  // 마일스톤 빠른 추가 함수 -> goal에 대한 기간 단위 일정
  const addMilestone = (goalId: number, summary: string, date: string) => {
    addSchedule({ type: 'milestone', goalId, summary, startDate: date, endDate: date })
  }

  const updateSchedule = (id: number, patch: Partial<ScheduleItem>) => {
    const idx = schedules.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      schedules.value[idx] = {
        ...schedules.value[idx],
        ...patch
      }
      saveData()
    }
  }

  const removeSchedule = (id: number) => {
    schedules.value = schedules.value.filter(s => s.id !== id)
    saveData()
  }

  const togglePin = (id: number) => {
    const item = schedules.value.find(s => s.id === id)
    if (item) item.isPinned = !item.isPinned
    saveData()
  }

  const loadData = () => {
    const saved = localStorage.getItem('schedule_v2')
    if (!saved) return

    const parsed = JSON.parse(saved)

    schedules.value = parsed.schedules || []
    goals.value = parsed.goals || []
    dailyFocus.value = parsed.dailyFocus || ''
  }

  const saveData = () => {
    localStorage.setItem(
      'schedule_v2',
      JSON.stringify({
        schedules: schedules.value,
        goals: goals.value,
        dailyFocus: dailyFocus.value
      })
    )
  }

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    goals.value.unshift({
      id: Date.now(),
      ...goal
    })
    saveData()
  }
  
  const removeGoal = (id: number) => {
    goals.value = goals.value.filter(g => g.id !== id)
    schedules.value = schedules.value.filter(s => s.goalId !== id)
    
    saveData()
  }
  

  return {
    // state
    schedules,
    goals,
    selectedDate,
    dailyFocus,

    // getters
    currentSchedules,
    tasks,
    milestones,
    events,
    pinnedItems,
    completedItems,

    // actions
    addSchedule,
    addTask,
    addMilestone,
    updateSchedule,
    removeSchedule,
    togglePin,
    loadData,
    saveData,
    addGoal,
    removeGoal
  }
})