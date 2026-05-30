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
          <div class="smart-quick-add mb-4">
            <div class="input-container" :class="{ 'is-focused': isFocused }">
              <div class="milestone-selector">
                <span class="ms-badge">
                  ↳ {{ selectedMsDate.slice(8) }}일
                </span>
              </div>

              <input
                v-model="newTaskText"
                type="text"
                class="quick-input"
                placeholder="수행할 일정을 입력하세요 (Enter)"
                @focus="isFocused = true"
                @blur="isFocused = false"
                @keyup.enter="handleAddTask"
              />

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

          <div
            v-if="
              localPendingTasks.length === 0 &&
              localOtherTasks.length === 0 &&
              completedTasks.length === 0
            "
            class="empty-msg"
          >
            해당 날짜에 일정이 없습니다.
          </div>

          <div v-else class="task-lists-container">
            <div v-if="localPendingTasks.length > 0" class="list-group">
              <draggable
                :list="localPendingTasks"
                item-key="id"
                ghost-class="ghost-card"
                animation="200"
                handle=".drag-handle"
                @end="onPendingDragEnd"
              >
                <template #item="{ element }">
                  <MilestoneCard
                    :item="element"
                    :is-mini="true"
                    @open-detail="openTaskModal(element)"
                    @update="handleItemUpdate(element, $event)"
                    @toggle-pin="handleItemTogglePin(element)"
                    @delete="requestTaskDelete(element.id)"
                  />
                </template>
              </draggable>
            </div>

            <div
              v-if="completedTasks.length > 0"
              class="completed-section mt-4"
            >
              <button
                class="toggle-completed-btn"
                @click="showCompleted = !showCompleted"
              >
                {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{
                  completedTasks.length
                }})
              </button>

              <div v-show="showCompleted" class="completed-tasks-group">
                <MilestoneCard
                  v-for="item in completedTasks"
                  :key="'done-ms-' + item.id"
                  :item="item"
                  :is-mini="true"
                  @open-detail="openTaskModal(item)"
                  @update="handleItemUpdate(item, $event)"
                  @toggle-pin="handleItemTogglePin(item)"
                  @delete="requestTaskDelete(item.id)"
                />
              </div>
            </div>

            <div
              v-if="localOtherTasks.length > 0"
              class="other-tasks-section mt-4"
            >
              <div class="section-divider">
                <span class="divider-line"></span>
                <span class="divider-text"
                  >그 외의 일정 ({{ localOtherTasks.length }})</span
                >
                <span class="divider-line"></span>
              </div>

              <div class="other-tasks-group mt-2">
                <draggable
                  :list="localOtherTasks"
                  item-key="id"
                  ghost-class="ghost-card"
                  animation="200"
                  handle=".drag-handle"
                  @end="onOtherDragEnd"
                >
                  <template #item="{ element }">
                    <component
                      :is="element.milestoneId ? MilestoneCard : TaskCard"
                      :item="element"
                      :is-mini="true"
                      @open-detail="openTaskModal(element)"
                      @update="handleItemUpdate(element, $event)"
                      @toggle-pin="handleItemTogglePin(element)"
                      @delete="requestTaskDelete(element.id)"
                    />
                  </template>
                </draggable>
              </div>
            </div>
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

    <BaseDeleteAlert
      v-model="showDeleteOptions"
      :task="taskPendingDelete"
      @deleted="onDeleteCompleted"
      @cancel="cancelDelete"
    />

    <BaseDeleteAlert
      v-model="showAlert"
      title="날짜 설정 오류"
      :message="alertMessage"
      confirm-text="확인"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import {
  useScheduleStore,
  type Goal,
  type ScheduleItem,
  type Milestone
} from '@/stores/useScheduleStore'
import Calendar from '@/global-components/calendar/Calendar.vue'
import MilestoneCard from '@/global-components/card/MilestoneCard.vue'
import TaskCard from '@/global-components/card/TaskCard.vue'
import ScheduleDetailModal from '@/global-components/modal/schedule-detail-modal/ScheduleDetailModal.vue'
import BaseInput from '@/global-ui/BaseInput.vue'
import FullScheduleAddModal from '@/global-components/modal/full-schedule-add-modal/FullScheduleAddModal.vue'
import BaseDeleteAlert from '@/global-components/modal/alert/BaseDeleteAlert.vue'

const props = defineProps<{ goal: Goal; milestoneId: number }>()
const emit = defineEmits(['back'])
const store = useScheduleStore()

const todayString = new Date().toISOString().slice(0, 10)

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

// 🌟 커스텀 에러 모달 상태
const showAlert = ref(false)
const alertMessage = ref('')

const showError = (msg: string) => {
  alertMessage.value = msg
  showAlert.value = true
  return false
}

