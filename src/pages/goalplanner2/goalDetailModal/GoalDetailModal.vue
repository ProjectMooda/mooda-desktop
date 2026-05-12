<template>
  <div class="goal-detail-modal-root" ref="rootRef">
  <BaseModal 
    title="목표 상세 설정" 
    width="1000px" 
    height="760px" 
    @close="$emit('close')"
  >
    <!-- =======================================================
         VIEW 1: 목표 기본 정보 및 마일스톤 리스트 화면 
    ======================================================== -->
    <div v-if="!activeMilestone" class="modal-body relative">
      <!-- 좌측: 목표(Goal) 기본 정보 -->
      <div class="info-section">
        <div class="form-group">
          <label>목표 타이틀</label>
          <input type="text" v-model="goal.title" class="s-input title-input" @change="store.saveData" />
        </div>
        
        <div class="form-group">
          <label>목표 기간</label>
          <div class="date-row">
            <input type="date" v-model="goal.startDate" class="s-input flex-1" @change="store.saveData" />
            <span class="date-dash">~</span>
            <input type="date" v-model="goal.endDate" class="s-input flex-1" @change="store.saveData" />
          </div>
        </div>

        <div class="form-group">
          <label>테마 색상</label>
          <div class="color-picker">
            <button 
              v-for="color in palette" :key="color"
              class="color-swatch"
              :style="{ backgroundColor: color }"
              :class="{ active: (goal.color || '#3b82f6') === color }"
              @click="goal.color = color; store.saveData()"
            ></button>
          </div>
        </div>

        <div class="progress-section mt-auto">
          <div class="progress-header">
            <label>전체 Task 진행률</label>
            <span class="pct-text" :style="{ color: goal.color || '#4f46e5' }">{{ calculateProgress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: calculateProgress + '%', backgroundColor: goal.color || '#4f46e5' }"></div>
          </div>
        </div>
      </div>

      <!-- 우측: 마일스톤 영역 -->
      <div class="ms-section relative">
        <div class="view-container">
          <div class="ms-header-row mb-4">
            <div class="flex-row gap-2 items-center">
              <label>마일스톤 (기간별 목표)</label>
              <span class="ms-count">총 {{ goalMilestones.length }}개</span>
            </div>
            <button @click="showCreateModal = true" class="btn-primary">마일스톤 추가</button>
          </div>

          <div class="search-row">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="마일스톤 타이틀 검색..." 
              class="s-input search-input"
            />
          </div>

          <div class="ms-list-container">
            <div 
              v-for="ms in filteredMilestones" 
              :key="ms.id" 
              class="ms-card cursor-pointer"
              @click="openMilestoneDetail(ms)"
            >
              <div class="ms-summary">
                <div class="ms-color-bar" :style="{ backgroundColor: goal.color || '#3b82f6' }"></div>
                <div class="ms-content min-w-0">
                  <div class="ms-meta">
                    <span class="ms-badge bg-gray">마일스톤</span>
                    <span class="ms-date">{{ (ms.startDate || '').slice(5).replace('-', '/') }} ~ {{ (ms.endDate || '미정').slice(5).replace('-', '/') }}</span>
                    <span class="ms-task-count">
                      완료 {{ getCompletedCount(ms.id) }} / {{ getTotalTaskCount(ms.id) }}
                    </span>
                  </div>
                  <div class="ms-title">{{ ms.summary }}</div>
                </div>
                <div class="ms-actions shrink-0 text-gray-400">〉</div>
              </div>
            </div>
            
            <div v-if="filteredMilestones.length === 0" class="empty-state">
              등록된 마일스톤이 없거나 검색 결과가 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =======================================================
         VIEW 2: 마일스톤 상세 (캘린더 기반 풀스크린 워크스페이스)
    ======================================================== -->
    <div v-else class="modal-body-full">
      
      <!-- 상단 마일스톤 설정 헤더 -->
      <div class="ms-workspace-header">
        <div class="header-left">
          <button @click="backToList" class="btn-back">〈 목록으로</button>
          <input 
            type="text" 
            v-model="activeMilestone.summary" 
            class="workspace-title-input" 
            @change="handleMilestoneUpdate({ summary: activeMilestone.summary })" 
            placeholder="마일스톤 타이틀" 
          />
        </div>
        <div class="header-right">
          <div class="workspace-date-edit">
            <input type="date" :value="activeMilestone?.startDate" @change="(e) => updateMilestoneDate('startDate', e)" class="s-input-sm" />
            <span>~</span>
            <input type="date" :value="activeMilestone?.endDate" @change="(e) => updateMilestoneDate('endDate', e)" class="s-input-sm" />
          </div>
          <button @click="removeMilestone(activeMilestone.id)" class="btn-text-danger ml-4">마일스톤 삭제</button>
        </div>
      </div>

      <!-- 메인 워크스페이스 (캘린더 + 세부일정) -->
      <div class="ms-workspace-body">
        
        <!-- 좌측: 캘린더 뷰 -->
        <div class="cal-panel">
          <section class="cal-section">
            <div class="card-head">
              <button class="icon-btn" @click="changeMonth(-1)">‹</button>
              <h3>{{ currentYear }}. {{ String(currentMonth + 1).padStart(2, '0') }}</h3>
              <button class="icon-btn" @click="changeMonth(1)">›</button>
            </div>

            <div class="cal-grid">
              <div v-for="day in weekDays" :key="day" class="cal-day">{{ day }}</div>

              <div
                v-for="date in calendarDates"
                :key="date.full"
                class="cal-cell"
                :class="{
                  selected: selectedMsDate === date.full,
                  dimmed: !date.currentMonth,
                  today: date.isToday,
                  'in-range': date.inRange,
                  'out-range': !date.inRange && date.currentMonth // 기간 밖은 비활성화
                }"
                @click="selectDate(date)"
              >
                <span class="date-num">{{ date.day }}</span>

                <!-- 해당 날짜의 세부 일정 인디케이터 (점) -->
                <div class="dot-wrap" v-if="date.currentMonth && getTaskCountForDate(date.full) > 0">
                  <div class="dot" :style="{ backgroundColor: goal.color || '#3b82f6' }"></div>
                  <span class="dot-count">{{ getTaskCountForDate(date.full) }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 우측: 선택된 날짜의 Task 관리 뷰 -->
        <div class="task-panel">
          <div class="task-panel-header">
            <h4>📅 {{ selectedMsDate.slice(5).replace('-', '월 ') }}일 세부 일정</h4>
            <span class="ms-count">{{ pendingTasks.length }}개 남음</span>
          </div>

          <div class="add-task-row mb-4">
            <span class="add-icon">↳</span>
            <input 
              type="text" 
              v-model="newTaskText" 
              class="s-input task-add-input" 
              :placeholder="`${selectedMsDate.slice(8)}일에 수행할 일정 추가...`"
              @keyup.enter="addTaskToSelectedDate"
            />
            <button @click="addTaskToSelectedDate" class="btn-secondary btn-small shrink-0">추가</button>
          </div>

          <div class="task-list-scroll">
            <div class="task-list">
              <div v-for="task in pendingTasks" :key="task.id" class="task-item group">
                <label class="cbx-wrap shrink-0">
                  <input type="checkbox" v-model="task.done" @change="store.saveData" />
                  <span class="cbx-custom"></span>
                </label>
                <div class="task-text-wrap flex-1 cursor-pointer" @click="openTaskModal(task)">
                  <span class="task-text">{{ task.summary }}</span>
                </div>
                <button @click.stop="removeTask(task.id)" class="btn-delete-icon opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
              
              <div v-if="pendingTasks.length === 0" class="empty-task">
                해당 날짜에 진행 중인 일정이 없습니다.
              </div>
            </div>

            <div class="completed-section mt-4" v-if="completedTasks.length > 0">
              <button class="toggle-completed-btn" @click="showCompleted = !showCompleted">
                {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{ completedTasks.length }})
              </button>
              
              <div v-if="showCompleted" class="task-list mt-2 opacity-70">
                <div v-for="task in completedTasks" :key="task.id" class="task-item group bg-gray-50">
                  <label class="cbx-wrap shrink-0">
                    <input type="checkbox" v-model="task.done" @change="store.saveData" />
                    <span class="cbx-custom" :style="{ backgroundColor: goal.color || '#4f46e5', borderColor: goal.color || '#4f46e5' }"></span>
                  </label>
                  <div class="task-text-wrap flex-1 cursor-pointer" @click="openTaskModal(task)">
                    <span class="task-text is-done">{{ task.summary }}</span>
                  </div>
                  <button @click.stop="removeTask(task.id)" class="btn-delete-icon opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              </div>
            </div>
          </div> 
        </div>

      </div>
    </div>

    <!-- =======================================================
         모달: 마일스톤 생성 오버레이 (VIEW 1 에서만 접근)
    ======================================================== -->
    <div v-if="showCreateModal" class="ms-create-overlay">
      <div class="ms-create-box">
        <div class="box-header">
          <h3>새로운 마일스톤 추가</h3>
          <button @click="closeCreateModal" class="close-icon">✕</button>
        </div>
        
        <div class="box-body">
          <div class="form-group">
            <label>타이틀</label>
            <input type="text" v-model="newMsSummary" class="s-input" placeholder="마일스톤 타이틀 입력" @keyup.enter="submitNewMilestone" />
          </div>
          <div class="form-group">
            <label>기간 설정</label>
            <div class="date-row">
              <input type="date" v-model="newMsStartDate" class="s-input flex-1" />
              <span class="date-dash">~</span>
              <input type="date" v-model="newMsEndDate" class="s-input flex-1" />
            </div>
          </div>
        </div>

        <div class="box-footer">
          <button @click="closeCreateModal" class="btn-secondary">취소</button>
          <button @click="submitNewMilestone" class="btn-primary" :style="{ backgroundColor: goal.color || '#27272a' }">등록하기</button>
        </div>
      </div>
    </div>

  </BaseModal>

  <!-- 세부 일정 편집 (ScheduleDetailModal) -->
  <ScheduleDetailModal 
    v-if="isTaskModalOpen && selectedTask"
    :is-open="isTaskModalOpen" 
    :data="selectedTask" 
    @close="isTaskModalOpen = false" 
    @delete="handleTaskDelete" 
    @update="handleTaskUpdate" 
  />
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore, type Goal, type ScheduleItem } from '@/stores/useScheduleStore'
import BaseModal from '@/global-components/modal/BaseModal.vue'
import ScheduleDetailModal from '@/global-components/schedule-detail-modal/ScheduleDetailModal.vue'


