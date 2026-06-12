<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay flex-center"
        @click.self="handleClose"
      >
        <div
          class="modal-container shadow-3 modal-size-1"
          :style="width ? { width: width } : {}"
        >
          <div class="modal-header">
            <h3 v-if="displayTitle" class="modal-title">{{ displayTitle }}</h3>
            <div v-else class="flex-1"></div>

            <BaseDeleteButton
              variant="circle"
              :size="2"
              intent="close"
              class="ml-auto"
              @click="handleClose"
            />
          </div>

          <div class="modal-body">
            <p v-if="displayMessage" class="alert-message">
              {{ displayMessage }}
            </p>
            <slot />
          </div>

          <div class="modal-footer flex justify-end gap-8">
            <BaseButton
              v-if="showCancel || task"
              :size="3"
              variant="ghost"
              @click="handleSecondary"
            >
              {{ displayCancelText }}
            </BaseButton>

            <BaseButton
              :size="3"
              :variant="isDanger || task ? 'danger' : 'primary'"
              @click="handlePrimary"
            >
              {{ displayConfirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    message?: string
    width?: string
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    isDanger?: boolean
    closeOnEsc?: boolean
    closeOnOverlay?: boolean
    task?: ScheduleItem | null
  }>(),
  {
    modelValue: false,
    title: '',
    message: '',
    width: '',
    confirmText: '확인',
    cancelText: '취소',
    showCancel: false,
    isDanger: false,
    closeOnEsc: true,
    closeOnOverlay: false,
    task: null
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'deleted'): void
}>()

const store = useScheduleStore()

/* =======================================
   동적 텍스트 계산 (기존 로직 완벽 유지)
======================================= */
const displayTitle = computed(() => {
  if (props.task) {
    switch (props.task.creationMode) {
      case 'period':
        return '기간 일정 삭제'
      case 'weekly':
        return '매주 반복 일정 삭제'
      case 'multiple':
        return '다중 일정 삭제'
      default:
        return '연결된 일정 삭제'
    }
  }
  return props.title
})

const displayMessage = computed(() => {
  if (props.task) {
    switch (props.task.creationMode) {
      case 'period':
        return '연속된 기간으로 묶인 덩어리 일정입니다.\n해당 일정을 전부 삭제하시겠습니까?'
      case 'weekly':
        return '매주 반복되도록 설정된 일정입니다.\n어떻게 삭제하시겠습니까?'
      case 'multiple':
        return '여러 날짜에 동시 생성된 다중 일정입니다.\n어떻게 삭제하시겠습니까?'
      default:
        return '반복 또는 연결된 일정입니다.\n어떻게 삭제하시겠습니까?'
    }
  }
  return props.message
})

const displayConfirmText = computed(() => {
  if (props.task) {
    return props.task.creationMode === 'period'
      ? '전체 삭제'
      : '모든 연결된 일정 삭제'
  }
  return props.confirmText
})

const displayCancelText = computed(() => {
  if (props.task) {
    return props.task.creationMode === 'period' ? '취소' : '이 일정만 삭제'
  }
  return props.cancelText
})

/* =======================================
   ACTIONS 핸들러
======================================= */
function handlePrimary() {
  if (props.task) {
    store.smartRemoveSchedule(props.task.id, 'all')
    emit('deleted')
  } else {
    emit('confirm')
  }
  emit('update:modelValue', false)
}

function handleSecondary() {
  if (props.task) {
    if (props.task.creationMode === 'period') {
      emit('cancel')
    } else {
      store.smartRemoveSchedule(props.task.id, 'single')
      emit('deleted')
    }
  } else {
    emit('cancel')
  }
  emit('update:modelValue', false)
}

function handleClose() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return

  if (event.key === 'Escape' && props.closeOnEsc) {
    handleClose()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    handlePrimary()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
/* =======================================
   OVERLAY & CONTAINER
======================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal-bg);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-width: 90vw;
  text-align: left;
  z-index: var(--z-modal);

  /* ✨ 처방 1: 가로 대 세로 밸런스가 무너지지 않도록 최소 높이 제한 지탱 */
  min-height: 180px;
}

/* =======================================
   HEADER, BODY, FOOTER (패딩 및 간격 최적화)
======================================= */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 상단 여백을 충분히 확보 */
  padding: var(--space-6) var(--space-6) 0;
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  line-height: var(--leading-tight);
}

.modal-body {
  /* ✨ 처방 2: 상하 여백을 한 단계 늘려(space-5) 세로 볼륨감을 든든하게 채움 */
  padding: var(--space-5) var(--space-6) var(--space-6);
  color: var(--text-sub);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  white-space: pre-wrap;
}

.alert-message {
  margin: 0;
}

.modal-footer {
  /* ✨ CSS 자체에 flex와 우측 정렬(flex-end)을 직접 박아서 무조건 오른쪽으로 보냅니다 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-2); /* 버튼 사이 간격 8px */

  padding: var(--space-5) var(--space-6) var(--space-5);
  background: var(--bg-app);
  border-top: 1px solid var(--border-color);
}

/* =======================================
   ANIMATION
======================================= */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base);
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform var(--transition-base)
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.94);
}
</style>
