<template>
  <div class="goal-list-view relative">
    <div class="info-section">
      <div class="form-group">
        <label>목표 타이틀</label>
        <BaseInput
          :model-value="goal?.title || ''"
          field="goalTitle"
          placeholder="목표 타이틀을 입력하세요"
          class="goal-title-input"
          @update:model-value="(val) => updateGoalField('title', val)"
        />
      </div>

      <div class="form-group relative">
        <label>목표 기간</label>
        <GlobalDateRangePicker
          :start-date="goal?.startDate || ''"
          :end-date="goal?.endDate || ''"
          size="lg"
          align="left"
          placeholder-start="시작일 선택"
          placeholder-end="미정"
          @update:start-date="(val) => updateGoalField('startDate', val)"
          @update:end-date="(val) => updateGoalField('endDate', val)"
        />
      </div>

      <div class="form-group">
        <label>테마 색상</label>
        <div class="color-picker">
          <button
            v-for="color in palette"
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :class="{ active: (goal?.color || '#3b82f6') === color }"
            @click="updateGoalField('color', color)"
          ></button>
        </div>
      </div>

      <div class="progress-section mt-auto">
        <div class="progress-header">
          <label>전체 Task 진행률</label>
          <span
            class="pct-text"
            :style="{
              color: goal?.color || 'var(--color-primary)',
              fontVariantNumeric: 'tabular-nums'
            }"
            >{{ calculateProgress }}%</span
          >
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: calculateProgress + '%',
              backgroundColor: goal?.color || 'var(--color-primary)'
            }"
          ></div>
        </div>
      </div>
    </div>

    <div class="ms-section relative">
      <div class="view-container">
        <div class="ms-header-row mb-16">
          <div class="flex-row gap-8 items-center">
            <label>마일스톤 (기간별 목표)</label>
            <span class="ms-count" style="font-variant-numeric: tabular-nums">
              총 {{ goalMilestones.length }}개
            </span>
          </div>
          <button class="btn-primary" @click="$emit('open-create')">
            마일스톤 추가
          </button>
        </div>

        <GlobalSearchInput
          v-model="searchQuery"
          placeholder="마일스톤 타이틀 검색..."
          class="mb-16"
        />

        <div class="ms-list-container">
          <div
            v-for="ms in filteredMilestones"
            :key="ms.id"
            class="ms-card cursor-pointer"
            @click.stop="$emit('open-detail', ms)"
          >
            <div class="ms-summary">
              <div
                class="ms-color-bar"
                :style="{
                  backgroundColor: goal?.color || 'var(--color-primary)'
                }"
              ></div>
              <div class="ms-content min-w-0">
                <div class="ms-meta">
                  <span class="ms-badge bg-gray">마일스톤</span>
                  <span
                    class="ms-date"
                    style="font-variant-numeric: tabular-nums"
                  >
                    {{ formatSafeDate(ms.startDate) }} ~
                    {{ formatSafeDate(ms.endDate) }}
                  </span>
                  <span
                    class="ms-task-count"
                    style="font-variant-numeric: tabular-nums"
                  >
                    완료 {{ getCompletedCount(ms.id) }} /
                    {{ getTotalTaskCount(ms.id) }}
                  </span>
                </div>
                <div class="ms-title">{{ ms.title }}</div>
              </div>
              <div class="ms-actions shrink-0">〉</div>
            </div>
          </div>
          <div v-if="filteredMilestones.length === 0" class="empty-state">
            등록된 마일스톤이 없거나 검색 결과가 없습니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'
import GlobalDateRangePicker from '@/global-components/global-calendar/GlobalDateRangePicker.vue' // 🌟 변경됨
import GlobalSearchInput from '@/global-components/global-search-input/GlobalSearchInput.vue'
import BaseInput from '@/base-ui/BaseInput.vue'

const props = defineProps<{ goal: Goal }>()
defineEmits(['open-detail', 'open-create'])
const store = useScheduleStore()

