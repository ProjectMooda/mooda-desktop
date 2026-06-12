<template>
  <div class="global-date-range-picker relative" :class="[`size-${size}`]">
    <transition name="toast-fade">
      <div v-if="showToast" class="toast-modal flex-center shadow-3">
        ⚠️ {{ toastMessage }}
      </div>
    </transition>

    <div class="date-picker-group">
      <!-- 🌟 날짜 선택 버튼에 BaseButton 적용 (secondary 테마) -->
      <BaseButton
        variant="secondary"
        :class="{ 'is-active': activeCalendar === 'start' }"
        @click="activeCalendar = 'start'"
      >
        <span class="date-text">{{ startDate || placeholderStart }}</span>
      </BaseButton>

      <span class="date-arrow">{{ arrowText }}</span>

      <!-- 🌟 날짜 선택 버튼에 BaseButton 적용 (secondary 테마) -->
      <BaseButton
        variant="secondary"
        :class="{
          'is-empty': !endDate,
          'is-active': activeCalendar === 'end'
        }"
        @click="activeCalendar = 'end'"
      >
        <span class="date-text">{{ endDate || placeholderEnd }}</span>
      </BaseButton>
    </div>

    <div
      v-if="activeCalendar"
      class="overlay-backdrop"
      @click="activeCalendar = null"
    ></div>

    <transition name="popover">
      <div
        v-if="activeCalendar"
        class="compact-calendar-popover"
        :class="`align-${align}`"
      >
        <div class="segment-group">
          <BaseButton
            variant="ghost"
            class="segment-btn"
            :class="{ 'is-selected': activeCalendar === 'start' }"
            @click="activeCalendar = 'start'"
          >
            시작일
          </BaseButton>
          <BaseButton
            variant="ghost"
            class="segment-btn"
            :class="{ 'is-selected': activeCalendar === 'end' }"
            @click="activeCalendar = 'end'"
          >
            종료일
          </BaseButton>
        </div>
        <div class="calendar-render-area">
          <GlobalCalendar
            v-if="activeCalendar === 'start'"
            mode="popup"
            :model-value="startDate"
            :range-end="endDate || undefined"
            :restrict-range="!!endDate"
            @update:model-value="onUpdateStart"
            @error="handleCalendarError"
          />
          <GlobalCalendar
            v-if="activeCalendar === 'end'"
            mode="popup"
            :model-value="endDate"
            :range-start="startDate || undefined"
            :restrict-range="!!startDate"
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
import GlobalCalendar from './GlobalCalendar.vue'
import BaseButton from '@/base-ui/BaseButton.vue' // 🌟 BaseButton 추가

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

const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const handleCalendarError = () => {
  if (activeCalendar.value === 'start') {
    triggerToast('시작일은 종료일보다 늦을 수 없습니다.')
  } else {
    triggerToast('종료일은 시작일보다 빠를 수 없습니다.')
  }
}

const onUpdateStart = (val: string) => {
  emit('update:startDate', val)
  activeCalendar.value = 'end'
}

const onUpdateEnd = (val: string) => {
  emit('update:endDate', val)
  activeCalendar.value = null
}
</script>

<style scoped>
.relative {
  position: relative;
}

/* =======================================
   🌟 에러 토스트 모달
======================================= */
.toast-modal {
  position: absolute;
  top: -48px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--bg-card);
  padding: 10px 18px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  white-space: nowrap;
  z-index: var(--z-toast);
  pointer-events: none;
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
   🌟 BaseButton 결합 및 크기 레이아웃 보존
======================================= */
.date-picker-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-arrow {
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-weight: bold;
}
.date-text {
  font-variant-numeric: tabular-nums;
}

/* =======================================
   🌟 팝업 캘린더 (고정 너비/높이)
======================================= */
.overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown);
  background: transparent !important;
}

.compact-calendar-popover {
  position: absolute;
  top: calc(100% + 8px);
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  z-index: calc(var(--z-dropdown) + 1);
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

/* =======================================
   🌟 세그먼트(탭) 버튼 스타일
======================================= */
.segment-group {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e2e8f0); /* 캘린더 영역과 구분선 */
}

.segment-btn {
  flex: 1;
  justify-content: center;
  height: 45px;
  border-radius: 0 !important; /* BaseButton의 기본 둥근 모서리 무효화 */
  color: var(--text-muted, #64748b);
  font-size: var(--text-sm, 14px);
  font-weight: 500;
  transition: all 0.2s ease;
}

.segment-btn:hover {
  color: var(--text-primary, #1e293b);
  background-color: rgba(0, 0, 0, 0.03); /* 살짝 호버 효과 */
}

/* 선택된 탭: 달력 본문과 자연스럽게 이어지는 스타일 */
.segment-btn.is-selected {
  color: var(--text-primary, #0f172a);
  font-weight: bold;
  box-shadow: none; /* 떠보이는 그림자 제거 */
  border-bottom: 2px solid var(--text-primary, #0f172a); /* 선택된 탭 하단 강조선 */
}
</style>
