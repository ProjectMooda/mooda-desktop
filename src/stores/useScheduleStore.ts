import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 1. 일반 일정 및 테스크
export interface ScheduleItem {
  id: number
  groupId?: string // ✅ 반복/다중 생성된 일정들을 묶는 그룹 ID
  creationMode: 'period' | 'weekly' | 'multiple' | 'single' // ✅ 생성 방식 기록
  type: 'task' | 'event'
  goalId?: number | null
  milestoneId?: number | null
  summary?: string
  done: boolean
  startDate: string // ✅ 필수로 변경 (모든 일정은 시작일이 있음)
  endDate?: string // 하루짜리나 단일 태스크는 undefined
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
  endDate?: string
  color?: string
  isArchived?: boolean // 목표 보관 확인 함수
}

// 3. 마일스톤
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
  // STATE
  // =========================
  const schedules = ref<ScheduleItem[]>([])
  const goals = ref<Goal[]>([])
  const milestones = ref<Milestone[]>([])
  const selectedDate = ref(today)
  const dailyFocus = ref('')
  const isMiniMode = ref(false) // 미니ㄹaddCategory 모드

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
      // 기간 일정인 경우 startDate ~ endDate 사이에 selectedDate가 포함되는지 체크
      const start = s.startDate
      const end = s.endDate || s.startDate // endDate가 없으면 startDate와 동일하게 취급
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

  // ✅ addSchedule 변경: groupId와 creationMode를 받도록 수정
  const addSchedule = (item: Partial<ScheduleItem>) => {
    schedules.value.push({
      id: Date.now() + Math.floor(Math.random() * 1000), // 다중 생성 시 id 중복 방지
      groupId: item.groupId, // 반복/다중 그룹핑 ID
      creationMode: item.creationMode || 'single', // 생성 모드 (기본 single)
      type: item.type || 'task',
      summary: item.summary || '',
      done: false,
      startDate: item.startDate || today, // 최소한 오늘 날짜 보장
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      priority: item.priority,
      goalId: item.goalId || null,
      milestoneId: item.milestoneId || null,
      isPinned: false,
      orderIndex: schedules.value.length,
      subtasks: item.subtasks || []
    })
    saveData()
  }

  // ✅ 단일 할 일 추가 (기존 호환성 유지)
  const addTask = (summary: string, date?: string) => {
    addSchedule({
      type: 'task',
      creationMode: 'single',
      summary,
      startDate: date || today,
      endDate: undefined
    })
  }

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

    // ✅ 추가: 10개 이상이면 더 이상 추가하지 않고 false 반환
    if (schedule.subtasks.length >= 10) {
      return false
    }

    schedule.subtasks.push({ id: Date.now(), text, done: false })
    saveData()
    return true // 성공 시 true 반환
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
  const syncMultipleSchedules = (
    originalId: number,
    patchData: Partial<ScheduleItem>,
    targetDates: string[]
  ) => {
    const original = schedules.value.find((s) => s.id === originalId)
    if (!original) return

    // ✅ endDate는 여기서도 명시적으로 제거 (혹시 남아있을 경우 대비)
    const cleanPatch = { ...patchData }
    delete cleanPatch.endDate

    // ✅ 날짜 1개 = single, 2개 이상 = multiple (period 판정 완전 제거)
    const nextMode: ScheduleItem['creationMode'] =
      targetDates.length > 1 ? 'multiple' : 'single'

    // 기존 그룹 전체 제거
    if (original.groupId) {
      schedules.value = schedules.value.filter(
        (s) => s.groupId !== original.groupId
      )
    } else {
      schedules.value = schedules.value.filter((s) => s.id !== originalId)
    }

    if (nextMode === 'multiple') {
      const groupId = `group_multiple_${Date.now()}`
      targetDates.forEach((dateStr, index) => {
        schedules.value.push({
          ...original,
          ...cleanPatch,
          id: Date.now() + index,
          groupId,
          creationMode: 'multiple',
          startDate: dateStr,
          endDate: undefined // ✅ 명시적 제거
        })
      })
    } else {
      // single: 날짜 1개
      schedules.value.push({
        ...original,
        ...cleanPatch,
        id: original.id,
        groupId: undefined,
        creationMode: 'single',
        startDate: targetDates[0],
        endDate: undefined // ✅ 명시적 제거
      })
    }

    saveData()
  }
  // ✅ 단일 삭제
  const removeSchedule = (id: number) => {
    schedules.value = schedules.value.filter((s) => s.id !== id)
    saveData()
  }

  // 🌟 NEW: 그룹 일괄 삭제 (이 일정과 연결된 모든 반복 일정 삭제)
  const removeScheduleGroup = (groupId: string) => {
    if (!groupId) return
    schedules.value = schedules.value.filter((s) => s.groupId !== groupId)
    saveData()
  }

  // 🌟 NEW: 통합 스마트 삭제 액션
  const smartRemoveSchedule = (id: number, mode: 'single' | 'all') => {
    const target = schedules.value.find((s) => s.id === id)
    if (!target) return

    if (mode === 'single') {
      removeSchedule(id) // 단일 삭제
    } else if (mode === 'all' && target.groupId) {
      removeScheduleGroup(target.groupId) // 그룹 삭제
    }
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
        milestones: milestones.value,
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
      endDate: goal.endDate || undefined,
      color: goal.color || '#ef4444' // 🌟 기본 색상 추가
    })
    saveData()
  }

  const removeGoal = (id: number) => {
    goals.value = goals.value.filter((g) => g.id !== id)
    milestones.value = milestones.value.filter((m) => m.goalId !== id)
    schedules.value = schedules.value.filter((s) => s.goalId !== id)
    saveData()
  }

  // 목표 보관함 토글 액션
  const toggleGoalArchive = (id: number) => {
    const goal = goals.value.find((g) => g.id === id)
    if (goal) {
      goal.isArchived = !goal.isArchived
      saveData() // 변경 후 즉시 저장
    }
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

  const toggleMiniMode = () => {
    isMiniMode.value = !isMiniMode.value

    // 🌟 Vue 상태가 변할 때 프로그램 창 크기도 같이 변경 요청!
    if (window.electronAPI?.resizeWindow) {
      window.electronAPI.resizeWindow(isMiniMode.value ? 'mini' : 'middle')
    }
  }
  return {
    schedules,
    goals,
    milestones,
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
    removeScheduleGroup,
    smartRemoveSchedule,
    syncMultipleSchedules,
    togglePin,
    loadData,
    saveData,
    addGoal,
    removeGoal,
    toggleGoalArchive,
    addPriorityOption,
    addCategory,
    isMiniMode,
    toggleMiniMode
  }
})
