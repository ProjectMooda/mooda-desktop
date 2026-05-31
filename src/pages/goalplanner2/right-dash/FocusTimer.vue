<template>
  <div class="timer-section">
    <div class="circular-timer">
      <svg viewBox="0 0 36 36" class="timer-svg">
        <path
          class="timer-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          class="timer-fill"
          :class="{
            'is-running': isRunning,
            'is-finished': timeLeft === 0 && !isRunning && totalTime > 0
          }"
          :stroke-dasharray="`${timerProgress}, 100`"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div class="timer-text-overlay">
        <span class="time-display">{{ formattedTime }}</span>
        <span class="time-label">{{
          isRunning
            ? '집중하는 중...'
            : timeLeft === 0 && totalTime > 0
              ? '완료됨!'
              : '준비 완료'
        }}</span>
      </div>
    </div>

    <div class="timer-controls">
      <div v-if="!isRunning && timeLeft === totalTime" class="timer-setup">
        <div class="time-presets">
          <BaseButton
            :size="2"
            :active="totalTime === 10 * 60"
            @click="setTimer(10)"
            >10분</BaseButton
          >
          <BaseButton
            :size="2"
            :active="totalTime === 30 * 60"
            @click="setTimer(30)"
            >30분</BaseButton
          >
          <BaseButton
            :size="2"
            :active="totalTime === 60 * 60"
            @click="setTimer(60)"
            >1시간</BaseButton
          >
        </div>

        <div class="custom-time-input">
          <input
            type="number"
            v-model.number="customMinutes"
            placeholder="직접 입력 (분)"
            min="1"
            @keyup.enter="setCustomTimer"
          />
          <BaseButton :size="3" variant="primary" @click="setCustomTimer"
            >설정</BaseButton
          >
        </div>
      </div>

      <div class="action-buttons">
        <BaseButton
          :size="5"
          variant="primary"
          class="flex-1"
          @click="toggleTimer"
        >
          {{
            isRunning ? '일시정지' : timeLeft === 0 ? '다시 시작' : '집중 시작'
          }}
        </BaseButton>
        <BaseButton
          v-if="timeLeft !== totalTime"
          :size="4"
          variant="secondary"
          @click="resetTimer"
        >
          초기화
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import BaseButton from '@/global-ui/BaseButton.vue'

const totalTime = ref(30 * 60)
const timeLeft = ref(30 * 60)
const isRunning = ref(false)
const customMinutes = ref<number | ''>('')
let timerId: ReturnType<typeof setInterval> | null = null
let targetEndTime = 0

const timerProgress = computed(() =>
  totalTime.value === 0 ? 0 : (timeLeft.value / totalTime.value) * 100
)

const formattedTime = computed(() => {
  const h = Math.floor(timeLeft.value / 3600)
  const m = Math.floor((timeLeft.value % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
})

const setTimer = (mins: number) => {
  if (mins <= 0) return
  totalTime.value = mins * 60
  timeLeft.value = mins * 60
  customMinutes.value = ''
}

const setCustomTimer = () => {
  if (typeof customMinutes.value === 'number' && customMinutes.value > 0) {
    setTimer(customMinutes.value)
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    if (timerId) clearInterval(timerId)
    isRunning.value = false
    timeLeft.value = Math.max(
      0,
      Math.round((targetEndTime - Date.now()) / 1000)
    )
  } else {
    if (timeLeft.value <= 0) resetTimer()
    isRunning.value = true
    targetEndTime = Date.now() + timeLeft.value * 1000
    timerId = setInterval(() => {
      const remaining = Math.round((targetEndTime - Date.now()) / 1000)
      if (remaining > 0) timeLeft.value = remaining
      else {
        timeLeft.value = 0
        isRunning.value = false
        if (timerId) clearInterval(timerId)
      }
    }, 500)
  }
}

const resetTimer = () => {
  if (timerId) clearInterval(timerId)
  isRunning.value = false
  timeLeft.value = totalTime.value
}

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<style scoped>
.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 10px;
  width: 100%;
}
.circular-timer {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.timer-bg {
  fill: none;
  stroke: var(--bg-hover, #f2f2f7);
  stroke-width: 1.5;
}
.timer-fill {
  fill: none;
  stroke: var(--color-primary, #007aff);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition:
    stroke-dasharray 0.5s linear,
    stroke 0.3s ease;
}
.timer-fill.is-running {
  stroke: #ff9f0a;
}
.timer-fill.is-finished {
  stroke: #34c759;
}

.timer-text-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.time-display {
  font-size: 42px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-main, #1d1d1f);
}
.time-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted, #8e8e93);
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.timer-setup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.time-presets {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.custom-time-input {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.custom-time-input input {
  width: 120px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e5e5ea);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  text-align: center;
}
.custom-time-input input:focus {
  border-color: var(--text-main, #1d1d1f);
}

.action-buttons {
  display: flex;
  gap: 8px;
}
.flex-1 {
  flex: 1;
}
</style>
