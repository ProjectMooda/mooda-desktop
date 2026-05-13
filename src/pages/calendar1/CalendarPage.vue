<template>
  <div class="split-layout">
    <!-- ✨ 새로 만든 CalendarCard에 v-model로 스토어의 날짜를 연결해줍니다 -->
    <!-- (여기서는 마일스톤 기간 제한이 필요 없으므로 restrict-range 등의 속성은 뺍니다) -->
    <CalendarCard 
      v-model="scheduleStore.selectedDate" 
      class="large-calendar" 
    />
    <StudioCard class="task-board" />
  </div>
</template>

<script setup lang="ts">
// ✨ 스토어를 임포트합니다
import { useScheduleStore } from '@/stores/useScheduleStore'
import CalendarCard from '@/global-components/calendar/Calendar.vue'
import StudioCard from './todoCard/StudioCard.vue';

const scheduleStore = useScheduleStore()
</script>

<style scoped>
.split-layout {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: 100%;
}

.large-calendar,
.task-board {
  flex: 1;
  min-width: 0;
  min-height: 0; /* ✨ Flexbox 자식 요소가 부모 밖으로 삐져나가지 않도록 추가 */
}

/* 캘린더가 꽉 차게 렌더링되도록 높이 상속 */
.large-calendar {
  height: 100%;
}
</style>