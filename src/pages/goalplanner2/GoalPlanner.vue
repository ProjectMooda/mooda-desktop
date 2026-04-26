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

    <<div class="responsive-goal-grid">
      <GoalCard 
        v-for="goal in store.goals" 
        :key="goal.id" 
        :goal="goal" 
        @open="openDetailModal(goal)" 
      />
    </div>

    <transition name="modal-fade">
      <GoalDetailModal 
        v-if="isModalOpen && selectedGoal" 
        :goal="selectedGoal" 
        @close="isModalOpen = false" 
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore' // 스토어 경로를 상황에 맞게 수정하세요
import GoalCard from './goalCard/GoalCard.vue'
import GoalDetailModal from './goalDetailModal/GoalDetailModal.vue' // 추가!

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

const isModalOpen = ref(false)
const selectedGoal = ref(null)

const openDetailModal = (goal: any) => {
  selectedGoal.value = goal
  isModalOpen.value = true
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
.responsive-goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
</style>
