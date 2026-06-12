<template>
  <div class="jarvis-wrapper">
    <GlobalSidebar />

    <main class="main-workspace min-w-0">
      <header class="studio-header shrink-0 justify-between items-center mb-16">
        <div class="flex-col gap-4">
          <span class="text-sm font-semibold text-muted">{{ todayDate }}</span>
          <h1 class="page-title text-2xl font-bold text-main">
            {{ currentMenuLabel }}<span class="text-primary">.</span>
          </h1>
        </div>

        <div class="header-actions-dock shadow-2">
          <BaseButton :size="3" variant="ghost" class="dock-key">1</BaseButton>
          <BaseButton :size="3" variant="ghost" class="dock-key">2</BaseButton>
          <BaseButton
            :size="3"
            variant="ghost"
            class="dock-key special-key-success"
            >3</BaseButton
          >
          <BaseButton
            :size="3"
            variant="ghost"
            class="dock-key special-key-danger"
            >4</BaseButton
          >

          <BaseButton
            :size="3"
            variant="ghost"
            class="dock-key special-key-warning"
            @click="sidebarStore.showSettings = true"
          >
            5
          </BaseButton>
        </div>
      </header>

      <div class="scroll-content min-h-0 flex-col">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="currentComponent" />
          </keep-alive>
        </transition>
      </div>
    </main>

    <GlobalSettingsModal v-if="sidebarStore.showSettings" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

// 컴포넌트 임포트
import GlobalSidebar from './global-components/global-sidebar/GlobalSidebar.vue'
import GlobalSettingsModal from './global-components/global-settings/GlobalSettingsModal.vue'
import CalendarPage from '@/pages/calendar/CalendarPage.vue'
import GoalPlanner from '@/pages/goal-planner/GoalPlannerPage.vue'
import BaseButton from '@/base-ui/BaseButton.vue'

// 스토어 임포트
import { useSidebarStore } from './global-components/global-sidebar/useSidebarStore.ts'
import { useSettingsStore } from './global-components/global-settings/useSettingsStore.ts'
import { useScheduleStore } from '@/stores/useScheduleStore'

const sidebarStore = useSidebarStore()
const settingsStore = useSettingsStore()
const scheduleStore = useScheduleStore()

const { currentTab, menuItems } = storeToRefs(sidebarStore)

const currentMenuLabel = computed(() => {
  return menuItems.value[currentTab.value - 1]?.label || 'Workspace'
})

const todayDate = computed(() => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date())
})

const currentComponent = computed(() => {
  const label = menuItems.value[currentTab.value - 1]?.label
  if (label === 'Calendar') return CalendarPage
  if (label === 'GoalPlanner') return GoalPlanner
  return null
})

onMounted(() => {
  settingsStore.loadSettings()
  scheduleStore.loadData()
})
</script>

<style scoped>
/* =======================================
   전체 래퍼
======================================= */
.jarvis-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}
.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-10); /* 40px */
  min-width: 0;
  height: 100%;
}

/* =======================================
   스튜디오 헤더
======================================= */
.studio-header {
  height: 100px;
}

.page-title {
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* =======================================
   🌟 글로벌 변수를 활용한 미니 독 디자인
======================================= */
.header-actions-dock {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px */
  background-color: var(--bg-card); /* 시스템 백그라운드 */
  border: 1px solid var(--border-color); /* 시스템 보더 */
  border-radius: var(--radius-lg);
  padding: var(--space-2); /* 8px */
}

/* 🌟 BaseButton 오버라이드 (키캡 디자인) */
.header-actions-dock :deep(.base-button.is-ghost) {
  /* 기본 상태 (눈에 띄게 테두리 부여) */
  background-color: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); /* 시스템의 8px 각진 반경 사용 */
  color: var(--text-sub);

  /* 숫자가 요동치지 않도록 tabular-nums 강제 적용 */
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-bold);

  /* BaseButton 사이즈 3을 오버라이드하여 정사각형 모양으로 잡음 */
  min-width: var(--control-h-3);
  padding: 0;
  justify-content: center;

  /* 글로벌 Transition 변수 활용 */
  transition: all var(--transition-base);
}

/* 🌟 호버 시: 글로벌 컬러 변수를 이용한 SF 모던 글로우(발광) 효과 */
.header-actions-dock :deep(.base-button.is-ghost:hover) {
  background-color: var(--bg-card);
  border-color: var(--color-primary);
  color: var(--color-primary);

  /* 변수로 정의된 Primary Light 색상을 퍼뜨려 은은한 후광 연출 */
  box-shadow:
    0 4px 12px var(--color-primary-light),
    0 0 0 1px var(--color-primary);

  transform: translateY(-2px); /* 글로벌 active-scale과 어우러지는 팝업 */
}

/* 🌟 글로벌 State Indicator를 활용한 특수 키캡들 */
/* 3번: Success (초록) */
.header-actions-dock :deep(.dock-key.special-key-success:hover) {
  border-color: var(--color-success);
  color: var(--color-success);
  box-shadow:
    0 4px 12px var(--color-success-light),
    0 0 0 1px var(--color-success);
}

/* 4번: Danger (빨강) */
.header-actions-dock :deep(.dock-key.special-key-danger:hover) {
  border-color: var(--color-danger);
  color: var(--color-danger);
  box-shadow:
    0 4px 12px var(--color-danger-light),
    0 0 0 1px var(--color-danger);
}

/* 5번: Warning (노랑/주황) */
.header-actions-dock :deep(.dock-key.special-key-warning:hover) {
  border-color: var(--color-warning);
  color: var(
    --color-warning
  ); /* 약간 대비가 안 맞으면 text-main으로 빼셔도 됩니다 */
  box-shadow:
    0 4px 12px var(--color-warning-light),
    0 0 0 1px var(--color-warning);
}

/* =======================================
   콘텐츠 스크롤 영역
======================================= */
.scroll-content {
  flex: 1;
  padding-bottom: var(--space-6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