const searchQuery = ref('')

const palette = [
  '#ff3b30', // danger
  '#ff9500',
  '#ffcc00',
  '#34c759',
  '#5e81a3', // primary
  '#5856d6',
  '#ff2d55',
  '#8e8e93' // sub text
]

const formatSafeDate = (dateStr?: string) => {
  if (!dateStr) return '미정'
  return dateStr.slice(5).replace('-', '/')
}

const updateGoalField = (field: keyof Goal, value: any) => {
  if (!props.goal || !store.goals) return
  const targetGoal = store.goals.find((g) => g.id === props.goal.id)
  if (targetGoal) {
    ;(targetGoal as any)[field] = value
    store.saveData()
  }
}

const calculateProgress = computed(() => {
  const schedules = store.schedules || []
  const tasks = schedules.filter(
    (s) => s && s.goalId === props.goal?.id && s.type === 'task'
  )
  if (!tasks.length) return 0
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
})

const goalMilestones = computed(() => {
  const milestones = store.milestones || []
  return milestones.filter((m) => m && m.goalId === props.goal?.id)
})

const filteredMilestones = computed(() => {
  if (!searchQuery.value) return goalMilestones.value
  return goalMilestones.value.filter((m) =>
    m.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getTotalTaskCount = (msId: number) => {
  const schedules = store.schedules || []
  return schedules.filter(
    (s) => s && s.type === 'task' && s.milestoneId === msId
  ).length
}

const getCompletedCount = (msId: number) => {
  const schedules = store.schedules || []
  return schedules.filter(
    (s) => s && s.type === 'task' && s.milestoneId === msId && s.done
  ).length
}
</script>

<style scoped>
/* =======================================
   공통 유틸리티 (글로벌과 겹치지 않는 특수 속성만 남김)
======================================= */
.cursor-pointer {
  cursor: pointer;
}
.mt-auto {
  margin-top: auto;
}
.relative {
  position: relative;
}

/* =======================================
   레이아웃
======================================= */
.goal-list-view {
  display: flex;
  height: 100%;
  gap: var(--space-8);
  background: var(--bg-app);
  overflow: hidden;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.info-section {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8);
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
}

.ms-section {
  flex: 1;
  padding: var(--space-8) var(--space-8) var(--space-8) 0;
  min-width: 0;
  min-height: 0;
}

.view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  margin-bottom: var(--space-2);
}

/* =======================================
   나머지 폼 요소 & 마일스톤 리스트
   (🌟 팝업 캘린더 관련 잡다한 CSS 대거 삭제 완료!)
======================================= */
.goal-title-input {
  margin-bottom: 0 !important;
}

.goal-title-input :deep(.base-input) {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
}

.btn-primary {
  background: var(--text-main);
  color: var(--bg-card);
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: var(--font-semibold);
  transition: opacity var(--transition-fast);
  font-size: var(--text-sm);
}

.btn-primary:hover {
  opacity: 0.85;
}

.ms-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ms-header-row label {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0;
}

.ms-count {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-sub);
  background: var(--bg-hover);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xl);
}

.ms-list-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-right: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
}

.ms-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-base);
}

.ms-card:hover {
  border-color: var(--text-muted);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.ms-summary {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-3);
}

.ms-color-bar {
  width: 4px;
  height: 36px;
  border-radius: var(--space-1);
}

.ms-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.ms-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ms-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: 2px var(--space-1);
  border-radius: var(--space-1);
}

.bg-gray {
  background: var(--bg-hover);
  color: var(--text-sub);
}

.ms-date {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-sub);
}

.ms-task-count {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  margin-left: auto;
}

.ms-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.ms-actions {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--space-10) 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}

.color-picker {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-fast);
}

.color-swatch.active {
  outline: 2px solid var(--text-main);
  outline-offset: 2px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-2);
}

.progress-header label {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  margin: 0;
}

.pct-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.progress-track {
  height: var(--space-3);
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-sm);
}
</style>
