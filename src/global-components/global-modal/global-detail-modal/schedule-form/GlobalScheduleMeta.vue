<template>
  <div class="form-section">
    <div class="section-label">분류 & 중요도</div>
    <div class="input-stack">
      <div v-if="showGoal" class="input-col">
        <span class="sub-label"><i class="ti ti-target"></i> 목표 연결</span>
        <BaseSelectList
          v-model="goalId"
          :options="goalOptions"
          class="styled-select"
        />
      </div>

      <div class="input-col">
        <span class="sub-label"><i class="ti ti-tag"></i> 카테고리</span>
        <div class="chip-group">
          <button
            v-for="option in categoryOptions"
            :key="option.value"
            type="button"
            class="chip-btn"
            :class="{ active: category === option.value }"
            @click="category = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="input-col">
        <span class="sub-label"><i class="ti ti-flag"></i> 중요도</span>
        <div class="chip-group">
          <button
            v-for="option in priorityOptions"
            :key="option.value"
            type="button"
            class="chip-btn"
            :class="{ active: priority === option.value }"
            @click="priority = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSelectList from '@/base-ui/BaseSelectList.vue'
import { useScheduleOptions } from './composables/useScheduleOptions'

defineProps<{ showGoal?: boolean }>()

const category = defineModel<string>('category', { default: '' })
const priority = defineModel<string>('priority', { default: '' })
const goalId = defineModel<number | null>('goalId', { default: null })

const { goalOptions, categoryOptions, priorityOptions } = useScheduleOptions()
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* 각각의 요소를 위아래 행으로 배치되도록 수정 */
.input-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sub-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
}
.sub-label i {
  font-size: 14px;
}

/* 목표 연결을 위한 셀렉트 스타일 */
.styled-select :deep(select),
.styled-select :deep(.select-trigger) {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  font-size: 13px;
  padding: 0 12px;
  height: 32px;
  transition: border-color 0.15s;
}
.styled-select :deep(select:hover),
.styled-select :deep(.select-trigger:hover) {
  border-color: var(--color-primary-light);
}

/* ====== 노션 스타일 칩(버튼) ====== */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-sub);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
  color: var(--text-main);
}

/* 선택된(Active) 상태 */
.chip-btn.active {
  background: var(--color-primary-light, #e0e7ff);
  color: var(--color-primary, #4338ca);
  border-color: var(--color-primary, #4338ca);
  font-weight: 600;
}
</style>
