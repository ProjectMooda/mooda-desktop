<template>
  <div class="panel-content panel-clipboard">
    <transition name="fade">
      <div v-if="showToast" class="copy-toast">
        ✂️ 클립보드에 복사되었습니다!
      </div>
    </transition>

    <div class="panel-header">
      <span class="panel-title">✂️ 클립보드 히스토리</span>
      <span class="panel-action" @click="clearHistory">비우기</span>
    </div>

    <ul class="item-list">
      <li
        v-for="item in clipboardItems"
        :key="item.id"
        class="list-item"
        @click="copyToClipboard(item.text)"
      >
        <div class="item-text text-truncate">{{ item.text }}</div>
        <i class="ti ti-copy item-icon"></i>
      </li>
      <li v-if="clipboardItems.length === 0" class="empty-state">
        클립보드 내역이 없습니다.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const emit = defineEmits<{ (e: 'update-dot', hasData: boolean): void }>()
const clipboardItems = ref<{ id: number; text: string }[]>([])
const showToast = ref(false) // 🌟 토스트 표시 상태

const MAX_ITEMS = 10

onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.onClipboardChanged((newText: string) => {
      if (clipboardItems.value.find((item) => item.text === newText)) return

      clipboardItems.value.unshift({ id: Date.now(), text: newText })

      if (clipboardItems.value.length > MAX_ITEMS) {
        clipboardItems.value.pop()
      }
    })
  }
})

watch(
  clipboardItems,
  (newVal) => {
    emit('update-dot', newVal.length > 0)
  },
  { deep: true }
)

const copyToClipboard = (text: string) => {
  if (window.electronAPI) {
    window.electronAPI.writeToClipboard(text)

    // 🌟 1.5초간 토스트 표시 후 자동 제거
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 1500)
  }
}

const clearHistory = () => {
  clipboardItems.value = []
}
</script>

<style scoped>
@import './global-header-components.css';

.item-list {
  padding: 0;
  margin: 0;
  list-style: none;

  height: 200px;
  overflow-y: auto;
}
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background var(--transition-base);
}
.list-item:hover {
  background: var(--bg-hover);
}
.text-truncate {
  max-width: 80%;
  overflow: hidden;
  text-white-space: nowrap;
  text-overflow: ellipsis;
}

/* 🌟 토스트 애니메이션 및 배치 */
.copy-toast {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.empty-state {
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}
</style>
