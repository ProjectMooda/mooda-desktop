<template>
  <Card
    :item="item"
    :is-mini="isMini"
    custom-class="milestone-task-card"
    :style="dynamicStyle"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #context>
      <template v-if="!isMini">
        <span v-if="goalTitle" class="context-goal">{{ goalTitle }}</span>

        <span
          v-if="goalTitle && parentMilestoneTitle"
          class="context-divider"
          style="margin: 0 4px"
        >
          /
        </span>

        <span v-if="parentMilestoneTitle" class="context-name">
          {{ truncateText(parentMilestoneTitle, 12) }}
        </span>
      </template>
    </template>

    <template #summary-right>
      <div class="flex items-center gap-4">
        <span
          v-if="categoryData"
          class="meta-badge icon-only"
          style="background-color: var(--bg-hover)"
          :title="categoryData.label"
        >
          {{ categoryData.emoji }}
        </span>

        <span
          v-if="priorityData"
          class="meta-badge icon-only"
          :style="{ backgroundColor: priorityData.color }"
          :title="priorityData.label"
        >
          {{ priorityData.emoji }}
        </span>

        <span class="schedule-icon" :title="scheduleTypeLabel">
          {{ scheduleTypeIcon }}
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import Card from '../task-milestone-card/components/Card.vue'
import { useFormatter } from '@/utils/useFormatter'

const { truncateText } = useFormatter()

const props = defineProps<{
  item: ScheduleItem
  isMini?: boolean
}>()
defineEmits(['update', 'delete', 'toggle-pin'])

const store = useScheduleStore()

const categoryData = computed(() => {
  if (!props.item.category) return null
  return store.categories.find((c) => c.id === props.item.category) || null
})

const priorityData = computed(() => {
  if (!props.item.priority) return null
  return store.priorityOptions.find((p) => p.id === props.item.priority) || null
})

// 🌟 일정 타입을 아이콘으로 변환 (공간 절약!)
const scheduleTypeIcon = computed(() => {
  switch (props.item.creationMode) {
    case 'period':
      return '📅' // 기간
    case 'weekly':
      return '🔄' // 반복
    case 'multiple':
      return '📑' // 다중
    case 'single':
    default:
      return '' // 일반 일정은 굳이 아이콘을 안 둬서 더 깔끔하게
  }
})

// 마우스 오버용 텍스트
const scheduleTypeLabel = computed(() => {
  switch (props.item.creationMode) {
    case 'period':
      return '기간일정'
    case 'weekly':
      return '반복일정'
    case 'multiple':
      return '다중일정'
    default:
      return '일반일정'
  }
})

const parentMilestone = computed(() => {
  if (props.item.milestoneId) {
    return store.milestones.find((m) => m.id === props.item.milestoneId)
  }
  return null
})
const parentMilestoneTitle = computed(() => parentMilestone.value?.title || '')

const targetGoal = computed(() => {
  const gId = props.item.goalId || parentMilestone.value?.goalId
  if (!gId) return null
  return store.goals.find((g) => g.id === gId) || null
})

const goalTitle = computed(() => targetGoal.value?.title || '')

const dynamicStyle = computed(() => {
  const color = targetGoal.value?.color
  if (!color) return {}
  return {
    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
    '--card-theme-color': color
  }
})
</script>

<style scoped>
:deep(.milestone-task-card) {
  background-color: var(--color-primary-pale, #eff6ff);
  border: 1px dashed var(--color-primary-light, #bfdbfe);
}

:deep(.milestone-task-card.is-mini) {
  border-style: solid;
}

/* =======================================
   정보 다이어트 뱃지 스타일
======================================= */
.meta-badge.icon-only {
  font-size: 12px;
  padding: 4px;
  border-radius: 50%; /* 동그랗게 만들어서 아이콘처럼 보이게 */
  aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help; /* 마우스를 올리면 툴팁(title)이 나옴을 암시 */
}

.schedule-icon {
  font-size: 14px;
  cursor: help;
  opacity: 0.7;
}
.schedule-icon:hover {
  opacity: 1;
}

.context-goal {
  font-weight: var(--font-bold);
  color: var(--card-theme-color, var(--color-primary, #3b82f6));
}

.context-name {
  font-weight: var(--font-bold);
}

.context-divider {
  color: var(--text-muted);
}
</style>
