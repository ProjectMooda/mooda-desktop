<template>
  <button
    class="x-btn flex-center"
    :class="[
      variantClass,
      sizeClass,
      intentClass,
      {
        'hover-reveal': reveal
      }
    ]"
    @click="$emit('click', $event)"
  >
    <slot>✕</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'circle' | 'rounded'
type Size = 'xs' | 'sm' | 'md' | 'lg'
type Intent = 'close' | 'delete'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    intent?: Intent
    reveal?: boolean
  }>(),
  {
    variant: 'rounded',
    size: 'md',
    intent: 'close',
    reveal: false
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

/* =======================================
   VARIANT
======================================= */

const variantClass = computed(() => ({
  'variant-circle': props.variant === 'circle',
  'variant-rounded': props.variant === 'rounded'
}))

/* =======================================
   SIZE
======================================= */

const sizeClass = computed(() => ({
  'size-xs': props.size === 'xs',
  'size-sm': props.size === 'sm',
  'size-md': props.size === 'md',
  'size-lg': props.size === 'lg'
}))

/* =======================================
   INTENT
======================================= */

const intentClass = computed(() => ({
  'intent-close': props.intent === 'close',
  'intent-delete': props.intent === 'delete'
}))
</script>

<style scoped>
/* =======================================
   BASE STYLE
======================================= */

.x-btn {
  border: none;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  transition:
    opacity 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

/* =======================================
   VARIANT
======================================= */

.variant-circle {
  border-radius: 50%;
}

.variant-rounded {
  border-radius: var(--radius-sm);
}

/* =======================================
   SIZE
======================================= */

.size-xs {
  width: var(--control-size-xs);
  height: var(--control-size-xs);
  font-size: 12px;
}

.size-sm {
  width: var(--control-size-sm);
  height: var(--control-size-sm);
  font-size: 14px;
}

.size-md {
  width: var(--control-size-md);
  height: var(--control-size-md);
  font-size: 16px;
}

.size-lg {
  width: var(--control-size-lg);
  height: var(--control-size-lg);
  font-size: 18px;
}

/* =======================================
   INTENT
======================================= */

/* neutral close */
.intent-close {
  background: transparent;
  color: var(--text-muted);
}

.intent-close:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-light);
}

/* destructive delete */
.intent-delete {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.intent-delete:hover {
  opacity: 0.85;
}

/* =======================================
   HOVER REVEAL
======================================= */

.hover-reveal {
  opacity: 0;
  pointer-events: none;

  transform: translateY(2px);
}

:deep(.compact-card:hover .hover-reveal) {
  opacity: 1;
  pointer-events: auto;

  transform: translateY(0);
}
</style>