<template>
  <input
    type="checkbox"
    :class="['base-checkbox', `ui-size-${size}`, 'is-icon-only']"
    :checked="modelValue"
    :disabled="disabled"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    size?: 1 | 2 | 3 | 4 | 5
    disabled?: boolean
  }>(),
  {
    size: 3,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped>
/* =======================================
   공통 베이스 (크기 관련 CSS 전면 삭제!)
======================================= */
.base-checkbox {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  vertical-align: middle;
}

.base-checkbox:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: var(--bg-app);
}

.base-checkbox:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* =======================================
   체크 상태 & 아이콘 (크기에 맞춰 자동 비율 조절)
======================================= */
.base-checkbox:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.base-checkbox:checked::after {
  content: '';
  display: block;
  /* 부모(ui-size-N)의 넓이/높이에 비례해서 크기 결정 */
  width: 30%;
  height: 60%;
  border: solid var(--bg-card);
  /* 부모(ui-size-N)의 폰트 사이즈(em)에 비례해서 두께 자동 조절! */
  border-width: 0 0.15em 0.15em 0;
  transform: translateY(-10%) rotate(45deg);
}
</style>
