<template>
  <CardBase
    :item="item"
    custom-class="standard-task"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #content>
      <div class="task-display" :class="{ 'is-done': item.done }">
        {{ truncateText(item.summary || '미정', 15) }}
      </div>
    </template>

    <template #meta>
      <span v-if="item.startTime || item.endTime" class="meta-time">
        🕒 {{ item.startTime || '미정' }} ~ {{ item.endTime || '미정' }}
      </span>
    </template>
  </CardBase>
</template>

<script setup lang="ts">
import type { ScheduleItem } from '@/stores/useScheduleStore'
import CardBase from './base/CardBase.vue'
import { useFormatter } from '@/utils/useFormatter'

const { truncateText } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])
</script>

<style scoped>
.standard-task {
  /* 기존 #fafafa(미세한 회색)를 시스템 앱 배경색으로 연결 */
  background: var(--bg-app);
  border: 1px solid transparent;
}

.task-display {
  /* 기존 15px를 시스템 스케일(14px)로 맞추면 전체 폰트 균형이 더 좋아집니다 */
  font-size: var(--text-sm);
  padding: var(--space-1); /* 4px */
}

.task-display.is-done {
  text-decoration: line-through;
  /* 기존 #a1a1aa를 비활성 텍스트 컬러로 연결 */
  color: var(--text-muted);
}

.meta-time {
  font-size: 11px; /* 아주 작은 보조 시간 정보 유지 */
  /* 기존 #71717a를 서브 텍스트 컬러로 연결 */
  color: var(--text-sub);
  font-weight: var(--font-semibold); /* 600 */
}
</style>
