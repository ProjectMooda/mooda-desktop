<template>
  <div class="global-date-range-picker relative" :class="[`size-${size}`]">
    <!-- 🌟 에러 발생 시 나타났다 사라지는 Toast 모달 -->
    <transition name="toast-fade">
      <div v-if="showToast" class="toast-modal">⚠️ {{ toastMessage }}</div>
    </transition>

    <div class="date-picker-group">
      <button
        class="date-pill"
        :class="{ 'is-active': activeCalendar === 'start' }"
        @click="activeCalendar = 'start'"
      >
        <span v-if="showIcon" class="pill-icon">🗓️</span>
        <span class="date-text">{{ startDate || placeholderStart }}</span>
      </button>

      <span class="date-arrow">{{ arrowText }}</span>

      <button
        class="date-pill"
        :class="{
          'is-empty': !endDate,
          'is-active': activeCalendar === 'end'
        }"
        @click="activeCalendar = 'end'"
      >
        <span v-if="showIcon" class="pill-icon">🏁</span>
        <span class="date-text">{{ endDate || placeholderEnd }}</span>
      </button>
    </div>

    <div
      v-if="activeCalendar"
      class="overlay-backdrop invisible-backdrop"
      @click="activeCalendar = null"
    ></div>

    <transition name="popover">
      <div
        v-if="activeCalendar"
        class="compact-calendar-popover"
        :class="`align-${align}`"
      >
        <div class="segmented-control">
          <button
            :class="{ 'is-selected': activeCalendar === 'start' }"
            @click="activeCalendar = 'start'"
          >
            시작일
          </button>
          <button
            :class="{ 'is-selected': activeCalendar === 'end' }"
            @click="activeCalendar = 'end'"
          >
            종료일
          </button>
        </div>

        <div class="calendar-render-area">
          <!-- 🌟 시작일 달력: range-end로 종료일 이후를 막음 -->
          <GlobalPopupCalendar
            v-if="activeCalendar === 'start'"
            :model-value="startDate"
            :range-end="endDate"
            restrict-range
            @update:model-value="onUpdateStart"
            @error="handleCalendarError"
          />
          <!-- 🌟 종료일 달력: range-start로 시작일 이전을 막음 -->
          <GlobalPopupCalendar
            v-if="activeCalendar === 'end'"
            :model-value="endDate"
            :range-start="startDate"
            restrict-range
            @update:model-value="onUpdateEnd"
            @error="handleCalendarError"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GlobalPopupCalendar from '@/global-components/global-calendar/GlobalPopupCalendar.vue'

const props = withDefaults(
  defineProps<{
    startDate?: string
    endDate?: string
    size?: 'sm' | 'md' | 'lg'
    align?: 'left' | 'center' | 'right'
    placeholderStart?: string
    placeholderEnd?: string
    arrowText?: string
    showIcon?: boolean
  }>(),
  {
    startDate: '',
    endDate: '',
    size: 'md',
    align: 'left',
    placeholderStart: '시작일',
    placeholderEnd: '미정',
    arrowText: '→',
    showIcon: false
  }
)

const emit = defineEmits<{
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
}>()

const activeCalendar = ref<'start' | 'end' | null>(null)

// 🌟 Toast 모달 상태 관리
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500) // 2.5초 뒤 자동 사라짐
}

// 🌟 달력에서 제한된 날짜를 클릭했을 때의 처리
const handleCalendarError = () => {
  if (activeCalendar.value === 'start') {
    triggerToast('시작일은 종료일보다 늦을 수 없습니다.')
  } else {
    triggerToast('종료일은 시작일보다 빠를 수 없습니다.')
  }
}

const onUpdateStart = (val: string) => {
  // 컴포넌트 직접 업데이트 등 예외 방어 로직
  if (props.endDate && val > props.endDate) {
    triggerToast('시작일은 종료일보다 늦을 수 없습니다.')
    return
  }
  emit('update:startDate', val)
  activeCalendar.value = 'end'
}

const onUpdateEnd = (val: string) => {
  // 컴포넌트 직접 업데이트 등 예외 방어 로직
  if (props.startDate && val < props.startDate) {
    triggerToast('종료일은 시작일보다 빠를 수 없습니다.')
    return
  }
  emit('update:endDate', val)
  activeCalendar.value = null
}
</script>

<style scoped>
.relative {
  position: relative;
}

/* =======================================
   🌟 에러 토스트(Toast) 모달 디자인
======================================= */
.toast-modal {
  position: absolute;
  top: -48px; /* 컴포넌트 위쪽으로 띄움 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  padding: 10px 18px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none; /* 클릭 방해 금지 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

/* =======================================
   크기별 레이아웃 (Size Variants)
======================================= */
.date-picker-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.date-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 8px 14px;
  background-color: var(--bg-hover);
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-main);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.size-sm .date-pill {
  padding: 6px 12px;
  font-size: var(--text-xs);
  border-radius: var(--radius-lg);
}
.size-sm .date-arrow {
  font-size: 12px;
}

.size-lg .date-pill {
  padding: 10px 18px;
  font-size: var(--text-base);
}

.date-pill:hover {
  background-color: var(--border-color);
}
.date-pill.is-active {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.date-pill.is-empty {
  color: var(--text-sub);
}
.date-arrow {
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-weight: bold;
}
.date-text {
  font-variant-numeric: tabular-nums;
}
.pill-icon {
  font-size: 1.1em;
}

/* =======================================
   팝업 캘린더 (정렬 및 애니메이션)
======================================= */
.overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: transparent !important;
}

.compact-calendar-popover {
  position: absolute;
  top: calc(100% + 8px);
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  transition:
    left 0.3s ease,
    right 0.3s ease;
}

.align-left {
  left: 0;
  transform-origin: top left;
}
.align-right {
  right: 0;
  transform-origin: top right;
}
.align-center {
  left: 50%;
  transform: translateX(-50%);
  transform-origin: top center;
}

.segmented-control {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: transparent;
}
.segmented-control button {
  flex: 1;
  padding: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.segmented-control button:hover {
  color: var(--text-sub);
}
.segmented-control button.is-selected {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.calendar-render-area {
  padding: var(--space-4);
  max-height: 300px;
  overflow-y: auto;
}

.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
