<template>
  <section class="studio-card">
    <div class="card-head">
      <div class="head-title-group">
        <h3>{{ formattedDate }} Schedule</h3>
        <div class="progress-container" v-if="totalItems > 0">
          <div class="progress-text">달성률 <span>{{ progressPercent }}%</span></div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="head-actions">
        <button class="btn-icon" title="완료된 항목 보기" @click="showCompleted = !showCompleted">
          {{ showCompleted ? '👀' : '🙈' }}
        </button>
        <button @click="showAddForm = !showAddForm" class="btn-add" :class="{ active: showAddForm }">
          {{ showAddForm ? '✕' : '+' }}
        </button>
      </div>
    </div>

    <!-- 빠른 추가 폼 -->
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
            <li v-for="goal in scheduleStore.goals" :key="goal.id" :class="{ 'selected': selectedGoalId === goal.id }" @click.stop="selectedGoalId = goal.id; openDropdown = null">
              {{ goal.title.length > 10 ? goal.title.slice(0, 10) + '...' : goal.title }}
            </li>
          </ul>
        </div>

        <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'category' }" @click="openDropdown = 'category'">
          <span :class="{ 'placeholder-text': !newCategory }">{{ newCategory || '카테고리' }}</span>
          <span class="chevron">▾</span>
          <ul v-if="openDropdown === 'category'" class="dropdown-menu">
            <li v-for="cat in categories" :key="cat" :class="{ 'selected': newCategory === cat }" @click.stop="newCategory = cat; openDropdown = null">{{ cat }}</li>
          </ul>
        </div>
  
        <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'priority' }" @click="openDropdown = 'priority'">
          <span :class="{ 'placeholder-text': !newPriority }">{{ selectedPriorityLabel }}</span>
          <span class="chevron">▾</span>
          <ul v-if="openDropdown === 'priority'" class="dropdown-menu">
            <li v-for="p in priorityOptions" :key="p.value" :class="{ 'selected': newPriority === p.value }" @click.stop="newPriority = p.value; openDropdown = null">{{ p.label }}</li>
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

    <!-- 리스트 영역 -->
    <div class="task-scroll-area">
      <div v-if="totalItems === 0" class="empty-msg">
        일정이 없습니다. 상단의 + 버튼을 눌러 추가해보세요!
      </div>

      <div v-else class="task-lists-container">
        
        <!-- 고정된 항목 -->
        <div v-if="pinnedMilestones.length > 0 || pinnedTasks.length > 0" class="list-group">
          <div class="group-label"><span class="pin-icon">📌</span> 고정됨</div>
          <MilestoneCard 
              v-for="item in pinnedMilestones" :key="'p-ms-' + item.id" :item="item"
              @open-detail="openDetailModal" 
              @update="scheduleStore.updateSchedule(item.id, $event)" 
              @toggle-pin="scheduleStore.togglePin(item.id)"
              @delete="scheduleStore.removeSchedule(item.id)"
            />
          <TaskCard 
            v-for="task in pinnedTasks" :key="'p-task-' + task.id" :task="task"
            @update="scheduleStore.updateSchedule(task.id, $event)" 
            @remove="scheduleStore.removeSchedule(task.id)" 
            @toggle-pin="scheduleStore.togglePin(task.id)"
          />
        </div>

        <!-- 진행 중인 항목 (드래그 가능) -->
        <div v-if="localActiveMilestones.length > 0 || localActiveTasks.length > 0" class="list-group">
          <div class="group-label"><span class="run-icon">🏃</span> 할 일</div>
          
          <draggable 
            :list="localActiveMilestones" 
            item-key="id"
            ghost-class="ghost-card" 
            animation="200"
            handle=".drag-handle" 
            @end="onMilestoneDragEnd"
          >
            <template #item="{ element }">
              <MilestoneCard 
                :item="element" 
                @open-detail="openDetailModal" 
                @update="scheduleStore.updateSchedule(element.id, $event)" 
                @toggle-pin="scheduleStore.togglePin(element.id)"
                @delete="scheduleStore.removeSchedule(element.id)"
              />
            </template>
          </draggable>

          <draggable 
            :list="localActiveTasks" 
            item-key="id"
            ghost-class="ghost-card" 
            animation="200"
            handle=".drag-handle"
            @end="onTaskDragEnd"
          >
            <template #item="{ element }">
              <TaskCard 
                :task="element" 
                @update="scheduleStore.updateSchedule(element.id, $event)" 
                @remove="scheduleStore.removeSchedule(element.id)" 
                @toggle-pin="scheduleStore.togglePin(element.id)"
              />
            </template>
          </draggable>
        </div>

        <!-- 완료된 항목 -->
        <div v-if="completedItemsCount > 0" class="completed-section">
          <button class="toggle-completed-btn" @click="showCompleted = !showCompleted">
            {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{ completedItemsCount }})
          </button>
          
          <div v-show="showCompleted" class="completed-tasks-group">
            <MilestoneCard 
              v-for="item in completedMilestones" :key="'done-ms-' + item.id" :item="item"
              @open-detail="openDetailModal" 
              @update="scheduleStore.updateSchedule(item.id, $event)" 
              @toggle-pin="scheduleStore.togglePin(item.id)"
              @delete="scheduleStore.removeSchedule(item.id)" 
            />
            <TaskCard 
              v-for="task in completedTasks" :key="'done-task-' + task.id" :task="task"
              @update="scheduleStore.updateSchedule(task.id, $event)" 
              @remove="scheduleStore.removeSchedule(task.id)" 
              @toggle-pin="scheduleStore.togglePin(task.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue' 
