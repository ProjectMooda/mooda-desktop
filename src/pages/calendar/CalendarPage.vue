<template>
  <div class="split-layout w-full h-full">
    <GlobalCalendar
      v-model="scheduleStore.selectedDate"
      class="large-calendar"
    />
    <StudioCard class="task-board" />
  </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/useScheduleStore'
import GlobalCalendar from '@/global-components/global-calendar/GlobalCalendar.vue'
import StudioCard from './right-dash/studio-card/StudioCard.vue'

const scheduleStore = useScheduleStore()
</script>

<style scoped>
.split-layout {
  display: flex;
  flex-direction: row;
  gap: var(--space-6);
}

.large-calendar,
.task-board {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
}
</style>
