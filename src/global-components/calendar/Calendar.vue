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
            'out-range': !date.inRange && date.currentMonth && props.restrictRange
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
            <span class="dot-count">{{ item.count >= 10 ? '9+' : item.count }}</span>
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
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const d = new Date(newVal)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth()
  }
}, { immediate: true })

const isDateInRange = (dateStr: string) => {
  if (!props.rangeStart && !props.rangeEnd) return false
  const start = props.rangeStart || '1970-01-01'
  const end = props.rangeEnd || '9999-12-31'
  return dateStr >= start && dateStr <= end
}

const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const dates: CalendarDate[] = []

  for (let i = 0; i < firstDay; i++) {
    dates.push({ day: '', full: `empty-start-${i}`, currentMonth: false, isToday: false, inRange: false })
  }

  for (let i = 1; i <= lastDate; i++) {
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({ 
      day: i, full, currentMonth: true, 
      isToday: full === todayString,
      inRange: isDateInRange(full)
    })
  }

  const TOTAL_CELLS = 42
  const remainingCells = TOTAL_CELLS - dates.length
  for (let i = 0; i < remainingCells; i++) {
    dates.push({ day: '', full: `empty-end-${i}`, currentMonth: false, isToday: false, inRange: false })
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
  const daySchedules = scheduleStore.schedules.filter(s => {
    const start = s.startDate || dateStr
    const end = s.endDate || start
    return start <= dateStr && end >= dateStr
  })

  const colorMap = new Map<string, number>()

  daySchedules.forEach(s => {
    let color = '#3b82f6'
    if (s.goalId) {
      const goal = scheduleStore.goals.find(g => g.id === s.goalId)
      if (goal && goal.color) color = goal.color
    }
    colorMap.set(color, (colorMap.get(color) || 0) + 1)
  })

  const indicators = Array.from(colorMap.entries()).map(([color, count]) => ({
    color, count
  }))

  return indicators.sort((a, b) => b.count - a.count)
}
</script>
<style scoped>
.studio-card {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e4e4e7);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-head h3 {
  font-size: 18px;
  font-weight: 800;
  color: #27272a;
  margin: 0;
}
.cal-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; 
}
.icon-btn {
  background: var(--bg-hover, #f4f4f5);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #71717a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.icon-btn:hover {
  background: #e4e4e7;
  color: #27272a;
}

/* =======================================
   ✨ 빠져있던 핵심 그리드 레이아웃 ✨
======================================= */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  /* 첫 줄(요일)은 내용물 크기만큼, 나머지 6줄(날짜)은 최소 80px 보장, 공간 남으면 1fr씩 분배 */
  grid-template-rows: auto repeat(6, minmax(80px, 1fr)); 
  gap: 4px;
  flex: 1;
  min-height: 0; /* 부모 뚫고 나가는 것 방지 */
  overflow-y: auto; /* 넘치면 스크롤 생성 */
  padding-right: 4px; /* 스크롤바 여백 */
}

/* 스크롤바 커스텀 */
.cal-grid::-webkit-scrollbar {
  width: 4px;
}
.cal-grid::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 4px;
}

.cal-day {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #a1a1aa;
  padding: 8px 0;
  
  /* ✨ 요일 상단 고정 (스크롤 시 안 넘어감) */
  position: sticky; 
  top: 0;
  background: #fff; 
  z-index: 10;
}

.cal-cell {
  background: #f8f8fa;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 2px;
  cursor: pointer;
  transition: 0.2s;
  overflow: hidden;
  height: 100%; /* 부모 그리드가 정해준 높이(최소 80px)에 꽉 차게 */
}
.cal-cell:hover:not(.dimmed):not(.out-range) {
  background: #fff;
  border-color: #d4d4d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.cal-cell.selected {
  background: #27272a !important;
  border-color: #27272a !important;
}
.cal-cell.selected .date-num, .cal-cell.selected .dot-count {
  color: #fff !important;
}
.cal-cell.dimmed {
  opacity: 0.3;
  pointer-events: none;
}
.cal-cell.in-range { background: #f8fafc; }
.cal-cell.out-range { cursor: not-allowed; opacity: 0.4; background: #fafafa; }

.date-num {
  font-size: 13px;
  font-weight: 600;
  color: #3f3f46;
  margin-bottom: 4px;
}
.cal-cell.today .date-num {
  color: #4f46e5;
  font-weight: 800;
}

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
  font-weight: 700;
  color: #52525b;
  line-height: 1;
}
@media (max-width: 1200px) {
  .dot-wrap { grid-template-columns: 1fr; }
}
</style>