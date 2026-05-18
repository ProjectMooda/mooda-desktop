<template>
  <div class="compact-card" :class="customClass" @click="openModal">
    <!-- 1. 드래그 핸들 -->
    <div class="drag-handle" @click.stop>⠿</div>

    <!-- 2. 메인 콘텐츠 영역 (제목, 배지 등) -->
    <div class="task-content">
      <slot name="content"></slot>
    </div>

    <!-- 3. 우측 액션 영역 (시간, 버튼들) -->
    <div class="task-actions-right">
      <slot name="meta"></slot>

      <div class="action-wrapper" @click.stop>
        <PinButton
          class="card-pin"
          :is-pinned="item.isPinned"
          @toggle="$emit('toggle-pin')"
        />

        <Xbutton variant="rounded" @click.stop="$emit('delete')" />

        <!-- 변경된 체크박스 컴포넌트 적용 -->
        <CheckBox
          :model-value="item.done"
          @update:model-value="(val) => $emit('update', { done: val })"
        />
      </div>
    </div>

    <!-- 4. 공통 상세 모달 -->
    <ScheduleDetailModal
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
import { ref } from 'vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import ScheduleDetailModal from '@/global-components/modal/schedule-detail-modal/ScheduleDetailModal.vue'
import Xbutton from '@/global-components/ui//Xbutton.vue'
import PinButton from '@/global-components/ui/PinButton.vue'
// 새로 만든 체크박스 컴포넌트 임포트 (경로는 프로젝트에 맞게 수정하세요)
import CheckBox from '@/global-components/ui/CheckBox.vue'

const props = defineProps<{
  item: ScheduleItem
  customClass?: string
}>()

const emit = defineEmits(['update', 'delete', 'toggle-pin'])

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
</script>

<style scoped>
/* =======================================
   📋 Compact Task Card (List Item)
======================================= */
.compact-card {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: var(--space-3); /* 12px */
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  margin-bottom: var(--space-2); /* 10px -> 8px (4px 그리드 시스템에 맞춤) */

  /* 카드 기본 배경 및 얇고 단정한 테두리 */
  background: var(--bg-card);
  border: 1px solid transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04); /* 리스트가 겹칠 때 자연스러운 구분선 역할 */
  border-radius: var(--radius-sm); /* 8px (단정하고 프로페셔널한 느낌) */

  transition: all var(--transition-fast);
  cursor: pointer;
}

/* 호버 시 세련된 반응 (캘린더 셀과 동일한 로직) */
.compact-card:hover {
  background: rgba(
    0,
    0,
    0,
    0.02
  ); /* 기존 opacity: 1 대신 배경색으로 호버 피드백 */
  border-color: rgba(0, 0, 0, 0.05);
}

/* =======================================
   🤏 Drag Handle
======================================= */
.drag-handle {
  display: flex;
  align-items: center;
  color: var(--text-muted); /* #d4d4d8 대응 */
  font-size: var(--text-base); /* 16px */
  cursor: grab;
  padding-right: var(--space-1); /* 4px */
  transition: color var(--transition-fast);
}

/* 드래그 중이거나, 카드에 마우스를 올렸을 때 핸들 색상 진하게 */
.drag-handle:active {
  cursor: grabbing;
}
.compact-card:hover .drag-handle {
  color: var(--text-sub);
}

/* =======================================
   📝 Content & Actions
======================================= */
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 6px -> 8px (타이포그래피 간격 최적화) */
  min-width: 0;
}

.task-actions-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 105px; /* 액션 버튼들을 위한 고정 최소 너비 유지 */
}

.action-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 12px */
  margin-top: auto;
  padding-top: var(--space-1); /* 4px */
}
</style>
