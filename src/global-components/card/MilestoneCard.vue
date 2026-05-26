<template>
  <CardBase
    :item="item"
    custom-class="milestone-task-card"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #content>
      <div class="ms-content-wrapper">
        <div class="ms-context">
          <span v-if="goalTitle" class="context-goal">{{ goalTitle }}</span>
          <span v-if="goalTitle && parentMilestoneTitle" class="context-divider"
            >/</span
          >
          <span v-if="parentMilestoneTitle" class="context-name">
            {{ truncateText(parentMilestoneTitle, 10) }}
          </span>
        </div>

        <div class="ms-task-title" :class="{ 'is-done': item.done }">
          {{ displayTitle }}
        </div>
      </div>
    </template>

    <template #meta>
      <span v-if="displayTime" class="meta-time">
        {{ displayTime }}
      </span>
    </template>
  </CardBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import CardBase from './base/CardBase.vue'
import { useFormatter } from '@/utils/useFormatter'

const { truncateText } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])
const store = useScheduleStore()

// 🌟 스토어에서 부모 마일스톤 찾기 (이제 store.milestones에서 정확히 찾습니다)
const parentMilestone = computed(() => {
  if (props.item.milestoneId) {
    return store.milestones.find((m) => m.id === props.item.milestoneId)
  }
  return null
})

// 🌟 부모 마일스톤 타이틀 (Milestone 타입에는 title이 있음)
const parentMilestoneTitle = computed(() => {
  return parentMilestone.value ? parentMilestone.value.title : ''
})

// 🌟 스토어에서 소속 목표 찾기 (이제 store.goals에서 정확히 찾습니다)
const goalTitle = computed(() => {
  // 우선 task 자체에 goalId가 있는지 확인하고, 없으면 부모 마일스톤의 goalId를 참조
  const gId = props.item.goalId || parentMilestone.value?.goalId
  if (!gId) return ''
  return store.goals.find((g) => g.id === gId)?.title || ''
})

// 보여줄 타이틀 (CardItem은 무조건 Task이므로 바로 summary 렌더링)
const displayTitle = computed(() => {
  return truncateText(props.item.summary || '미정', 15)
})

// 보여줄 시간 (Task의 시작~종료 시간 렌더링)
const displayTime = computed(() => {
  if (!props.item.startTime && !props.item.endTime) return ''
  return `🕒 ${props.item.startTime || '미정'} ~ ${props.item.endTime || '미정'}`
})
</script>

<style scoped>
/* 동일한 스타일 유지 */
.milestone-task-card {
  background: var(--color-primary-pale, #eff6ff);
  border: 1px dashed var(--color-primary-light, #bfdbfe);
}

.ms-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-1);
}

.ms-context {
  font-size: 10px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.context-goal {
  font-weight: 800;
  color: var(--color-primary, #3b82f6);
}

.context-name {
  font-weight: 600;
}

.ms-task-title {
  font-size: var(--text-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main);
  margin-top: 2px;
}

.ms-task-title.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.meta-time {
  font-size: 11px;
  color: var(--text-sub);
  font-weight: var(--font-semibold);
}
</style>
