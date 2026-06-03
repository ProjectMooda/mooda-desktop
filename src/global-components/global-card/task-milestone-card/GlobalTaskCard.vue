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
      <span class="text-xs font-bold text-sub">일반일정</span>

      <template v-if="!isMini">
        <span
          v-if="item.category && item.category !== '선택 안함'"
          class="meta-badge"
          style="background-color: var(--bg-hover); color: var(--text-sub)"
        >
          {{ item.category }}
        </span>

        <span
          v-if="item.priority"
          class="meta-badge"
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
import Card from './components/Card.vue'
import { useFormatter } from '@/utils/useFormatter'

const { getPriorityLabel, getPriorityStyle } = useFormatter()

defineProps<{
  item: ScheduleItem
  isMini?: boolean
}>()
defineEmits(['update', 'delete', 'toggle-pin'])
</script>

<style scoped>
/* =======================================
   Task Card만의 고유 스타일 오버라이딩
======================================= */
/* 일반 카드와 시각적으로 분리하고 싶을 때 배경색 미세 조정 */
:deep(.global-task-card) {
  background-color: var(--bg-app);
}

/* 미니 모드일 때만 순백색(카드 배경) 부여 */
:deep(.global-task-card.is-mini) {
  background-color: var(--bg-card);
}

/* =======================================
   뱃지 공통 스타일 (크기가 작아 전역에 두기 애매할 때 유용)
======================================= */
.meta-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
