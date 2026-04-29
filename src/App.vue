<template>
  <div class="jarvis-wrapper">
    <Sidebar />

    <main class="main-workspace min-w-0">
      <header class="studio-header shrink-0">
        <h1 class="page-title">{{ menuItems[currentTab - 1].label }}</h1>
        <div class="focus-container">
          <span class="focus-badge">FOCUS</span>
          <input
            type="text"
            v-model="scheduleStore.dailyFocus"
            @change="scheduleStore.saveData"
            placeholder="오늘의 핵심 목표..."
          />
        </div>
      </header>

      <div class="scroll-content">
        <transition name="fade" mode="out-in">
          <CalendarPage v-if="currentTab === 1" />
          <GoalPlanner v-else-if="currentTab === 2" />
        </transition>
      </div>
    </main>

    <SettingsModal v-if="sidebarStore.showSettings" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// 컴포넌트 임포트
import Sidebar from './global-components/sidebar/Sidebar.vue'
import SettingsModal from './global-components/settings/SettingsModal.vue'
import CalendarPage from '@/pages/calendar1/CalendarPage.vue' // 신규 페이지
import GoalPlanner from '@/pages/goalplanner2/GoalPlanner.vue'

// 스토어 임포트
import { useSidebarStore } from './global-components/sidebar/useSidebarStore'
import { useSettingsStore } from './global-components/settings/useSettingsStore'
import { useScheduleStore } from '@/store/useScheduleStore'

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

.focus-container {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.focus-badge {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-primary);
  margin-right: 12px;
  letter-spacing: 1px;
}

.focus-container input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
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