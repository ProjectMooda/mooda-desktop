<template>
  <div class="goal-detail-modal-root">
    <Modal
      title="목표 상세 설정"
      no-padding
      width="1000px"
      :size="3"
      fixed-height="800px"
      @close="$emit('close')"
    >
      <div class="modal-inner-wrapper">
        <GoalMilestoneList
          v-if="!activeMilestoneId"
          :goal="goal"
          @open-detail="openMilestoneDetail"
          @open-create="showCreateModal = true"
          @close="$emit('close')"
        />

        <MilestoneWorkspace
          v-else
          :goal="goal"
          :milestone-id="activeMilestoneId"
          @back="activeMilestoneId = null"
        />

        <MilestoneCreateModal
          v-if="showCreateModal"
          :goal="goal"
          @close="showCreateModal = false"
        />
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue' // 💡 watch 임포트 추가
import type { Goal, ScheduleItem } from '@/stores/useScheduleStore'
import Modal from '@/global-components/global-modal/components/Modal.vue'

import GoalMilestoneList from './milestone/GoalMilestoneList.vue'
import MilestoneWorkspace from './milestone/MilestoneWorkspace.vue'
import MilestoneCreateModal from './milestone/MilestoneCreateModal.vue'

const props = defineProps<{
  goal: Goal
  initialMilestoneId?: number | null
}>()

const emit = defineEmits(['close'])

const activeMilestoneId = ref<number | null>(props.initialMilestoneId || null)
const showCreateModal = ref(false)

// 💡 수정 포인트: prop으로 넘어온 ID를 확실하게 감지하여 Workspace 화면으로 강제 전환
watch(
  () => props.initialMilestoneId,
  (newId) => {
    activeMilestoneId.value = newId || null
  },
  { immediate: true }
)

const openMilestoneDetail = (ms: ScheduleItem) => {
  activeMilestoneId.value = ms.id
}
</script>
<style scoped>
.goal-detail-modal-root {
  height: 100%;
}

/* 🌟 슬라이드가 모달 창 안에서만 움직이도록 가둬두는 역할 */
.modal-inner-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 슬라이드 패널이 밖으로 삐져나가지 않게 자름 */
}
</style>
