import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/axios/axios'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export interface SyncJob {
  jobId: string
  entity: 'schedule' | 'goal' | 'milestone' | 'category' | 'priority'
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  targetId: string
  payload?: any
  timestamp: number
}

// ✅ 공통적으로 version과 deletedAt 추가
export interface ScheduleItem {
  id: string
  groupId?: string
  creationMode: 'period' | 'weekly' | 'multiple' | 'single'
  type: 'task' | 'event'
  goalId?: string | null
  milestoneId?: string | null
  summary?: string
  done: boolean
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  category?: string
  priority?: string
  subtasks?: { id: string; text: string; done: boolean }[]
  isPinned?: boolean
  orderIndex?: number
  isRecurring?: boolean
  repeatWeekdays?: string[]
  version?: number
  deletedAt?: string | null
}

export interface Goal {
  id: string
  title: string
  startDate: string
  endDate?: string
  color?: string
  isArchived?: boolean
  version?: number
  deletedAt?: string | null
}
export interface Milestone {
  id: string
  goalId: string
  title: string
  startDate: string
  endDate?: string
  done: boolean
  version?: number
  deletedAt?: string | null
}
export interface CategoryOption {
  id: string
  label: string
  emoji: string
  deletedAt?: string | null
}
export interface PriorityOption {
  id: string
  label: string
  emoji: string
  color: string
  deletedAt?: string | null
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
  const isMiniMode = ref(false)
  const categories = ref<CategoryOption[]>([])
  const priorityOptions = ref<PriorityOption[]>([])

  // 🌟 [수정] Map을 활용한 O(1) Queue (키: entity_targetId)
  const syncQueueMap = ref<Map<string, SyncJob>>(new Map())
  const isSyncing = ref(false)
  let syncTimeout: ReturnType<typeof setTimeout> | null = null

  const isDataLoaded = ref(false)

