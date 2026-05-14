<template>
  <div class="quick-add-area">
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
      
      <!-- 목표 -->
      <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'goal' }" @click="openDropdown = 'goal'">
        <span :class="{ 'placeholder-text': !selectedGoalId }">{{ selectedGoalName }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'goal'" class="dropdown-menu">
          <li
            v-for="goal in scheduleStore.goals"
            :key="goal.id"
            :class="{ selected: selectedGoalId === goal.id }"
            @click.stop="selectedGoalId = goal.id; openDropdown = null"
          >
            {{ goal.title.length > 10 ? goal.title.slice(0, 10) + '...' : goal.title }}
          </li>
        </ul>
      </div>

      <!-- 카테고리 -->
      <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'category' }" @click="openDropdown = 'category'">
        <span :class="{ 'placeholder-text': !newCategory }">{{ newCategory || '카테고리' }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'category'" class="dropdown-menu">
          <li
            v-for="cat in scheduleStore.categories"
            :key="cat"
            :class="{ selected: newCategory === cat }"
            @click.stop="newCategory = cat; openDropdown = null"
          >
            {{ cat }}
          </li>
        </ul>
      </div>

      <!-- 우선순위 -->
      <div class="custom-select-box" :class="{ 'is-active': openDropdown === 'priority' }" @click="openDropdown = 'priority'">
        <span :class="{ 'placeholder-text': !newPriority }">{{ selectedPriorityLabel }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'priority'" class="dropdown-menu">
          <li
            v-for="p in scheduleStore.priorityOptions"
            :key="p.id"
            :class="{ selected: newPriority === p.id }"
            @click.stop="newPriority = p.id; openDropdown = null"
          >
            {{ p.emoji }} {{ p.label }}
          </li>
        </ul>
      </div>

      <!-- 시간 -->
      <div class="time-range">

        <TimePicker v-model="startTime" />

        <span class="range-dash">~</span>

        <TimePicker v-model="endTime" />

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import TimePicker from '@/global-components/time-picker/TimePicker.vue'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['close'])

const addType = ref<'task' | 'event'>('task')
const newTitle = ref('')

const selectedGoalId = ref<number | ''>('')
const newCategory = ref('')
const newPriority = ref<string | ''>('')

const openDropdown = ref<string | null>(null)

/** TimePicker v-model */
const startTime = ref('09:00')
const endTime = ref('18:00')

const selectedGoalName = computed(() => {
  const goal = scheduleStore.goals.find(g => g.id === selectedGoalId.value)
  return goal
    ? (goal.title.length > 8 ? goal.title.slice(0, 8) + '...' : goal.title)
    : '목표 선택'
})

const selectedPriorityLabel = computed(() => {
  const p = scheduleStore.priorityOptions.find(opt => opt.id === newPriority.value)
  return p ? `${p.emoji} ${p.label}` : '중요도'
})

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
      type: 'event',
      summary: newTitle.value,
      goalId: Number(selectedGoalId.value),
      startDate: scheduleStore.selectedDate,
      endDate: scheduleStore.selectedDate,
      startTime: startTime.value,
      endTime: endTime.value,
      category: newCategory.value,
      priority: newPriority.value as 'High' | 'Medium' | 'Low' | undefined
    })
  }

  // reset
  newTitle.value = ''
  selectedGoalId.value = ''
  newCategory.value = ''
  newPriority.value = ''

  startTime.value = '09:00'
  endTime.value = '18:00'

  emit('close')
}
</script>

<style scoped>
.dropdown-overlay { position: fixed; inset: 0; z-index: 90; }

.custom-select-box {
  position: relative;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #27272a;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-select-box.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.placeholder-text { color: #a1a1aa; }
.chevron { font-size: 12px; color: #a1a1aa; margin-left: 8px; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  max-height: 180px;
  overflow-y: auto;
  list-style: none;
  padding: 6px;
  margin: 0;
  z-index: 100;
}

.dropdown-menu li {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
}

.dropdown-menu li:hover { background: #f4f4f5; }
.dropdown-menu li.selected { background: #eff6ff; color: #2563eb; font-weight: 700; }

.quick-add-area {
  background: #f4f4f5;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-selector {
  display: flex;
  gap: 4px;
  background: #e4e4e7;
  padding: 3px;
  border-radius: 8px;
  align-self: flex-start;
}

.type-selector button {
  border: none;
  background: transparent;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #71717a;
  cursor: pointer;
  border-radius: 6px;
}

.type-selector button.active {
  background: #fff;
  color: #27272a;
}

.input-row {
  display: flex;
  gap: 8px;
}

.event-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.time-range {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.range-dash {
  font-weight: 800;
  color: #a1a1aa;
}

.btn-confirm {
  background: #27272a;
  color: #fff;
  border: none;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.s-input {
  padding: 10px 12px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  font-size: 13px;
  background: #fff;
}
</style>