<template>
  <BaseCard
    :size="isMini ? 1 : 2"
    class="global-schedule-card hover-bg active-scale"
    :class="[customClass]"
    :style="customStyle"
    @click="openModal"
  >
    <div class="flex items-center w-full gap-12">
      <div v-if="!isMini" class="drag-handle shrink-0 flex-center" @click.stop>
        ⠿
      </div>

      <div class="flex-1 flex-col min-w-0 gap-4">
        <div class="flex justify-between items-center w-full hide-on-compact">
          <div class="flex items-center gap-8">
            <slot name="context"></slot>
          </div>
          <div
            v-if="!isMini && displayTime"
            class="text-xs text-sub font-semibold shrink-0"
          >
            🕒 {{ displayTime }}
          </div>
        </div>

        <div class="flex justify-between items-center w-full gap-4 min-w-0">
          <div
            class="card-title text-main flex-1 truncate"
            :class="[
              isMini ? 'text-xs' : 'text-sm font-semibold',
              { 'is-done': item.done }
            ]"
          >
            {{ item.summary || '미정' }}
          </div>

          <div class="shrink-0 flex items-center">
            <slot name="summary-right"></slot>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex items-center gap-8" @click.stop>
        <template v-if="!isMini">
          <BasePinButton
            :size="2"
            :is-pinned="item.isPinned"
            @toggle="$emit('toggle-pin')"
          />
          <BaseDeleteButton
            :size="2"
            variant="rounded"
            @click.stop="$emit('delete')"
          />
        </template>

        <BaseCheckBox
          :size="isMini ? 1 : 2"
          :model-value="item.done"
          @update:model-value="(val) => $emit('update', { done: val })"
        />
      </div>
    </div>

    <GlobalScheduleDetailModal
      v-if="isDetailModalOpen"
      :is-open="isDetailModalOpen"
      :data="item"
      @close="isDetailModalOpen = false"
      @delete="$emit('delete')"
      @update="$emit('update', $event)"
    />

    <GlobalFullScheduleAddModal
      v-if="isFullModalOpen"
      :is-open="isFullModalOpen"
      :data="item"
      @close="isFullModalOpen = false"
      @delete="$emit('delete')"
      @update="$emit('update', $event)"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import BaseCard from '@/base-ui/BaseCard.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import BasePinButton from '@/base-ui/BasePinButton.vue'
import BaseCheckBox from '@/base-ui/BaseCheckBox.vue'
import GlobalScheduleDetailModal from '@/global-components/global-modal/global-detail-modal/GlobalScheduleDetailModal.vue'
import GlobalFullScheduleAddModal from '@/global-components/global-modal/global-detail-modal/GlobalFullScheduleAddModal.vue'

const props = defineProps<{
  item: ScheduleItem
  customClass?: string
  customStyle?: Record<string, string>
  isMini?: boolean
}>()

const emit = defineEmits(['update', 'delete', 'toggle-pin'])

const isDetailModalOpen = ref(false)
const isFullModalOpen = ref(false)

const openModal = () => {
  const mode = props.item.creationMode
  if (mode === 'weekly' || mode === 'period') {
    isFullModalOpen.value = true
  } else {
    isDetailModalOpen.value = true
  }
}

const displayTime = computed(() => {
  if (!props.item.startTime && !props.item.endTime) return ''
  return `${props.item.startTime || '미정'} ~ ${props.item.endTime || '미정'}`
})
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
.global-schedule-card {
  cursor: pointer;
  margin-bottom: var(--space-2);
  border-color: transparent;
  container-type: inline-size;
}

.global-schedule-card:hover {
  border-color: rgba(0, 0, 0, 0.05);
}

.drag-handle {
  color: var(--text-muted);
  font-size: 18px;
  cursor: grab;
  transition: color var(--transition-fast);
}
.drag-handle:active {
  cursor: grabbing;
}
.global-schedule-card:hover .drag-handle {
  color: var(--text-sub);
}

.card-title.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@container (max-width: 400px) {
  .hide-on-compact {
    display: none !important;
  }
}
</style>
