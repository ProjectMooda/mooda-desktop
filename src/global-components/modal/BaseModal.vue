<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay flex-center"
        @click.self="handleClose"
      >
        <div
          class="modal-container"
          :style="modalStyle"
        >
          <!-- HEADER -->
          <header
            v-if="showHeader"
            class="modal-header shrink-0"
          >
            <slot name="header">
              <h2 class="modal-title">
                {{ title }}
              </h2>

              <XButton
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
          <footer
            v-if="$slots.footer"
            class="modal-footer shrink-0"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

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
   OVERLAY
======================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* =======================================
   CONTAINER
======================================= */

.modal-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.04);
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
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

/* =======================================
   BODY
======================================= */

.modal-body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
}

.no-padding {
  padding: 0;
}

/* =======================================
   FOOTER
======================================= */

.modal-footer {
  padding: 20px 24px;

  border-top: 1px solid var(--border-color);
}

/* =======================================
   ANIMATION
======================================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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