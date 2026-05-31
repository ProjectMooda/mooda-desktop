<template>
  <div class="goal-dashboard-layout">
    <!-- =======================================
         LEFT: 60% (목표 생성 및 리스트 - 자체 스크롤)
    ======================================== -->
    <div class="left-panel">
      <!-- 콤팩트 목표 생성 카드 -->
      <section class="goal-create-card shrink-0">
        <div class="input-row">
          <BaseInput
            v-model="newGoal.title"
            field="goalTitle"
            placeholder="새로운 장기 목표를 세워보세요"
            class="quick-goal-input"
            @keyup.enter="createGoal"
          />
        </div>

        <div class="action-row">
          <div class="date-picker-group">
            <div class="date-pill">
              <span class="pill-icon">🗓️</span>
              <input
                v-model="newGoal.startDate"
                type="date"
                class="bare-date-input"
              />
            </div>
            <span class="date-arrow">→</span>
            <div class="date-pill" :class="{ 'is-empty': !newGoal.endDate }">
              <input
                v-model="newGoal.endDate"
                type="date"
                class="bare-date-input"
              />
            </div>
          </div>

          <button
            class="btn-submit-goal"
            :class="{ 'is-active': newGoal.title.trim().length > 0 }"
            :disabled="!newGoal.title"
            @click="createGoal"
          >
            목표 추가
          </button>
        </div>
      </section>

      <!-- 목표 리스트 스크롤 영역 -->
      <div class="grid-scroll-area">
        <div v-if="activeGoals.length === 0" class="empty-state">
          진행 중인 목표가 없습니다. 새로운 목표를 세워보세요!
        </div>
        <div v-else class="responsive-goal-grid">
          <GoalCard
            v-for="goal in activeGoals"
            :key="goal.id"
            :goal="goal"
            @open="openDetailModal(goal)"
            @archive="toggleGoalArchive(goal)"
          />
        </div>
      </div>
    </div>

    <!-- =======================================
         RIGHT: 40% (목표 보관함 & 타이머)
    ======================================== -->
    <aside class="right-panel">
      <div class="insight-card">
        <!-- 대시보드 헤더 -->
        <div class="insight-header">
          <div>
            <h3>🚀 집중과 성취</h3>
            <p>목표 달성을 위한 몰입의 시간</p>
          </div>
        </div>

        <!-- 🌟 탭 순서 변경: 보관함 -> 타이머 -->
        <div class="milestone-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'archive' }"
            @click="activeTab = 'archive'"
          >
            🗂️ 목표 보관함 <span class="count">{{ archivedGoals.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'timer' }"
            @click="activeTab = 'timer'"
          >
            ⏳ 포커스 타이머
          </button>
        </div>

        <!-- 우측 콘텐츠 렌더링 영역 -->
        <div class="tab-content-container">
          <!-- 1) 🗂️ 목표 보관함 (아카이브) -->
          <transition-group
            v-if="activeTab === 'archive'"
            name="list-fade"
            tag="ul"
            class="archive-list fade-in"
          >
            <li
              v-if="archivedGoals.length === 0"
              key="empty-archive"
              class="empty-state"
            >
              보관함이 비어있습니다.<br />당장 진행하지 않을 목표를 이곳에 잠시
              보관하세요.
            </li>
            <li
              v-for="goal in archivedGoals"
              :key="goal.id"
              class="archived-goal-card"
            >
              <div class="ms-content">
                <span class="ms-title">{{ goal.title }}</span>
                <span class="ms-parent-goal">생성일: {{ goal.startDate }}</span>
              </div>
              <button
                class="btn-icon move-btn"
                title="다시 진행하기 (꺼내기)"
                @click="toggleGoalArchive(goal)"
              >
                📤
              </button>
            </li>
          </transition-group>

          <!-- 2) ⏳ 원형 포커스 타이머 -->
          <div v-else-if="activeTab === 'timer'" class="timer-section fade-in">
            <!-- SVG 원형 프로그레스 -->
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

              <!-- 남은 시간 텍스트 -->
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

            <!-- 타이머 컨트롤 패널 -->
            <div class="timer-controls">
              <!-- 타이머 정지 중 & 남은 시간이 초기상태일 때만 시간 설정 노출 -->
              <div
                v-if="!isRunning && timeLeft === totalTime"
                class="timer-setup"
              >
                <div class="time-presets">
                  <button
                    class="preset-btn"
                    :class="{ active: totalTime === 10 * 60 }"
                    @click="setTimer(10)"
                  >
                    10분
                  </button>
                  <button
                    class="preset-btn"
                    :class="{ active: totalTime === 30 * 60 }"
                    @click="setTimer(30)"
                  >
                    30분
                  </button>
                  <button
                    class="preset-btn"
                    :class="{ active: totalTime === 60 * 60 }"
                    @click="setTimer(60)"
                  >
                    1시간
                  </button>
                </div>

                <!-- 커스텀 시간 입력 -->
                <div class="custom-time-input">
                  <input
                    type="number"
                    v-model.number="customMinutes"
                    placeholder="직접 입력 (분)"
                    min="1"
                    @keyup.enter="setCustomTimer"
                  />
                  <button @click="setCustomTimer">설정</button>
                </div>
              </div>

              <!-- 액션 버튼 -->
              <div class="action-buttons">
                <button class="btn-timer-main" @click="toggleTimer">
                  {{
                    isRunning
                      ? '일시정지'
                      : timeLeft === 0
                        ? '다시 시작'
                        : '집중 시작'
                  }}
                </button>
                <button
                  class="btn-timer-reset"
                  v-if="timeLeft !== totalTime"
                  @click="resetTimer"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 목표 상세 모달 -->
    <transition name="modal-fade">
      <GoalDetailModal
        v-if="isModalOpen && selectedGoal"
        :goal="selectedGoal"
        @close="isModalOpen = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import GoalCard from './goalCard/GoalCard.vue'
