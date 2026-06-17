<template>
  <div class="header-dock-container">
    <div class="header-actions-dock shadow-2">
      <BaseButton
        :size="3"
        variant="ghost"
        class="dock-key"
        :class="{ 'is-active': activePanel === 1 }"
        title="퀵 메모 (Scratchpad)"
        @click="togglePanel(1)"
      >
        <span class="key-text">1</span>
        <span v-if="hasMemo" class="status-dot"></span>
      </BaseButton>

      <BaseButton
        :size="3"
        variant="ghost"
        class="dock-key"
        :class="{ 'is-active': activePanel === 2 }"
        title="클립보드 매니저"
        @click="togglePanel(2)"
      >
        <span class="key-text">2</span>
        <span v-if="hasClipboard" class="status-dot"></span>
      </BaseButton>

      <BaseButton
        :size="3"
        variant="ghost"
        class="dock-key special-key-success"
        :class="{ 'is-active': activePanel === 3 }"
        title="로컬 파일 링커"
        @click="togglePanel(3)"
      >
        <span class="key-text">3</span>
      </BaseButton>

      <BaseButton
        :size="3"
        variant="ghost"
        class="dock-key special-key-danger"
        :class="{ 'is-active': activePanel === 4 }"
        title="임시 파일 드롭존"
        @click="togglePanel(4)"
        @dragover.prevent
        @drop.prevent="handleDropToIcon"
      >
        <span class="key-text">4</span>
        <span v-if="hasDroppedFiles" class="status-dot danger-dot"></span>
      </BaseButton>

      <BaseButton
        :size="3"
        variant="ghost"
        class="dock-key special-key-mini"
        :class="{ 'is-active': scheduleStore.isMiniMode }"
        title="미니 모드 토글 (캘린더 숨기기)"
        @click="scheduleStore.toggleMiniMode"
      >
        <span class="key-text">5</span>
      </BaseButton>
    </div>

    <transition name="popover">
      <div v-show="activePanel !== null" class="dock-popover shadow-3">
        <DockMemo v-show="activePanel === 1" @update-dot="hasMemo = $event" />
        <DockClipboard
          v-show="activePanel === 2"
          @update-dot="hasClipboard = $event"
        />
        <DockLocalLinks v-show="activePanel === 3" />
        <DockDropzone
          v-show="activePanel === 4"
          ref="dropzoneRef"
          @update-dot="hasDroppedFiles = $event"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/base-ui/BaseButton.vue'

// 분리된 컴포넌트 임포트
import DockMemo from './components/DockMemo.vue'
import DockClipboard from './components/DockClipboard.vue'
import DockLocalLinks from './components/DockLocalLinks.vue'
import DockDropzone from './components/DockDropzone.vue'
import DockFocusMode from './components/DockFocusMode.vue'
import { useScheduleStore } from '@/stores/useScheduleStore.ts'

// 상태 및 패널 제어
const activePanel = ref<number | null>(null)
const hasMemo = ref(false)
const hasClipboard = ref(false)
const hasDroppedFiles = ref(false)
const scheduleStore = useScheduleStore()

const dropzoneRef = ref<InstanceType<typeof DockDropzone> | null>(null)

const togglePanel = (panelNumber: number) => {
  activePanel.value = activePanel.value === panelNumber ? null : panelNumber
}

// 아이콘에 바로 드래그앤드롭 했을 때 자식 컴포넌트의 메서드 호출
const handleDropToIcon = (e: DragEvent) => {
  const files = e.dataTransfer?.files || null
  if (dropzoneRef.value) {
    dropzoneRef.value.processFiles(files)
  }
  activePanel.value = 4
}

// 외부 클릭 시 닫기
const closeOnOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.header-dock-container')) {
    activePanel.value = null
  }
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', closeOnOutsideClick))
</script>

<style scoped>
/* 부모에 필요한 컨테이너, 버튼 묶음, 팝오버 트랜지션 스타일만 남깁니다 */
.header-dock-container {
  position: relative;
  display: inline-block;
}

.header-actions-dock {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}

.header-actions-dock :deep(.base-button.is-ghost) {
  position: relative;
  background-color: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-sub);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-bold);
  min-width: var(--control-h-3);
  padding: 0;
  justify-content: center;
  transition: all var(--transition-base);
}

.header-actions-dock :deep(.base-button.is-ghost:hover),
.header-actions-dock :deep(.base-button.is-ghost.is-active) {
  background-color: var(--bg-card);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow:
    0 4px 12px var(--color-primary-light),
    0 0 0 1px var(--color-primary);
  transform: translateY(-2px);
}

.status-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border: 2px solid var(--bg-card);
  border-radius: 50%;
}
.danger-dot {
  background-color: var(--color-danger);
}

.header-actions-dock :deep(.dock-key.special-key-success:hover),
.header-actions-dock :deep(.dock-key.special-key-success.is-active) {
  border-color: var(--color-success);
  color: var(--color-success);
  box-shadow:
    0 4px 12px var(--color-success-light),
    0 0 0 1px var(--color-success);
}
.header-actions-dock :deep(.dock-key.special-key-danger:hover),
.header-actions-dock :deep(.dock-key.special-key-danger.is-active) {
  border-color: var(--color-danger);
  color: var(--color-danger);
  box-shadow:
    0 4px 12px var(--color-danger-light),
    0 0 0 1px var(--color-danger);
}

.header-actions-dock :deep(.dock-key.special-key-mini:hover),
.header-actions-dock :deep(.dock-key.special-key-mini.is-active) {
  border-color: var(--color-warning, #f59e0b);
  color: var(--color-warning, #f59e0b);
  box-shadow:
    0 4px 12px rgba(245, 158, 11, 0.2),
    0 0 0 1px var(--color-warning, #f59e0b);
}

.dock-popover {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popover-enter-active,
.popover-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* 🌟 미니 모드일 때 메인보드 영역 유격을 압축하여 화면 낭비 차단 */
.is-mini-window .main-workspace {
  padding: 0 var(--space-4);
}
.is-mini-window .studio-header {
  height: 60px; /* 헤더 높이를 줄여 아래 할 일 목록 카드 영역을 넓힘 */
}
</style>
