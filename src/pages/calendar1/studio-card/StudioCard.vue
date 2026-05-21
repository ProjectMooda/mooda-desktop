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

const localActiveMilestones = ref<ScheduleItem[]>([])
const localActiveTasks = ref<ScheduleItem[]>([])

// 🌟 핵심 변경: 마일스톤 카테고리에 "마일스톤에 속한 Task들"을 각각 개별로 넣습니다.
watch(
  () => [scheduleStore.milestones, scheduleStore.tasks],
  () => {
    // 1. 마일스톤에 속한 진행 중인 할 일들 (각각 1장의 카드가 됨)
    const activeMilestoneTasks = scheduleStore.tasks.filter(
      (t) => !t.done && !t.isPinned && t.milestoneId
    )
    // 2. 할 일이 하나도 없는 텅 빈 마일스톤도 안 보이게 되면 안 되므로 추가
    const activeEmptyMilestones = scheduleStore.milestones.filter((m) => {
      const hasTasks = scheduleStore.tasks.some((t) => t.milestoneId === m.id)
      return !m.done && !m.isPinned && !hasTasks
    })

    localActiveMilestones.value = [
      ...activeMilestoneTasks,
      ...activeEmptyMilestones
    ].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))

    // 일반 할 일 (마일스톤이 없는 독립적인 할 일)
    const activeStandardTasks = scheduleStore.tasks.filter(
      (t) => !t.done && !t.isPinned && !t.milestoneId
    )
    localActiveTasks.value = activeStandardTasks.sort(
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

// 🌟 고정(Pinned) 항목 로직도 동일하게 분리 적용
const pinnedMilestones = computed(() => {
  const pinnedTasks = scheduleStore.tasks.filter(
    (t) => !t.done && t.isPinned && t.milestoneId
  )
  const emptyMilestones = scheduleStore.milestones.filter(
    (m) =>
      !m.done &&
      m.isPinned &&
      !scheduleStore.tasks.some((t) => t.milestoneId === m.id)
  )
  return [...pinnedTasks, ...emptyMilestones]
})
const pinnedTasks = computed(() =>
  scheduleStore.tasks.filter((t) => !t.done && t.isPinned && !t.milestoneId)
)

// 🌟 완료(Completed) 항목 로직도 동일하게 분리 적용
const completedMilestones = computed(() => {
  const doneTasks = scheduleStore.tasks.filter((t) => t.done && t.milestoneId)
  const emptyMilestones = scheduleStore.milestones.filter(
    (m) => m.done && !scheduleStore.tasks.some((t) => t.milestoneId === m.id)
  )
  return [...doneTasks, ...emptyMilestones]
})
const completedTasks = computed(() =>
  scheduleStore.tasks.filter((t) => t.done && !t.milestoneId)
)

const totalItems = computed(
  () =>
    scheduleStore.milestones.length +
    scheduleStore.tasks.length +
    scheduleStore.events.length
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
/* =======================================
   CARD BASE
======================================= */
.studio-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); /* 16px */
  padding: var(--space-6); /* 24px */
  box-shadow: var(--shadow-md); /* 애플 스타일의 은은한 그림자 */
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
  /* global.css의 scrollbar-gutter: stable 대응 및 우측 여백 최적화 */
  padding-right: var(--space-2);
  display: flex;
  flex-direction: column;
}

/* =======================================
   EMPTY STATE (디자인 톤 다운 및 변수화)
======================================= */
.empty-msg {
  font-size: var(--text-sm); /* 14px */
  color: var(--text-muted);
  text-align: center;
  padding: var(--space-10) var(--space-5); /* 40px 20px */
  background-color: var(--bg-app); /* 앱 공통 배경색과 통일 */
  border-radius: var(--radius-md); /* 12px */
  border: 1px dashed var(--border-color);
  margin-top: var(--space-2); /* 8px 부근으로 정돈 */
}

/* =======================================
   LIST GROUP & LABEL
======================================= */
.list-group {
  margin-bottom: var(--space-6); /* 24px */
}

.group-label {
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-bold);
  color: var(--text-sub); /* 시스템 서브 텍스트 컬러 */
  margin-bottom: var(--space-2); /* 8px */
  display: flex;
  align-items: center;
  gap: var(--space-1); /* 4px */
}

.run-icon {
  color: var(--color-primary); /* 하드코딩 블루를 애플 시그니처 블루로 변경 */
}

/* =======================================
   TOGGLE BUTTON & COMPLETED GROUP
======================================= */
.toggle-completed-btn {
  background: transparent;
  border: none;
  font-size: var(--text-sm); /* 13px 대용으로 14px 권장 혹은 유지 */
  font-weight: var(--font-bold);
  color: var(--text-sub);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 6px 대용으로 8px 혹은 변수 결합 */
  transition: color var(--transition-fast);
}

.toggle-completed-btn:hover {
  color: var(--text-main); /* 호버 시 메인 먹색으로 선명해지도록 처리 */
}

.completed-tasks-group {
  margin-top: var(--space-3); /* 12px */
  opacity: 0.6; /* 완료된 작업은 확실히 흐리게 처리 */
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
  background-color: var(--bg-hover); /* 시스템 6번 그레이와 매핑 */
  border: 2px dashed var(--text-muted) !important;
  transform: scale(0.98);
  /* 트랜지션 추가로 드래그 위치 바뀔 때 부드럽게 안착 */
  transition: transform var(--transition-fast);
}
</style>
