<template>
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
</style>
