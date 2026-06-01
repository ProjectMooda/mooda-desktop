<template>
  <Teleport to="body">
    <transition name="alert-fade">
      <div
        v-if="modelValue"
        class="alert-overlay flex-center"
        @click.self="handleClose"
      >
        <div class="alert-container" :style="{ width: width }">
          <div class="alert-header">
            <h3 v-if="displayTitle" class="alert-title">{{ displayTitle }}</h3>
            <div v-else class="flex-1"></div>

            <BaseDeleteButton
              variant="circle"
              size="md"
              intent="close"
              class="btn-close"
              @click="handleClose"
            />
          </div>

          <div class="alert-body">
            <p v-if="displayMessage" class="alert-message">
              {{ displayMessage }}
            </p>
            <slot />
          </div>

          <div class="alert-actions">
            <button
              v-if="showCancel || task"
              class="btn-action btn-cancel"
              @click="handleSecondary"
            >
              {{ displayCancelText }}
            </button>

            <button
              class="btn-action btn-confirm"
              :class="{ 'is-danger': isDanger || task }"
              @click="handlePrimary"
            >
              {{ displayConfirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
    width: '360px',
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
   동적 텍스트 계산
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

// 🌟 기간(period) 일정이면 '전체 삭제', 반복 일정이면 '모든 연결된 일정 삭제'
const displayConfirmText = computed(() => {
  if (props.task) {
    return props.task.creationMode === 'period'
      ? '전체 삭제'
      : '모든 연결된 일정 삭제'
  }
  return props.confirmText
})

// 🌟 기간(period) 일정이면 단순히 '취소', 반복 일정이면 '이 일정만 삭제'
const displayCancelText = computed(() => {
  if (props.task) {
    return props.task.creationMode === 'period' ? '취소' : '이 일정만 삭제'
  }
  return props.cancelText
})

/* =======================================
   ACTIONS 핸들러
======================================= */
// 1. 우측 Primary 버튼 (확인 또는 전체 삭제)
function handlePrimary() {
  if (props.task) {
    store.smartRemoveSchedule(props.task.id, 'all') // period든 반복이든 모두 all(그룹삭제) 처리
    emit('deleted')
  } else {
    emit('confirm')
  }
  emit('update:modelValue', false)
}

// 2. 좌측 Secondary 버튼 (취소 또는 이 일정만 삭제)
function handleSecondary() {
  if (props.task) {
    // 🌟 기간 일정일 때 보조 버튼은 삭제를 수행하지 않고 단순 '취소' 역할만 수행
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

// 3. 완전 취소 (X버튼, 배경, ESC)
function handleClose() {
  emit('cancel')
  emit('update:modelValue', false)
}

/* =======================================
   ESC / ENTER KEY 처리
======================================= */
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
   OVERLAY
======================================= */
.alert-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-modal) + 10);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* =======================================
   CONTAINER
======================================= */
.alert-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-width: 90vw;
  text-align: left;
}

/* =======================================
   HEADER
======================================= */
.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6) 0;
}

.alert-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  line-height: var(--leading-tight);
}

.btn-close {
  margin-right: -8px;
}

/* =======================================
   BODY
======================================= */
.alert-body {
  padding: var(--space-4) var(--space-6) var(--space-6);
  color: var(--text-sub);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  white-space: pre-wrap;
}

.alert-message {
  margin: 0;
}

/* =======================================
   ACTIONS
======================================= */
.alert-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-app);
  border-top: 1px solid var(--border-color);
}

.btn-action {
  padding: 8px 16px;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-cancel {
  background: transparent;
  color: var(--text-sub);
}

.btn-cancel:hover {
  background: #e4e4e7;
  color: var(--text-main);
}

.btn-confirm {
  background: var(--text-main);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.btn-confirm:hover {
  background: #000;
  transform: translateY(-1px);
}

.btn-confirm:active {
  transform: scale(0.97);
}

.btn-confirm.is-danger {
  background: var(--color-danger);
  color: #fff;
}

.btn-confirm.is-danger:hover {
  background: #e11d48;
}

/* =======================================
   ANIMATION
======================================= */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity var(--transition-base);
}

.alert-fade-enter-active .alert-container,
.alert-fade-leave-active .alert-container {
  transition: transform var(--transition-base)
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

.alert-fade-enter-from .alert-container,
.alert-fade-leave-to .alert-container {
  transform: scale(0.94);
}
</style>
