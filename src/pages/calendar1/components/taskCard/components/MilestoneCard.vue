<template>
  <div> 
    <div class="milestone-item compact-card" @click="openModal">
      
      <div class="drag-handle" @click.stop>⠿</div>
      
      <div class="task-content">
        <div class="ms-meta-row">
          <!-- 🚨 1. item.goalTitle 대신 computed 속성인 goalTitle을 사용 -->
          <span v-if="goalTitle" class="meta-badge goal-badge">{{ truncateText(goalTitle, 10) }}</span>
          
          <!-- 🚨 2. item.ms.category -> item.category -->
          <span v-if="item.category && item.category !== '선택 안함'" class="meta-badge category-badge">{{ item.category }}</span>
          
          <span v-if="item.priority" class="meta-badge priority-badge" :class="'p-' + item.priority.toLowerCase()">
            {{ priorityLabel(item.priority) }}
          </span>
        </div>
        
        <div class="ms-main-text" :class="{ 'is-done': item.done }">
          <!-- 🚨 3. item.ms.text -> item.summary (새로운 인터페이스 기준 메인 제목) -->
          <span class="ms-title">{{ truncateText(item.summary, 10) }}</span>
          
          <!-- 🚨 item.ms.summary -> item.memo (상세/서브 요약) -->
          <span v-if="item.memo" class="ms-summary">{{ truncateText(item.memo, 10) }}</span>
        </div>
      </div>

      <div class="task-actions-right">
        <div class="action-wrapper" @click.stop>
          <!-- 🚨 item.ms 파라미터 제거, 이벤트만 부모로 올림 -->
          <button class="btn-pin" :class="{ 'is-pinned': item.isPinned }" @click.stop="$emit('toggle-pin')">📌</button>
          <button class="btn-del" @click.stop="$emit('delete')">✕</button>
          
          <!-- 🚨 4. 제일 중요한 부분! v-model 대신 :checked와 @change 이벤트를 사용해 직접 수정을 방지함 -->
          <input 
            type="checkbox" 
            class="custom-checkbox" 
            :checked="item.done" 
            @change="toggleDone" 
          />
        </div>
      </div>
    </div>

    <!-- 🚨 item.ms 대신 item 전체를 넘김 -->
    <ScheduleDetailModal 
      v-if="isModalOpen"
      :is-open="isModalOpen" 
      :data="item" 
      @close="handleClose" 
      @delete="handleDelete" 
    />
  </div> 
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
// 모달 컴포넌트는 전역이 아니라면 임포트가 필요합니다.
import ScheduleDetailModal from '@/global-components/schedule-detail-modal/ScheduleDetailModal.vue'

// 🚨 타입 변경: any 대신 명확한 ScheduleItem 타입 지정
const props = defineProps<{ item: ScheduleItem }>()

// 부모에게 보낼 이벤트들 정의
const emit = defineEmits(['update', 'toggle-pin', 'delete'])
const store = useScheduleStore()

const isModalOpen = ref(false)

// 🚨 Goal Title 가져오기: 이전의 item.goalTitle은 존재하지 않으므로, 스토어에서 id를 매칭해 가져옵니다.
const goalTitle = computed(() => {
  if (!props.item.goalId) return ''
  const goal = store.goals.find(g => g.id === props.item.goalId)
  return goal ? goal.title : ''
})

// 유틸리티 함수들
const truncateText = (text: string | undefined, length: number) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

const priorityLabel = (priority: string) => {
  if (priority === 'High') return '🔥 높음'
  if (priority === 'Medium') return '⭐ 중간'
  if (priority === 'Low') return '💧 낮음'
  return priority
}

// 모달 제어
const openModal = () => {
  isModalOpen.value = true
}

const handleClose = () => {
  isModalOpen.value = false
}

const handleDelete = () => {
  isModalOpen.value = false
  emit('delete')
}

// 🚨 안전한 상태 업데이트: 프롭스를 직접 바꾸지 않고, 스토어/부모에게 바꿔달라고 요청(emit)
const toggleDone = (e: Event) => {
  const target = e.target as HTMLInputElement
  // 부모 컴포넌트의 @update="scheduleStore.updateSchedule"를 트리거합니다
  emit('update', { done: target.checked })
}
</script>

<style scoped>
.compact-card { display: flex; justify-content: space-between; align-items: stretch; gap: 12px; padding: 12px 16px; margin-bottom: 10px; border-radius: 12px; transition: all 0.2s ease; }

/* 🚨 손잡이 스타일 필수 추가 🚨 */
.drag-handle { 
  display: flex; align-items: center; justify-content: center; 
  color: #d4d4d8; font-size: 16px; cursor: grab; padding-right: 4px; transition: color 0.2s;
}
.compact-card:hover .drag-handle { color: #a1a1aa; }
.drag-handle:active { cursor: grabbing; color: #3b82f6; }

.task-content { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.custom-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; margin: 0; }

.milestone-item { background-color: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; }
.milestone-item:hover { background-color: #f1f5f9; border-color: #cbd5e1; transform: translateY(-1px); }
.ms-meta-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.meta-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.goal-badge { background: #3b82f6; color: #fff; text-transform: uppercase; display: inline-block; vertical-align: bottom; }
.category-badge { background: #e4e4e7; color: #52525b; border: 1px solid #d4d4d8; }
.priority-badge.p-high { background: #fee2e2; color: #ef4444; }
.priority-badge.p-medium { background: #fef3c7; color: #d97706; }
.priority-badge.p-low { background: #e0f2fe; color: #0284c7; }

.ms-main-text { display: flex; align-items: baseline; gap: 8px; overflow: hidden; }
.ms-title { font-size: 15px; font-weight: 700; color: #27272a; white-space: nowrap; flex-shrink: 0; }
.ms-summary { font-size: 13px; color: #71717a; white-space: nowrap; font-weight: 500; }
.ms-summary::before { content: "·"; margin-right: 6px; color: #a1a1aa; }
.is-done .ms-title, .is-done .ms-summary { text-decoration: line-through; color: #a1a1aa !important; }

.task-actions-right { display: flex; flex-direction: column; align-items: flex-end; min-width: 105px; }

.action-wrapper { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 4px; }
.btn-del { background: #fee2e2; color: #ef4444; border: none; width: 24px; height: 24px; border-radius: 6px; font-size: 12px; cursor: pointer; opacity: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.compact-card:hover .btn-del { opacity: 1; }
.btn-del:hover { background: #fecaca; }

.btn-pin { background: transparent; border: none; cursor: pointer; opacity: 0; filter: grayscale(1); transition: 0.2s; font-size: 14px; padding: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.compact-card:hover .btn-pin { opacity: 0.5; }
.btn-pin:hover { opacity: 1; filter: grayscale(0); transform: scale(1.1); }
.btn-pin.is-pinned { opacity: 1; filter: grayscale(0); }

@media (max-width: 1200px) { .category-badge, .priority-badge { display: none; } }
</style>