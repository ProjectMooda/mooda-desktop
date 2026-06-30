<template>
  <Modal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="title"
    :size="2"
  >
    <!-- 🌟 이벤트 버블링 방지 (.stop) 적용 -->
    <div
      v-if="activePickerId"
      class="picker-backdrop"
      @click.stop="activePickerId = null"
    ></div>

    <div class="modal-content-wrapper">
      <!-- 🌟 애플/슬랙 스타일 상태 배지 -->
      <div class="status-header">
        <div class="status-left">
          <span class="status-icon">📝</span>
          <span class="status-title">등록된 항목</span>
        </div>
        <div class="capacity-pill" :class="{ 'is-full': isFull }">
          <span class="count">{{ items.length }}</span>
          <span class="slash">/</span>
          <span class="max">{{ maxCount }}</span>
        </div>
      </div>

      <!-- 🌟 다이어리/iOS 감성의 기존 리스트 컨테이너 -->
      <div v-if="items.length > 0" class="ios-list-card">
        <div v-for="item in items" :key="item.id" class="list-row">
          <div class="emoji-wrapper">
            <button
              class="emoji-btn shadow-sm"
              title="아이콘 변경"
              @click.stop="togglePicker(item.id)"
            >
              {{ item.prefix || '📌' }}
            </button>

            <!-- 이모지 팝오버 -->
            <transition name="pop-bounce">
              <div v-if="activePickerId === item.id" class="emoji-popover">
                <div class="emoji-grid">
                  <button
                    v-for="em in displayEmojiList"
                    :key="em"
                    class="emoji-item-btn"
                    @click.stop="handlePrefixUpdate(item.id, em)"
                  >
                    {{ em }}
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- 슬랙 감성의 인라인 텍스트 입력창 -->
          <BaseInput
            :modelValue="item.label"
            field="category"
            variant="ghost"
            :size="3"
            hideCounter
            @blur="handleLabelUpdate(item.id, $event)"
            @keyup.enter="($event.target as HTMLInputElement).blur()"
          />

          <div class="action-zone">
            <BaseDeleteButton
              intent="delete"
              variant="circle"
              :size="2"
              class="reveal-btn"
              @click.stop="$emit('deleteItem', item.id)"
            />
          </div>
        </div>
      </div>

      <!-- 🌟 새 항목 추가 섹션 (다이어리 태그 추가 감성으로 분리) -->
      <div class="add-card" :class="{ 'is-disabled': isFull }">
        <div class="emoji-wrapper">
          <button
            class="emoji-btn dashed-btn"
            :disabled="isFull"
            @click.stop="!isFull && togglePicker('new')"
          >
            {{ newPrefix }}
          </button>

          <transition name="pop-bounce">
            <div
              v-if="activePickerId === 'new'"
              class="emoji-popover popover-up"
            >
              <div class="emoji-grid">
                <button
                  v-for="em in displayEmojiList"
                  :key="em"
                  class="emoji-item-btn"
                  @click.stop="selectNewPrefix(em)"
                >
                  {{ em }}
                </button>
              </div>
            </div>
          </transition>
        </div>

        <BaseInput
          v-model="newItemText"
          field="category"
          variant="ghost"
          :size="3"
          :placeholder="
            isFull ? '10개가 꽉 차서 더 이상 추가할 수 없어요' : addPlaceholder
          "
          :disabled="isFull"
          hideCounter
          @keyup.enter="handleAdd"
          @blur="handleAdd"
        />

        <!-- 슬랙 스타일 입력 힌트 아이콘 -->
        <BaseButton
          class="enter"
          :class="{ 'is-visible': newItemText.trim() && !isFull }"
          :size="2"
          @mousedown.prevent="handleAdd"
        >
          ↵
        </BaseButton>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@/global-components/global-modal/components/Modal.vue'
import BaseInput from '@/base-ui/BaseInput.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
// 🌟 props에 emojiList 추가
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    items: { id: string; label: string; prefix?: string }[]
    addPlaceholder: string
    maxCount?: number
    emojiList?: string[] // 👈 추가된 속성
  }>(),
  { maxCount: 10 }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updateItemLabel', id: string, newLabel: string): void
  (e: 'updateItemPrefix', id: string, newPrefix: string): void
  (e: 'deleteItem', id: string): void
  (e: 'addItem', newLabel: string, newPrefix: string): void
}>()

// 🌟 외부에서 이모지 리스트를 안 주면 사용할 기본값 설정
const DEFAULT_EMOJIS = ['📌', '🔥', '⭐', '💡', '🎨', '📚', '✅', '🛑']

const displayEmojiList = computed(() =>
  props.emojiList && props.emojiList.length > 0
    ? props.emojiList
    : DEFAULT_EMOJIS
)

const newItemText = ref('')
const newPrefix = ref('✨')
const activePickerId = ref<string | null>(null)

const isFull = computed(() => props.items.length >= props.maxCount)

const togglePicker = (id: string) => {
  activePickerId.value = activePickerId.value === id ? null : id
}

const handleLabelUpdate = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const newVal = target.value?.trim()
  if (!newVal) {
    target.value = props.items.find((i) => i.id === id)?.label || ''
    return
  }
  emit('updateItemLabel', id, newVal)
}

