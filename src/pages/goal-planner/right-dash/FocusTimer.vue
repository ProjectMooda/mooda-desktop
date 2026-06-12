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

      <div
        class="timer-text-overlay"
        :class="{ 'is-editable': !isRunning }"
        @click="startEditing"
      >
        <span v-if="!isEditing" class="time-display">{{ formattedTime }}</span>

        <input
          v-else
          ref="timeInputRef"
          v-model="editMinutes"
          type="text"
          maxlength="3"
          class="time-display-input"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
          @keypress="restrictToNumbers"
        />

        <span
          class="time-label"
          :class="{
            'is-active': isRunning || (timeLeft === 0 && totalTime > 0)
          }"
        >
          {{
            isEditing
              ? '분을 입력하세요'
              : isRunning
                ? '집중하는 중'
                : timeLeft === 0 && totalTime > 0
                  ? '목표 달성!'
                  : '숫자를 눌러 시간 변경'
          }}
        </span>
      </div>
    </div>

    <div class="timer-controls">
      <div v-if="!isRunning && timeLeft === totalTime" class="preset-group">
        <BaseButton
          :size="2"
          :variant="totalTime === 10 * 60 ? 'primary' : 'secondary'"
          class="preset-btn"
          @click="setTimer(10)"
        >
          10분
        </BaseButton>
        <BaseButton
          :size="2"
          :variant="totalTime === 30 * 60 ? 'primary' : 'secondary'"
          class="preset-btn"
          @click="setTimer(30)"
        >
          30분
        </BaseButton>
        <BaseButton
          :size="2"
          :variant="totalTime === 60 * 60 ? 'primary' : 'secondary'"
          class="preset-btn"
          @click="setTimer(60)"
        >
          1시간
        </BaseButton>
      </div>

      <div class="action-group">
        <BaseButton
          :size="4"
          variant="primary"
          class="primary-btn"
          @click="toggleTimer"
        >
          <i v-if="isRunning" class="ti ti-player-pause" aria-hidden="true"></i>
          <i
            v-else-if="timeLeft === 0"
            class="ti ti-rotate-clockwise"
            aria-hidden="true"
          ></i>
          <i v-else class="ti ti-player-play" aria-hidden="true"></i>
          <span>{{
            isRunning ? '일시정지' : timeLeft === 0 ? '다시 시작' : '시작'
          }}</span>
        </BaseButton>

        <BaseButton
          v-if="timeLeft !== totalTime"
          :size="4"
          variant="secondary"
          class="reset-btn"
          @click="resetTimer"
        >
          <i class="ti ti-refresh" aria-hidden="true"></i>
          <span>새로고침</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import BaseButton from '@/base-ui/BaseButton.vue'

const totalTime = ref(30 * 60)
const timeLeft = ref(30 * 60)
const isRunning = ref(false)

// 🌟 인라인 편집을 위한 상태
const isEditing = ref(false)
const editMinutes = ref('')
const timeInputRef = ref<HTMLInputElement | null>(null)

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

// 🌟 숫자 터치 시 편집 모드 진입
const startEditing = () => {
  if (isRunning.value) return // 실행 중엔 변경 불가
  isEditing.value = true
  // 현재 설정된 총 시간(분)을 입력창에 띄움
  editMinutes.value = Math.floor(totalTime.value / 60).toString()

  // DOM 업데이트 직후 포커스 & 텍스트 전체 선택
  nextTick(() => {
    if (timeInputRef.value) {
      timeInputRef.value.focus()
      timeInputRef.value.select()
    }
  })
}

// 🌟 편집 완료 (엔터 or 포커스 아웃)
const finishEditing = () => {
  if (!isEditing.value) return // 중복 실행 방지
  isEditing.value = false

  const mins = parseInt(editMinutes.value, 10)
  // 올바른 숫자가 입력되었으면 타이머 업데이트, 아니면 기존 시간 유지
  if (!isNaN(mins) && mins > 0) {
    setTimer(mins)
  }
}

// 키보드 입력 차단 (숫자만 허용)
const restrictToNumbers = (e: KeyboardEvent) => {
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}

// 360분 제한 및 복사/붙여넣기 방어 워처
watch(editMinutes, (newVal) => {
  if (!isEditing.value) return

  let numericVal = newVal.replace(/[^0-9]/g, '').slice(0, 3)
  if (!numericVal) {
    editMinutes.value = ''
    return
  }

  let finalValue =
    parseInt(numericVal, 10) > 360 ? '360' : parseInt(numericVal, 10).toString()

  if (editMinutes.value === finalValue && newVal !== finalValue) {
    editMinutes.value = ''
    nextTick(() => {
      editMinutes.value = finalValue
    })
  } else {
    editMinutes.value = finalValue
  }
})

const setTimer = (mins: number) => {
  if (mins <= 0) return
  totalTime.value = mins * 60
  timeLeft.value = mins * 60
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
  gap: 20px;
  width: 100%;
}

.circular-timer {
  position: relative;
  width: 180px;
  height: 180px;
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
  stroke: var(--bg-hover, #f4f4f5);
  stroke-width: 1.5;
}
.timer-fill {
  fill: none;
  stroke: var(--color-primary, #6366f1);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition:
    stroke-dasharray 0.5s linear,
    stroke 0.3s ease;
}
.timer-fill.is-running {
  stroke: #f59e0b;
}
.timer-fill.is-finished {
  stroke: #10b981;
}

/* 🌟 타이머 숫자 오버레이 영역 */
.timer-text-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

/* 터치하여 편집 가능함을 나타내는 호버 효과 */
.timer-text-overlay.is-editable {
  cursor: pointer;
}
.timer-text-overlay.is-editable:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.03));
}

.time-display {
  font-size: 40px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-main, #27272a);
  line-height: 1;
}

/* 🌟 인라인 입력창 스타일 (기존 텍스트와 완벽히 동일하게) */
.time-display-input {
  width: 100px;
  font-size: 40px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--color-primary, #6366f1);
  background: transparent;
  border: none;
  outline: none;
  text-align: center;
  line-height: 1;
  padding: 0;
  caret-color: var(--color-primary, #6366f1);
}
.time-display-input::placeholder {
  color: var(--text-muted, #a1a1aa);
}

.time-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #a1a1aa);
  transition: color 0.3s ease;
}
.time-label.is-active {
  color: var(--color-primary, #6366f1);
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 260px;
}

.preset-group {
  display: flex;
  gap: 6px;
  width: 100%;
}
.preset-btn {
  flex: 1;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 8px;
  width: 100%;
}
.primary-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
}
.primary-btn i {
  font-size: 18px;
}

/* 🌟 새로고침 버튼 크기 조정 (텍스트가 들어가면서 flex-1 사용) */
.reset-btn {
  flex: 0.6; /* Primary 버튼보다 살짝 작게 비율 조정 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 600;
}
.reset-btn i {
  font-size: 16px;
}
</style>
