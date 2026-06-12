<template>
  <div class="custom-select-wrapper w-full" ref="selectRef">
    <button
      type="button"
      :class="[
        'base-select-trigger w-full flex-center justify-between',
        `ui-size-${size}`
      ]"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span class="truncate text-main">
        {{ selectedLabel }}
      </span>
      <svg
        class="chevron shrink-0"
        :class="{ 'is-open': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-sub)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <Transition name="dropdown">
      <ul v-if="isOpen" class="custom-dropdown shadow-2 w-full">
        <li
          v-for="option in options"
          :key="String(option.value)"
          :class="[
            'option-item',
            { 'is-selected': modelValue === option.value }
          ]"
          @click="handleSelect(option.value)"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  label: string
  value: string | number | null
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined
    options: SelectOption[]
    size?: 1 | 2 | 3 | 4 | 5
    disabled?: boolean
  }>(),
  {
    size: 3,
    disabled: false
  }
)

const emit = defineEmits(['update:modelValue'])

// 상태 관리
const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

// 선택된 라벨 찾기 (없으면 기본 텍스트)
const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected ? selected.label : '선택해주세요'
})

// 열기/닫기 토글
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// 옵션 선택 시 값 업데이트 및 닫기
const handleSelect = (value: string | number | null) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

// ✨ 드롭다운 외부 영역 클릭 시 닫기 로직
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  font-family: inherit;
}

/* =======================================
   1. 트리거 (버튼) 스타일
======================================= */
.base-select-trigger {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  text-align: left;
}

.base-select-trigger:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.base-select-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-app);
}

/* 텍스트 말줄임표 처리 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 화살표 아이콘 및 회전 애니메이션 */
.chevron {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-base);
}
.chevron.is-open {
  transform: rotate(180deg);
}

/* =======================================
   2. 드롭다운 리스트 스타일
======================================= */
.custom-dropdown {
  position: absolute;
  top: calc(100% + var(--space-1)); /* 버튼 바로 아래 + 4px 여백 */
  left: 0;
  z-index: var(--z-dropdown);

  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);

  max-height: 240px;
  overflow-y: auto;

  /* 리스트 기본 스타일 초기화 */
  margin: 0;
  padding: var(--space-1);
  list-style: none;
}

/* 드롭다운 스크롤바 디자인 */
.custom-dropdown::-webkit-scrollbar {
  width: 6px;
}
.custom-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-xl);
}

/* 개별 옵션 아이템 */
.option-item {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.option-item:hover {
  background-color: var(--bg-hover);
}

.option-item.is-selected {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

/* =======================================
   3. 트랜지션 (스르륵 나타나기)
======================================= */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px); /* 살짝 위에서 아래로 떨어지는 효과 */
}
</style>
