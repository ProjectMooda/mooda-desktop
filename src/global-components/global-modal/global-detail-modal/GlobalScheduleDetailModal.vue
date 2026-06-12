<template>
  <GlobalScheduleModalLayout
    :is-open="isOpen"
    :show-header="false"
    @close="handleClose"
  >
    <GlobalScheduleTitle
      v-model="localData.summary"
      placeholder="할 일 제목을 입력하세요"
    />

    <div class="form-section">
      <label class="section-label">날짜 & 시간</label>

      <div class="datetime-container">
        <label class="datetime-box date-box tabular-nums">
          <i class="ti ti-calendar"></i>
          <input
            type="date"
            v-model="localData.startDate"
            class="hidden-native-input"
          />
        </label>

        <div class="time-row">
          <BaseTimePicker
            v-model="localData.startTime"
            class="fixed-time-picker tabular-nums"
          />

          <span class="time-sep">→</span>

          <BaseTimePicker
            v-model="localData.endTime"
            class="fixed-time-picker tabular-nums"
          />
        </div>
      </div>
    </div>

    <GlobalScheduleMeta
      v-model:category="localData.category"
      v-model:priority="localData.priority"
    />

    <div class="subtask-card">
      <div class="subtask-card-header">
        <div class="header-left">
          <i class="ti ti-list-check"></i>
          <span class="title-text">하위 할 일</span>
        </div>
        <div class="header-right">
          <div class="mini-progress-bg">
            <div
              class="mini-progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <span class="pct-text tabular-nums">{{ progressPercentage }}%</span>
        </div>
      </div>

      <div class="subtask-card-body">
        <GlobalTaskListArea
          :items="localData.subtasks || []"
          text-key="text"
          :editable="true"
          list-type="checkbox"
          @delete="removeSubtask"
          @update="updateSubtaskProgress"
        />

        <div class="subtask-card-footer">
          <i class="ti ti-plus add-icon"></i>

          <div class="input-wrapper" :class="{ 'is-disabled': isMaxSubtasks }">
            <input
              v-model="newSubtaskText"
              type="text"
              :placeholder="
                isMaxSubtasks
                  ? '최대 10개까지만 추가할 수 있습니다'
                  : '하위 할 일 추가 (Enter)'
              "
              maxlength="30"
              :disabled="isMaxSubtasks"
              class="custom-subtask-input"
              @keyup.enter="handleAddSubtask"
            />
            <button
              v-show="newSubtaskText.length > 0 && !isMaxSubtasks"
              class="enter-btn"
              @click="handleAddSubtask"
            >
              <i class="ti ti-corner-down-left"></i>
            </button>
          </div>

          <span class="char-count tabular-nums">
            {{ newSubtaskText.length }} / 30
          </span>
        </div>
      </div>
    </div>

    <template #footer-left>
      <BaseButton variant="danger" :size="3" @click.stop="$emit('delete')">
        삭제
      </BaseButton>
    </template>
    <template #footer-right>
      <BaseButton variant="primary" :size="3" @click="handleClose">
        저장
      </BaseButton>
    </template>
  </GlobalScheduleModalLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GlobalScheduleModalLayout from './GlobalScheduleModalLayout.vue'
import BaseTimePicker from '@/base-ui/BaseTimePicker.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import GlobalTaskListArea from '@/global-components/global-task-list-area/GlobalTaskListArea.vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import GlobalScheduleTitle from '../global-detail-modal/schedule-form/GlobalScheduleTitle.vue'
import GlobalScheduleMeta from '../global-detail-modal/schedule-form/GlobalScheduleMeta.vue'

const store = useScheduleStore()

const props = defineProps<{
  isOpen: boolean
  data: ScheduleItem
}>()

const emit = defineEmits(['close', 'delete', 'update'])

const localData = ref<Partial<ScheduleItem>>({})
const newSubtaskText = ref('')

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.data) {
      localData.value = {
        ...props.data,
        subtasks: props.data.subtasks
          ? props.data.subtasks.map((s) => ({ ...s }))
          : []
      }
    }
  },
  { immediate: true }
)

