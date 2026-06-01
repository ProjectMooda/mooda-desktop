<template>
  <Modal title="새로운 마일스톤 추가" width="420px" @close="$emit('close')">
    <div class="form-container">
      <div class="form-group">
        <label>마일스톤 타이틀</label>
        <BaseInput
          v-model="newMsTitle"
          v-focus
          field="goalTitle"
          placeholder="마일스톤 타이틀을 입력하세요"
          @keyup.enter="submitNewMilestone"
        />
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <button class="btn-secondary" @click="$emit('close')">취소</button>
        <button
          class="btn-primary"
          :style="{ backgroundColor: goal?.color || 'var(--text-main)' }"
          @click="submitNewMilestone"
        >
          등록하기
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'
import Modal from '@/global-components/global-modal/components/Modal.vue'
import BaseInput from '@/base-ui/BaseInput.vue'

const props = defineProps<{ goal: Goal }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

const newMsTitle = ref('')

const submitNewMilestone = () => {
  if (!newMsTitle.value.trim()) {
    alert('타이틀을 입력해주세요.')
    return
  }

  // 날짜 없이 타이틀만 저장
  store.addMilestone(props.goal.id, newMsTitle.value.trim())

  emit('close')
}

const vFocus = {
  mounted: (el: HTMLElement) => {
    const input = el.querySelector('input')
    if (input) input.focus()
  }
}
</script>

<style scoped>
.form-container {
  padding: var(--space-4) 0;
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-sub);
  margin-bottom: var(--space-2);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-primary {
  background: var(--text-main);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-main);
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
}
</style>
