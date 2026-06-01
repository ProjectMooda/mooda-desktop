<template>
  <Modal
    :model-value="isOpen"
    title="상세 일정 추가"
    width="540px"
    @close="handleClose"
  >
    <div class="add-content-wrapper">
      <div class="type-segment minimal">
        <button
          :class="{ active: form.type === 'task' }"
          @click="form.type = 'task'"
        >
          ✅ 일반 할 일
        </button>
        <button
          :class="{ active: form.type === 'event' }"
          @click="form.type = 'event'"
        >
          📅 기간 일정 / 이벤트
        </button>
      </div>

      <div class="modal-header-title">
        <BaseInput
          v-model="form.title"
          field="taskTitle"
          placeholder="일정 제목을 입력하세요"
          class="title-base-input"
          autofocus
        >
          <template #prefix>
            <span class="title-edit-hint">✏️</span>
          </template>
        </BaseInput>
      </div>

      <div class="modal-section" style="position: relative; z-index: 95">
        <div class="section-header-flex">
          <label>일시 설정</label>
          <div class="mode-pills">
            <button
              :class="{ active: form.creationMode === 'period' }"
              @click="form.creationMode = 'period'"
            >
              기본
            </button>
            <button
              :class="{ active: form.creationMode === 'weekly' }"
              @click="form.creationMode = 'weekly'"
            >
              요일반복
            </button>
            <button
              :class="{ active: form.creationMode === 'multiple' }"
              @click="form.creationMode = 'multiple'"
            >
              다중지정
            </button>
          </div>
        </div>

        <div class="date-time-box">
          <div
            v-if="
              form.creationMode === 'period' || form.creationMode === 'weekly'
            "
            class="date-time-grid"
          >
            <div class="input-col">
              <span class="sub-label">시작일</span>
              <input
                v-model="form.startDate"
                type="date"
                class="s-input tabular-nums"
              />
            </div>
            <div class="input-col">
              <span class="sub-label">
                종료일 {{ form.creationMode === 'weekly' ? '(마감)' : '' }}
              </span>
              <input
                v-model="form.endDate"
                type="date"
                class="s-input tabular-nums"
              />
            </div>
          </div>

          <div
            v-if="form.creationMode === 'weekly'"
            class="input-col"
            style="margin-top: 12px"
          >
            <div class="days-flex">
              <button
                v-for="(day, index) in daysOfWeek"
                :key="index"
                class="day-btn"
                :class="{ active: form.selectedDays.includes(index) }"
                @click="toggleDay(index)"
              >
                {{ day }}
              </button>
            </div>
          </div>

          <div v-if="form.creationMode === 'multiple'" class="input-col">
            <div class="multi-date-flex">
              <input
                v-model="tempDate"
                type="date"
                class="s-input tabular-nums"
              />
              <button class="btn-add-date" @click="addMultipleDate">
                추가
              </button>
            </div>
            <div v-if="form.selectedDates.length > 0" class="date-chips">
              <div
                v-for="date in form.selectedDates"
                :key="date"
                class="date-chip"
              >
                <span class="tabular-nums">{{ date }}</span>
                <button @click="removeMultipleDate(date)">✕</button>
              </div>
            </div>
          </div>

          <div class="input-col time-col divider-top">
            <div class="time-range">
              <span class="sub-label" style="width: 40px">시간</span>
              <BaseTimePicker v-model="form.startTime" class="tabular-nums" />
              <span class="range-dash">-</span>
              <BaseTimePicker v-model="form.endTime" class="tabular-nums" />
            </div>
          </div>
        </div>
      </div>

      <button class="btn-toggle-advanced" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '닫기 ▴' : '상세 설정 (카테고리, 중요도, 메모) ▾' }}
      </button>

      <transition name="slide-fade">
        <div v-show="showAdvanced" class="advanced-container">
          <div class="modal-section" style="position: relative; z-index: 85">
            <label>세부 속성</label>
            <div class="meta-grid">
              <div v-if="form.type === 'event'" class="input-col">
                <span class="sub-label">목표 연결</span>
                <BaseSelectList v-model="form.goalId" :options="goalOptions" />
              </div>

              <div class="input-col">
                <span class="sub-label">카테고리</span>
                <BaseSelectList
                  v-model="form.category"
                  :options="categoryOptions"
                />
              </div>

              <div class="input-col">
                <span class="sub-label">중요도</span>
                <BaseSelectList
                  v-model="form.priority"
                  :options="priorityOptions"
                />
              </div>
            </div>
          </div>

          <div class="modal-section" style="border-bottom: none">
            <label>상세 메모</label>
            <textarea
              v-model="form.memo"
              class="modal-textarea"
              placeholder="추가적인 설명이나 링크, 참고 사항을 적어두세요."
            ></textarea>
          </div>
        </div>
      </transition>
    </div>

    <template #footer>
      <div class="modal-actions">
        <button class="btn-cancel" @click="handleClose">취소</button>
        <div class="right-actions">
          <button
            class="btn-secondary"
            :disabled="isSubmitDisabled"
            @click="submit(true)"
          >
            저장 후 계속
          </button>
          <button
            class="btn-primary"
            :disabled="isSubmitDisabled"
            @click="submit(false)"
          >
            저장하기
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import Modal from '../components/Modal.vue'
import BaseInput from '@/base-ui/BaseInput.vue'
import BaseTimePicker from '@/base-ui/BaseTimePicker.vue'
import BaseSelectList from '@/base-ui/BaseSelectList.vue'
import { useScheduleStore } from '@/stores/useScheduleStore'

