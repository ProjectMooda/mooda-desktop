<template>
  <button
    class="x-btn flex-center"
    :class="[
      variantClass,
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
type Intent = 'close' | 'delete'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    intent?: Intent
    reveal?: boolean
  }>(),
  {
    variant: 'rounded',
    intent: 'close',
    reveal: false
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClass = computed(() => ({
  'variant-circle': props.variant === 'circle',
  'variant-rounded': props.variant === 'rounded'
}))

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

/* modal close */
.variant-circle {
  width: 32px;
  height: 32px;

  border-radius: 50%;
  font-size: 16px;
}

/* list delete */
.variant-rounded-sm {
  width: 24px;
  height: 24px;

  border-radius: 6px;
  font-size: 14px;
}

.variant-rounded-md {
  width: 24px;
  height: 24px;

  border-radius: 6px;
  font-size: 14px;
}

.variant-rounded-lg {
}

/* =======================================
   INTENT
======================================= */

/* neutral close */
.intent-close {
  background: transparent;
  color: var(--text-muted, #a1a1aa);
}

.intent-close:hover {
  color: var(--color-danger, #ef4444);
  background-color: var(--color-danger-light, #fee2e2);
}

/* destructive delete */
.intent-delete {
  background: #fee2e2;
  color: #ef4444;
}

.intent-delete:hover {
  background: #fca5a5;
  color: #dc2626;
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
