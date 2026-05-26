<template>
  <BaseModal
    :model-value="isOpen"
    width="460px"
    :show-header="false"
    @close="handleClose"
  >
    <!-- BODY 컨텐츠 래퍼 (스크롤을 위해 클래스 스타일 추가됨) -->
    <div class="detail-content-wrapper">
      <!-- 메인 타이틀 -->
      <div class="modal-header-title">
        <BaseInput
          v-model="localData.summary"
          field="taskTitle"
          placeholder="할 일의 제목(한줄 요약)을 입력하세요"
          class="title-base-input"
        >
          <!-- ✏️ 아이콘을 prefix 슬롯으로 삽입 -->
          <template #prefix>
            <span class="title-edit-hint">✏️</span>
          </template>
        </BaseInput>
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

        <!-- 🌟 공통 컴포넌트 적용 (슬롯 사용) -->
        <BaseTaskList
          :items="localData.subtasks || []"
          text-key="text"
          :editable="true"
          @delete="removeSubtask"
          @update="updateSubtaskProgress"
        >
          <!-- 🔴 footer 슬롯을 사용하여 리스트 아래에 입력창 배치 -->
          <template #footer>
            <div style="margin-top: 12px">
              <!-- 기존 add-subtask-wrapper 걷어내고 BaseInput 직관적 사용 -->
              <BaseInput
                v-model="newSubtaskText"
                field="subtask"
                placeholder="하위 할 일 추가 (Enter)"
                @keyup.enter="handleAddSubtask"
              >
                <!-- ＋ 아이콘을 prefix 슬롯으로 삽입 -->
                <template #prefix>
                  <span class="add-icon">＋</span>
                </template>
              </BaseInput>
            </div>
          </template>
        </BaseTaskList>
      </div>

      <!-- 상세 메모 -->
      <div class="modal-section">
        <div class="section-header">
          <label>상세 메모</label>
        </div>
        <textarea
          v-model="localData.memo"
          class="modal-textarea"
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
import SelectList from '@/global-components/ui/SelectList.vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import BaseTaskList from '@/global-components/ui/BaseTaskList.vue'
import BaseInput from '@/global-components/Input/BaseInput.vue'

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

// 🌟 엔터 입력 처리 함수
const handleAddSubtask = () => {
  const text = newSubtaskText.value
  if (!text) return

  addSubtask(text)
  newSubtaskText.value = '' // 완료 후 입력창 비우기
}

// 하위 할 일 추가 (로컬 상태의 배열 맨 뒤에 추가됨)
const addSubtask = (text: string) => {
  if (!text) return
  localData.value.subtasks?.push({
    id: Date.now(),
    text,
    done: false
  })
}

const updateSubtaskProgress = (updatedItem: any) => {
  if (!localData.value.subtasks) return

  // 1. 하위 할 일 배열에서 방금 클릭한 항목의 위치(인덱스)를 찾습니다.
  const index = localData.value.subtasks.findIndex(
    (sub) => sub.id === updatedItem.id
  )

  // 2. 배열의 해당 위치를 체크 상태가 변한 새로운 데이터로 싹 교체합니다.
  if (index !== -1) {
    localData.value.subtasks[index] = updatedItem
  }
}

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
  gap: var(--space-4); /* 16px */
  height: 65vh;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  overflow-x: hidden;

  /* ✨ 수정된 부분: 위/아래 패딩을 추가하여 애니메이션과 그림자가 잘리지 않게 보호 */
  padding-top: var(--space-2); /* 상단 여유 공간 확보 (8px) */
  padding-bottom: var(--space-2); /* 하단 여유 공간 확보 */
  padding-right: var(--space-2); /* 기존 우측 스크롤 여백 유지 */

  box-sizing: border-box;
}

/* =======================================
   🖋 Title Input (Editable)
======================================= */
.modal-header-title {
  margin-bottom: var(--space-3);

  /* 위에서 패딩을 줬지만 조금 더 넉넉하게 보이고 싶다면 margin-top을 살짝 줘도 좋습니다 */
  margin-top: var(--space-1);
}

/* 제목용 BaseInput은 조금 더 크고 두껍게 보이고 싶다면 
   기본 스타일을 덮어씌움 */
.title-base-input :deep(.base-input) {
  font-size: var(--text-md);
  font-weight: var(--font-bold);
}

.title-edit-hint {
  font-size: var(--text-base);
  opacity: 0.5;
  margin-right: var(--space-1);
}

/* =======================================
   🎛 Form Layouts & Inputs
======================================= */
.modal-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px */
}
.modal-section label {
  font-size: var(--text-sm); /* 14px */
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
  background: var(--bg-app);
  height: 90px;
  padding: var(--space-3); /* 12px */
  resize: none;
}
.modal-textarea:focus {
  border-color: var(--color-primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* =======================================
   🗂 Subtasks (하위 할 일)
======================================= */
.subtasks-section {
  background: var(--bg-hover);
  padding: var(--space-3); /* 12px */
  border-radius: var(--radius-md); /* 12px */
  margin-top: var(--space-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px */
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🌟 하위 할 일 추가 입력창 스타일 복구 */
.add-icon {
  color: var(--color-primary); /* 아이콘에 브랜드 컬러 부여 */
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  width: 24px;
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
  padding: var(--space-2) var(--space-4); /* 8px 16px */
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  flex: 1;
  transition: background var(--transition-fast);
  font-size: var(--text-sm);
}

/* 빨간색 삭제 버튼 */
.btn-delete {
  background: var(--color-danger-light);
  color: var(--color-danger);
}
.btn-delete:hover {
  background: #fca5a5;
}

/* 검은색 닫기/저장 버튼 */
.btn-close {
  background: var(--text-main);
  color: var(--bg-card);
}
.btn-close:hover {
  opacity: 0.85;
}
</style>
