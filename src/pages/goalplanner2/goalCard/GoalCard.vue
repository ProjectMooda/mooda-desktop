<template>
  <article class="studio-card goal-card">
    <div class="card-top shrink-0">
      <div class="goal-header">
        <div class="title-area min-w-0" @click="$emit('open')">
          <h4>{{ goal.title }}</h4>
          <span class="date-range">
            {{ goal.startDate }} ~ {{ goal.endDate }}
          </span>
        </div>
        <div class="header-actions">
          <div class="pct-text shrink-0">{{ progressPercent }}%</div>
          <XButton
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

      <!-- 🚨 로컬 상태(newMsDate, newMsSummary)를 사용하도록 변경 -->
      <div class="add-ms-row">
        <input
          type="date"
          v-model="newMsDate"
          class="s-input w-110 shrink-0"
          :min="goal.startDate"
          :max="goal.endDate"
        />
        <input
          type="text"
          v-model="newMsSummary"
          placeholder="세부 일정..."
          class="s-input flex-1 min-w-0"
          @keyup.enter="addMilestone"
        />
        <button @click="addMilestone" class="btn-outline shrink-0">+</button>
      </div>
    </div>

    <div class="ms-list min-h-0">
      <!-- 스토어에서 필터링해온 goalSchedules 순회 -->
      <div v-for="ms in goalSchedules" :key="ms.id" class="ms-row">
        <!-- ✅ (val) 대신 $event를 사용하여 TS any 에러 해결 -->
        <CheckBox
          class="shrink-0"
          v-model="ms.done"
          @update:model-value="store.updateSchedule(ms.id, { done: $event })"
        />

        <!-- 🚨 ms.startDate 및 ms.summary 로 변경 -->
        <span class="ms-date shrink-0">{{
          (ms.startDate || '').slice(5)
        }}</span>
        <span :class="['ms-text flex-1 min-w-0', { 'is-done': ms.done }]">
          {{ ms.summary }}
        </span>

        <XButton variant="rounded" @click="removeMilestone(ms.id)" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'
import XButton from '@/global-components/ui/Xbutton.vue'
// ✅ CheckBox 컴포넌트 임포트 추가! (경로는 실제 프로젝트 구조에 맞게 확인해주세요)
import CheckBox from '@/global-components/ui/CheckBox.vue'

const emit = defineEmits(['open'])
const props = defineProps<{ goal: Goal }>() // 🚨 any 대신 Goal 타입 지정
const store = useScheduleStore()

// --- UI / 입력 상태 ---
// 🚨 Props(goal)를 직접 오염시키지 않고 로컬 컴포넌트 상태로 분리
const newMsDate = ref(props.goal.startDate || store.selectedDate)
const newMsSummary = ref('')

// --- Computed ---
// 🚨 핵심: 스토어의 전체 일정 중 이 목표(goal.id)에 속한 마일스톤만 추출 및 날짜순 정렬
const goalSchedules = computed(() => {
  return store.schedules
    .filter((s) => s.goalId === props.goal.id)
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
})

// 🚨 함수 대신 computed로 변경하여 렌더링 최적화
const progressPercent = computed(() => {
  const total = goalSchedules.value.length
  if (total === 0) return 0

  const doneCount = goalSchedules.value.filter((m) => m.done).length
  return Math.round((doneCount / total) * 100)
})

// --- Methods ---
const addMilestone = () => {
  if (!newMsSummary.value.trim()) return

  // ✨ 헬퍼 함수 호출 (객체 껍데기 없이 핵심 파라미터만 전달)
  store.addMilestone(props.goal.id, newMsSummary.value, newMsDate.value)

  newMsSummary.value = ''
}

const removeMilestone = (msId: number) => {
  // 🚨 배열 splice 대신 스토어의 액션 호출
  store.removeSchedule(msId)
}

const deleteGoal = (id: number) => {
  // 목표 삭제. (스토어에 removeGoal 액션이 구현되어 있어야 합니다)
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
  cursor: pointer;
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
</style>
