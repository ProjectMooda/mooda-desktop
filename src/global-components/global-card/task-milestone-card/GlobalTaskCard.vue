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
      <span class="text-xs font-bold text-sub">{{ scheduleTypeLabel }}</span>

      <template v-if="!isMini">
        <span
          v-if="
            item.category &&
            item.category !== '선택 안함' &&
            item.category !== 'none'
          "
          class="meta-badge"
          style="background-color: var(--bg-hover); color: var(--text-sub)"
        >
          {{ item.category }}
        </span>

        <span
          v-if="item.priority && item.priority !== 'none'"
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
import { computed } from 'vue' // 🌟 computed 임포트 추가
import type { ScheduleItem } from '@/stores/useScheduleStore'
import Card from './components/Card.vue'
import { useFormatter } from '@/utils/useFormatter'

const { getPriorityLabel, getPriorityStyle } = useFormatter()

const props = defineProps<{
  item: ScheduleItem
  isMini?: boolean
}>()
defineEmits(['update', 'delete', 'toggle-pin'])

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
      // 과거에 생성되어 creationMode가 없는 데이터에 대한 기본값 처리
      return '일반일정'
  }
})
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