const props = defineProps<{ goal: Goal }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

// --- UI 상태 ---
const searchQuery = ref('')
const activeMilestoneId = ref<number | null>(null)

const activeMilestone = computed(() =>
  store.schedules.find(
    s => s.id === activeMilestoneId.value && s.type === 'milestone'
  ) || null
)
const newTaskText = ref('')
const showCompleted = ref(false)

const showCreateModal = ref(false)
const newMsStartDate = ref(store.selectedDate)
const newMsEndDate = ref(store.selectedDate)
const newMsSummary = ref('')

const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#71717a']

// --- 마일스톤 리스트 로직 (VIEW 1) ---
const goalMilestones = computed(() => store.schedules.filter(s => s.goalId === props.goal.id && s.type === 'milestone'))
const filteredMilestones = computed(() => {
  let list = goalMilestones.value
  if (searchQuery.value.trim()) list = list.filter(m => m.summary?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return list
})

const calculateProgress = computed(() => {
  const tasks = store.schedules.filter(s => s.goalId === props.goal.id && s.type === 'task')
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.done).length
  return Math.round((completed / tasks.length) * 100)
})

const getTotalTaskCount = (msId: number) => store.schedules.filter(s => s.type === 'task' && s.milestoneId === msId).length
const getCompletedCount = (msId: number) => store.schedules.filter(s => s.type === 'task' && s.milestoneId === msId && s.done).length

