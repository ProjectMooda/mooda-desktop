<template>
  <div class="jarvis-wrapper">
    <aside class="studio-sidebar shrink-0">
      <div class="brand-zone shrink-0">
        <div class="logo-dot"></div>
        <h2>JARVIS</h2>
      </div>

      <nav class="nav-menu">
        <button 
          v-for="(item, idx) in menuItems" :key="idx"
          :class="['nav-btn', { active: currentTab === idx + 1 }]"
          @click="currentTab = idx + 1"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="user-zone shrink-0">
        <div class="avatar">W</div>
        <div class="user-text min-w-0">
          <span class="name">이원형</span>
          <span class="role">Admin</span>
        </div>
        <button @click="showSettings = true" class="btn-settings shrink-0">⚙️</button>
      </div>
    </aside>

    <main class="main-workspace min-w-0">
      <header class="studio-header shrink-0">
        <h1 class="page-title">{{ menuItems[currentTab - 1].label }}</h1>
        <div class="focus-container">
          <span class="focus-badge">FOCUS</span>
          <input type="text" v-model="state.dailyFocus" @change="saveData" placeholder="오늘의 핵심 목표..." />
        </div>
      </header>

      <div class="scroll-content">
        <transition name="fade" mode="out-in">
          
          <div v-if="currentTab === 1" class="split-layout">
            
            <section class="studio-card cal-section min-w-0">
              <div class="card-head shrink-0">
                <button @click="changeMonth(-1)" class="icon-btn">‹</button>
                <h3>{{ currentYear }}. {{ String(currentMonth + 1).padStart(2, '0') }}</h3>
                <button @click="changeMonth(1)" class="icon-btn">›</button>
              </div>
              
              <div class="cal-grid min-h-0">
                <div v-for="d in ['S','M','T','W','T','F','S']" :key="'header-'+d" class="cal-day">{{ d }}</div>
                <div 
                  v-for="date in calendarDates" :key="date.full || Math.random()"
                  :class="['cal-cell', { 
                    'today': isToday(date.full), 
                    'selected': selectedDate === date.full,
                    'dimmed': !date.currentMonth
                  }]"
                  @click="date.currentMonth && (selectedDate = date.full)"
                >
                  <span class="date-num">{{ date.day }}</span>
                  <div class="dot-wrap">
                    <div v-if="hasTasks(date.full)" class="dot task-dot"></div>
                    <div v-if="getGoalMilestonesForDate(date.full).length > 0" class="dot goal-dot"></div>
                  </div>
                </div>
              </div>
            </section>

            <section class="studio-card task-section min-w-0">
              <div class="card-head shrink-0">
                <h3>{{ formatDisplayDate(selectedDate) }} Schedule</h3>
                <button @click="addTask" class="btn-add">+</button>
              </div>
              
              <div class="task-scroll-area min-h-0">
                <div v-if="getGoalMilestonesForDate(selectedDate).length > 0" class="task-group">
                  <h4 class="group-title">장기 목표 연동</h4>
                  <div v-for="ms in getGoalMilestonesForDate(selectedDate)" :key="ms.id" class="task-item goal-item">
                    <label class="studio-cbx shrink-0">
                      <input type="checkbox" v-model="ms.done" @change="saveData" />
                      <span class="cbx-box"></span>
                    </label>
                    <div class="task-text-wrap min-w-0">
                      <span class="goal-tag shrink-0">{{ ms.goalTitle }}</span>
                      <div :class="['text-display', { 'is-done': ms.done }]">{{ ms.text }}</div>
                    </div>
                  </div>
                </div>

                <div class="task-group mt-24">
                  <h4 class="group-title">일반 일정</h4>
                  <div v-for="task in currentTasks" :key="task.id" class="task-item">
                    <label class="studio-cbx shrink-0">
                      <input type="checkbox" v-model="task.done" @change="saveData" />
                      <span class="cbx-box"></span>
                    </label>
                    
                    <div class="task-input-container min-w-0">
                      <textarea v-model="task.text" @change="saveData" class="task-textarea" placeholder="일정을 입력하세요..." rows="3"></textarea>
                      <div :class="['task-display', { 'is-done': task.done }]">{{ task.text || '일정을 입력하세요...' }}</div>
                    </div>

                    <button @click="removeTask(task.id)" class="btn-del shrink-0">✕</button>
                  </div>
                  <div v-if="currentTasks.length === 0" class="empty-msg">일정이 없습니다.</div>
                </div>
              </div>
            </section>
          </div>

          <div v-else-if="currentTab === 2" class="goal-layout">
            <section class="studio-card creator-card shrink-0">
              <h3>새로운 장기 목표 설정</h3>
              <div class="input-row flex-wrap">
                <input type="text" v-model="newGoal.title" placeholder="목표 타이틀..." class="s-input flex-1 min-w-200" />
                <input type="date" v-model="newGoal.startDate" class="s-input w-130 shrink-0" />
                <span class="dash shrink-0">-</span>
                <input type="date" v-model="newGoal.endDate" class="s-input w-130 shrink-0" />
                <button @click="createGoal" class="btn-primary shrink-0">생성</button>
              </div>
            </section>

            <div class="responsive-goal-grid">
              <article v-for="goal in state.goals" :key="goal.id" class="studio-card goal-card">
                <div class="card-top shrink-0">
                  <div class="goal-header">
                    <div class="title-area min-w-0">
                      <h4>{{ goal.title }}</h4>
                      <span class="date-range">{{ goal.startDate }} ~ {{ goal.endDate }}</span>
                    </div>
                    <div class="pct-text shrink-0">{{ calculateProgress(goal) }}%</div>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: calculateProgress(goal) + '%' }"></div>
                  </div>
                  <div class="add-ms-row">
                    <input type="date" v-model="goal.newMilestoneDate" class="s-input w-110 shrink-0" :min="goal.startDate" :max="goal.endDate" />
                    <input type="text" v-model="goal.newMilestoneText" placeholder="세부 일정..." class="s-input flex-1 min-w-0" @keyup.enter="addMilestone(goal)" />
                    <button @click="addMilestone(goal)" class="btn-outline shrink-0">+</button>
                  </div>
                </div>
                <div class="ms-list min-h-0">
                  <div v-for="ms in goal.milestones" :key="ms.id" class="ms-row">
                    <label class="studio-cbx sm-cbx shrink-0">
                      <input type="checkbox" v-model="ms.done" @change="saveData" />
                      <span class="cbx-box"></span>
                    </label>
                    <span class="ms-date shrink-0">{{ ms.date.slice(5) }}</span>
                    <span :class="['ms-text flex-1 min-w-0', { 'is-done': ms.done }]">{{ ms.text }}</span>
                    <button @click="removeMilestone(goal, ms.id)" class="btn-del-sm shrink-0">✕</button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal-content">
        <h3 class="modal-title">시스템 설정</h3>
        <div class="setting-row">
          <label class="setting-label">데스크톱 앱 화면 사이즈</label>
          <div class="select-wrapper">
            <select v-model="state.appSize" @change="changeAppSize" class="s-select">
              <option value="max">Max (전체 화면)</option>
              <option value="middle">Middle (1440 x 900)</option>
              <option value="min">Min (1024 x 768)</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showSettings = false" class="btn-primary flex-1">적용 및 닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