const props = defineProps<{
  isOpen: boolean
  defaultGoalId?: number
  defaultMilestoneId?: number
  defaultDate?: string
}>()
const emit = defineEmits(['close'])
const scheduleStore = useScheduleStore()

// 💡 상세 설정 열림/닫힘 상태
const showAdvanced = ref(false)
// 다중 지정용 임시 날짜
const tempDate = ref('')

// 폼 초기 상태
const getDefaultForm = () => ({
  type: 'task' as 'task' | 'event',
  title: '',
  creationMode: 'period' as 'period' | 'weekly' | 'multiple',
  endDate: '',
  selectedDays: [] as number[], // [0, 1, 2...] (0 = 일요일)
  selectedDates: [] as string[],
  startTime: '',
  endTime: '',
  category: '',
  priority: '',
  memo: '',
  goalId: props.defaultGoalId || null,
  milestoneId: props.defaultMilestoneId || null,
  startDate:
    props.defaultDate ||
    scheduleStore.selectedDate ||
    new Date().toISOString().slice(0, 10)
})

const form = reactive(getDefaultForm())

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      Object.assign(form, getDefaultForm())
      tempDate.value = ''
      showAdvanced.value = false // 모달 열릴 때 항상 닫힌 상태로 초기화
    }
  }
)

/* =======================================
   데이터 매핑: SelectList 전용 Options 생성
======================================= */
const goalOptions = computed(() => [
  { label: '선택 안 함 (독립 일정)', value: null },
  ...scheduleStore.goals.map((g) => ({ label: g.title, value: g.id }))
])

const categoryOptions = computed(() => [
  { label: '카테고리 없음', value: '' },
  ...scheduleStore.categories.map((cat) => ({ label: cat, value: cat }))
])

const priorityOptions = computed(() => [
  { label: '선택 안 함', value: '' },
  ...scheduleStore.priorityOptions.map((pri) => ({
    label: `${pri.emoji} ${pri.label}`,
    value: pri.id
  }))
])

/* =======================================
   지정 날짜(Multiple) 및 요일(Weekly) 로직
======================================= */
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

const toggleDay = (index: number) => {
  const i = form.selectedDays.indexOf(index)
  if (i > -1) form.selectedDays.splice(i, 1)
  else form.selectedDays.push(index)
}

const addMultipleDate = () => {
  if (tempDate.value && !form.selectedDates.includes(tempDate.value)) {
    form.selectedDates.push(tempDate.value)
    form.selectedDates.sort() // 날짜순 정렬
  }
  tempDate.value = ''
}

const removeMultipleDate = (date: string) => {
  form.selectedDates = form.selectedDates.filter((d) => d !== date)
}

// 폼 유효성 검사 (저장 버튼 활성화 조건)
const isSubmitDisabled = computed(() => {
  if (!form.title.trim()) return true

  if (form.creationMode === 'weekly') {
    if (!form.startDate || !form.endDate || form.selectedDays.length === 0)
      return true
  }

  if (form.creationMode === 'multiple') {
    if (form.selectedDates.length === 0) return true
  }

  return false
})

