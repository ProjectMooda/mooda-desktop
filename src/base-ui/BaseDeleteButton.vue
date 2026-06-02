<template>
  <button
    :class="[
      'base-x-btn',
      `ui-size-${size}`,
      'is-icon-only',
      `variant-${variant}`,
      `intent-${intent}`,
      { 'hover-reveal': reveal }
    ]"
    @click="$emit('click', $event)"
  >
    <slot>✕</slot>
  </button>
</template>

<script setup lang="ts">
/**
 * BaseDeleteButton / XButton
 * 삭제 또는 닫기를 수행하는 공통 아이콘 버튼
 */
withDefaults(
  defineProps<{
    variant?: 'circle' | 'rounded'
    size?: 1 | 2 | 3 | 4 | 5 // xs, sm, md, lg -> 1~5 스케일로 통합
    intent?: 'close' | 'delete'
    reveal?: boolean
  }>(),
  {
    variant: 'rounded',
    size: 3, // 기본 크기 Base (Medium)
    intent: 'close',
    reveal: false
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<style scoped>
/* =======================================
   BASE STYLE (크기 관련 속성 전면 삭제)
======================================= */
.base-x-btn {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  margin: 0;
  outline: none;

  /* 전역 전환 효과 적용 (전체 속성을 all로 묶어서 간결화) */
  transition: all var(--transition-fast);
}

/* BaseButton처럼 누를 때 살짝 들어가는 애플 특유의 쫀득한 텐션 */
.base-x-btn:active {
  transform: scale(0.92);
}

/* =======================================
   VARIANT (형태)
======================================= */
.variant-circle {
  border-radius: 50%; /* 완전한 원형 */
}
/* variant-rounded는 ui-size-N의 기본 radius(sm~lg)를 그대로 상속받으므로 생략 가능 */

/* =======================================
   INTENT (의도 / 색상)
======================================= */
/* 1. 중립적인 닫기 (Close) */
.intent-close {
  background-color: transparent;
  color: var(--text-muted);
}
.intent-close:hover {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

/* 2. 파괴적인 삭제 (Delete) - 하드코딩 Hex 삭제 */
.intent-delete {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}
.intent-delete:hover {
  /* 더 진한 핑크 대신, 진짜 danger 컬러로 전환되며 흰 텍스트로 대비 강조 */
  background-color: var(--color-danger);
  color: var(--bg-card);
}

/* =======================================
   HOVER REVEAL (부드러운 이징)
======================================= */
.hover-reveal {
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-base);
  transform: translateY(2px);
}

/* 부모(.compact-card 등)에 마우스를 올렸을 때 나타나는 효과 
   전역 시스템에 맞춰 :global 활용 */
:global(.compact-card:hover) .hover-reveal,
:global(.hover-trigger:hover) .hover-reveal {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
</style>
