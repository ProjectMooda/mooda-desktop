<template>
  <aside class="focus-dashboard">
    <div class="insight-card">
      <div class="insight-header">
        <div>
          <h3>🚀 집중과 성취</h3>
          <p>목표 달성을 위한 몰입의 시간</p>
        </div>
      </div>

      <div class="milestone-tabs">
        <BaseButton
          :size="2"
          variant="ghost"
          :active="activeTab === 'archive'"
          class="flex-1"
          @click="activeTab = 'archive'"
        >
          🗂️ 목표 보관함 <span class="badge-count">{{ archivedCount }}</span>
        </BaseButton>

        <BaseButton
          :size="2"
          variant="ghost"
          :active="activeTab === 'timer'"
          class="flex-1"
          @click="activeTab = 'timer'"
        >
          ⏳ 포커스 타이머
        </BaseButton>
      </div>

      <div class="tab-content-container">
        <transition name="tab-fade" mode="out-in">
          <keep-alive>
            <component
              :is="activeTab === 'archive' ? GoalArchive : FocusTimer"
            />
          </keep-alive>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'
import BaseButton from '@/base-ui/BaseButton.vue'

// 분리한 하위 컴포넌트 임포트 (경로는 프로젝트 트리에 맞게 수정)
import GoalArchive from './GoalArchive.vue'
import FocusTimer from './FocusTimer.vue'

const store = useScheduleStore()

// 탭 상태 관리
const activeTab = ref<'archive' | 'timer'>('archive')

// 뱃지에 띄워줄 보관함 개수만 스토어에서 계산해서 가져옵니다.
const archivedCount = computed(
  () => store.goals.filter((g) => g.isArchived).length
)
</script>

<style scoped>
.focus-dashboard {
  width: 100%;
}
.flex-1 {
  flex: 1;
}

.insight-card {
  background-color: var(--bg-card, #ffffff);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.insight-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main, #1d1d1f);
}
.insight-header p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted, #8e8e93);
  font-weight: 600;
}

.milestone-tabs {
  display: flex;
  gap: 8px;
  background-color: var(--bg-hover, #f2f2f7);
  padding: 4px;
  border-radius: 12px;
}
.badge-count {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 11px;
  margin-left: 4px;
  transition: 0.2s;
}
.is-active .badge-count {
  background-color: var(--text-main, #1d1d1f);
  color: #fff;
}

.tab-content-container {
  min-height: 280px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* 탭 전환 부드러운 애니메이션 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
