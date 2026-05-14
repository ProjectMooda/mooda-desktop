<template>
  <CardBase 
    :item="item" 
    custom-class="milestone-item"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #content>
      <div class="ms-meta-row">
        <span v-if="goalTitle" class="meta-badge goal-badge">{{ truncateText(goalTitle, 10) }}</span>
        <span v-if="item.category && item.category !== '선택 안함'" class="meta-badge category-badge">{{ item.category }}</span>
        <span 
            v-if="item.priority" 
            class="meta-badge priority-badge" 
            :style="getPriorityStyle(item.priority)"
          >
            {{ getPriorityLabel(item.priority) }}
          </span>
      </div>
      <div class="ms-main-text" :class="{ 'is-done': item.done }">
        <span class="ms-title">{{ truncateText(item.summary, 10) }}</span>
        <span v-if="item.memo" class="ms-summary">{{ truncateText(item.memo, 10) }}</span>
      </div>
    </template>
  </CardBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import CardBase from './base/CardBase.vue';
import { useFormatter } from '@/utils/useFormatter'

const { truncateText, getPriorityLabel, getPriorityStyle } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])
const store = useScheduleStore()

const goalTitle = computed(() => {
  if (!props.item.goalId) return ''
  return store.goals.find(g => g.id === props.item.goalId)?.title || ''
})
</script>

<style scoped>
.milestone-item { background-color: #f8fafc; border: 1px solid #e2e8f0; }
/* Milestone 전용 배지/텍스트 스타일만 유지 */
.ms-meta-row { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.goal-badge { background: #3b82f6; color: #fff; }
.ms-main-text.is-done { text-decoration: line-through; opacity: 0.6; }
</style>