const validateMilestoneDates = (msStart: string, msEnd: string) => {
  if (!msStart) return showError('시작일은 필수입니다.')

  const { startDate: gStart, endDate: gEnd } = props.goal
  if (msStart && gStart && msStart < gStart)
    return showError(`목표 시작일(${gStart})보다 빠를 수 없습니다.`)
  if (gEnd) {
    if (msEnd && msEnd > gEnd)
      return showError(`목표 종료일(${gEnd})보다 늦을 수 없습니다.`)
    if (msStart && msStart > gEnd)
      return showError(`시작일이 목표 종료일(${gEnd})을 초과했습니다.`)
  }
  if (msStart && msEnd && msStart > msEnd)
    return showError('시작 날짜가 종료 날짜보다 늦을 수 없습니다.')
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

// --- 삭제 로직 관련 상태 ---
const showDeleteOptions = ref(false)
const taskPendingDelete = ref<ScheduleItem | null>(null)

const requestTaskDelete = (taskId: number) => {
  const task = store.schedules.find((s) => s.id === taskId)
  if (!task) return

  if (task.groupId) {
    taskPendingDelete.value = task
    showDeleteOptions.value = true
  } else {
    store.smartRemoveSchedule(task.id, 'single')
    onDeleteCompleted()
  }
}

const onDeleteCompleted = () => {
  cancelDelete()
  if (isTaskModalOpen.value) {
    isTaskModalOpen.value = false
  }
}

const cancelDelete = () => {
  showDeleteOptions.value = false
  taskPendingDelete.value = null
}

// --- 할 일(Task) 관련 상태 및 로직 ---
const showCompleted = ref(false)
const newTaskText = ref('')

// 선택된 날짜에 해당하는 모든 일정
const allTasksForSelectedDate = computed(() => {
  if (!selectedMsDate.value) return []
  const targetDate = selectedMsDate.value

  return store.schedules.filter((s) => {
    const start = s.startDate
    const end = s.endDate || s.startDate
    return start <= targetDate && targetDate <= end
  })
})

const pendingTasks = computed(() =>
  allTasksForSelectedDate.value.filter(
    (t) => t.milestoneId === props.milestoneId && !t.done
  )
)

const completedTasks = computed(() =>
  allTasksForSelectedDate.value.filter(
    (t) => t.milestoneId === props.milestoneId && t.done
  )
)

const otherTasks = computed(() =>
  allTasksForSelectedDate.value.filter(
    (t) => t.milestoneId !== props.milestoneId
  )
)

// 🌟 드래그 앤 드롭용 로컬 리스트 분배
const localPendingTasks = ref<ScheduleItem[]>([])
const localOtherTasks = ref<ScheduleItem[]>([])

watch(
  pendingTasks,
  (newTasks) => {
    localPendingTasks.value = [...newTasks].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )
  },
  { immediate: true, deep: true }
)

watch(
  otherTasks,
  (newTasks) => {
    localOtherTasks.value = [...newTasks].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )
  },
  { immediate: true, deep: true }
)

const handleAddTask = () => {
  const text = newTaskText.value
  if (!text) return

  addTaskToSelectedDate(text)
  newTaskText.value = ''
}

const addTaskToSelectedDate = (text: string) => {
  if (!activeMilestone.value || !selectedMsDate.value) return

  store.addSchedule({
    id: Date.now(),
    type: 'task',
    creationMode: 'single',
    goalId: props.goal.id,
    milestoneId: activeMilestone.value.id,
    summary: text,
    startDate: selectedMsDate.value
  })
}

// 카드 컴포넌트들에서 올라오는 @update 이벤트 처리
const handleItemUpdate = (item: ScheduleItem, patch: Partial<ScheduleItem>) => {
  store.updateSchedule(item.id, patch)
}

const handleItemTogglePin = (item: ScheduleItem) => {
  store.togglePin(item.id)
}

// 드래그 종료 시 인덱스 저장
const onPendingDragEnd = () => {
  localPendingTasks.value.forEach((item, index) => {
    store.updateSchedule(item.id, { orderIndex: index })
  })
}

const onOtherDragEnd = () => {
  localOtherTasks.value.forEach((item, index) => {
    store.updateSchedule(item.id, { orderIndex: index })
  })
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

/* 바디 레이아웃 */
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

/* 🌟 드래그 앤 드롭 및 새로운 리스트 디자인 속성 추가 */
.task-list-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
}

.empty-msg {
  font-size: 13px;
  color: #a1a1aa;
  text-align: center;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 12px;
  border: 1px dashed #e4e4e7;
  margin-top: 8px;
}

.ghost-card {
  opacity: 0.4;
  background-color: #f4f4f5;
  border: 2px dashed #a1a1aa !important;
  transform: scale(0.98);
  transition: transform 0.2s;
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
.completed-tasks-group {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}
.completed-tasks-group:hover {
  opacity: 1;
}

/* SMART QUICK ADD */
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
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

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
  background-color: #27272a;
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

.section-divider {
  display: flex;
  align-items: center;
  margin: 24px 0 12px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e4e4e7;
}

.divider-text {
  font-size: 12px;
  font-weight: 600;
  color: #a1a1aa;
  padding: 0 12px;
}

.other-tasks-section {
  transition: opacity 0.2s ease;
  opacity: 0.7;
}

.other-tasks-section:hover {
  opacity: 1;
}
</style>
