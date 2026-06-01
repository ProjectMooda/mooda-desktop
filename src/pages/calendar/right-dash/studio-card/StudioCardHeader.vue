<template>
  <div class="card-head">
    <div class="head-title-group">
      <h3>{{ formattedDate }} Schedule</h3>
      <div v-if="totalItems > 0" class="progress-container">
        <div class="progress-text">
          달성률 <span>{{ progressPercent }}%</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="head-actions">
      <button
        class="btn-icon"
        title="완료된 항목 보기"
        @click="$emit('toggle-completed')"
      >
        {{ showCompleted ? '👀' : '🙈' }}
      </button>
      <button
        class="btn-add"
        :class="{ active: showAddForm }"
        @click="$emit('toggle-add-form')"
      >
        {{ showAddForm ? '✕' : '+' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  formattedDate: string
  totalItems: number
  progressPercent: number
  showCompleted: boolean
  showAddForm: boolean
}>()

defineEmits(['toggle-completed', 'toggle-add-form'])
</script>
<style scoped>
/* =======================================
   HEADER LAYOUT
======================================= */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6); /* 24px */
}

.head-title-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px */
  flex: 1;
}

.card-head h3 {
  font-size: var(--text-xl); /* 20px */
  font-weight: var(--font-bold); /* 700 혹은 800 대용 */
  color: var(--text-main); /* 애플 메인 텍스트 먹색 */
  margin: 0;
  letter-spacing: -0.01em; /* 전역 body 자간 스타일과 통일 */
}

/* =======================================
   PROGRESS BAR (애플 스타일 정돈)
======================================= */
.progress-container {
  width: 100%;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1); /* 4px */
}

.progress-text {
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-semibold);
  color: var(--text-sub); /* 서브 그레이 텍스트 */
  display: flex;
  justify-content: space-between;
}

.progress-text span {
  color: var(--color-primary); /* 애플 시그니처 블루 */
  font-weight: var(--font-bold);
}

.progress-track {
  width: 100%;
  height: 6px;
  background-color: var(--bg-hover); /* 가벼운 트랙 배경색 */
  border-radius: var(--radius-sm); /* 알약 모양 */
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  /* 지나치게 화려한 그라디언트 대신 단색 처리로 깔끔함 극대화 */
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  /* 부드러운 쿠빅 베지어 애니메이션 속도 동기화 */
  transition: width var(--transition-base);
}

/* =======================================
   ACTIONS & BUTTONS
======================================= */
.head-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px */
}

/* 아이콘 버튼 공통 (기존 선언 규칙 준수) */
.btn-icon {
  background-color: var(--bg-hover);
  border: none;
  width: var(--control-size-md); /* 32px */
  height: var(--control-size-md);
  border-radius: var(--radius-sm); /* 애플 표준 둥글기 감성 */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm); /* 14px */
  color: var(--text-main);
  outline: none;
  transition: background-color var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--border-color); /* 호버 시 조금 더 짙어지게 */
}

/* 추가 버튼 (기본형) */
.btn-add {
  background-color: var(--text-main); /* 메인 먹색을 배경으로 활용 */
  color: #ffffff;
  border: none;
  width: var(--control-size-md); /* 32px */
  height: var(--control-size-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-lg); /* 18px '+' 기호용 크기 */
  font-weight: var(--font-medium);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;

  /* 과한 트랜스폼(scale)을 제거하고 쫀득한 active-scale 유틸 연동 준비 */
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-add:hover {
  background-color: #3a3a3c; /* 애플 시스템 그레이 호버 톤 */
}

/* 유저가 클릭하는 순간 미세하게 눌리는 효과 제공 (선택사항) */
.btn-add:active {
  transform: scale(0.96);
}

/* 활성화 / 취소 상태 (is-active 혹은 active) */
.btn-add.active {
  background-color: var(--color-danger); /* iOS 시스템 레드 */
  transform: rotate(45deg); /* '+' 기호를 'x' 모양으로 센스 있게 회전 */
}

.btn-add.active:hover {
  background-color: #e0352b; /* 대인저 호버용 딥 레드 */
}
</style>
