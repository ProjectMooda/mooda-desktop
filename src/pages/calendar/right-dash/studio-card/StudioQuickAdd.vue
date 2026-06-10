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

      <div class="input-wrapper">
        <input
          ref="titleInput"
          v-model="newTitle"
          type="text"
          class="quick-input"
          placeholder="새로운 일정을 입력하세요 (Enter)"
          maxlength="20"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keyup.enter="handleQuickAdd"
        />

        <span class="char-count"> {{ newTitle.length }}/20 </span>
      </div>

      <div class="action-buttons">
        <BaseButton
          :size="2"
          variant="ghost"
          title="상세 일정 추가 (기간, 반복)"
          @click="$emit('open-full-add')"
        >
          ⤢ 상세
        </BaseButton>

        <BaseButton
          :size="2"
          variant="primary"
          :disabled="!newTitle.trim()"
          iconOnly
          @click="handleQuickAdd"
        >
          ↵
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import BaseButton from '@/base-ui/BaseButton.vue'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['close', 'open-full-add'])

const newTitle = ref('')
const isFocused = ref(false)
const isDropdownOpen = ref(false)

const selectedMilestoneId = ref<number | null>(null)

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

  scheduleStore.addSchedule({
    type: 'task',
    summary: newTitle.value,
    milestoneId: selectedMilestoneId.value,
    goalId: selectedMilestoneId.value
      ? scheduleStore.milestones.find((m) => m.id === selectedMilestoneId.value)
          ?.goalId
      : null,
    startDate: scheduleStore.selectedDate,
    endDate: undefined
  })

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

  flex-shrink: 0;
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

.quick-input::placeholder {
  color: var(--text-muted);
}

.input-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.quick-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: var(--space-2);
  padding-right: 48px; /* 카운터 공간 확보 */
  font-size: var(--text-sm);
  color: var(--text-main);
  outline: none;
}

.char-count {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--text-muted);
  pointer-events: none;
}
/* =======================================
   ACTIONS
======================================= */
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-1);

  flex-shrink: 0;
}
/* 💡 TIP: BaseButton 내부의 세부 레이아웃 보정이 필요하다면 여기서 제어합니다. */
:deep(.base-button) {
  font-weight: var(--font-bold);
}
</style>
