<template>
  <section class="studio-card">
    <StudioCardHeader
      :formatted-date="formattedDate"
      :total-items="totalItems"
      :progress-percent="progressPercent"
      :show-completed="showCompleted"
      :show-add-form="showAddForm"
      @toggle-completed="showCompleted = !showCompleted"
      @toggle-add-form="showAddForm = !showAddForm"
    />

    <StudioQuickAdd v-if="showAddForm" @close="showAddForm = false" />

    <div class="task-scroll-area">
      <div v-if="totalItems === 0" class="empty-msg">
        일정이 없습니다. 상단의 + 버튼을 눌러 추가해보세요!
      </div>

      <div v-else class="task-lists-container">
        <div
          v-if="pinnedMilestoneTasks.length > 0 || pinnedTasks.length > 0"
          class="list-group"
        >
          <div class="group-label">
            <PinButton is-pinned style="pointer-events: none; padding: 0" />
            고정됨
          </div>
          <MilestoneCard
            v-for="item in pinnedMilestoneTasks"
            :key="'p-ms-' + item.id"
            :item="item"
            @open-detail="openDetailModal"
            @update="handleItemUpdate(item, $event)"
            @toggle-pin="handleItemTogglePin(item)"
            @delete="handleItemDelete(item)"
          />
          <TaskCard
            v-for="item in pinnedTasks"
            :key="'p-task-' + item.id"
            :item="item"
            @update="handleItemUpdate(item, $event)"
            @delete="handleItemDelete(item)"
            @toggle-pin="handleItemTogglePin(item)"
          />
        </div>

        <div
          v-if="localActiveMilestones.length > 0 || localActiveTasks.length > 0"
          class="list-group"
        >
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
                @update="handleItemUpdate(element, $event)"
                @toggle-pin="handleItemTogglePin(element)"
                @delete="handleItemDelete(element)"
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
                :item="element"
                @update="handleItemUpdate(element, $event)"
                @delete="handleItemDelete(element)"
                @toggle-pin="handleItemTogglePin(element)"
              />
            </template>
          </draggable>
        </div>

        <div v-if="completedItemsCount > 0" class="completed-section">
          <button
            class="toggle-completed-btn"
            @click="showCompleted = !showCompleted"
          >
            {{ showCompleted ? '▼' : '▶' }} 완료된 항목 ({{
              completedItemsCount
            }})
          </button>

          <div v-show="showCompleted" class="completed-tasks-group">
            <MilestoneCard
              v-for="item in completedMilestoneTasks"
              :key="'done-ms-' + item.id"
              :item="item"
              @open-detail="openDetailModal"
              @update="handleItemUpdate(item, $event)"
              @toggle-pin="handleItemTogglePin(item)"
              @delete="handleItemDelete(item)"
            />
            <TaskCard
              v-for="item in completedTasks"
              :key="'done-task-' + item.id"
              :item="item"
              @update="handleItemUpdate(item, $event)"
              @delete="handleItemDelete(item)"
              @toggle-pin="handleItemTogglePin(item)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import MilestoneCard from '@/global-components/card/MilestoneCard.vue'
import TaskCard from '@/global-components/card/TaskCard.vue'
import StudioCardHeader from './StudioCardHeader.vue'
import StudioQuickAdd from './StudioQuickAdd.vue'
import PinButton from '@/global-components/ui/PinButton.vue'

const scheduleStore = useScheduleStore()
const emit = defineEmits(['open-detail'])

// 상태 관리
const showAddForm = ref(false)
const showCompleted = ref(false)

// 헤더용 데이터
const formattedDate = computed(() => {
  const full = scheduleStore.selectedDate
  if (!full) return ''
  const parts = full.split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : full
})

// 🌟 타입 안정성 확보: any 대신 ScheduleItem 명시
const openDetailModal = (item: ScheduleItem) => emit('open-detail', item)

const localActiveMilestones = ref<ScheduleItem[]>([])
const localActiveTasks = ref<ScheduleItem[]>([])

// 🌟 할 일 리스트 구성 (순수 ScheduleItem 분배)
watch(
  () => scheduleStore.tasks, // store 내부 computed 배열 감지
  () => {
    // 1. 마일스톤에 속한 진행 중인 할 일들
    const activeMilestoneTasks = scheduleStore.tasks.filter(
      (t) => !t.done && !t.isPinned && t.milestoneId
    )
    localActiveMilestones.value = activeMilestoneTasks.sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )

    // 2. 일반 할 일 (마일스톤 없는 독립적 할 일)
    const activeStandardTasks = scheduleStore.tasks.filter(
      (t) => !t.done && !t.isPinned && !t.milestoneId
    )
    localActiveTasks.value = activeStandardTasks.sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )
  },
  { immediate: true, deep: true }
)

// --- 공통 CRUD 로직 ---
const handleItemUpdate = (item: ScheduleItem, patch: Partial<ScheduleItem>) => {
  scheduleStore.updateSchedule(item.id, patch)
}

const handleItemDelete = (item: ScheduleItem) => {
  scheduleStore.removeSchedule(item.id)
}

const handleItemTogglePin = (item: ScheduleItem) => {
  scheduleStore.togglePin(item.id)
}

// --- 드래그 앤 드롭 순서 저장 ---
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

// 🌟 고정(Pinned) 및 완료(Completed) 항목 분리 처리
const pinnedMilestoneTasks = computed(() =>
  scheduleStore.tasks.filter((t) => !t.done && t.isPinned && t.milestoneId)
)
const pinnedTasks = computed(() =>
  scheduleStore.tasks.filter((t) => !t.done && t.isPinned && !t.milestoneId)
)

const completedMilestoneTasks = computed(() =>
  scheduleStore.tasks.filter((t) => t.done && t.milestoneId)
)
const completedTasks = computed(() =>
  scheduleStore.tasks.filter((t) => t.done && !t.milestoneId)
)

// --- 카운트 및 프로그레스 계산 로직 ---
const totalItems = computed(
  () => scheduleStore.tasks.length + scheduleStore.events.length
)
const completedItemsCount = computed(
  () => completedMilestoneTasks.value.length + completedTasks.value.length
)
const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((completedItemsCount.value / totalItems.value) * 100)
})
</script>

<style scoped>
/* =======================================
   CARD BASE
======================================= */
.studio-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* =======================================
   SCROLL AREA
======================================= */
.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--space-2);
  display: flex;
  flex-direction: column;
}

/* =======================================
   EMPTY STATE
======================================= */
.empty-msg {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-align: center;
  padding: var(--space-10) var(--space-5);
  background-color: var(--bg-app);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
  margin-top: var(--space-2);
}

/* =======================================
   LIST GROUP & LABEL
======================================= */
.list-group {
  margin-bottom: var(--space-6);
}

.group-label {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.run-icon {
  color: var(--color-primary);
}

/* =======================================
   TOGGLE BUTTON & COMPLETED GROUP
======================================= */
.toggle-completed-btn {
  background: transparent;
  border: none;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: color var(--transition-fast);
}

.toggle-completed-btn:hover {
  color: var(--text-main);
}

.completed-tasks-group {
  margin-top: var(--space-3);
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.completed-tasks-group:hover {
  opacity: 1;
}

/* =======================================
   DRAG & DROP GHOST CARD
======================================= */
.ghost-card {
  opacity: 0.4;
  background-color: var(--bg-hover);
  border: 2px dashed var(--text-muted) !important;
  transform: scale(0.98);
  transition: transform var(--transition-fast);
}
</style>
