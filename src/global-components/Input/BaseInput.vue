<script setup lang="ts">
import { ref, computed } from 'vue'
import { INPUT_MAX_LENGTH } from '@/constants/validation'

type FieldType = keyof typeof INPUT_MAX_LENGTH

const props = withDefaults(
  defineProps<{
    modelValue?: string
    field: FieldType
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const maxLength = computed(() => INPUT_MAX_LENGTH[props.field])

const currentLength = computed(() => (props.modelValue || '').length)

const isFocused = ref(false)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="input-container w-full" :class="{ 'is-focused': isFocused }">
    <div v-if="$slots.prefix" class="prefix-wrapper">
      <slot name="prefix"></slot>
    </div>

    <input
      type="text"
      :value="modelValue"
      :maxlength="maxLength"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :placeholder="placeholder"
      class="base-input text-sm"
    />

    <span
      class="char-counter text-xs"
      :class="currentLength >= maxLength * 0.9 ? 'is-danger' : 'is-safe'"
    >
      {{ currentLength }} / {{ maxLength }}
    </span>
  </div>
</template>

<style scoped>
/* 알약 형태 컨테이너 */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);

  padding: var(--space-3) 65px var(--space-3) var(--space-4);

  border-radius: var(--radius-xl);

  background-color: var(--bg-card);
  border: 1px solid rgba(0, 0, 0, 0.03);

  box-shadow: var(--shadow-sm);

  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

/* 포커스 상태 */
.input-container.is-focused {
  border-color: var(--color-primary);

  box-shadow:
    0 0 0 3px var(--color-primary-light),
    var(--shadow-md);

  transform: translateY(-1px);
}

.prefix-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 실제 input */
.base-input {
  flex: 1;
  width: 100%;

  background: transparent;
  border: none;
  outline: none;

  color: var(--text-main);

  padding: 0;
}

.base-input::placeholder {
  color: var(--text-muted);
}

/* 글자 수 카운터 */
.char-counter {
  position: absolute;
  right: var(--space-4);

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
