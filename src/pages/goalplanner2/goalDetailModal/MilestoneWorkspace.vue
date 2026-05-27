<template>
  <div class="goal-detail-view">
    <div class="ms-workspace-header">
      <div class="header-left">
        <button class="btn-back" @click="$emit('back')">〈 목록으로</button>
        <BaseInput
          :model-value="activeMilestone?.title || ''"
          field="goalTitle"
          placeholder="마일스톤 타이틀"
          class="workspace-title-base-input"
          @update:model-value="onTitleChange"
        />
      </div>
      <div class="header-right">
        <div class="workspace-date-edit">
          <input
            type="date"
            :value="activeMilestone?.startDate || ''"
            class="s-input-sm"
            @change="(e) => updateMilestoneDate('startDate', e)"
          />
          <span>~</span>
          <input
            type="date"
            :value="activeMilestone?.endDate || ''"
            class="s-input-sm"
            @change="(e) => updateMilestoneDate('endDate', e)"
          />
        </div>
        <button class="btn-text-danger ml-4" @click="removeMilestone">
          마일스톤 삭제
        </button>
      </div>
    </div>

    <div class="ms-workspace-body">
      <div class="cal-panel">
        <Calendar
          v-model="selectedMsDate"
          :range-start="activeMilestone?.startDate"
          :range-end="activeMilestone?.endDate"
          restrict-range
          class="h-full"
        />
      </div>

      <div class="task-panel">
        <div class="task-panel-header">
          <h4>
            📅 {{ selectedMsDate.slice(5).replace('-', '월 ') }}일 세부 일정
          </h4>
          <span class="ms-count">{{ pendingTasks.length }}개 남음</span>
        </div>

        <div class="task-list-scroll">
          <BaseTaskList
            :items="pendingTasks"
            text-key="summary"
            empty-message="해당 날짜에 진행 중인 일정이 없습니다."
            @delete="requestTaskDelete"
            @update="handleListTaskUpdate"
            @item-click="openTaskModal"
          >
            <template #header>
              <!-- 🌟 스포트라이트 스타일의 Quick Add -->
              <div class="smart-quick-add mb-4">
                <div
                  class="input-container"
                  :class="{ 'is-focused': isFocused }"
                >
                  <!-- 날짜 표시 뱃지 -->
                  <div class="milestone-selector">
                    <span class="ms-badge">
                      ↳ {{ selectedMsDate.slice(8) }}일
                    </span>
                  </div>

                  <!-- 입력 필드 -->
                  <input
                    v-model="newTaskText"
                    type="text"
                    class="quick-input"
                    placeholder="수행할 일정을 입력하세요 (Enter)"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                    @keyup.enter="handleAddTask"
                  />

                  <!-- 우측 액션 버튼 -->
                  <div class="action-buttons">
                    <button
                      class="btn-expand"
                      title="상세 일정 추가"
                      @click="isFullAddOpen = true"
                    >
                      ⤢ 상세
                    </button>
                    <button
                      class="btn-submit"
                      :disabled="!newTaskText.trim()"
                      @click="handleAddTask"
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </BaseTaskList>

          <div v-if="completedTasks.length > 0" class="completed-section mt-4">
            <button
              class="toggle-completed-btn"
              @click="showCompleted = !showCompleted"
            >
              {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{
                completedTasks.length
              }})
            </button>
            <BaseTaskList
              v-if="showCompleted"
              class="mt-2 opacity-70"
              :items="completedTasks"
              text-key="summary"
              :is-completed-style="true"
              :theme-color="goal.color || '#4f46e5'"
              @delete="removeTask"
              @update="handleListTaskUpdate"
              @item-click="openTaskModal"
            />
          </div>
        </div>
      </div>
    </div>

    <ScheduleDetailModal
      v-if="isTaskModalOpen && selectedTask"
      :is-open="isTaskModalOpen"
      :data="selectedTask"
      @close="isTaskModalOpen = false"
      @delete="() => requestTaskDelete(selectedTask!.id)"
      @update="handleTaskUpdate"
    />

    <FullScheduleAddModal
      :is-open="isFullAddOpen"
      :default-goal-id="props.goal.id"
      :default-milestone-id="props.milestoneId"
      :default-date="selectedMsDate"
      @close="isFullAddOpen = false"
    />
  </div>
  <div v-if="showDeleteOptions" class="delete-overlay">
    <div class="delete-modal">
      <h4>🗑 다중 일정 삭제</h4>
      <p>반복 또는 연속된 일정입니다.<br />어떻게 삭제하시겠습니까?</p>
      <div class="delete-actions">
        <button class="btn-single-delete" @click="executeDelete('single')">
          이 일정만 삭제
        </button>
        <button class="btn-all-delete" @click="executeDelete('all')">
          모든 연결된 일정 삭제
        </button>
        <button class="btn-cancel" @click="cancelDelete">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useScheduleStore,
  type Goal,
  type ScheduleItem,
  type Milestone
} from '@/stores/useScheduleStore'
import Calendar from '@/global-components/calendar/Calendar.vue'
import BaseTaskList from '@/global-components/ui/BaseTaskList.vue'
import ScheduleDetailModal from '@/global-components/modal/schedule-detail-modal/ScheduleDetailModal.vue'
import BaseInput from '@/global-components/Input/BaseInput.vue'
// ✅ 상세 일정 추가 모달 임포트
import FullScheduleAddModal from '@/global-components/modal/full-schedule-add-modal/FullScheduleAddModal.vue'

