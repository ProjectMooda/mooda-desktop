<template>
  <div class="title-row">
    <i class="ti ti-pencil title-icon" aria-hidden="true"></i>
    <input
      v-model="modelValue"
      type="text"
      class="title-input"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.title-icon {
  font-size: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
  opacity: 0.7;
  margin-bottom: 1px; /* 베이스라인 미세 정렬 */
}

.title-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  font-family: inherit;
  padding: 4px 0;
  line-height: 1.3;
}

.title-input::placeholder {
  color: var(--text-muted);
  font-weight: 500;
}
</style>
