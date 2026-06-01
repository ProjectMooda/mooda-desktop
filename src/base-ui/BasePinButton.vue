<template>
  <button
    type="button"
    class="pin-btn"
    :class="{ 'is-pinned': isPinned }"
    @click.stop="$emit('toggle')"
  >
    <!-- 나중에 📌 이모지 대신 SVG 아이콘으로 바꿀 때 여기만 수정하면 됩니다! -->
    📌
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isPinned?: boolean // 고정 여부
}>()

defineEmits(['toggle']) // 클릭 이벤트 (상위로 전달)
</script>
<style scoped>
.pin-btn {
  background: transparent;
  border: none;
  cursor: pointer;

  /* 초기 상태: 애플 서브 텍스트 컬러 및 반투명 처리 */
  color: var(--text-sub);
  opacity: 0.4;

  /* 공통 유틸리티 속성 내재화 및 패딩 변수화 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1); /* 4px */

  /* 둥근 모서리 및 배경 호버 효과를 위한 세팅 */
  border-radius: var(--radius-sm);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    opacity var(--transition-fast);
}

/* 마우스 호버 시: 과한 크기 변화 대신 은은한 배경색과 선명도 제공 */
.pin-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
  opacity: 0.8;
}

/* 핀이 활성화(고정)되었을 때: 애플 시그니처 블루 컬러 적용 및 선명도 100% */
.pin-btn.is-pinned {
  color: var(--color-primary);
  opacity: 1;
}

/* 핀이 활성화된 상태에서 호버했을 때 굳이 배경이 회색으로 바뀌지 않도록 처리 */
.pin-btn.is-pinned:hover {
  background-color: transparent;
}
</style>
