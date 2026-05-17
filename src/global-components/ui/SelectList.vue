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

const props = defineProps<{
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
  outline: none;
  box-sizing: border-box;
  transition: all var(--transition-fast);
  background: var(--bg-app);
  color: var(--text-main);
  cursor: pointer;
}

.select-list:focus {
  border-color: var(--color-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>
