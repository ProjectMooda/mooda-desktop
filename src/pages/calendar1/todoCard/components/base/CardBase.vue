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
        <button 
          class="btn-pin" 
          :class="{ 'is-pinned': item.isPinned }" 
          @click.stop="$emit('toggle-pin')"
        >📌</button>
        
        <CloseButton 
          variant="rounded" 
          class="btn-del" 
          @click.stop="$emit('delete')" 
        />
        <input 
          type="checkbox" 
          class="custom-checkbox" 
          :checked="item.done" 
          @change="(e) => $emit('update', { done: (e.target as HTMLInputElement).checked })" 
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
        @update="(payload) => $emit('update', payload)" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduleItem } from '@/stores/useScheduleStore'
import ScheduleDetailModal from '@/global-components/schedule-detail-modal/ScheduleDetailModal.vue'
import CloseButton from '@/global-components/CloseButton.vue';
const props = defineProps<{ 
  item: ScheduleItem,
  customClass?: string 
}>()

const emit = defineEmits(['update', 'delete', 'toggle-pin'])

const isModalOpen = ref(false)
const openModal = () => { isModalOpen.value = true }
</script>

<style scoped>
/* 기존의 공통 스타일 (compact-card, drag-handle, action-wrapper, btn-pin 등)을 여기로 이동 */
.compact-card { display: flex; justify-content: space-between; align-items: stretch; gap: 12px; padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; cursor: pointer; }
.drag-handle { display: flex; align-items: center; color: #d4d4d8; font-size: 16px; cursor: grab; padding-right: 4px; }
.task-content { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.task-actions-right { display: flex; flex-direction: column; align-items: flex-end; min-width: 105px; }
.action-wrapper { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 4px; }
.btn-del { 
  opacity: 0; 
}
.compact-card:hover .btn-del { 
  opacity: 1; 
}

.btn-pin { background: transparent; border: none; cursor: pointer; opacity: 0.3; filter: grayscale(1); transition: 0.2s; }
.btn-pin.is-pinned { opacity: 1; filter: grayscale(0); }
.compact-card:hover .btn-pin { opacity: 1; }
.custom-checkbox { width: 20px; height: 20px; accent-color: #3b82f6; cursor: pointer; }
</style>