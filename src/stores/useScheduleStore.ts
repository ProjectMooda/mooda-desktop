import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ScheduleItem {
  id: number
  type: 'task' | 'milestone' | 'event'
  goalId?: number | null
  milestoneId?: number | null
  summary?: string
  memo?: string
  done: boolean
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  category?: string
  priority?: 'Low' | 'Medium' | 'High' | string // Custom ID도 받을 수 있게 string 허용
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

export interface PriorityOption {
  id: string
  label: string
  emoji: string
  color: string
}

export const useScheduleStore = defineStore('schedule', () => {
  const today = new Date().toISOString().split('T')[0]

  const schedules = ref<ScheduleItem[]>([])
  const goals = ref<Goal[]>([])
  const selectedDate = ref(today)
  const dailyFocus = ref('')

  // ✅ 전역 상태 관리용 (카테고리 & 중요도)
  const categories = ref<string[]>([
    '기획',
    '디자인',
    '개발',
    '마케팅',
    '개인일정',
    '기타'
  ])
  const priorityOptions = ref<PriorityOption[]>([
    { id: 'High', label: '높음', emoji: '🔥', color: '#fee2e2' },
    { id: 'Medium', label: '중간', emoji: '⭐', color: '#fef3c7' },
    { id: 'Low', label: '낮음', emoji: '💧', color: '#e0f2fe' }
  ])

  // =========================
  // GETTERS
  // =========================
  const currentSchedules = computed(() => {
    return schedules.value.filter((s) => {
      const start = s.startDate || s.endDate || selectedDate.value
      const end = s.endDate || s.startDate || selectedDate.value
      return start <= selectedDate.value && end >= selectedDate.value
    })
  })

  const tasks = computed(() =>
    currentSchedules.value.filter((s) => s.type === 'task')
  )
  const milestones = computed(() =>
    currentSchedules.value.filter((s) => s.type === 'milestone')
  )
  const events = computed(() =>
    currentSchedules.value.filter((s) => s.type === 'event')
  )
  const pinnedItems = computed(() =>
    currentSchedules.value.filter((s) => s.isPinned)
  )
  const completedItems = computed(() =>
    currentSchedules.value.filter((s) => s.done)
  )

  // =========================
  // ACTIONS
  // =========================
  const addSchedule = (item: Partial<ScheduleItem>) => {
    const isMilestone = item.type === 'milestone'
    schedules.value.push({
      id: Date.now(),
      type: item.type || 'task',
      summary: item.summary || '',
      memo: '',
      done: false,
      startDate: item.startDate,
      endDate: item.endDate,
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

  const addTask = (summary: string, date: string) => {
    addSchedule({ type: 'task', summary, startDate: date, endDate: date })
  }

  const addMilestone = (goalId: number, summary: string, date: string) => {
    addSchedule({
      type: 'milestone',
      goalId,
      summary,
      startDate: date,
      endDate: date
    })
  }

  const addSubtask = (scheduleId: number, text: string) => {
    const schedule = schedules.value.find((s) => s.id === scheduleId)
    if (!schedule) return
    if (!schedule.subtasks) schedule.subtasks = []

    schedule.subtasks.push({
      id: Date.now(),
      text,
      done: false
    })
    saveData()
  }

  const removeSubtask = (scheduleId: number, subtaskId: number) => {
    const schedule = schedules.value.find((s) => s.id === scheduleId)

    if (!schedule?.subtasks) return

    schedule.subtasks = schedule.subtasks.filter((sub) => sub.id !== subtaskId)

    saveData()
  }

  const updateSchedule = (id: number, patch: Partial<ScheduleItem>) => {
    const idx = schedules.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      schedules.value[idx] = { ...schedules.value[idx], ...patch }
      saveData()
    }
  }

  const removeSchedule = (id: number) => {
    schedules.value = schedules.value.filter((s) => s.id !== id)
    saveData()
  }

  const togglePin = (id: number) => {
    const item = schedules.value.find((s) => s.id === id)
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

    // 저장된 커스텀 옵션이 있다면 불러오기
    if (parsed.categories) categories.value = parsed.categories
    if (parsed.priorityOptions) priorityOptions.value = parsed.priorityOptions
  }

  const saveData = () => {
    localStorage.setItem(
      'schedule_v2',
      JSON.stringify({
        schedules: schedules.value,
        goals: goals.value,
        dailyFocus: dailyFocus.value,
        categories: categories.value, // ✅ 카테고리 저장
        priorityOptions: priorityOptions.value // ✅ 중요도 저장
      })
    )
  }

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    goals.value.unshift({ id: Date.now(), ...goal })
    saveData()
  }

  const removeGoal = (id: number) => {
    goals.value = goals.value.filter((g) => g.id !== id)
    schedules.value = schedules.value.filter((s) => s.goalId !== id)
    saveData()
  }

  const addPriorityOption = (newOption: Omit<PriorityOption, 'id'>) => {
    if (priorityOptions.value.length >= 8) {
      alert('최대 8개까지만 설정 가능합니다.')
      return
    }
    const id = `p-${Date.now()}`
    priorityOptions.value.push({ ...newOption, id })
    saveData()
  }

  // 나중을 위한 카테고리 관리 액션
  const addCategory = (category: string) => {
    if (!categories.value.includes(category)) {
      categories.value.push(category)
      saveData()
    }
  }

  return {
    schedules,
    goals,
    selectedDate,
    dailyFocus,
    categories,
    priorityOptions,
    currentSchedules,
    tasks,
    milestones,
    events,
    pinnedItems,
    completedItems,
    addSchedule,
    addTask,
    addMilestone,
    addSubtask,
    removeSubtask,
    updateSchedule,
    removeSchedule,
    togglePin,
    loadData,
    saveData,
    addGoal,
    removeGoal,
    addPriorityOption,
    addCategory
  }
})
