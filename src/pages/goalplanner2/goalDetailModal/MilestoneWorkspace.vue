<template>
  <div class="goal-detail-view">
    <div class="ms-workspace-header">
      <div class="header-left">
        <button @click="$emit('back')" class="btn-back">〈 목록으로</button>
        <input
          type="text"
          :value="activeMilestone?.summary"
          class="workspace-title-input"
          @change="onSummaryChange"
          placeholder="마일스톤 타이틀"
        />
      </div>
      <div class="header-right">
        <div class="workspace-date-edit">
          <input
            type="date"
            :value="activeMilestone?.startDate"
            @change="(e) => updateMilestoneDate('startDate', e)"
            class="s-input-sm"
          />
          <span>~</span>
          <input
            type="date"
            :value="activeMilestone?.endDate"
            @change="(e) => updateMilestoneDate('endDate', e)"
            class="s-input-sm"
          />
        </div>
        <button @click="removeMilestone" class="btn-text-danger ml-4">
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

        <div class="add-task-row mb-4">
          <span class="add-icon">↳</span>
          <input
            type="text"
            v-model="newTaskText"
            class="s-input task-add-input"
            :placeholder="`${selectedMsDate.slice(8)}일에 수행할 일정 추가...`"
            @keyup.enter="addTaskToSelectedDate"
          />
          <button
            @click="addTaskToSelectedDate"
            class="btn-secondary btn-small shrink-0"
          >
            추가
          </button>
        </div>

        <div class="task-list-scroll">
          <div class="task-list">
            <div
              v-for="task in pendingTasks"
              :key="task.id"
              class="task-item group"
            >
              <label class="cbx-wrap shrink-0">
                <CheckBox
                  v-model="task.done"
                  @update:model-value="store.saveData"
                />
                <span class="cbx-custom"></span>
              </label>
              <div
                class="task-text-wrap flex-1 cursor-pointer"
                @click="openTaskModal(task)"
              >
                <span class="task-text">{{ task.summary }}</span>
              </div>
              <Xbutton @click.stop="removeTask(task.id)" />
            </div>
            <div v-if="pendingTasks.length === 0" class="empty-task">
              해당 날짜에 진행 중인 일정이 없습니다.
            </div>
          </div>

          <div class="completed-section mt-4" v-if="completedTasks.length > 0">
            <button
              class="toggle-completed-btn"
              @click="showCompleted = !showCompleted"
            >
              {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{
                completedTasks.length
              }})
            </button>
            <div v-if="showCompleted" class="task-list mt-2 opacity-70">
              <div
                v-for="task in completedTasks"
                :key="task.id"
                class="task-item group bg-gray-50"
              >
                <label class="cbx-wrap shrink-0">
                  <CheckBox
                    v-model="task.done"
                    @update:model-value="store.saveData"
                  />
                  <span
                    class="cbx-custom"
                    :style="{
                      backgroundColor: goal.color || '#4f46e5',
                      borderColor: goal.color || '#4f46e5'
                    }"
                  ></span>
                </label>
                <div
                  class="task-text-wrap flex-1 cursor-pointer"
                  @click="openTaskModal(task)"
                >
                  <span class="task-text is-done">{{ task.summary }}</span>
                </div>
                <Xbutton @click.stop="removeTask(task.id)" />
              </div>
            </div>
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
import Xbutton from '@/global-components/ui//Xbutton.vue'
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
const newTaskText = ref('')
const showCompleted = ref(false)

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

const addTaskToSelectedDate = () => {
  if (
    !newTaskText.value.trim() ||
    !activeMilestone.value ||
    !selectedMsDate.value
  )
    return
  store.schedules.push({
    id: Date.now(),
    type: 'task',
    goalId: props.goal.id,
    milestoneId: activeMilestone.value.id,
    summary: newTaskText.value,
    done: false,
    startDate: selectedMsDate.value,
    endDate: selectedMsDate.value
  } as ScheduleItem)
  store.saveData()
  newTaskText.value = ''
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
.shrink-0 {
  flex-shrink: 0;
}
.flex-1 {
  flex: 1;
}
.cursor-pointer {
  cursor: pointer;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.h-full {
  height: 100%;
}

/* 버튼 및 인풋 */
.s-input-sm {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #3f3f46;
  outline: none;
  width: 110px;
}
.btn-secondary {
  background: #f4f4f5;
  color: #3f3f46;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-size: 13px;
}
.btn-secondary:hover {
  background: #e4e4e7;
}
.btn-small {
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 10px;
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
.ml-4 {
  margin-left: 16px;
}

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

/* 세부 일정 리스트 */
.task-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px 16px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  transition: border-color 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.task-item:hover {
  border-color: #a1a1aa;
}
.bg-gray-50 {
  background: #fafafa;
  border-style: dashed;
}
.task-text-wrap {
  overflow: hidden;
}
.task-text {
  font-size: 14px;
  font-weight: 500;
  color: #27272a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.task-text.is-done {
  text-decoration: line-through;
  color: #a1a1aa;
}
.empty-task {
  text-align: center;
  padding: 40px 0;
  color: #a1a1aa;
  font-size: 14px;
  border: 1px dashed #e4e4e7;
  border-radius: 10px;
  background: #fff;
}
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
}
.toggle-completed-btn:hover {
  color: #27272a;
}

.add-task-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.add-icon {
  color: #a1a1aa;
  font-weight: bold;
  font-size: 18px;
}
.task-add-input {
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #d4d4d8;
  width: 100%;
}

/* 체크박스 커스텀 */
.cbx-wrap {
  position: relative;
  width: 22px;
  height: 22px;
  cursor: pointer;
}
.cbx-wrap input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.cbx-custom {
  position: absolute;
  inset: 0;
  border: 2px solid #d4d4d8;
  border-radius: 6px;
  transition: 0.2s;
}
.cbx-custom:after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.cbx-wrap input:checked ~ .cbx-custom:after {
  display: block;
}
</style>
