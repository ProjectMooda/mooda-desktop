<template>
  <GlobalScheduleModalLayout
    :is-open="isOpen"
    :show-header="false"
    @close="handleClose"
  >
    <div class="title-section-row">
      <GlobalScheduleTitle
        v-model="localData.summary"
        placeholder="새로운 할 일 제목을 입력하세요"
        class="title-input"
      />
    </div>

    <div class="form-section">
      <label class="section-label">시간 & 기간 설정</label>

      <div v-if="props.defaultMilestoneId" class="multiple-option-group">
        <label class="checkbox-container">
          <input type="checkbox" v-model="isMultipleMode" />
          <span class="checkmark"></span>
          <span class="label-text">
            이 마일스톤 기간 전체에 매일 추가
            <small v-if="activeMilestone">
              ({{ activeMilestone.startDate }} ~
              {{ activeMilestone.endDate || '종료일 없음' }})
            </small>
          </span>
        </label>
      </div>

      <div class="date-picker-wrapper">
        <GlobalDateRangePicker
          v-if="!isMultipleMode"
          :start-date="localData.startDate"
          :end-date="localData.endDate"
          :min-date="props.minDate"
          :max-date="props.maxDate"
          @update:start-date="localData.startDate = $event"
          @update:end-date="localData.endDate = $event"
          align="left"
          class="full-width-picker"
        />
        <div v-else class="locked-date-display">
          📅 마일스톤 전체 기간에 할 일이 각각 생성됩니다.
        </div>
      </div>

      <div class="datetime-row">
        <div class="time-inputs">
          <BaseTimePicker
            v-model="localData.startTime"
            class="fixed-time-picker tabular-nums"
          />
          <span class="time-sep">→</span>
          <BaseTimePicker
            v-model="localData.endTime"
            class="fixed-time-picker tabular-nums"
          />
        </div>
      </div>
    </div>

    <div v-show="!isMultipleMode" class="form-section">
      <div class="section-header">
        <label class="section-label">반복 설정</label>
        <label class="toggle-label">
          <input type="checkbox" v-model="localData.isRecurring" />
          <span>요일 반복</span>
        </label>
      </div>

      <div
        class="weekday-picker-row"
        :class="{ 'is-disabled': !localData.isRecurring }"
      >
        <button
          v-for="day in WEEKDAYS"
          :key="day.value"
          type="button"
          class="weekday-btn"
          :class="{
            'is-active': localData.repeatWeekdays?.includes(day.value),
            'is-weekend-sun': day.value === 'SU',
            'is-weekend-sat': day.value === 'SA'
          }"
          :disabled="!localData.isRecurring"
          @click="toggleWeekday(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <GlobalScheduleMeta
      v-model:category="localData.category"
      v-model:priority="localData.priority"
    />

    <GlobalSubtaskCard v-model="localData.subtasks" />

    <template #footer-left>
      <BaseButton variant="secondary" :size="3" @click="handleClose">
        취소
      </BaseButton>
    </template>
    <template #footer-right>
      <BaseButton variant="primary" :size="3" @click="handleSave">
        {{ props.data ? '일정 수정' : '일정 추가' }}
      </BaseButton>
    </template>
  </GlobalScheduleModalLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GlobalScheduleModalLayout from './GlobalScheduleModalLayout.vue'
import BaseTimePicker from '@/base-ui/BaseTimePicker.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import GlobalScheduleTitle from '../global-detail-modal/schedule-form/GlobalScheduleTitle.vue'
import GlobalScheduleMeta from '../global-detail-modal/schedule-form/GlobalScheduleMeta.vue'
import GlobalDateRangePicker from '@/global-components/global-calendar/GlobalDateRangePicker.vue'

// 🌟 서브태스크 공통 컴포넌트 임포트
import GlobalSubtaskCard from './schedule-form/GlobalSubtaskCard.vue'

const store = useScheduleStore()

const props = defineProps<{
  isOpen: boolean
  initialDate?: Date
  defaultGoalId?: number
  defaultMilestoneId?: number
  data?: ScheduleItem
  minDate?: string
  maxDate?: string
}>()

const emit = defineEmits(['close', 'add', 'update'])

const isMultipleMode = ref(false)

const WEEKDAYS = [
  { label: '월', value: 'MO' },
  { label: '화', value: 'TU' },
  { label: '수', value: 'WE' },
  { label: '목', value: 'TH' },
  { label: '금', value: 'FR' },
  { label: '토', value: 'SA' },
  { label: '일', value: 'SU' }
]

const activeMilestone = computed(
  () => store.milestones.find((m) => m.id === props.defaultMilestoneId) || null
)