/* =======================================
   스토어 저장 (다중 일정 생성기)
======================================= */
const getDatesBetween = (start: string, end: string) => {
  const dates = []
  let current = new Date(start)
  const last = new Date(end)
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

const createSchedules = () => {
  // 🌟 현재 저장 액션에 묶일 공통 그룹 ID 생성
  const groupId = `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // 내부 함수로 이동하여 groupId와 form 상태를 쉽게 참조
  const pushToStore = (start: string, end?: string) => {
    // 🌟 1. 이벤트이고, 목표(goalId)는 선택했는데 마일스톤(milestoneId)이 없다면 -> "새로운 마일스톤"으로 생성
    if (form.type === 'event' && form.goalId && !form.milestoneId) {
      scheduleStore.addMilestone(form.goalId, form.title, start, end || start)
    }
    // 🌟 2. 일반 할 일(task)이거나, 이미 특정 마일스톤 하위에 속한 이벤트일 경우 -> 일반 일정으로 생성
    else {
      scheduleStore.addSchedule({
        type: form.type, // 'task' 또는 'event'
        groupId, // ✅ 그룹 아이디 주입
        creationMode: form.creationMode, // ✅ 생성 모드 주입
        goalId: form.goalId, // 🌟 누락되었던 목표 ID 연결!
        milestoneId: form.milestoneId, // 🌟 누락되었던 마일스톤 ID 연결!
        summary: form.title,
        startDate: start,
        endDate: end || start, // 종료일이 없으면 당일치기로 세팅
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        category: form.category || undefined,
        priority: form.priority || undefined,
        memo: form.memo
      })
    }
  }

  if (form.creationMode === 'period') {
    // 1. 기간 설정: startDate ~ endDate 하나만 생성
    pushToStore(form.startDate, form.endDate || undefined)
  } else if (form.creationMode === 'weekly') {
    // 2. 요일 반복: 시작일~종료일 사이 선택된 요일만 개별 생성
    const allDates = getDatesBetween(form.startDate, form.endDate)
    allDates.forEach((dateStr) => {
      const dayIndex = new Date(dateStr).getDay()
      if (form.selectedDays.includes(dayIndex)) {
        // 반복되는 단일 일정이므로 start, end를 동일하게
        pushToStore(dateStr, dateStr)
      }
    })
  } else if (form.creationMode === 'multiple') {
    // 3. 다중 선택: 유저가 Pick한 날짜마다 개별 생성
    form.selectedDates.forEach((dateStr) => {
      pushToStore(dateStr, dateStr)
    })
  }
}

const submit = (keepOpen: boolean) => {
  if (isSubmitDisabled.value) return

  createSchedules()

  if (keepOpen) {
    form.title = ''
    form.memo = ''
    form.selectedDates = [] // 다중 날짜는 리셋
    setTimeout(() => {
      ;(
        document.querySelector('.title-base-input input') as HTMLInputElement
      )?.focus()
    }, 50)
  } else {
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* =======================================
   📜 Scrollable Wrapper
======================================= */
.add-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 65vh;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 4px 8px 16px 4px;
}

/* =======================================
   🎛 탭 세그먼트 (타입 / 모드 공통)
======================================= */
.type-segment {
  display: flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.type-segment button {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-segment button.active {
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.type-segment.minimal button {
  padding: 4px 0;
  font-size: 12px;
}

/* =======================================
   🖋 Title Input
======================================= */
.modal-header-title {
  margin-bottom: 4px;
}

.title-base-input :deep(.base-input) {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  padding: 8px 0;
  border: none;
  border-bottom: 2px solid #cbd5e1;
  border-radius: 0;
  background: transparent;
  transition: border-color 0.2s ease;
}

.title-base-input :deep(.base-input:focus) {
  border-bottom-color: #3b82f6;
  box-shadow: none;
}

.title-edit-hint {
  font-size: 16px;
  opacity: 0.4;
  margin-right: 8px;
}

/* =======================================
   공간 절약형 레이아웃 변경사항
======================================= */
.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.mode-pills {
  display: flex;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 2px;
}
.mode-pills button {
  border: none;
  background: transparent;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mode-pills button.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.date-time-box {
  background: #fafafa;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.divider-top {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
}

/* =======================================
   상세 설정 토글 버튼 및 애니메이션
======================================= */
.btn-toggle-advanced {
  width: 100%;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s;
  margin-top: 4px;
}
.btn-toggle-advanced:hover {
  color: #0f172a;
}

.advanced-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 12px;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* =======================================
   🗂 폼 레이아웃 & 라벨
======================================= */
.modal-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}

.modal-section:last-of-type {
  border-bottom: none;
}

.modal-section > label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sub-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

/* =======================================
   그리드 & 커스텀 입력부 
======================================= */
.date-time-grid,
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.input-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-dash {
  font-weight: 600;
  color: #94a3b8;
}

/* =======================================
   요일 다중 선택 버튼
======================================= */
.days-flex {
  display: flex;
  gap: 6px;
}

.day-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-btn.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

/* =======================================
   지정 날짜 칩 & 버튼
======================================= */
.multi-date-flex {
  display: flex;
  gap: 8px;
}

.btn-add-date {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.date-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.date-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-weight: 600;
}

.date-chip button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  font-weight: bold;
}
.date-chip button:hover {
  color: #ef4444;
}

/* =======================================
   입력 컨트롤 공통 
======================================= */
.s-input,
.modal-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.s-input:hover,
.modal-textarea:hover {
  border-color: #94a3b8;
}

.s-input:focus,
.modal-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.modal-textarea {
  height: 80px;
  resize: vertical;
  line-height: 1.4;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* =======================================
   🚀 Modal Actions (Footer)
======================================= */
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 12px;
}

.btn-cancel:hover {
  color: #0f172a;
  text-decoration: underline;
}

.btn-secondary {
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.btn-primary {
  background-color: #0f172a;
  color: #ffffff;
  border: 1px solid #0f172a;
  padding: 8px 18px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #334155;
  border-color: #334155;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
