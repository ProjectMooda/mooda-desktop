<template>
  <Modal
    title="환경설정"
    width="500px"
    :size="3"
    @close="sidebarStore.showSettings = false"
  >
    <div class="settings-layout flex-col">
      <!-- 프로필 카드 -->
      <div class="profile-card">
        <!-- ✅ 로그인 상태 -->
        <div v-if="authStore.isAuthenticated" class="profile-content">
          <div class="avatar-wrapper shadow-1">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="profile-info">
            <h2 class="profile-name truncate">{{ userNickname }}</h2>
            <p class="profile-email truncate">{{ userEmailDisplay }}</p>
          </div>
          <span
            class="pro-badge"
            :class="settingsStore.subscription === 'pro' ? 'is-pro' : 'is-free'"
          >
            {{ settingsStore.subscription === 'pro' ? 'PRO' : 'FREE' }}
          </span>
        </div>

        <!-- 비로그인 상태 -->
        <div v-else class="profile-empty">
          <div class="empty-avatar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="empty-info">
            <h2 class="profile-name">로그인이 필요합니다</h2>
            <p class="profile-email">데이터 동기화를 위해 로그인해주세요.</p>
          </div>
          <div class="login-actions">
            <button
              class="brand-btn btn-kakao active-scale"
              @click="handleLogin('kakao')"
            >
              카카오로 시작
            </button>
            <button
              class="brand-btn btn-google active-scale"
              @click="handleLogin('google')"
            >
              구글로 시작
            </button>
          </div>
        </div>
      </div>

      <div class="settings-divider"></div>

      <!-- 화면 테마 -->
      <div class="setting-section">
        <div class="section-header">
          <h3 class="section-title">화면 테마</h3>
          <p class="section-desc">앱의 전반적인 색상 테마를 선택하세요.</p>
        </div>
        <div class="theme-grid">
          <button
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'light' }"
            @click="settingsStore.updateTheme('light')"
          >
            <div class="theme-preview light-preview">
              <div class="preview-bar"></div>
              <div class="preview-bar short"></div>
              <div class="preview-bar"></div>
            </div>
            <div class="theme-meta">
              <span class="theme-icon">☀️</span>
              <span class="theme-label">라이트</span>
            </div>
          </button>
          <button
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'dark' }"
            @click="settingsStore.updateTheme('dark')"
          >
            <div class="theme-preview dark-preview">
              <div class="preview-bar"></div>
              <div class="preview-bar short"></div>
              <div class="preview-bar"></div>
            </div>
            <div class="theme-meta">
              <span class="theme-icon">🌙</span>
              <span class="theme-label">다크</span>
            </div>
          </button>
          <button
            class="theme-card active-scale"
            :class="{ 'is-active': settingsStore.theme === 'tree' }"
            @click="settingsStore.updateTheme('tree')"
          >
            <div class="theme-preview tree-preview">
              <div class="preview-bar"></div>
              <div class="preview-bar short"></div>
              <div class="preview-bar"></div>
            </div>
            <div class="theme-meta">
              <span class="theme-icon">🌲</span>
              <span class="theme-label">자연</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 앱 해상도 -->
      <div class="setting-section">
        <div class="section-header">
          <h3 class="section-title">앱 해상도</h3>
          <p class="section-desc">화면 크기에 맞게 레이아웃을 조정하세요.</p>
        </div>
        <div class="segmented-control">
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'min' }"
            @click="settingsStore.updateAppSize('min')"
          >
            <span class="seg-label">작게</span>
            <span class="seg-sub">1024px</span>
          </button>
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'middle' }"
            @click="settingsStore.updateAppSize('middle')"
          >
            <span class="seg-label">기본</span>
            <span class="seg-sub">1440px</span>
          </button>
          <button
            class="segment-btn"
            :class="{ 'is-active': settingsStore.appSize === 'max' }"
            @click="settingsStore.updateAppSize('max')"
          >
            <span class="seg-label">전체</span>
            <span class="seg-sub">화면</span>
          </button>
        </div>
      </div>
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
import { computed } from 'vue'
import Modal from '@/global-components/global-modal/components/Modal.vue'
import { useSettingsStore } from './useSettingsStore'
import { useSidebarStore } from '../global-sidebar/useSidebarStore'
import { useAuthStore } from '@/auth/authStore'
import api from '@/axios/axios'

const settingsStore = useSettingsStore()
const sidebarStore = useSidebarStore()
const authStore = useAuthStore()