// --- TypeScript Interfaces ---
interface Task { id: number; text: string; done: boolean; }
interface Milestone { id: number; date: string; text: string; done: boolean; goalTitle?: string; }
interface Goal { 
  id: number; title: string; startDate: string; endDate: string; 
  milestones: Milestone[];
  newMilestoneDate?: string; newMilestoneText?: string;
}
interface State { 
  appSize: 'max' | 'middle' | 'min';
  dailyFocus: string; 
  dateTasks: Record<string, Task[]>; 
  goals: Goal[]; 
}

// --- Component State ---
const showSettings = ref(false);
const currentTab = ref(1);
const menuItems = [ { label: 'Calendar' }, { label: 'Goal Planner' } ];

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth());
const selectedDate = ref(now.toISOString().split('T')[0]);

const state = reactive<State>({
  appSize: 'middle',
  dailyFocus: '',
  dateTasks: {},
  goals: [
    {
      id: 1, title: 'Cashfolio UI 개편', startDate: '2026-04-01', endDate: '2026-05-31',
      milestones: [ { id: 101, date: '2026-04-22', text: '레이아웃 최적화', done: false } ]
    }
  ]
});

const newGoal = reactive({ title: '', startDate: selectedDate.value, endDate: '' });

// --- Methods ---
const saveData = () => localStorage.setItem('jarvis_ts_v1', JSON.stringify(state));
const loadData = () => {
  const saved = localStorage.getItem('jarvis_ts_v1');
  if (saved) Object.assign(state, JSON.parse(saved));
};

