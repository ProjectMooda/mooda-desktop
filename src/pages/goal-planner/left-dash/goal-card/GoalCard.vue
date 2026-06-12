<template>
  <article
    class="goal-card"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- 헤더 -->
    <div class="g-head">
      <div class="g-meta" @click="$emit('open')">
        <div class="g-title-row">
          <h4 class="g-title">{{ goal.title }}</h4>
          <span class="g-status-pill" :class="statusPillClass">
            <i :class="statusIcon" aria-hidden="true"></i>
            {{ statusLabel }}
          </span>
        </div>
        <div class="g-date-row">
          <i class="ti ti-calendar g-date-icon" aria-hidden="true"></i>
          <span class="g-date"
            >{{ goal.startDate }} – {{ goal.endDate || '미정' }}</span
          >
        </div>
      </div>
    </div>

    <!-- 진행바 -->
    <div class="g-bar-block">
      <div class="g-bar-header">
        <span class="g-bar-label">진행률</span>
        <span class="g-bar-stat">
          {{ doneCount }} / {{ totalCount }} 완료 · {{ progressPercent }}%
        </span>
      </div>
      <div class="g-bar-track">
        <div class="g-bar-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>

    <!-- 마일스톤 리스트 -->
    <div class="g-list-wrap">
      <GlobalTaskListArea
        :items="displayMilestones"
        text-key="title"
        empty-message="마일스톤이 없습니다"
        list-type="category"
        @update="handleMilestoneUpdate"
        @delete="removeMilestone"
        @item-click="handleMilestoneClick"
      />
    </div>

    <!-- 푸터: 항상 노출 -->
    <div class="g-footer">
      <button
        class="g-btn g-btn-archive"
        title="보관함으로 이동"
        @click.stop.prevent="store.toggleGoalArchive(goal.id)"
      >
        <i class="ti ti-archive" aria-hidden="true"></i>
        보관하기
      </button>
      <button
        class="g-btn g-btn-danger"
        title="목표 삭제"
        @click.stop.prevent="openDeleteAlert"
      >
        <i class="ti ti-trash" aria-hidden="true"></i>
        삭제
      </button>
    </div>

    <GlobalDeleteAlert
      v-model="isAlertOpen"
      title="목표 삭제"
      message="이 목표를 삭제하시겠습니까?&#10;(연결된 마일스톤과 할 일도 삭제됩니다)"
      confirm-text="삭제"
      :show-cancel="true"
      :is-danger="true"
      @confirm="handleConfirmDelete"
    />
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useScheduleStore,
  type Goal,
  type Milestone
} from '@/stores/useScheduleStore'
import GlobalTaskListArea from '@/global-components/global-task-list-area/GlobalTaskListArea.vue'
import GlobalDeleteAlert from '@/global-components/global-modal/global-modal-alert/GlobalDeleteAlert.vue'

// open: 목표 헤더 클릭 → GoalDetailModal 열기 (마일스톤 목록 화면)
// open-milestone: 마일스톤 아이템 클릭 → GoalDetailModal 열기 (MilestoneWorkspace 화면)
const emit = defineEmits(['open', 'open-milestone'])
const props = defineProps<{ goal: Goal }>()
const store = useScheduleStore()

const isAlertOpen = ref(false)
const hovered = ref(false)

const goalMilestones = computed(() =>
  store.milestones
    .filter((m) => m.goalId === props.goal.id)
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
)

// 카드에는 최대 3개까지만 노출
const displayMilestones = computed(() => goalMilestones.value.slice(0, 3))

const goalSchedules = computed(() => {
  const milestoneIds = goalMilestones.value.map((m) => m.id)
  return store.schedules.filter(
    (s) => s.goalId === props.goal.id || milestoneIds.includes(s.milestoneId!)
  )
})

const totalCount = computed(() =>
  goalSchedules.value.length > 0
    ? goalSchedules.value.length
    : goalMilestones.value.length
)

const doneCount = computed(() =>
  goalSchedules.value.length > 0
    ? goalSchedules.value.filter((s) => s.done).length
    : goalMilestones.value.filter((m) => m.done).length
)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((doneCount.value / totalCount.value) * 100)
})

