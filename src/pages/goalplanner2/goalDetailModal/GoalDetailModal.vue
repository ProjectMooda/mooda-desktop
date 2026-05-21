<template>
  <div class="goal-detail-modal-root">
    <BaseModal
      title="목표 상세 설정"
      width="1000px"
      height="760px"
      no-padding
      @close="$emit('close')"
    >
      <!-- VIEW 1: 마일스톤 목록 화면 -->
      <GoalMilestoneList
        v-if="!activeMilestoneId"
        :goal="goal"
        @open-detail="openMilestoneDetail"
        @open-create="showCreateModal = true"
      />

      <!-- VIEW 2: 마일스톤 워크스페이스 화면 -->
      <MilestoneWorkspace
        v-else
        :goal="goal"
        :milestone-id="activeMilestoneId"
        @back="activeMilestoneId = null"
      />

      <!-- 마일스톤 생성 모달 -->
      <MilestoneCreateModal
        v-if="showCreateModal"
        :goal="goal"
        @close="showCreateModal = false"
      />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Goal, ScheduleItem } from '@/stores/useScheduleStore'
import BaseModal from '@/global-components/modal/base/BaseModal.vue'

// 분리한 자식 컴포넌트들 Import (경로는 실제 위치에 맞게 조정해 주세요)
import GoalMilestoneList from './GoalMilestoneList.vue'
import MilestoneWorkspace from './MilestoneWorkspace.vue'
import MilestoneCreateModal from './MilestoneCreateModal.vue'

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
