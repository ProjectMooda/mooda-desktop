<!-- src/App.vue 템플릿 수정 -->
<template>
  <div class="jarvis-wrapper">
    <Sidebar />

    <main class="main-workspace min-w-0">
      <header class="studio-header shrink-0">
        <!-- 안전장치를 추가하여 menuItems가 로드되기 전 에러 방지 -->
        <h1 class="page-title">
          {{ menuItems[currentTab - 1]?.label || 'Loading...' }}
        </h1>

        <BaseInput
          v-model="scheduleStore.dailyFocus"
          field="dailyFocus"
          placeholder="오늘의 핵심 목표..."
          class="focus-input"
          @change="scheduleStore.saveData"
        >
          <template #prefix>
            <span class="focus-badge">FOCUS</span>
          </template>
        </BaseInput>
      </header>

      <div class="scroll-content">
        <transition name="fade" mode="out-in">
          <!-- 🌟 숫자가 아니라 탭의 '이름(label)'으로 컴포넌트를 스위칭합니다 -->
          <CalendarPage
            v-if="menuItems[currentTab - 1]?.label === 'Calendar'"
          />
          <GoalPlanner
            v-else-if="menuItems[currentTab - 1]?.label === 'GoalPlanner'"
          />
        </transition>
      </div>
    </main>

    <SettingsModal v-if="sidebarStore.showSettings" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import BaseInput from './global-ui/BaseInput.vue'

// 컴포넌트 임포트
import Sidebar from './global-components/sidebar/Sidebar.vue'
import SettingsModal from './global-components/settings/SettingsModal.vue'
import CalendarPage from '@/pages/calendar1/CalendarPage.vue' // 신규 페이지
import GoalPlanner from '@/pages/goalplanner2/GoalPlanner.vue'

// 스토어 임포트
import { useSidebarStore } from './global-components/sidebar/useSidebarStore.ts'
import { useSettingsStore } from './global-components/settings/useSettingsStore'
import { useScheduleStore } from '@/stores/useScheduleStore'

const sidebarStore = useSidebarStore()
const settingsStore = useSettingsStore()
const scheduleStore = useScheduleStore()

const { currentTab, menuItems } = storeToRefs(sidebarStore)

onMounted(() => {
  settingsStore.loadSettings()
  scheduleStore.loadData()
})
</script>

<style scoped>
/* 앱 전체 레이아웃 스타일만 남김 */
.jarvis-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 40px;
  min-width: 0;
  height: 100%;
}

.studio-header {
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.focus-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 1px;
}

.focus-input {
  width: 360px; /* 입력창 전체 너비 지정 */
  margin-bottom: 0 !important;
}
.scroll-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  min-height: 0;
}

/* 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
