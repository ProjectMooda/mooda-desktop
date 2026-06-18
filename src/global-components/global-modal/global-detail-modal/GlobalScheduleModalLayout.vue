<template>
  <Modal
    :model-value="isOpen"
    :title="title"
    :size="2"
    :show-header="showHeader"
    @close="handleClose"
  >
    <div class="schedule-scroll-wrapper">
      <slot></slot>
    </div>

    <template #footer>
      <div class="footer-actions">
        <div class="action-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="action-right">
          <slot name="footer-right"></slot>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '../components/Modal.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    width?: string
    showHeader?: boolean
  }>(),
  {
    title: '',
    width: '540px',
    showHeader: true
  }
)

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* =======================================
   공통 레이아웃 (세련된 여백과 정돈된 선)
======================================= */
.schedule-scroll-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 70vh;
  overflow-y: auto;
  padding: 12px;
}

/* 모든 섹션 카드화 */
:deep(.form-section) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-1);
  transition: all 0.2s ease;
}

:deep(.form-section:hover) {
  border-color: var(--color-primary-light);
}

:deep(.section-label) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