// --- 유효성 검사 ---
const validateMilestoneDates = (msStart: string, msEnd: string) => {
  const gStart = props.goal.startDate
  const gEnd = props.goal.endDate
  if (msStart && gStart && msStart < gStart) { alert(`목표 시작일(${gStart})보다 빠를 수 없습니다.`); return false }
  if (gEnd) {
    if (msEnd && msEnd > gEnd) { alert(`목표 종료일(${gEnd})보다 늦을 수 없습니다.`); return false }
    if (msStart && msStart > gEnd) { alert(`시작일이 목표 종료일(${gEnd})을 초과했습니다.`); return false }
  }
  if (msStart && msEnd && msStart > msEnd) { alert('시작 날짜가 종료 날짜보다 늦을 수 없습니다.'); return false }
  return true
}

// --- 캘린더 로직 (VIEW 2) ---
interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
  inRange: boolean // 추가: 마일스톤 기간 내인지 여부
}

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const selectedMsDate = ref('')
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const isDateInRange = (dateStr: string) => {
  if (!activeMilestone.value) return false
  const start = activeMilestone.value.startDate || '1970-01-01'
  const end = activeMilestone.value.endDate || '9999-12-31'
  return dateStr >= start && dateStr <= end
}

const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const dates: CalendarDate[] = []

  for (let i = 0; i < firstDay; i++) {
    dates.push({ day: '', full: `empty-start-${i}`, currentMonth: false, isToday: false, inRange: false })
  }

  for (let i = 1; i <= lastDate; i++) {
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({ 
      day: i, 
      full, 
      currentMonth: true, 
      isToday: full === todayString,
      inRange: isDateInRange(full)
    })
  }

  const TOTAL_CELLS = 42; 
  const remainingCells = TOTAL_CELLS - dates.length;
  for (let i = 0; i < remainingCells; i++) {
    dates.push({ day: '', full: `empty-end-${i}`, currentMonth: false, isToday: false, inRange: false })
  }
  return dates
})

