<template>
  <section class="studio-card cal-section">
    <div class="card-head">
      <button class="icon-btn" @click="changeMonth(-1)">‹</button>
      <h3>
        {{ currentYear }}. {{ String(currentMonth + 1).padStart(2, '0') }}
      </h3>
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

        <div class="dot-wrap" v-if="date.currentMonth">
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

const scheduleStore = useScheduleStore()

const props = defineProps<{
  modelValue?: string
  rangeStart?: string
  rangeEnd?: string
  restrictRange?: boolean // 기간 밖 클릭 방지 여부
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

// 부모 컴포넌트에서 선택한 날짜가 바뀌면 캘린더 월(Month)도 이동
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
  // restrictRange 옵션이 켜져있고, 마일스톤 기간 밖이면 클릭 차단
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
/* 카드 및 캘린더 전체 래퍼 (기존 cal-section 내용 병합) */
.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); /* 16px */
  padding: var(--space-6); /* 24px */
  box-shadow: var(--shadow-md); /* 기존 0 4px 16px 느낌의 변수 */
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5); /* 20px */
}
.card-head h3 {
  font-size: var(--text-lg); /* 18px */
  font-weight: var(--font-bold); /* 800 */
  color: var(--text-main); /* #27272a 대응 */
  margin: 0;
}

.icon-btn {
  background: var(--bg-hover); /* #f4f4f5 대응 */
  border: none;
  width: var(--control-size-md); /* 32px */
  height: var(--control-size-md);
  border-radius: var(--radius-sm); /* 8px */
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-sub); /* #71717a 대응 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}
.icon-btn:hover {
  background: var(--border-color); /* #e4e4e7 대응 */
  color: var(--text-main); /* #27272a 대응 */
}

/* =======================================
   ✨ 핵심 그리드 레이아웃 (유지)
======================================= */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: auto repeat(6, minmax(80px, 1fr));
  gap: var(--space-1); /* 4px */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: var(--space-1);
}

.cal-day {
  text-align: center;
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-bold);
  color: var(--text-muted); /* #a1a1aa 대응 */
  padding: var(--space-2) 0; /* 8px 0 */
  position: sticky;
  top: 0;
  background: var(--bg-card); /* #fff 대응 */
  z-index: var(--z-sticky); /* 10 대응 */
}

.cal-cell {
  background: var(--bg-app); /* #f8f8fa 에 가장 가까운 시스템 앱 배경 */
  border-radius: var(--radius-sm); /* 8px */
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 2px; /* 셀 내부 미세 패딩은 픽셀 유지 */
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
  height: 100%;
}
.cal-cell:hover:not(.dimmed):not(.out-range) {
  background: var(--bg-card); /* #fff */
  border-color: var(--border-color); /* #d4d4d8 대응 */
  box-shadow: var(--shadow-sm); /* 0 2px 8px 대응 */
}

/* 선택, 범위 등 상태값 */
.cal-cell.selected {
  background: var(--text-main) !important; /* #27272a (진한 먹색) 대응 */
  border-color: var(--text-main) !important;
}
.cal-cell.selected .date-num,
.cal-cell.selected .dot-count {
  color: var(--bg-card) !important; /* #fff 대응 */
}
.cal-cell.dimmed {
  opacity: 0.3;
  pointer-events: none;
}
.cal-cell.in-range {
  background: var(
    --color-primary-pale
  ); /* #f8fafc (아주 연한 푸른빛 배경) 대응 */
}
.cal-cell.out-range {
  cursor: not-allowed;
  opacity: 0.4;
  background: var(--bg-hover); /* #fafafa 대응 */
}

.date-num {
  font-size: var(--text-sm); /* 13px (14px 스케일 사용) */
  font-weight: var(--font-semibold); /* 600 */
  color: var(--text-main); /* #3f3f46 대응 */
  margin-bottom: var(--space-1); /* 4px */
}
.cal-cell.today .date-num {
  color: var(--color-primary); /* #4f46e5 (포인트 컬러) 대응 */
  font-weight: var(--font-bold); /* 800 */
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
  background: rgba(0, 0, 0, 0.03); /* 아주 미세한 명암은 픽셀 유지 */
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
  font-weight: var(--font-bold); /* 700 */
  color: var(--text-sub); /* #52525b 대응 */
  line-height: 1;
}
@media (max-width: 1200px) {
  .dot-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
