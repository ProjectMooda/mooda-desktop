<template>
  <div class="smart-quick-add">
    <div
      v-if="isDropdownOpen"
      class="dropdown-overlay"
      @click="isDropdownOpen = false"
    ></div>

    <div class="input-container" :class="{ 'is-focused': isFocused }">
      <div class="milestone-selector" @click="isDropdownOpen = !isDropdownOpen">
        <span class="ms-badge" :class="{ 'is-empty': !selectedMilestoneId }">
          {{ selectedMilestoneName }}
        </span>

        <ul v-if="isDropdownOpen" class="ms-dropdown">
          <li
            :class="{ active: selectedMilestoneId === null }"
            @click.stop="selectMilestone(null)"
          >
            선택 안함 (일반 할 일)
          </li>
          <li
            v-for="ms in activeMilestones"
            :key="ms.id"
            :class="{ active: selectedMilestoneId === ms.id }"
            @click.stop="selectMilestone(ms.id)"
          >
            {{ ms.title }}
          </li>
        </ul>
      </div>

      <input
        ref="titleInput"
        v-model="newTitle"
        type="text"
        class="quick-input"
        placeholder="새로운 일정을 입력하세요 (Enter)"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="handleQuickAdd"
      />

      <div class="action-buttons">
        <button
          class="btn-expand"
          title="상세 일정 추가 (기간, 반복)"
          @click="$emit('open-full-add')"
        >
          ⤢ 상세
        </button>
        <button
          class="btn-submit"
          :disabled="!newTitle.trim()"
          @click="handleQuickAdd"
        >
          ↑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['close', 'open-full-add'])

const newTitle = ref('')
const isFocused = ref(false)
const isDropdownOpen = ref(false)

// 🌟 선택된 마일스톤 ID (null이면 일반 Task)
const selectedMilestoneId = ref<number | null>(null)

// 현재 스토어에 있는 완료되지 않은 마일스톤만 필터링
const activeMilestones = computed(() => {
  return scheduleStore.milestones.filter((m) => !m.done)
})

const selectedMilestoneName = computed(() => {
  if (!selectedMilestoneId.value) return '# 마일스톤 선택'
  const ms = scheduleStore.milestones.find(
    (m) => m.id === selectedMilestoneId.value
  )
  return ms
    ? `# ${ms.title.slice(0, 10)}${ms.title.length > 10 ? '...' : ''}`
    : '# 마일스톤 선택'
})

const titleInput = ref<HTMLInputElement | null>(null)

const selectMilestone = (id: number | null) => {
  selectedMilestoneId.value = id
  isDropdownOpen.value = false

  titleInput.value?.focus()
}

const handleQuickAdd = () => {
  if (!newTitle.value.trim()) return

  // 🌟 마일스톤이 선택되었다면 해당 마일스톤의 하위 Task로, 아니면 일반 Task로 저장
  scheduleStore.addSchedule({
    type: 'task',
    summary: newTitle.value,
    milestoneId: selectedMilestoneId.value,
    goalId: selectedMilestoneId.value
      ? scheduleStore.milestones.find((m) => m.id === selectedMilestoneId.value)
          ?.goalId
      : null,
    startDate: scheduleStore.selectedDate,
    endDate: undefined // 퀵 애드는 무조건 당일 일정
  })

  // 초기화 후 닫기
  newTitle.value = ''
  selectedMilestoneId.value = null
  emit('close')
}
</script>

<style scoped>
/* =======================================
   OVERLAY
======================================= */
.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

/* =======================================
   SMART QUICK ADD (Spotlight Style)
======================================= */
.smart-quick-add {
  padding: var(--space-4) 0;
  margin-bottom: var(--space-2);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-1) var(--space-2);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.input-container.is-focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* =======================================
   MILESTONE SELECTOR (Badge)
======================================= */
.milestone-selector {
  position: relative;
  margin-right: var(--space-2);
  z-index: 100;
}

.ms-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.2s;
}

.ms-badge.is-empty {
  background-color: var(--bg-hover);
  color: var(--text-muted);
}

.ms-badge:hover {
  opacity: 0.8;
}

/* Dropdown */
.ms-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 220px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  list-style: none;
  padding: var(--space-1);
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.ms-dropdown li {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.ms-dropdown li:hover {
  background-color: var(--bg-hover);
}

.ms-dropdown li.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-bold);
}

/* =======================================
   INPUT FIELD
======================================= */
.quick-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-main);
  outline: none;
}

.quick-input::placeholder {
  color: var(--text-muted);
}

/* =======================================
   ACTIONS
======================================= */
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.btn-expand {
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.btn-expand:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--text-main);
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
