<template>
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
</template>

<script setup lang="ts">
import { useSettingsStore } from '../useSettingsStore'
const settingsStore = useSettingsStore()
</script>

<style scoped>
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
</style>
