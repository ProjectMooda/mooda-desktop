<template>
  <div
    class="base-time-picker w-full"
    :class="[
      `ui-size-${size}`,
      { 'is-empty': !timeObj.hasTime },
      { 'is-active': openDropdown !== null }
    ]"
  >
    <div
      v-if="openDropdown"
      class="dropdown-overlay"
      @click.stop="openDropdown = null"
    ></div>

    <div
      v-if="!timeObj.hasTime"
      class="empty-state flex-1 flex-center w-full"
      @click="initTime"
    >
      미정
    </div>

    <template v-else>
      <button class="ampm-toggle shrink-0" @click.stop="toggleAmPm">
        {{ timeObj.ampm }}
      </button>

      <div class="time-select-group flex-1 flex-center">
        <div
          class="time-box flex-center"
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

        <span class="colon flex-center shrink-0">:</span>

        <div
          class="time-box flex-center"
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

      <button
        class="clear-btn flex-center shrink-0"
        title="시간 초기화"
        @click.stop="clearTime"
      >
        ✕
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    size?: 1 | 2 | 3 | 4 | 5 // ✨ 1~5 스케일 연동
  }>(),
  {
    modelValue: '',
    size: 3 // 기본 크기 (Medium)
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const openDropdown = ref<'hour' | 'minute' | null>(null)

const timeObj = reactive({
  hasTime: false,
  ampm: '오전',
  hour: 9,
  minute: 0
})

const parseTime = (timeStr?: string) => {
  if (!timeStr) {
    return { hasTime: false, ampm: '오전', hour: 9, minute: 0 }
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

  return { hasTime: true, ampm, hour: h, minute }
}

const emitTime = () => {
  if (!timeObj.hasTime) {
    emit('update:modelValue', '')
    return
  }
  let h = timeObj.hour
  if (timeObj.ampm === '오후' && h !== 12) h += 12
  if (timeObj.ampm === '오전' && h === 12) h = 0

  const timeStr = `${String(h).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`
  emit('update:modelValue', timeStr)
}

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(timeObj, parseTime(newVal))
  },
  { immediate: true }
)

const initTime = () => {
  timeObj.hasTime = true
  timeObj.ampm = '오전'
  timeObj.hour = 9
  timeObj.minute = 0
  emitTime()
}

const clearTime = () => {
  timeObj.hasTime = false
  emitTime()
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
/* =======================================
   컨테이너 (BaseInput과 동일한 룩앤필)
======================================= */
.base-time-picker {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-1);
  position: relative;
  transition: all var(--transition-base);
  user-select: none;
}

/* 포커스 또는 드롭다운이 열렸을 때 BaseInput과 똑같이 파란 테두리 */
.base-time-picker.is-active,
.base-time-picker:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px var(--color-primary-light),
    var(--shadow-2);
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown); /* 전역 Z-Index 변수 활용 */
}

/* =======================================
   내부 컴포넌트들 (ui-size-N의 폰트/패딩 비율을 따라감)
======================================= */
.empty-state {
  color: var(--text-muted);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.empty-state:hover {
  color: var(--color-primary);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 var(--space-1);
  font-size: 0.8em; /* 부모(ui-size-N) 폰트 대비 80% 크기 유지 */
  transition: all var(--transition-fast);
}
.clear-btn:hover {
  color: var(--color-danger);
  transform: scale(1.1); /* XButton 텐션 */
}

/* 오전/오후 토글 버튼 */
.ampm-toggle {
  background: var(--color-primary-pale);
  border: 1px solid var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: 0.85em;
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ampm-toggle:hover {
  background: var(--color-primary-light);
}

/* 시간, 분 박스 */
.time-box {
  position: relative;
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-weight: var(--font-bold);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}
.time-box:hover {
  background: var(--bg-hover);
}
.time-box.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-pale);
  color: var(--color-primary);
}

.colon {
  font-weight: var(--font-bold);
  color: var(--text-muted);
}

/* =======================================
   드롭다운 메뉴
======================================= */
.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 50%;
  transform: translateX(-50%);

  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-3);

  max-height: 160px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  padding: var(--space-1);
  margin: 0;
  z-index: calc(var(--z-dropdown) + 1); /* 오버레이보다 한 칸 위 */
  min-width: 56px;
}

.dropdown-menu li {
  padding: var(--space-2) var(--space-3);
  font-size: 0.9em;
  color: var(--text-sub);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
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
