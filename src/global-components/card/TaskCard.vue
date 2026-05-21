<template>
  <CardBase
    :item="item"
    custom-class="standard-task"
    @update="(payload) => $emit('update', payload)"
    @delete="$emit('delete')"
    @toggle-pin="$emit('toggle-pin')"
  >
    <template #content>
      <div class="task-content-wrapper">
        <!-- 1. 상단 정보 영역: 좌측(카테고리/중요도) / 우측(시간) -->
        <div class="task-header">
          <div class="task-meta-left">
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
          </div>

          <div v-if="displayTime" class="task-meta-right">
            🕒 {{ displayTime }}
          </div>
        </div>

        <!-- 2. 메인 할 일 이름 -->
        <div class="task-title" :class="{ 'is-done': item.done }">
          {{ truncateText(item.summary || '미정', 15) }}
        </div>
      </div>
    </template>
  </CardBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import CardBase from './base/CardBase.vue'
import { useFormatter } from '@/utils/useFormatter'

// 중요도 라벨과 스타일을 가져오기 위해 useFormatter에서 추가로 불러옵니다.
const { truncateText, getPriorityLabel, getPriorityStyle } = useFormatter()

const props = defineProps<{ item: ScheduleItem }>()
const emit = defineEmits(['update', 'delete', 'toggle-pin'])

// 보여줄 시간 계산 로직
const displayTime = computed(() => {
  if (!props.item.startTime && !props.item.endTime) return ''
  return `${props.item.startTime || '미정'} ~ ${props.item.endTime || '미정'}`
})
</script>

<style scoped>
/* 배경색과 테두리 스타일은 기존 TaskCard 유지 */
.standard-task {
  background: var(--bg-app);
  border: 1px solid transparent;
}

/* MilestoneCard와 동일한 패딩과 간격 적용 */
.task-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 헤더와 타이틀 사이 간격 */
  padding: var(--space-1);
}

/* 상단 헤더: 양쪽 정렬 */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 16px; /* 뱃지가 없을 때도 높이 유지 */
}

/* 좌측 뱃지 그룹 */
.task-meta-left {
  display: flex;
  gap: 4px;
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

/* 우측 시간 텍스트 */
.task-meta-right {
  font-size: 10px;
  color: var(--text-sub);
  font-weight: var(--font-semibold);
}

/* 메인 타이틀 (MilestoneCard 메인 타이틀과 동일 규격) */
.task-title {
  font-size: var(--text-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #111827);
  margin-top: 2px;
}

.task-title.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}
</style>
