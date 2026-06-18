<template>
  <Card
    :item="item"
    :is-mini="isMini"
    custom-class="global-task-card"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #context>
      <template v-if="!isMini">
        <span
          v-if="categoryData"
          class="meta-badge"
          style="background-color: var(--bg-hover); color: var(--text-sub)"
        >
          {{ categoryData.emoji }} {{ categoryData.label }}
        </span>

        <span
          v-if="priorityData"
          class="meta-badge"
          :style="{ backgroundColor: priorityData.color }"
        >
          {{ priorityData.emoji }} {{ priorityData.label }}
        </span>
      </template>
    </template>

    <template #summary-right>
      <span class="text-xs font-bold text-sub">
        {{ scheduleTypeLabel }}
      </span>
    </template>
  </Card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import Card from './components/Card.vue'

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
</script>

<style scoped>
/* =======================================
   Task Card만의 고유 스타일 오버라이딩
======================================= */
:deep(.global-task-card) {
  background-color: var(--bg-app);
}

:deep(.global-task-card.is-mini) {
  background-color: var(--bg-card);
}

/* =======================================
   우측 하단 일정 타입 라벨 스타일
======================================= */
.schedule-type-label {
  bottom: 12px;
  right: 12px;
}

/* =======================================
   뱃지 공통 스타일
======================================= */
.meta-badge {
  font-size: 11px;
  font-weight: var(--font-bold);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
