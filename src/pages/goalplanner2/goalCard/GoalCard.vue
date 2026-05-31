<template>
  <article class="studio-card goal-card">
    <div class="card-top shrink-0">
      <div class="goal-header">
        <div class="title-area min-w-0" @click="$emit('open')">
          <h4>{{ goal.title }}</h4>
          <span class="date-range" style="font-variant-numeric: tabular-nums">
            {{ goal.startDate }} ~ {{ goal.endDate || '미정' }}
          </span>
        </div>
        <div class="header-actions">
          <div
            class="pct-text shrink-0"
            style="font-variant-numeric: tabular-nums"
          >
            {{ progressPercent }}%
          </div>
          <Xbutton
            variant="rounded"
            class="btn-delete"
            @click.stop.prevent="deleteGoal(goal.id)"
          />
        </div>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 하단 페이드 아웃 효과를 주어 좁은 영역에서도 예쁘게 보이도록 처리 -->
    <div class="ms-list-wrapper min-h-0">
      <div class="ms-list">
        <TaskListArea
          :items="goalMilestones"
          text-key="title"
          empty-message="등록된 마일스톤이 없습니다."
          @update="handleMilestoneUpdate"
          @delete="removeMilestone"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useScheduleStore,
  type Goal,
  type Milestone
} from '@/stores/useScheduleStore'
import Xbutton from '@/global-ui/Xbutton.vue'
import TaskListArea from '@/global-components/task-list-area/TaskListArea.vue'

const emit = defineEmits(['open'])
const props = defineProps<{ goal: Goal }>()
const store = useScheduleStore()

const goalMilestones = computed(() => {
  return store.milestones
    .filter((m) => m.goalId === props.goal.id)
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
})

const progressPercent = computed(() => {
  const total = goalMilestones.value.length
  if (total === 0) return 0
  const doneCount = goalMilestones.value.filter((m) => m.done).length
  return Math.round((doneCount / total) * 100)
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

const deleteGoal = (id: number) => {
  store.removeGoal(id)
}
</script>

<style scoped>
/* =======================================
   목표 카드 콤팩트 레이아웃
======================================= */
.goal-card {
  display: flex;
  flex-direction: column;
  height: 260px; /* 기존 380px에서 대폭 축소 */
  padding: 16px 18px; /* 여백 축소 */
  background-color: var(--bg-card, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.goal-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

/* =======================================
   상단 헤더
======================================= */
.card-top {
  margin-bottom: 16px;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.title-area {
  cursor: pointer;
  flex: 1;
  padding: 4px;
  margin: -4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.title-area:hover {
  background-color: var(--bg-hover, #f2f2f7);
}

.title-area h4 {
  font-size: 15px; /* 타이틀 크기 축소 */
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-range {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-sub, #8e8e93);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pct-text {
  font-size: 18px; /* 포인트 텍스트 크기 조정 */
  font-weight: 800;
  color: var(--color-primary, #007aff);
  letter-spacing: -0.02em;
}

.btn-delete {
  opacity: 0.3;
  transform: scale(0.85);
  transition: all 0.2s;
}
.goal-card:hover .btn-delete {
  opacity: 1;
}

/* =======================================
   프로그레스 바
======================================= */
.progress-track {
  height: 5px;
  background-color: var(--bg-hover, #f2f2f7);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary, #007aff);
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* =======================================
   하위 리스트 영역 (페이드 아웃 효과 적용)
======================================= */
.ms-list-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  /* 스크롤 시 아래쪽 내용이 자연스럽게 사라지도록 그라디언트 마스크 적용 */
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.ms-list {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none; /* 파이어폭스 스크롤바 숨김 */
  display: flex;
  flex-direction: column;
}
.ms-list::-webkit-scrollbar {
  display: none;
} /* 크롬 스크롤바 숨김 */
</style>
