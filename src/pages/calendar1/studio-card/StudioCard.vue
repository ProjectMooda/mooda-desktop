<template>
  <section class="studio-card">
    <!-- 1. 헤더 (분리됨) -->
    <StudioCardHeader
      :formatted-date="formattedDate"
      :total-items="totalItems"
      :progress-percent="progressPercent"
      :show-completed="showCompleted"
      :show-add-form="showAddForm"
      @toggle-completed="showCompleted = !showCompleted"
      @toggle-add-form="showAddForm = !showAddForm"
    />

    <!-- 2. 빠른 추가 폼 (분리됨) -->
    <StudioQuickAdd v-if="showAddForm" @close="showAddForm = false" />

    <!-- 3. 리스트 영역 -->
    <div class="task-scroll-area">
      <div v-if="totalItems === 0" class="empty-msg">
        일정이 없습니다. 상단의 + 버튼을 눌러 추가해보세요!
      </div>

      <div v-else class="task-lists-container">
        <!-- 고정된 항목 -->
        <div
          v-if="pinnedMilestones.length > 0 || pinnedTasks.length > 0"
          class="list-group"
        >
          <div class="group-label">
            <PinButton is-pinned style="pointer-events: none; padding: 0" />
            고정됨
          </div>
          <MilestoneCard
            v-for="item in pinnedMilestones"
            :key="'p-ms-' + item.id"
            :item="item"
            @open-detail="openDetailModal"
            @update="scheduleStore.updateSchedule(item.id, $event)"
            @toggle-pin="scheduleStore.togglePin(item.id)"
            @delete="scheduleStore.removeSchedule(item.id)"
          />
          <TaskCard
            v-for="item in pinnedTasks"
            :key="'p-task-' + item.id"
            :item="item"
            @update="scheduleStore.updateSchedule(item.id, $event)"
            @delete="scheduleStore.removeSchedule(item.id)"
            @toggle-pin="scheduleStore.togglePin(item.id)"
          />
        </div>

        <!-- 진행 중인 항목 (드래그 가능) -->
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
                :item="element"
                @update="scheduleStore.updateSchedule(element.id, $event)"
                @delete="scheduleStore.removeSchedule(element.id)"
                @toggle-pin="scheduleStore.togglePin(element.id)"
              />
            </template>
          </draggable>
        </div>

        <!-- 완료된 항목 -->
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
              v-for="item in completedMilestones"
              :key="'done-ms-' + item.id"
              :item="item"
              @open-detail="openDetailModal"
              @update="scheduleStore.updateSchedule(item.id, $event)"
              @toggle-pin="scheduleStore.togglePin(item.id)"
              @delete="scheduleStore.removeSchedule(item.id)"
            />
            <TaskCard
              v-for="item in completedTasks"
              :key="'done-task-' + item.id"
              :item="item"
              @update="scheduleStore.updateSchedule(item.id, $event)"
              @delete="scheduleStore.removeSchedule(item.id)"
              @toggle-pin="scheduleStore.togglePin(item.id)"
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

const openDetailModal = (item: ScheduleItem) => emit('open-detail', item)

// ==========================================
// 🚨 드래그 순서 영구 저장 완벽 해결 로직 (Store 구조 반영)
// ==========================================
const localActiveMilestones = ref<ScheduleItem[]>([])
const localActiveTasks = ref<ScheduleItem[]>([])

watch(
  () => scheduleStore.milestones,
  (newVal) => {
    const filtered = newVal.filter((m) => !m.done && !m.isPinned)
    localActiveMilestones.value = filtered.sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )
  },
  { immediate: true, deep: true }
)

watch(
  () => scheduleStore.tasks,
  (newVal) => {
    const filtered = newVal.filter((t) => !t.done && !t.isPinned)
    localActiveTasks.value = filtered.sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    )
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
const pinnedMilestones = computed(() =>
  scheduleStore.milestones.filter((m) => !m.done && m.isPinned)
)
const pinnedTasks = computed(() =>
  scheduleStore.tasks.filter((t) => !t.done && t.isPinned)
)

const completedMilestones = computed(() =>
  scheduleStore.milestones.filter((m) => m.done)
)
const completedTasks = computed(() => scheduleStore.tasks.filter((t) => t.done))

const totalItems = computed(
  () => scheduleStore.milestones.length + scheduleStore.tasks.length
)
const completedItemsCount = computed(
  () => completedMilestones.value.length + completedTasks.value.length
)
const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((completedItemsCount.value / totalItems.value) * 100)
})
</script>

<style scoped>
.studio-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e4e4e7);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
}

.empty-msg {
  font-size: 14px;
  color: #a1a1aa;
  text-align: center;
  padding: 40px 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px dashed #e4e4e7;
  margin-top: 10px;
}

.list-group {
  margin-bottom: 24px;
}
.group-label {
  font-size: 12px;
  font-weight: 700;
  color: #a1a1aa;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.run-icon {
  color: #3b82f6;
}

.completed-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #e4e4e7;
}
.toggle-completed-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #a1a1aa;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}
.toggle-completed-btn:hover {
  color: #52525b;
}
.completed-tasks-group {
  margin-top: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.completed-tasks-group:hover {
  opacity: 1;
}

.ghost-card {
  opacity: 0.4;
  background: #f8fafc;
  border: 2px dashed #94a3b8 !important;
  transform: scale(0.98);
}
</style>
