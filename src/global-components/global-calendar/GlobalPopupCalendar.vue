<template>
  <div class="popup-calendar">
    <div class="card-head">
      <button class="icon-btn" @click="changeMonth(-1)">‹</button>

      <div class="title-wrapper">
        <button class="title-btn" @click="showMonthPicker = true">
          {{ currentYear }}. {{ String(currentMonth + 1).padStart(2, '0') }}
          <span class="arrow">▾</span>
        </button>

        <MonthPicker
          v-if="showMonthPicker"
          :current-year="currentYear"
          :current-month="currentMonth"
          @select="handleMonthSelect"
          @close="showMonthPicker = false"
        />
      </div>

      <button class="icon-btn" @click="changeMonth(1)">›</button>
    </div>

    <div class="cal-grid">
      <div v-for="day in weekDays" :key="day" class="cal-day">
        {{ day }}
      </div>

      <button
        v-for="date in calendarDates"
        :key="date.full"
        :class="[
          'cal-cell',
          {
            selected: modelValue === date.full,
            dimmed: !date.currentMonth,
            today: date.isToday,
            'in-range': date.inRange,
            'out-range':
              props.restrictRange && !date.inRange && date.currentMonth // 🌟 추가: 선택 불가 날짜 클래스
          }
        ]"
        @click="selectDate(date)"
      >
        <span class="date-num">{{ date.day }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonthPicker from './components/MonthPicker.vue'

const props = defineProps<{
  modelValue?: string
  rangeStart?: string
  rangeEnd?: string
  restrictRange?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'error'])

interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
  inRange: boolean
}

const now = new Date()
const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const viewDate = ref(props.modelValue ? new Date(props.modelValue) : new Date())
const currentYear = computed(() => viewDate.value.getFullYear())
const currentMonth = computed(() => viewDate.value.getMonth())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const showMonthPicker = ref(false)

const handleMonthSelect = ({
  year,
  month
}: {
  year: number
  month: number
}) => {
  viewDate.value = new Date(year, month, 1)
  showMonthPicker.value = false
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) viewDate.value = new Date(newVal)
  }
)

const changeMonth = (diff: number) => {
  viewDate.value = new Date(currentYear.value, currentMonth.value + diff, 1)
}

const isDateInRange = (dateStr: string) => {
  if (!props.rangeStart && !props.rangeEnd) return false
  const start = props.rangeStart || '1970-01-01'
  const end = props.rangeEnd || '9999-12-31'
  return dateStr >= start && dateStr <= end
}

const calendarDates = computed<CalendarDate[]>(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m, 1).getDay()
  const lastDate = new Date(y, m + 1, 0).getDate()

  const dates: CalendarDate[] = []

  for (let i = 0; i < firstDay; i++) {
    dates.push({
      day: '',
      full: `empty-start-${i}`,
      currentMonth: false,
      isToday: false,
      inRange: false
    })
  }

  for (let i = 1; i <= lastDate; i++) {
    const full = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({
      day: i,
      full,
      currentMonth: true,
      isToday: full === todayString,
      inRange: isDateInRange(full)
    })
  }

  const TOTAL_CELLS = 42
  const remaining = TOTAL_CELLS - dates.length

  for (let i = 0; i < remaining; i++) {
    dates.push({
      day: '',
      full: `empty-end-${i}`,
      currentMonth: false,
      isToday: false,
      inRange: false
    })
  }

  return dates
})

const selectDate = (date: CalendarDate) => {
  if (!date.currentMonth) return

  if (props.restrictRange && !date.inRange) {
    emit('error')
    return
  }
  emit('update:modelValue', date.full)
}
</script>

<style scoped>
.popup-calendar {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.title-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-btn {
  background: transparent;
  border: none;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.title-btn:hover {
  background: var(--bg-hover);
}

.title-btn .arrow {
  font-size: 10px;
  color: var(--text-muted);
  transform: translateY(1px);
}

.icon-btn {
  background: var(--bg-hover);
  border: none;
  width: var(--control-size-sm, 28px);
  height: var(--control-size-sm, 28px);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}
.icon-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-1);
}

.cal-day {
  text-align: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-muted);
  padding: var(--space-1) 0 var(--space-2);
}

.cal-cell {
  background: transparent;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

/* 🌟 out-range 상태일 때는 호버 이벤트를 차단 */
.cal-cell:hover:not(.dimmed):not(.out-range) {
  background: var(--bg-card);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.cal-cell.selected {
  background: var(--text-main) !important;
  border-color: var(--text-main) !important;
  box-shadow: var(--shadow-sm);
}
.cal-cell.selected .date-num {
  color: var(--bg-card) !important;
}

.cal-cell.dimmed {
  opacity: 0;
  pointer-events: none;
}

/* 🌟 선택 불가(out-range) 날짜 스타일 지정 */
.cal-cell.out-range {
  cursor: not-allowed; /* 마우스 금지 표시 */
}
.cal-cell.out-range .date-num {
  color: var(--text-muted); /* 숫자를 흐릿한 회색으로 변경 */
  opacity: 0.5; /* 전체적으로 더 연하게 처리 */
}

/* in-range이면서 선택이 안 된 상태 배경 (out-range가 아닐 때만) */
.cal-cell.in-range:not(.selected):not(.out-range) {
  background: var(--color-primary-pale, #eef2ff);
}

.date-num {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  transition: color var(--transition-fast);
}

.cal-cell.today .date-num {
  color: var(--color-primary);
  font-weight: var(--font-bold);
}
</style>
