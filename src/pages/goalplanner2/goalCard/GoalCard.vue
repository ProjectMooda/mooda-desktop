<template>
  <article class="studio-card goal-card" @click="$emit('open')">
    <div class="card-top shrink-0">
      <div class="goal-header">
        <div class="title-area min-w-0">
          <h4>{{ goal.title }}</h4>
          <span class="date-range"
            >{{ goal.startDate }} ~ {{ goal.endDate }}</span
          >
        </div>
        <div class="header-actions">
          <div class="pct-text shrink-0">{{ calculateProgress(goal) }}%</div>
          <button
            class="btn-del-goal"
            @click.stop.prevent="deleteGoal(goal.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: calculateProgress(goal) + '%' }"
        ></div>
      </div>

      <div class="add-ms-row">
        <input
          type="date"
          v-model="goal.newMilestoneDate"
          class="s-input w-110 shrink-0"
          :min="goal.startDate"
          :max="goal.endDate"
        />
        <input
          type="text"
          v-model="goal.newMilestoneText"
          placeholder="세부 일정..."
          class="s-input flex-1 min-w-0"
          @keyup.enter="addMilestone(goal)"
        />
        <button @click="addMilestone(goal)" class="btn-outline shrink-0">
          +
        </button>
      </div>
    </div>

    <div class="ms-list min-h-0">
      <div v-for="ms in goal.milestones" :key="ms.id" class="ms-row">
        <label class="studio-cbx sm-cbx shrink-0">
          <input type="checkbox" v-model="ms.done" @change="store.saveData" />
          <span class="cbx-box"></span>
        </label>
        <span class="ms-date shrink-0">{{ ms.date.slice(5) }}</span>
        <span :class="['ms-text flex-1 min-w-0', { 'is-done': ms.done }]">{{
          ms.text
        }}</span>
        <button
          @click="removeMilestone(goal, ms.id)"
          class="btn-del-sm shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/store/useScheduleStore' // 스토어 경로 확인
// 클릭시 detail page 이동
const emit = defineEmits(['open'])

// 부모(GoalPlanner)로부터 goal 데이터를 받습니다
const props = defineProps<{
  goal: any // (만약 Goal 타입을 분리해두셨다면 Goal로 적어주세요)
}>()

const store = useScheduleStore()

// --- Methods ---
const calculateProgress = (goal: any) => {
  if (!goal.milestones || goal.milestones.length === 0) return 0
  return Math.round(
    (goal.milestones.filter((m: any) => m.done).length /
      goal.milestones.length) *
      100
  )
}

const addMilestone = (goal: any) => {
  const mDate = goal.newMilestoneDate || store.selectedDate
  if (!goal.newMilestoneText) return

  goal.milestones.push({
    id: Date.now(),
    date: mDate,
    text: goal.newMilestoneText,
    done: false
  })
  goal.milestones.sort((a: any, b: any) => a.date.localeCompare(b.date))
  goal.newMilestoneText = ''
  store.saveData()
}

const removeMilestone = (goal: any, msId: number) => {
  const idx = goal.milestones.findIndex((m: any) => m.id === msId)
  if (idx > -1) {
    goal.milestones.splice(idx, 1)
    store.saveData()
  }
}

// 스토어의 삭제 기능 호출
const deleteGoal = (id: number) => {
  store.removeGoal(id)
}
</script>

<style scoped>
/* 카드와 세부 일정 관련 CSS만 남김 */
.s-input {
  background: #f8f8fa;
  border: 1px solid var(--border-color);
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}
.s-input:focus {
  border-color: var(--color-primary);
  background: var(--bg-card);
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.goal-card {
  display: flex;
  flex-direction: column;
  height: 380px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.card-top {
  margin-bottom: 16px;
}
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.title-area h4 {
  font-size: 18px;
  color: var(--text-main);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date-range {
  font-size: 12px;
  color: var(--text-sub);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pct-text {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-primary);
}
.btn-del-goal {
  background: none;
  border: none;
  color: #a1a1aa;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
.btn-del-goal:hover {
  color: var(--color-danger, #ef4444);
}
.progress-track {
  height: 6px;
  background: var(--bg-hover);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}
.add-ms-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ms-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ms-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f8f8fa;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.ms-date {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-danger);
  width: 45px;
  padding-top: 2px;
}
.ms-text {
  font-size: 13px;
  color: #27272a;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.is-done {
  text-decoration: line-through;
  color: #a1a1aa;
}
.btn-del-sm {
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  font-size: 14px;
}
.btn-del-sm:hover {
  color: #ef4444;
}

/* 체크박스 CSS */
.studio-cbx {
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;
  display: inline-block;
  margin-top: 3px;
}
.sm-cbx {
  width: 16px;
  height: 16px;
  margin-top: 1px;
}
.studio-cbx input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.cbx-box {
  position: absolute;
  inset: 0;
  border: 2px solid #d4d4d8;
  border-radius: 5px;
  background: var(--bg-card);
  transition: 0.2s;
}
.studio-cbx input:checked ~ .cbx-box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.cbx-box:after {
  content: '';
  position: absolute;
  display: none;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--bg-card);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.sm-cbx .cbx-box:after {
  left: 3px;
  top: 0px;
}
.studio-cbx input:checked ~ .cbx-box:after {
  display: block;
}
</style>
