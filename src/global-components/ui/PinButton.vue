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
  opacity: 0.3;
  filter: grayscale(1);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

/* 핀이 꽂혀있을 때 */
.pin-btn.is-pinned {
  opacity: 1;
  filter: grayscale(0);
}

/* 마우스 호버 시 살짝 커지는 애니메이션 (선택사항) */
.pin-btn:hover {
  transform: scale(1.1);
}
</style>
