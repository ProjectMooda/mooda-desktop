<template>
  <section
    class="global-calendar"
    :class="mode === 'popup' ? 'popup-calendar' : 'studio-card'"
  >
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

      <div
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
              !date.inRange && date.currentMonth && props.restrictRange
          }
        ]"
        @click="selectDate(date)"
      >
        <span class="date-num">{{ date.day }}</span>

        <div v-if="mode === 'inline' && date.currentMonth" class="dot-wrap">
          <div
            v-for="item in getDailyIndicators(date.full).slice(0, 6)"
            :key="item.color"
            class="dot-item"
          >
            <div class="dot" :style="{ backgroundColor: item.color }"></div>
            <span class="dot-count">
              {{ item.count >= 10 ? '9+' : item.count }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonthPicker from './components/MonthPicker.vue'
import { useScheduleStore } from '@/stores/useScheduleStore'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    rangeStart?: string
    rangeEnd?: string
    restrictRange?: boolean
    mode?: 'inline' | 'popup'
  }>(),
  {
    mode: 'inline'
  }
)

const emit = defineEmits(['update:modelValue', 'error'])
const scheduleStore = useScheduleStore()

interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
  inRange: boolean
}

// 오늘 날짜 계산 (로케일 차이 방지를 위해 명확히 문자열 조합)
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

  const remaining = 42 - dates.length

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

const getDailyIndicators = (dateStr: string) => {
  if (props.mode === 'popup') return []

  const daySchedules = scheduleStore.schedules.filter((s) => {
    const start = s.startDate || dateStr
    const end = s.endDate || start
    return start <= dateStr && end >= dateStr
  })

  const colorMap = new Map<string, number>()
  daySchedules.forEach((s) => {
    let color = 'var(--color-primary)' // 하드코딩 #3b82f6 제거, 변수로 통일
    if (s.goalId) {
      const goal = scheduleStore.goals.find((g) => g.id === s.goalId)
      if (goal && goal.color) color = goal.color
    }
    colorMap.set(color, (colorMap.get(color) || 0) + 1)
  })

  return Array.from(colorMap.entries())
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)
}
</script>

<style scoped>
/* =======================================
   공통 CSS (헤더, 타이틀, 버튼 등)
======================================= */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  position: relative;
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
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.title-btn:hover {
  background: var(--bg-hover);
}

.title-btn .arrow {
  font-size: 12px;
  color: var(--text-muted);
  transform: translateY(1px);
}

.icon-btn {
  background: var(--bg-hover);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.icon-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

/* =======================================
   공통 그리드 및 셀 베이스 (요일 포함)
======================================= */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px; /* 간격을 살짝 타이트하게 조절 */
}

.cal-day {
  text-align: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-muted);
  padding: var(--space-2) 0;
}

.cal-cell {
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
}

.date-num {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  font-variant-numeric: tabular-nums; /* 폰트 너비 고정 */
}
.cal-cell.today .date-num {
  color: var(--color-primary);
  font-weight: var(--font-bold);
}

/* =======================================
   1️⃣ Inline 모드 전용 스타일 (스케줄 페이지용 메인 캘린더)
======================================= */
.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-1);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.studio-card .cal-grid {
  flex: 1;
  grid-template-rows: auto repeat(6, minmax(0, 1fr));
  min-height: 0;
}

.studio-card .cal-cell {
  background: var(--bg-app);
  padding: 6px 2px;
  height: 100%;
  min-height: 44px; /* 내용물이 넘쳐도 형태 유지 */
}

.studio-card .cal-cell:hover:not(.dimmed):not(.out-range) {
  background: var(--bg-card);
  border-color: var(--border-color);
}
.studio-card .cal-cell.in-range {
  background: var(--color-primary-pale);
}

/* =======================================
   2️⃣ Popup 모드 전용 스타일 (데이트 픽커 내부에 들어갈 때)
======================================= */
.popup-calendar {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.popup-calendar .cal-cell {
  background: transparent;
  aspect-ratio: 1 / 1;
  padding: 6px 0 0 0;
}

.popup-calendar .cal-cell:hover:not(.dimmed):not(.out-range) {
  background: var(--bg-hover); /* popup은 좁으므로 은은한 hover */
}
.popup-calendar .cal-cell.in-range:not(.selected):not(.out-range) {
  background: var(--color-primary-pale);
}

/* =======================================
   상태 유틸리티 (선택, 비활성화 등)
======================================= */
.cal-cell.selected {
  background: var(--text-main) !important;
  border-color: var(--text-main) !important;
}
.cal-cell.selected .date-num,
.cal-cell.selected .dot-count {
  color: var(--bg-card) !important;
}
.cal-cell.dimmed {
  opacity: 0.3;
  pointer-events: none;
}
.cal-cell.out-range {
  cursor: not-allowed;
  opacity: 0.4;
  background: var(--bg-hover);
}

/* =======================================
   지표(Dots) 스타일 (일정 인디케이터)
======================================= */
.dot-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  width: 90%;
  margin-top: auto;
}
.dot-item {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.03);
  padding: 1px 4px;
  border-radius: 4px;
  justify-content: center;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-count {
  font-size: 9px;
  font-weight: var(--font-bold);
  color: var(--text-sub);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>
