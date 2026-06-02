<template>
  <select
    :class="['base-select w-full', `ui-size-${size}`]"
    :value="modelValue"
    :disabled="disabled"
    @change="handleChange"
  >
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
export interface SelectOption {
  label: string
  value: string | number | null
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined
    options: SelectOption[]
    size?: 1 | 2 | 3 | 4 | 5 // ✨ 전역 스케일 적용
    disabled?: boolean
  }>(),
  {
    size: 3, // 기본 크기 (Medium)
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const targetValue = target.value

  const selectedOption = props.options.find(
    (opt) => String(opt.value) === targetValue
  )

  emit('update:modelValue', selectedOption ? selectedOption.value : targetValue)
}
</script>

<style scoped>
/* =======================================
   BASE STYLE (크기 관련 코드는 전역으로 위임)
======================================= */
.base-select {
  /* 브라우저 기본 UI 제거 */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);

  /* ui-size-N에서 크기를 상속받기 위한 세팅 */
  font-family: inherit;
  cursor: pointer;
  outline: none;

  /* 전역 트랜지션 적용 */
  transition: all var(--transition-base);

  /* 🌟 커스텀 화살표 (SVG의 stroke 색상을 디자인 시스템의 --text-sub(#86868b) 컬러로 변경) */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: var(--space-4);

  /* ✨ ui-size-N 이 부여하는 기본 padding을 덮어써서 화살표 공간 강제 확보 */
  padding-right: var(--control-h-3) !important;
}

/* =======================================
   FOCUS & DISABLED STATES (BaseInput과 통일)
======================================= */
.base-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-app);
}
</style>