const props = defineProps<{ goal: Goal; milestoneId: number }>()
const emit = defineEmits(['back'])
const store = useScheduleStore()

const todayString = new Date().toISOString().slice(0, 10)

// 🌟 상세 일정 모달 열림 상태 관리
const isFullAddOpen = ref(false)

const isFocused = ref(false)

const activeMilestone = computed(
  () => store.milestones.find((m) => m.id === props.milestoneId) || null
)
const selectedMsDate = ref(activeMilestone.value?.startDate || todayString)

const handleMilestoneUpdate = (field: keyof Milestone, value: any) => {
  if (activeMilestone.value) {
    ;(activeMilestone.value as any)[field] = value
    store.saveData()
  }
}

const onTitleChange = (val: string) => {
  handleMilestoneUpdate('title', val)
}

const removeMilestone = () => {
  store.schedules = store.schedules.filter(
    (s) => s.milestoneId !== props.milestoneId
  )
  store.milestones = store.milestones.filter((m) => m.id !== props.milestoneId)
  store.saveData()
  emit('back')
}

const validateMilestoneDates = (msStart: string, msEnd: string) => {
  if (!msStart) return (alert('시작일은 필수입니다.'), false)

  const { startDate: gStart, endDate: gEnd } = props.goal
  if (msStart && gStart && msStart < gStart)
    return (alert(`목표 시작일(${gStart})보다 빠를 수 없습니다.`), false)
  if (gEnd) {
    if (msEnd && msEnd > gEnd)
      return (alert(`목표 종료일(${gEnd})보다 늦을 수 없습니다.`), false)
    if (msStart && msStart > gEnd)
      return (alert(`시작일이 목표 종료일(${gEnd})을 초과했습니다.`), false)
  }
  if (msStart && msEnd && msStart > msEnd)
    return (alert('시작 날짜가 종료 날짜보다 늦을 수 없습니다.'), false)
  return true
}

const updateMilestoneDate = (field: 'startDate' | 'endDate', event: Event) => {
  if (!activeMilestone.value) return
  const newVal = (event.target as HTMLInputElement).value || undefined

  const tempStart =
    field === 'startDate' ? newVal || '' : activeMilestone.value.startDate || ''
  const tempEnd =
    field === 'endDate' ? newVal || '' : activeMilestone.value.endDate || ''

  if (validateMilestoneDates(tempStart, tempEnd)) {
    handleMilestoneUpdate(field, newVal)
  } else {
    ;(event.target as HTMLInputElement).value =
      activeMilestone.value[field] || ''
  }
}

