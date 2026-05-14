<template>
  <BaseModal 
    :model-value="isOpen" 
    @close="handleClose" 
    width="460px" 
    :show-header="false"
  >
    <!-- BODY 컨텐츠 래퍼 (스크롤을 위해 클래스 스타일 추가됨) -->
    <div class="detail-content-wrapper">
      
      <!-- 메인 타이틀 -->
      <div class="modal-header-title">
        <input 
          type="text" 
          class="title-input" 
          v-model="data.summary" 
          placeholder="할 일의 제목(한줄 요약)을 입력하세요" 
        />
        <span class="edit-hint title-edit-hint">✏️</span>
      </div>
      
      <!-- 시간 설정 -->
      <div class="modal-section" style="position: relative; z-index: 95;">
        <label>시간 설정</label>
        <div class="time-range">
          <TimePicker v-model="data.startTime" />
          <span class="range-dash">~</span>
          <TimePicker v-model="data.endTime" />
        </div>
      </div>
      
      <!-- ✅ 스토어 연동: 카테고리 & 중요도 -->
      <div class="modal-section row-flex" style="position: relative; z-index: 90;">
        <div class="half-width">
          <label>카테고리</label>
          <select class="modal-select" v-model="data.category">
            <option v-for="cat in store.categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="half-width">
          <label>중요도</label>
          <select class="modal-select" v-model="data.priority">
            <option v-for="pri in store.priorityOptions" :key="pri.id" :value="pri.id">
              {{ pri.emoji }} {{ pri.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 하위 할 일 (Subtasks) -->
      <div class="modal-section subtasks-section">
        <div class="subtask-header">
          <label>하위 할 일</label>
          <span class="progress-text">{{ progressPercentage }}% 완료</span>
        </div>

        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        
        <div class="subtask-list-container">
          <ul class="subtask-list" v-if="hasSubtasks">
            <li v-for="sub in data.subtasks" :key="sub.id" class="subtask-item">
              <input type="checkbox" class="custom-checkbox" v-model="sub.done" />
              
              <div class="subtask-input-wrapper">
                <input 
                  type="text" 
                  class="subtask-input" 
                  v-model="sub.text" 
                  :class="{ 'is-done': sub.done }"
                />
                <span class="edit-hint">✏️</span>
              </div>
              <Xbutton size="sm" @click.stop="removeSubtask(sub.id)" title="삭제"/>
            </li>
          </ul>

          <div class="add-subtask-wrapper">
            <span class="add-icon">＋</span>
            <input 
              type="text" 
              class="add-subtask-input" 
              v-model="newSubtaskText"
              @keyup.enter="addSubtask"
              placeholder="하위 할 일 추가 (Enter)" 
            />
          </div>
        </div>
      </div>
      
      <!-- 상세 메모 -->
      <div class="modal-section">
        <div class="section-header">
          <label>상세 메모</label>
        </div>
        <textarea class="modal-textarea" v-model="data.memo" placeholder="상세 메모를 입력하세요 (선택)"></textarea>
      </div>
    </div>

    <!-- 하단 액션 버튼 (FOOTER 슬롯) -->
    <template #footer>
      <div class="modal-actions">
        <button class="btn-delete" @click.stop="$emit('delete')">이 일정 삭제</button>
        <button class="btn-close" @click="handleClose">닫기 / 저장</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/global-components/modal/BaseModal.vue'
import TimePicker from '../time-picker/TimePicker.vue'
import { useScheduleStore } from '@/stores/useScheduleStore';
import Xbutton from '../x-button/Xbutton.vue';

const store = useScheduleStore()

import type { ScheduleItem } from '@/stores/useScheduleStore'

const props = defineProps<{
  isOpen: boolean
  data: ScheduleItem
}>()

const emit = defineEmits(['close', 'delete', 'update'])
const newSubtaskText = ref('')

const addSubtask = () => {
  const text = newSubtaskText.value.trim()
  if (!text) return
  store.addSubtask(props.data.id, text)
  newSubtaskText.value = ''
}

const hasSubtasks = computed(() => {
  return props.data.subtasks && props.data.subtasks.length > 0
})

const progressPercentage = computed(() => {
  const subtasks = props.data.subtasks ?? []

  if (subtasks.length === 0) return 0

  const total = subtasks.length

  const completed = subtasks.filter(
    (subtask) => subtask.done
  ).length

  return Math.round((completed / total) * 100)
})

watch(
  () => props.data.subtasks,
  (newSubtasks) => {
    if (!newSubtasks || newSubtasks.length === 0) return
  },
  { deep: true }
)

watch(() => props.isOpen, (newVal) => {
  if (newVal && !props.data.subtasks) {
    props.data.subtasks = []
  }
})

const removeSubtask = (subtaskId: number) => {
  store.removeSubtask(props.data.id, subtaskId)
}

const handleClose = () => {
  if (props.data.subtasks && props.data.subtasks.length > 0) {
    const total = props.data.subtasks.length
    const completed = props.data.subtasks.filter((s) => s.done).length
    
    if (total === completed) {
      props.data.done = true
    } else {
      props.data.done = false
    }
    emit('update') 
  }
  newSubtaskText.value = ''
  emit('close')
}

</script>

<style scoped>
.detail-content-wrapper { 
  display: flex; 
  flex-direction: column; 
  gap: 18px; 
  height: 65vh;       /* 높이가 화면의 65%를 넘지 않도록 제한 */
  overflow-y: scroll; /* auto ❌ → scroll ✔ */
  scrollbar-gutter: stable;
  overflow-x: hidden;     /* 가로 스크롤 방지 */
  padding-right: 8px;     /* 스크롤바와 콘텐츠 사이 여백 */
  box-sizing: border-box;
}

/* 스크롤바 커스텀 디자인 */
.detail-content-wrapper::-webkit-scrollbar { width: 6px; }
.detail-content-wrapper::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
.detail-content-wrapper::-webkit-scrollbar-track { background: transparent; }

/* 타이틀 & ✏️ 아이콘 */
.modal-header-title { margin-bottom: 4px; position: relative; display: flex; align-items: center; }
.title-input { width: 100%; font-size: 20px; font-weight: 700; color: #18181b; border: none; border-bottom: 2px solid transparent; padding: 4px 0; padding-right: 30px; outline: none; transition: 0.2s; background: transparent; }
.title-input:focus { border-bottom-color: #3b82f6; }
.title-input::placeholder { color: #a1a1aa; font-weight: 600; }
.title-edit-hint { position: absolute; right: 8px; font-size: 16px; opacity: 0; transition: opacity 0.2s; pointer-events: none; filter: grayscale(1); }
.modal-header-title:hover .title-edit-hint, .title-input:focus + .title-edit-hint { opacity: 0.6; }

/* 폼 요소 공통 */
.modal-section { display: flex; flex-direction: column; gap: 6px; }
.modal-section label { font-size: 13px; font-weight: 600; color: #52525b; }
.row-flex { display: flex; flex-direction: row; gap: 16px; }
.half-width { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.modal-input, .modal-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; width: 100%; box-sizing: border-box; background: #fff;}
.modal-input:focus, .modal-select:focus { border-color: #3b82f6; }
.modal-textarea { width: 100%; height: 90px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; resize: none; background: #fafafa; box-sizing: border-box;}
.modal-textarea:focus { border-color: #3b82f6; background: #fff; }

/* 하위 할 일 구역 */
.subtasks-section { background: #f4f4f5; padding: 14px; border-radius: 10px; margin-top: 4px; display: flex; flex-direction: column; gap: 10px; }
.subtask-header { display: flex; justify-content: space-between; align-items: center; }
.progress-text { font-size: 12px; font-weight: 700; color: #3b82f6; }

.progress-bar-bg { width: 100%; height: 6px; background: #e4e4e7; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

.subtask-list-container { 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-start;
}

.subtask-list { list-style: none; padding: 0; margin: 0 0 8px 0; display: flex; flex-direction: column; gap: 8px; }
.subtask-item { display: flex; align-items: center; gap: 10px; background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid #e4e4e7; transition: 0.2s; }
.subtask-item:hover { border-color: #d4d4d8; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }

.custom-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #3b82f6; margin: 0; flex-shrink: 0; }

/* ✅ 버그 수정: flex 자식이 가로 영역을 뚫지 않도록 min-width: 0 보장 */
.subtask-input-wrapper { flex: 1; display: flex; align-items: center; position: relative; min-width: 0; }
.subtask-input { flex: 1; border: none; background: transparent; font-size: 14px; color: #3f3f46; outline: none; padding: 4px 0; padding-right: 24px; min-width: 0; width: 100%; }
.subtask-input.is-done { text-decoration: line-through; color: #a1a1aa; }

.edit-hint { position: absolute; right: 0; font-size: 12px; opacity: 0; transition: opacity 0.2s; pointer-events: none; filter: grayscale(1); }
.subtask-item:hover .edit-hint, .subtask-input:focus + .edit-hint { opacity: 0.6; }

.add-subtask-wrapper { 
  display: flex; align-items: center; gap: 10px; padding: 6px 10px;
  background: transparent; border-radius: 6px; border: 1px dashed #d4d4d8; 
}
.add-icon { color: #a1a1aa; font-weight: bold; font-size: 14px; width: 16px; text-align: center; }
.add-subtask-input { flex: 1; border: none; background: transparent; font-size: 14px; color: #3f3f46; outline: none; padding: 4px 0; min-width: 0; }
.add-subtask-input::placeholder { color: #a1a1aa; }

/* 기타 UI */
.time-range { display: flex; align-items: center; gap: 8px; }
.range-dash { font-weight: 800; color: #a1a1aa; }

/* 모달 액션 영역 */
.modal-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%;}
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-delete:hover { background: #fca5a5; }
.btn-close { background: #3f3f46; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-close:hover { background: #27272a; }
</style>