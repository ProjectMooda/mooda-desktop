<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h3 class="modal-title">일정 상세</h3>
      
      <div class="modal-section" style="position: relative; z-index: 95;">
        <label>시간 설정</label>
        <div class="time-range">
          <TimePicker v-model="data.startTime" />
          <span class="range-dash">~</span>
          <TimePicker v-model="data.endTime" />
        </div>
      </div>
      
      <div class="modal-section">
        <div class="section-header">
          <label>한줄 요약</label>
          <button class="text-btn" @click="isEditingSummary = !isEditingSummary">
            {{ isEditingSummary ? '💾 저장' : '✏️ 수정' }}
          </button>
        </div>
        <input v-if="isEditingSummary" type="text" class="modal-input" v-model="data.summary" placeholder="한줄 요약을 입력하세요" @keyup.enter="isEditingSummary = false" />
        <p v-else class="modal-text">{{ data.summary || '요약이 없습니다.' }}</p>
      </div>
      
      <div class="modal-section" style="position: relative; z-index: 90;">
        <label>카테고리</label>
        <select class="modal-select" v-model="data.category">
          <option v-for="cat in categories" :key="cat" :value="cat === '선택 안함' ? '' : cat">{{ cat }}</option>
        </select>
      </div>
      
      <div class="modal-section" style="position: relative; z-index: 80;">
        <label>중요도</label>
        <select class="modal-select" v-model="data.priority">
          <option v-for="pri in priorities" :key="pri.value" :value="pri.value">{{ pri.label }}</option>
        </select>
      </div>
      
      <div class="modal-section">
        <div class="section-header">
          <label>상세 메모</label>
          <button class="text-btn" @click="isEditingMemo = !isEditingMemo">
            {{ isEditingMemo ? '💾 저장' : '✏️ 수정' }}
          </button>
        </div>
        <textarea v-if="isEditingMemo" class="modal-textarea" v-model="data.memo" placeholder="상세 메모를 입력하세요"></textarea>
        <p v-else class="modal-text memo-text">{{ data.memo || '메모가 없습니다.' }}</p>
      </div>
      
      <div class="modal-actions">
        <button class="btn-delete" @click="$emit('delete')">이 일정 삭제</button>
        <button class="btn-close" @click="handleClose">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TimePicker from '../time-picker/TimePicker.vue' // 👈 경로 확인해주세요

const props = defineProps<{
  isOpen: boolean
  data: any
}>()

const emit = defineEmits(['close', 'delete'])

const isEditingSummary = ref(false)
const isEditingMemo = ref(false)

const categories = ['선택 안함', '기획', '디자인', '개발', '마케팅', '개인일정', '기타']
const priorities = [
  { value: '', label: '보통' },
  { value: 'High', label: '🔥 높음' },
  { value: 'Medium', label: '⭐ 중간' },
  { value: 'Low', label: '💧 낮음' }
]

const handleClose = () => {
  isEditingSummary.value = false
  isEditingMemo.value = false
  emit('close')
}
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
.modal-content { background: #fff; width: 90%; max-width: 440px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 16px; }
.modal-title { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #18181b; }
.modal-section { display: flex; flex-direction: column; gap: 6px; }
.modal-section label { font-size: 13px; font-weight: 600; color: #52525b; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.text-btn { background: none; border: none; font-size: 12px; color: #3b82f6; cursor: pointer; padding: 0; font-weight: 600; }
.text-btn:hover { text-decoration: underline; }

.modal-input, .modal-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; width: 100%; }
.modal-input:focus, .modal-select:focus { border-color: #3b82f6; }
.modal-textarea { width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; resize: none; }
.modal-textarea:focus { border-color: #3b82f6; }
.modal-text { font-size: 14px; color: #3f3f46; background: #f4f4f5; padding: 10px 12px; border-radius: 8px; margin: 0; }
.memo-text { min-height: 60px; white-space: pre-wrap; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 12px; }
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; }
.btn-delete:hover { background: #fca5a5; }
.btn-close { background: #3f3f46; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; }
.btn-close:hover { background: #27272a; }

/* 시계 간격 레이아웃 용도 */
.time-range { display: flex; align-items: center; gap: 8px; }
.range-dash { font-weight: 800; color: #a1a1aa; }
</style>