<template>
  <select class="select-list" :value="modelValue" @change="handleChange">
    <!-- value가 null일 수도 있으므로 key에 String() 처리를 해줍니다 -->
    <option
      v-for="option in options"
      :key="String(option.value)"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
// 1. null을 허용하도록 타입 확장
export interface SelectOption {
  label: string
  value: string | number | null
}

const props = defineProps<{
  modelValue: string | number | null | undefined
  options: SelectOption[]
}>()

const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const targetValue = target.value

  // 2. HTML select가 강제로 string으로 바꾼 값을 원래 타입(number, null 등)으로 복원
  const selectedOption = props.options.find(
    (opt) => String(opt.value) === targetValue
  )

  emit('update:modelValue', selectedOption ? selectedOption.value : targetValue)
}
</script>

<style scoped>
.select-list {
  width: 100%;
  /* 화살표가 들어갈 우측 여백을 더 확보 (padding-right) */
  padding: var(--space-2) 36px var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--text-main);
  background-color: var(--bg-app);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;

  /* 브라우저 기본 화살표 스타일 제거 */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  /* 3. 🌟 커스텀 화살표(SVG)를 배경 이미지로 삽입 */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;

  /* transition 성능 최적화 */
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.select-list:focus {
  background-color: var(--bg-card);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>
