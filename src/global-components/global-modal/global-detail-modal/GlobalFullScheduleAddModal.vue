<template>
  <GlobalScheduleModalLayout
    :is-open="isOpen"
    title="상세 일정 추가"
    @close="handleClose"
  >
    <div class="segment-control">
      <BaseButton
        class="flex-1"
        :size="2"
        :variant="form.type === 'task' ? 'outline' : 'ghost'"
        @click="form.type = 'task'"
      >
        ✅ 일반 할 일
      </BaseButton>
      <BaseButton
        class="flex-1"
        :size="2"
        :variant="form.type === 'event' ? 'outline' : 'ghost'"
        @click="form.type = 'event'"
      >
        📅 기간 일정 / 이벤트
      </BaseButton>
    </div>

    <GlobalScheduleTitle
      v-model="form.summary"
      placeholder="일정 제목을 입력하세요"
    />

    <div class="form-section" style="position: relative; z-index: 95">
      <div class="section-header-flex">
        <label class="section-label">일시 설정</label>
        <div class="mode-pills">
          <BaseButton
            :size="1"
            :variant="form.creationMode === 'period' ? 'primary' : 'ghost'"
            @click="form.creationMode = 'period'"
          >
            기본
          </BaseButton>
          <BaseButton
            :size="1"
            :variant="form.creationMode === 'weekly' ? 'primary' : 'ghost'"
            @click="form.creationMode = 'weekly'"
          >
            요일반복
          </BaseButton>
          <BaseButton
            :size="1"
            :variant="form.creationMode === 'multiple' ? 'primary' : 'ghost'"
            @click="form.creationMode = 'multiple'"
          >
            다중지정
          </BaseButton>
        </div>
      </div>

      <div class="date-time-box">
        <div
          v-if="
            form.creationMode === 'period' || form.creationMode === 'weekly'
          "
          class="input-grid"
        >
          <div class="input-col">
            <span class="sub-label">시작일</span>
            <div class="base-input-like-wrapper">
              <input
                v-model="form.startDate"
                type="date"
                class="s-input tabular-nums"
              />
            </div>
          </div>
          <div class="input-col">
            <span class="sub-label">
              종료일 {{ form.creationMode === 'weekly' ? '(마감)' : '' }}
            </span>
            <div class="base-input-like-wrapper">
              <input
                v-model="form.endDate"
                type="date"
                class="s-input tabular-nums"
              />
            </div>
          </div>
        </div>

        <div v-if="form.creationMode === 'weekly'" class="input-col mt-2">
          <div class="days-flex">
            <button
              v-for="(day, index) in daysOfWeek"
              :key="index"
              class="day-btn"
              :class="{ active: form.selectedDays.includes(index) }"
              @click="toggleDay(index)"
            >
              {{ day }}
            </button>
          </div>
        </div>

        <div v-if="form.creationMode === 'multiple'" class="input-col mt-2">
          <div class="multi-date-flex">
            <div class="base-input-like-wrapper flex-1">
              <input
                v-model="tempDate"
                type="date"
                class="s-input tabular-nums"
              />
            </div>
            <BaseButton variant="secondary" :size="3" @click="addMultipleDate"
              >추가</BaseButton
            >
          </div>
          <div v-if="form.selectedDates.length > 0" class="date-chips mt-2">
            <div
              v-for="date in form.selectedDates"
              :key="date"
              class="date-chip"
            >
              <span class="tabular-nums">{{ date }}</span>
              <button @click="removeMultipleDate(date)">✕</button>
            </div>
          </div>
        </div>

        <div class="input-col divider-top">
          <div class="time-row">
            <span class="sub-label" style="width: 32px">시간</span>
            <BaseTimePicker v-model="form.startTime" class="tabular-nums" />
            <span class="range-dash">~</span>
            <BaseTimePicker v-model="form.endTime" class="tabular-nums" />
          </div>
        </div>
      </div>
    </div>

    <button class="btn-toggle-advanced" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '닫기 ▴' : '상세 설정 (카테고리, 중요도) ▾' }}
    </button>

    <transition name="slide-fade">
      <div v-show="showAdvanced" class="advanced-container">
        <GlobalScheduleMeta
          v-model:category="form.category"
          v-model:priority="form.priority"
          v-model:goalId="form.goalId"
          :show-goal="form.type === 'event'"
        />
      </div>
    </transition>

    <template #footer-left>
      <BaseButton variant="ghost" :size="3" @click="handleClose"
        >취소</BaseButton
      >
    </template>
    <template #footer-right>
      <BaseButton
        variant="primary"
        :size="3"
        :disabled="isSubmitDisabled"
        @click="submit(false)"
      >
        저장하기
      </BaseButton>
    </template>
  </GlobalScheduleModalLayout>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import GlobalScheduleModalLayout from './GlobalScheduleModalLayout.vue'
import BaseTimePicker from '@/base-ui/BaseTimePicker.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import GlobalScheduleTitle from '../global-detail-modal/schedule-form/GlobalScheduleTitle.vue'
import GlobalScheduleMeta from '../global-detail-modal/schedule-form/GlobalScheduleMeta.vue'