// 🌟 삭제 로직 관련 상태 추가
const showDeleteOptions = ref(false)
const taskPendingDelete = ref<ScheduleItem | null>(null)

// 🌟 통합 삭제 요청 핸들러
const requestTaskDelete = (taskId: number) => {
  const task = store.schedules.find((s) => s.id === taskId)
  if (!task) return

  // 다중 일정 여부 확인 (스토어 모델에 맞게 groupId, repeatId 등 사용)
  // 예시에서는 'groupId' 속성이 존재한다고 가정합니다.
  if (task.groupId) {
    taskPendingDelete.value = task
    showDeleteOptions.value = true
  } else {
    // 단일 일정이라면 묻지 않고 즉시 삭제
    taskPendingDelete.value = task
    executeDelete('single')
  }
}

// 🌟 실제 삭제 실행 함수
const executeDelete = (mode: 'single' | 'all') => {
  if (!taskPendingDelete.value) return

  const targetTask = taskPendingDelete.value

  if (mode === 'single') {
    // 1. 이 일정만 삭제
    store.removeSchedule(targetTask.id)
  } else if (mode === 'all') {
    // 2. 연결된 모든 일정 삭제
    // 스토어에 관련 액션이 없다면 직접 필터링 (아래는 직접 필터링하는 예시)
    store.schedules = store.schedules.filter(
      (s) => s.groupId !== targetTask.groupId
    )
    store.saveData() // 데이터 저장 싱크가 필요한 경우 호출
  }

  // 정리 및 모달 닫기
  cancelDelete()

  // 만약 상세 모달이 열려있었다면 같이 닫아줍니다.
  if (isTaskModalOpen.value) {
    isTaskModalOpen.value = false
  }
}

// 🌟 삭제 취소 및 상태 초기화
const cancelDelete = () => {
  showDeleteOptions.value = false
  taskPendingDelete.value = null
}

const showCompleted = ref(false)
const newTaskText = ref('')

// 🌟 수정된 필터링 로직 (기간 일정 포함)
const tasksForSelectedDate = computed(() => {
  if (!activeMilestone.value || !selectedMsDate.value) return []

  const targetDate = selectedMsDate.value

  return store.schedules.filter((s) => {
    // 1. 현재 마일스톤에 속한 일정인지 확인
    if (s.milestoneId !== activeMilestone.value!.id) return false

    // 2. '일반 할 일(task)' 뿐만 아니라 '이벤트(event)'도 목록에 표시
    // (기존 코드에 있던 s.type === 'task' 조건을 빼야 이벤트도 뜹니다!)

    // 🌟 3. 날짜 범위 검사 (핵심)
    const start = s.startDate
    // endDate가 없는 하루짜리 일정이면 endDate를 startDate와 동일하게 취급
    const end = s.endDate || s.startDate

    // 현재 선택한 날짜(targetDate)가 시작일과 종료일 사이에 포함되면 true!
    return start <= targetDate && targetDate <= end
  })
})

const pendingTasks = computed(() =>
  tasksForSelectedDate.value.filter((t) => !t.done)
)
const completedTasks = computed(() =>
  tasksForSelectedDate.value.filter((t) => t.done)
)

const handleAddTask = () => {
  const text = newTaskText.value
  if (!text) return

  addTaskToSelectedDate(text)
  newTaskText.value = ''
}

const addTaskToSelectedDate = (text: string) => {
  if (!activeMilestone.value || !selectedMsDate.value) return

  // 🌟 배열 직접 수정(unshift) 대신 스토어의 전용 액션 사용
  store.addSchedule({
    id: Date.now(),
    type: 'task',
    creationMode: 'single', // 퀵 애드는 무조건 단일 생성
    goalId: props.goal.id, // 현재 목표 ID 주입
    milestoneId: activeMilestone.value.id, // 현재 마일스톤 ID 주입
    summary: text,
    startDate: selectedMsDate.value
    // endDate는 undefined로 두어 하루짜리 일정으로 처리
  })
}

const removeTask = (taskId: number) => store.removeSchedule(taskId)

