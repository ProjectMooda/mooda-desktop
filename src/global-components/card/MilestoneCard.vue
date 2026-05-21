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
        <span v-if="goalTitle" class="meta-badge goal-badge">{{
          truncateText(goalTitle, 10)
        }}</span>
        <span
          v-if="item.category && item.category !== '선택 안함'"
          class="meta-badge category-badge"
          >{{ item.category }}</span
        >
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
        <span v-if="item.memo" class="ms-summary">{{
          truncateText(item.memo, 10)
        }}</span>
      </div>
    </template>
  </CardBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import CardBase from './base/CardBase.vue'
import { useFormatter } from '@/utils/useFormatter'

const { truncateText, getPriorityLabel, getPriorityStyle } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])
const store = useScheduleStore()

const goalTitle = computed(() => {
  if (!props.item.goalId) return ''
  return store.goals.find((g) => g.id === props.item.goalId)?.title || ''
})
</script>

<style scoped>
.milestone-item {
  /* 기존 #f8fafc(연한 푸른빛 배경)를 시스템 변수로 대체 */
  background-color: var(--color-primary-pale);
  /* 기존 #e2e8f0(테두리)를 공통 테두리 색상으로 통일 */
  border: 1px solid var(--border-color);
}

/* Milestone 전용 배지/텍스트 스타일 */
.ms-meta-row {
  display: flex;
  gap: 6px; /* 촘촘한 데이터 밀도를 위해 기존 픽셀 유지 */
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 10px; /* 배지의 특수성을 고려해 텍스트 스케일 예외(10px) 유지 */
  font-weight: var(--font-bold); /* 700 */
  padding: 3px var(--space-2); /* 3px 8px */
  border-radius: 6px; /* 컴팩트한 라운딩 유지 */
}

.goal-badge {
  background: var(
    --color-primary
  ); /* 기존 #3b82f6 파란색을 브랜드 프라이머리로 연결 */
  color: var(--bg-card); /* 순백색 #fff */
}

.ms-main-text.is-done {
  text-decoration: line-through;
  opacity: 0.6; /* var(--text-muted) 컬러를 직접 써도 좋지만, opacity 방식도 부드러움 */
}
</style>
