<template>
  <div class="split-layout w-full h-full">
    <!-- 캘린더 카드 -->
    <CalendarCard v-model="scheduleStore.selectedDate" class="large-calendar" />

    <!-- 스튜디오 카드 (태스크 보드) -->
    <StudioCard class="task-board" />
  </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/useScheduleStore'
import CalendarCard from '@/global-components/calendar/Calendar.vue'
import StudioCard from './studio-card/StudioCard.vue'

const scheduleStore = useScheduleStore()
</script>

<style scoped>
/* =======================================
   SPLIT LAYOUT BASE
======================================= */
.split-layout {
  display: flex;
  flex-direction: row;
  gap: var(--space-6); /* 24px 공통 변수 시스템 연동 */
  /* width, height는 template의 유틸리티 클래스로 이관하여 스타일 시트 다이어트 */
}

/* =======================================
   CHILD PANELS (Calendar & Task Board)
======================================= */
.large-calendar,
.task-board {
  flex: 1;
  min-width: 0; /* 가로로 요소가 넘쳐 뚫고 나가는 현상 방지 */
  min-height: 0; /* 세로 컨텐츠(스크롤 영역 등)가 부모를 터트리는 현상 방지 */
  height: 100%; /* 양쪽 패널 모두 부모 높이를 온전히 상속받도록 통일 */
}
</style>
