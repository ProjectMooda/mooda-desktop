<!-- 선택 리스트입니다. -->
<template>
  <select class="select-list" :value="modelValue" @change="handleChange">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number | undefined
  options: SelectOption[]
}>()

const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.select-list {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--text-main);
  background-color: var(--bg-app);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;

  /* 1. 브라우저 기본 화살표 스타일 제거 (iOS, OS X 최적화) */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  /* 2. transition 성능 최적화 (all 대신 변하는 속성만 지정) */
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.select-list:focus {
  background-color: var(--bg-card); /* 순백색으로 반전 */
  border-color: var(--color-primary);
  /* 은은하게 퍼지는 애플 스타일 포커스 링 */
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>
