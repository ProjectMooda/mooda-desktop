<template>
  <div class="milestone-item compact-card" @click="openModal">
    
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
        <button class="btn-del" @click.stop="$emit('delete', item.ms)">✕</button>
        <input type="checkbox" class="custom-checkbox" v-model="item.ms.done" @change="$emit('update')" />
      </div>
    </div>

  </div>

  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">일정 상세</h3>
      <div class="modal-section">
        <label>시간 설정</label>
        <div class="time-inputs">
          <input type="time" v-model="item.ms.startTime" /><span>~</span><input type="time" v-model="item.ms.endTime" />
        </div>
      </div>
      <div class="modal-section">
        <div class="section-header">
          <label>한줄 요약</label>
          <button class="text-btn" @click="isEditingSummary = !isEditingSummary">{{ isEditingSummary ? '💾 저장' : '✏️ 수정' }}</button>
        </div>
        <input v-if="isEditingSummary" type="text" class="modal-input" v-model="item.ms.summary" placeholder="한줄 요약을 입력하세요" @keyup.enter="isEditingSummary = false" />
        <p v-else class="modal-text">{{ item.ms.summary || '요약이 없습니다.' }}</p>
      </div>
      <div class="modal-section">
        <label>카테고리</label>
        <select class="modal-select" v-model="item.ms.category">
          <option v-for="cat in categories" :key="cat" :value="cat === '선택 안함' ? '' : cat">{{ cat }}</option>
        </select>
      </div>
      <div class="modal-section">
        <label>중요도</label>
        <select class="modal-select" v-model="item.ms.priority">
          <option v-for="pri in priorities" :key="pri.value" :value="pri.value">{{ pri.label }}</option>
        </select>
      </div>
      <div class="modal-section">
        <div class="section-header">
          <label>상세 메모</label>
          <button class="text-btn" @click="isEditingMemo = !isEditingMemo">{{ isEditingMemo ? '💾 저장' : '✏️ 수정' }}</button>
        </div>
        <textarea v-if="isEditingMemo" class="modal-textarea" v-model="item.ms.memo" placeholder="상세 메모를 입력하세요"></textarea>
        <p v-else class="modal-text memo-text">{{ item.ms.memo || '메모가 없습니다.' }}</p>
      </div>
      <div class="modal-actions">
        <button class="btn-delete" @click="handleDelete">이 일정 삭제</button>
        <button class="btn-close" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ item: any }>()
const emit = defineEmits(['open-detail', 'update', 'delete'])

const isModalOpen = ref(false)
const isEditingSummary = ref(false)
const isEditingMemo = ref(false)

const categories = ['선택 안함', '기획', '디자인', '개발', '마케팅', '개인일정', '기타']
const priorities = [
  { value: '', label: '보통' },
  { value: 'High', label: '🔥 높음' },
  { value: 'Medium', label: '⭐ 중간' },
  { value: 'Low', label: '💧 낮음' }
]

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

const closeModal = () => {
  isModalOpen.value = false
  isEditingSummary.value = false
  isEditingMemo.value = false
  emit('update')
}

const handleDelete = () => {
  emit('delete', props.item.ms)
  closeModal()
}
</script>

<style scoped>
.compact-card { 
  display: flex; justify-content: space-between; align-items: stretch; gap: 12px; 
  padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; 
}
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

.task-actions-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  min-width: 105px; 
}

.meta-time { 
  font-size: 11px; font-weight: 600; color: #71717a; 
  font-variant-numeric: tabular-nums; 
}

.action-wrapper {
  display: flex;
  align-items: center;
  gap: 12px; /* 🎯 요청하신 코드의 gap: 12px 적용 */
  margin-top: auto; 
  padding-top: 4px; 
}

/* 🎯 요청하신 새로운 버튼 스타일 적용 */
.btn-del { 
  background: #fee2e2; 
  color: #ef4444; 
  border: none; 
  width: 24px; 
  height: 24px; 
  border-radius: 6px; 
  font-size: 12px; 
  cursor: pointer; 
  opacity: 0; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: 0.2s; 
}
.compact-card:hover .btn-del { opacity: 1; }
.btn-del:hover { background: #fecaca; }

/* 상세 모달 스타일 (기존과 동일) */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
.modal-content { background: #fff; width: 90%; max-width: 400px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 16px; }
.modal-title { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #18181b; }
.modal-section { display: flex; flex-direction: column; gap: 6px; }
.modal-section label { font-size: 13px; font-weight: 600; color: #52525b; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.text-btn { background: none; border: none; font-size: 12px; color: #3b82f6; cursor: pointer; padding: 0; font-weight: 600; }
.text-btn:hover { text-decoration: underline; }
.time-inputs { display: flex; align-items: center; gap: 8px; }
.modal-input, .modal-select, .time-inputs input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; width: 100%; }
.modal-input:focus, .modal-select:focus, .time-inputs input:focus { border-color: #3b82f6; }
.time-inputs input { width: auto; flex: 1; }
.modal-textarea { width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; resize: none; }
.modal-textarea:focus { border-color: #3b82f6; }
.modal-text { font-size: 14px; color: #3f3f46; background: #f4f4f5; padding: 10px 12px; border-radius: 8px; margin: 0; }
.memo-text { min-height: 60px; white-space: pre-wrap; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 12px; }
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; }
.btn-delete:hover { background: #fca5a5; }
.btn-close { background: #3f3f46; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; }
.btn-close:hover { background: #27272a; }

@media (max-width: 1200px) { .category-badge, .priority-badge { display: none; } }
</style>