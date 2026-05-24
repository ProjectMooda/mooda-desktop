<template>
  <article class="studio-card goal-card">
    <div class="card-top shrink-0">
      <!-- 목표 헤더 (제목, 기간, 진행률, 삭제 버튼) -->
      <div class="goal-header">
        <!-- 제목 클릭 시 상세 모달(MilestoneWorkspace) 오픈 -->
        <div class="title-area min-w-0" @click="$emit('open')">
          <h4>{{ goal.title }}</h4>
          <span class="date-range">
            {{ goal.startDate }} ~ {{ goal.endDate }}
          </span>
        </div>
        <div class="header-actions">
          <div class="pct-text shrink-0">{{ progressPercent }}%</div>
          <Xbutton
            variant="rounded"
            @click.stop.prevent="deleteGoal(goal.id)"
          />
        </div>
      </div>

      <!-- 진행률 프로그레스 바 -->
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 하위 세부 일정 리스트 -->
    <div class="ms-list min-h-0">
      <BaseTaskList
        :items="goalSchedules"
        text-key="summary"
        empty-message="등록된 세부 일정이 없습니다."
        @update="(item) => store.updateSchedule(item.id, { done: item.done })"
        @delete="removeMilestone"
      />
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'
import Xbutton from '@/global-components/ui/Xbutton.vue'
import BaseTaskList from '@/global-components/ui/BaseTaskList.vue'

const emit = defineEmits(['open'])
const props = defineProps<{ goal: Goal }>()
const store = useScheduleStore()

// --- Computed ---
const goalSchedules = computed(() => {
  return (
    store.schedules
      // 🌟 수정됨: 해당 목표에 속하면서, 타입이 'milestone'인 것만 가져오기
      .filter((s) => s.goalId === props.goal.id && s.type === 'milestone')
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
  )
})

const progressPercent = computed(() => {
  const total = goalSchedules.value.length
  if (total === 0) return 0

  const doneCount = goalSchedules.value.filter((m) => m.done).length
  return Math.round((doneCount / total) * 100)
})

// --- Methods ---
const removeMilestone = (msId: number) => {
  store.removeSchedule(msId)
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
