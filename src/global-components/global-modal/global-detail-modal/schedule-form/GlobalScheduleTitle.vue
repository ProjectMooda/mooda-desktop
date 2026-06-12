<template>
  <div class="title-row">
    <BaseInput
      v-model="modelValue"
      field="taskTitle"
      :placeholder="placeholder"
      :size="5"
      autofocus
      class="title-input-wrapper flex-1 min-w-0"
    >
      <template #prefix>
        <i class="ti ti-pencil title-icon" aria-hidden="true"></i>
      </template>
    </BaseInput>

    <span
      v-show="charCount > 15"
      class="char-count tabular-nums shrink-0"
      :class="charCount >= 20 ? 'text-danger' : 'text-muted'"
    >
      {{ charCount }} / 20
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '@/base-ui/BaseInput.vue'

const modelValue = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()

const charCount = computed(() =>
  modelValue.value ? modelValue.value.length : 0
)
</script>

<style scoped>
/* 부모(Modal)의 패딩을 따르도록 하드코딩된 여백 제거 */
.title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-2, 24px); /* 아래쪽 여백만 주어 본문과 분리 */
}

/* =======================================
   내부 Input 텍스트 (문서 제목처럼 크고 굵게)
======================================= */
.title-input-wrapper :deep(.base-input) {
  font-size: var(--text-2xl, 24px); /* 기존 17px에서 24px로 확 키움 */
  font-weight: var(--font-bold, 700);
  color: var(--text-main);
  padding: 0;
}

.title-input-wrapper :deep(.base-input::placeholder) {
  color: var(--border-color); /* 플레이스홀더를 더 연하게 (선택사항) */
  font-weight: var(--font-semibold, 600);
}

/* =======================================
   아이콘 & 카운터
======================================= */
.title-icon {
  font-size: var(--text-xl, 20px);
  color: var(--text-muted);
  margin-right: var(--space-2, 8px);
}

.char-count {
  font-size: var(--text-xs, 12px);
  transition: color 0.2s ease;
}
</style>
