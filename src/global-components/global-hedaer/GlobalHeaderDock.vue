<template>
  <div class="dock-root">
    <!-- 도크 바 -->
    <div class="dock-bar shadow-2">
      <!-- ① 퀵 메모 -->
      <button
        class="dock-item"
        :class="{ 'is-active': activePanel === 1 }"
        title="퀵 메모 (Scratchpad)"
        @click="togglePanel(1)"
      >
        <svg
          class="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span class="dock-num">1</span>
        <span v-if="hasMemo" class="dock-dot"></span>
      </button>

      <!-- ② 클립보드 -->
      <button
        class="dock-item"
        :class="{ 'is-active': activePanel === 2 }"
        title="클립보드 매니저"
        @click="togglePanel(2)"
      >
        <svg
          class="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
          />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="12" y2="16" />
        </svg>
        <span class="dock-num">2</span>
        <span v-if="hasClipboard" class="dock-dot"></span>
      </button>

      <span class="dock-sep"></span>

      <!-- ③ 로컬 파일 링크 (success) -->
      <button
        class="dock-item accent-success"
        :class="{ 'is-active': activePanel === 3 }"
        title="로컬 파일 링커"
        @click="togglePanel(3)"
      >
        <svg
          class="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          />
        </svg>
        <span class="dock-num">3</span>
      </button>

      <!-- ④ 파일 드롭존 (danger) -->
      <button
        class="dock-item accent-danger"
        :class="{ 'is-active': activePanel === 4 }"
        title="임시 파일 드롭존"
        @click="togglePanel(4)"
        @dragover.prevent
      >
        <svg
          class="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        <span class="dock-num">4</span>
        <span v-if="hasDroppedFiles" class="dock-dot dot-danger"></span>
      </button>

      <!-- ⑤ 미니 모드 토글 (warning) -->
      <button
        class="dock-item accent-warning"
        :class="{ 'is-active': scheduleStore.isMiniMode }"
        title="미니 모드 토글"
        @click="scheduleStore.toggleMiniMode"
      >
        <svg
          class="dock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <span class="dock-num">5</span>
      </button>
    </div>

    <!-- 팝오버 패널 -->
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

import DockMemo from './components/DockMemo.vue'
import DockClipboard from './components/DockClipboard.vue'
import DockLocalLinks from './components/DockLocalLinks.vue'
import DockDropzone from './components/DockDropzone.vue'
import { useScheduleStore } from '@/stores/useScheduleStore.ts'

const scheduleStore = useScheduleStore()
const activePanel = ref<number | null>(null)
const hasMemo = ref(false)
const hasClipboard = ref(false)
const hasDroppedFiles = ref(false)
const dropzoneRef = ref(null)

const togglePanel = (n: number) => {
  activePanel.value = activePanel.value === n ? null : n
}

const closeOnOutsideClick = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.dock-root')) {
    activePanel.value = null
  }
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', closeOnOutsideClick))
</script>

<style scoped>
/* ========================================
   루트 컨테이너
======================================== */
.dock-root {
  position: relative;
  display: inline-block;
}

/* ========================================
   도크 바
======================================== */
.dock-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

/* ========================================
   도크 아이템 (버튼)
======================================== */
.dock-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-sub);
  outline: none;
  flex-shrink: 0;
  transition:
    background 0.12s ease,
    color 0.12s ease;
}

/* 기본 hover / active */
.dock-item:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}
.dock-item.is-active {
  background: var(--color-primary);
  color: #ffffff;
}

/* 아이콘 */
.dock-icon {
  width: 15px;
  height: 15px;
  display: block;
  flex-shrink: 0;
}

/* 단축키 번호 — 아이콘 뒤에 흐리게 */
.dock-num {
  position: absolute;
  bottom: 3px;
  right: 4px;
  font-size: 8px;
  font-weight: 700;
  line-height: 1;
  opacity: 0.3;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  transition: opacity 0.12s;
}
.dock-item:hover .dock-num,
.dock-item.is-active .dock-num {
  opacity: 0.6;
}

/* 상태 점 */
.dock-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  border: 1.5px solid var(--bg-card);
  pointer-events: none;
}
.dock-item.is-active .dock-dot {
  background: rgba(255, 255, 255, 0.9);
  border-color: transparent;
}
.dot-danger {
  background: var(--color-danger) !important;
}

/* 구분선 */
.dock-sep {
  width: 1px;
  height: 16px;
  background: var(--border-color);
  margin: 0 4px;
  flex-shrink: 0;
}

/* ========================================
   특수 기능 색상 (더 높은 specificity로 자연스럽게 덮기)
======================================== */
.dock-item.accent-success:hover {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}
.dock-item.accent-success.is-active {
  background: var(--color-success);
  color: #ffffff;
}

.dock-item.accent-danger:hover {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}
.dock-item.accent-danger.is-active {
  background: var(--color-danger);
  color: #ffffff;
}

.dock-item.accent-warning:hover {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f59e0b;
}
.dock-item.accent-warning.is-active {
  background: #f59e0b;
  color: #ffffff;
}

/* ========================================
   팝오버 패널
======================================== */
.dock-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.popover-enter-active,
.popover-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

/* ========================================
   미니 모드 레이아웃 압축 (기존 유지)
======================================== */
.is-mini-window .main-workspace {
  padding: 0 var(--space-4);
}
.is-mini-window .studio-header {
  height: 60px;
}
</style>
