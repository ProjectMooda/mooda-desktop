import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 1. 일반 일정 및 태스크 (Milestone 제거)
export interface ScheduleItem {
  id: number
  type: 'task' | 'event'
  goalId?: number | null
  milestoneId?: number | null
  summary?: string
  memo?: string
  done: boolean
  startDate?: string
  endDate?: string // 하루짜리 일정은 undefined
  startTime?: string
  endTime?: string
  category?: string
  priority?: 'Low' | 'Medium' | 'High' | string
  subtasks?: {
    id: number
    text: string
    done: boolean
  }[]
  isPinned?: boolean
  orderIndex?: number
}

// 2. 장기 목표
export interface Goal {
  id: number
  title: string
  startDate: string
  endDate?: string // 미정일 수 있으므로 옵셔널 처리
  color?: string
}

// 3. 마일스톤 (새로 추가됨)
export interface Milestone {
  id: number
  goalId: number
  title: string
  startDate: string
  endDate?: string
  done: boolean
}

export interface PriorityOption {
  id: string
  label: string
  emoji: string
  color: string
}

export const useScheduleStore = defineStore('schedule', () => {
  const today = new Date().toISOString().split('T')[0]

  // =========================
  // STATE (상태 분리 완벽 적용)
  // =========================
  const schedules = ref<ScheduleItem[]>([])
  const goals = ref<Goal[]>([])
  const milestones = ref<Milestone[]>([]) // ✅ 마일스톤 배열 분리
  const selectedDate = ref(today)
  const dailyFocus = ref('')

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
      // undefined 처리 완벽 대응
      const start = s.startDate || s.endDate || selectedDate.value
      const end = s.endDate || s.startDate || selectedDate.value
      return start <= selectedDate.value && end >= selectedDate.value
    })
  })

  const tasks = computed(() =>
    currentSchedules.value.filter((s) => s.type === 'task')
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
    schedules.value.push({
      id: Date.now(),
      type: item.type || 'task',
      summary: item.summary || '',
      memo: '',
      done: false,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      priority: item.priority,
      goalId: item.goalId || null,
      milestoneId: item.milestoneId || null,
      isPinned: false,
      orderIndex: schedules.value.length
    })
    saveData()
  }

  const addTask = (summary: string, date?: string) => {
    addSchedule({
      type: 'task',
      summary,
      startDate: date || undefined, // ✅ 빈 문자열 방지
      endDate: undefined // ✅ 단일 태스크는 endDate 없음
    })
  }

  // ✅ 마일스톤 추가 로직 (schedules가 아닌 milestones 배열로!)
  const addMilestone = (
    goalId: number,
    title: string,
    startDate: string,
    endDate?: string
  ) => {
    milestones.value.push({
      id: Date.now(),
      goalId,
      title,
      startDate,
      endDate,
      done: false
    })
    saveData()
  }

  const addSubtask = (scheduleId: number, text: string) => {
    const schedule = schedules.value.find((s) => s.id === scheduleId)
    if (!schedule) return
    if (!schedule.subtasks) schedule.subtasks = []

    schedule.subtasks.push({ id: Date.now(), text, done: false })
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

    try {
      const parsed = JSON.parse(saved)

      // ✅ 꼬인 데이터가 들어와도 배열 형태만 받도록 방어 로직 추가
      schedules.value = Array.isArray(parsed.schedules) ? parsed.schedules : []
      goals.value = Array.isArray(parsed.goals) ? parsed.goals : []
      milestones.value = Array.isArray(parsed.milestones)
        ? parsed.milestones
        : []
      dailyFocus.value = parsed.dailyFocus || ''

      if (Array.isArray(parsed.categories)) categories.value = parsed.categories
      if (Array.isArray(parsed.priorityOptions))
        priorityOptions.value = parsed.priorityOptions
    } catch (e) {
      console.error('데이터 파싱 오류:', e)
    }
  }

  const saveData = () => {
    localStorage.setItem(
      'schedule_v2',
      JSON.stringify({
        schedules: schedules.value,
        goals: goals.value,
        milestones: milestones.value, // ✅ 분리된 마일스톤도 함께 저장
        dailyFocus: dailyFocus.value,
        categories: categories.value,
        priorityOptions: priorityOptions.value
      })
    )
  }

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    goals.value.unshift({
      id: Date.now(),
      ...goal,
      // 🌟 빈 문자열("")이 넘어오면 undefined로 깔끔하게 변환
      endDate: goal.endDate || undefined
    })
    saveData()
  }

  const removeGoal = (id: number) => {
    goals.value = goals.value.filter((g) => g.id !== id)
    // ✅ 목표 삭제 시 연관된 마일스톤과 일정도 함께 삭제
    milestones.value = milestones.value.filter((m) => m.goalId !== id)
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

  const addCategory = (category: string) => {
    if (!categories.value.includes(category)) {
      categories.value.push(category)
      saveData()
    }
  }

  return {
    schedules,
    goals,
    milestones, // ✅ 외부로 노출
    selectedDate,
    dailyFocus,
    categories,
    priorityOptions,
    currentSchedules,
    tasks,
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
