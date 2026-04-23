<template>
  <div class="modal-overlay" @click.self="sidebarStore.showSettings = false">
    <div class="modal-content">
      <h3 class="modal-title">시스템 설정</h3>
      <div class="setting-row">
        <label class="setting-label">데스크톱 앱 화면 사이즈</label>
        <div class="select-wrapper">
          <select
            v-model="settingsStore.appSize"
            @change="onSizeChange"
            class="s-select"
          >
            <option value="max">Max (전체 화면)</option>
            <option value="middle">Middle (1440 x 900)</option>
            <option value="min">Min (1024 x 768)</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button
          @click="sidebarStore.showSettings = false"
          class="btn-primary flex-1"
        >
          적용 및 닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, type AppSize } from './useSettingsStore'
import { useSidebarStore } from '../sidebar/useSidebarStore'

// Pinia 스토어 호출
const settingsStore = useSettingsStore()
const sidebarStore = useSidebarStore()

// select 변경 시 스토어의 액션 실행
const onSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  settingsStore.updateAppSize(target.value as AppSize)
}
</script>

<style scoped>
/* 기존에 분리했던 모달용 CSS 그대로 유지 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--bg-card);
  width: 400px;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
.modal-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--text-main);
}
.setting-row {
  margin-bottom: 30px;
}
.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
  margin-bottom: 10px;
}
.s-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #f8f8fa;
  cursor: pointer;
}
.modal-actions {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
</style>
