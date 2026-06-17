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
      <span class="text-xs font-bold text-sub">{{ scheduleTypeLabel }}</span>

      <template v-if="!isMini">
        <span
          v-if="goalTitle || parentMilestoneTitle"
          class="context-divider"
          style="margin: 0 4px"
          >|</span
        >
        <span v-if="goalTitle" class="context-goal">{{ goalTitle }}</span>
        <span v-if="goalTitle && parentMilestoneTitle" class="context-divider"
          >/</span
        >

        <span v-if="parentMilestoneTitle" class="context-name">
          {{ truncateText(parentMilestoneTitle, 10) }}
        </span>
      </template>
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

// 🌟 creationMode에 따라 적절한 텍스트를 반환하는 computed 속성
const scheduleTypeLabel = computed(() => {
  switch (props.item.creationMode) {
    case 'period':
      return '기간일정'
    case 'weekly':
      return '반복일정'
    case 'multiple':
      return '다중일정'
    case 'single':
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

// ✨ 동적 스타일 (인라인으로 강제 적용)
const dynamicStyle = computed(() => {
  const color = targetGoal.value?.color
  if (!color) return {}

  return {
    // 1. 컴포넌트 배경색과 테두리를 인라인 스타일로 직접 덮어씌움
    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, // 색상을 15% 농도로 연하게 배경에 깔기
    borderColor: `color-mix(in srgb, ${color} 50%, transparent)`, // 테두리는 50% 농도로

    // 2. 텍스트용 변수
    '--card-theme-color': color
  }
})
</script>

<style scoped>
/* 동적 색상이 없을 때(일반 일정 등)를 대비한 기본 폴백(Fallback) 스타일. 
   인라인 스타일이 주입되면 이 기본값은 자동으로 무시됩니다.
*/
:deep(.milestone-task-card) {
  background-color: var(--color-primary-pale, #eff6ff);
  border: 1px dashed var(--color-primary-light, #bfdbfe);
}

:deep(.milestone-task-card.is-mini) {
  border-style: solid;
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
