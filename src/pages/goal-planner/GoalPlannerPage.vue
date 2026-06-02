<template>
  <div class="goal-dashboard-layout">
    <div class="left-panel">
      <!-- 🌟 스마트 커맨드 바 (외부 클릭 감지를 위해 ref="composerRef" 추가) -->
      <section
        ref="composerRef"
        class="smart-composer shrink-0"
        :class="{ 'is-focused': isExpanded }"
      >
        <div class="composer-input-wrapper">
          <div class="input-prefix" :class="{ 'is-active': isExpanded }">
            <span class="sparkle-icon">✨</span>
          </div>

          <input
            v-model="newGoal.title"
            type="text"
            placeholder="어떤 멋진 목표를 달성하고 싶으신가요?"
            class="command-input"
            @focus="isExpanded = true"
            @keyup.enter="createGoal"
          />

          <button
            class="btn-enter"
            :class="{ 'is-ready': newGoal.title.trim() }"
            @click="createGoal"
          >
            ↵
          </button>
        </div>

        <transition name="tray-expand">
          <div v-show="isExpanded" class="quick-action-tray">
            <div class="tray-inner">
              <div class="date-config-row">
                <!-- 🌟 1. 왼쪽: 빠른 설정 (프리셋) -->
                <div class="preset-chips">
                  <button class="chip" @click="setPresetDate(7)">
                    + 1주일
                  </button>
                  <button class="chip" @click="setPresetDate(30)">
                    + 1개월
                  </button>
                  <button class="chip" @click="setEndOfYear">올해 말</button>
                </div>

                <!-- 🌟 2. 오른쪽: 공통 컴포넌트로 교체된 날짜 선택부 -->
                <GlobalDateRangePicker
                  v-model:start-date="newGoal.startDate"
                  v-model:end-date="newGoal.endDate"
                  size="md"
                  align="right"
                />
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- 하단 목표 그리드 리스트 -->
      <div class="grid-scroll-area">
        <div v-if="activeGoals.length === 0" class="empty-state">
          진행 중인 목표가 없습니다. 새로운 목표를 세워보세요!
        </div>
        <div class="responsive-goal-grid">
          <GoalCard
            v-for="goal in activeGoals"
            :key="goal.id"
            :goal="goal"
            @open="openDetailModal(goal)"
          />
        </div>
      </div>
    </div>

    <!-- 우측 포커스 패널 -->
    <div class="right-panel-wrapper">
      <FocusDashboard />
    </div>

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
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import GoalCard from './left-dash/goal-card/GoalCard.vue'
import GoalDetailModal from './left-dash/goal-detail/GoalDetailModal.vue'
import type { Goal } from '@/stores/useScheduleStore'
import FocusDashboard from './right-dash/RightDash.vue'
import GlobalDateRangePicker from '@/global-components/global-calendar/GlobalDateRangePicker.vue' // 🌟 공통 컴포넌트 임포트

const store = useScheduleStore()

const composerRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)

const newGoal = reactive({
  title: '',
  startDate: store.selectedDate || new Date().toISOString().split('T')[0],
  endDate: ''
})

// 🌟 폼 완전 초기화 및 접기
const resetComposer = () => {
  newGoal.title = ''
  newGoal.startDate =
    store.selectedDate || new Date().toISOString().split('T')[0]
  newGoal.endDate = ''
  isExpanded.value = false
}

// 🌟 외부 클릭 감지 로직
const handleClickOutside = (event: MouseEvent) => {
  if (
    isExpanded.value &&
    composerRef.value &&
    !composerRef.value.contains(event.target as Node)
  ) {
    resetComposer()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// 빠른 날짜 계산
const setPresetDate = (days: number) => {
  const start = new Date(newGoal.startDate)
  start.setDate(start.getDate() + days)
  newGoal.endDate = start.toISOString().split('T')[0]
}

const setEndOfYear = () => {
  const year = new Date().getFullYear()
  newGoal.endDate = `${year}-12-31`
}

const createGoal = () => {
  if (!newGoal.title.trim()) return
  store.addGoal({
    title: newGoal.title,
    startDate: newGoal.startDate,
    endDate: newGoal.endDate
  })
  resetComposer()
}

const activeGoals = computed(() => store.goals.filter((g) => !g.isArchived))

const isModalOpen = ref(false)
const selectedGoal = ref<Goal | null>(null)
const openDetailModal = (goal: Goal) => {
  selectedGoal.value = goal
  isModalOpen.value = true
}
</script>

<style scoped>
/* =======================================
   전체 레이아웃
======================================= */
.goal-dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-6);
  align-items: start;
  height: calc(100vh - 120px);
  min-height: 500px;
  padding-bottom: var(--space-6);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  height: 100%;
  overflow: visible;
}

.grid-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--space-2);
  scrollbar-width: thin;
}

.grid-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.grid-scroll-area::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: var(--radius-sm);
}

.right-panel-wrapper {
  position: sticky;
  top: 0;
}

/* =======================================
   스마트 커맨드 바 (Z-index 및 잘림 해결)
======================================= */
.smart-composer {
  position: relative;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

.smart-composer.is-focused {
  border-color: var(--color-primary);
  box-shadow: 0 4px 24px rgba(94, 129, 163, 0.15);
  /* 🌟 하단 카드들에 절대 묻히지 않도록 Z-index 대폭 상향 */
  z-index: 1000;
}

.composer-input-wrapper {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  gap: var(--space-3);
  position: relative;
  z-index: 2;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
}

.input-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.3s;
}
.input-prefix.is-active {
  transform: scale(1.1) rotate(10deg);
}
.sparkle-icon {
  font-size: 18px;
  filter: grayscale(100%) opacity(0.4);
  transition: filter 0.3s;
}
.smart-composer.is-focused .sparkle-icon {
  filter: none;
}

.command-input {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
}
.command-input::placeholder {
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.btn-enter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-muted);
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: not-allowed;
  transition: all 0.2s;
}
.btn-enter.is-ready {
  background: var(--text-main);
  color: var(--bg-card);
  cursor: pointer;
}
.btn-enter.is-ready:active {
  transform: scale(0.95);
}

/* =======================================
   🌟 트레이 영역 (잘림 현상 해결)
======================================= */
/* overflow: hidden; 완전히 제거 */
.quick-action-tray {
}

.tray-inner {
  padding: 0 18px 16px;
  border-top: 1px dashed var(--bg-hover);
  margin-top: 4px;
}

.date-config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: 12px;
}

.preset-chips {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.chip {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius-xl);
  font-size: 12px;
  font-weight: var(--font-semibold);
  color: var(--text-sub);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.chip:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 🌟 마법의 CSS: 트레이가 위아래로 움직이는 '애니메이션 도중'에만 자르고,
   애니메이션이 끝나면 풀어주어 팝업이 튀어나올 수 있게 만듭니다. */
.tray-expand-enter-active,
.tray-expand-leave-active {
  transition:
    max-height 0.3s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.2s ease;
  max-height: 150px;
  overflow: hidden;
}
.tray-expand-enter-from,
.tray-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* =======================================
   하단 리스트
======================================= */
.empty-state {
  text-align: center;
  padding: var(--space-10) 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
}
.responsive-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
</style>
