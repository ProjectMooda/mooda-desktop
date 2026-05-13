<template>
  <transition name="modal-fade">
    <div class="modal-overlay flex-center" @click.self="$emit('close')">
      <div 
        class="modal-content" 
        :style="{ width: width, height: height, padding: noPadding ? '0' : '' }"
      >
        <!-- showHeader가 true일 때만 헤더 렌더링 -->
        <header v-if="showHeader" class="modal-header shrink-0">
          <slot name="header">
            <h2>{{ title }}</h2>
          </slot>
          <button class="btn-close flex-center" @click="$emit('close')">
            ✕
          </button>
        </header>

        <div class="modal-body-container flex-1 min-h-0" :class="{ 'p-0': noPadding }">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: '모달 창' },
  width: { type: String, default: '400px' },
  height: { type: String, default: 'auto' },
  // 유연성을 위한 Props 추가
  showHeader: { type: Boolean, default: true }, // 헤더 숨김 여부
  noPadding: { type: Boolean, default: false }  // 바디 여백 제거 여부 (필요시)
})

defineEmits(['close'])
</script>

<style scoped>
/* =======================================
   오버레이 (배경 블러 처리)
======================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4); /* 너무 어둡지 않게 조절 */
  z-index: 9999;
  backdrop-filter: blur(8px); /* 애플 감성에 맞게 블러 강도 증가 */
  -webkit-backdrop-filter: blur(8px);
}

/* =======================================
   모달 컨텐츠 (카드)
======================================= */
.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl); /* 20px(Apple Style) 변수 사용 */
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg); /* 시스템 그림자 변수 사용 */
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  /* 애플 모달 특유의 은은한 외곽선 (입체감 부여) */
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* =======================================
   모달 헤더
======================================= */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color); /* 변수 사용 */
}
.modal-header h2 { 
  margin: 0; 
  font-size: 18px; 
  font-weight: 700; 
  color: var(--text-main); /* 먹색 텍스트 */
}

/* 닫기 버튼 (애플 스타일의 원형 배경 호버) */
.btn-close { 
  background: transparent; 
  border: none; 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; /* 완전한 원형 */
  font-size: 16px; 
  cursor: pointer; 
  color: var(--text-muted); 
  transition: all 0.2s ease;
}

.btn-close:hover { 
  color: var(--color-danger); 
  background-color: var(--color-danger-light); /* 경고성 연한 배경 */
}

/* =======================================
   모달 바디
======================================= */
.modal-body-container {
  overflow-y: auto; 
  display: flex;
  flex-direction: column;
}

/* =======================================
   애플 스타일 전환 애니메이션 (Scale + Fade)
======================================= */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); /* 튕기듯 자연스러운 가속도 */
}

/* 나타나기 전 / 사라진 후 상태 */
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.95); /* 살짝 작아진 상태에서 커지면서 나타남 */
}
</style>