import GoalDetailModal from './goalDetailModal/GoalDetailModal.vue'
import type { Goal } from '@/stores/useScheduleStore'
import BaseInput from '@/global-ui/BaseInput.vue'

const store = useScheduleStore()

// =======================================
// 목표 생성 및 관리
// =======================================
const newGoal = reactive({
  title: '',
  startDate: store.selectedDate,
  endDate: ''
})

const createGoal = () => {
  if (!newGoal.title.trim()) return
  store.addGoal({
    title: newGoal.title,
    startDate: newGoal.startDate,
    endDate: newGoal.endDate
  })
  newGoal.title = ''
  newGoal.endDate = ''
}

// 🌟 목표 보관함(Archive) 파생
const activeGoals = computed(() => store.goals.filter((g) => !g.isArchived))
const archivedGoals = computed(() => store.goals.filter((g) => g.isArchived))

const toggleGoalArchive = (goal: any) => {
  goal.isArchived = !goal.isArchived
  store.saveData()
}

// 모달
const isModalOpen = ref(false)
const selectedGoal = ref<Goal | null>(null)
const openDetailModal = (goal: Goal) => {
  selectedGoal.value = goal
  isModalOpen.value = true
}

// =======================================
// 우측 패널 탭 (기본값 archive로 변경)
// =======================================
const activeTab = ref<'archive' | 'timer'>('archive')

// =======================================
// ⏳ 타이머 로직 (Electron 백그라운드 스로틀링 완벽 대응)
// =======================================
const totalTime = ref(30 * 60) // 기본 30분 (1800초)
const timeLeft = ref(30 * 60)
const isRunning = ref(false)
const customMinutes = ref<number | ''>('')

let timerId: ReturnType<typeof setInterval> | null = null
let targetEndTime = 0 // 목표 종료 절대 시각(timestamp) 기록용

const timerProgress = computed(() => {
  if (totalTime.value === 0) return 0
  return (timeLeft.value / totalTime.value) * 100
})

