<template>
  <button
    :class="[
      'base-button',
      `ui-size-${size}`,
      `variant-${variant}`,
      { 'is-active': active },
      { 'is-icon-only': iconOnly }
    ]"
    :disabled="disabled"
    type="button"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
//BaseButton.vue
//프로젝트 전역에서 사용하는 공통 버튼 컴포넌트
withDefaults(
  defineProps<{
    size?: 1 | 2 | 3 | 4 | 5 // 1(제일 작음) ~ 5(제일 큼)
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' // 버튼 스타일
    active?: boolean // 탭 등에서 활성화 상태일 때
    disabled?: boolean // 비활성화
    iconOnly?: boolean // 아이콘만 들어갈 때 (정사각형 비율 보정)
  }>(),
  {
    size: 3, // 기본 크기 (Medium)
    variant: 'secondary', // 기본 테마 (회색 배경)
    active: false,
    disabled: false,
    iconOnly: false
  }
)
</script>

<style scoped>
/* =======================================
   공통 베이스 스타일 (크기 관련 CSS 전면 삭제)
======================================= */
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition: all var(--transition-base); /* 전역 트랜지션 변수 사용 */
}

.base-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.base-button:not(:disabled):active {
  transform: scale(0.96); /* 모든 버튼 공통 쫀득한 클릭감 */
}

/* =======================================
   스타일 테마 (Variant) 
======================================= */
/* 1. Primary: 핵심 액션 (검정 배경, 흰 글씨) */
.variant-primary {
  background-color: var(--text-main);
  color: var(--bg-card);
}
.variant-primary:not(:disabled):hover {
  opacity: 0.85; /* 하드코딩 컬러 대신 투명도로 부드러운 호버 구현 */
}

/* 2. Secondary: 보조 액션 (회색 배경, 짙은 글씨) - 기본값 */
.variant-secondary {
  background-color: var(--bg-hover);
  color: var(--text-muted);
}
.variant-secondary:not(:disabled):hover {
  background-color: var(--border-color);
  color: var(--text-sub);
}
.variant-secondary.is-active {
  background-color: var(--text-main);
  color: var(--bg-card);
}

/* 3. Ghost: 배경 없음 (탭 메뉴, 아이콘 버튼 등) */
.variant-ghost {
  background-color: transparent;
  color: var(--text-muted);
}
.variant-ghost:not(:disabled):hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
.variant-ghost.is-active {
  background-color: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-1); /* 전역 그림자 변수 */
}

/* 4. Outline: 테두리만 */
.variant-outline {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.variant-outline:not(:disabled):hover {
  background-color: var(--bg-hover);
}

/* 5. Danger: 위험/경고 액션 */
.variant-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}
.variant-danger:not(:disabled):hover {
  background-color: var(--color-danger);
  color: var(--bg-card);
}
</style>