import draggable from 'vuedraggable' 
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import MilestoneCard from './components/MilestoneCard.vue' // 오타 수정 (Mildstone -> Milestone)
import TaskCard from './components/TaskCard.vue'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['open-detail'])

// 상태 관리
const showAddForm = ref(false)
const showCompleted = ref(false)
const addType = ref<'task' | 'event'>('task')
const newTitle = ref('')
const selectedGoalId = ref<number | ''>('')
const newCategory = ref('')
const newPriority = ref<'High' | 'Medium' | 'Low' | ''>('')
const openDropdown = ref<string | null>(null)

const categories = ['기획', '디자인', '개발', '마케팅', '개인일정', '기타']
const priorityOptions: Array<{ value: 'High' | 'Medium' | 'Low', label: string }> = [
  { value: 'High', label: '🔥 높음' },
  { value: 'Medium', label: '⭐ 중간' },
  { value: 'Low', label: '💧 낮음' }
]

// Computed
const selectedGoalName = computed(() => {
  const goal = scheduleStore.goals.find(g => g.id === selectedGoalId.value)
  return goal ? (goal.title.length > 8 ? goal.title.slice(0, 8) + '...' : goal.title) : '목표 선택'
})

const selectedPriorityLabel = computed(() => {
  const p = priorityOptions.find(opt => opt.value === newPriority.value)
  return p ? p.label : '중요도'
})

const formattedDate = computed(() => {
  const full = scheduleStore.selectedDate
  if (!full) return ''
  const parts = full.split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : full
})

// 시간 로직
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

// 📌 아이템 추가 (새로운 Store 구조에 맞춤)
const handleQuickAdd = () => {
  if (!newTitle.value.trim()) return

  if (addType.value === 'task') {
    scheduleStore.addTask(newTitle.value, scheduleStore.selectedDate)
  } else {
    if (!selectedGoalId.value) {
      alert('연결할 목표를 선택해주세요.')
      return
    }
    scheduleStore.addSchedule({
      type: 'event', // 혹은 milestone
      summary: newTitle.value,
      goalId: Number(selectedGoalId.value),
      startDate: scheduleStore.selectedDate,
      endDate: scheduleStore.selectedDate,
      startTime: formatTimeForStore(startTimeObj),
      endTime: formatTimeForStore(endTimeObj),
      category: newCategory.value,
      priority: newPriority.value as 'High' | 'Medium' | 'Low' | undefined
    })
  }
  
  // 폼 초기화
  newTitle.value = ''
  selectedGoalId.value = ''
  newCategory.value = ''
  newPriority.value = ''
  showAddForm.value = false
}

// ==========================================
// 🚨 드래그 순서 영구 저장 완벽 해결 로직 (Store 구조 반영)
// ==========================================
const localActiveMilestones = ref<ScheduleItem[]>([])
const localActiveTasks = ref<ScheduleItem[]>([])

watch(
  () => scheduleStore.milestones, // Store의 getter로 직접 접근
  (newVal) => {
    const filtered = newVal.filter(m => !m.done && !m.isPinned)
    localActiveMilestones.value = filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  },
  { immediate: true, deep: true }
)

