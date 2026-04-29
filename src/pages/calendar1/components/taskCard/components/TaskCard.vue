<template>
  <div>
    <div class="standard-task compact-card" @click="openModal">
      
      <div class="drag-handle" @click.stop>⠿</div>
      
      <div class="task-content">
        <div class="task-display" :class="{ 'is-done': task.done }">{{ truncateText(task.text, 15) }}</div>
        
        <textarea
          class="task-textarea"
          v-model="task.text"
          @change="$emit('update')"
          @click.stop
          placeholder="내용을 입력하세요..."
        ></textarea>
      </div>

      <div class="task-actions-right">
        <span v-if="task.startTime || task.endTime" class="meta-time">
          🕒 {{ task.startTime || '미정' }} ~ {{ task.endTime || '미정' }}
        </span>
        
        <div class="action-wrapper" @click.stop>
          <button class="btn-pin" :class="{ 'is-pinned': task.isPinned }" @click.stop="$emit('toggle-pin', task)">📌</button>
          <button class="btn-del" @click="$emit('remove', task.id)">✕</button>
          <input type="checkbox" class="custom-checkbox" v-model="task.done" @change="$emit('update')" />
        </div>
      </div>
    </div>

    <ScheduleDetailModal 
      :is-open="isModalOpen" 
      :data="task" 
      @close="handleClose" 
      @delete="handleDelete" 
    />
  </div> </template>

<script setup lang="ts">
import { ref } from 'vue'
import ScheduleDetailModal from '@/global-components/schedule-detail-modal/ScheduleDetailModal.vue'

const props = defineProps<{ task: any }>()
// 🌟 'toggle-pin' 이벤트 추가
const emit = defineEmits(['open-detail', 'update', 'remove', 'toggle-pin'])

const isModalOpen = ref(false)

const truncateText = (text: string, maxLength: number = 10) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const openModal = () => {
  isModalOpen.value = true
  emit('open-detail', props.task)
}

const handleClose = () => {
  isModalOpen.value = false
  emit('update')
}

const handleDelete = () => {
  emit('remove', props.task.id)
  isModalOpen.value = false
}
</script>

<style scoped>
.compact-card { display: flex; justify-content: space-between; align-items: stretch; gap: 12px; padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; cursor: pointer; }
.standard-task { background: #fafafa; border: 1px solid transparent; }
.standard-task:hover { background: #fff; border-color: #e4e4e7; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }

/* 🌟 드래그 손잡이 스타일 */
.drag-handle { 
  display: flex; align-items: center; justify-content: center; 
  color: #d4d4d8; font-size: 16px; cursor: grab; padding-right: 4px; transition: color 0.2s;
}
.compact-card:hover .drag-handle { color: #a1a1aa; }
.drag-handle:active { cursor: grabbing; color: #3b82f6; }

.task-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 0; position: relative; }
.task-display { font-size: 15px; color: #27272a; line-height: 1.5; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.is-done.task-display { text-decoration: line-through; color: #a1a1aa !important; }

.task-textarea { position: absolute; inset: 0; opacity: 0; z-index: 1; width: 100%; height: 100%; resize: none; border: 1px solid #6366f1; border-radius: 8px; background: #fff; color: transparent; padding: 4px; outline: none; font-family: inherit; font-size: 15px; }
.task-textarea:focus { opacity: 1; color: #27272a; z-index: 10; height: auto; min-height: 100%; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1); }

.task-actions-right { display: flex; flex-direction: column; align-items: flex-end; min-width: 105px; }
.meta-time { font-size: 11px; font-weight: 600; color: #71717a; font-variant-numeric: tabular-nums; }

.action-wrapper { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 4px; }
.btn-del { background: #fee2e2; color: #ef4444; border: none; width: 24px; height: 24px; border-radius: 6px; font-size: 12px; cursor: pointer; opacity: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.standard-task:hover .btn-del { opacity: 1; }
.btn-del:hover { background: #fecaca; }
.custom-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; margin: 0; }

/* 🌟 핀 버튼 스타일 */
.btn-pin { background: transparent; border: none; cursor: pointer; opacity: 0; filter: grayscale(1); transition: 0.2s; font-size: 14px; padding: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.compact-card:hover .btn-pin { opacity: 0.5; }
.btn-pin:hover { opacity: 1; filter: grayscale(0); transform: scale(1.1); }
.btn-pin.is-pinned { opacity: 1; filter: grayscale(0); }
</style>