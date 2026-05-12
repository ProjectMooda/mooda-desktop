<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content" @click.stop>
      
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
      
      <!-- 카테고리 & 중요도 -->
      <div class="modal-section row-flex" style="position: relative; z-index: 90;">
        <div class="half-width">
          <label>카테고리</label>
          <select class="modal-select" v-model="data.category">
            <option v-for="cat in categories" :key="cat" :value="cat === '선택 안함' ? '' : cat">{{ cat }}</option>
          </select>
        </div>
        <div class="half-width">
          <label>중요도</label>
          <select class="modal-select" v-model="data.priority">
            <option v-for="pri in priorities" :key="pri.value" :value="pri.value">{{ pri.label }}</option>
          </select>
        </div>
      </div>

      <!-- 하위 할 일 (Subtasks) -->
      <div class="modal-section subtasks-section">
        <div class="subtask-header">
          <label>하위 할 일</label>
          <!-- 데이터 유무 상관없이 항상 표시 -->
          <span class="progress-text">{{ progressPercentage }}% 완료</span>
        </div>

        <!-- 데이터 유무 상관없이 항상 표시되는 프로그레스 바 -->
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        
        <!-- 🌟 하위 할 일 컨테이너 (140px 고정 확보) -->
        <div class="subtask-list-container">
          
          <!-- 🌟 1. 추가된 하위 할 일 목록이 먼저 렌더링됨 -->
          <ul class="subtask-list" v-if="hasSubtasks">
            <li v-for="(sub, index) in data.subtasks" :key="sub.id" class="subtask-item">
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
              
              <button class="btn-del-sub" @click.stop="removeSubtask(Number(index))" title="삭제">✕</button>
            </li>
          </ul>

          <!-- 🌟 2. 하위 할 일 추가 인풋 (목록 바로 아래에 위치, margin-top: auto 제거됨) -->
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
      
      <!-- 하단 액션 버튼 -->
      <div class="modal-actions">
        <button class="btn-delete" @click.stop="$emit('delete')">이 일정 삭제</button>
        <button class="btn-close" @click="handleClose">닫기 / 저장</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TimePicker from '../time-picker/TimePicker.vue'

const props = defineProps<{
  isOpen: boolean
  data: any // 특정 도메인에 종속되지 않게 유지
}>()

const emit = defineEmits(['close', 'delete', 'update'])
const newSubtaskText = ref('')
// 1. 하위 할 일 추가
const addSubtask = () => {
  const text = newSubtaskText.value.trim()
  if (!text) return

  // subtasks 배열이 없으면 빈 배열로 초기화
  if (!props.data.subtasks) {
    props.data.subtasks = []
  }

  // props.data 객체에 직접 push 하여 양방향 바인딩 효과 반영
  props.data.subtasks.push({
    id: Date.now(), // 고유 ID 부여
    text: text,
    done: false
  })

  newSubtaskText.value = '' // 인풋 비우기
}
const categories = ['선택 안함', '기획', '디자인', '개발', '마케팅', '개인일정', '기타']
const priorities = [
  { value: 'High', label: '🔥 높음' },
  { value: 'Medium', label: '⭐ 중간' },
  { value: 'Low', label: '💧 낮음' }
]

const hasSubtasks = computed(() => {
  return props.data.subtasks && props.data.subtasks.length > 0
})

const progressPercentage = computed(() => {
  if (!hasSubtasks.value) return 0
  const total = props.data.subtasks.length
  const completed = props.data.subtasks.filter((s: any) => s.done).length
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


const removeSubtask = (index: number) => {
  props.data.subtasks.splice(index, 1)
  emit('update')
}

const handleClose = () => {
  // 모달을 닫을 때 하위 할 일이 모두 완료되었는지 체크
  if (props.data.subtasks && props.data.subtasks.length > 0) {
    const total = props.data.subtasks.length
    const completed = props.data.subtasks.filter((s: any) => s.done).length
    
    // 하위 할 일이 모두 체크되었다면 부모 요소도 완료 처리
    if (total === completed) {
      props.data.done = true
    } else {
      props.data.done = false
    }
    // 데이터 변경 사항을 부모에게 알림
    emit('update') 
  }

  newSubtaskText.value = ''
  emit('close')
}
</script>

<style scoped>
/* 모달 기본 골격 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
.modal-content { background: #fff; width: 90%; max-width: 460px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 18px; max-height: 90vh; overflow-y: auto; }

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
.half-width { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.modal-input, .modal-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; width: 100%; }
.modal-input:focus, .modal-select:focus { border-color: #3b82f6; }
.modal-textarea { width: 100%; height: 90px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; resize: none; background: #fafafa; }
.modal-textarea:focus { border-color: #3b82f6; background: #fff; }

/* 하위 할 일 구역 */
.subtasks-section { background: #f4f4f5; padding: 14px; border-radius: 10px; margin-top: 4px; display: flex; flex-direction: column; gap: 10px; }
.subtask-header { display: flex; justify-content: space-between; align-items: center; }
.progress-text { font-size: 12px; font-weight: 700; color: #3b82f6; }

.progress-bar-bg { width: 100%; height: 6px; background: #e4e4e7; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* 🌟 하위 할 일 높이 고정 & 정렬 방식 변경 */
.subtask-list-container { 
  min-height: 140px; /* 정확히 3개 항목 + 입력창이 들어갈 넉넉한 공간 확보 */
  display: flex; 
  flex-direction: column; 
  justify-content: flex-start; /* 위에서부터 차곡차곡 쌓임 */
}

.subtask-list { list-style: none; padding: 0; margin: 0 0 8px 0; display: flex; flex-direction: column; gap: 8px; }
.subtask-item { display: flex; align-items: center; gap: 10px; background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid #e4e4e7; transition: 0.2s; }
.subtask-item:hover { border-color: #d4d4d8; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }

.custom-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #3b82f6; margin: 0; }
.subtask-input-wrapper { flex: 1; display: flex; align-items: center; position: relative; }
.subtask-input { flex: 1; border: none; background: transparent; font-size: 14px; color: #3f3f46; outline: none; padding: 4px 0; padding-right: 24px; }
.subtask-input.is-done { text-decoration: line-through; color: #a1a1aa; }
.edit-hint { position: absolute; right: 0; font-size: 12px; opacity: 0; transition: opacity 0.2s; pointer-events: none; filter: grayscale(1); }
.subtask-item:hover .edit-hint, .subtask-input:focus + .edit-hint { opacity: 0.6; }

.btn-del-sub { background: transparent; color: #a1a1aa; border: none; font-size: 14px; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: 0.2s; width: 24px; height: 24px; }
.btn-del-sub:hover { color: #ef4444; background: #fee2e2; }

/* 🌟 하위 할 일 추가 영역 (margin-top: auto 삭제됨!) */
.add-subtask-wrapper { 
  display: flex; align-items: center; gap: 10px; padding: 6px 10px;
  background: transparent; border-radius: 6px; border: 1px dashed #d4d4d8; /* 입력 영역 강조 */
}
.add-icon { color: #a1a1aa; font-weight: bold; font-size: 14px; width: 16px; text-align: center; }
.add-subtask-input { flex: 1; border: none; background: transparent; font-size: 14px; color: #3f3f46; outline: none; padding: 4px 0; }
.add-subtask-input::placeholder { color: #a1a1aa; }

/* 기타 UI */
.time-range { display: flex; align-items: center; gap: 8px; }
.range-dash { font-weight: 800; color: #a1a1aa; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; gap: 12px; }
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-delete:hover { background: #fca5a5; }
.btn-close { background: #3f3f46; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-close:hover { background: #27272a; }
</style>