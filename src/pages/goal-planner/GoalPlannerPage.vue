<template>
  <div class="goal-dashboard-layout">
    <div class="left-panel">
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

          <BaseButton
            :size="3"
            :variant="newGoal.title.trim().length > 0 ? 'primary' : 'secondary'"
            :disabled="!newGoal.title"
            @click="createGoal"
          >
            목표 추가
          </BaseButton>
        </div>
      </section>

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
import { reactive, ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import GoalCard from './left-dash/goal-card/GoalCard.vue'
import GoalDetailModal from './left-dash/goal-detail/GoalDetailModal.vue'
import type { Goal } from '@/stores/useScheduleStore'
import BaseInput from '@/base-ui/BaseInput.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
// 🌟 분리한 우측 패널 컴포넌트 임포트 (경로는 프로젝트에 맞게 수정)
import FocusDashboard from './right-dash/RightDash.vue'

const store = useScheduleStore()

// --- 목표 생성 ---
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

// --- 목표 상태 관리 (진행 중인 것만) ---
const activeGoals = computed(() => store.goals.filter((g) => !g.isArchived))

// --- 모달 ---
const isModalOpen = ref(false)
const selectedGoal = ref<Goal | null>(null)
const openDetailModal = (goal: Goal) => {
  selectedGoal.value = goal
  isModalOpen.value = true
}
</script>

<style scoped>
/* =======================================
   전체 레이아웃 및 반응형
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

.right-panel-wrapper {
  position: sticky;
  top: 0;
}

@media (max-width: 1024px) {
  .goal-dashboard-layout {
    display: block;
    height: auto;
  }
  .right-panel-wrapper {
    display: none;
  } /* 화면 작아지면 우측 패널(FocusDashboard) 통째로 숨김 */
  .left-panel {
    height: auto;
    overflow: visible;
  }
  .grid-scroll-area {
    overflow-y: visible;
    padding-right: 0;
  }
}

/* =======================================
   목표 생성 카드 및 리스트 스타일
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
  color: var(--text-main);
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}
:deep(.quick-goal-input input::placeholder) {
  color: var(--text-muted, #c7c7cc);
}
.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 리스트 빈 상태 / 그리드 */
.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.responsive-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
