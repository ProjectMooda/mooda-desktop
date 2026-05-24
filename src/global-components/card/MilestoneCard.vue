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
        <!-- 1. 컨텍스트 영역: 어느 목표/마일스톤에 속해 있는지 작게 표시 -->
        <div class="ms-context">
          <span v-if="goalTitle" class="context-goal">{{ goalTitle }}</span>
          <span v-if="goalTitle && parentMilestone" class="context-divider"
            >/</span
          >
          <span v-if="parentMilestone" class="context-name">{{
            truncateText(parentMilestone.summary, 10)
          }}</span>
        </div>

        <!-- 2. 메인 할 일 영역: 실제 태스크의 이름 -->
        <div class="ms-task-title" :class="{ 'is-done': item.done }">
          {{ displayTitle }}
        </div>
      </div>
    </template>

    <template #meta>
      <!-- 3. 시간 영역: 태스크의 시간이 있으면 표시 -->
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

// 아이템이 Task인지 Milestone 자체인지 판별
const isTask = computed(() => props.item.type === 'task')

// 부모 마일스톤 찾기 (아이템이 Task면 milestoneId로 찾고, Milestone이면 자기 자신)
const parentMilestone = computed(() => {
  if (isTask.value)
    return store.schedules.find((s) => s.id === props.item.milestoneId)
  return props.item
})

// 소속 목표 이름
const goalTitle = computed(() => {
  // 변수에 미리 할당하여 TS 추론을 돕고 에러 방지
  const gId = parentMilestone.value?.goalId
  if (!gId) return ''
  return store.goals.find((g) => g.id === gId)?.title || ''
})

// 보여줄 타이틀 (Task면 Task 이름, 비어있는 Milestone이면 안내 문구)
const displayTitle = computed(() => {
  if (isTask.value) return truncateText(props.item.summary || '미정', 15)
  return '등록된 세부 할 일이 없습니다'
})

// 보여줄 시간/기간 (Task면 시작~종료 시간, Milestone 자체면 기간)
const displayTime = computed(() => {
  if (isTask.value) {
    if (!props.item.startTime && !props.item.endTime) return ''
    return `🕒 ${props.item.startTime || '미정'} ~ ${props.item.endTime || '미정'}`
  } else {
    const start = props.item.startDate
    const end = props.item.endDate
    if (start && end)
      return `📅 ${start === end ? start.slice(5) : start.slice(5) + '~' + end.slice(5)}`
    return ''
  }
})
</script>

<style scoped>
/* TaskCard와 동일한 규격을 유지하되, 마일스톤 소속임을 나타내는 스타일 */
.milestone-task-card {
  background: var(--color-primary-pale, #eff6ff);
  border: 1px dashed var(--color-primary-light, #bfdbfe);
}

.ms-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px; /* 텍스트 간격을 좁혀서 TaskCard와 높이를 비슷하게 맞춤 */
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