// [TypeScript 환경에서 Electron IPC 통신 처리]
const changeAppSize = () => {
  saveData();
  const win = window as any;
  if (win.require) {
    const { ipcRenderer } = win.require('electron');
    ipcRenderer.send('resize-window', state.appSize);
  }
};

const calculateProgress = (goal: Goal) => {
  if (!goal.milestones || goal.milestones.length === 0) return 0;
  return Math.round((goal.milestones.filter(m => m.done).length / goal.milestones.length) * 100);
};

const calendarDates = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  const dates = [];
  for (let i = 0; i < firstDay; i++) dates.push({ day: '', full: '', currentMonth: false });
  for (let i = 1; i <= lastDate; i++) {
    const full = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    dates.push({ day: i.toString(), full, currentMonth: true });
  }
  return dates;
});

const isToday = (full: string) => full === now.toISOString().split('T')[0];
const changeMonth = (diff: number) => {
  currentMonth.value += diff;
  if (currentMonth.value > 11) { currentMonth.value = 0; currentYear.value++; }
  else if (currentMonth.value < 0) { currentMonth.value = 11; currentYear.value--; }
};
const formatDisplayDate = (full: string) => full ? `${full.split('-')[1]}.${full.split('-')[2]}` : '';

const currentTasks = computed(() => {
  if (!state.dateTasks[selectedDate.value]) state.dateTasks[selectedDate.value] = [];
  return state.dateTasks[selectedDate.value];
});

const hasTasks = (date: string) => state.dateTasks[date]?.length > 0;
const getGoalMilestonesForDate = (date: string) => {
  if (!date) return [];
  const result: Milestone[] = [];
  state.goals.forEach(goal => {
    goal.milestones.forEach(ms => { if (ms.date === date) result.push({ ...ms, goalTitle: goal.title }); });
  });
  return result;
};

const addTask = () => { currentTasks.value.push({ id: Date.now(), text: '', done: false }); saveData(); };
const removeTask = (id: number) => { 
  const idx = currentTasks.value.findIndex(t => t.id === id);
  if (idx > -1) currentTasks.value.splice(idx, 1);
  saveData();
};

const createGoal = () => {
  if (!newGoal.title) return;
  state.goals.unshift({ id: Date.now(), title: newGoal.title, startDate: newGoal.startDate, endDate: newGoal.endDate, milestones: [] });
  newGoal.title = ''; newGoal.endDate = ''; saveData();
};

const addMilestone = (goal: Goal) => {
  const mDate = goal.newMilestoneDate || selectedDate.value;
  if (!goal.newMilestoneText) return;
  goal.milestones.push({ id: Date.now(), date: mDate, text: goal.newMilestoneText, done: false });
  goal.milestones.sort((a, b) => a.date.localeCompare(b.date));
  goal.newMilestoneText = ''; saveData();
};

const removeMilestone = (goal: Goal, msId: number) => {
  const idx = goal.milestones.findIndex(m => m.id === msId);
  if (idx > -1) goal.milestones.splice(idx, 1);
  saveData();
};

onMounted(() => loadData());
</script>
<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 창 전체 스크롤 완전 차단 */
  background-color: #F6F6F9; /* 혹시라도 남는 공간이 생겨도 앱 배경색과 동일하게 처리 */
}

* {
  box-sizing: border-box;
}
</style>

<style scoped>
/* 앱 래퍼: 부모(#app)의 100%를 그대로 물려받음 */
.jarvis-wrapper {
  display: flex; 
  width: 100%; 
  height: 100%;
  color: #18181B; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* 유틸리티 */
.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }
.min-w-0 { min-width: 0; }
.min-h-0 { min-height: 0; }

