<template>
  <button
    :class="[
      'base-button',
      `size-${size}`,
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
/**
 * BaseButton.vue
 * 프로젝트 전역에서 사용하는 공통 버튼 컴포넌트
 */
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
   공통 베이스 스타일
======================================= */
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  white-space: nowrap;
}

.base-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.base-button:not(:disabled):active {
  transform: scale(0.96); /* 모든 버튼 공통 쫀득한 클릭감 */
}

/* =======================================
   크기 (Size 1 ~ 5)
======================================= */
/* Size 1: Micro (아이콘 버튼, 아주 작은 뱃지) */
.size-1 {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
}
.size-1.is-icon-only {
  padding: 4px;
  width: 24px;
  height: 24px;
}

/* Size 2: Small (탭, 프리셋, 작은 액션) */
.size-2 {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
}
.size-2.is-icon-only {
  padding: 6px;
  width: 28px;
  height: 28px;
}

/* Size 3: Medium (기본 UI 버튼, 목표 추가) */
.size-3 {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 99px; /* 알약 형태 */
}
.size-3.is-icon-only {
  padding: 8px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

/* Size 4: Large (타이머 초기화, 폼 제출) */
.size-4 {
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
}

/* Size 5: X-Large (타이머 메인 시작 버튼) */
.size-5 {
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 800;
  border-radius: 14px;
}

/* =======================================
   스타일 테마 (Variant)
======================================= */
/* 1. Primary: 핵심 액션 (검정 배경, 흰 글씨) */
.variant-primary {
  background-color: var(--text-main, #1d1d1f);
  color: #ffffff;
}
.variant-primary:not(:disabled):hover {
  background-color: #3a3a3c;
}

/* 2. Secondary: 보조 액션 (회색 배경, 짙은 글씨) - 기본값 */
.variant-secondary {
  background-color: var(--bg-hover, #f2f2f7);
  color: var(--text-muted, #8e8e93);
}
.variant-secondary:not(:disabled):hover {
  background-color: #e5e5ea;
  color: var(--text-sub, #3a3a3c);
}
.variant-secondary.is-active {
  background-color: var(--text-main, #1d1d1f);
  color: #ffffff;
}

/* 3. Ghost: 배경 없음 (탭 메뉴, 아이콘 버튼 등) */
.variant-ghost {
  background-color: transparent;
  color: var(--text-muted, #8e8e93);
}
.variant-ghost:not(:disabled):hover {
  background-color: var(--bg-hover, #f2f2f7);
  color: var(--text-main, #1d1d1f);
}
.variant-ghost.is-active {
  background-color: #ffffff;
  color: var(--text-main, #1d1d1f);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 4. Outline: 테두리만 */
.variant-outline {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--text-main, #1d1d1f);
}
.variant-outline:not(:disabled):hover {
  background-color: var(--bg-hover, #f2f2f7);
}

/* 5. Danger: 위험/경고 액션 */
.variant-danger {
  background-color: #ffe5e5;
  color: #e0352b;
}
.variant-danger:not(:disabled):hover {
  background-color: #ffcccc;
}
</style>
