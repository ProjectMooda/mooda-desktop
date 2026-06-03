<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay flex-center"
        @click.self="handleClose"
      >
        <div class="modal-container shadow-3" :class="`modal-size-${size}`">
          <header v-if="showHeader" class="modal-header shrink-0">
            <slot name="header">
              <h2 class="modal-title">
                {{ title }}
              </h2>

              <BaseDeleteButton
                variant="circle"
                :size="2"
                intent="close"
                @click="handleClose"
              />
            </slot>
          </header>

          <div
            class="modal-body flex-1 min-h-0"
            :class="{ 'no-padding': noPadding }"
          >
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer shrink-0">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    size?: 1 | 2 | 3 // ✨ 기존 width, height를 제거하고 1~3단계 스케일로 통합
    showHeader?: boolean
    noPadding?: boolean
    closeOnOverlay?: boolean
    closeOnEsc?: boolean
  }>(),
  {
    modelValue: true,
    title: '',
    size: 2, // 기본 모달 크기 (600px - 일반 입력 폼 용도)
    showHeader: true,
    noPadding: false,
    closeOnOverlay: true,
    closeOnEsc: true
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:modelValue', value: boolean): void
}>()

/* =======================================
   CLOSE LOGIC
======================================= */
function handleClose() {
  // closeOnOverlay 옵션이 false면 배경을 눌러도 닫히지 않게 방어
  if (!props.closeOnOverlay) return

  emit('update:modelValue', false)
  emit('close')
}

/* =======================================
   ESC CLOSE LOGIC
======================================= */
function handleKeydown(event: KeyboardEvent) {
  if (!props.closeOnEsc) return
  if (event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* =======================================
   OVERLAY (배경 딤 처리)
======================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal-bg); /* 배경 딤 전용 Z-index */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* =======================================
   CONTAINER (모달 창 본체)
======================================= */
.modal-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-xl);

  /* 모달 특유의 아주 얇은 외곽선 유지 */
  border: 1px solid rgba(0, 0, 0, 0.04);

  overflow: hidden;
  max-width: 95vw;
  max-height: 95vh;
  z-index: var(--z-modal);
}

/* =======================================
   내부 영역 (Header / Body / Footer)
======================================= */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
}

.modal-body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--space-6);
}

.modal-body.no-padding {
  padding: 0;
}

.modal-footer {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-app); /* 푸터 영역 배경 살짝 다르게 */
}

/* =======================================
   ANIMATION (트랜지션 변수 활용)
======================================= */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base);
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  /* 큐빅 베지어(부드러운 텐션) 유지 */
  transition: transform var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.96);
}
</style>
