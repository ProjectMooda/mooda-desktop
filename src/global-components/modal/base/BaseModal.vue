<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay flex-center"
        @click.self="handleClose"
      >
        <div class="modal-container" :style="modalStyle">
          <!-- HEADER -->
          <header v-if="showHeader" class="modal-header shrink-0">
            <slot name="header">
              <h2 class="modal-title">
                {{ title }}
              </h2>

              <Xbutton
                variant="circle"
                size="md"
                intent="close"
                @click="handleClose"
              />
            </slot>
          </header>

          <!-- BODY -->
          <div
            class="modal-body flex-1 min-h-0"
            :class="{ 'no-padding': noPadding }"
          >
            <slot />
          </div>

          <!-- FOOTER -->
          <footer v-if="$slots.footer" class="modal-footer shrink-0">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import Xbutton from '@/global-ui/Xbutton.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string
    height?: string
    showHeader?: boolean
    noPadding?: boolean
    closeOnOverlay?: boolean
    closeOnEsc?: boolean
  }>(),
  {
    modelValue: true,
    title: '',
    width: '400px',
    height: 'auto',
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
   MODAL STYLE
======================================= */

const modalStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

/* =======================================
   CLOSE
======================================= */

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/* =======================================
   ESC CLOSE
======================================= */

function handleKeydown(event: KeyboardEvent) {
  if (!props.closeOnEsc) return

  if (event.key === 'Escape') {
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
  /* 기존 9999 대신 변수로 관리하여 Z-index 꼬임 방지 */
  z-index: var(--z-modal);
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
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.04); /* 모달 특유의 아주 얇은 외곽선 유지 */
  overflow: hidden;
  max-width: 95vw;
  max-height: 95vh;
}

/* =======================================
   HEADER
======================================= */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 20px 24px -> 변수 매핑 */
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  /* 18px 700 -> 변수 매핑 */
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
}

/* =======================================
   BODY
======================================= */
.modal-body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* 24px -> 변수 매핑 */
  padding: var(--space-6);
}

.no-padding {
  padding: 0;
}

/* =======================================
   FOOTER
======================================= */
.modal-footer {
  /* 20px 24px -> 변수 매핑 */
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--border-color);
}

/* =======================================
   ANIMATION (트랜지션 변수 활용)
======================================= */
.modal-fade-enter-active,
.modal-fade-leave-active {
  /* 0.25s -> 시스템 공통 전환 속도로 통일 */
  transition: opacity var(--transition-base);
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  /* 큐빅 베지어(부드러운 텐션)는 모달 고유의 느낌을 위해 유지하되, 시간은 변수화 */
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
