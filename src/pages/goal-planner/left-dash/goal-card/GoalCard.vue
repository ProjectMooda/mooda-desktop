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

          <div class="action-buttons-group">
            <BaseButton
              :size="1"
              variant="ghost"
              icon-only
              title="보관함으로 이동"
              class="card-action-btn"
              @click.stop.prevent="store.toggleGoalArchive(goal.id)"
            >
              📥
            </BaseButton>

            <BaseDeleteButton
              variant="rounded"
              class="btn-delete"
              @click.stop.prevent="openDeleteAlert"
            />
          </div>
        </div>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <div class="ms-list-wrapper min-h-0">
      <div class="ms-list">
        <GlobalTaskListArea
          :items="goalMilestones"
          text-key="title"
          empty-message="등록된 마일스톤이 없습니다."
          @update="handleMilestoneUpdate"
          @delete="removeMilestone"
        />
      </div>
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
import { ref, computed } from 'vue' // 🌟 ref 추가
import {
  useScheduleStore,
  type Goal,
  type Milestone
} from '@/stores/useScheduleStore'
import GlobalTaskListArea from '@/global-components/global-task-list-area/GlobalTaskListArea.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import GlobalDeleteAlert from '@/global-components/global-modal/global-modal-alert/GlobalDeleteAlert.vue'

const emit = defineEmits(['open'])
const props = defineProps<{ goal: Goal }>()
const store = useScheduleStore()

// 🌟 추가됨: Alert 모달 상태
const isAlertOpen = ref(false)

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

// 🌟 변경됨: Alert 창 띄우기
const openDeleteAlert = () => {
  isAlertOpen.value = true
}

// 🌟 추가됨: Alert에서 확인 버튼을 눌렀을 때 실행될 실제 삭제 로직
const handleConfirmDelete = () => {
  store.removeGoal(props.goal.id)
}
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
.goal-card {
  display: flex;
  flex-direction: column;
  height: 260px;
  padding: 16px 18px;
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
  font-size: 15px;
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
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary, #007aff);
  letter-spacing: -0.02em;
}

.action-buttons-group {
  display: flex;
  gap: 2px;
  opacity: 0;
  transform: translateX(5px);
  transition: all 0.2s ease;
}

.goal-card:hover .action-buttons-group {
  opacity: 1;
  transform: translateX(0);
}

.btn-delete:hover {
  background-color: #ffe5e5 !important;
  color: #e0352b !important;
}

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

.ms-list-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.ms-list {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
}
.ms-list::-webkit-scrollbar {
  display: none;
}
</style>
