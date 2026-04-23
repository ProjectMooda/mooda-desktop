<template>
  <div class="jarvis-wrapper">
    <Sidebar />

    <main class="main-workspace min-w-0">
      <header class="studio-header shrink-0">
        <h1 class="page-title">{{ menuItems[currentTab - 1].label }}</h1>
        <div class="focus-container">
          <span class="focus-badge">FOCUS</span>
          <input
            type="text"
            v-model="scheduleStore.dailyFocus"
            @change="scheduleStore.saveData"
            placeholder="오늘의 핵심 목표..."
          />
        </div>
      </header>

      <div class="scroll-content">
        <transition name="fade" mode="out-in">
          <div v-if="currentTab === 1" class="split-layout">
            <CalendarCard class="large-calendar" />
            <TaskCard class="task-board" />
          </div>

          <GoalPlanner v-else-if="currentTab === 2" />
        </transition>
      </div>
    </main>

    <SettingsModal v-if="sidebarStore.showSettings" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import { useSidebarStore } from './components/sidebar/useSidebarStore'
import { storeToRefs } from 'pinia'
import SettingsModal from './components/settings/SettingsModal.vue'
import { useSettingsStore } from './components/settings/useSettingsStore' // 추가
import GoalPlanner from '@/GoalPlanner.vue'
// 달력이랑 일별 날짜 정보
import { useScheduleStore } from '@/store/useScheduleStore'
import CalendarCard from './components/CalenderCard.vue'
import TaskCard from './components/TaskCard.vue'

// --- Component State ---
// 스토어 초기화
const sidebarStore = useSidebarStore()
const settingsStore = useSettingsStore() // 추가
const { currentTab, menuItems } = storeToRefs(sidebarStore)

// 달력 일별 날짜 정보 선언
const scheduleStore = useScheduleStore()

// --- TypeScript Interfaces ---
interface Task {
  id: number
  text: string
  done: boolean
}
interface Milestone {
  id: number
  date: string
  text: string
  done: boolean
  goalTitle?: string
}
interface Goal {
  id: number
  title: string
  startDate: string
  endDate: string
  milestones: Milestone[]
  newMilestoneDate?: string
  newMilestoneText?: string
}
interface State {
  dailyFocus: string
  dateTasks: Record<string, Task[]>
  goals: Goal[]
}

// --- Component State ---
const now = new Date()

onMounted(() => {
  settingsStore.loadSettings() // 스토어에서 앱 설정 데이터 로드 추가
  scheduleStore.loadData()
})
</script>
<style scoped>
/* 화면을 좌우로 나누는 스플릿 레이아웃 */
.split-layout {
  display: flex;
  flex-direction: row;
  gap: 24px; /* 달력과 태스크 보드 사이의 간격 */
  height: 100%; /* 부모 영역의 높이를 꽉 채움 */
}

/* 두 카드가 각각 50%씩 동일한 비율을 차지하도록 설정 */
.large-calendar,
.task-board {
  flex: 1;
  min-width: 0; /* 내부 콘텐츠가 넘칠 때 레이아웃이 깨지는 것을 방지 */
}
/* 앱 래퍼: 부모(#app)의 100%를 그대로 물려받음 */
.jarvis-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 2. 메인 워크스페이스 */
.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 40px;
  min-width: 0;
  height: 100%; /* 전체화면 시 끝까지 늘어나도록 보장 */
}
.studio-header {
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}
.focus-container {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
.focus-badge {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-primary);
  margin-right: 12px;
  letter-spacing: 1px;
}
.focus-container input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
}

/* 스크롤 영역: 헤더를 제외한 모든 영역을 차지함 */
.scroll-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  min-height: 0; /* 내부 스크롤 허용의 핵심 */
}
.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-head h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

/* 5. 목표 플래너 */
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
