<template>
  <LoginPage v-if="!authStore.isAuthenticated" />
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
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

// 페이지 임포트
import LoginPage from './pages/login/LoginPage.vue'

// 컴포넌트 임포트 유지
import GlobalSidebar from './global-components/global-sidebar/GlobalSidebar.vue'
import GlobalSettingsModal from './global-components/global-settings/GlobalSettingsModal.vue'
import GlobalHeaderDock from './global-components/global-hedaer/GlobalHeaderDock.vue'
import CalendarPage from '@/pages/calendar/CalendarPage.vue'
import GoalPlanner from '@/pages/goal-planner/GoalPlannerPage.vue'
import StudioCard from '@/pages/calendar/right-dash/studio-card/StudioCard.vue'

// 스토어 & API 임포트
import { useSidebarStore } from './global-components/global-sidebar/useSidebarStore.ts'
import { useSettingsStore } from './global-components/global-settings/useSettingsStore.ts'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useAuthStore } from './auth/authStore.ts'
import api from './axios/axios.ts'

const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const settingsStore = useSettingsStore()
const scheduleStore = useScheduleStore()

let cleanups: Array<() => void> = []
let syncInterval: ReturnType<typeof setInterval> | null = null

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

// 🌟 [핵심 로직] 계정 전환 감지 및 스케줄 초기화 래퍼 함수
const initUserAndData = async (currentUserId: string) => {
  if (!currentUserId) return

  const savedUserId = await window.electronAPI.dbGet('current_user_id')

  if (savedUserId && savedUserId !== currentUserId) {
    console.log('🔄 계정 변경 감지됨. 기존 유저의 로컬 데이터를 날립니다.')

    // 1. SQLite 삭제
    await window.electronAPI.dbClear()

    // 2. Pinia 메모리 삭제
    scheduleStore.resetStore()

    console.log(await window.electronAPI.dbGet('schedule_v2'))
    console.log('🧹 Pinia 스토어 초기화 완료')
  }

  // 3. 새 유저 저장
  await window.electronAPI.dbSet('current_user_id', currentUserId)

  // 4. 새 유저 데이터 로드
  await scheduleStore.initializeApp()
}
onMounted(async () => {
  // 1. Electron IPC 리스너 등록
  cleanups.push(
    window.electronAPI.onAuthCallback(async (data) => {
      if (data.accessToken && data.userId && data.email) {
        await authStore.setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? '',
          userId: data.userId,
          email: data.email
        })
        // ✅ 딥링크 로그인 성공 직후 초기화 호출
        await initUserAndData(data.userId)
      }
    }),
    window.electronAPI.onAuthError(({ message }) => {
      console.error('❌ auth:error:', message)
    })
  )

  await window.electronAPI.notifyReady()
  settingsStore.loadSettings()

  // 온라인 복귀 시 자동 동기화
  window.addEventListener('online', scheduleStore.syncWithServer)

  // 백그라운드 동기화 큐 전송 타이머 (push 전용)
  syncInterval = setInterval(() => {
    if (scheduleStore.syncQueue.length > 0) {
      console.log(
        `⏱️ [Sync Timer] 큐 전송 시도: ${scheduleStore.syncQueue.length}개`
      )
      scheduleStore.syncWithServer()
    }
  }, 30000)

  // =====================================================================
  // 2. 인증(Auth) 로직 시작
  // =====================================================================

  // ✅ A. 이미 유효한 accessToken이 스토어에 있으면 로그인 유지
  if (authStore.isAuthenticated && authStore.accessToken) {
    console.log('✅ 기존 accessToken 유효 → 로그인 유지')
    if (!authStore.user) {
      await authStore.fetchProfile()
    }
    // AuthStore에 저장된 userId로 초기화 진행
    await initUserAndData(authStore.user?.id || '')
    return
  }

  // ✅ B. 스토어엔 없지만 safeStorage에 저장된 refreshToken이 있는 경우 (앱 재시작 등)
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
        console.log('✅ 앱 시작 refresh 성공')

        await authStore.setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || savedRefreshToken,
          userId: data.userId || '',
          email: data.email || ''
        })

        // 백엔드 응답(data)에 userId가 포함되어 있어야 완벽하게 동작합니다.
        await initUserAndData(data.userId)
        return
      } else {
        console.warn('⚠️ refresh 실패 상태코드:', res.status)
      }
    } catch (e) {
      console.error('❌ 앱 시작 refresh 에러 (네트워크 끊김 등):', e)
      // 🌟 [오프라인 대응] 통신이 끊겨서 갱신을 못 했지만 토큰이 있다면,
      // 당장 유저가 캘린더를 볼 수 있도록 로컬 SQLite 캐시를 강제로 읽어옵니다.
      console.log('📡 오프라인 모드로 로컬 캐시 데이터를 띄웁니다.')
      await scheduleStore.loadData()
    }
  }
  // ✅ 브라우저 숨김시 동기화
  window.addEventListener('blur', () => {
    scheduleStore.syncWithServer()
  })

  // ✅ [핵심] Electron Main Process에서 종료 신호가 올 때 마지막 동기화 수행
  if (window.electronAPI?.onTriggerFinalSync) {
    cleanups.push(
      window.electronAPI.onTriggerFinalSync(async () => {
        console.log('🛑 [IPC] 앱 종료 신호 수신. 남은 큐를 동기화합니다.')
        if (scheduleStore.syncQueue.length > 0) {
          await scheduleStore.syncWithServer()
        }
        // 동기화가 끝나면 Main으로 종료 허가 신호 전달
        window.electronAPI.finalSyncDone()
      })
    )
  }
})

onUnmounted(() => {
  window.removeEventListener('online', scheduleStore.syncWithServer)
  if (syncInterval) clearInterval(syncInterval)
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
