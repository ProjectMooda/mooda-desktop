<template>
  <div class="tl-root">
    <!-- 빈 상태 -->
    <div v-if="!items || items.length === 0" class="tl-empty">
      <div class="tl-empty-ring">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        >
          <path d="M5 1v8M1 5h8" />
        </svg>
      </div>
      <span>{{ emptyMessage }}</span>
    </div>

    <!-- 리스트 -->
    <ul v-else class="tl-list">
      <template v-for="item in items" :key="item.id">
        <slot name="item" :item="item">
          <li
            class="tl-item"
            :class="{
              'tl-item--done': item.done,
              'tl-item--readonly': readonly
            }"
            @click.stop="
              listType === 'checkbox' && !readonly
                ? handleCheckChange(item, !item.done)
                : $emit('item-click', item)
            "
          >
            <!-- 체크박스 (checkbox 타입) -->
            <label
              v-if="listType === 'checkbox'"
              class="tl-check-wrap"
              @click.stop
            >
              <span class="tl-check" :class="{ 'tl-check--on': item.done }">
                <svg
                  v-if="item.done"
                  width="8"
                  height="6"
                  viewBox="0 0 8 6"
                  fill="none"
                >
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <BaseCheckBox
                :model-value="item.done"
                :size="2"
                :disabled="readonly"
                class="tl-check-hidden"
                @update:model-value="
                  (val) => {
                    if (!readonly) handleCheckChange(item, val)
                  }
                "
              />
            </label>

            <!-- 텍스트 -->
            <div class="tl-text-wrap">
              <input
                v-if="editable && !readonly"
                :value="item[textKey]"
                type="text"
                class="tl-input"
                @change="
                  (e) =>
                    handleTextChange(item, (e.target as HTMLInputElement).value)
                "
                @click.stop
              />
              <span v-else class="tl-text">{{ item[textKey] }}</span>
            </div>

            <!-- 우측: 삭제 버튼 or 카테고리 뱃지 -->
            <button
              v-if="listType === 'checkbox' && !readonly"
              class="tl-delete-btn"
              title="삭제"
              @click.stop="$emit('delete', item.id as number)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <span
              v-else-if="listType === 'category'"
              class="tl-category"
              :class="getCategoryClass(item[categoryKey])"
            >
              {{ item[categoryKey] || '기타' }}
            </span>
          </li>
        </slot>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import BaseCheckBox from '@/base-ui/BaseCheckBox.vue'

const CATEGORY_CLASS_MAP: Record<string, string> = {
  리서치: 'cat-purple',
  디자인: 'cat-pink',
  개발: 'cat-amber',
  마케팅: 'cat-teal',
  기획: 'cat-blue',
  업무: 'cat-purple',
  개인: 'cat-green',
  건강: 'cat-pink',
  공부: 'cat-amber',
  소셜: 'cat-blue',
  가정: 'cat-teal'
}

const props = withDefaults(
  defineProps<{
    items?: T[]
    textKey?: keyof T
    categoryKey?: keyof T
    emptyMessage?: string
    editable?: boolean
    isCompletedStyle?: boolean
    readonly?: boolean
    listType?: 'checkbox' | 'category'
  }>(),
  {
    items: () => [],
    textKey: 'text' as any,
    categoryKey: 'category' as any,
    emptyMessage: '마일스톤이 없습니다',
    editable: false,
    isCompletedStyle: false,
    readonly: false,
    listType: 'checkbox'
  }
)

const emit = defineEmits<{
  (e: 'update', payload: T): void
  (e: 'delete', id: number): void
  (e: 'item-click', payload: T): void
}>()

const getCategoryClass = (value: string | undefined): string =>
  CATEGORY_CLASS_MAP[value ?? ''] ?? 'cat-gray'

const handleCheckChange = (item: T, isDone: boolean) =>
  emit('update', { ...item, done: isDone })

const handleTextChange = (item: T, newValue: string) =>
  emit('update', { ...item, [props.textKey]: newValue })
</script>

<style scoped>
.tl-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100px; /* ✨ 항목이 없어도 3개 분량의 크기 유지 */
}

/* ── 빈 상태 ── */
.tl-empty {
  flex: 1; /* min-height 내에서 남은 공간을 꽉 채워 가운데 정렬됨 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-sub);
  font-size: 12px;
  opacity: 0.5;
}
.tl-empty-ring {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px dashed currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 리스트 ── */
.tl-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── 아이템 ── */
.tl-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.1s ease;
}
.tl-item:not(.tl-item--readonly):hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

/* 완료: opacity 페이드 대신 취소선으로 — 가독성 유지 */
.tl-item--done .tl-text,
.tl-item--done .tl-input {
  text-decoration: line-through;
  color: var(--text-sub);
}

/* ── 체크박스 ── */
.tl-check-wrap {
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}
.tl-check-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: all;
}
.tl-check {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  border: 1.5px solid var(--border-color);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.tl-check--on {
  background: #7f77dd;
  border-color: #7f77dd;
  color: #ffffff;
}

/* ── 텍스트 ── */
.tl-text-wrap {
  flex: 1;
  min-width: 0;
}
.tl-text,
.tl-input {
  display: block;
  width: 100%;
  font-size: 12px;
  color: var(--text-main);
  line-height: 1.4;
  background: transparent;
  border: none;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
  transition: color 0.15s ease;
}

/* ── 삭제 버튼 ── */
.tl-delete-btn {
  color: var(--text-sub);
  background: none;
  border: none;
  padding: 4px;
  margin: -4px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s ease;
}
.tl-item:hover .tl-delete-btn {
  opacity: 1;
}
.tl-delete-btn:hover {
  color: var(--color-danger, #a32d2d);
  background: #fcebeb;
}

/* ── 카테고리 뱃지 — 의미 있는 컬러 ramp ── */
.tl-category {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 999px;
  border: 0.5px solid;
  white-space: nowrap;
}

.cat-purple {
  background: #eeedfe;
  color: #3c3489;
  border-color: #afa9ec;
}
.cat-pink {
  background: #fbeaf0;
  color: #72243e;
  border-color: #ed93b1;
}
.cat-amber {
  background: #faeeda;
  color: #633806;
  border-color: #ef9f27;
}
.cat-teal {
  background: #e1f5ee;
  color: #085041;
  border-color: #5dcaa5;
}
.cat-blue {
  background: #e6f1fb;
  color: #0c447c;
  border-color: #85b7eb;
}
.cat-green {
  background: #eaf3de;
  color: #27500a;
  border-color: #97c459;
}
.cat-gray {
  background: var(--bg-muted, #f5f5f5);
  color: var(--text-sub);
  border-color: var(--border-color);
}
</style>
