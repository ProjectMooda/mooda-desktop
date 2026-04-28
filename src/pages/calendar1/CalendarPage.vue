<template>
  <div class="split-layout">
    <CalendarCard class="large-calendar" />
    <StudioCard class="task-board" />
  </div>
</template>

<script setup lang="ts">
import CalendarCard from '@/components/CalendarCard.vue'
import StudioCard from './components/taskCard/StudioCard.vue';
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
}
</style>