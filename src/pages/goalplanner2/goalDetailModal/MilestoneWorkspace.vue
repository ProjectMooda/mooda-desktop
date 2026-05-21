<template>
  <div class="goal-detail-view">
    <div class="ms-workspace-header">
      <div class="header-left">
        <button class="btn-back" @click="$emit('back')">〈 목록으로</button>
        <input
          type="text"
          :value="activeMilestone?.summary"
          class="workspace-title-input"
          placeholder="마일스톤 타이틀"
          @change="onSummaryChange"
        />
      </div>
      <div class="header-right">
        <div class="workspace-date-edit">
          <input
            type="date"
            :value="activeMilestone?.startDate"
            class="s-input-sm"
            @change="(e) => updateMilestoneDate('startDate', e)"
          />
          <span>~</span>
          <input
            type="date"
            :value="activeMilestone?.endDate"
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
          <!-- 진행 중인 항목 (할 일 추가 영역 포함) -->
          <BaseTaskList
            :items="pendingTasks"
            text-key="summary"
            empty-message="해당 날짜에 진행 중인 일정이 없습니다."
            @delete="removeTask"
            @update="store.saveData"
            @item-click="openTaskModal"
          >
            <!-- 🟢 header 슬롯을 사용하여 리스트 위에 입력창 배치 -->
            <template #header>
              <div class="add-subtask-wrapper mb-2">
                <span class="add-icon">↳</span>
                <input
                  v-model="newTaskText"
                  type="text"
                  class="add-subtask-input"
                  :placeholder="`${selectedMsDate.slice(8)}일에 수행할 일정 추가...`"
                  @keyup.enter="handleAddTask"
                />
              </div>
            </template>
          </BaseTaskList>

          <!-- 완료된 항목 -->
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
              @update="store.saveData"
              @item-click="openTaskModal"
            />
          </div>
        </div>
      </div>
    </div>

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
import {
  useScheduleStore,
  type Goal,
  type ScheduleItem
} from '@/stores/useScheduleStore'
import Calendar from '@/global-components/calendar/Calendar.vue'
import BaseTaskList from '@/global-components/ui/BaseTaskList.vue'
import ScheduleDetailModal from '@/global-components/modal/schedule-detail-modal/ScheduleDetailModal.vue'

const props = defineProps<{ goal: Goal; milestoneId: number }>()
const emit = defineEmits(['back'])
const store = useScheduleStore()

const todayString = new Date().toISOString().slice(0, 10)
const activeMilestone = computed(
  () =>
    store.schedules.find(
      (s) => s.id === props.milestoneId && s.type === 'milestone'
    ) || null
)
const selectedMsDate = ref(activeMilestone.value?.startDate || todayString)

// 마일스톤 업데이트 / 삭제 로직
const handleMilestoneUpdate = (payload: Partial<ScheduleItem>) => {
  if (activeMilestone.value) {
    store.updateSchedule(activeMilestone.value.id, payload)
    store.saveData()
  }
}
const onSummaryChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) handleMilestoneUpdate({ summary: target.value })
}
const removeMilestone = () => {
  store.schedules
    .filter((s) => s.type === 'task' && s.milestoneId === props.milestoneId)
    .forEach((t) => store.removeSchedule(t.id))
  store.removeSchedule(props.milestoneId)
  store.saveData()
  emit('back')
}
const validateMilestoneDates = (msStart: string, msEnd: string) => {
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
  const newVal = (event.target as HTMLInputElement).value
  const tempStart =
    field === 'startDate' ? newVal : activeMilestone.value.startDate || ''
  const tempEnd =
    field === 'endDate' ? newVal : activeMilestone.value.endDate || ''

  if (validateMilestoneDates(tempStart, tempEnd)) {
    activeMilestone.value[field] = newVal
    handleMilestoneUpdate({ [field]: newVal })
  } else {
    ;(event.target as HTMLInputElement).value =
      activeMilestone.value[field] || ''
  }
}

// Task 관리 로직
const showCompleted = ref(false)
const newTaskText = ref('') // 🌟 입력창 상태 추가

const tasksForSelectedDate = computed(() => {
  if (!activeMilestone.value || !selectedMsDate.value) return []
  return store.schedules.filter(
    (s) =>
      s.type === 'task' &&
      s.milestoneId === activeMilestone.value!.id &&
      s.startDate === selectedMsDate.value
  )
})
const pendingTasks = computed(() =>
  tasksForSelectedDate.value.filter((t) => !t.done)
)
const completedTasks = computed(() =>
  tasksForSelectedDate.value.filter((t) => t.done)
)

// 🌟 입력 처리 함수 추가
const handleAddTask = () => {
  const text = newTaskText.value.trim()
  if (!text) return

  addTaskToSelectedDate(text)
  newTaskText.value = '' // 입력창 초기화
}

const addTaskToSelectedDate = (text: string) => {
  if (!activeMilestone.value || !selectedMsDate.value) return

  // 🌟 항목이 위로 쌓이도록 unshift 사용
  store.schedules.unshift({
    id: Date.now(),
    type: 'task',
    goalId: props.goal.id,
    milestoneId: activeMilestone.value.id,
    summary: text,
    done: false,
    startDate: selectedMsDate.value,
    endDate: selectedMsDate.value
  } as ScheduleItem)

  store.saveData()
}
const removeTask = (taskId: number) => store.removeSchedule(taskId)

// Task 수정 모달 로직
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
.workspace-title-input {
  font-size: 18px;
  font-weight: 800;
  color: #27272a;
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  max-width: 400px;
  padding: 4px;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}
.workspace-title-input:focus {
  border-bottom-color: #6366f1;
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
  padding-right: 8px;
  margin-right: -8px;
  scrollbar-gutter: stable;
  padding-right: 4px; /* 기존의 margin-right 음수 값을 지우고 패딩만 살짝 줍니다 */
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

/* 🌟 하위 할 일 추가 입력창 (이관된 스타일) */
.add-subtask-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #d4d4d8;
  transition: border-color 0.2s;
}
.add-subtask-wrapper:focus-within {
  border-color: #6366f1;
  border-style: solid;
}
.add-icon {
  color: #a1a1aa;
  font-weight: bold;
  font-size: 14px;
  width: 16px;
  text-align: center;
}
.add-subtask-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #27272a;
  outline: none;
  min-width: 0;
}
.add-subtask-input::placeholder {
  color: #a1a1aa;
}
</style>
