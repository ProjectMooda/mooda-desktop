<template>
  <BaseModal title="새로운 마일스톤 추가" width="420px" @close="$emit('close')">
    <div class="form-container">
      <div class="form-group">
        <label>타이틀</label>
        <BaseInput
          v-model="newMsSummary"
          field="goalTitle"
          placeholder="마일스톤 타이틀 입력"
          v-focus
          @keyup.enter="submitNewMilestone"
        />
      </div>

      <div class="form-group">
        <label>기간 설정</label>
        <div class="date-row">
          <input v-model="newMsStartDate" type="date" class="s-input flex-1" />
          <span class="date-dash">~</span>
          <input v-model="newMsEndDate" type="date" class="s-input flex-1" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <button class="btn-secondary" @click="$emit('close')">취소</button>
        <button
          class="btn-primary"
          :style="{ backgroundColor: goal?.color || '#27272a' }"
          @click="submitNewMilestone"
        >
          등록하기
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  useScheduleStore,
  type Goal,
  type ScheduleItem
} from '@/stores/useScheduleStore'
import BaseModal from '@/global-components/modal/base/BaseModal.vue'
import BaseInput from '@/global-components/Input/BaseInput.vue'

const props = defineProps<{ goal: Goal }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

const newMsStartDate = ref(store?.selectedDate || '')
const newMsEndDate = ref(store?.selectedDate || '')
const newMsSummary = ref('')

const validateMilestoneDates = (msStart: string, msEnd: string) => {
  if (!props.goal) return false
  const { startDate: gStart, endDate: gEnd } = props.goal
  if (msStart && gStart && msStart < gStart)
    return (alert(`목표 시작일(${gStart})보다 빠를 수 없습니다.`), false)
  if (gEnd) {
    if (msEnd && msEnd > gEnd)
      return (alert(`목표 종료일(${gEnd})보다 늦을 수 없습니다.`), false)
    if (msStart && msStart > gEnd)
      return (alert(`시작일이 목표 종료일(${gEnd})을 초과했습니다.`), false)
  }
  if (msStart && msEnd && msStart > msEnd)
    return (alert('시작 날짜가 종료 날짜보다 늦을 수 없습니다.'), false)
  return true
}

const submitNewMilestone = () => {
  if (
    !newMsSummary.value ||
    !validateMilestoneDates(newMsStartDate.value, newMsEndDate.value)
  )
    return

  // 🌟 스토어 배열 부재 시 초기화 예외 처리 및 추가
  if (!store.schedules) store.schedules = []

  store.schedules.push({
    id: Date.now(),
    type: 'milestone',
    goalId: props.goal.id,
    summary: newMsSummary.value,
    done: false,
    startDate: newMsStartDate.value,
    endDate: newMsEndDate.value
  } as ScheduleItem)

  store.saveData()
  emit('close')
}

const vFocus = {
  mounted: (el: HTMLElement) => {
    // BaseInput의 최상단 div 안에서 실제 input 태그를 찾음
    const input = el.querySelector('input')
    if (input) {
      input.focus()
    }
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flex-1 {
  flex: 1;
}
.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-dash {
  color: #a1a1aa;
  font-weight: 600;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #52525b;
  margin-bottom: 8px;
}
.s-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  color: #27272a;
}
.s-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 푸터 버튼 배치 */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background: #27272a;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-size: 13px;
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-secondary {
  background: #f4f4f5;
  color: #3f3f46;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-size: 13px;
}
.btn-secondary:hover {
  background: #e4e4e7;
}
</style>
