<template>
  <section class="studio-card">
    <div class="card-head">
      <h3>{{ formattedDate }} Schedule</h3>
      <div class="head-actions">
        <button @click="showAddForm = !showAddForm" class="btn-add" :class="{ active: showAddForm }">
          {{ showAddForm ? '✕' : '+' }}
        </button>
      </div>
    </div>

    <div v-if="showAddForm" class="quick-add-area">
      <div v-if="openDropdown" class="dropdown-overlay" @click="openDropdown = null"></div>

      <div class="type-selector">
        <button @click="addType = 'task'" :class="{ active: addType === 'task' }">할 일</button>
        <button @click="addType = 'event'" :class="{ active: addType === 'event' }">이벤트</button>
      </div>
      
      <div class="input-row">
        <input 
          v-model="newTitle" 
          type="text" 
          :placeholder="addType === 'task' ? '할 일을 입력하세요...' : '이벤트 제목을 입력하세요...'"
          @keyup.enter="handleQuickAdd"
          class="s-input flex-1"
        />
        <button @click="handleQuickAdd" class="btn-confirm">추가</button>
      </div>

      <div v-if="addType === 'event'" class="event-options-grid">
        <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'goal' }" @click="openDropdown = 'goal'">
          <span :class="{ 'placeholder-text': !selectedGoalId }">{{ selectedGoalName }}</span>
          <span class="chevron">▾</span>
          <ul v-if="openDropdown === 'goal'" class="dropdown-menu">
            <li 
              v-for="goal in scheduleStore.goals" :key="goal.id" 
              :class="{ 'selected': selectedGoalId === goal.id }"
              @click.stop="selectedGoalId = goal.id; openDropdown = null"
            >
              {{ goal.title.length > 10 ? goal.title.slice(0, 10) + '...' : goal.title }}
            </li>
          </ul>
        </div>

        <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'category' }" @click="openDropdown = 'category'">
          <span :class="{ 'placeholder-text': !newCategory }">{{ newCategory || '카테고리' }}</span>
          <span class="chevron">▾</span>
          <ul v-if="openDropdown === 'category'" class="dropdown-menu">
            <li 
              v-for="cat in categories" :key="cat" 
              :class="{ 'selected': newCategory === cat }"
              @click.stop="newCategory = cat; openDropdown = null"
            >
              {{ cat }}
            </li>
          </ul>
        </div>
  
        <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'priority' }" @click="openDropdown = 'priority'">
          <span :class="{ 'placeholder-text': !newPriority }">{{ selectedPriorityLabel }}</span>
          <span class="chevron">▾</span>
          <ul v-if="openDropdown === 'priority'" class="dropdown-menu">
            <li 
              v-for="p in priorityOptions" :key="p.value" 
              :class="{ 'selected': newPriority === p.value }"
              @click.stop="newPriority = p.value; openDropdown = null"
            >
              {{ p.label }}
            </li>
          </ul>
        </div>

        <div class="time-range">
          <div class="custom-time-picker">
            <button class="ampm-toggle" @click.stop="toggleAmPm('start')">{{ startTimeObj.ampm }}</button>
            <div class="time-select-group">
              <div class="custom-select-box time-box" :class="{ 'is-active': openDropdown === 'startHour' }" @click="openDropdown = 'startHour'">
                {{ String(startTimeObj.hour).padStart(2, '0') }}
                <ul v-if="openDropdown === 'startHour'" class="dropdown-menu time-menu">
                  <li v-for="h in 12" :key="h" :class="{ 'selected': startTimeObj.hour === h }" @click.stop="startTimeObj.hour = h; openDropdown = null">{{ String(h).padStart(2, '0') }}</li>
                </ul>
              </div>
              <span class="colon">:</span>
              <div class="custom-select-box time-box" :class="{ 'is-active': openDropdown === 'startMin' }" @click="openDropdown = 'startMin'">
                {{ String(startTimeObj.minute).padStart(2, '0') }}
                <ul v-if="openDropdown === 'startMin'" class="dropdown-menu time-menu">
                  <li v-for="m in [0, 10, 20, 30, 40, 50]" :key="m" :class="{ 'selected': startTimeObj.minute === m }" @click.stop="startTimeObj.minute = m; openDropdown = null">{{ String(m).padStart(2, '0') }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <span class="range-dash">~</span>
          
          <div class="custom-time-picker">
            <button class="ampm-toggle" @click.stop="toggleAmPm('end')">{{ endTimeObj.ampm }}</button>
            <div class="time-select-group">
              <div class="custom-select-box time-box" :class="{ 'is-active': openDropdown === 'endHour' }" @click="openDropdown = 'endHour'">
                {{ String(endTimeObj.hour).padStart(2, '0') }}
                <ul v-if="openDropdown === 'endHour'" class="dropdown-menu time-menu">
                  <li v-for="h in 12" :key="h" :class="{ 'selected': endTimeObj.hour === h }" @click.stop="endTimeObj.hour = h; openDropdown = null">{{ String(h).padStart(2, '0') }}</li>
                </ul>
              </div>
              <span class="colon">:</span>
              <div class="custom-select-box time-box" :class="{ 'is-active': openDropdown === 'endMin' }" @click="openDropdown = 'endMin'">
                {{ String(endTimeObj.minute).padStart(2, '0') }}
                <ul v-if="openDropdown === 'endMin'" class="dropdown-menu time-menu">
                  <li v-for="m in [0, 10, 20, 30, 40, 50]" :key="m" :class="{ 'selected': endTimeObj.minute === m }" @click.stop="endTimeObj.minute = m; openDropdown = null">{{ String(m).padStart(2, '0') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="task-scroll-area">
      <div v-if="!scheduleStore.currentTasks?.length && !scheduleStore.currentMilestones?.length" class="empty-msg">
        일정이 없습니다. 상단의 + 버튼을 눌러 추가해보세요!
      </div>

      <div v-else>
        <MilestoneCard 
          v-for="item in scheduleStore.currentMilestones" 
          :key="'ms-' + item.ms.id" 
          :item="item"
          @open-detail="openDetailModal"
          @update="scheduleStore.saveData"
        />

        <TaskCard 
          v-for="task in scheduleStore.currentTasks" 
          :key="'task-' + task.id" 
          :task="task"
          @update="scheduleStore.saveData"
          @remove="scheduleStore.removeTask"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore'
// 👇 본인의 파일 경로에 맞게 임포트 해주세요
import MilestoneCard from './components/MildstoneCard.vue' 
import TaskCard from './components/TaskCard.vue'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['open-detail'])

// ... (기존 Script 로직 동일하게 유지. MilestoneItem/TaskItem에 들어간 로직만 빠집니다) ...
const showAddForm = ref(false)
const addType = ref<'task' | 'event'>('task')
const newTitle = ref('')
const selectedGoalId = ref<number | string>('')
const newCategory = ref('')
const newPriority = ref<'High' | 'Medium' | 'Low' | ''>('')
const openDropdown = ref<string | null>(null)

const categories = ['기획', '디자인', '개발', '마케팅', '개인일정', '기타']
const priorityOptions: Array<{ value: 'High' | 'Medium' | 'Low', label: string }> = [
  { value: 'High', label: '🔥 높음' },
  { value: 'Medium', label: '⭐ 중간' },
  { value: 'Low', label: '💧 낮음' }
]

const selectedGoalName = computed(() => {
  const goal = scheduleStore.goals.find(g => g.id === selectedGoalId.value)
  return goal ? (goal.title.length > 8 ? goal.title.slice(0, 8) + '...' : goal.title) : '목표 선택'
})

const selectedPriorityLabel = computed(() => {
  const p = priorityOptions.find(opt => opt.value === newPriority.value)
  return p ? p.label : '중요도'
})

const startTimeObj = reactive({ ampm: '오전', hour: 9, minute: 0 })
const endTimeObj = reactive({ ampm: '오후', hour: 6, minute: 0 })

const toggleAmPm = (type: 'start' | 'end') => {
  const obj = type === 'start' ? startTimeObj : endTimeObj
  obj.ampm = obj.ampm === '오전' ? '오후' : '오전'
}

const formatTimeForStore = (timeObj: { ampm: string, hour: number, minute: number }) => {
  let h = timeObj.hour
  if (timeObj.ampm === '오후' && h !== 12) h += 12
  if (timeObj.ampm === '오전' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`
}

const handleQuickAdd = () => {
  if (!newTitle.value.trim()) return

  if (addType.value === 'task') {
    scheduleStore.addTask(newTitle.value)
  } else {
    if (!selectedGoalId.value) {
      alert('연결할 목표를 선택해주세요.')
      return
    }
    scheduleStore.addMilestone(selectedGoalId.value, {
      text: newTitle.value,
      date: scheduleStore.selectedDate,
      startTime: formatTimeForStore(startTimeObj),
      endTime: formatTimeForStore(endTimeObj),
      category: newCategory.value,
      priority: newPriority.value,
    })
  }
  
  newTitle.value = ''
  selectedGoalId.value = ''
  newCategory.value = ''
  newPriority.value = ''
  showAddForm.value = false
}

const formattedDate = computed(() => {
  const full = scheduleStore.selectedDate
  if (!full) return ''
  const parts = full.split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : full
})

const openDetailModal = (ms: any) => emit('open-detail', ms)
</script>

<style scoped>
/* ✨ 컴포넌트 분리 덕분에, 자식 카드에 속하는 CSS 수십 줄이 통째로 삭제되었습니다! ✨ */

.dropdown-overlay { position: fixed; inset: 0; z-index: 90; }

.custom-select-box { position: relative; background: #fff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 600; color: #27272a; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; transition: all 0.2s ease; }
.custom-select-box:hover { border-color: #d4d4d8; }
.custom-select-box.is-active { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.placeholder-text { color: #a1a1aa; font-weight: 500; }
.chevron { font-size: 12px; color: #a1a1aa; margin-left: 8px; }

.dropdown-menu { position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-height: 180px; overflow-y: auto; list-style: none; padding: 6px; margin: 0; z-index: 100; }
.dropdown-menu::-webkit-scrollbar { width: 6px; }
.dropdown-menu::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
.dropdown-menu li { padding: 8px 12px; font-size: 13px; color: #3f3f46; border-radius: 6px; cursor: pointer; transition: background 0.2s; text-align: left; }
.dropdown-menu li:hover { background: #f4f4f5; color: #18181b; }
.dropdown-menu li.selected { background: #eff6ff; color: #2563eb; font-weight: 700; }

.time-box { padding: 6px 10px; border-radius: 8px; min-width: 52px; justify-content: center; font-size: 15px; font-weight: 800; }
.time-menu { min-width: 60px; left: 50%; transform: translateX(-50%); text-align: center; }
.time-menu li { text-align: center; font-size: 14px; }

.quick-add-area { background: #f4f4f5; padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; }
.type-selector { display: flex; gap: 4px; background: #e4e4e7; padding: 3px; border-radius: 8px; align-self: flex-start; z-index: 2; }
.type-selector button { border: none; background: transparent; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #71717a; cursor: pointer; border-radius: 6px; }
.type-selector button.active { background: #fff; color: #27272a; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.input-row { display: flex; gap: 8px; z-index: 2; position: relative; }
.event-options-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.time-range { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.custom-time-picker { display: flex; align-items: center; background: #fff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 6px 8px; flex: 1; gap: 8px; }
.ampm-toggle { background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; color: #2563eb; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; z-index: 2; }
.ampm-toggle:hover { background: #dbeafe; border-color: #93c5fd; }
.time-select-group { display: flex; align-items: center; flex: 1; justify-content: center; }
.colon { font-size: 15px; font-weight: 800; color: #a1a1aa; padding-bottom: 2px; margin: 0 4px; }
.range-dash { font-weight: 800; color: #a1a1aa; }

@media (max-width: 1200px) {
  .input-row { flex-direction: column; }
  .btn-confirm { padding: 12px; width: 100%; }
  .event-options-grid { grid-template-columns: 1fr 1fr; }
  .event-options-grid > .custom-select-box:first-child { grid-column: 1 / -1; }
  .time-range { flex-direction: column; align-items: stretch; gap: 8px; }
  .range-dash { display: none; }
}

.btn-confirm { background: #27272a; color: #fff; border: none; padding: 0 16px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-add.active { background: #ef4444; }
.s-input { padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 10px; font-size: 13px; background: #fff; outline: none; font-weight: 500; }
.s-input:focus { border-color: #3b82f6; }

.studio-card { background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e4e4e7); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); display: flex; flex-direction: column; height: 100%; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-head h3 { font-size: 18px; font-weight: 800; color: #27272a; margin: 0; letter-spacing: -0.3px; }
.btn-add { background: #27272a; color: #fff; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.btn-add:hover { background: #3f3f46; transform: scale(1.05); }

.task-scroll-area { flex: 1; overflow-y: auto; padding-right: 8px; }
.task-scroll-area::-webkit-scrollbar { width: 6px; }
.task-scroll-area::-webkit-scrollbar-thumb { background-color: #d4d4d8; border-radius: 4px; }
.empty-msg { font-size: 14px; color: #a1a1aa; text-align: center; padding: 40px 20px; background: #fafafa; border-radius: 12px; border: 1px dashed #e4e4e7; }
</style>