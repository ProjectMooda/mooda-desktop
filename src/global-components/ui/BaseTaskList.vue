<template>
  <div class="task-list-container">
    <!-- 🟢 상단 커스텀 영역 -->
    <slot name="header"></slot>

    <!-- 데이터가 없을 때 메시지 -->
    <div v-if="!items || items.length === 0" class="empty-message">
      {{ emptyMessage }}
    </div>

    <!-- 순수 리스트 렌더링 -->
    <ul v-else class="task-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="task-item"
        :class="{ 'is-completed-style': isCompletedStyle }"
        @click.stop="$emit('item-click', item)"
      >
        <label class="checkbox-wrapper" @click.stop>
          <!-- 🌟 @change 대신 @update:model-value로 이벤트를 정확하게 매핑합니다 -->
          <CheckBox
            :model-value="item.done"
            @update:model-value="(val) => handleCheckChange(item, val)"
          />
        </label>

        <div class="task-text-wrapper">
          <input
            v-if="editable"
            :value="item[textKey]"
            type="text"
            class="task-input"
            :class="{ 'is-done': item.done }"
            @change="
              (e) =>
                handleTextChange(item, (e.target as HTMLInputElement).value)
            "
            @click.stop
          />
          <span v-else class="task-text" :class="{ 'is-done': item.done }">
            {{ item[textKey] }}
          </span>
        </div>

        <Xbutton variant="rounded" @click.stop="$emit('delete', item.id)" />
      </li>
    </ul>

    <!-- 🔴 하단 커스텀 영역 -->
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import Xbutton from './Xbutton.vue'
import CheckBox from './CheckBox.vue' // 🌟 이름을 CheckBox.vue로 확실하게 매핑

const props = defineProps({
  items: {
    type: Array as () => any[],
    default: () => []
  },
  textKey: {
    type: String,
    default: 'text'
  },
  emptyMessage: {
    type: String,
    default: '항목이 없습니다.'
  },
  editable: {
    type: Boolean,
    default: false
  },
  isCompletedStyle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'delete', 'item-click'])

// 체크 토글 시 부모(GoalCard) 구조에 맞게 이벤트를 전달
const handleCheckChange = (item: any, isDone: boolean) => {
  emit('update', { ...item, done: isDone })
}

const handleTextChange = (item: any, newValue: string) => {
  emit('update', { ...item, [props.textKey]: newValue })
}
</script>
<style scoped>
.task-list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}
.empty-message {
  font-size: var(--text-xs, 13px);
  color: var(--text-muted);
  padding: var(--space-4, 16px) var(--space-2, 8px);
  text-align: center;
}
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}
.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-2-5, 10px);
  background: var(--bg-card, #fff);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border-radius: var(--radius-sm); /* 8px 통합 */
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}
/* 🌟 다른 카드형 컴포넌트(캘린더 셀, 태스크 카드)들과 호버 일관성 유지 */
.task-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}
.task-item.is-completed-style {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  padding-left: var(--space-1, 4px);
}
.task-text-wrapper {
  flex: 1;
  min-width: 0;
}
.task-text,
.task-input {
  font-size: var(--text-sm); /* 14px */
  color: var(--text-main);
  width: 100%;
}
.task-input {
  border: none;
  background: transparent;
  outline: none;
}
.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}
</style>
