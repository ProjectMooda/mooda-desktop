<template>
  <div class="task-list-container">
    <slot name="header"></slot>

    <div v-if="!items || items.length === 0" class="empty-message">
      {{ emptyMessage }}
    </div>

    <ul v-else class="task-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="task-item"
        :class="{
          'is-completed-style': isCompletedStyle,
          'is-readonly': readonly
        }"
        @click.stop="$emit('item-click', item)"
      >
        <label class="checkbox-wrapper" @click.stop>
          <CheckBox
            :model-value="item.done"
            :disabled="readonly"
            @update:model-value="
              (val) => {
                if (!readonly) handleCheckChange(item, val)
              }
            "
          />
        </label>

        <div class="task-text-wrapper">
          <input
            v-if="editable && !readonly"
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

        <Xbutton
          v-if="!readonly"
          variant="rounded"
          @click.stop="$emit('delete', item.id)"
        />
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import Xbutton from '../../global-ui/Xbutton.vue'
import CheckBox from '../../global-ui/CheckBox.vue'

// 1. 제네릭 T를 활용하여 any를 제거하고 타입을 명확히 합니다.
const props = withDefaults(
  defineProps<{
    items?: T[]
    textKey?: keyof T
    emptyMessage?: string
    editable?: boolean
    isCompletedStyle?: boolean
    readonly?: boolean // 🌟 읽기 전용 모드 Prop 추가
  }>(),
  {
    items: () => [],
    textKey: 'text' as any,
    emptyMessage: '항목이 없습니다.',
    editable: false,
    isCompletedStyle: false,
    readonly: false // 기본값은 활성화
  }
)

const emit = defineEmits<{
  (e: 'update', payload: T): void
  (e: 'delete', id: string | number): void
  (e: 'item-click', payload: T): void
}>()

const handleCheckChange = (item: T, isDone: boolean) => {
  emit('update', { ...item, done: isDone })
}

const handleTextChange = (item: T, newValue: string) => {
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
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* 🌟 읽기 전용일 때는 마우스 오버 효과나 커서를 다르게 줘서 시각적 힌트 제공 */
.task-item.is-readonly {
  cursor: default; /* 클릭해서 수정 불가능한 느낌 (상세 모달을 띄우려면 pointer 유지해도 됨) */
}
.task-item.is-readonly:hover {
  background: var(--bg-card, #fff);
  border-color: var(--border-color);
  box-shadow: none;
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
  font-size: var(--text-sm);
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
