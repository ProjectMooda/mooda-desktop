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
      <BaseButton
        :size="3"
        variant="secondary"
        :icon-only="true"
        title="완료된 항목 보기"
        @click="$emit('toggle-completed')"
      >
        {{ showCompleted ? '👀' : '🙈' }}
      </BaseButton>

      <BaseButton
        :size="3"
        :variant="showAddForm ? 'danger' : 'primary'"
        :icon-only="true"
        @click="$emit('toggle-add-form')"
      >
        {{ showAddForm ? '✕' : '+' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/base-ui/BaseButton.vue'

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
  align-items: center;
  gap: var(--space-3);
}
.head-title-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
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
  min-width: 0;
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
   ACTIONS
======================================= */
.head-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px */
  flex-shrink: 0;
}
</style>