const handleListTaskUpdate = (updatedTask: ScheduleItem) => {
  store.updateSchedule(updatedTask.id, updatedTask)
}

const isTaskModalOpen = ref(false)
const selectedTask = ref<ScheduleItem | null>(null)
const openTaskModal = (task: ScheduleItem) => {
  selectedTask.value = task
  isTaskModalOpen.value = true
}
const handleTaskUpdate = (payload: Partial<ScheduleItem>) => {
  if (selectedTask.value) {
    store.updateSchedule(selectedTask.value.id, payload)
    isTaskModalOpen.value = false
  }
}
const handleTaskDelete = () => {
  if (selectedTask.value) {
    store.removeSchedule(selectedTask.value.id)
    isTaskModalOpen.value = false
  }
}
</script>

<style scoped>
/* 공통 유틸리티 */
.opacity-70 {
  opacity: 0.7;
}
.ml-4 {
  margin-left: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.h-full {
  height: 100%;
}

/* 상단 버튼 및 인풋 */
.s-input-sm {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #3f3f46;
  outline: none;
  width: 110px;
}
.btn-text-danger {
  background: transparent;
  color: #ef4444;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 8px;
  border-radius: 6px;
}
.btn-text-danger:hover {
  background: #fee2e2;
}

/* 레이아웃 */
.goal-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
}
.ms-workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #fff;
  border-bottom: 1px solid #e4e4e7;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}
.btn-back {
  background: #f4f4f5;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #52525b;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  transition: 0.2s;
}
.btn-back:hover {
  background: #e4e4e7;
  color: #18181b;
}
.workspace-title-base-input {
  width: 100%;
  max-width: 400px;
  margin-bottom: 0 !important;
}

/* 알약 배경/테두리 제거 및 하단 실선만 남김 */
.workspace-title-base-input :deep(.input-container) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 65px 4px 4px !important;
  border-bottom: 2px solid transparent !important;
  border-radius: 0 !important;
}

.workspace-title-base-input.is-focused :deep(.input-container),
.workspace-title-base-input:focus-within :deep(.input-container) {
  border-bottom-color: #6366f1 !important;
  transform: none !important;
}

.header-right {
  display: flex;
  align-items: center;
}
.workspace-date-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f4f5;
  padding: 6px 12px;
  border-radius: 8px;
}

/* 바디 레이아웃 (달력 & 테스크 영역) */
.ms-workspace-body {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 32px;
  gap: 32px;
}
.cal-panel {
  flex: 1 1 450px;
  max-width: 450px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}
.task-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.task-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.task-panel-header h4 {
  font-size: 18px;
  font-weight: 800;
  color: #27272a;
  margin: 0;
}
.ms-count {
  font-size: 13px;
  font-weight: 600;
  color: #71717a;
  background: #e4e4e7;
  padding: 4px 10px;
  border-radius: 20px;
}

/* 리스트 영역 래퍼 */
.task-list-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 4px;
}

/* 완료된 항목 토글 버튼 */
.toggle-completed-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #71717a;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 8px;
}
.toggle-completed-btn:hover {
  color: #27272a;
}

/* =======================================
   🌟 SMART QUICK ADD (Spotlight Style)
======================================= */
.smart-quick-add {
  margin-bottom: 16px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 4px 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-container.is-focused {
  border-color: #6366f1; /* 브랜드 컬러 맞춤 (Indigo) */
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* =======================================
   MILESTONE SELECTOR (Badge)
======================================= */
.milestone-selector {
  margin-right: 8px;
}

.ms-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  white-space: nowrap;
}

/* =======================================
   INPUT FIELD
======================================= */
.quick-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  font-size: 13px;
  color: #27272a;
  outline: none;
}

.quick-input::placeholder {
  color: #a1a1aa;
}

/* =======================================
   ACTIONS
======================================= */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-expand {
  background: transparent;
  border: none;
  color: #71717a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-expand:hover {
  background-color: #f4f4f5;
  color: #18181b;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #27272a; /* 묵직한 다크 그레이 */
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition:
    transform 0.1s,
    opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):active {
  transform: scale(0.9);
}
</style>
