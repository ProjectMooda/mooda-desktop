<!-- src/components/ui/Checkbox.vue -->
<template>
  <input
    type="checkbox"
    class="custom-checkbox"
    :checked="modelValue"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped>
.custom-checkbox {
  /* variables.css의 컨트롤 크기 활용 (20px) */
  width: var(--control-size-xs);
  height: var(--control-size-xs);

  /* 애플 시그니처 블루로 체크 색상 변경 */
  accent-color: var(--color-primary);

  /* 마우스 커서 및 기본 정렬 정돈 */
  cursor: pointer;
  vertical-align: middle;
  margin: 0; /* 브라우저 기본 마진 제거로 정렬 꼬임 방지 */
}
</style>
