<template>
  <Modal
    title="환경설정"
    width="500px"
    :size="3"
    @close="sidebarStore.showSettings = false"
  >
    <div class="settings-layout flex-col">
      <div class="profile-card">
        <div v-if="settingsStore.isLoggedIn" class="profile-content">
          <div class="avatar-wrapper shadow-1">
            <div class="avatar-text">
              {{ settingsStore.userName.charAt(0) }}
            </div>
          </div>
          <div class="profile-info flex-col min-w-0">
            <h2 class="profile-name truncate">{{ settingsStore.userName }}</h2>
            <p class="profile-email truncate text-sub">jarvis@example.com</p>
          </div>
          <div class="profile-action">
            <span
              class="pro-badge"
              :class="
                settingsStore.subscription === 'pro' ? 'is-pro' : 'is-free'
              "
            >
              {{ settingsStore.subscription === 'pro' ? 'PRO' : 'FREE' }}
            </span>
          </div>
        </div>

        <div v-else class="profile-content is-empty">
          <div class="profile-info flex-col">
            <h2 class="profile-name">로그인이 필요합니다</h2>
            <p class="profile-email text-sub">
              데이터 동기화를 위해 로그인해주세요.
            </p>
          </div>
          <button class="btn-login active-scale">로그인</button>
        </div>
      </div>

      <div class="settings-divider"></div>

      <div class="setting-section">
        <div class="section-header">
          <h3 class="section-title">화면 테마</h3>
          <p class="section-desc">앱의 전반적인 색상 테마를 선택하세요.</p>
        </div>

        <div class="theme-grid">
          <div
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'light' }"
            @click="settingsStore.updateTheme('light')"
          >
            <div class="theme-icon light-icon">☀️</div>
            <span class="theme-label">라이트</span>
          </div>

          <div
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'dark' }"
            @click="settingsStore.updateTheme('dark')"
          >
            <div class="theme-icon dark-icon">🌙</div>
            <span class="theme-label">다크</span>
          </div>

          <div
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'tree' }"
            @click="settingsStore.updateTheme('tree')"
          >
            <div class="theme-icon tree-icon">🌲</div>
            <span class="theme-label">자연</span>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-header">
          <h3 class="section-title">앱 해상도</h3>
        </div>

        <div class="segmented-control">
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'min' }"
            @click="settingsStore.updateAppSize('min')"
          >
            작게 (1024)
          </button>
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'middle' }"
            @click="settingsStore.updateAppSize('middle')"
          >
            기본 (1440)
          </button>
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'max' }"
            @click="settingsStore.updateAppSize('max')"
          >
            전체 화면
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions justify-between w-full">
        <button
          v-if="settingsStore.isLoggedIn"
          class="btn-text text-sm text-sub"
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
import { useSettingsStore } from './useSettingsStore'
import { useSidebarStore } from '../global-sidebar/useSidebarStore'

const settingsStore = useSettingsStore()
const sidebarStore = useSidebarStore()
</script>

<style scoped>
/* =======================================
   공통 레이아웃
======================================= */
.settings-layout {
  gap: var(--space-6);
  padding: var(--space-2) 0;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0;
}

.section-desc {
  font-size: var(--text-xs);
  color: var(--text-sub);
  margin: 0;
}

.settings-divider {
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.5;
  margin: 0 var(--space-2);
}

/* =======================================
   1. 프로필 카드 (iOS Apple ID 스타일)
======================================= */
.profile-card {
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid transparent;
  transition: background var(--transition-fast);
}

.profile-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #ffffff;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.profile-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0 0 2px 0;
}

.profile-email {
  font-size: var(--text-sm);
  margin: 0;
}

.profile-action {
  margin-left: auto;
}

.pro-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: var(--font-bold);
  letter-spacing: 0.5px;
}

.pro-badge.is-pro {
  background-color: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px
    color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.pro-badge.is-free {
  background-color: var(--bg-card);
  color: var(--text-sub);
  border: 1px solid var(--border-color);
}

.btn-login {
  margin-left: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  cursor: pointer;
}

/* =======================================
   2. 테마 선택 비주얼 카드
======================================= */
.theme-grid {
  display: flex;
  gap: var(--space-3);
  width: 100%;
}

.theme-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-card:hover {
  background: var(--bg-hover);
}

.theme-card.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.theme-icon {
  font-size: 24px;
}

.theme-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.theme-card.is-active .theme-label {
  color: var(--color-primary);
}

/* =======================================
   3. 세그먼트 컨트롤 (해상도 설정)
======================================= */
.segmented-control {
  display: flex;
  background: var(--bg-hover);
  padding: 4px;
  border-radius: var(--radius-md);
  width: 100%;
  border: 1px solid var(--border-color);
}

.segment-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-sub);
  border-radius: calc(var(--radius-md) - 4px);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.segment-btn:hover {
  color: var(--text-main);
}

.segment-btn.is-active {
  background: var(--bg-card);
  color: var(--text-main);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-1);
}

/* =======================================
   4. 하단 버튼 영역
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
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-text {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  margin-left: calc(var(--space-2) * -1); /* 정렬용 음수 마진 */
  border-radius: var(--radius-sm);
}

.btn-text:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>
