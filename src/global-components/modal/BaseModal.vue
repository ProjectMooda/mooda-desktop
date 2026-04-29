<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div 
        class="modal-content" 
        :style="{ width: width, height: height }"
      >
        <header class="modal-header">
          <slot name="header">
            <h2>{{ title }}</h2>
          </slot>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body-container">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
// 부모로부터 넓이, 높이, 제목을 받습니다.
defineProps({
  title: { type: String, default: '모달 창' },
  width: { type: String, default: '400px' }, // 기본값 400px
  height: { type: String, default: 'auto' }  // 기본값 auto
})

defineEmits(['close'])
</script>

<style scoped>
/* 오버레이 (아까 만든 전역 CSS 역할까지 여기서 다 처리합니다) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* 모달 껍데기 기본 스타일 */
.modal-content {
  background: var(--bg-card, #ffffff);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  /* 반응형 방어 로직: 화면보다 커지지 않게 제한 */
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-color, #e4e4e7);
  flex-shrink: 0;
}
.modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; }
.btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #a1a1aa; }
.btn-close:hover { color: #ef4444; }

.modal-body-container {
  flex: 1;
  overflow-y: auto; /* 내용이 길면 내부에서 스크롤 */
  display: flex;
  flex-direction: column;
}

/* 전환 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>