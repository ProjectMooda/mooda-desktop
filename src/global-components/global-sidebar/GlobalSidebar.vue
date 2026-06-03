<template>
  <aside class="studio-sidebar shrink-0 flex-col">
    <div class="brand-zone shrink-0 items-center gap-8">
      <div class="logo-dot shrink-0"></div>
      <h2 class="text-lg font-bold text-main m-0">MOODA</h2>
    </div>

    <nav class="nav-menu flex-1 flex-col gap-4">
      <button
        v-for="(item, idx) in layoutStore.menuItems"
        :key="idx"
        :class="[
          'nav-btn w-full ui-size-3 hover-bg', // ✨ 3단계 버튼 스케일 + 호버 효과 적용
          { active: layoutStore.currentTab === idx + 1 }
        ]"
        @click="layoutStore.setTab(idx + 1)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="user-zone shrink-0 items-center gap-8">
      <div class="avatar shrink-0 flex-center text-sm font-bold">W</div>
      <div class="user-text min-w-0 flex-1 flex-col">
        <span class="name text-xs font-bold text-main">이원형</span>
        <span class="role text-sub">Admin</span>
      </div>
      <button
        class="btn-settings shrink-0 ui-size-2 is-icon-only hover-bg"
        @click="layoutStore.openSettings"
      >
        ⚙️
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSidebarStore } from './useSidebarStore'

const layoutStore = useSidebarStore()
</script>

<style scoped>
/* =======================================
   1. Sidebar Layout
======================================= */
.studio-sidebar {
  flex-basis: 220px;
  width: 220px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);

  /* 전역 스페이싱 토큰 활용 (24px 20px) */
  padding: var(--space-6) var(--space-5);
  z-index: var(--z-elevated);
  overflow-y: auto;
}

/* =======================================
   2. Brand Zone
======================================= */
.brand-zone {
  display: flex; /* flex 유틸리티 보조 */
  margin-bottom: var(--space-8); /* 32px */
  padding-left: var(--space-1);
}

.logo-dot {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: var(--radius-xl);
}

.brand-zone h2 {
  margin: 0;
}

/* =======================================
   3. Navigation Menu
======================================= */
.nav-btn {
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.nav-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-bold);
}

/* =======================================
   4. User Profile Zone
======================================= */
.user-zone {
  display: flex; /* flex 유틸리티 보조 */
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.avatar {
  /* 글로벌 ui-size 규격에 맞추어 32px 사용 (ui-size-3과 유사) */
  width: 32px;
  height: 32px;
  background: var(--text-main);
  color: var(--bg-card);
  border-radius: var(--radius-sm);
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  /* text-xs(12px)보다 약간 작은 11px 사이즈 대응 */
  font-size: calc(var(--text-xs) - 1px);
}

.btn-settings {
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
