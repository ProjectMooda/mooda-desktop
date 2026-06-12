<template>
  <div
    :class="[
      'base-input-wrapper w-full',
      `ui-size-${size}`,
      `variant-${variant}`
    ]"
  >
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
      @keyup.enter="blurInput"
    />

    <span
      v-if="!hideCounter && variant !== 'inline'"
      class="char-counter shrink-0 text-xs"
      :class="currentLength >= maxLength * 0.9 ? 'is-danger' : 'is-safe'"
    >
      {{ currentLength }} / {{ maxLength }}
    </span>

    <span v-if="variant === 'inline'" class="inline-edit-icon shrink-0">
      ✏️
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
    size?: 1 | 2 | 3 | 4 | 5
    variant?: 'default' | 'ghost' | 'inline' // ✨ 'inline' 추가
    hideCounter?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '',
    size: 3,
    variant: 'default',
    hideCounter: false
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

// ✨ 엔터키 입력 시 자동으로 포커스 해제하여 수정 완료 느낌 주기
const blurInput = (e: KeyboardEvent) => {
  ;(e.target as HTMLElement)?.blur()
}
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  align-items: center;
  overflow: hidden;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base),
    transform var(--transition-base);
}

/* =======================================
   1. Default 테마
======================================= */
.variant-default {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-1);
}
.variant-default:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px var(--color-primary-light),
    var(--shadow-2);
  transform: translateY(-1px);
}

/* =======================================
   2. Ghost 테마 (단순 투명 폼)
======================================= */
.variant-ghost {
  background-color: transparent;
  border: 1px solid transparent;
  box-shadow: none;
}
.variant-ghost:hover {
  background-color: var(--bg-hover);
}
.variant-ghost:focus-within {
  background-color: var(--bg-card);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* =======================================
   🌟 3. Inline 테마 (텍스트처럼 보이다가 폼으로 변신)
======================================= */
.variant-inline {
  background-color: transparent;
  border: 1px solid transparent;
  box-shadow: none;
  border-radius: var(--radius-md);
}
.variant-inline:hover {
  background-color: var(--bg-hover);
}
.variant-inline:focus-within {
  background-color: var(--bg-card);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.variant-inline .base-input {
  cursor: pointer;
  text-overflow: ellipsis;
  font-weight: var(--font-bold);
}
.variant-inline:focus-within .base-input {
  cursor: text;
}
.variant-inline .base-input::placeholder {
  font-weight: normal;
  color: var(--text-muted);
}

/* Inline 테마 전용 연필 아이콘 애니메이션 */
.inline-edit-icon {
  font-size: var(--text-sm);
  margin-left: var(--space-2);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}
.variant-inline:hover .inline-edit-icon {
  opacity: 0.5;
}
.variant-inline:focus-within .inline-edit-icon {
  opacity: 0 !important; /* 포커스 시 완벽하게 숨김 */
}

/* =======================================
   공통 내부 Input
======================================= */
.base-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  padding: 0;
  font-family: inherit;
  font-size: inherit;
}
.base-input::placeholder {
  color: var(--text-muted);
}

.char-counter {
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
