<template>
  <div class="archive-container">
    <transition-group name="list-fade" tag="ul" class="archive-list">
      <li
        v-if="archivedGoals.length === 0"
        key="empty-archive"
        class="empty-state"
      >
        보관함이 비어있습니다.<br />
        당장 진행하지 않을 목표를 잠시 보관하세요.
      </li>

      <li
        v-for="goal in archivedGoals"
        :key="goal.id"
        class="archived-goal-card"
      >
        <div class="ms-content">
          <span class="ms-title">{{ goal.title }}</span>
          <span class="ms-parent-goal">생성일: {{ goal.startDate }}</span>
        </div>

        <BaseButton
          :size="2"
          variant="outline"
          icon-only
          title="다시 진행하기"
          @click="store.toggleGoalArchive(goal.id)"
        >
          📤
        </BaseButton>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import BaseButton from '@/base-ui/BaseButton.vue'

const store = useScheduleStore()

// 🌟 스토어에서 isArchived가 true인 목표만 필터링
const archivedGoals = computed(() => store.goals.filter((g) => g.isArchived))
</script>

<style scoped>
/* =======================================
   보관함 리스트 스타일
======================================= */
.archive-container {
  width: 100%;
}

.archive-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted, #8e8e93);
  line-height: 1.6;
}

/* 보관된 카드 스타일 */
.archived-goal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-hover, #f9f9f9);
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
}

.archived-goal-card:hover {
  background-color: #f2f2f7;
}

.ms-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ms-parent-goal {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted, #8e8e93);
}

.ms-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main, #1d1d1f);
  opacity: 0.7;
}

/* =======================================
   리스트 트랜지션 애니메이션
======================================= */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.list-fade-leave-active {
  position: absolute;
  width: 100%;
}
</style>
