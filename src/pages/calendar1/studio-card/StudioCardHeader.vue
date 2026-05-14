<template>
  <div class="card-head">
    <div class="head-title-group">
      <h3>{{ formattedDate }} Schedule</h3>
      <div class="progress-container" v-if="totalItems > 0">
        <div class="progress-text">달성률 <span>{{ progressPercent }}%</span></div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="head-actions">
      <button 
        class="btn-icon" 
        title="완료된 항목 보기" 
        @click="$emit('toggle-completed')"
      >
        {{ showCompleted ? '👀' : '🙈' }}
      </button>
      <button 
        class="btn-add" 
        :class="{ active: showAddForm }"
        @click="$emit('toggle-add-form')"
      >
        {{ showAddForm ? '✕' : '+' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  formattedDate: string
  totalItems: number
  progressPercent: number
  showCompleted: boolean
  showAddForm: boolean
}>()

defineEmits(['toggle-completed', 'toggle-add-form'])
</script>

<style scoped>
.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.head-title-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.card-head h3 { font-size: 20px; font-weight: 800; color: #27272a; margin: 0; letter-spacing: -0.3px; }
.progress-container { width: 100%; max-width: 240px; display: flex; flex-direction: column; gap: 4px; }
.progress-text { font-size: 12px; font-weight: 600; color: #71717a; display: flex; justify-content: space-between; }
.progress-text span { color: #3b82f6; font-weight: 800; }
.progress-track { width: 100%; height: 6px; background: #f4f4f5; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 4px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.head-actions { display: flex; align-items: center; gap: 8px; }
.btn-icon { background: #f4f4f5; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.2s; }
.btn-icon:hover { background: #e4e4e7; }
.btn-add { background: #27272a; color: #fff; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.btn-add:hover { background: #3f3f46; transform: scale(1.05); }
.btn-add.active { background: #ef4444; }
</style>