const changeMonth = (diff: number) => {
  currentMonth.value += diff
  if (currentMonth.value > 11) { currentMonth.value = 0; currentYear.value++ } 
  else if (currentMonth.value < 0) { currentMonth.value = 11; currentYear.value-- }
}

const selectDate = (date: CalendarDate) => {
  // 현재 달력이고 마일스톤 기간 내의 날짜만 선택 가능
  if (date.currentMonth && date.inRange) {
    selectedMsDate.value = date.full
  }
}

// 캘린더 점(Indicator) - 특정 날짜의 Task 개수
const getTaskCountForDate = (dateStr: string) => {
  if (!activeMilestone.value) return 0
  return store.schedules.filter(s => 
    s.type === 'task' && 
    s.milestoneId === activeMilestone.value!.id &&
    s.startDate === dateStr
  ).length
}

// --- 특정 날짜의 Task 로직 (VIEW 2 우측 패널) ---
const tasksForSelectedDate = computed(() => {
  if (!activeMilestone.value || !selectedMsDate.value) return []
  return store.schedules.filter(s => 
    s.type === 'task' && 
    s.milestoneId === activeMilestone.value!.id &&
    s.startDate === selectedMsDate.value // 선택된 날짜 기준 필터링
  )
})

const pendingTasks = computed(() => tasksForSelectedDate.value.filter(t => !t.done))
const completedTasks = computed(() => tasksForSelectedDate.value.filter(t => t.done))


// --- 마일스톤 생성/수정/삭제 액션 ---
const closeCreateModal = () => { showCreateModal.value = false; newMsSummary.value = '' }
const submitNewMilestone = () => {
  if (!newMsSummary.value.trim() || !validateMilestoneDates(newMsStartDate.value, newMsEndDate.value)) return
  store.schedules.push({
    id: Date.now(), type: 'milestone', goalId: props.goal.id,
    summary: newMsSummary.value, done: false,
    startDate: newMsStartDate.value, endDate: newMsEndDate.value
  } as ScheduleItem)
  store.saveData(); closeCreateModal()
}

const openMilestoneDetail = (ms: ScheduleItem) => {
  activeMilestoneId.value = ms.id
  newTaskText.value = ''
  showCompleted.value = false
  
  // 캘린더 초기화: 마일스톤의 시작 날짜로 달력 위치 이동 및 선택
  const startDateStr = ms.startDate || todayString
  const d = new Date(startDateStr)
  currentYear.value = d.getFullYear()
  currentMonth.value = d.getMonth()
  selectedMsDate.value = startDateStr
}

