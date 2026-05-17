<!-- src/components/ui/CustomCheckbox.vue -->
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
  width: 20px;
  height: 20px;
  accent-color: #3b82f6;
  cursor: pointer;
}
</style>
