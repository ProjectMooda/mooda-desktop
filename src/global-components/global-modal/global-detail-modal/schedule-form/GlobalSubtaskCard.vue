<template>
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
        :items="modelValue"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GlobalTaskListArea from '@/global-components/global-task-list-area/GlobalTaskListArea.vue'

// 스토어의 서브태스크 타입과 동일하게 정의
export interface Subtask {
  id: number
  text: string
  done: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: Subtask[]
  }>(),
  {
    modelValue: () => []
  }
)

const emit = defineEmits(['update:modelValue'])

const newSubtaskText = ref('')

const isMaxSubtasks = computed(() => props.modelValue.length >= 10)

const progressPercentage = computed(() => {
  if (props.modelValue.length === 0) return 0
  const completed = props.modelValue.filter((s) => s.done).length
  return Math.round((completed / props.modelValue.length) * 100)
})

const handleAddSubtask = () => {
  if (!newSubtaskText.value.trim() || isMaxSubtasks.value) return

  const newSubtask = {
    id: Date.now(),
    text: newSubtaskText.value,
    done: false
  }

  // 기존 배열에 새 항목을 추가하여 부모로 emit
  emit('update:modelValue', [...props.modelValue, newSubtask])
  newSubtaskText.value = ''
}

const updateSubtaskProgress = (updatedItem: Subtask) => {
  const newArray = props.modelValue.map((sub) =>
    sub.id === updatedItem.id ? updatedItem : sub
  )
  emit('update:modelValue', newArray)
}

const removeSubtask = (subtaskId: number) => {
  const newArray = props.modelValue.filter((sub) => sub.id !== subtaskId)
  emit('update:modelValue', newArray)
}
</script>

<style scoped>
/* 부모 컴포넌트에 있던 .subtask-card 관련 CSS를 모두 이곳으로 이동 */
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
.subtask-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px;
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
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
.subtask-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.subtask-card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
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
.custom-subtask-input::placeholder {
  color: var(--text-muted);
}
.add-icon {
  font-size: 16px;
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
