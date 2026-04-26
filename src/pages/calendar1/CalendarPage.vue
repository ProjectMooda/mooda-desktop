<template>
  <div class="split-layout">
    <CalendarCard class="large-calendar" />
    <TaskCard class="task-board" />
  </div>
</template>

<script setup lang="ts">
import CalendarCard from '@/components/CalendarCard.vue'
import TaskCard from '@/components/TaskCard.vue'
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