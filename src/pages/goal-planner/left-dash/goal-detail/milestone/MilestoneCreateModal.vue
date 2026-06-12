<template>
  <div
    class="slide-overlay"
    :class="{ open: isAnimating }"
    @click="handleClose"
  ></div>

  <div
    class="slide-panel flex flex-col"
    :class="{ open: isAnimating }"
    role="dialog"
    aria-modal="true"
  >
    <div class="panel-header shrink-0">
      <div class="panel-title-group">
        <span class="panel-title">새 마일스톤 추가</span>
        <span class="panel-sub"> 🎯 {{ goal?.title || '선택된 목표' }} </span>
      </div>

      <BaseDeleteButton
        intent="close"
        variant="rounded"
        :size="2"
        class="close-btn"
        @click="handleClose"
        aria-label="닫기"
      />
    </div>

    <div class="panel-body flex-1">
      <div class="field">
        <div class="field-label">마일스톤 타이틀</div>
        <BaseInput
          v-model="newMsTitle"
          field="goalTitle"
          placeholder="마일스톤 이름을 입력하세요"
          :size="3"
          @keyup.enter="submitNewMilestone"
        />
      </div>

      <div class="divider"></div>

      <div class="field">
        <div class="field-label">기간 설정</div>
        <GlobalDateRangePicker
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          size="md"
          align="left"
        />

        <div class="date-err" v-show="!isValidDates">
          ⚠️ 종료일은 시작일보다 빠를 수 없습니다.
        </div>
      </div>
    </div>

    <div class="panel-footer shrink-0">
      <BaseButton
        variant="secondary"
        :size="3"
        class="btn-cancel"
        @click="handleClose"
      >
        취소
      </BaseButton>

      <BaseButton
        variant="primary"
        :size="3"
        class="btn-submit"
        :disabled="isSubmitDisabled"
        :style="{
          backgroundColor: isSubmitDisabled
            ? ''
            : goal?.color || 'var(--text-main)'
        }"
        @click="submitNewMilestone"
      >
        등록하기
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'

// 🌟 공통 컴포넌트 임포트
import BaseButton from '@/base-ui/BaseButton.vue'
import BaseInput from '@/base-ui/BaseInput.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue' // 🌟 BaseDeleteButton 추가
import GlobalDateRangePicker from '@/global-components/global-calendar/GlobalDateRangePicker.vue'

const props = defineProps<{ goal: Goal }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

// --- 폼 상태 ---
const newMsTitle = ref('')
const startDate = ref('')
const endDate = ref('')

// --- 슬라이드 애니메이션 제어 ---
const isAnimating = ref(false)

onMounted(() => {
  // DOM 렌더링 직후 슬라이드 애니메이션 트리거
  requestAnimationFrame(() => {
    isAnimating.value = true
  })
})

const handleClose = () => {
  isAnimating.value = false
  // 닫히는 트랜지션(0.3s) 대기 후 실제 컴포넌트 제거
  setTimeout(() => {
    emit('close')
  }, 300)
}

// --- 유효성 검사 ---
const isValidDates = computed(() => {
  if (startDate.value && endDate.value) {
    return endDate.value >= startDate.value
  }
  return true
})

const isSubmitDisabled = computed(() => {
  return !newMsTitle.value.trim() || !isValidDates.value
})

// --- 데이터 저장 ---
const submitNewMilestone = () => {
  if (isSubmitDisabled.value) return

  store.addMilestone(
    props.goal.id,
    newMsTitle.value.trim(),
    startDate.value,
    endDate.value
  )

  handleClose()
}
</script>

<style scoped>
/* =======================================
   🌟 슬라이드 패널 베이스 & 오버레이
======================================= */
.slide-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  transition: background 0.3s ease;
  z-index: 50;
}
.slide-overlay.open {
  background: rgba(0, 0, 0, 0.22);
  pointer-events: all;
}

.slide-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  background: var(--bg-card, #ffffff);
  border-left: 1px solid var(--border-color, #e2e8f0);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 51;
  box-shadow: var(--shadow-3);
}
.slide-panel.open {
  transform: translateX(0);
}

/* =======================================
   🌟 내부 레이아웃 (헤더, 바디, 푸터)
======================================= */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}
.panel-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.panel-title {
  font-size: var(--text-md);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
.panel-sub {
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.close-btn {
  font-size: 16px;
  color: var(--text-sub);
}

.panel-body {
  overflow-y: auto;
  padding: var(--space-4);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.field-label {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-sub);
}

.divider {
  height: 1px;
  background: var(--border-color, #e2e8f0);
  margin: var(--space-4) 0 var(--space-5);
}
.date-err {
  font-size: var(--text-xs);
  color: var(--color-danger, #ef4444);
  margin-top: 4px;
}

.panel-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  gap: var(--space-2);
}
.btn-cancel {
  flex: 1;
}
.btn-submit {
  flex: 2;
}

/* 유틸리티 클래스 */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.flex-1 {
  flex: 1;
}
.shrink-0 {
  flex-shrink: 0;
}
</style>