const handlePrefixUpdate = (id: string, em: string) => {
  emit('updateItemPrefix', id, em)
  activePickerId.value = null
}

const selectNewPrefix = (em: string) => {
  newPrefix.value = em
  activePickerId.value = null
}

const handleAdd = () => {
  const val = newItemText.value.trim()

  if (!val || isFull.value) return

  emit('addItem', val, newPrefix.value)
  newItemText.value = ''
  newPrefix.value = '✨'
  activePickerId.value = null // 추가 후 피커 닫기
}
</script>

<style scoped>
.modal-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 컴포넌트 간 간격을 넓혀 다이어리처럼 시원하게 */
  padding: 8px 4px;
}

/* =======================================
   🌟 1. 다이어리 감성의 헤더 & 배지
======================================= */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}
.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-icon {
  font-size: 16px;
}
.status-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.capacity-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-hover);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  transition: all 0.3s ease;
}
.capacity-pill.is-full {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
.capacity-pill .count {
  color: var(--text-main);
}
.capacity-pill.is-full .count {
  color: var(--color-danger);
}

/* =======================================
   🌟 2. iOS/Notion 스타일 리스트 카드
======================================= */
/* =======================================
   🌟 2. iOS/Notion 스타일 리스트 카드
======================================= */
.ios-list-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.02),
    0 2px 4px rgba(0, 0, 0, 0.02);
  /* overflow: hidden; 🚨 이 줄을 완전히 삭제하세요! */
}

/* 🌟 새롭게 추가: overflow:hidden을 지웠으므로 내부 행의 모서리를 직접 둥글게 처리 */
.list-row:first-child {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.list-row:last-child {
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  border-bottom: none;
}
.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  background: transparent;
  transition: background-color 0.2s ease;
}

.list-row:hover {
  background: var(--bg-hover); /* 슬랙처럼 마우스 오버 시에만 부드러운 배경색 */
}

/* =======================================
   🌟 3. 분리된 새 항목 추가 영역 (Add Card)
======================================= */
.add-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.015);
  border: 1px dashed var(--border-color); /* 다이어리 절취선/태그 느낌 */
  border-radius: 16px;
  transition: all 0.2s;
}
.add-card:focus-within {
  background: var(--bg-card);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-pale, rgba(67, 56, 202, 0.1));
}
.add-card.is-disabled {
  opacity: 0.5;
  pointer-events: none;
  background: var(--bg-hover);
  border-style: solid;
}

.enter {
  background-color: var(--color-primary);
}

.enter:hover {
  background-color: var(--color-primary) !important;
}
/* =======================================
   🌟 4. 입력창 & 아이콘 공통 (Slack 감성)
======================================= */
.emoji-wrapper {
  position: relative;
}

.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px; /* 애플 감성 R */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.emoji-btn:hover {
  transform: scale(1.05) translateY(-1px);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.dashed-btn {
  border: 1px dashed var(--text-muted);
  background: transparent;
  box-shadow: none;
}

/* =======================================
   🌟 5. 호버 삭제버튼
======================================= */
.action-zone {
  width: 32px;
  display: flex;
  justify-content: flex-end;
}
.reveal-btn {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-row:hover .reveal-btn {
  opacity: 1;
  transform: scale(1);
}
/* =======================================
   🌟 6. 이모지 팝오버 (왼쪽 정렬 & 내부 완벽 대칭 격자)
======================================= */
.picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.emoji-popover {
  position: absolute;
  top: 42px;
  left: 0; /* 💡 요청하신 대로 왼쪽 정렬로 원상복구 */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px; /* 상하좌우 동일하게 8px 내부 여백 부여 */
  z-index: 100;

  /* 💡 [내부 여백 완벽 대칭을 위한 수학적 계산]
     - 양쪽 패딩: 8px * 2 = 16px
     - 이모지 버튼 4개: 36px * 4 = 144px
     - 버튼 사이 간격(gap) 3개: 8px * 3 = 24px
     - 총합 = 정확히 '184px'로 설정하면 좌우 남는 공간 없이 딱 떨어집니다. */
  width: 184px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 추가 영역(하단)에서는 위로 깔끔하게 정렬 */
.popover-up {
  top: auto;
  bottom: 42px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px; /* 💡 내부 여백과 통일감을 주기 위해 간격도 8px로 일치 */
}

.emoji-item-btn {
  background: transparent;
  border: none;
  font-size: 20px;

  /* 💡 가로/세로 36px 정사각형 고정 및 패딩 제거로 쏠림 방지 */
  width: 36px;
  height: 36px;
  padding: 0;

  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.1s ease,
    background-color 0.1s ease;
}

.emoji-item-btn:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  transform: scale(1.1);
}

/* =======================================
   🌟 7. 애니메이션 (왼쪽 정렬 기준 트랜스폼)
======================================= */
.pop-bounce-enter-active {
  animation: bounce-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.pop-bounce-leave-active {
  animation: bounce-in 0.15s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    /* 💡 기존의 translateX(-50%)를 완전히 제거하여 왼쪽 정렬 유지 */
    transform: scale(0.95) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
