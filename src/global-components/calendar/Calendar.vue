<template>
  <section class="studio-card cal-section">
    <div class="card-head">
      <button class="icon-btn" @click="changeMonth(-1)">‹</button>

      <!-- 🌟 분리된 MonthPicker 컴포넌트 적용 -->
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

        <div v-if="date.currentMonth" class="dot-wrap">
          <div
            v-for="item in getDailyIndicators(date.full).slice(0, 6)"
            :key="item.color"
            class="dot-item"
          >
            <div class="dot" :style="{ backgroundColor: item.color }"></div>
            <span class="dot-count">{{
              item.count >= 10 ? '9+' : item.count
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import MonthPicker from './MonthPicker.vue' // ✅ 공통 컴포넌트 불러오기

const scheduleStore = useScheduleStore()

const props = defineProps<{
  modelValue?: string
  rangeStart?: string
  rangeEnd?: string
  restrictRange?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
  inRange: boolean
}

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// 🌟 월/년도 선택기 상태 및 핸들러
const showMonthPicker = ref(false)

const handleMonthSelect = ({
  year,
  month
}: {
  year: number
  month: number
}) => {
  currentYear.value = year
  currentMonth.value = month
  showMonthPicker.value = false
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const d = new Date(newVal)
      currentYear.value = d.getFullYear()
      currentMonth.value = d.getMonth()
    }
  },
  { immediate: true }
)

const isDateInRange = (dateStr: string) => {
  if (!props.rangeStart && !props.rangeEnd) return false
  const start = props.rangeStart || '1970-01-01'
  const end = props.rangeEnd || '9999-12-31'
  return dateStr >= start && dateStr <= end
}

const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const lastDate = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate()
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
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({
      day: i,
      full,
      currentMonth: true,
      isToday: full === todayString,
      inRange: isDateInRange(full)
    })
  }

  const TOTAL_CELLS = 42
  const remainingCells = TOTAL_CELLS - dates.length
  for (let i = 0; i < remainingCells; i++) {
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

const changeMonth = (diff: number) => {
  currentMonth.value += diff
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  } else if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
}

const selectDate = (date: CalendarDate) => {
  if (!date.currentMonth) return
  if (props.restrictRange && !date.inRange) return
  emit('update:modelValue', date.full)
}

const getDailyIndicators = (dateStr: string) => {
  const daySchedules = scheduleStore.schedules.filter((s) => {
    const start = s.startDate || dateStr
    const end = s.endDate || start
    return start <= dateStr && end >= dateStr
  })

  const colorMap = new Map<string, number>()

  daySchedules.forEach((s) => {
    let color = '#3b82f6'
    if (s.goalId) {
      const goal = scheduleStore.goals.find((g) => g.id === s.goalId)
      if (goal && goal.color) color = goal.color
    }
    colorMap.set(color, (colorMap.get(color) || 0) + 1)
  })

  const indicators = Array.from(colorMap.entries()).map(([color, count]) => ({
    color,
    count
  }))

  return indicators.sort((a, b) => b.count - a.count)
}
</script>

<style scoped>
/* 카드 및 캘린더 전체 래퍼 */
.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
  position: relative;
}

/* 🌟 타이틀 및 팝업 앵커 */
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

/* 좌우 이동 버튼 */
.icon-btn {
  background: var(--bg-hover);
  border: none;
  width: var(--control-size-md);
  height: var(--control-size-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
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

/* =======================================
   ✨ 핵심 그리드 레이아웃
======================================= */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: auto repeat(6, minmax(0, 1fr));
  gap: var(--space-1);
  flex: 1;
  min-height: 0;
  padding-right: var(--space-1);
}

.cal-day {
  text-align: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-muted);
  padding: var(--space-2) 0;
  position: sticky;
  top: 0;
  background: var(--bg-card);
}

.cal-cell {
  background: var(--bg-app);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 2px;
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
  height: 100%;
}
.cal-cell:hover:not(.dimmed):not(.out-range) {
  background: var(--bg-card);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

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
.cal-cell.in-range {
  background: var(--color-primary-pale);
}
.cal-cell.out-range {
  cursor: not-allowed;
  opacity: 0.4;
  background: var(--bg-hover);
}

.date-num {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin-bottom: var(--space-1);
}
.cal-cell.today .date-num {
  color: var(--color-primary);
  font-weight: var(--font-bold);
}

/* =======================================
   🚥 일일 지표 (Dots)
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
  padding: 1px var(--space-1);
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
}
@media (max-width: 1200px) {
  .dot-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
