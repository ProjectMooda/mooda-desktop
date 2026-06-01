<template>
  <div
    class="compact-card"
    :class="[customClass, { 'is-mini': isMini }]"
    :style="customStyle"
    @click="openModal"
  >
    <div v-if="!isMini" class="drag-handle" @click.stop>⠿</div>

    <div class="card-content-wrapper">
      <div class="card-header">
        <div class="card-context">
          <slot name="context"></slot>
        </div>
        <div v-if="!isMini && displayTime" class="card-meta-right">
          🕒 {{ displayTime }}
        </div>
      </div>

      <div class="card-title" :class="{ 'is-done': item.done }">
        {{ truncateText(item.summary || '미정', isMini ? 12 : 15) }}
      </div>
    </div>

    <div class="task-actions-right">
      <div class="action-wrapper" @click.stop>
        <BasePinButton
          v-if="!isMini"
          class="card-pin"
          :is-pinned="item.isPinned"
          @toggle="$emit('toggle-pin')"
        />
        <BaseDeleteButton
          v-if="!isMini"
          variant="rounded"
          @click.stop="$emit('delete')"
        />

        <BaseCheckBox
          :model-value="item.done"
          @update:model-value="(val) => $emit('update', { done: val })"
        />
      </div>
    </div>

    <GlobalScheduleDetailModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :data="item"
      @close="isModalOpen = false"
      @delete="$emit('delete')"
      @update="$emit('update', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import { useFormatter } from '@/utils/useFormatter'
import GlobalScheduleDetailModal from '@/global-components/global-modal/global-schedule-detail-modal/GlobalScheduleDetailModal.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import BasePinButton from '@/base-ui/BasePinButton.vue'
import BaseCheckBox from '@/base-ui/BaseCheckBox.vue'

const { truncateText } = useFormatter()

const props = defineProps<{
  item: ScheduleItem
  customClass?: string
  customStyle?: Record<string, string>
  isMini?: boolean // 미니 모드 플래그
}>()

const emit = defineEmits(['update', 'delete', 'toggle-pin'])

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}

const displayTime = computed(() => {
  if (!props.item.startTime && !props.item.endTime) return ''
  return `${props.item.startTime || '미정'} ~ ${props.item.endTime || '미정'}`
})
</script>

<style scoped>
/* =======================================
   📋 Default Card Style
======================================= */
.compact-card {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  margin-bottom: var(--space-2, 8px);
  background: var(--bg-card);
  border: 1px solid transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-sm, 8px);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.compact-card:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.05);
}

.drag-handle {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  font-size: var(--text-base);
  cursor: grab;
  padding-right: var(--space-1, 4px);
  transition: color var(--transition-fast);
}
.drag-handle:active {
  cursor: grabbing;
}
.compact-card:hover .drag-handle {
  color: var(--text-sub);
}

.card-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-1, 4px);
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 16px;
}

.card-context {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.card-meta-right {
  font-size: 10px;
  color: var(--text-sub);
  font-weight: var(--font-semibold);
}

.card-title {
  font-size: var(--text-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main);
  margin-top: 2px;
}
.card-title.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-actions-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: max-content;
}

.action-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  margin-top: auto;
  padding-top: var(--space-1, 4px);
}

/* =======================================
   ✨ Mini Card Style (고밀도 최적화)
======================================= */
.compact-card.is-mini {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-1, 4px);
  border-bottom: none; /* 미니일 때는 더 플랫하게 */
}

.is-mini .card-content-wrapper {
  gap: 2px;
  padding: 0;
}

.is-mini .card-header {
  min-height: 14px;
}

.is-mini .card-title {
  font-size: var(--text-xs, 12px);
  margin-top: 0;
}

.is-mini .action-wrapper {
  gap: var(--space-2, 8px);
  padding-top: 0;
  height: 100%;
}
</style>
