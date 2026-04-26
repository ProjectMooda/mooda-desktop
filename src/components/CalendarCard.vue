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

        <div
          class="dot-wrap"
          v-if="date.currentMonth && scheduleStore.hasTasks(date.full)"
        >
          <div class="dot task-dot"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore'

const scheduleStore = useScheduleStore()

// 1. 타입 정의 추가 (에러 방지)
interface CalendarDate {
  day: string | number
  full: string
  currentMonth: boolean
  isToday: boolean
}

// 2. 누락된 상태값 선언
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 오늘 날짜 문자열 (YYYY-MM-DD 포맷, 한국 시간 기준)
const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// 3. 달력 날짜 계산
const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const lastDate = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate()
  const dates: CalendarDate[] = []

  // 이전 달의 빈 공간 채우기
  for (let i = 0; i < firstDay; i++) {
    dates.push({
      day: '',
      full: `empty-start-${i}`, // key 중복 방지를 위해 start 명시
      currentMonth: false,
      isToday: false
    })
  }

  // 이번 달 날짜 채우기
  for (let i = 1; i <= lastDate; i++) {
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dates.push({
      day: i,
      full,
      currentMonth: true,
      isToday: full === todayString // 오늘 날짜 여부 판단
    })
  }

  // ⭐️ 핵심: 달력이 항상 6주(총 42칸)를 유지하도록 다음 달 빈 공간 채우기
  const TOTAL_CELLS = 42; 
  const remainingCells = TOTAL_CELLS - dates.length;
  
  for (let i = 0; i < remainingCells; i++) {
    dates.push({
      day: '',
      full: `empty-end-${i}`, // key 중복 방지를 위해 end 명시
      currentMonth: false,
      isToday: false
    })
  }

  return dates
})

// 4. 월 변경 함수
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

// 5. 날짜 선택 함수 (누락분 추가)
const selectDate = (date: CalendarDate) => {
  if (date.currentMonth) {
    scheduleStore.selectedDate = date.full
  }
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
/* 3. 캘린더 & Task */

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
  gap: 6px;
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
  padding-top: 10px;
  cursor: pointer;
  transition: 0.2s;
  overflow: hidden;
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
  font-size: 14px;
  font-weight: 600;
  color: #3f3f46;
}
.cal-cell.today .date-num {
  color: #4f46e5;
  font-weight: 800;
}
.dot-wrap {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
  padding: 0 4px;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.task-dot {
  background: #d4d4d8;
}

</style>
