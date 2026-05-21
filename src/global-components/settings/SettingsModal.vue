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
        class="s-select"
        @change="onSizeChange"
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
          class="btn-primary flex-1"
          @click="sidebarStore.showSettings = false"
        >
          적용 및 닫기
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/global-components/modal/base/BaseModal.vue' // BaseModal 경로에 맞게 수정해주세요
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
  font-size: var(--text-sm); /* 13px -> 시스템 규격인 14px로 편입 */
  font-weight: var(--font-bold);
  color: var(--text-sub);
  margin-bottom: var(--space-2); /* 10px -> 4px 베이스인 8px로 조정 */
}

.s-select {
  width: 100%;
  padding: var(--space-3); /* 12px */
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); /* 8px */
  font-size: var(--text-sm); /* 14px */
  outline: none;
  background: var(--bg-app); /* #f8f8fa 대신 통일감 있는 시스템 배경 사용 */
  cursor: pointer;
  color: var(--text-main);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

/* 🍎 Apple 스타일 디테일: Select에 Focus가 갔을 때 시각적 피드백 추가 */
.s-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.modal-actions {
  display: flex;
  gap: var(--space-3); /* flex 내부 요소 간 여백을 12px로 통일 */
}

/* 
  💡 .flex-1 은 이미 utilities.css에 존재하므로 
  이 스코프에서는 제거하는 것이 좋습니다.
*/

.btn-primary {
  background: var(--color-primary);
  color: #ffffff; /* 순백색 */
  border: none;
  /* 10px 20px -> 위아래 12px, 좌우 20px로 시스템 변수 매핑 */
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm); /* 8px */
  cursor: pointer;
  font-weight: var(--font-semibold);
  font-size: var(--text-base); /* 기본 텍스트 16px 매핑 */
  /* utilities.css에 있는 Apple 스타일의 transition 적용 */
  transition:
    opacity var(--transition-base),
    transform var(--transition-fast);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* 🍎 Apple Style 디테일: 버튼 클릭 시 살짝 눌리는 애니메이션 추가 */
.btn-primary:active {
  transform: scale(0.97);
}
</style>
