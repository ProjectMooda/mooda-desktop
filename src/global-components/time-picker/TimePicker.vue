<template>
  <div class="custom-time-picker" :class="{ 'is-empty': !timeObj.hasTime }">
    <div
      v-if="openDropdown"
      class="dropdown-overlay"
      @click.stop="openDropdown = null"
    ></div>

    <!-- 🌟 값이 없을 때 (미정 상태) -->
    <div v-if="!timeObj.hasTime" class="empty-state" @click="initTime">
      미정
    </div>

    <!-- 🌟 시간이 설정되었을 때 -->
    <template v-else>
      <button class="ampm-toggle" @click.stop="toggleAmPm">
        {{ timeObj.ampm }}
      </button>

      <div class="time-select-group">
        <div
          class="custom-select-box time-box"
          :class="{ 'is-active': openDropdown === 'hour' }"
          @click="openDropdown = 'hour'"
        >
          {{ String(timeObj.hour).padStart(2, '0') }}
          <ul
            v-if="openDropdown === 'hour'"
            class="dropdown-menu time-menu"
            @click.stop
          >
            <li
              v-for="h in 12"
              :key="h"
              :class="{ selected: timeObj.hour === h }"
              @click.stop="setTime('hour', h)"
            >
              {{ String(h).padStart(2, '0') }}
            </li>
          </ul>
        </div>

        <span class="colon">:</span>

        <div
          class="custom-select-box time-box"
          :class="{ 'is-active': openDropdown === 'minute' }"
          @click="openDropdown = 'minute'"
        >
          {{ String(timeObj.minute).padStart(2, '0') }}
          <ul
            v-if="openDropdown === 'minute'"
            class="dropdown-menu time-menu"
            @click.stop
          >
            <li
              v-for="m in [0, 10, 20, 30, 40, 50]"
              :key="m"
              :class="{ selected: timeObj.minute === m }"
              @click.stop="setTime('minute', m)"
            >
              {{ String(m).padStart(2, '0') }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 🌟 초기화(삭제) 버튼 추가 -->
      <button class="clear-btn" title="시간 초기화" @click.stop="clearTime">
        ✕
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const openDropdown = ref<'hour' | 'minute' | null>(null)

// 🌟 hasTime 속성 추가하여 '미정' 상태 구분
const timeObj = reactive({
  hasTime: false,
  ampm: '오전',
  hour: 9,
  minute: 0
})

const parseTime = (timeStr?: string) => {
  if (!timeStr) {
    return {
      hasTime: false,
      ampm: '오전',
      hour: 9,
      minute: 0
    }
  }

  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr, 10) || 9
  const minute = parseInt(mStr, 10) || 0
  let ampm = '오전'

  if (h >= 12) {
    ampm = '오후'
    if (h > 12) h -= 12
  } else if (h === 0) {
    h = 12
  }

  return {
    hasTime: true,
    ampm,
    hour: h,
    minute
  }
}

const emitTime = () => {
  if (!timeObj.hasTime) {
    emit('update:modelValue', '')
    return
  }

  let h = timeObj.hour

  if (timeObj.ampm === '오후' && h !== 12) {
    h += 12
  }
  if (timeObj.ampm === '오전' && h === 12) {
    h = 0
  }

  const timeStr =
    `${String(h).padStart(2, '0')}:` +
    `${String(timeObj.minute).padStart(2, '0')}`

  emit('update:modelValue', timeStr)
}

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(timeObj, parseTime(newVal))
  },
  { immediate: true }
)

// 🌟 '미정' 버튼 클릭 시 09:00으로 설정하며 입력 시작
const initTime = () => {
  timeObj.hasTime = true
  timeObj.ampm = '오전'
  timeObj.hour = 9
  timeObj.minute = 0
  emitTime()
}

// 🌟 '✕' 버튼 클릭 시 '미정'으로 초기화
const clearTime = () => {
  timeObj.hasTime = false
  emitTime() // '' (빈 문자열) 방출
}

const toggleAmPm = () => {
  timeObj.ampm = timeObj.ampm === '오전' ? '오후' : '오전'
  emitTime()
}

const setTime = (type: 'hour' | 'minute', val: number) => {
  timeObj[type] = val
  openDropdown.value = null
  emitTime()
}
</script>

<style scoped>
.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.custom-time-picker {
  display: flex;
  align-items: center;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-1-5, 6px) var(--space-2, 8px);
  flex: 1;
  gap: var(--space-2, 8px);
  position: relative;
  min-height: 36px; /* 버튼 높이에 맞춰서 고정 */
}

/* 🌟 미정 상태 텍스트 스타일 */
.empty-state {
  width: 100%;
  text-align: center;
  color: var(--text-muted, #9ca3af);
  font-size: var(--text-sm, 14px);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: color var(--transition-fast) ease;
}
.empty-state:hover {
  color: var(--color-primary, #3b82f6);
}

/* 🌟 초기화(삭제) 버튼 스타일 */
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  font-size: var(--text-xs, 12px);
  cursor: pointer;
  padding: 0 4px;
  margin-left: 2px;
  transition: color var(--transition-fast) ease;
  z-index: 95;
}
.clear-btn:hover {
  color: var(--text-danger, #ef4444);
}

/* 아래는 작성해주신 기존 코드 그대로입니다 */
.ampm-toggle {
  position: relative;
  z-index: 95;
  background: var(--color-primary-pale, #eff6ff);
  border: 1px solid var(--color-primary-light, #bfdbfe);
  padding: var(--space-1-5, 6px) var(--space-2-5, 10px);
  border-radius: var(--radius-sm);
  font-size: var(--text-xxs, 12px);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  flex-shrink: 0;
}
.ampm-toggle:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-muted);
}

.time-select-group {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  position: relative;
  z-index: 95;
}
.colon {
  font-size: var(--text-base, 15px);
  font-weight: var(--font-bold);
  color: var(--text-muted);
  padding-bottom: var(--space-0-5, 2px);
  margin: 0 var(--space-1, 4px);
}

.custom-select-box {
  position: relative;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  transition: all var(--transition-fast) ease;
}
.time-box {
  padding: var(--space-1, 4px) var(--space-2, 8px);
  min-width: 36px;
  border: 1px solid transparent;
}
.time-box:hover {
  background: var(--bg-hover);
}
.time-box.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-pale);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 12px);
  box-shadow: var(--shadow-md);
  max-height: 160px;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  list-style: none;
  padding: var(--space-1-5, 6px);
  margin: 0;
  z-index: 100;
  min-width: 50px;
  text-align: center;
}

.dropdown-menu li {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-size: var(--text-xs, 13px);
  color: var(--text-sub);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.dropdown-menu li:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
.dropdown-menu li.selected {
  background: var(--color-primary-pale);
  color: var(--color-primary);
  font-weight: var(--font-bold);
}
</style>
