<template>
  <!-- BaseModal이 오버레이, 컨테이너, 타이틀, 닫기 기능(ESC 포함)을 모두 처리합니다. -->
  <BaseModal 
    title="시스템 설정" 
    width="400px" 
    @close="sidebarStore.showSettings = false"
  >
    <!-- BODY 영역 (기본 슬롯) -->
    <div class="setting-row">
      <label class="setting-label">데스크톱 앱 화면 사이즈</label>
      
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

    <!-- FOOTER 영역 (이름 있는 슬롯) -->
    <template #footer>
      <div class="modal-actions">
        <button
          @click="sidebarStore.showSettings = false"
          class="btn-primary flex-1"
        >
          적용 및 닫기
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/global-components/modal/BaseModal.vue' // BaseModal 경로에 맞게 수정해주세요
import { useSettingsStore, type AppSize } from './useSettingsStore'
import { useSidebarStore } from '../sidebar/useSidebarStore'

const settingsStore = useSettingsStore()
const sidebarStore = useSidebarStore()

const onSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  settingsStore.updateAppSize(target.value as AppSize)
}
</script>

<style scoped>
.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub, #71717a);
  margin-bottom: 10px;
}

.s-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color, #e4e4e7);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #f8f8fa;
  cursor: pointer;
  color: var(--text-main, #27272a);
}

.modal-actions {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.btn-primary {
  background: var(--color-primary, #27272a);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>