const backToList = () => { activeMilestoneId.value = null }
const removeMilestone = async (msId: number) => {
  // 1. 확인 창
  if (!confirm('마일스톤과 하위 일정을 모두 삭제하시겠습니까?')) return

  // 2. 현재 활성화된 포커스 강제 해제 (Focus Trap 꼬임 방지 핵심!!)
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  // 3. 스토어에서 데이터 먼저 완벽하게 삭제
  const tasks = store.schedules.filter(
    s => s.type === 'task' && s.milestoneId === msId
  )
  tasks.forEach(t => store.removeSchedule(t.id))
  store.removeSchedule(msId)
  store.saveData()

  // 4. 안전하게 화면 전환 (VIEW 2 -> VIEW 1)
  activeMilestoneId.value = null
  selectedMsDate.value = ''
}
// 1. 마일스톤 업데이트 로직 추가 (복사본이 아닌 원본 스토어 업데이트)
const handleMilestoneUpdate = (payload: Partial<ScheduleItem>) => {
  if (!activeMilestone.value) return
  store.updateSchedule(activeMilestone.value.id, payload)
  store.saveData()
}

const updateMilestoneDate = (field: 'startDate' | 'endDate', event: Event) => {
  if (!activeMilestone.value) return
  const target = event.target as HTMLInputElement
  const newVal = target.value
  const tempStart = field === 'startDate' ? newVal : activeMilestone.value.startDate || ''
  const tempEnd = field === 'endDate' ? newVal : activeMilestone.value.endDate || ''

  if (validateMilestoneDates(tempStart, tempEnd)) {
    activeMilestone.value[field] = newVal
    handleMilestoneUpdate({ [field]: newVal }) // 스토어에 반영
  } else {
    target.value = activeMilestone.value[field] || ''
  }
}
// 특정 날짜에 Task 추가
const addTaskToSelectedDate = () => {
  if (!newTaskText.value.trim() || !activeMilestone.value || !selectedMsDate.value) return
  store.schedules.push({
    id: Date.now(), type: 'task', goalId: props.goal.id,
    milestoneId: activeMilestone.value.id, summary: newTaskText.value, done: false,
    startDate: selectedMsDate.value, endDate: selectedMsDate.value // 🚨 선택한 캘린더 날짜로 저장
  } as ScheduleItem)
  store.saveData()
  newTaskText.value = ''
}

const removeTask = (taskId: number) => store.removeSchedule(taskId)

// --- Task 상세 모달 영역 ---
const isTaskModalOpen = ref(false)
const selectedTask = ref<ScheduleItem | null>(null)
const openTaskModal = (task: ScheduleItem) => { selectedTask.value = task; isTaskModalOpen.value = true }
const handleTaskUpdate = (payload: Partial<ScheduleItem>) => {
  if (selectedTask.value) { store.updateSchedule(selectedTask.value.id, payload); isTaskModalOpen.value = false }
}
const handleTaskDelete = () => {
  if (selectedTask.value) { store.removeSchedule(selectedTask.value.id); isTaskModalOpen.value = false }
}
</script>

