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
          v-model="localData.summary"
          placeholder="할 일의 제목(한줄 요약)을 입력하세요"
        />
        <span class="edit-hint title-edit-hint">✏️</span>
      </div>

      <!-- 시간 설정 -->
      <div class="modal-section" style="position: relative; z-index: 95">
        <label>시간 설정</label>
        <div class="time-range">
          <TimePicker v-model="localData.startTime" />
          <span class="range-dash">~</span>
          <TimePicker v-model="localData.endTime" />
        </div>
      </div>

      <!-- ✅ 스토어 연동: 카테고리 & 중요도 -->
      <div
        class="modal-section row-flex"
        style="position: relative; z-index: 90"
      >
        <div class="half-width">
          <label>카테고리</label>
          <SelectList v-model="localData.category" :options="categoryOptions" />
        </div>
        <div class="half-width">
          <label>중요도</label>
          <SelectList v-model="localData.priority" :options="priorityOptions" />
        </div>
      </div>

      <!-- 하위 할 일 (Subtasks) -->
      <div class="modal-section subtasks-section">
        <div class="subtask-header">
          <label>하위 할 일</label>
          <span class="progress-text">{{ progressPercentage }}% 완료</span>
        </div>

        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>

        <div class="subtask-list-container">
          <ul class="subtask-list" v-if="hasSubtasks">
            <li
              v-for="sub in localData.subtasks"
              :key="sub.id"
              class="subtask-item"
            >
              <CheckBox v-model="sub.done" />

              <div class="subtask-input-wrapper">
                <input
                  type="text"
                  class="subtask-input"
                  v-model="sub.text"
                  :class="{ 'is-done': sub.done }"
                />
                <span class="edit-hint">✏️</span>
              </div>
              <Xbutton
                size="sm"
                @click.stop="removeSubtask(sub.id)"
                title="삭제"
              />
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
        <textarea
          class="modal-textarea"
          v-model="localData.memo"
          placeholder="상세 메모를 입력하세요 (선택)"
        ></textarea>
      </div>
    </div>

    <!-- 하단 액션 버튼 (FOOTER 슬롯) -->
    <template #footer>
      <div class="modal-actions">
        <button class="btn-delete" @click.stop="$emit('delete')">
          이 일정 삭제
        </button>
        <button class="btn-close" @click="handleClose">닫기 / 저장</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/global-components/modal/base/BaseModal.vue'
import TimePicker from '@/global-components//time-picker/TimePicker.vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import Xbutton from '@/global-components/ui//Xbutton.vue'
import CheckBox from '@/global-components/ui/CheckBox.vue'
import SelectList from '@/global-components/ui/SelectList.vue' // ✅ 새로 만든 공통 컴포넌트 추가
import type { ScheduleItem } from '@/stores/useScheduleStore'

const store = useScheduleStore()

const props = defineProps<{
  isOpen: boolean
  data: ScheduleItem
}>()

const emit = defineEmits(['close', 'delete', 'update'])

// 1. 모달에서 편집할 로컬 상태 생성
const localData = ref<Partial<ScheduleItem>>({})
const newSubtaskText = ref('')

// ✅ SelectList에 전달할 카테고리 & 중요도 데이터 가공
const categoryOptions = computed(() => {
  return store.categories.map((cat) => ({
    label: cat,
    value: cat
  }))
})

const priorityOptions = computed(() => {
  return store.priorityOptions.map((pri) => ({
    label: `${pri.emoji} ${pri.label}`,
    value: pri.id
  }))
})

// 2. 모달이 열릴 때 props.data를 localData로 깊은 복사 (독립된 데이터로 만듦)
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      localData.value = JSON.parse(JSON.stringify(props.data))
      if (!localData.value.subtasks) {
        localData.value.subtasks = []
      }
    }
  },
  { immediate: true }
)

const hasSubtasks = computed(() => {
  return localData.value.subtasks && localData.value.subtasks.length > 0
})

const progressPercentage = computed(() => {
  const subtasks = localData.value.subtasks ?? []
  if (subtasks.length === 0) return 0
  const total = subtasks.length
  const completed = subtasks.filter((subtask) => subtask.done).length
  return Math.round((completed / total) * 100)
})

// 하위 할 일 추가 (로컬 상태에 추가)
const addSubtask = () => {
  const text = newSubtaskText.value.trim()
  if (!text) return
  localData.value.subtasks?.push({
    id: Date.now(),
    text,
    done: false
  })
  newSubtaskText.value = ''
}

// 하위 할 일 삭제 (로컬 상태에서 삭제)
const removeSubtask = (subtaskId: number) => {
  if (localData.value.subtasks) {
    localData.value.subtasks = localData.value.subtasks.filter(
      (sub) => sub.id !== subtaskId
    )
  }
}

// 3. 닫기 & 저장 로직
const handleClose = () => {
  if (localData.value.subtasks && localData.value.subtasks.length > 0) {
    const total = localData.value.subtasks.length
    const completed = localData.value.subtasks.filter((s) => s.done).length

    // 하위 할 일 완료 여부에 따라 부모의 done 상태 결정
    localData.value.done = total === completed
  }

  // 4. 스토어 액션을 호출하여 변경된 내용을 한 번에 저장 (localStorage 반영됨)
  store.updateSchedule(props.data.id, localData.value)

  emit('update')
  newSubtaskText.value = ''
  emit('close')
}
</script>
<style scoped>
/* =======================================
   📜 Scrollable Wrapper
======================================= */
.detail-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* 16px (기존 18px에서 4px 그리드로 최적화) */
  height: 65vh;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  overflow-x: hidden;
  padding-right: var(--space-2); /* 8px */
  box-sizing: border-box;
}

