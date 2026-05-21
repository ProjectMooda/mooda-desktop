<!-- src/global-components/calendar/MonthPicker.vue -->
<template>
  <div class="month-picker-wrapper">
    <!-- 투명 오버레이 (바깥 클릭 시 닫힘) -->
    <div class="overlay-backdrop" @click="$emit('close')"></div>

    <!-- 월 선택 드롭다운 -->
    <div class="month-picker-popover">
      <!-- 년도 변경 컨트롤 -->
      <div class="picker-year">
        <button class="icon-btn sm" @click="pickerYear--">‹</button>
        <span class="year-text">{{ pickerYear }}년</span>
        <button class="icon-btn sm" @click="pickerYear++">›</button>
      </div>
      <!-- 1~12월 그리드 -->
      <div class="picker-months">
        <button
          v-for="m in 12"
          :key="m"
          class="month-btn"
          :class="{
            'is-active': pickerYear === currentYear && m - 1 === currentMonth
          }"
          @click="selectMonth(m - 1)"
        >
          {{ m }}월
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  currentYear: number
  currentMonth: number // 0 ~ 11
}>()

const emit = defineEmits(['select', 'close'])

// 팝업 내부에서 년도를 앞뒤로 넘겨보기 위한 로컬 상태
const pickerYear = ref(props.currentYear)

// 부모에서 값이 바뀌면 동기화
watch(
  () => props.currentYear,
  (newVal) => {
    pickerYear.value = newVal
  }
)

const selectMonth = (mIndex: number) => {
  // 선택 완료 시 부모에게 { year, month } 객체 전달
  emit('select', { year: pickerYear.value, month: mIndex })
}
</script>

<style scoped>
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 110;
  cursor: default;
}

.month-picker-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e4e4e7);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: 220px;
  z-index: 120;
}

.picker-year {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.year-text {
  font-size: 14px;
  font-weight: var(--font-bold);
  color: var(--text-main);
}

.picker-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.month-btn {
  background: var(--bg-app);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 8px 0;
  font-size: 13px;
  font-weight: var(--font-semibold);
  color: var(--text-sub);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.month-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

.month-btn.is-active {
  background: var(--text-main);
  color: var(--bg-card);
  font-weight: var(--font-bold);
  border-color: var(--text-main);
}

.icon-btn.sm {
  background: transparent;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.icon-btn.sm:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>