const formattedTime = computed(() => {
  const h = Math.floor(timeLeft.value / 3600)
  const m = Math.floor((timeLeft.value % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  // 1시간 이상일 때만 시간(h) 단위 표시
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
})

const setTimer = (mins: number) => {
  if (mins <= 0) return
  totalTime.value = mins * 60
  timeLeft.value = mins * 60
  customMinutes.value = '' // 프리셋 누르면 커스텀 입력값 리셋
}

const setCustomTimer = () => {
  if (typeof customMinutes.value === 'number' && customMinutes.value > 0) {
    setTimer(customMinutes.value)
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    // ⏸️ 일시정지
    if (timerId) clearInterval(timerId)
    isRunning.value = false
    // 남아있는 시간을 현재 시간 기준으로 정확히 갱신
    timeLeft.value = Math.max(
      0,
      Math.round((targetEndTime - Date.now()) / 1000)
    )
  } else {
    // ▶️ 시작 / 재개
    if (timeLeft.value <= 0) resetTimer() // 완료 후 시작 누르면 리셋 후 시작

    isRunning.value = true
    // 백그라운드 버그 해결 핵심: 절대 시간(Date.now)을 기반으로 목표 종료 시각 설정
    targetEndTime = Date.now() + timeLeft.value * 1000

    timerId = setInterval(() => {
      const now = Date.now()
      const remaining = Math.round((targetEndTime - now) / 1000)

      if (remaining > 0) {
        timeLeft.value = remaining
      } else {
        // 타이머 종료
        timeLeft.value = 0
        isRunning.value = false
        if (timerId) clearInterval(timerId)

        // 브라우저 Notification API 등을 여기에 추가 가능
        // new Notification("집중 시간 종료!", { body: "휴식 시간을 가지세요." });
      }
    }, 500) // 1초(1000ms)보다 빠르게 돌아가게 하여 UI 업데이트 지연을 방지 (계산은 절대시간이므로 밀리지 않음)
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
/* =======================================
   전체 레이아웃 및 스크롤 제어
======================================= */
.goal-dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
  height: calc(100vh - 120px);
  min-height: 500px;
  padding-bottom: 24px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

/* 왼쪽 카드 리스트 자체 스크롤 영역 (데스크탑용) */
.grid-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
}
.grid-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.grid-scroll-area::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.right-panel {
  position: sticky;
  top: 0;
}

/* =======================================
   🌟 반응형 처리 (화면이 작아질 때)
======================================= */
@media (max-width: 1024px) {
  .goal-dashboard-layout {
    display: block; /* 그리드 구조 해제 */
    height: auto; /* 고정 높이 해제 */
  }

  .right-panel {
    display: none; /* 💡 화면이 작아지면 타이머/보관함 숨김 */
  }

  .left-panel {
    height: auto;
    overflow: visible; /* 내부 스크롤 대신 브라우저 전체 스크롤 사용 */
  }

  .grid-scroll-area {
    overflow-y: visible; /* 높이 제한 해제 */
    padding-right: 0;
  }
}

/* =======================================
   목표 생성 카드
======================================= */
.goal-create-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--bg-card, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}
.goal-create-card:focus-within {
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.input-row {
  width: 100%;
}
:deep(.quick-goal-input input) {
  width: 100%;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-main);
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}
:deep(.quick-goal-input input::placeholder) {
  color: var(--text-muted, #c7c7cc);
  font-weight: 600;
}
.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}
.date-picker-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.date-arrow {
  color: var(--text-muted, #aeaeb2);
  font-size: 12px;
}
.date-pill {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: var(--bg-hover, #f2f2f7);
  border-radius: 99px;
  transition: all 0.2s ease;
}
.date-pill:hover {
  background-color: #e5e5ea;
}
.date-pill.is-empty {
  color: var(--text-muted, #8e8e93);
}
.pill-icon {
  font-size: 12px;
  opacity: 0.8;
}
.bare-date-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
}
.bare-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.btn-submit-goal {
  background-color: var(--bg-hover, #f2f2f7);
  color: var(--text-muted, #8e8e93);
  border: none;
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  cursor: not-allowed;
  transition: all 0.2s;
}
.btn-submit-goal.is-active {
  background-color: var(--text-main, #1d1d1f);
  color: #ffffff;
  cursor: pointer;
}
.btn-submit-goal.is-active:hover {
  transform: translateY(-1px);
}
.btn-submit-goal.is-active:active {
  transform: scale(0.96);
}

/* 목표 카드 그리드 */
.responsive-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* =======================================
   RIGHT: INSIGHT CARD & TABS
======================================= */
.insight-card {
  background-color: var(--bg-card, #ffffff);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.insight-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}
.insight-header p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.milestone-tabs {
  display: flex;
  gap: 8px;
  background-color: var(--bg-hover, #f2f2f7);
  padding: 4px;
  border-radius: 12px;
}
.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.tab-btn.active {
  background: #ffffff;
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.tab-btn .count {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 11px;
}
.tab-btn.active .count {
  background-color: var(--text-main);
  color: #fff;
}

.tab-content-container {
  min-height: 280px;
  position: relative;
}
.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.6;
}

/* =======================================
   🗂️ 1) 목표 보관함 CSS
======================================= */
.archive-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.archived-goal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-hover, #f9f9f9);
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
}
.archived-goal-card:hover {
  background-color: #f2f2f7;
}

.ms-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}
.ms-parent-goal {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.ms-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  opacity: 0.7;
}

.move-btn {
  font-size: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: transform 0.1s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}
.move-btn:hover {
  transform: scale(1.05);
}

/* =======================================
   ⏳ 2) 타이머 CSS
======================================= */
.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 10px;
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
  justify-content: center;
  gap: 4px;
}
.time-display {
  font-size: 42px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-main);
}
.time-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
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
.preset-btn {
  background: var(--bg-hover, #f2f2f7);
  border: none;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
}
.preset-btn:hover {
  background: #e5e5ea;
}
.preset-btn.active {
  background: var(--text-main);
  color: #fff;
}

.custom-time-input {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.custom-time-input input {
  width: 120px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  text-align: center;
}
.custom-time-input input:focus {
  border-color: var(--color-primary);
}
.custom-time-input button {
  background: var(--text-main);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-timer-main {
  flex: 1;
  background-color: var(--text-main);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}
.btn-timer-main:active {
  transform: scale(0.96);
}
.btn-timer-reset {
  background-color: var(--bg-hover, #f2f2f7);
  color: var(--text-sub);
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* 페이드 효과 */
.fade-in {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.list-fade-leave-active {
  position: absolute;
  width: 100%;
}
</style>
