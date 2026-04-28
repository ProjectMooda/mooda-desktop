<template>
  <div class="standard-task compact-card" @click="openModal">
    
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
        <button class="btn-del" @click="$emit('remove', task.id)">✕</button>
        <input type="checkbox" class="custom-checkbox" v-model="task.done" @change="$emit('update')" />
      </div>
    </div>

  </div>

  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">일정 상세</h3>
      
      <div class="modal-section">
        <label>시간 설정</label>
        <div class="time-inputs">
          <input type="time" v-model="task.startTime" /><span>~</span><input type="time" v-model="task.endTime" />
        </div>
      </div>
      
      <div class="modal-section">
        <div class="section-header">
          <label>한줄 요약</label>
          <button class="text-btn" @click="isEditingSummary = !isEditingSummary">{{ isEditingSummary ? '💾 저장' : '✏️ 수정' }}</button>
        </div>
        <input v-if="isEditingSummary" type="text" class="modal-input" v-model="task.summary" placeholder="한줄 요약을 입력하세요" @keyup.enter="isEditingSummary = false" />
        <p v-else class="modal-text">{{ task.summary || '요약이 없습니다.' }}</p>
      </div>
      
      <div class="modal-section">
        <label>카테고리</label>
        <select class="modal-select" v-model="task.category">
          <option v-for="cat in categories" :key="cat" :value="cat === '선택 안함' ? '' : cat">{{ cat }}</option>
        </select>
      </div>
      
      <div class="modal-section">
        <label>중요도</label>
        <select class="modal-select" v-model="task.priority">
          <option v-for="pri in priorities" :key="pri.value" :value="pri.value">{{ pri.label }}</option>
        </select>
      </div>
      
      <div class="modal-section">
        <div class="section-header">
          <label>상세 메모</label>
          <button class="text-btn" @click="isEditingMemo = !isEditingMemo">{{ isEditingMemo ? '💾 저장' : '✏️ 수정' }}</button>
        </div>
        <textarea v-if="isEditingMemo" class="modal-textarea" v-model="task.memo" placeholder="상세 메모를 입력하세요"></textarea>
        <p v-else class="modal-text memo-text">{{ task.memo || '메모가 없습니다.' }}</p>
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

const props = defineProps<{ task: any }>()
// 일반 할 일 컴포넌트의 삭제는 'remove' 이벤트를 사용함
const emit = defineEmits(['open-detail', 'update', 'remove'])

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

const truncateText = (text: string, maxLength: number = 10) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const openModal = () => {
  isModalOpen.value = true
  emit('open-detail', props.task)
}

const closeModal = () => {
  isModalOpen.value = false
  isEditingSummary.value = false
  isEditingMemo.value = false
  emit('update')
}

const handleDelete = () => {
  emit('remove', props.task.id)
  closeModal()
}
</script>

<style scoped>
/* 카드 기본 레이아웃 - 좌/우 영역을 위아래 꽉 채우도록 설정 */
.compact-card { 
  display: flex; justify-content: space-between; align-items: stretch; gap: 12px; 
  padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; cursor: pointer;
}
.standard-task { background: #fafafa; border: 1px solid transparent; }
.standard-task:hover { background: #fff; border-color: #e4e4e7; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }

/* 왼쪽 영역 */
.task-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 0; position: relative; }
.task-display { font-size: 15px; color: #27272a; line-height: 1.5; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.is-done.task-display { text-decoration: line-through; color: #a1a1aa !important; }

/* 인라인 텍스트 편집기 스타일 (기존 유지) */
.task-textarea { 
  position: absolute; inset: 0; opacity: 0; z-index: 1; width: 100%; height: 100%; 
  resize: none; border: 1px solid #6366f1; border-radius: 8px; background: #fff; 
  color: transparent; padding: 4px; outline: none; font-family: inherit; font-size: 15px; 
}
.task-textarea:focus { opacity: 1; color: #27272a; z-index: 10; height: auto; min-height: 100%; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1); }

/* 오른쪽 영역 (시간 & 액션 버튼) */
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
  gap: 12px; 
  margin-top: auto; 
  padding-top: 4px; 
}

/* 삭제 버튼 및 체크박스 */
.btn-del { 
  background: #fee2e2; color: #ef4444; border: none; width: 24px; height: 24px; 
  border-radius: 6px; font-size: 12px; cursor: pointer; opacity: 0; display: flex; 
  align-items: center; justify-content: center; transition: 0.2s; 
}
.standard-task:hover .btn-del { opacity: 1; }
.btn-del:hover { background: #fecaca; }
.custom-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; margin: 0; }


/* --- 아래부터는 동일한 상세 모달 스타일 --- */
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
</style>