const getLocalDateString = (d: Date | string) => {
  if (!d) return ''
  const dateObj = d instanceof Date ? d : new Date(`${d}T00:00:00`)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultData = (): Partial<ScheduleItem> => {
  const initDateStr = getLocalDateString(props.initialDate || new Date())

  return {
    type: 'task',
    summary: '',
    startDate: initDateStr,
    endDate: initDateStr,
    startTime: '09:00',
    endTime: '10:00',
    category: 'none',
    priority: 'none',
    isRecurring: false,
    repeatWeekdays: [],
    subtasks: []
  }
}

const localData = ref<Partial<ScheduleItem>>(getDefaultData())

watch(
  () => [props.isOpen, props.data],
  ([newIsOpen]) => {
    if (newIsOpen) {
      if (props.data) {
        localData.value = JSON.parse(JSON.stringify(props.data))
        isMultipleMode.value = props.data.creationMode === 'multiple'
        if (props.data.creationMode === 'weekly') {
          localData.value.isRecurring = true
        }
      } else {
        localData.value = getDefaultData()
        isMultipleMode.value = false
      }
    }
  },
  { immediate: true }
)

const toggleWeekday = (value: string) => {
  if (!localData.value.repeatWeekdays) {
    localData.value.repeatWeekdays = []
  }
  const index = localData.value.repeatWeekdays.indexOf(value)
  if (index === -1) {
    localData.value.repeatWeekdays.push(value)
  } else {
    localData.value.repeatWeekdays.splice(index, 1)
  }
}

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  if (localData.value.subtasks && localData.value.subtasks.length > 0) {
    const total = localData.value.subtasks.length
    const completed = localData.value.subtasks.filter((s) => s.done).length
    localData.value.done = total === completed
  } else {
    localData.value.done = false
  }

  if (!localData.value.isRecurring) {
    localData.value.repeatWeekdays = []
  }

  const startDateStr =
    localData.value.startDate || getLocalDateString(new Date())
  const endDateStr = localData.value.endDate || startDateStr
  const isPeriod = startDateStr !== endDateStr

  const baseItemData = {
    type: localData.value.type || 'task',
    summary: localData.value.summary || '',
    done: localData.value.done,
    startTime: localData.value.startTime,
    endTime: localData.value.endTime,
    category: localData.value.category,
    priority: localData.value.priority,
    subtasks: localData.value.subtasks,
    goalId: props.data?.goalId || props.defaultGoalId || null,
    milestoneId: props.data?.milestoneId || props.defaultMilestoneId || null
  }

  if (props.data?.id) {
    store.updateSchedule(props.data.id, {
      ...baseItemData,
      startDate: startDateStr,
      endDate: endDateStr
    })
    emit('update')
    handleClose()
    return
  }

  if (isMultipleMode.value && activeMilestone.value) {
    const mStartStr = activeMilestone.value.startDate
    const mEndStr = activeMilestone.value.endDate || mStartStr
    const start = new Date(`${mStartStr}T00:00:00`)
    const end = new Date(`${mEndStr}T00:00:00`)
    const groupId = `ms-multiple-${Date.now()}`
    let currentDate = new Date(start)

    while (currentDate <= end) {
      store.addSchedule({
        ...baseItemData,
        groupId,
        creationMode: 'multiple',
        startDate: getLocalDateString(currentDate),
        endDate: getLocalDateString(currentDate)
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (
    localData.value.isRecurring &&
    localData.value.repeatWeekdays &&
    localData.value.repeatWeekdays.length > 0
  ) {
    const groupId = `group_weekly_${Date.now()}`
    const dayMap: Record<string, number> = {
      SU: 0,
      MO: 1,
      TU: 2,
      WE: 3,
      TH: 4,
      FR: 5,
      SA: 6
    }
    const targetDays = localData.value.repeatWeekdays.map((d) => dayMap[d])

    let currentDate = new Date(`${startDateStr}T00:00:00`)
    const targetEndDate = new Date(`${endDateStr}T00:00:00`)

    while (currentDate <= targetEndDate) {
      if (targetDays.includes(currentDate.getDay())) {
        store.addSchedule({
          ...baseItemData,
          groupId,
          creationMode: 'weekly',
          startDate: getLocalDateString(currentDate),
          endDate: undefined
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (isPeriod) {
    store.addSchedule({
      ...baseItemData,
      groupId: `group_period_${Date.now()}`,
      creationMode: 'period',
      startDate: startDateStr,
      endDate: endDateStr
    })
  } else {
    store.addSchedule({
      ...baseItemData,
      creationMode: 'single',
      startDate: startDateStr,
      endDate: undefined
    })
  }

  emit('add')
  handleClose()
}
</script>

<style scoped>
/* --- 다중 모드 관련 스타일 --- */
.multiple-option-group {
  background: var(--bg-hover, #f4f4f5);
  border: 1px solid var(--border-color, #e4e4e7);
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
}
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main, #27272a);
}
.checkbox-container small {
  color: var(--text-muted, #a1a1aa);
  font-weight: 400;
  margin-left: 4px;
}
.locked-date-display {
  width: 100%;
  font-size: 13px;
  color: var(--color-primary, #6366f1);
  background-color: var(--color-primary-light, #eef2ff);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  border: 1px solid transparent;
}

/* Title Section 개편 (여유로운 단독 행 구성) */
.title-section-row {
  width: 100%;
  padding-bottom: 16px;
  border-bottom: 1.5px solid var(--border-color);
}
.title-input {
  width: 100%;
}

/* Date Picker Wrapper (가로 정렬 및 컴포넌트 풀 너비 매칭) */
.date-picker-wrapper {
  width: 100%;
  display: flex;
}
.full-width-picker {
  width: 100%;
}
.full-width-picker :deep(.date-picker-group) {
  width: 100%;
}
.full-width-picker :deep(.date-btn) {
  flex: 1;
}

/* Sections Base */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
}

/* Time Picker Area */
.datetime-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.time-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.fixed-time-picker {
  flex: 1;
  height: 42px;
  border-radius: 8px !important;
  padding: 0 12px;
}
.time-sep {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

/* 요일 반복 지정 UI */
.weekday-picker-row {
  display: flex;
  gap: 6px;
  width: 100%;
  transition: opacity 0.2s ease;
}
.weekday-picker-row.is-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.weekday-btn {
  flex: 1;
  height: 38px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.weekday-btn:hover {
  background: var(--bg-hover);
  border-color: var(--text-muted);
}
.weekday-btn.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  font-weight: 600;
}
.weekday-btn.is-weekend-sat:not(.is-active) {
  color: #2b6cb0;
}
.weekday-btn.is-weekend-sun:not(.is-active) {
  color: #c53030;
}
</style>