  // =========================
  // QUEUE HELPER (Queue 압축 & Payload 병합)
  // =========================
  const pushToQueue = (
    entity: SyncJob['entity'],
    action: SyncJob['action'],
    targetId: string,
    payload?: any
  ) => {
    const key = `${entity}_${targetId}`
    const existing = syncQueueMap.value.get(key)
    const cleanPayload = payload
      ? JSON.parse(JSON.stringify(payload))
      : undefined

    if (existing) {
      if (action === 'DELETE') {
        if (existing.action === 'CREATE') {
          syncQueueMap.value.delete(key) // 서버 가기도 전에 생성->삭제면 무시
        } else {
          existing.action = 'DELETE'
          existing.payload = undefined
          existing.timestamp = Date.now()
        }
      } else if (action === 'UPDATE' && existing.action !== 'DELETE') {
        // 🌟 페이로드 병합 로직 (Payload Merge)
        existing.payload = { ...existing.payload, ...cleanPayload }
        existing.timestamp = Date.now()
      }
    } else {
      syncQueueMap.value.set(key, {
        jobId: generateId(),
        entity,
        action,
        targetId,
        payload: cleanPayload,
        timestamp: Date.now()
      })
    }

    saveData()

    // 5초 입력 대기 디바운스
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      syncWithServer()
    }, 5000)
  }

  // =========================
  // GETTERS (UI에는 삭제되지 않은 것만 노출)
  // =========================
  const activeSchedules = computed(() =>
    schedules.value.filter((s) => !s.deletedAt)
  )
  const toDateString = (value: string | Date) =>
    new Date(value).toISOString().slice(0, 10)

  const currentSchedules = computed(() => {
    const selected = selectedDate.value

    return activeSchedules.value.filter((s) => {
      const start = toDateString(s.startDate)
      const end = toDateString(s.endDate ?? s.startDate)

      return start <= selected && end >= selected
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
  // ACTIONS (Tombstone 방식으로 로컬 삭제 처리)
  // =========================
  const addSchedule = (item: Partial<ScheduleItem>) => {
    const newId = generateId()
    const newSchedule: ScheduleItem = {
      id: newId,
      groupId: item.groupId,
      creationMode: item.creationMode || 'single',
      type: item.type || 'task',
      summary: item.summary || '',
      done: false,
      startDate: item.startDate || today,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      priority: item.priority,
      goalId: item.goalId || null,
      milestoneId: item.milestoneId || null,
      isPinned: false,
      orderIndex: schedules.value.length,
      subtasks: item.subtasks || [],
      version: 1
    }
    schedules.value.push(newSchedule)
    pushToQueue('schedule', 'CREATE', newId, newSchedule)
  }
  const addTask = (summary: string, date?: string) => {
    addSchedule({
      type: 'task',
      creationMode: 'single',
      summary,
      startDate: date || today
    })
  }
  const updateSchedule = (id: string, patch: Partial<ScheduleItem>) => {
    const idx = schedules.value.findIndex((s) => s.id === id)
    if (idx !== -1) {
      schedules.value[idx] = { ...schedules.value[idx], ...patch }
      pushToQueue('schedule', 'UPDATE', id, schedules.value[idx])
    }
  }

  // 🌟 물리적 삭제 대신 로컬 Tombstone 세팅
  const removeSchedule = (id: string) => {
    const idx = schedules.value.findIndex((s) => s.id === id)
    if (idx !== -1) schedules.value[idx].deletedAt = new Date().toISOString()
    pushToQueue('schedule', 'DELETE', id)
  }
  const removeScheduleGroup = (groupId: string) => {
    if (!groupId) return
    const targets = schedules.value.filter(
      (s) => s.groupId === groupId && !s.deletedAt
    )
    targets.forEach((target) => {
      target.deletedAt = new Date().toISOString()
      pushToQueue('schedule', 'DELETE', target.id)
    })
  }
  const smartRemoveSchedule = (id: string, mode: 'single' | 'all') => {
    const target = schedules.value.find((s) => s.id === id)
    if (!target) return
    if (mode === 'single') removeSchedule(id)
    else if (mode === 'all' && target.groupId)
      removeScheduleGroup(target.groupId)
  }
  const togglePin = (id: string) => {
    const item = schedules.value.find((s) => s.id === id)
    if (item) {
      item.isPinned = !item.isPinned
      updateSchedule(id, { isPinned: item.isPinned })
    }
  }
  const syncMultipleSchedules = (
    originalId: string,
    patchData: Partial<ScheduleItem>,
    targetDates: string[]
  ) => {
    const original = schedules.value.find((s) => s.id === originalId)
    if (!original) return
    const cleanPatch = { ...patchData }
    delete cleanPatch.endDate
    const nextMode: ScheduleItem['creationMode'] =
      targetDates.length > 1 ? 'multiple' : 'single'

    // 🌟 [핵심] 기존 것을 지울 때 반드시 Tombstone(DELETE 큐)이 발동해야 함!
    if (original.groupId) removeScheduleGroup(original.groupId)
    else removeSchedule(originalId)

    if (nextMode === 'multiple') {
      const groupId = `group_multiple_${generateId()}`
      targetDates.forEach((dateStr) => {
        addSchedule({
          ...original,
          ...cleanPatch,
          groupId,
          creationMode: 'multiple',
          startDate: dateStr,
          endDate: undefined
        })
      })
    } else {
      addSchedule({
        ...original,
        ...cleanPatch,
        groupId: undefined,
        creationMode: 'single',
        startDate: targetDates[0],
        endDate: undefined
      })
    }
  }
  const addSubtask = (scheduleId: string, text: string) => {
    const schedule = schedules.value.find((s) => s.id === scheduleId)
    if (!schedule) return false
    if (!schedule.subtasks) schedule.subtasks = []
    if (schedule.subtasks.length >= 10) return false
    schedule.subtasks.push({ id: generateId(), text, done: false })
    pushToQueue('schedule', 'UPDATE', scheduleId, schedule)
    return true
  }
  const removeSubtask = (scheduleId: string, subtaskId: string) => {
    const schedule = schedules.value.find((s) => s.id === scheduleId)
    if (!schedule?.subtasks) return
    schedule.subtasks = schedule.subtasks.filter((sub) => sub.id !== subtaskId)
    pushToQueue('schedule', 'UPDATE', scheduleId, schedule)
  }
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newId = generateId()
    const newGoal: Goal = {
      id: newId,
      ...goal,
      endDate: goal.endDate || undefined,
      color: goal.color || '#ef4444',
      version: 1
    }
    goals.value.unshift(newGoal)
    pushToQueue('goal', 'CREATE', newId, newGoal)
  }
  const removeGoal = (id: string) => {
    const idx = goals.value.findIndex((g) => g.id === id)
    if (idx !== -1) goals.value[idx].deletedAt = new Date().toISOString()
    pushToQueue('goal', 'DELETE', id)
  }
  const toggleGoalArchive = (id: string) => {
    const goal = goals.value.find((g) => g.id === id)
    if (goal) {
      goal.isArchived = !goal.isArchived
      pushToQueue('goal', 'UPDATE', id, goal)
    }
  }
  const addMilestone = (
    goalId: string,
    title: string,
    startDate: string,
    endDate?: string
  ) => {
    const newId = generateId()
    const newMilestone: Milestone = {
      id: newId,
      goalId,
      title,
      startDate,
      endDate,
      done: false,
      version: 1
    }
    milestones.value.push(newMilestone)
    pushToQueue('milestone', 'CREATE', newId, newMilestone)
  }
  const addCategory = (newOption: Omit<CategoryOption, 'id'>) => {
    if (categories.value.length >= 10) return
    const newId = generateId()
    const newCategory = { ...newOption, id: newId }
    categories.value.push(newCategory)
    pushToQueue('category', 'CREATE', newId, newCategory)
  }
  const updateCategoryOption = (
    id: string,
    newOption: Partial<CategoryOption>
  ) => {
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...newOption }
      pushToQueue('category', 'UPDATE', id, categories.value[idx])
    }
  }
  const removeCategory = (id: string) => {
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx !== -1) categories.value[idx].deletedAt = new Date().toISOString()
    pushToQueue('category', 'DELETE', id)
  }
  const addPriorityOption = (newOption: Omit<PriorityOption, 'id'>) => {
    if (priorityOptions.value.length >= 8) return
    const newId = generateId()
    const newPriority = { ...newOption, id: newId }
    priorityOptions.value.push(newPriority)
    pushToQueue('priority', 'CREATE', newId, newPriority)
  }
  const updatePriorityOption = (
    id: string,
    newOption: Partial<PriorityOption>
  ) => {
    const idx = priorityOptions.value.findIndex((p) => p.id === id)
    if (idx !== -1) {
      priorityOptions.value[idx] = {
        ...priorityOptions.value[idx],
        ...newOption
      }
      pushToQueue('priority', 'UPDATE', id, priorityOptions.value[idx])
    }
  }
  const removePriorityOption = (id: string) => {
    const idx = priorityOptions.value.findIndex((p) => p.id === id)
    if (idx !== -1)
      priorityOptions.value[idx].deletedAt = new Date().toISOString()
    pushToQueue('priority', 'DELETE', id)
  }
  const toggleMiniMode = () => {
    isMiniMode.value = !isMiniMode.value
    if (window.electronAPI?.resizeWindow)
      window.electronAPI.resizeWindow(isMiniMode.value ? 'mini' : 'middle')
  }

  // =========================
  // 🌟 데이터 동기화 & 스토리지 로직
  // =========================

  const mergeDataList = (localList: any[], incomingList: any[]) => {
    incomingList.forEach((inc) => {
      // 🌟 [수정 1] 백엔드 변수명(categoryId)을 프론트엔드 변수명(category)으로 변환
      if ('categoryId' in inc) inc.category = inc.categoryId
      if ('priorityId' in inc) inc.priority = inc.priorityId

      // 🌟 [수정 2] DB의 타임스탬프(T)를 잘라내어 프론트엔드의 YYYY-MM-DD 포맷과 일치시킴
      if (inc.startDate) inc.startDate = inc.startDate.split('T')[0]
      if (inc.endDate) inc.endDate = inc.endDate.split('T')[0]

      const idx = localList.findIndex((local) => local.id === inc.id)
      if (idx !== -1) localList[idx] = { ...localList[idx], ...inc }
      else localList.push(inc)
    })
  }

  const loadData = async () => {
    if (!window.electronAPI?.dbGet) return
    try {
      const parsed = await window.electronAPI.dbGet('schedule_v2')
      if (parsed) {
        schedules.value = parsed.schedules || []
        goals.value = parsed.goals || []
        milestones.value = parsed.milestones || []
        categories.value = parsed.categories || []
        priorityOptions.value = parsed.priorityOptions || []
        dailyFocus.value = parsed.dailyFocus || ''

        // Map 복원
        const queueArray = parsed.syncQueue || []
        syncQueueMap.value = new Map(
          queueArray.map((q: SyncJob) => [`${q.entity}_${q.targetId}`, q])
        )
      }
    } catch (e) {
      console.error('SQLite 로컬 스토리지 로드 실패:', e)
    } finally {
      isDataLoaded.value = true
    }
  }

  const saveData = async () => {
    if (!isDataLoaded.value) return
    if (!window.electronAPI?.dbSet) return
    try {
      const snapshot = JSON.parse(
        JSON.stringify({
          schedules: schedules.value,
          goals: goals.value,
          milestones: milestones.value,
          categories: categories.value,
          priorityOptions: priorityOptions.value,
          dailyFocus: dailyFocus.value,
          syncQueue: Array.from(syncQueueMap.value.values()) // Map을 배열로
        })
      )
      await window.electronAPI.dbSet('schedule_v2', snapshot)
    } catch (e) {
      console.error('SQLite 로컬 스토리지 저장 실패:', e)
    }
  }

  const syncWithServer = async () => {
    if (syncQueueMap.value.size === 0 || isSyncing.value || !navigator.onLine)
      return
    isSyncing.value = true
    const jobsToSend = Array.from(syncQueueMap.value.values())

    try {
      const response = await api.post('/sync', { jobs: jobsToSend })

      if (response.data?.success) {
        // ✅ 1. 성공적으로 서버에 전송한 작업은 대기열(Map)에서 삭제
        jobsToSend.forEach((job) =>
          syncQueueMap.value.delete(`${job.entity}_${job.targetId}`)
        )

        // ✅ 2. 서버가 삭제(Tombstone)를 정상 접수했으므로, 로컬 배열에서 물리적 삭제 처리
        const deleteJobs = jobsToSend.filter((job) => job.action === 'DELETE')

        deleteJobs.forEach((job) => {
          const id = job.targetId
          switch (job.entity) {
            case 'schedule':
              schedules.value = schedules.value.filter((s) => s.id !== id)
              break
            case 'goal':
              goals.value = goals.value.filter((g) => g.id !== id)
              break
            case 'milestone':
              milestones.value = milestones.value.filter((m) => m.id !== id)
              break
            case 'category':
              categories.value = categories.value.filter((c) => c.id !== id)
              break
            case 'priority':
              priorityOptions.value = priorityOptions.value.filter(
                (p) => p.id !== id
              )
              break
          }
        })

        // ✅ 3. 대기열 제거 및 물리적 삭제가 끝난 깔끔한 상태를 SQLite에 즉시 저장
        await saveData()
      }
    } catch (error: any) {
      console.error('❌ [Sync Failed]', error.message)
    } finally {
      isSyncing.value = false
    }
  }
  // 🌟 Pull: 30일 체크 및 구조화된 병합
  const pullIncrementalSync = async () => {
    if (!window.electronAPI?.dbGet || !navigator.onLine) return
    const lastSyncTime = (await window.electronAPI.dbGet('last_sync_time')) || 0

    // ✅ 버그 수정: 앱 최초 실행 시 (lastSyncTime이 0일 때)
    if (lastSyncTime === 0) {
      console.log('🌱 최초 동기화: 서버에서 전체 데이터를 당겨옵니다.')
      await performPull(0)
      return
    }

    // ✅ 30일 이상 접속 안 했을 때 (정상 작동)
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    if (Date.now() - lastSyncTime > THIRTY_DAYS_MS) {
      console.log(
        '🔄 30일 이상 미접속: 로컬 DB를 비우고 전체 데이터를 당겨옵니다.'
      )
      await window.electronAPI.dbClear()
      resetStore()
      await performPull(0) // 전체 Fetch
      return
    }

    await performPull(lastSyncTime)
  }

  const performPull = async (since: number) => {
    try {
      const res = await api.get(`/sync/pull?since=${since}`)
      const { schedule, goal, milestone, category, priority, serverTimestamp } =
        res.data

      // console 확인용
      console.log(res.data)
      if (schedule?.length) mergeDataList(schedules.value, schedule)
      if (goal?.length) mergeDataList(goals.value, goal)
      if (milestone?.length) mergeDataList(milestones.value, milestone)
      if (category?.length) mergeDataList(categories.value, category)
      if (priority?.length) mergeDataList(priorityOptions.value, priority)

      if (serverTimestamp) {
        await window.electronAPI.dbSet('last_sync_time', serverTimestamp)
      }
      await saveData()
    } catch (e) {
      console.error('증분 풀링 실패', e)
    }
  }

  const initializeApp = async () => {
    await loadData()
    if (navigator.onLine) {
      await syncWithServer()
      await pullIncrementalSync()
    }
  }

  const resetStore = () => {
    schedules.value = []
    goals.value = []
    milestones.value = []
    categories.value = []
    priorityOptions.value = []
    syncQueueMap.value.clear()
    dailyFocus.value = ''
    isDataLoaded.value = false
  }

  // 배열 상태 추적용 getter 노출
  const syncQueue = computed(() => Array.from(syncQueueMap.value.values()))

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
    syncQueue,
    isMiniMode,
    isDataLoaded,
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
    addGoal,
    removeGoal,
    toggleGoalArchive,
    addPriorityOption,
    updatePriorityOption,
    removePriorityOption,
    addCategory,
    updateCategoryOption,
    removeCategory,
    toggleMiniMode,
    loadData,
    saveData,
    syncWithServer,
    pullIncrementalSync,
    initializeApp,
    resetStore
  }
})
