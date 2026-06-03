<template>
  <!-- 루트를 BaseCard로 교체 (그림자 제거, 패딩은 내부 요소에서 제어) -->
  <BaseCard shadow="none" no-padding class="task-list-container">
    <!-- 1. Header Slot -->
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>

    <!-- 2. Body (기존 리스트 내용 변경 X) -->
    <div class="task-list-content flex-col gap-8">
      <div
        v-if="!items || items.length === 0"
        class="empty-message text-xs text-muted"
      >
        {{ emptyMessage }}
      </div>

      <ul v-else class="task-list flex-col gap-8">
        <template v-for="item in items" :key="item.id">
          <slot name="item" :item="item">
            <li
              class="task-item items-center gap-8"
              :class="{
                'is-completed-style': isCompletedStyle,
                'is-readonly': readonly
              }"
              @click.stop="$emit('item-click', item)"
            >
              <label class="checkbox-wrapper shrink-0 flex-center" @click.stop>
                <BaseCheckBox
                  :model-value="item.done"
                  :disabled="readonly"
                  @update:model-value="
                    (val) => {
                      if (!readonly) handleCheckChange(item, val)
                    }
                  "
                />
              </label>

              <div class="task-text-wrapper flex-1 min-w-0">
                <input
                  v-if="editable && !readonly"
                  :value="item[textKey]"
                  type="text"
                  class="task-input text-sm w-full"
                  :class="item.done ? 'is-done text-muted' : 'text-main'"
                  @change="
                    (e) =>
                      handleTextChange(
                        item,
                        (e.target as HTMLInputElement).value
                      )
                  "
                  @click.stop
                />
                <span
                  v-else
                  class="task-text text-sm w-full"
                  :class="item.done ? 'is-done text-muted' : 'text-main'"
                >
                  {{ item[textKey] }}
                </span>
              </div>

              <BaseDeleteButton
                v-if="!readonly"
                variant="rounded"
                @click.stop="$emit('delete', item.id)"
              />
            </li>
          </slot>
        </template>
      </ul>
    </div>

    <!-- 3. Footer Slot -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </BaseCard>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import BaseCheckBox from '@/base-ui/BaseCheckBox.vue'
// ✨ BaseCard import 추가
import BaseCard from '@/base-ui/BaseCard.vue'

const props = withDefaults(
  defineProps<{
    items?: T[]
    textKey?: keyof T
    emptyMessage?: string
    editable?: boolean
    isCompletedStyle?: boolean
    readonly?: boolean
  }>(),
  {
    items: () => [],
    textKey: 'text' as any,
    emptyMessage: '항목이 없습니다.',
    editable: false,
    isCompletedStyle: false,
    readonly: false
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
/* =======================================
   Container & Messages
======================================= */
/* 겉을 감싸는 BaseCard가 쪼그라들지 않도록 방어 */
.task-list-container {
  flex-shrink: 0;
}

.empty-message {
  padding: 24px 12px;
  text-align: center;
}

/* 갭(gap)을 없애서 리스트가 촘촘하게 붙도록 수정 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
/* =======================================
   Task Item (이중 카드 느낌 제거, 플랫한 리스트형)
======================================= */
.task-item {
  background: transparent; /* 배경 투명하게 */
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid var(--border-color); /* 밑줄만 남겨서 리스트처럼 보이게 */
  border-radius: 0; /* 둥근 모서리 제거 */
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

/* 마지막 아이템은 밑줄 제거해서 BaseCard 푸터와 겹치지 않게 */
.task-item:last-child {
  border-bottom: none;
}

/* hover 시 그림자 없이 배경색만 살짝 변하도록 수정 */
.task-item:not(.is-readonly):hover {
  background: var(--bg-hover);
  box-shadow: none;
}

.task-item.is-readonly {
  cursor: default;
}

/* 완료된 스타일 (기존 유지) */
.task-item.is-completed-style {
  background: transparent;
  border-color: transparent;
  padding-left: 16px;
}

/* =======================================
   Inputs & Texts
======================================= */
.task-input {
  border: none;
  background: transparent;
  outline: none;
}

.is-done {
  text-decoration: line-through;
}
</style>
