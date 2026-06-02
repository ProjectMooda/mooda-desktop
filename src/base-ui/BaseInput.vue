<template>
  <div :class="['base-input-wrapper w-full', `ui-size-${size}`]">
    <div v-if="$slots.prefix" class="prefix-wrapper shrink-0 flex-center">
      <slot name="prefix"></slot>
    </div>

    <input
      type="text"
      :value="modelValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      class="base-input flex-1 min-w-0 h-full"
      @input="onInput"
    />

    <span
      class="char-counter shrink-0 text-xs"
      :class="currentLength >= maxLength * 0.9 ? 'is-danger' : 'is-safe'"
    >
      {{ currentLength }} / {{ maxLength }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { INPUT_MAX_LENGTH } from '@/constants/validation'

type FieldType = keyof typeof INPUT_MAX_LENGTH

const props = withDefaults(
  defineProps<{
    modelValue?: string
    field: FieldType
    placeholder?: string
    size?: 1 | 2 | 3 | 4 | 5 // ✨ 전역 스케일 적용
  }>(),
  {
    modelValue: '',
    placeholder: '',
    size: 3 // 기본 크기 (Medium)
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const maxLength = computed(() => INPUT_MAX_LENGTH[props.field])
const currentLength = computed(() => (props.modelValue || '').length)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
/* =======================================
   컨테이너 (크기, 패딩 관련 코드는 전역 시스템으로 이관)
======================================= */
.base-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-1);
  overflow: hidden;

  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

/* ✨ JS 변수(isFocused) 없이 CSS만으로 포커스 상태 완벽 제어 */
.base-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px var(--color-primary-light),
    var(--shadow-2);
  transform: translateY(-1px); /* 입력 시 살짝 떠오르는 고급스러운 효과 유지 */
}

/* =======================================
   내부 Input 필드
======================================= */
.base-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  padding: 0;
  /* 폰트 사이즈는 ui-size-N에서 부모에 준 값을 그대로 상속받음 */
  font-family: inherit;
  font-size: inherit;
}

.base-input::placeholder {
  color: var(--text-muted);
}

/* =======================================
   글자 수 카운터
======================================= */
.char-counter {
  /* 글로벌 css에 정의했지만, 명시성을 위해 한 번 더 보장 */
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  transition: color var(--transition-fast);
}

.char-counter.is-safe {
  color: var(--text-muted);
}

.char-counter.is-danger {
  color: var(--color-danger);
  font-weight: var(--font-bold);
}
</style>
