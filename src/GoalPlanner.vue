<template>
  <div class="goal-layout">
    <section class="studio-card creator-card shrink-0">
      <h3>새로운 장기 목표 설정</h3>
      <div class="input-row flex-wrap">
        <input
          type="text"
          v-model="newGoal.title"
          placeholder="목표 타이틀..."
          class="s-input flex-1 min-w-200"
        />
        <input
          type="date"
          v-model="newGoal.startDate"
          class="s-input w-130 shrink-0"
        />
        <span class="dash shrink-0">-</span>
        <input
          type="date"
          v-model="newGoal.endDate"
          class="s-input w-130 shrink-0"
        />
        <button @click="createGoal" class="btn-primary shrink-0">생성</button>
      </div>
    </section>

    <div class="responsive-goal-grid">
      <GoalCard v-for="goal in store.goals" :key="goal.id" :goal="goal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore' // 스토어 경로를 상황에 맞게 수정하세요
import GoalCard from '@/components/goalcard/GoalCard.vue'

// 스토어 연동
const store = useScheduleStore()

// Goal 생성을 위한 로컬 상태
const newGoal = reactive({
  title: '',
  startDate: store.selectedDate, // 기본값을 스토어의 오늘 날짜로 설정
  endDate: ''
})

// --- Methods ---

const createGoal = () => {
  if (!newGoal.title) return

  store.goals.unshift({
    id: Date.now(),
    title: newGoal.title,
    startDate: newGoal.startDate,
    endDate: newGoal.endDate,
    milestones: []
  })

  newGoal.title = ''
  newGoal.endDate = ''
  store.saveData()
}
</script>

<style scoped>
/* 기존 목표 플래너 관련 CSS 그대로 이식 */
.goal-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
  flex: 1;
}
.creator-card h3 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
}
.input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
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
.dash {
  color: var(--text-muted);
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
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
.responsive-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
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
.pct-text {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-primary);
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
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.is-done {
  text-decoration: line-through;
  color: #a1a1aa;
}
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