watch(
  () => scheduleStore.tasks, // Store의 getter로 직접 접근
  (newVal) => {
    const filtered = newVal.filter(t => !t.done && !t.isPinned)
    localActiveTasks.value = filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  },
  { immediate: true, deep: true }
)

const onMilestoneDragEnd = () => {
  localActiveMilestones.value.forEach((item, index) => {
    scheduleStore.updateSchedule(item.id, { orderIndex: index })
  })
}

const onTaskDragEnd = () => {
  localActiveTasks.value.forEach((item, index) => {
    scheduleStore.updateSchedule(item.id, { orderIndex: index })
  })
}

// ==========================================
// 파생 데이터 (Pinia Getter 활용)
// ==========================================
const pinnedMilestones = computed(() => scheduleStore.milestones.filter(m => !m.done && m.isPinned))
const pinnedTasks = computed(() => scheduleStore.tasks.filter(t => !t.done && t.isPinned))

const completedMilestones = computed(() => scheduleStore.milestones.filter(m => m.done))
const completedTasks = computed(() => scheduleStore.tasks.filter(t => t.done))

const totalItems = computed(() => scheduleStore.milestones.length + scheduleStore.tasks.length)
const completedItemsCount = computed(() => completedMilestones.value.length + completedTasks.value.length)
const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((completedItemsCount.value / totalItems.value) * 100)
})

const openDetailModal = (item: ScheduleItem) => emit('open-detail', item)
</script>

<style scoped>
/* 기존 CSS 모두 동일 유지 */
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.head-title-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.card-head h3 { font-size: 20px; font-weight: 800; color: #27272a; margin: 0; letter-spacing: -0.3px; }
.progress-container { width: 100%; max-width: 240px; display: flex; flex-direction: column; gap: 4px; }
.progress-text { font-size: 12px; font-weight: 600; color: #71717a; display: flex; justify-content: space-between; }
.progress-text span { color: #3b82f6; font-weight: 800; }
.progress-track { width: 100%; height: 6px; background: #f4f4f5; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 4px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.head-actions { display: flex; align-items: center; gap: 8px; }
.btn-icon { background: #f4f4f5; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.2s; }
.btn-icon:hover { background: #e4e4e7; }
.btn-add { background: #27272a; color: #fff; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.btn-add:hover { background: #3f3f46; transform: scale(1.05); }
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
@media (max-width: 1200px) { .input-row { flex-direction: column; } .btn-confirm { padding: 12px; width: 100%; } .event-options-grid { grid-template-columns: 1fr 1fr; } .event-options-grid > .custom-select-box:first-child { grid-column: 1 / -1; } .time-range { flex-direction: column; align-items: stretch; gap: 8px; } .range-dash { display: none; } }
.btn-confirm { background: #27272a; color: #fff; border: none; padding: 0 16px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-add.active { background: #ef4444; }
.s-input { padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 10px; font-size: 13px; background: #fff; outline: none; font-weight: 500; }
.s-input:focus { border-color: #3b82f6; }
.studio-card { background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e4e4e7); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); display: flex; flex-direction: column; height: 100%; }
.task-scroll-area { flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; }
.task-scroll-area::-webkit-scrollbar { width: 6px; }
.task-scroll-area::-webkit-scrollbar-thumb { background-color: #d4d4d8; border-radius: 4px; }
.empty-msg { font-size: 14px; color: #a1a1aa; text-align: center; padding: 40px 20px; background: #fafafa; border-radius: 12px; border: 1px dashed #e4e4e7; margin-top: 10px; }
.completed-section { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #e4e4e7; }
.toggle-completed-btn { background: transparent; border: none; font-size: 13px; font-weight: 700; color: #a1a1aa; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
.toggle-completed-btn:hover { color: #52525b; }
.completed-tasks-group { margin-top: 12px; opacity: 0.7; transition: opacity 0.2s ease; }
.completed-tasks-group:hover { opacity: 1; }

.list-group { margin-bottom: 24px; }
.group-label { font-size: 12px; font-weight: 700; color: #a1a1aa; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
.pin-icon { color: #f59e0b; }
.run-icon { color: #3b82f6; }

.ghost-card { opacity: 0.4; background: #f8fafc; border: 2px dashed #94a3b8 !important; transform: scale(0.98); }
</style>