// ✅ 하위 할 일이 10개 꽉 찼는지 판별하는 computed
const isMaxSubtasks = computed(() => {
  return (localData.value.subtasks ?? []).length >= 10
})

const progressPercentage = computed(() => {
  const subtasks = localData.value.subtasks ?? []
  if (subtasks.length === 0) return 0
  const completed = subtasks.filter((s) => s.done).length
  return Math.round((completed / subtasks.length) * 100)
})

const handleAddSubtask = () => {
  if (!newSubtaskText.value.trim()) return

  // ✅ 10개 제한 방어 코드
  if (isMaxSubtasks.value) return

  if (!localData.value.subtasks) {
    localData.value.subtasks = []
  }
  localData.value.subtasks.push({
    id: Date.now(),
    text: newSubtaskText.value,
    done: false
  })
  newSubtaskText.value = ''
}

const updateSubtaskProgress = (updatedItem: {
  id: number
  text: string
  done: boolean
}) => {
  if (!localData.value.subtasks) return
  const index = localData.value.subtasks.findIndex(
    (sub) => sub.id === updatedItem.id
  )
  if (index !== -1) {
    localData.value.subtasks[index] = updatedItem
  }
}

const removeSubtask = (subtaskId: number) => {
  if (localData.value.subtasks) {
    localData.value.subtasks = localData.value.subtasks.filter(
      (sub) => sub.id !== subtaskId
    )
  }
}

const handleClose = () => {
  if (localData.value.subtasks && localData.value.subtasks.length > 0) {
    const total = localData.value.subtasks.length
    const completed = localData.value.subtasks.filter((s) => s.done).length
    localData.value.done = total === completed
  }

  store.updateSchedule(props.data.id, localData.value as ScheduleItem)
  emit('update')
  newSubtaskText.value = ''
  emit('close')
}
</script>

<style scoped>
/* ==========================================
    Date & Time Section
========================================== */
.datetime-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.datetime-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  padding: 0 14px;
  height: 42px;
  transition: border-color 0.2s ease;
  cursor: pointer;
  box-shadow: var(--shadow-1);
}
.datetime-box:focus-within,
.datetime-box:hover {
  border-color: var(--color-primary-light);
}

.datetime-box i {
  font-size: 16px;
  color: var(--text-muted);
}

.hidden-native-input {
  border: none;
  background: transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  width: 100%;
  cursor: pointer;
}

/* Time Row */
.time-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.fixed-time-picker {
  flex: 1;
  height: 42px;
  border-radius: 8px !important;
  padding: 0 12px;
}

.fixed-time-picker :deep(.empty-state) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-sep {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}

/* ==========================================
    Subtasks
========================================== */
.subtask-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  flex-shrink: 0;
  height: auto;
  min-height: min-content;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

/* --- Header --- */
.subtask-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px;
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.header-left i {
  font-size: 16px;
  color: var(--text-muted);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mini-progress-bg {
  width: 40px;
  height: 3px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}
.mini-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.pct-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

/* --- Body --- */
/* 🛠 수정됨: max-height와 overflow 속성 제거하여 스크롤 없이 하단으로 무한 확장 */
.subtask-card-body {
  display: flex;
  flex-direction: column;
  height: auto;
  flex: 1;
}

.subtask-card-body :deep(.tl-root) {
  gap: 0;
}
.subtask-card-body :deep(.tl-list) {
  padding: 8px;
  gap: 4px;
}

/* --- Footer (Input Area) --- */
.subtask-card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}
.add-icon {
  font-size: 16px;
  color: var(--text-muted);
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 12px;
  height: 36px;
  transition: border-color 0.2s ease;
}
.input-wrapper:focus-within:not(.is-disabled) {
  border-color: var(--color-primary-light);
}

/* 🛠 추가됨: 10개 꽉 차서 비활성화 되었을 때의 스타일링 */
.input-wrapper.is-disabled {
  background: var(--bg-app);
  cursor: not-allowed;
}

.custom-subtask-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-main);
  font-size: 13px;
  font-family: inherit;
  height: 100%;
}
.custom-subtask-input:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}
.custom-subtask-input::placeholder {
  color: var(--text-muted);
}

.enter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.enter-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.char-count {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 42px;
  text-align: right;
}
</style>
