<template>
  <div class="goal-dashboard-layout">
    <div class="left-panel">
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

          <BaseButton
            :variant="newGoal.title.trim() ? 'primary' : 'secondary'"
            :disabled="!newGoal.title.trim()"
            :size="3"
            @click="createGoal"
          >
            ↵
          </BaseButton>
        </div>

        <transition name="tray-expand">
          <div v-show="isExpanded" class="quick-action-tray">
            <div class="tray-inner">
              <div class="date-config-row">
                <div class="preset-chips">
                  <BaseButton
                    variant="outline"
                    :size="1"
                    class="preset-chip"
                    @click="setPresetDate(7)"
                    >+ 1주일</BaseButton
                  >
                  <BaseButton
                    variant="outline"
                    :size="1"
                    class="preset-chip"
                    @click="setPresetDate(30)"
                    >+ 1개월</BaseButton
                  >
                  <BaseButton
                    variant="outline"
                    :size="1"
                    class="preset-chip"
                    @click="setEndOfYear"
                    >올해 말</BaseButton
                  >
                </div>
                <GlobalDateRangePicker
                  v-model:start-date="newGoal.startDate"
                  v-model:end-date="newGoal.endDate"
                  align="right"
                />
              </div>
            </div>
          </div>
        </transition>
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
            @open="openDetailModal(goal, null)"
            @open-milestone="(ms) => openDetailModal(goal, ms.id)"
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
        :initial-milestone-id="selectedMilestoneId"
        @close="closeModal"
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
import GlobalDateRangePicker from '@/global-components/global-calendar/GlobalDateRangePicker.vue'
import BaseButton from '@/base-ui/BaseButton.vue'

const store = useScheduleStore()

const composerRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)

const newGoal = reactive({
  title: '',
  startDate: store.selectedDate || new Date().toISOString().split('T')[0],
  endDate: '',
  color: '#ef4444'
})

const resetComposer = () => {
  newGoal.title = ''
  newGoal.startDate =
    store.selectedDate || new Date().toISOString().split('T')[0]
  newGoal.endDate = ''
  newGoal.color = '#ef4444' // 🌟 초기화 시에도 기본 색상 유지
  isExpanded.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    isExpanded.value &&
    composerRef.value &&
    !composerRef.value.contains(event.target as Node)
  ) {
    resetComposer()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

const setPresetDate = (days: number) => {
  const start = new Date(newGoal.startDate)
  start.setDate(start.getDate() + days)
  newGoal.endDate = start.toISOString().split('T')[0]
}

const setEndOfYear = () => {
  newGoal.endDate = `${new Date().getFullYear()}-12-31`
}

const createGoal = () => {
  if (!newGoal.title.trim()) return
  store.addGoal({
    title: newGoal.title,
    startDate: newGoal.startDate,
    endDate: newGoal.endDate,
    color: newGoal.color
  })
  resetComposer()
}

const activeGoals = computed(() => store.goals.filter((g) => !g.isArchived))

const isModalOpen = ref(false)
const selectedGoal = ref<Goal | null>(null)
const selectedMilestoneId = ref<number | null>(null)

const openDetailModal = (goal: Goal, milestoneId: number | null) => {
  selectedGoal.value = goal
  selectedMilestoneId.value = milestoneId
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedGoal.value = null
    selectedMilestoneId.value = null
  }, 300)
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
  height: 100%;
  min-height: 0;
  overflow: visible; /* 자식의 z-index/shadow 보장 */
}

/* =======================================
   🌟 스마트 커맨드 바 (떠 있는 느낌 구현)
======================================= */
.smart-composer {
  flex-shrink: 0;

  /* 🌟 레이아웃 정렬: 하단 스크롤 영역의 (6px + 8px)과 맞춤 */
  margin-right: 14px;

  /* 🌟 자연스러운 위치: 바닥에서 살짝 띄우기 위해 상하 여백 추가 */
  margin-top: 8px;
  margin-bottom: 20px;

  background-color: var(--bg-card);
  border-radius: var(--radius-xl); /* 조금 더 둥글게 만들어 부드러운 느낌 */
  border: 1px solid var(--border-color);

  /* 🌟 핵심: 기본 상태에서 깊고 부드러운 그림자를 주어 '입체감' 표현 */
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 5px rgba(0, 0, 0, 0.03);

  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

/* 🌟 포커스(확장) 시: 더 높이 떠오르고 빛나는 효과 */
.smart-composer.is-focused {
  border-color: var(--color-primary);

  /* 더 크고 부드러운 그림자로 교체 (elevation 증가) */
  box-shadow:
    0 20px 50px rgba(94, 129, 163, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.05);

  /* 아주 미세하게 크기를 키워 시각적 강조 (옵션) */
  transform: translateY(-2px);

  z-index: 1000;
}

.composer-input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 20px; /* 여백을 조금 더 넓혀 쾌적하게 */
  gap: var(--space-3);
  position: relative;
  z-index: 2;
  background: transparent; /* 배경은 부모 스타일을 따름 */
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
  font-size: 20px;
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

/* =======================================
   트레이 영역
======================================= */
.tray-inner {
  padding: 0 20px 18px; /* 여백 통일 */
  border-top: 1px dashed var(--bg-hover);
  margin-top: 0;
}
.date-config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: 16px;
}
.preset-chips {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.preset-chip {
  font-weight: var(--font-semibold);
}

/* 트레이 애니메이션 코드 동일 유지 */
.tray-expand-enter-active,
.tray-expand-leave-active {
  transition:
    max-height 0.3s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.2s ease;
  max-height: 200px;
  overflow: hidden;
}
.tray-expand-enter-from,
.tray-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* =======================================
   하단 리스트 영역 (독립 스크롤)
======================================= */
.grid-scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-gutter: stable;
  padding-right: 8px;
}
.grid-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.grid-scroll-area::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: var(--radius-sm);
}
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

.right-panel-wrapper {
  position: sticky;
  top: 0;
}
</style>