const props = defineProps<{
  isOpen: boolean
  defaultGoalId?: number
  defaultMilestoneId?: number
  defaultDate?: string
}>()
const emit = defineEmits(['close'])
const scheduleStore = useScheduleStore()

const showAdvanced = ref(false)
const tempDate = ref('')

const getDefaultForm = () => ({
  type: 'task' as 'task' | 'event',
  summary: '',
  creationMode: 'period' as 'period' | 'weekly' | 'multiple',
  endDate: '',
  selectedDays: [] as number[],
  selectedDates: [] as string[],
  startTime: '',
  endTime: '',
  category: '',
  priority: '',
  goalId: props.defaultGoalId || null,
  milestoneId: props.defaultMilestoneId || null,
  startDate:
    props.defaultDate ||
    scheduleStore.selectedDate ||
    new Date().toISOString().slice(0, 10)
})

const form = reactive(getDefaultForm())

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      Object.assign(form, getDefaultForm())
      tempDate.value = ''
      showAdvanced.value = false
    }
  }
)

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

const toggleDay = (index: number) => {
  const i = form.selectedDays.indexOf(index)
  if (i > -1) form.selectedDays.splice(i, 1)
  else form.selectedDays.push(index)
}

const addMultipleDate = () => {
  if (tempDate.value && !form.selectedDates.includes(tempDate.value)) {
    form.selectedDates.push(tempDate.value)
    form.selectedDates.sort()
  }
  tempDate.value = ''
}

const removeMultipleDate = (date: string) => {
  form.selectedDates = form.selectedDates.filter((d) => d !== date)
}

const isSubmitDisabled = computed(() => {
  if (!form.summary.trim()) return true
  if (form.creationMode === 'weekly') {
    if (!form.startDate || !form.endDate || form.selectedDays.length === 0)
      return true
  }
  if (form.creationMode === 'multiple') {
    if (form.selectedDates.length === 0) return true
  }
  return false
})

const getDatesBetween = (start: string, end: string) => {
  const dates = []
  let current = new Date(start)
  const last = new Date(end)
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

const createSchedules = () => {
  const groupId = `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const pushToStore = (start: string, end?: string) => {
    if (form.type === 'event' && form.goalId && !form.milestoneId) {
      scheduleStore.addMilestone(form.goalId, form.summary, start, end || start)
    } else {
      scheduleStore.addSchedule({
        type: form.type,
        groupId,
        creationMode: form.creationMode,
        goalId: form.goalId,
        milestoneId: form.milestoneId,
        summary: form.summary,
        startDate: start,
        endDate: end || start,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        category: form.category || undefined,
        priority: form.priority || undefined
      })
    }
  }

  if (form.creationMode === 'period') {
    pushToStore(form.startDate, form.endDate || undefined)
  } else if (form.creationMode === 'weekly') {
    getDatesBetween(form.startDate, form.endDate).forEach((dateStr) => {
      const dayIndex = new Date(dateStr).getDay()
      if (form.selectedDays.includes(dayIndex)) {
        pushToStore(dateStr, dateStr)
      }
    })
  } else if (form.creationMode === 'multiple') {
    form.selectedDates.forEach((dateStr) => {
      pushToStore(dateStr, dateStr)
    })
  }
}

const submit = (keepOpen: boolean) => {
  if (isSubmitDisabled.value) return

  createSchedules()

  if (keepOpen) {
    form.summary = ''
    form.selectedDates = []
    setTimeout(() => {
      ;(
        document.querySelector('.title-wrapper input') as HTMLInputElement
      )?.focus()
    }, 50)
  } else {
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* 상단 탭 정돈 */
.segment-control {
  display: flex;
  background-color: var(--bg-hover);
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
}
.flex-1 {
  flex: 1;
}
.mt-2 {
  margin-top: 8px;
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.mode-pills {
  display: flex;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  padding: 2px;
  gap: 2px;
}

.date-time-box {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--space-3);
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.sub-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
}
.time-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.range-dash {
  font-weight: var(--font-bold);
  color: var(--text-muted);
}
.divider-top {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

/* Date Input 래퍼 스타일 (BaseInput 모방) */
.base-input-like-wrapper {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-1);
  padding: 8px 12px;
  transition: all var(--transition-base);
}
.base-input-like-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px var(--color-primary-light),
    var(--shadow-2);
}
.s-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: var(--text-sm);
}

.days-flex,
.multi-date-flex {
  display: flex;
  gap: 8px;
}
.day-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-sub);
  font-weight: var(--font-bold);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}
.day-btn.active {
  background: var(--color-primary);
  color: var(--bg-card);
  border-color: var(--color-primary);
}

.date-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.date-chip {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-main);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-1);
}
.date-chip button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color var(--transition-fast);
}
.date-chip button:hover {
  color: var(--color-danger);
}

.btn-toggle-advanced {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-align: center; /* 중앙 정렬로 변경하여 밸런스 확보 */
  cursor: pointer;
  transition: color var(--transition-fast);
}
.btn-toggle-advanced:hover {
  color: var(--text-main);
}
.advanced-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
