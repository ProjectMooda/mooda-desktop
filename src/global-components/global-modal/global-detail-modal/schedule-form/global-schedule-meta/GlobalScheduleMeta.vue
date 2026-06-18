<template>
  <div class="form-section">
    <div class="section-label">분류 & 중요도</div>
    <div class="input-stack">
      <div class="input-col">
        <div class="sub-label-group">
          <span class="sub-label"><i class="ti ti-tag"></i> 카테고리</span>
          <BaseButton
            :size="1"
            variant="ghost"
            iconOnly
            @click="isEditingCategory = true"
            title="카테고리 편집"
          >
            <i class="ti ti-settings">⚙️</i>
          </BaseButton>
        </div>
        <div class="chip-group">
          <BaseButton
            v-for="cat in store.categories"
            :key="cat.id"
            :size="2"
            :variant="category === cat.id ? 'primary' : 'outline'"
            @click="category = cat.id"
          >
            {{ cat.emoji }} {{ cat.label }}
          </BaseButton>
        </div>
      </div>

      <div class="input-col">
        <div class="sub-label-group">
          <span class="sub-label"><i class="ti ti-flag"></i> 중요도</span>
          <BaseButton
            :size="1"
            variant="ghost"
            iconOnly
            @click="isEditingPriority = true"
            title="중요도 편집"
          >
            <i class="ti ti-settings">⚙️</i>
          </BaseButton>
        </div>
        <div class="chip-group">
          <BaseButton
            v-for="option in store.priorityOptions"
            :key="option.id"
            :size="2"
            :variant="priority === option.id ? 'primary' : 'outline'"
            @click="priority = option.id"
          >
            {{ option.emoji }} {{ option.label }}
          </BaseButton>
        </div>
      </div>
    </div>

    <ManageOptionsModal
      v-model="isEditingCategory"
      title="카테고리 편집"
      :items="categoryItems"
      :emojiList="CATEGORY_EMOJIS"
      addPlaceholder="+ 새 카테고리 추가"
      :maxCount="10"
      @updateItemLabel="handleCategoryUpdate"
      @updateItemPrefix="handleCategoryPrefixUpdate"
      @deleteItem="handleCategoryDelete"
      @addItem="addNewCategory"
    />

    <ManageOptionsModal
      v-model="isEditingPriority"
      title="중요도 편집"
      :items="priorityItems"
      :emojiList="PRIORITY_EMOJIS"
      addPlaceholder="+ 새 중요도 추가"
      :maxCount="10"
      @updateItemLabel="handlePriorityUpdate"
      @updateItemPrefix="handlePriorityPrefixUpdate"
      @deleteItem="handlePriorityDelete"
      @addItem="addNewPriority"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import ManageOptionsModal from './ManageOptionsModal.vue'
import { useScheduleStore } from '@/stores/useScheduleStore'

const CATEGORY_EMOJIS = [
  '💡',
  '🎨',
  '💻',
  '🚀',
  '🏃',
  '💼',
  '📚',
  '💰',
  '🛒',
  '🏠',
  '🍱',
  '🎉',
  '✈️',
  '🎮',
  '🌿',
  '❤️'
]

// 🌟 2. 중요도 전용: Urgent, 경고, 우선순위, 상태를 직관적으로 나타내는 이모지
const PRIORITY_EMOJIS = [
  '🚨',
  '🔥',
  '⚡',
  '⚠️',
  '⭐',
  '📌',
  '🎯',
  '🔝',
  '🔴',
  '🟡',
  '🟢',
  '⚪',
  '‼️',
  '✅',
  '⏳',
  '💤'
]

const category = defineModel<string>('category', { default: '' })
const priority = defineModel<string>('priority', { default: '' })

const store = useScheduleStore()

const isEditingCategory = ref(false)
const isEditingPriority = ref(false)
// =========================
// 공통 모달 형식에 맞게 데이터 변환
// =========================
const categoryItems = computed(() =>
  store.categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    prefix: cat.emoji
  }))
)

const priorityItems = computed(() =>
  store.priorityOptions.map((pri) => ({
    id: pri.id,
    label: pri.label,
    prefix: pri.emoji
  }))
)
// =========================
// 🌟 카테고리 핸들러
// =========================
const handleCategoryUpdate = (id: string, newVal: string) => {
  const existing = store.categories.find((c) => c.id === id)
  if (existing && newVal !== existing.label) {
    store.updateCategoryOption(id, { label: newVal })
  }
}

const handleCategoryPrefixUpdate = (id: string, newPrefix: string) => {
  store.updateCategoryOption(id, { emoji: newPrefix })
}

const handleCategoryDelete = (id: string) => {
  store.removeCategory(id)
  if (category.value === id) category.value = ''
}

const addNewCategory = (val: string, prefix: string) => {
  store.addCategory({
    label: val,
    emoji: prefix || '📌'
  })
}

// =========================
// 중요도 핸들러
// =========================
const handlePriorityUpdate = (id: string, newVal: string) => {
  const existing = store.priorityOptions.find((p) => p.id === id)
  if (existing && newVal !== existing.label) {
    store.updatePriorityOption(id, { label: newVal })
  }
}

const handlePriorityPrefixUpdate = (id: string, newPrefix: string) => {
  store.updatePriorityOption(id, { emoji: newPrefix })
}

const handlePriorityDelete = (id: string) => {
  store.removePriorityOption(id)
  if (priority.value === id) priority.value = ''
}

const addNewPriority = (val: string, prefix: string) => {
  store.addPriorityOption({
    label: val,
    emoji: prefix || '📌',
    color: '#f3f4f6'
  })
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.input-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 라벨 & 톱니바퀴 정렬 */
.sub-label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sub-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
}

.styled-select :deep(select),
.styled-select :deep(.select-trigger) {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  font-size: 13px;
  padding: 0 12px;
  height: 32px;
}

/* 칩 그룹 (BaseButton 기반으로 여백만 처리) */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