/* 1. 사이드바 (높이 100% 꽉 채움) */
.studio-sidebar {
  flex: 0 0 220px; width: 220px; background: #FFFFFF; border-right: 1px solid #E4E4E7;
  display: flex; flex-direction: column; padding: 30px 20px; z-index: 10;
  overflow-y: auto; 
}
.brand-zone { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; padding-left: 5px; }
.logo-dot { width: 12px; height: 12px; background: #6366F1; border-radius: 50%; }
.brand-zone h2 { font-size: 18px; font-weight: 800; margin: 0; }

.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.nav-btn { text-align: left; padding: 10px 14px; background: transparent; border: none; color: #71717A; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.nav-btn:hover { background: #F4F4F5; color: #18181B; }
.nav-btn.active { background: #EEF2FF; color: #4F46E5; }

.user-zone { display: flex; align-items: center; gap: 10px; padding: 16px 0 0 0; border-top: 1px solid #E4E4E7; margin-top: auto; }
.avatar { width: 32px; height: 32px; background: #18181B; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #FFF; font-size: 14px; flex-shrink: 0; }
.user-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.role { font-size: 11px; color: #A1A1AA; }
.btn-settings { background: #F4F4F5; border: none; font-size: 14px; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; flex-shrink: 0; }
.btn-settings:hover { background: #E4E4E7; }

/* 2. 메인 워크스페이스 */
.main-workspace { 
  flex: 1; display: flex; flex-direction: column; padding: 0 40px; min-width: 0; 
  height: 100%; /* 전체화면 시 끝까지 늘어나도록 보장 */
}
.studio-header { height: 90px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; }
.focus-container { display: flex; align-items: center; background: #FFFFFF; border: 1px solid #E4E4E7; padding: 10px 16px; border-radius: 10px; width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.focus-badge { font-size: 10px; font-weight: 800; color: #6366F1; margin-right: 12px; letter-spacing: 1px; }
.focus-container input { flex: 1; background: transparent; border: none; outline: none; color: #18181B; font-size: 14px; font-weight: 500; }

/* 스크롤 영역: 헤더를 제외한 모든 영역을 차지함 */
.scroll-content { 
  flex: 1; display: flex; flex-direction: column; padding-bottom: 24px; 
  min-height: 0; /* 내부 스크롤 허용의 핵심 */
}
.studio-card { background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.02); }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-head h3 { font-size: 18px; font-weight: 700; margin: 0; }

/* 3. 캘린더 & Task (max-height 제한 완전 제거) */
.split-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1; min-height: 500px; }
.cal-section, .task-section { 
  display: flex; flex-direction: column; 
  height: 100%; /* 부모의 크기에 맞춰 끝까지 팽창 */
  min-height: 0; 
}

.icon-btn { background: #F4F4F5; border: none; color: #71717A; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: bold; }
.icon-btn:hover { background: #E4E4E7; }
.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 6px; flex: 1; }
.cal-day { text-align: center; font-size: 12px; font-weight: 700; color: #A1A1AA; align-self: end; padding-bottom: 4px; }
.cal-cell { background: #F8F8FA; border-radius: 8px; border: 1px solid transparent; display: flex; flex-direction: column; align-items: center; padding-top: 10px; cursor: pointer; transition: 0.2s; overflow: hidden; }
.cal-cell:hover:not(.dimmed) { background: #FFFFFF; border-color: #D4D4D8; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.cal-cell.selected { background: #EEF2FF; border-color: #6366F1; }
.cal-cell.dimmed { opacity: 0.3; pointer-events: none; }
.date-num { font-size: 14px; font-weight: 600; color: #3F3F46; }
.cal-cell.today .date-num { color: #4F46E5; font-weight: 800; }
.dot-wrap { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; margin-top: 6px; padding: 0 4px; }
.dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.task-dot { background: #D4D4D8; }
.goal-dot { background: #F43F5E; }

/* 4. Task 영역 (독립 스크롤) */
.btn-add { background: #18181B; color: #FFF; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; transition: 0.2s; }
.task-scroll-area { flex: 1; overflow-y: auto; padding-right: 8px; }
.group-title { font-size: 12px; color: #A1A1AA; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid #F4F4F5; padding-bottom: 8px; }
.mt-24 { margin-top: 24px; }

.task-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F4F4F5; }
.goal-item { background: #FFF1F2; padding: 12px; border-radius: 10px; border-bottom: none; border-left: 3px solid #F43F5E; margin-bottom: 8px; }
.goal-tag { font-size: 10px; background: #F43F5E; color: #FFF; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-weight: 700; display: inline-block; margin-bottom: 4px; }

.task-input-container, .task-text-wrap { position: relative; flex: 1; display: flex; flex-direction: column; }
.task-textarea { position: absolute; inset: 0; opacity: 0; z-index: 1; width: 100%; height: 100%; resize: none; border: 1px solid #E4E4E7; border-radius: 6px; background: #FFF; color: transparent; padding: 4px; outline: none; font-family: inherit; font-size: 14px; }
.task-textarea:focus { opacity: 1; color: #18181B; z-index: 10; height: auto; min-height: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.task-display, .text-display { font-size: 14px; color: #27272A; line-height: 1.5; padding: 4px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; white-space: pre-wrap; }
.is-done { text-decoration: line-through; color: #A1A1AA; }
.btn-del, .btn-del-sm { background: transparent; border: none; color: #F43F5E; font-size: 16px; cursor: pointer; opacity: 0; transition: 0.2s; padding-top: 2px; }
.task-item:hover .btn-del, .ms-row:hover .btn-del-sm { opacity: 1; }
.empty-msg { font-size: 13px; color: #A1A1AA; text-align: center; padding: 20px; }

/* 5. 목표 플래너 */
.goal-layout { display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; flex: 1; }
.creator-card h3 { font-size: 18px; margin-top: 0; margin-bottom: 16px; }
.input-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.s-input { background: #F8F8FA; border: 1px solid #E4E4E7; padding: 10px 12px; border-radius: 8px; color: #18181B; font-size: 14px; outline: none; transition: 0.2s; }
.s-input:focus { border-color: #6366F1; background: #FFF; }
.w-130 { width: 130px; } .w-110 { width: 110px; } .min-w-200 { min-width: 200px; }
.dash { color: #A1A1AA; }
.btn-primary { background: #6366F1; color: #FFF; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-outline { background: transparent; border: 1px solid #6366F1; color: #6366F1; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.responsive-goal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.goal-card { display: flex; flex-direction: column; height: 380px; padding: 24px; }
.card-top { margin-bottom: 16px; }
.goal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.title-area h4 { font-size: 18px; color: #18181B; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.date-range { font-size: 12px; color: #71717A; }
.pct-text { font-size: 24px; font-weight: 800; color: #6366F1; }
.progress-track { height: 6px; background: #F4F4F5; border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
.progress-fill { height: 100%; background: #6366F1; transition: width 0.3s ease; }
.add-ms-row { display: flex; gap: 8px; align-items: center; }

.ms-list { flex: 1; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 8px; }
.ms-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px; background: #F8F8FA; border-radius: 8px; border: 1px solid #E4E4E7; }
.ms-date { font-size: 12px; font-weight: 700; color: #F43F5E; width: 45px; padding-top: 2px; }
.ms-text { font-size: 13px; color: #27272A; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }

/* 6. 모달 & 체크박스 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); }
.modal-content { background: #FFF; width: 400px; padding: 30px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.modal-title { font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 24px; color: #18181B; }
.setting-row { margin-bottom: 30px; }
.setting-label { display: block; font-size: 13px; font-weight: 700; color: #71717A; margin-bottom: 10px; }
.s-select { width: 100%; padding: 12px; border: 1px solid #E4E4E7; border-radius: 8px; font-size: 14px; outline: none; background: #F8F8FA; cursor: pointer; }

.studio-cbx { position: relative; width: 18px; height: 18px; cursor: pointer; display: inline-block; margin-top: 3px; }
.sm-cbx { width: 16px; height: 16px; margin-top: 1px; }
.studio-cbx input { opacity: 0; width: 0; height: 0; position: absolute; }
.cbx-box { position: absolute; inset: 0; border: 2px solid #D4D4D8; border-radius: 5px; background: #FFF; transition: 0.2s; }
.studio-cbx input:checked ~ .cbx-box { background: #6366F1; border-color: #6366F1; }
.cbx-box:after { content: ""; position: absolute; display: none; left: 4px; top: 1px; width: 4px; height: 8px; border: solid #FFF; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.sm-cbx .cbx-box:after { left: 3px; top: 0px; }
.studio-cbx input:checked ~ .cbx-box:after { display: block; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #D4D4D8; border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
</style>