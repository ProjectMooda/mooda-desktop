<template>
  <div class="quick-add-area">
    <div
      v-if="openDropdown"
      class="dropdown-overlay"
      @click="openDropdown = null"
    ></div>

    <div class="type-selector">
      <button :class="{ active: addType === 'task' }" @click="addType = 'task'">
        할 일
      </button>
      <button
        :class="{ active: addType === 'event' }"
        @click="addType = 'event'"
      >
        이벤트
      </button>
    </div>

    <div class="input-row">
      <input
        v-model="newTitle"
        type="text"
        :placeholder="
          addType === 'task'
            ? '할 일을 입력하세요...'
            : '이벤트 제목을 입력하세요...'
        "
        class="s-input flex-1"
        @keyup.enter="handleQuickAdd"
      />
      <button class="btn-confirm" @click="handleQuickAdd">추가</button>
    </div>

    <div v-if="addType === 'event'" class="event-options-grid">
      <!-- 목표 -->
      <div
        class="custom-select-box"
        :class="{ 'is-active': openDropdown === 'goal' }"
        @click="openDropdown = 'goal'"
      >
        <span :class="{ 'placeholder-text': !selectedGoalId }">{{
          selectedGoalName
        }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'goal'" class="dropdown-menu">
          <li
            v-for="goal in scheduleStore.goals"
            :key="goal.id"
            :class="{ selected: selectedGoalId === goal.id }"
            @click.stop="selectGoal(goal.id)"
          >
            {{
              goal.title.length > 10
                ? goal.title.slice(0, 10) + '...'
                : goal.title
            }}
          </li>
        </ul>
      </div>

      <!-- 카테고리 -->
      <div
        class="custom-select-box"
        :class="{ 'is-active': openDropdown === 'category' }"
        @click="openDropdown = 'category'"
      >
        <span :class="{ 'placeholder-text': !newCategory }">{{
          newCategory || '카테고리'
        }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'category'" class="dropdown-menu">
          <li
            v-for="cat in scheduleStore.categories"
            :key="cat"
            :class="{ selected: newCategory === cat }"
            @click.stop="selectCategory(cat)"
          >
            {{ cat }}
          </li>
        </ul>
      </div>

      <!-- 우선순위 -->
      <div
        class="custom-select-box"
        :class="{ 'is-active': openDropdown === 'priority' }"
        @click="openDropdown = 'priority'"
      >
        <span :class="{ 'placeholder-text': !newPriority }">{{
          selectedPriorityLabel
        }}</span>
        <span class="chevron">▾</span>
        <ul v-if="openDropdown === 'priority'" class="dropdown-menu">
          <li
            v-for="p in scheduleStore.priorityOptions"
            :key="p.id"
            :class="{ selected: newPriority === p.id }"
            @click.stop="selectPriority(p.id)"
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

const selectGoal = (id: number) => {
  selectedGoalId.value = id
  openDropdown.value = null
}

const selectCategory = (category: string) => {
  newCategory.value = category
  openDropdown.value = null
}

const selectPriority = (priority: string) => {
  newPriority.value = priority
  openDropdown.value = null
}

/** TimePicker v-model */
const startTime = ref('09:00')
const endTime = ref('18:00')

const selectedGoalName = computed(() => {
  const goal = scheduleStore.goals.find((g) => g.id === selectedGoalId.value)
  return goal
    ? goal.title.length > 8
      ? goal.title.slice(0, 8) + '...'
      : goal.title
    : '목표 선택'
})

const selectedPriorityLabel = computed(() => {
  const p = scheduleStore.priorityOptions.find(
    (opt) => opt.id === newPriority.value
  )
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
/* =======================================
   OVERLAY & LAYER MANAGEMENT
======================================= */
.dropdown-overlay {
  position: fixed;
  inset: 0;
  /* 변수 기반 레이어 격상: 모달 레이어 영역 하위 조율 */
  z-index: calc(var(--z-dropdown) - 1);
}

/* =======================================
   CUSTOM SELECT BOX (Trigger)
======================================= */
.custom-select-box {
  position: relative;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); /* 10px 부근 대용 */
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm); /* 13px 대용 14px 권장 또는 변수 연동 */
  font-weight: var(--font-semibold);
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.custom-select-box.is-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.placeholder-text {
  color: var(--text-muted);
}

.chevron {
  font-size: var(--text-xs);
  color: var(--text-sub);
  margin-left: var(--space-2);
}

/* =======================================
   DROPDOWN MENU
======================================= */
.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-1)); /* 4px~6px 여백 조절 */
  left: 0;
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md); /* 12px */
  /* 애플 스타일의 묵직하고 은은한 드롭다운 그림자 적용 */
  box-shadow: var(--shadow-lg);
  max-height: 180px;
  overflow-y: auto;
  list-style: none;
  padding: var(--space-1); /* 내부 요소 공간 균등 분배 */
  margin: 0;
  z-index: var(--z-dropdown); /* 100 */
}

.dropdown-menu li {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-main);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.dropdown-menu li:hover {
  background-color: var(--bg-hover);
}

/* 애플 표준 리스트 선택 피드백 (연한 블루 배경과 시그니처 블루 매핑) */
.dropdown-menu li.selected {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-bold);
}

/* =======================================
   QUICK ADD AREA & SEGMENTED CONTROL
======================================= */
.quick-add-area {
  background-color: var(--bg-hover); /* 가벼운 내부 박스 톤 */
  padding: var(--space-4); /* 16px */
  border-radius: var(--radius-md); /* 12px */
  display: flex;
  flex-direction: column;
  gap: var(--space-3); /* 12px */
}

/* iOS 스타일 세그먼트 컨트롤 디자인 */
.type-selector {
  display: flex;
  gap: 2px; /* 간격을 좁혀 정교하게 유착 */
  background-color: var(--border-color);
  padding: 3px;
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.type-selector button {
  border: none;
  background: transparent;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  cursor: pointer;
  border-radius: calc(var(--radius-sm) - 2px); /* 내부 둥글기 보정 */
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

/* 세그먼트 활성화: 백색 카드가 은은한 그림자를 품고 올라오는 느낌 */
.type-selector button.active {
  background-color: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
}

/* =======================================
   INPUT & LAYOUT GRID
======================================= */
.input-row {
  display: flex;
  gap: var(--space-2); /* 8px */
}

.s-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  background-color: var(--bg-card);
  color: var(--text-main);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.s-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.event-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2); /* 8px */
}

.time-range {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.range-dash {
  font-weight: var(--font-bold);
  color: var(--text-muted);
}

/* =======================================
   CONFIRM BUTTON
======================================= */
.btn-confirm {
  background-color: var(--text-main); /* 애플 특유의 다크 솔리드 버튼 */
  color: #ffffff;
  border: none;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-confirm:hover {
  background-color: #3a3a3c;
}

.btn-confirm:active {
  transform: scale(0.97); /* 쫀득한 타건감 피드백 */
}
</style>
