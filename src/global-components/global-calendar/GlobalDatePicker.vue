<template>
  <div class="global-date-picker relative">
    <div
      class="datetime-box tabular-nums"
      :class="{ 'is-active': isOpen }"
      @click="isOpen = true"
    >
      <i class="ti ti-calendar"></i>
      <span class="date-text">
        <template v-if="isMultipleMode && localSelectedDates.length > 0">
          {{ localSelectedDates.length }}일 선택됨
        </template>
        <template v-else>
          {{ modelValue || placeholder }}
        </template>
      </span>
    </div>

    <div v-if="isOpen" class="overlay-backdrop" @click="isOpen = false"></div>

    <transition name="popover">
      <div
        v-if="isOpen"
        class="compact-calendar-popover"
        :class="`align-${align}`"
      >
        <div class="multi-select-header">
          <label class="toggle-label">
            <input type="checkbox" v-model="isMultipleMode" />
            <span>다중 일정 선택</span>
          </label>
          <span v-if="isMultipleMode" class="count-text">
            {{ localSelectedDates.length }}개
          </span>
        </div>

        <div class="calendar-render-area">
          <GlobalCalendar
            mode="popup"
            :model-value="isMultipleMode ? currentPreviewDate : modelValue"
            :multiple-dates="isMultipleMode ? localSelectedDates : []"
            :is-multiple="isMultipleMode"
            :min-date="props.minDate || undefined"
            :max-date="props.maxDate || undefined"
            @update:model-value="onSelect"
          />
        </div>
        <div v-if="isMultipleMode" class="selected-dates-list">
          <span
            v-for="d in localSelectedDates"
            :key="d"
            class="date-badge"
            @click="removeDate(d)"
          >
            {{ d.slice(5) }} <i class="ti ti-x"></i>
          </span>
        </div>

        <div v-if="isMultipleMode" class="popover-footer">
          <BaseButton
            variant="primary"
            :size="2"
            class="w-full"
            :disabled="localSelectedDates.length === 0"
            @click="confirmMultiple"
          >
            적용
          </BaseButton>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GlobalCalendar from './GlobalCalendar.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
const props = withDefaults(
  defineProps<{
    modelValue?: string
    multipleDates?: string[]
    placeholder?: string
    align?: 'left' | 'center' | 'right'
    minDate?: string // ✅ 추가
    maxDate?: string // ✅ 추가
  }>(),
  {
    modelValue: '',
    multipleDates: () => [],
    placeholder: '날짜 선택',
    align: 'right',
    minDate: '', // ✅ 기본값
    maxDate: '' // ✅ 기본값
  }
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:multipleDates', value: string[]): void
}>()
const isOpen = ref(false)
const isMultipleMode = ref(false)
const localSelectedDates = ref<string[]>([])
const currentPreviewDate = ref(props.modelValue || '')

// ✅ isOpen watch: 열릴 때만 초기화 (immediate 제거)
watch(isOpen, (val) => {
  if (val) {
    const hasMultiple = props.multipleDates && props.multipleDates.length > 0
    if (hasMultiple) {
      isMultipleMode.value = true
      // ✅ startDate + additionalDates 합치되, 중복 제거 후 정렬
      localSelectedDates.value = Array.from(
        new Set([props.modelValue, ...props.multipleDates].filter(Boolean))
      ).sort()
    } else {
      isMultipleMode.value = false
      localSelectedDates.value = props.modelValue ? [props.modelValue] : []
    }
    currentPreviewDate.value =
      localSelectedDates.value[0] || props.modelValue || ''
  }
})

// ✅ props.multipleDates watch: immediate 제거, isOpen 중일 때만 반영
watch(
  () => props.multipleDates,
  (newDates) => {
    // isOpen 상태가 아닐 때는 건드리지 않음 (열릴 때 isOpen watch에서 처리)
    if (!isOpen.value) return
    if (newDates && newDates.length > 0) {
      isMultipleMode.value = true
      localSelectedDates.value = Array.from(
        new Set([props.modelValue, ...newDates].filter(Boolean))
      ).sort()
    }
  },
  { deep: true }
)

watch(isMultipleMode, (val) => {
  if (!val) {
    localSelectedDates.value = props.modelValue ? [props.modelValue] : []
    emit('update:multipleDates', [])
  }
})

const onSelect = (val: string) => {
  if (isMultipleMode.value) {
    const idx = localSelectedDates.value.indexOf(val)
    if (idx > -1) {
      localSelectedDates.value.splice(idx, 1)
    } else {
      localSelectedDates.value.push(val)
      localSelectedDates.value.sort()
    }
    currentPreviewDate.value = val
  } else {
    emit('update:modelValue', val)
    isOpen.value = false
  }
}

const removeDate = (date: string) => {
  localSelectedDates.value = localSelectedDates.value.filter((d) => d !== date)
}

const confirmMultiple = () => {
  const sorted = [...localSelectedDates.value].sort()
  if (sorted.length === 0) return

  // ✅ 원본 startDate를 최대한 유지: 기존 modelValue가 선택 목록에 있으면 그대로 사용
  const keepStart = sorted.includes(props.modelValue)
    ? props.modelValue
    : sorted[0]
  const rest = sorted.filter((d) => d !== keepStart)

  emit('update:modelValue', keepStart)
  emit('update:multipleDates', rest) // ✅ 나머지만 additionalDates로
  isOpen.value = false
}
</script>

<style scoped>
.relative {
  position: relative;
}

.datetime-box {
  flex: 0 0 145px;
  width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  padding: 0 12px;
  height: 40px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.datetime-box.is-active,
.datetime-box:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.datetime-box i {
  font-size: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.date-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

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
  display: flex;
  flex-direction: column;
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

/* 🌟 신규: 다중 모드 헤더 */
.multi-select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
}
.count-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
}

.calendar-render-area {
  padding: var(--space-4);
  max-height: 300px;
  overflow-y: auto;
}

/* 🌟 신규: 다중 모드 날짜 뱃지 */
.selected-dates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 16px;
  max-height: 100px;
  overflow-y: auto;
}
.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--color-primary-pale, #eff6ff);
  color: var(--color-primary, #3b82f6);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.date-badge i {
  font-size: 12px;
}

.popover-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}
.w-full {
  width: 100%;
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
