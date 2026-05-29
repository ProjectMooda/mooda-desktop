<template>
  <Card
    :item="item"
    :is-mini="isMini"
    custom-class="standard-task"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #context>
      <span class="context-general">일반일정</span>

      <template v-if="!isMini">
        <span
          v-if="item.category && item.category !== '선택 안함'"
          class="meta-badge category-badge"
        >
          {{ item.category }}
        </span>
        <span
          v-if="item.priority"
          class="meta-badge priority-badge"
          :style="getPriorityStyle(item.priority)"
        >
          {{ getPriorityLabel(item.priority) }}
        </span>
      </template>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { ScheduleItem } from '@/stores/useScheduleStore'
import Card from './base/Card.vue' // 경로 확인 필요
import { useFormatter } from '@/utils/useFormatter'

const { getPriorityLabel, getPriorityStyle } = useFormatter()

defineProps<{
  item: ScheduleItem
  isMini?: boolean // 🌟 부모로부터 미니 모드 여부 전달받음
}>()
defineEmits(['update', 'delete', 'toggle-pin'])
</script>

<style scoped>
:deep(.standard-task) {
  background: var(--bg-app);
  border: 1px solid transparent;
}

/* 미니 모드일 때 조금 더 은은한 배경 (선택사항) */
:deep(.standard-task.is-mini) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.context-general {
  font-weight: 800;
  color: var(--text-sub);
}

.meta-badge {
  font-size: 10px;
  font-weight: var(--font-bold, 700);
  padding: 2px 6px;
  border-radius: 4px;
}
.category-badge {
  background: var(--bg-hover, #f3f4f6);
  color: var(--text-sub, #4b5563);
}
</style>
