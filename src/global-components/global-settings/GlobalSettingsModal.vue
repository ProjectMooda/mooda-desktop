<template>
  <Modal
    title="환경설정"
    width="500px"
    :size="3"
    @close="sidebarStore.showSettings = false"
  >
    <div class="settings-layout flex-col">
      <SettingsProfile />

      <div class="settings-divider"></div>

      <SettingsTheme />

      <SettingsResolution />
    </div>

    <template #footer>
      <div class="modal-actions justify-between w-full">
        <button
          v-if="authStore.isAuthenticated"
          class="btn-text text-sm active-scale"
          @click="handleLogout"
        >
          로그아웃
        </button>
        <div v-else></div>
        <button
          class="btn-primary ui-size-3 active-scale"
          @click="sidebarStore.showSettings = false"
        >
          완료
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/global-components/global-modal/components/Modal.vue'
import SettingsProfile from './components/SettingsProfile.vue'
import SettingsTheme from './components/SettingsTheme.vue'
import SettingsResolution from './components/SettingsResolution.vue'
import { useSidebarStore } from '../global-sidebar/useSidebarStore'
import { useAuthStore } from '@/auth/authStore'
import api from '@/axios/axios'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()

// 모달 푸터에 위치하는 전역적인 로그아웃 기능만 유지
const handleLogout = async () => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.error('❌ 서버 로그아웃 실패:', error)
  } finally {
    sidebarStore.showSettings = false
    authStore.clearAuth()
  }
}
</script>

<style scoped>
/* 메인 래퍼 및 푸터 스타일에 필요한 CSS만 남김 */
.settings-layout {
  display: flex;
  gap: var(--space-5);
  padding: var(--space-1) 0;
}

.settings-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-1) 0;
}

/* =======================================
   푸터 액션
======================================= */
.modal-actions {
  display: flex;
  align-items: center;
  padding-top: var(--space-2);
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-5);
  cursor: pointer;
  font-weight: var(--font-bold);
  transition: filter var(--transition-fast);
}
.btn-primary:hover {
  filter: brightness(1.08);
}

.btn-text {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  margin-left: calc(var(--space-2) * -1);
  border-radius: var(--radius-sm);
  color: var(--text-sub);
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}
.btn-text:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>
