<template>
  <BaseButton
    :size="3"
    variant="ghost"
    class="dock-key special-key-warning"
    title="포커스 모드 & 시스템 트레이"
    @click="sidebarStore.showSettings = true"
  >
    <span class="key-text">5</span>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '@/base-ui/BaseButton.vue'
import { useSidebarStore } from '@/global-components/global-sidebar/useSidebarStore'
const sidebarStore = useSidebarStore()
</script>

<style scoped>
/* 부모 컴포넌트의 BaseButton 호버링 스타일만 가져와도 됩니다. */
.special-key-warning:hover {
  border-color: var(--color-warning);
  color: var(--color-warning);
  box-shadow:
    0 4px 12px var(--color-warning-light),
    0 0 0 1px var(--color-warning);
}
</style>
