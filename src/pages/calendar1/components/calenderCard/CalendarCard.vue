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
            selected: scheduleStore.selectedDate === date.full,
            dimmed: !date.currentMonth,
            today: date.isToday
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
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore'

const scheduleStore = useScheduleStore()

interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
}

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const dates: CalendarDate[] = []

  for (let i = 0; i < firstDay; i++) {
    dates.push({ day: '', full: `empty-start-${i}`, currentMonth: false, isToday: false })
  }

  for (let i = 1; i <= lastDate; i++) {
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({ day: i, full, currentMonth: true, isToday: full === todayString })
  }

  const TOTAL_CELLS = 42; 
  const remainingCells = TOTAL_CELLS - dates.length;
  
  for (let i = 0; i < remainingCells; i++) {
    dates.push({ day: '', full: `empty-end-${i}`, currentMonth: false, isToday: false })
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
  if (date.currentMonth) {
    scheduleStore.selectedDate = date.full
  }
}

const getDailyIndicators = (dateStr: string) => {
  const counts: Record<string, number> = {}

  if (scheduleStore.goals) {
    scheduleStore.goals.forEach(goal => {
      const msCount = goal.milestones.filter(ms => ms.date === dateStr).length
      if (msCount > 0) {
        const color = goal.color || '#3b82f6'
        counts[color] = (counts[color] || 0) + msCount
      }
    })
  }

  if (scheduleStore.dateTasks && scheduleStore.dateTasks[dateStr]) {
    const taskCount = scheduleStore.dateTasks[dateStr].length
    if (taskCount > 0) {
      const color = '#71717a'
      counts[color] = (counts[color] || 0) + taskCount
    }
  }

  return Object.entries(counts).map(([color, count]) => ({ color, count }))
}
</script>

<style lang="css" scoped>
.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
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
  font-weight: 700;
  margin: 0;
}
.cal-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.icon-btn {
  background: var(--bg-hover);
  border: none;
  color: var(--text-sub);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}
.icon-btn:hover {
  background: var(--border-color);
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 4px;
  flex: 1;
}
.cal-day {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  align-self: end;
  padding-bottom: 4px;
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
  min-height: 70px; /* 인디케이터 공간 확보를 위한 최소 높이 */
}
.cal-cell:hover:not(.dimmed) {
  background: var(--bg-card);
  border-color: #d4d4d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.cal-cell.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
.cal-cell.dimmed {
  opacity: 0.3;
  pointer-events: none;
}
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

/* 💡 6개 이상을 위한 촘촘한 그리드 레이아웃 */
.dot-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2열로 배치하여 6개를 3행으로 수용 */
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
  font-size: 9px; /* 아주 좁은 공간이므로 폰트 크기 축소 */
  font-weight: 700;
  color: #52525b;
  line-height: 1;
}

/* 셀 너비가 너무 좁아질 경우를 대비해 1열로 전환되는 방어 코드 (선택사항) */
@media (max-width: 1200px) {
  .dot-wrap {
    grid-template-columns: 1fr;
  }
}
</style>