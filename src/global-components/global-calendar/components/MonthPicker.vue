<template>
  <div class="month-picker-wrapper">
    <div class="overlay-backdrop" @click="$emit('close')"></div>

    <div class="month-picker-popover shadow-3">
      <div class="picker-year flex justify-between items-center w-full mb-12">
        <button class="icon-btn sm flex-center shrink-0" @click="pickerYear--">
          ‹
        </button>
        <span class="year-text text-sm font-bold text-main"
          >{{ pickerYear }}년</span
        >
        <button class="icon-btn sm flex-center shrink-0" @click="pickerYear++">
          ›
        </button>
      </div>

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

const pickerYear = ref(props.currentYear)

watch(
  () => props.currentYear,
  (newVal) => {
    pickerYear.value = newVal
  }
)

const selectMonth = (mIndex: number) => {
  emit('select', { year: pickerYear.value, month: mIndex })
}
</script>

<style scoped>
/* =======================================
   오버레이 백드롭
======================================= */
.overlay-backdrop {
  position: fixed;
  inset: 0; /* top, left, width, height를 한 번에 처리 */
  z-index: var(--z-dropdown);
  cursor: default;
}

/* =======================================
   먼스 피커 팝업 레이아웃 (고정 너비 보존)
======================================= */
.month-picker-popover {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 50%;
  transform: translateX(-50%);

  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-3);

  width: 220px; /* 내부 그리드가 깨지지 않도록 절대 너비 유지 */
  z-index: calc(var(--z-dropdown) + 1);
}

.picker-year {
  padding: 0 var(--space-1);
}

/* =======================================
   1~12월 그리드 및 버튼
======================================= */
.picker-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.month-btn {
  background: var(--bg-app);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: var(--space-2) 0;

  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-sub);

  cursor: pointer;
  transition: all var(--transition-fast);
}

.month-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

/* 현재 선택된 월 (BaseButton의 Primary 테마와 동일하게 맞춤) */
.month-btn.is-active {
  background: var(--text-main);
  color: var(--bg-card);
  font-weight: var(--font-bold);
  border-color: var(--text-main);
}

/* =======================================
   좌우 화살표 버튼
======================================= */
.icon-btn.sm {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  color: var(--text-sub);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.icon-btn.sm:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>
