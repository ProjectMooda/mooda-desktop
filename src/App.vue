<template>
  <div
    class="jarvis-wrapper"
    :class="{ 'is-mini-window': scheduleStore.isMiniMode }"
  >
    <GlobalSidebar v-if="!scheduleStore.isMiniMode" />

    <main class="main-workspace min-w-0">
      <!-- 1. 미니 모드일 땐 헤더 완전히 숨김 -->
      <header
        v-if="!scheduleStore.isMiniMode"
        class="studio-header flex shrink-0 items-center justify-between mb-16"
      >
        <div class="flex flex-col gap-4">
          <span class="text-sm font-semibold text-muted">{{ todayDate }}</span>
          <h1 class="page-title text-2xl font-bold text-main">
            {{ currentMenuLabel }}<span class="text-primary">.</span>
          </h1>
        </div>

        <GlobalHeaderDock />
      </header>

      <div class="scroll-content min-h-0 flex-col flex-1 h-full w-full">
        <div
          v-if="scheduleStore.isMiniMode"
          class="w-full h-full flex flex-col"
        >
          <StudioCard class="flex-1" />
        </div>

        <transition v-else name="fade" mode="out-in">
          <keep-alive>
            <component :is="currentComponent" />
          </keep-alive>
        </transition>
      </div>
    </main>

    <!-- 복귀 버튼 -->
    <button
      v-if="scheduleStore.isMiniMode"
      class="floating-restore-btn"
      @click="scheduleStore.toggleMiniMode"
      title="원래 화면으로 복귀"
    >
      복귀
    </button>

    <GlobalSettingsModal v-if="sidebarStore.showSettings" />

    <globalLoginModal v-model="authStore.isLoginModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

// 기존 임포트 유지
import GlobalSidebar from './global-components/global-sidebar/GlobalSidebar.vue'
import GlobalSettingsModal from './global-components/global-settings/GlobalSettingsModal.vue'
import GlobalHeaderDock from './global-components/global-hedaer/GlobalHeaderDock.vue'
import CalendarPage from '@/pages/calendar/CalendarPage.vue'
import GoalPlanner from '@/pages/goal-planner/GoalPlannerPage.vue'

// 🌟 [추가] 메인 레이아웃에서 StudioCard를 직접 띄우기 위해 임포트 (경로는 본인 프로젝트에 맞게 수정하세요)
import StudioCard from '@/pages/calendar/right-dash/studio-card/StudioCard.vue'

import { useSidebarStore } from './global-components/global-sidebar/useSidebarStore.ts'
import { useSettingsStore } from './global-components/global-settings/useSettingsStore.ts'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useAuthStore } from './auth/authStore.ts'
import globalLoginModal from './global-components/global-login/global-loginModal.vue'
import api from './axios/axios.ts'
const authStore = useAuthStore()
let cleanups: Array<() => void> = []
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
onMounted(async () => {
  cleanups.push(
    window.electronAPI.onAuthCallback(async (data) => {
      if (data.accessToken && data.userId && data.email) {
        authStore.setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? '',
          userId: data.userId,
          email: data.email
        })
      }
    }),
    window.electronAPI.onAuthError(({ message }) => {
      console.error('❌ auth:error:', message)
    })
  )

  await window.electronAPI.notifyReady()

  // ✅ 이미 유효한 accessToken 있으면 그냥 진행
  if (authStore.isAuthenticated && authStore.accessToken) {
    console.log('✅ 기존 accessToken 유효 → 로그인 유지')
    return
  }

  // ✅ safeStorage에서 refreshToken으로 재발급 시도
  const savedRefreshToken = await window.electronAPI.getRefreshToken()
  console.log(
    '💾 앱 시작 시 refreshToken:',
    savedRefreshToken ? '존재' : 'null'
  )

  if (savedRefreshToken) {
    try {
      const res = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'electron'
        },
        body: JSON.stringify({ refreshToken: savedRefreshToken })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('✅ 앱 시작 refresh 성공:', data)

        authStore.accessToken = data.accessToken
        authStore.isAuthenticated = true

        // ✅ 새 refreshToken safeStorage에 저장 (빠진 부분)
        if (data.refreshToken) {
          await window.electronAPI.saveRefreshToken(data.refreshToken)
          console.log('💾 새 refreshToken 저장 완료')
        }
        return
      } else {
        console.warn('⚠️ refresh 실패 상태코드:', res.status)
      }
    } catch (e) {
      console.error('❌ 앱 시작 refresh 에러:', e)
    }
  }

  authStore.openLoginModal()
  settingsStore.loadSettings()
  scheduleStore.loadData()
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
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
  padding: 0 var(--space-10);
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

/* =======================================
    🌟 미니 모드 시 컴포넌트 여백 압축 스타일 이식
======================================= */
.is-mini-window .main-workspace {
  padding: 0 !important; /* 바깥쪽 껍질 여백 완전 제거 */
}

.is-mini-window .scroll-content {
  padding-bottom: 0 !important; /* 하단 회색 빈 공간 제거 */
}

/* 🌟 [핵심] StudioCard 내부의 데스크탑용 두꺼운 테두리와 패딩을 스마트폰 앱처럼 깎아냄 */
.is-mini-window :deep(.studio-card) {
  border: none !important; /* 굵은 외곽선 제거 */
  border-radius: 0 !important; /* 둥근 모서리를 직각으로 펴서 창에 밀착 */
  box-shadow: none !important; /* 불필요한 그림자 제거 */
  padding: 16px !important; /* 내부 글자 여백을 모바일 화면(16px) 수준으로 축소 */
}

/* 🌟 복귀를 위한 우측 하단 고정 플로팅 버튼 */
.floating-restore-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--color-warning, #f59e0b);
  color: #000;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  transition: transform 0.2s;
}
.floating-restore-btn:hover {
  transform: scale(1.1);
}
</style>