// 상태 pill — 0%: 시작 전 / 1~99%: 진행 중 / 100%: 완료
const statusLabel = computed(() => {
  if (progressPercent.value === 100) return '완료'
  if (progressPercent.value === 0) return '시작 전'
  return '진행 중'
})

const statusIcon = computed(() => {
  if (progressPercent.value === 100) return 'ti ti-circle-check'
  if (progressPercent.value === 0) return 'ti ti-circle-dashed'
  return 'ti ti-progress'
})

const statusPillClass = computed(() => {
  if (progressPercent.value === 100) return 'pill--done'
  if (progressPercent.value === 0) return 'pill--idle'
  return 'pill--active'
})

const handleMilestoneUpdate = (updatedItem: Milestone) => {
  const target = store.milestones.find((m) => m.id === updatedItem.id)
  if (target) {
    target.done = updatedItem.done
    store.saveData()
  }
}

const removeMilestone = (msId: number) => {
  store.schedules = store.schedules.filter((s) => s.milestoneId !== msId)
  store.milestones = store.milestones.filter((m) => m.id !== msId)
  store.saveData()
}

// 마일스톤 아이템 클릭 → 부모로 전달
const handleMilestoneClick = (milestone: Milestone) => {
  emit('open-milestone', milestone)
}

const openDeleteAlert = () => {
  isAlertOpen.value = true
}

const handleConfirmDelete = () => {
  store.removeGoal(props.goal.id)
}
</script>

<style scoped>
.goal-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 270px;
  padding: 18px;
  background: var(--bg-card, #ffffff);
  border: 0.5px solid var(--border-color);
  border-radius: 16px;
  transition: border-color 0.18s ease;
}
.goal-card:hover {
  border-color: var(--border-color-hover, rgba(0, 0, 0, 0.18));
}

/* ── 헤더 ── */
.g-head {
  cursor: pointer;
}
.g-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 3px;
  margin: -3px;
  border-radius: 8px;
  transition: background 0.15s;
}
.g-meta:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

.g-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.g-title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.35;
}

/* 상태 pill */
.g-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 0.5px solid;
  flex-shrink: 0;
  white-space: nowrap;
}
.g-status-pill i {
  font-size: 11px;
}

.pill--active {
  background: #eeedfe;
  color: #3c3489;
  border-color: #afa9ec;
}
.pill--done {
  background: #eaf3de;
  color: #27500a;
  border-color: #97c459;
}
.pill--idle {
  background: var(--bg-muted, #f5f5f5);
  color: var(--text-sub);
  border-color: var(--border-color);
}

.g-date-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.g-date-icon {
  font-size: 12px;
  color: var(--text-sub);
}
.g-date {
  font-size: 11px;
  color: var(--text-sub);
}

/* ── 진행바 ── */
.g-bar-block {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.g-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.g-bar-label {
  font-size: 11px;
  color: var(--text-sub);
}
.g-bar-stat {
  font-size: 11px;
  color: var(--text-sub);
  font-variant-numeric: tabular-nums;
}
.g-bar-track {
  height: 5px;
  background: var(--border-color);
  border-radius: 99px;
  overflow: hidden;
}
.g-bar-fill {
  height: 100%;
  background: #7f77dd;
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ── 마일스톤 리스트 ── */
.g-list-wrap {
  flex: 1;
  min-height: 80px;
  overflow: hidden;
  margin: 0 -8px;
}

/* ── 푸터 ── */
.g-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 0.5px solid var(--border-color);
  margin-top: auto;
}

.g-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  padding: 4px 9px;
  border-radius: 6px;
  border: 0.5px solid transparent;
  background: none;
  cursor: pointer;
  transition: all 0.15s ease;
}
.g-btn i {
  font-size: 13px;
}

.g-btn-archive {
  color: var(--text-sub);
  border-color: var(--border-color);
}
.g-btn-archive:hover {
  color: var(--text-main);
  border-color: var(--border-color-hover, rgba(0, 0, 0, 0.2));
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

.g-btn-danger {
  color: var(--color-danger, #a32d2d);
}
.g-btn-danger:hover {
  background: #fcebeb;
  border-color: #f09595;
}
</style>
