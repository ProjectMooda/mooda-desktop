<template>
  <BaseInput
    :model-value="modelValue"
    field="search"
    :placeholder="placeholder"
    :size="size"
    class="custom-search-input"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prefix>
      <span class="search-icon">🔍</span>
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import BaseInput from '../../base-ui/BaseInput.vue'

defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '검색어를 입력하세요...'
  },
  // 2. BaseInput과 동일한 타입으로 size prop을 정의합니다.
  size: {
    type: Number as () => 1 | 2 | 3 | 4 | 5,
    default: 3
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* BaseInput에서 이미 모든 레이아웃, 여백, 폰트 상속(inherit)을 처리하므로,
  아이콘의 색상 정도만 지정해주면 됩니다. */
.search-icon {
  color: var(--text-muted);
  /* 돋보기 아이콘 크기도 BaseInput의 font-size: inherit 영향으로 자동 조절됩니다. */
}
</style>
