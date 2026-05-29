<template>
  <div class="goal-list-view relative">
    <!-- 좌측: 목표(Goal) 기본 정보 -->
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

      <!-- 🌟 트렌디한 통합형 목표 기간 설정 레이아웃 -->
      <div class="form-group relative">
        <label>목표 기간</label>
        <div class="date-range-picker" :class="{ 'is-active': activeCalendar }">
          <button
            class="date-btn"
            :class="{ 'active-tab': activeCalendar === 'start' }"
            @click="activeCalendar = 'start'"
          >
            {{ goal?.startDate || '시작일 선택' }}
          </button>
          <span class="date-divider">→</span>
          <button
            class="date-btn"
            :class="{ 'active-tab': activeCalendar === 'end' }"
            @click="activeCalendar = 'end'"
          >
            {{ goal?.endDate || '미정' }}
          </button>
        </div>

        <div
          v-if="activeCalendar"
          class="overlay-backdrop"
          @click="activeCalendar = null"
        ></div>

        <div v-if="activeCalendar" class="compact-calendar-dropdown">
          <div class="dropdown-tabs">
            <button
              :class="{ 'is-selected': activeCalendar === 'start' }"
              @click="activeCalendar = 'start'"
            >
              시작일
            </button>
            <button
              :class="{ 'is-selected': activeCalendar === 'end' }"
              @click="activeCalendar = 'end'"
            >
              종료일
            </button>
          </div>

          <div class="calendar-render-area">
            <PopupCalendar
              v-if="activeCalendar === 'start'"
              :model-value="goal?.startDate || ''"
              @update:model-value="
                (val) => {
                  updateGoalField('startDate', val)
                  activeCalendar = 'end'
                }
              "
            />
            <PopupCalendar
              v-if="activeCalendar === 'end'"
              :model-value="goal?.endDate || ''"
              @update:model-value="
                (val) => {
                  updateGoalField('endDate', val)
                  activeCalendar = null
                }
              "
            />
          </div>
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
              color: goal?.color || '#4f46e5',
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
              backgroundColor: goal?.color || '#4f46e5'
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
            <span class="ms-count" style="font-variant-numeric: tabular-nums"
              >총 {{ goalMilestones.length }}개</span
            >
          </div>
          <button class="btn-primary" @click="$emit('open-create')">
            마일스톤 추가
          </button>
        </div>

        <SearchInput
          v-model="searchQuery"
          placeholder="마일스톤 타이틀 검색..."
          class="mb-4"
        />

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
                :style="{ backgroundColor: goal?.color || '#3b82f6' }"
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
                <!-- 🚨 인터페이스 변경에 따라 ms.summary -> ms.title 로 수정 -->
                <div class="ms-title">{{ ms.title }}</div>
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
import PopupCalendar from '@/global-components/calendar/PopupCalendar.vue'
import SearchInput from '@/global-components/search-input/SearchInput.vue'
import BaseInput from '@/global-ui/BaseInput.vue'

const props = defineProps<{ goal: Goal }>()
defineEmits(['open-detail', 'open-create'])
const store = useScheduleStore()

const activeCalendar = ref<'start' | 'end' | null>(null)
const searchQuery = ref('')

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

// 날짜 undefined 방어용 포맷터
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

// 🚨 schedules 배열 대신 새롭게 분리된 store.milestones 배열을 직접 참조
const goalMilestones = computed(() => {
  const milestones = store.milestones || []
  return milestones.filter((m) => m && m.goalId === props.goal?.id)
})

const filteredMilestones = computed(() => {
  if (!searchQuery.value) return goalMilestones.value
  return goalMilestones.value.filter((m) =>
    // 🚨 summary 대신 title로 검색
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
.relative {
  position: relative;
}

/* 레이아웃 */
.goal-list-view {
  display: flex;
  height: 100%;
  gap: 32px;
  background: #fafafa;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}
.info-section {
  flex: 0 0 380px;
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

/* =======================================
   🌟 트렌디한 통합형 날짜 선택 버튼 그룹
======================================= */
.date-range-picker {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  padding: 4px;
  transition: all 0.2s;
}
.date-range-picker.is-active {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.date-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  color: #27272a;
  cursor: pointer;
  transition: background 0.2s;
}
.date-btn:hover {
  background: #f4f4f5;
}
.date-btn.active-tab {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 700;
}
.date-divider {
  color: #a1a1aa;
  padding: 0 8px;
  font-weight: bold;
}

/* =======================================
   🌟 1:1 비율의 콤팩트 캘린더 드롭다운
======================================= */
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 90;
  cursor: default;
}
.compact-calendar-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 탭과 캘린더 영역을 위아래로 분리 */
}

/* 팝업 내부 탭 */
.dropdown-tabs {
  display: flex;
  border-bottom: 1px solid #e4e4e7;
  background: #fafafa;
}
.dropdown-tabs button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #a1a1aa;
  cursor: pointer;
}
.dropdown-tabs button.is-selected {
  color: #4f46e5;
  background: #fff;
  border-bottom: 2px solid #4f46e5;
}

/* 달력이 렌더링되는 영역 (스크롤 추가) */
.calendar-render-area {
  padding: 16px;

  /* 🌟 핵심: 최대 높이를 지정하고, 달력이 이보다 길어지면 내부 스크롤 생성 */
  max-height: 300px; /* 노트북 등 작은 화면에서도 안 잘리도록 제한 (필요시 조절) */
  overflow-y: auto;
  scrollbar-gutter: stable; /* 스크롤바 생성 시 가로 덜컹거림 방지 */
}

/* 내부 달력 컴포넌트가 정사각형 영역을 꽉 채우도록 설정 */
:deep(.calendar-render-area > *) {
  width: 100%;
  height: 100%;
}

/* =======================================
   나머지 폼 요소 & 마일스톤 리스트
======================================= */
/* ✨ BaseInput을 타이틀의 묵직한 느낌에 맞게 커스텀 */
.goal-title-input {
  margin-bottom: 0 !important;
}

.goal-title-input :deep(.base-input) {
  font-size: 16px;
  font-weight: 700; /* 타이틀에 맞게 두꺼운 폰트 적용 */
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
  scrollbar-gutter: stable;
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
