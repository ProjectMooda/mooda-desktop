<template>
  <div class="goal-list-view relative">
    <!-- 좌측: 목표(Goal) 기본 정보 -->
    <div class="info-section">
      <div class="form-group">
        <label>목표 타이틀</label>
        <input
          type="text"
          v-model="goal.title"
          class="s-input title-input"
          @change="store.saveData"
        />
      </div>

      <div class="form-group">
        <label>목표 기간</label>
        <div class="date-row">
          <input
            type="date"
            v-model="goal.startDate"
            class="s-input flex-1"
            @change="store.saveData"
          />
          <span class="date-dash">~</span>
          <input
            type="date"
            v-model="goal.endDate"
            class="s-input flex-1"
            @change="store.saveData"
          />
        </div>
      </div>

      <div class="form-group">
        <label>테마 색상</label>
        <div class="color-picker">
          <button
            v-for="color in palette"
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :class="{ active: (goal.color || '#3b82f6') === color }"
            @click="changeGoalColor(color)"
          ></button>
        </div>
      </div>

      <div class="progress-section mt-auto">
        <div class="progress-header">
          <label>전체 Task 진행률</label>
          <span class="pct-text" :style="{ color: goal.color || '#4f46e5' }"
            >{{ calculateProgress }}%</span
          >
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: calculateProgress + '%',
              backgroundColor: goal.color || '#4f46e5'
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 우측: 마일스톤 영역 -->
    <div class="ms-section relative">
      <div class="view-container">
        <div class="ms-header-row mb-4">
          <div class="flex-row gap-2 items-center">
            <label>마일스톤 (기간별 목표)</label>
            <span class="ms-count">총 {{ goalMilestones.length }}개</span>
          </div>
          <button @click="$emit('open-create')" class="btn-primary">
            마일스톤 추가
          </button>
        </div>

        <div class="search-row">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="마일스톤 타이틀 검색..."
            class="s-input search-input"
          />
        </div>

        <div class="ms-list-container">
          <div
            v-for="ms in filteredMilestones"
            :key="ms.id"
            class="ms-card cursor-pointer"
            @click="$emit('open-detail', ms)"
          >
            <div class="ms-summary">
              <div
                class="ms-color-bar"
                :style="{ backgroundColor: goal.color || '#3b82f6' }"
              ></div>
              <div class="ms-content min-w-0">
                <div class="ms-meta">
                  <span class="ms-badge bg-gray">마일스톤</span>
                  <span class="ms-date"
                    >{{ (ms.startDate || '').slice(5).replace('-', '/') }} ~
                    {{
                      (ms.endDate || '미정').slice(5).replace('-', '/')
                    }}</span
                  >
                  <span class="ms-task-count"
                    >완료 {{ getCompletedCount(ms.id) }} /
                    {{ getTotalTaskCount(ms.id) }}</span
                  >
                </div>
                <div class="ms-title">{{ ms.summary }}</div>
              </div>
              <div class="ms-actions shrink-0 text-gray-400">〉</div>
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

const props = defineProps<{ goal: Goal }>()
defineEmits(['open-detail', 'open-create'])
const store = useScheduleStore()

const palette = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#71717a'
]
const changeGoalColor = (color: string) => {
  props.goal.color = color
  store.saveData()
}

const calculateProgress = computed(() => {
  const tasks = store.schedules.filter(
    (s) => s.goalId === props.goal.id && s.type === 'task'
  )
  if (!tasks.length) return 0
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
})

const searchQuery = ref('')
const goalMilestones = computed(() =>
  store.schedules.filter(
    (s) => s.goalId === props.goal.id && s.type === 'milestone'
  )
)

const filteredMilestones = computed(() => {
  if (!searchQuery.value.trim()) return goalMilestones.value
  return goalMilestones.value.filter((m) =>
    m.summary?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getTotalTaskCount = (msId: number) =>
  store.schedules.filter((s) => s.type === 'task' && s.milestoneId === msId)
    .length
const getCompletedCount = (msId: number) =>
  store.schedules.filter(
    (s) => s.type === 'task' && s.milestoneId === msId && s.done
  ).length
</script>

<style scoped>
/* 공통 유틸리티 */
.flex-1 {
  flex: 1;
}
.shrink-0 {
  flex-shrink: 0;
}
.cursor-pointer {
  cursor: pointer;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-auto {
  margin-top: auto;
}
.gap-2 {
  gap: 8px;
}
.items-center {
  align-items: center;
}
.flex-row {
  display: flex;
}

/* 레이아웃 & 폼 */
.goal-list-view {
  display: flex;
  height: 100%;
  gap: 32px;
  background: #fafafa;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}
.info-section {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
  background: #fff;
  border-right: 1px solid #f4f4f5;
}
.ms-section {
  flex: 1;
  padding: 32px 32px 32px 0;
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
  font-size: 13px;
  font-weight: 700;
  color: #52525b;
  margin-bottom: 8px;
}
.s-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  color: #27272a;
}
.s-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.title-input {
  font-size: 16px;
  font-weight: 700;
  padding: 14px 16px;
}
.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-dash {
  color: #a1a1aa;
  font-weight: 600;
}

.btn-primary {
  background: #27272a;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-size: 13px;
}
.btn-primary:hover {
  background: #3f3f46;
}

/* 마일스톤 목록 영역 */
.search-row {
  position: relative;
  margin-bottom: 16px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #a1a1aa;
}
.search-input {
  padding-left: 38px;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ms-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ms-header-row label {
  font-size: 16px;
  font-weight: 800;
  color: #27272a;
  margin: 0;
}
.ms-count {
  font-size: 13px;
  font-weight: 600;
  color: #71717a;
  background: #e4e4e7;
  padding: 4px 10px;
  border-radius: 20px;
}

.ms-list-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.ms-card {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
  transition: 0.2s;
}
.ms-card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}
.ms-summary {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 14px;
}
.ms-color-bar {
  width: 4px;
  height: 36px;
  border-radius: 2px;
}
.ms-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.ms-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ms-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.bg-gray {
  background: #f4f4f5;
  color: #52525b;
}
.ms-date {
  font-size: 12px;
  font-weight: 700;
  color: #71717a;
}
.ms-task-count {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-left: auto;
}
.ms-title {
  font-size: 15px;
  font-weight: 600;
  color: #27272a;
}
.ms-actions {
  font-size: 12px;
  color: #a1a1aa;
}
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #a1a1aa;
  font-size: 14px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #e4e4e7;
}

/* 색상 & 진행률 */
.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: 0.2s;
}
.color-swatch.active {
  outline: 2px solid #27272a;
  outline-offset: 2px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}
.progress-header label {
  font-size: 13px;
  font-weight: 700;
  color: #52525b;
  margin: 0;
}
.pct-text {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}
.progress-track {
  height: 12px;
  background: #f4f4f5;
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
}
</style>
