<template>
  <button
    type="button"
    :class="[
      'base-pin-btn',
      `ui-size-${size}`,
      'is-icon-only',
      { 'is-pinned': isPinned }
    ]"
    @click.stop="$emit('toggle')"
  >
    <slot>📌</slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isPinned?: boolean
    size?: 1 | 2 | 3 | 4 | 5
  }>(),
  {
    isPinned: false,
    size: 2 // 핀 버튼은 카드 구석이나 리스트에 작게 들어가는 경우가 많아 Size 2를 기본값으로 추천합니다.
  }
)

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped>
/* =======================================
   BASE STYLE (크기/레이아웃 전역 시스템 위임)
======================================= */
.base-pin-btn {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;

  color: var(--text-sub);
  opacity: 0.4;

  /* 개별 transition을 all로 묶어서 간결화 */
  transition: all var(--transition-fast);
}

/* BaseButton, XButton과 동일한 쫀득한 클릭 피드백 통일 */
.base-pin-btn:active {
  transform: scale(0.92);
}

/* =======================================
   HOVER & PINNED STATES
======================================= */
.base-pin-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
  opacity: 0.8;
}

.base-pin-btn.is-pinned {
  color: var(--color-primary);
  opacity: 1;
}

.base-pin-btn.is-pinned:hover {
  /* 기존에 주신 transparent도 좋지만, 
     애플 테마에 맞춰 아주 연한 블루 배경을 주면 클릭 영역 인지가 더 명확해집니다. */
  background-color: var(--color-primary-pale);
}
</style>
