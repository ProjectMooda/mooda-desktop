<template>
  <BaseInput
    :model-value="modelValue"
    field="search"
    :placeholder="placeholder"
    class="custom-search-input"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prefix>
      <span class="search-icon">🔍</span>
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import BaseInput from '../Input/BaseInput.vue'

defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '검색어를 입력하세요...'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* 절대 위치(position: absolute)나 여백 계산이 더 이상 필요 없습니다! */
.search-icon {
  font-size: var(--text-sm);
  color: var(--text-muted);
  /* BaseInput 내부 gap이 있으므로 별도의 마진을 줄 필요가 없습니다 */
}

*
  만약
  검색바의
  높이나
  폰트
  크기를
  다르게
  하고
  싶다면
  */
  .custom-search-input
  :deep(.base-input) {
  font-size: var(--text-sm);
}
</style>
