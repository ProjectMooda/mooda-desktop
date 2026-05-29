<template>
  <Card
    :item="item"
    :is-mini="isMini"
    custom-class="milestone-task-card"
    :custom-style="dynamicStyle"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #context>
      <span v-if="goalTitle" class="context-goal">{{ goalTitle }}</span>
      <span v-if="goalTitle && parentMilestoneTitle" class="context-divider"
        >/</span
      >

      <span v-if="parentMilestoneTitle" class="context-name">
        {{ truncateText(parentMilestoneTitle, isMini ? 6 : 10) }}
      </span>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import Card from './base/Card.vue' // 경로 확인 필요
import { useFormatter } from '@/utils/useFormatter'

const { truncateText } = useFormatter()

const props = defineProps<{
  item: ScheduleItem
  isMini?: boolean
}>()
defineEmits(['update', 'delete', 'toggle-pin'])
const store = useScheduleStore()

const parentMilestone = computed(() => {
  if (props.item.milestoneId) {
    return store.milestones.find((m) => m.id === props.item.milestoneId)
  }
  return null
})

const parentMilestoneTitle = computed(() => parentMilestone.value?.title || '')

const goalTitle = computed(() => {
  const gId = props.item.goalId || parentMilestone.value?.goalId
  if (!gId) return ''
  return store.goals.find((g) => g.id === gId)?.title || ''
})

const dynamicStyle = computed(() => {
  // 스토어에서 동적 컬러를 주입하고 싶을 때 사용
  return {}
})
</script>

<style scoped>
:deep(.milestone-task-card) {
  background: var(--color-primary-pale, #eff6ff);
  border: 1px dashed var(--color-primary-light, #bfdbfe);
}

:deep(.milestone-task-card.is-mini) {
  border: 1px solid var(--color-primary-light, #bfdbfe); /* 미니일 땐 실선이 깔끔함 */
}

.context-goal {
  font-weight: 800;
  color: var(--color-primary, #3b82f6);
}

.context-name {
  font-weight: 600;
}

.context-divider {
  color: var(--text-muted);
}
</style>
