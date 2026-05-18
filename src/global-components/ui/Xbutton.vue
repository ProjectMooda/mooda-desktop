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
  background: transparent; /* 초기화 누락 방지 */
  color: inherit; /* 부모 컬러 상속 */
  cursor: pointer;
  padding: 0;
  margin: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 포커스 시 튀어나오는 브라우저 기본 아웃라인 정리 */
  outline: none;

  /* 공통 transition 변수 활용 및 속성 최적화 */
  transition:
    opacity var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
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
   SIZE (텍스트 스케일 변수화)
======================================= */
.size-xs {
  width: var(--control-size-xs);
  height: var(--control-size-xs);
  font-size: var(--text-xs); /* 12px */
}

.size-sm {
  width: var(--control-size-sm);
  height: var(--control-size-sm);
  font-size: var(--text-sm); /* 14px */
}

.size-md {
  width: var(--control-size-md);
  height: var(--control-size-md);
  font-size: var(--text-base); /* 16px */
}

.size-lg {
  width: var(--control-size-lg);
  height: var(--control-size-lg);
  font-size: var(--text-lg); /* 18px */
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
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

/* 애플 스타일 특유의 자연스러운 호버: opacity보다는 살짝 짙어지는 느낌이나 덜어내는 느낌 선호 */
.intent-delete:hover {
  background-color: #fddcd9; /* danger-light보다 살짝 더 짙은 핑크톤 피드백 */
}

/* =======================================
   HOVER REVEAL (자연스러운 이징 적용)
======================================= */
.hover-reveal {
  opacity: 0;
  pointer-events: none;
  /* 부드러운 애플 아웃 효과(cubic-bezier) 변수 적용 */
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
  transform: translateY(2px);
}

:deep(.compact-card:hover .hover-reveal) {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
</style>
