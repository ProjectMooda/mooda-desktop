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
        {{ truncateText(item.summary || "미정", 15) }}
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
import CardBase from './base/CardBase.vue';
import { useFormatter } from '@/utils/useFormatter'

const { truncateText } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])

</script>

<style scoped>
.standard-task { background: #fafafa; border: 1px solid transparent; }
.task-display { font-size: 15px; padding: 4px; }
.task-display.is-done { text-decoration: line-through; color: #a1a1aa; }
.meta-time { font-size: 11px; color: #71717a; font-weight: 600; }
</style>