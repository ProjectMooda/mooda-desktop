<template>
  <div class="panel-content panel-memo">
    <div class="panel-header">
      <span class="panel-title">📝 퀵 메모</span>
      <span class="panel-action" @click="memoText = ''">지우기</span>
    </div>
    <textarea
      v-model="memoText"
      class="memo-textarea"
      placeholder="떠오르는 아이디어나 임시 텍스트를 적어두세요. 자동 저장됩니다."
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits<{ (e: 'update-dot', hasData: boolean): void }>()
const memoText = ref('')

onMounted(() => {
  const savedMemo = localStorage.getItem('jarvis_quick_memo')
  if (savedMemo) memoText.value = savedMemo
  emit('update-dot', !!memoText.value.trim())
})

watch(memoText, (newVal) => {
  localStorage.setItem('jarvis_quick_memo', newVal)
  emit('update-dot', !!newVal.trim())
})
</script>

<style scoped>
@import './global-header-components.css'; /* 공통 패널 스타일 활용 권장 */

.memo-textarea {
  width: 100%;
  height: 200px;
  border: none;
  resize: none;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-main);
  background: transparent;
  outline: none;
}
.memo-textarea::placeholder {
  color: var(--text-muted);
}
</style>
