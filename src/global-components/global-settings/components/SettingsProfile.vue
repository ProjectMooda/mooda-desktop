<template>
  <div class="profile-card">
    <div class="profile-content">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/auth/authStore'
import { useSettingsStore } from '../useSettingsStore'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const userInitials = computed(() => {
  const src = authStore.user?.id || authStore.user?.email || '?'
  return src.slice(0, 2).toUpperCase()
})

const userNickname = computed(() => {
  return (
    authStore.user?.email || authStore.user?.email?.split('@')[0] || '사용자'
  )
})

const userEmailDisplay = computed(() => {
  return authStore.user?.email || ''
})
</script>

<style scoped>
/* =======================================
   프로필 카드 (로그인 상태 전용)
======================================= */
.profile-card {
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-color);
}

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

/* =======================================
   구독 뱃지
======================================= */
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
</style>