/* =======================================
   🖋 Title Input (Editable)
======================================= */
.modal-header-title {
  margin-bottom: var(--space-1);
  position: relative;
  display: flex;
  align-items: center;
}
.title-input {
  width: 100%;
  font-size: var(--text-xl); /* 20px */
  font-weight: var(--font-bold);
  color: var(--text-main);
  border: none;
  border-bottom: 2px solid transparent;
  padding: var(--space-1) 0;
  padding-right: var(--space-8); /* 30px -> 32px 그리드 매핑 */
  outline: none;
  transition: border-color var(--transition-fast);
  background: transparent;
}
.title-input:focus {
  border-bottom-color: var(--color-primary); /* #3b82f6 -> 시스템 프라이머리 */
}
.title-input::placeholder {
  color: var(--text-muted);
  font-weight: var(--font-semibold);
}
.title-edit-hint {
  position: absolute;
  right: var(--space-2);
  font-size: var(--text-base); /* 16px */
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
  filter: grayscale(1);
}
.modal-header-title:hover .title-edit-hint,
.title-input:focus + .title-edit-hint {
  opacity: 0.6;
}

/* =======================================
   🎛 Form Layouts & Inputs
======================================= */
.modal-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 6px -> 8px */
}
.modal-section label {
  font-size: var(--text-sm); /* 13px -> 시스템 스케일 14px */
  font-weight: var(--font-semibold);
  color: var(--text-sub);
}
.row-flex {
  display: flex;
  flex-direction: row;
  gap: var(--space-4); /* 16px */
}
.half-width {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

/* Select & Textarea 공통 룩앤필 */
.modal-textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  outline: none;
  box-sizing: border-box;
  transition: all var(--transition-fast);
  background: var(--bg-app); /* 입력 전에는 시스템 배경색으로 자연스럽게 */
}

.modal-textarea {
  height: 90px;
  padding: var(--space-3); /* 12px */
  resize: none;
}
/* 포커스 시 배경이 하얘지면서 프라이머리 컬러 강조 */
.modal-textarea:focus {
  border-color: var(--color-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--color-primary-light); /* 애플 스타일의 얇은 포커스 링 */
}

/* =======================================
   🗂 Subtasks (하위 할 일)
======================================= */
.subtasks-section {
  background: var(--bg-hover); /* #f4f4f5 대응 */
  padding: var(--space-3); /* 14px -> 12px */
  border-radius: var(--radius-md); /* 10px -> 12px */
  margin-top: var(--space-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 10px -> 8px */
}
.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-text {
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

/* Progress Bar */
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 진행도 바는 고유 텐션 유지 */
}

/* Subtask List Items */
.subtask-list-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.subtask-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-2) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.subtask-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--bg-card);
  padding: 6px var(--space-2); /* 6px 10px -> 6px 8px */
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}
.subtask-item:hover {
  border-color: #d4d4d8;
  box-shadow: var(--shadow-sm);
}

/* Subtask Inputs */
.subtask-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  min-width: 0;
}
.subtask-input,
.add-subtask-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--text-main);
  outline: none;
  min-width: 0;
  width: 100%;
}
.subtask-input {
  padding: var(--space-1) 0;
  padding-right: var(--space-6);
}
.subtask-input.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}
.add-subtask-input {
  padding: var(--space-1) 0;
}
.add-subtask-input::placeholder {
  color: var(--text-muted);
}

.edit-hint {
  position: absolute;
  right: 0;
  font-size: var(--text-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
  filter: grayscale(1);
}
.subtask-item:hover .edit-hint,
.subtask-input:focus + .edit-hint {
  opacity: 0.6;
}

.add-subtask-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px var(--space-2);
  background: transparent;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-color);
}
.add-icon {
  color: var(--text-muted);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  width: 16px;
  text-align: center;
}

/* =======================================
   🕒 기타 UI
======================================= */
.time-range {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.range-dash {
  font-weight: var(--font-bold);
  color: var(--text-muted);
}

/* =======================================
   🚀 Modal Actions (Footer Buttons)
======================================= */
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3); /* 12px */
  width: 100%;
}
.btn-delete,
.btn-close {
  border: none;
  padding: var(--space-2) var(--space-4); /* 10px 16px -> 8px 16px */
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  flex: 1;
  transition: background var(--transition-fast);
  font-size: var(--text-sm);
}

/* 빨간색 삭제 버튼 (Danger 색상 맵핑) */
.btn-delete {
  background: var(--color-danger-light); /* #fee2e2 대응 */
  color: var(--color-danger); /* #ef4444 대응 */
}
.btn-delete:hover {
  background: #fca5a5; /* 기존 하버 유지 혹은 위험 느낌 강조 */
}

/* 검은색 닫기/저장 버튼 (시스템 텍스트 메인 컬러 활용) */
.btn-close {
  background: var(--text-main); /* #3f3f46 -> 먹색 계열로 애플스러운 대비 */
  color: var(--bg-card); /* 흰색 글씨 */
}
.btn-close:hover {
  opacity: 0.85; /* 명도를 약간 낮춰 누르는 느낌 제공 */
}
</style>
