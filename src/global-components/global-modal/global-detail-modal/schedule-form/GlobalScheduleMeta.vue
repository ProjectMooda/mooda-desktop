<template>
  <div class="form-section">
    <div class="section-label">카테고리 & 중요도</div>
    <div class="input-grid">
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
        <BaseSelectList
          v-model="category"
          :options="categoryOptions"
          class="styled-select"
        />
      </div>
      <div class="input-col">
        <span class="sub-label"><i class="ti ti-flag"></i> 중요도</span>
        <BaseSelectList
          v-model="priority"
          :options="priorityOptions"
          class="styled-select"
        />
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
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
/* BaseSelectList 내부 스타일을 칩(Chip) 디자인과 유사하게 덮어쓰기 */
.styled-select :deep(select),
.styled-select :deep(.select-trigger) {
  border-radius: var(--radius-md);
  border: 0.5px solid var(--border-color);
  background: var(--bg-card);
  font-size: 13px;
  padding: 8px 12px;
  transition: border-color 0.15s;
}
.styled-select :deep(select:hover),
.styled-select :deep(.select-trigger:hover) {
  border-color: var(--color-primary-light);
}
</style>
