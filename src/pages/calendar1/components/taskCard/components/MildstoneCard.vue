<template>
  <div> 
    <div class="milestone-item compact-card" @click="openModal">
      
      <div class="drag-handle" @click.stop>⠿</div>
      
      <div class="task-content">
        <div class="ms-meta-row">
          <span class="meta-badge goal-badge">{{ truncateText(item.goalTitle, 10) }}</span>
          <span v-if="item.ms.category && item.ms.category !== '선택 안함'" class="meta-badge category-badge">{{ item.ms.category }}</span>
          <span v-if="item.ms.priority" class="meta-badge priority-badge" :class="'p-' + item.ms.priority.toLowerCase()">
            {{ priorityLabel(item.ms.priority) }}
          </span>
        </div>
        
        <div class="ms-main-text" :class="{ 'is-done': item.ms.done }">
          <span class="ms-title">{{ truncateText(item.ms.text, 10) }}</span>
          <span v-if="item.ms.summary" class="ms-summary">{{ truncateText(item.ms.summary, 10) }}</span>
        </div>
      </div>

      <div class="task-actions-right">
        <span v-if="item.ms.startTime || item.ms.endTime" class="meta-time">
          🕒 {{ item.ms.startTime || '미정' }} ~ {{ item.ms.endTime || '미정' }}
        </span>
        
        <div class="action-wrapper" @click.stop>
          <button class="btn-pin" :class="{ 'is-pinned': item.ms.isPinned }" @click.stop="$emit('toggle-pin', item.ms)">📌</button>
          <button class="btn-del" @click.stop="$emit('delete', item.ms)">✕</button>
<input 
  type="checkbox" 
  class="custom-checkbox" 
  v-model="item.ms.done" 
  @change="toggleMainTaskSafe" 
/>
        </div>
      </div>
    </div>

    <ScheduleDetailModal 
      :is-open="isModalOpen" 
      :data="item.ms" 
      @close="handleClose" 
      @delete="handleDelete" 
    />
  </div> </template>

<script setup lang="ts">
import { ref } from 'vue'
import ScheduleDetailModal from '@/global-components/schedule-detail-modal/ScheduleDetailModal.vue'

const props = defineProps<{ item: any }>()
const emit = defineEmits(['open-detail', 'update', 'delete', 'toggle-pin'])

const isModalOpen = ref(false)

const priorityLabel = (p?: string) => {
  if (p === 'High') return '🔥 높음'
  if (p === 'Medium') return '⭐ 중간'
  if (p === 'Low') return '💧 낮음'
  return ''
}

const truncateText = (text: string, maxLength: number = 10) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const openModal = () => {
  isModalOpen.value = true
  emit('open-detail', props.item.ms)
}

const handleClose = () => {
  isModalOpen.value = false
  emit('update')
}

const handleDelete = () => {
  emit('delete', props.item.ms)
  isModalOpen.value = false
}

const toggleMainTaskSafe = () => {
  // v-model 덕분에 props.item.ms.done은 이미 클릭한 상태로 반영되어 있습니다.
  const isChecked = props.item.ms.done;

  if (props.item.ms.subtasks && props.item.ms.subtasks.length > 0) {
    if (isChecked) {
      // 1. 메인 체크 시: 하위 할 일 모두 체크
      props.item.ms.subtasks.forEach((sub: any) => sub.done = true);
    } else {
      // 2. 메인 체크 해제 시: 하위 할 일이 모두 100% 완료된 상태였을 때만 전체 해제
      const allWereDone = props.item.ms.subtasks.every((sub: any) => sub.done);
      if (allWereDone) {
        props.item.ms.subtasks.forEach((sub: any) => sub.done = false);
      }
    }
  }
  
  // 부모 컴포넌트에 변경 사항 저장 요청
  emit('update');
}
</script>

<style scoped>
.compact-card { display: flex; justify-content: space-between; align-items: stretch; gap: 12px; padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; }

/* 🚨 손잡이 스타일 필수 추가 🚨 */
.drag-handle { 
  display: flex; align-items: center; justify-content: center; 
  color: #d4d4d8; font-size: 16px; cursor: grab; padding-right: 4px; transition: color 0.2s;
}
.compact-card:hover .drag-handle { color: #a1a1aa; }
.drag-handle:active { cursor: grabbing; color: #3b82f6; }

.task-content { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.custom-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; margin: 0; }

.milestone-item { background-color: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; }
.milestone-item:hover { background-color: #f1f5f9; border-color: #cbd5e1; transform: translateY(-1px); }
.ms-meta-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.meta-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.goal-badge { background: #3b82f6; color: #fff; text-transform: uppercase; display: inline-block; vertical-align: bottom; }
.category-badge { background: #e4e4e7; color: #52525b; border: 1px solid #d4d4d8; }
.priority-badge.p-high { background: #fee2e2; color: #ef4444; }
.priority-badge.p-medium { background: #fef3c7; color: #d97706; }
.priority-badge.p-low { background: #e0f2fe; color: #0284c7; }

.ms-main-text { display: flex; align-items: baseline; gap: 8px; overflow: hidden; }
.ms-title { font-size: 15px; font-weight: 700; color: #27272a; white-space: nowrap; flex-shrink: 0; }
.ms-summary { font-size: 13px; color: #71717a; white-space: nowrap; font-weight: 500; }
.ms-summary::before { content: "·"; margin-right: 6px; color: #a1a1aa; }
.is-done .ms-title, .is-done .ms-summary { text-decoration: line-through; color: #a1a1aa !important; }

.task-actions-right { display: flex; flex-direction: column; align-items: flex-end; min-width: 105px; }
.meta-time { font-size: 11px; font-weight: 600; color: #71717a; font-variant-numeric: tabular-nums; }

.action-wrapper { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 4px; }
.btn-del { background: #fee2e2; color: #ef4444; border: none; width: 24px; height: 24px; border-radius: 6px; font-size: 12px; cursor: pointer; opacity: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.compact-card:hover .btn-del { opacity: 1; }
.btn-del:hover { background: #fecaca; }

.btn-pin { background: transparent; border: none; cursor: pointer; opacity: 0; filter: grayscale(1); transition: 0.2s; font-size: 14px; padding: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.compact-card:hover .btn-pin { opacity: 0.5; }
.btn-pin:hover { opacity: 1; filter: grayscale(0); transform: scale(1.1); }
.btn-pin.is-pinned { opacity: 1; filter: grayscale(0); }

@media (max-width: 1200px) { .category-badge, .priority-badge { display: none; } }
</style>