<style scoped>
/* =======================================
   VIEW 1 스타일 (기존 리스트 화면)
======================================= */
.modal-body { display: flex; height: 100%; gap: 32px; background: #fafafa; overflow: hidden; border-radius: 0 0 16px 16px;}
.info-section { flex: 0 0 320px; display: flex; flex-direction: column; gap: 28px; padding: 32px; background: #fff; border-right: 1px solid #f4f4f5; }
.ms-section { flex: 1; padding: 32px 32px 32px 0; min-width: 0; min-height: 0;}
.view-container { display: flex; flex-direction: column; height: 100%; min-height: 0; }

.form-group label { display: block; font-size: 13px; font-weight: 700; color: #52525b; margin-bottom: 8px; }
.s-input { width: 100%; padding: 12px 14px; border: 1px solid #e4e4e7; border-radius: 10px; background: #fff; font-size: 14px; outline: none; transition: 0.2s; color: #27272a; }
.s-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.title-input { font-size: 16px; font-weight: 700; padding: 14px 16px; }
.date-row { display: flex; align-items: center; gap: 8px; }
.date-dash { color: #a1a1aa; font-weight: 600; }
.mt-auto { margin-top: auto; }

.btn-primary { background: #27272a; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; white-space: nowrap; font-size: 13px;}
.btn-primary:hover { background: #3f3f46; }

.search-row { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #a1a1aa; }
.search-input { padding-left: 38px; border-radius: 20px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.ms-header-row { display: flex; justify-content: space-between; align-items: center; }
.ms-header-row label { font-size: 16px; font-weight: 800; color: #27272a; margin: 0; }
.ms-count { font-size: 13px; font-weight: 600; color: #71717a; background: #e4e4e7; padding: 4px 10px; border-radius: 20px; }
.ms-list-container { flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.ms-card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; transition: 0.2s; }
.ms-card:hover { border-color: #d4d4d8; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); transform: translateY(-1px); }

.ms-summary { display: flex; align-items: center; padding: 14px 16px; gap: 14px; }
.ms-color-bar { width: 4px; height: 36px; border-radius: 2px; }
.ms-content { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.ms-meta { display: flex; align-items: center; gap: 8px; }
.ms-badge { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.bg-gray { background: #f4f4f5; color: #52525b; }
.ms-date { font-size: 12px; font-weight: 700; color: #71717a; }
.ms-task-count { font-size: 12px; font-weight: 600; color: #3b82f6; margin-left: auto;}
.ms-title { font-size: 15px; font-weight: 600; color: #27272a; }
.empty-state { text-align: center; padding: 40px 0; color: #a1a1aa; font-size: 14px; background: #fff; border-radius: 12px; border: 1px dashed #e4e4e7; }

.color-picker { display: flex; gap: 10px; flex-wrap: wrap; }
.color-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: 0.2s; }
.color-swatch.active { outline: 2px solid #27272a; outline-offset: 2px; }
.progress-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.progress-header label { font-size: 13px; font-weight: 700; color: #52525b; margin: 0; }
.pct-text { font-size: 24px; font-weight: 800; line-height: 1; }
.progress-track { height: 12px; background: #f4f4f5; border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 6px; }

/* =======================================
   VIEW 2 스타일 (풀스크린 워크스페이스)
======================================= */
.modal-body-full { display: flex; flex-direction: column; height: 100%; background: #fafafa; border-radius: 0 0 16px 16px;}

.ms-workspace-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 32px; background: #fff; border-bottom: 1px solid #e4e4e7; }
.header-left { display: flex; align-items: center; gap: 20px; flex: 1;}
.btn-back { background: #f4f4f5; border: none; font-size: 13px; font-weight: 700; color: #52525b; cursor: pointer; padding: 8px 14px; border-radius: 8px; transition: 0.2s; }
.btn-back:hover { background: #e4e4e7; color: #18181b; }
.workspace-title-input { font-size: 18px; font-weight: 800; color: #27272a; border: none; background: transparent; outline: none; width: 100%; max-width: 400px; padding: 4px; border-bottom: 2px solid transparent; transition: border-color 0.2s;}
.workspace-title-input:focus { border-bottom-color: #6366f1; }
.header-right { display: flex; align-items: center; }
.workspace-date-edit { display: flex; align-items: center; gap: 8px; background: #f4f4f5; padding: 6px 12px; border-radius: 8px;}
.s-input-sm { border: none; background: transparent; font-size: 13px; color: #3f3f46; outline: none; width: 110px;}
.btn-text-danger { background: transparent; color: #ef4444; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 8px; border-radius: 6px; }
.btn-text-danger:hover { background: #fee2e2; }
.ml-4 { margin-left: 16px; }

.ms-workspace-body { display: flex; flex: 1; min-height: 0; padding: 32px; gap: 32px; }

/* 캘린더 영역 */
.cal-panel { flex: 0 0 450px; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid #e4e4e7; display: flex; flex-direction: column;}
.cal-section { flex: 1; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.card-head h3 { font-size: 18px; font-weight: 800; color: #27272a; margin: 0; }
.icon-btn { background: #f4f4f5; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 18px; font-weight: bold; color: #71717a; cursor: pointer; display: flex; align-items: center; justify-content: center;}
.icon-btn:hover { background: #e4e4e7; color: #27272a; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cal-day { text-align: center; font-size: 12px; font-weight: 700; color: #a1a1aa; padding-bottom: 12px; }
.cal-cell { position: relative; height: 56px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border: 2px solid transparent; transition: 0.2s; background: #fff; }
.cal-cell:hover:not(.out-range) { border-color: #d4d4d8; }
.date-num { font-size: 14px; font-weight: 600; color: #3f3f46; z-index: 2;}

/* 캘린더 상태 CSS */
.cal-cell.dimmed .date-num { color: #d4d4d8; }
.cal-cell.out-range { cursor: not-allowed; opacity: 0.4; background: #fafafa; }
.cal-cell.in-range { background: #f8fafc; } /* 마일스톤 기간 내 강조 */
.cal-cell.today .date-num { color: #3b82f6; font-weight: 800; }
.cal-cell.selected { background: #27272a; border-color: #27272a; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transform: translateY(-1px);}
.cal-cell.selected .date-num { color: #fff; }

.dot-wrap { display: flex; align-items: center; gap: 4px; margin-top: 4px; z-index: 2;}
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-count { font-size: 10px; font-weight: 700; color: #71717a; }
.cal-cell.selected .dot-count { color: #e4e4e7; }

/* 세부 일정(Task) 패널 */
.task-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.task-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.task-panel-header h4 { font-size: 18px; font-weight: 800; color: #27272a; margin: 0; }

.task-list-scroll { flex: 1; overflow-y: auto; padding-right: 8px; margin-right: -8px; }
.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-item { display: flex; align-items: center; gap: 12px; background: #fff; padding: 12px 16px; border: 1px solid #e4e4e7; border-radius: 10px; transition: border-color 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02);}
.task-item:hover { border-color: #a1a1aa; }
.bg-gray-50 { background: #fafafa; border-style: dashed; }
.task-text-wrap { overflow: hidden; }
.task-text { font-size: 14px; font-weight: 500; color: #27272a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.task-text.is-done { text-decoration: line-through; color: #a1a1aa; }
.btn-delete-icon { background: none; border: none; color: #a1a1aa; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 4px; }
.btn-delete-icon:hover { color: #ef4444; background: #fee2e2; }

.empty-task { text-align: center; padding: 40px 0; color: #a1a1aa; font-size: 14px; border: 1px dashed #e4e4e7; border-radius: 10px; background: #fff;}
.toggle-completed-btn { background: none; border: none; font-size: 13px; font-weight: 700; color: #71717a; cursor: pointer; padding: 4px 0; transition: color 0.2s; display: flex; align-items: center; margin-top: 16px;}
.toggle-completed-btn:hover { color: #27272a; }

.add-task-row { display: flex; align-items: center; gap: 12px; }
.add-icon { color: #a1a1aa; font-weight: bold; font-size: 18px;}
.task-add-input { padding: 12px 16px; font-size: 14px; border-radius: 10px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.04); border: 1px solid #d4d4d8; }
.btn-secondary { background: #f4f4f5; color: #3f3f46; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; font-size: 13px;}
.btn-secondary:hover { background: #e4e4e7; }
.btn-small { padding: 10px 16px; font-size: 14px; border-radius: 10px;}

.cbx-wrap { position: relative; width: 22px; height: 22px; cursor: pointer; }
.cbx-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
.cbx-custom { position: absolute; inset: 0; border: 2px solid #d4d4d8; border-radius: 6px; transition: 0.2s; }
.cbx-custom:after { content: ''; position: absolute; display: none; left: 6px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.cbx-wrap input:checked ~ .cbx-custom:after { display: block; }

/* 생성 모달 오버레이 */
.ms-create-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; border-radius: 16px; }
.ms-create-box { width: 400px; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e4e4e7; overflow: hidden; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.box-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f4f4f5; }
.box-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: #27272a; }
.close-icon { background: none; border: none; font-size: 16px; color: #a1a1aa; cursor: pointer; transition: 0.2s; }
.close-icon:hover { color: #27272a; }
.box-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.box-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; background: #fafafa; border-top: 1px solid #f4f4f5; }

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.opacity-0 { opacity: 0; }
.opacity-70 { opacity: 0.7; }
.group:hover .group-hover\:opacity-100 { opacity: 1; }
.transition-opacity { transition: opacity 0.2s; }
.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }
.cursor-pointer { cursor: pointer; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.gap-2 { gap: 8px; }
.items-center { align-items: center; }
.flex-row { display: flex; }
</style>