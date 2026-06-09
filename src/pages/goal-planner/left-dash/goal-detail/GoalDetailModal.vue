<template>
  <div class="goal-detail-modal-root">
    <Modal
      title="목표 상세 설정"
      no-padding
      :size="3"
      fixed-height="700px"
      @close="$emit('close')"
    >
      <GoalMilestoneList
        v-if="!activeMilestoneId"
        :goal="goal"
        @open-detail="openMilestoneDetail"
        @open-create="showCreateModal = true"
      />

      <MilestoneWorkspace
        v-else
        :goal="goal"
        :milestone-id="activeMilestoneId"
        @back="activeMilestoneId = null"
      />
    </Modal>

    <MilestoneCreateModal
      v-if="showCreateModal"
      :goal="goal"
      @close="showCreateModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Goal, ScheduleItem } from '@/stores/useScheduleStore'
import Modal from '@/global-components/global-modal/components/Modal.vue'

import GoalMilestoneList from './milestone/GoalMilestoneList.vue'
import MilestoneWorkspace from './milestone//MilestoneWorkspace.vue'
import MilestoneCreateModal from './milestone//MilestoneCreateModal.vue'

defineProps<{ goal: Goal }>()
defineEmits(['close'])

const activeMilestoneId = ref<number | null>(null)
const showCreateModal = ref(false)

const openMilestoneDetail = (ms: ScheduleItem) => {
  activeMilestoneId.value = ms.id
}
</script>

<style scoped>
.goal-detail-modal-root {
  height: 100%;
}
</style>