// ✅ computed로 수정: 반응형 보장 + 버그 수정
const userInitials = computed(() => {
  const src = authStore.user?.id || authStore.user?.email || '?'
  return src.slice(0, 2).toUpperCase()
})

const userNickname = computed(() => {
  // 기존: authStore.user?.id (ID를 표시명으로 쓰던 버그 수정)
  return (
    authStore.user?.email || authStore.user?.email?.split('@')[0] || '사용자'
  )
})

const userEmailDisplay = computed(() => {
  // 기존: authStore.user?.email (전체 이메일 표시 - 유지 또는 prefix만 표시로 변경 가능)
  return authStore.user?.email || ''
})

// 로그인
const handleLogin = async (provider: 'kakao' | 'google') => {
  await window.electronAPI.openExternal(
    `http://localhost:3000/auth/${provider}`
  )
}

// 로그아웃
const handleLogout = async () => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.error('❌ 서버 로그아웃 실패:', error)
  } finally {
    authStore.clearAuth()
  }
}
</script>

<style scoped>
/* =======================================
   공통 레이아웃
======================================= */
.settings-layout {
  gap: var(--space-5);
  padding: var(--space-1) 0;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 3px;
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
  background: var(--border-color);
  margin: var(--space-1) 0;
}

/* =======================================
   1. 프로필 카드
======================================= */
.profile-card {
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-color);
}

/* 로그인 상태 */
.profile-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar-wrapper {
  width: 44px;
  height: 44px;
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

/* ✅ 기존: .avatar-text에 "프로필 이미지" 텍스트 → 이니셜로 교체 */
.avatar-initials {
  color: #ffffff;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.5px;
  line-height: 1;
}

.profile-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-name {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-email {
  font-size: var(--text-xs);
  color: var(--text-sub);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pro-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: var(--font-bold);
  letter-spacing: 0.8px;
}
.pro-badge.is-pro {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 2px 8px
    color-mix(in srgb, var(--color-primary) 30%, transparent);
}
.pro-badge.is-free {
  background: var(--bg-card);
  color: var(--text-sub);
  border: 1px solid var(--border-color);
}

/* 비로그인 상태 */
.profile-empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.empty-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1.5px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
}

.empty-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.login-actions {
  display: flex;
  gap: var(--space-2);
}

.brand-btn {
  flex: 1;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 9px 0;
  text-align: center;
  border: none;
  transition: filter var(--transition-fast);
}
.brand-btn:hover {
  filter: brightness(0.95);
}

.btn-kakao {
  background: #fee500;
  color: #1a1a1a;
}
.btn-google {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid var(--border-color) !important;
}

/* =======================================
   2. 테마 선택 카드
======================================= */
.theme-grid {
  display: flex;
  gap: var(--space-2);
}

.theme-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}
.theme-card:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}
.theme-card.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

/* 테마 컬러 미리보기 */
.theme-preview {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-sm);
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
}

.light-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.dark-preview {
  background: #1e2433;
  border: 1px solid #2d3748;
}
.tree-preview {
  background: #edf4ea;
  border: 1px solid #c8dfc0;
}

.preview-bar {
  height: 4px;
  border-radius: 2px;
  width: 100%;
}
.preview-bar.short {
  width: 60%;
}

.light-preview .preview-bar {
  background: #cbd5e1;
}
.dark-preview .preview-bar {
  background: #3d4f6b;
}
.tree-preview .preview-bar {
  background: #9ec490;
}

.theme-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.theme-icon {
  font-size: 14px;
  line-height: 1;
}

.theme-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}
.theme-card.is-active .theme-label {
  color: var(--color-primary);
}

/* =======================================
   3. 해상도 세그먼트
======================================= */
.segmented-control {
  display: flex;
  gap: 2px;
  background: var(--bg-hover);
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.segment-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: var(--space-2) 0;
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-md) - 3px);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.segment-btn:hover:not(.is-active) {
  background: color-mix(in srgb, var(--bg-card) 50%, transparent);
}
.segment-btn.is-active {
  background: var(--bg-card);
  box-shadow: var(--shadow-1);
}

.seg-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-sub);
  line-height: 1.2;
}
.segment-btn.is-active .seg-label {
  color: var(--text-main);
  font-weight: var(--font-bold);
}

.seg-sub {
  font-size: 10px;
  color: var(--text-sub);
  opacity: 0.65;
  line-height: 1;
}
.segment-btn.is-active .seg-sub {
  opacity: 1;
  color: var(--color-primary);
}

/* =======================================
   4. 푸터 액션
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
