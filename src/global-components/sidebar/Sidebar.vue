<template>
  <aside class="studio-sidebar shrink-0">
    <div class="brand-zone shrink-0">
      <div class="logo-dot"></div>
      <h2>MOODA</h2>
    </div>

    <nav class="nav-menu">
      <button
        v-for="(item, idx) in layoutStore.menuItems"
        :key="idx"
        :class="['nav-btn', { active: layoutStore.currentTab === idx + 1 }]"
        @click="layoutStore.setTab(idx + 1)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="user-zone shrink-0">
      <div class="avatar">W</div>
      <div class="user-text min-w-0">
        <span class="name">이원형</span>
        <span class="role">Admin</span>
      </div>
      <button class="btn-settings shrink-0" @click="layoutStore.openSettings">
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
/* 사이드바 전용 스타일 */
.studio-sidebar {
  flex: 0 0 220px;
  width: 220px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: var(--space-7, 28px) var(--space-5, 20px); /* 4px 그리드 시스템 최적화 */
  /* z-index: var(--z-fixed); 시스템 레이어 관리를 위해 필요한 경우 전역 토큰 대응 가능 */
  z-index: 10;
  overflow-y: auto;
}
.brand-zone {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-9, 36px);
  padding-left: var(--space-1, 4px);
}
.logo-dot {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: var(--radius-pill, 50%);
}
.brand-zone h2 {
  font-size: var(--text-lg); /* 18px 스케일 대응 */
  font-weight: var(--font-bold); /* 800 혹은 볼드 토큰 */
  margin: 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px); /* 단정한 네비게이션 간격 조절 */
}
.nav-btn {
  text-align: left;
  padding: var(--space-2, 8px) var(--space-4, 16px);
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: var(--text-sm); /* 14px 스케일 대응 */
  font-weight: var(--font-semibold); /* 600 혹은 세미볼드 토큰 */
  border-radius: var(--radius-sm); /* 8px */
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}
.nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
.nav-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.user-zone {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-4, 16px) 0 0 0;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}
.avatar {
  width: 32px;
  height: 32px;
  background: var(--text-main);
  border-radius: var(--radius-sm); /* 8px 통합 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  color: var(--bg-card, #fff); /* 전역 시스템 카드 흰색 배경 변수 활용 */
  font-size: var(--text-sm);
  flex-shrink: 0;
}
.user-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.name {
  font-size: var(--text-xs); /* 13px 대응 */
  font-weight: var(--font-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role {
  font-size: var(--text-xxs, 11px);
  color: var(--text-muted);
}
.btn-settings {
  background: var(--bg-hover);
  border: none;
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-1, 4px);
  border-radius: var(--radius-xs, 4px); /* 조금 더 작은 버튼용 둥글기 */
  transition: background var(--transition-fast);
  flex-shrink: 0;
}
.btn-settings:hover {
  background: var(--border-color);
}
</style>
