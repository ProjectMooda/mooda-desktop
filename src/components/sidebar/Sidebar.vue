<template>
  <aside class="studio-sidebar shrink-0">
    <div class="brand-zone shrink-0">
      <div class="logo-dot"></div>
      <h2>JARVIS</h2>
    </div>

    <nav class="nav-menu">
      <button 
        v-for="(item, idx) in layoutStore.menuItems" :key="idx"
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
      <button @click="layoutStore.openSettings" class="btn-settings shrink-0">⚙️</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSidebarStore } from './useSidebarStore';

const layoutStore = useSidebarStore();
</script>

<style scoped>
/* 사이드바 전용 스타일 */
.studio-sidebar {
  flex: 0 0 220px; width: 220px; background: var(--bg-card); border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; padding: 30px 20px; z-index: 10;
  overflow-y: auto; 
}
.brand-zone { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; padding-left: 5px; }
.logo-dot { width: 12px; height: 12px; background: var(--color-primary); border-radius: 50%; }
.brand-zone h2 { font-size: 18px; font-weight: 800; margin: 0; }

.nav-menu { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.nav-btn { text-align: left; padding: 10px 14px; background: transparent; border: none; color: var(--text-sub); font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.nav-btn:hover { background: var(--bg-hover); color: var(--text-main); }
.nav-btn.active { background: var(--color-primary-light); color: var(--color-primary); }

.user-zone { display: flex; align-items: center; gap: 10px; padding: 16px 0 0 0; border-top: 1px solid var(--border-color); margin-top: auto; }
.avatar { width: 32px; height: 32px; background: var(--text-main); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #FFF; font-size: 14px; flex-shrink: 0; }
.user-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.role { font-size: 11px; color: var(--text-muted); }
.btn-settings { background: var(--bg-hover); border: none; font-size: 14px; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; flex-shrink: 0; }
.btn-settings:hover { background: var(--border-color); }
</style>