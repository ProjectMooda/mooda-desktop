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

    <div class="ms-list min-h-0">
      <BaseTaskList
        :items="goalMilestones"
        text-key="title"
        empty-message="등록된 마일스톤이 없습니다."
        @update="handleMilestoneUpdate"
        @delete="removeMilestone"
      />
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
import Xbutton from '@/global-components/ui/Xbutton.vue'
import BaseTaskList from '@/global-components/ui/BaseTaskList.vue'

const emit = defineEmits(['open'])
const props = defineProps<{ goal: Goal }>()
const store = useScheduleStore()

// --- Computed ---

// 🌟 수정됨: 분리된 milestones 배열에서 데이터 가져오기
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

// --- Methods ---

// 🌟 마일스톤 체크박스 상태 업데이트 핸들러
const handleMilestoneUpdate = (updatedItem: Milestone) => {
  const target = store.milestones.find((m) => m.id === updatedItem.id)
  if (target) {
    target.done = updatedItem.done
    store.saveData()
  }
}

// 🌟 마일스톤 삭제 로직 (연관된 Task도 함께 삭제)
const removeMilestone = (msId: number) => {
  // 1. 해당 마일스톤에 종속된 스케줄(태스크) 먼저 일괄 삭제
  store.schedules = store.schedules.filter((s) => s.milestoneId !== msId)

  // 2. 마일스톤 삭제
  store.milestones = store.milestones.filter((m) => m.id !== msId)

  store.saveData()
}

const deleteGoal = (id: number) => {
  store.removeGoal(id)
}
</script>
<style scoped>
/* =======================================
   목표 카드 레이아웃
======================================= */
.goal-card {
  display: flex;
  flex-direction: column;
  height: 380px; /* 고정 높이 유지 */
  padding: var(--space-6); /* 24px */
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); /* 16px */
  box-shadow: var(--shadow-sm); /* 은은한 기본 그림자 */

  /* 전역 변수 transition-base (cubic-bezier) 매핑으로 애플 특유의 쫀득한 모션 구현 */
  transition:
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.goal-card:hover {
  box-shadow: var(--shadow-lg); /* 호버 시 깊이감 있는 그림자로 변경 */
  transform: translateY(-2px);
}

/* =======================================
   상단 헤더 영역 (제목 & 진행률)
======================================= */
.card-top {
  margin-bottom: var(--space-5); /* 20px */
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4); /* 16px */
}

.title-area {
  cursor: pointer;
  border-radius: var(--radius-sm); /* 8px */
  padding: var(--space-1); /* 4px */
  margin: calc(var(--space-1) * -1); /* 네거티브 마진 변수화 */
  transition: background-color var(--transition-fast);
}

.title-area:hover {
  background-color: var(--bg-hover);
}

.title-area h4 {
  font-size: var(--text-lg); /* 18px */
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0 0 var(--space-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-range {
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-medium);
  color: var(--text-sub);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 12px */
}

.pct-text {
  font-size: var(--text-2xl); /* 24px 대제목 급 스케일 매핑 */
  font-weight: var(--font-bold); /* 700 또는 800 */
  color: var(--color-primary); /* 애플 시그니처 블루 */
  letter-spacing: -0.01em;
}

/* =======================================
   프로그레스 바 (진행률)
======================================= */
.progress-track {
  height: 6px;
  background-color: var(--bg-hover);
  border-radius: var(--radius-sm); /* 4px 부근 알약 모양 */
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  /* 가득 차오르는 애니메이션의 이징을 시스템 기본 쿠빅-베지어로 동기화 */
  transition: width var(--transition-base);
}

/* =======================================
   하위 리스트 영역
======================================= */
.ms-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable; /* global.css 구조와 연동 */
  padding-right: var(--space-1); /* 4px */
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px */
}
</style>
