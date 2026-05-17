<template>
  <div class="custom-time-picker">
    <div
      v-if="openDropdown"
      class="dropdown-overlay"
      @click.stop="openDropdown = null"
    ></div>

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

const timeObj = reactive({
  ampm: '오전',
  hour: 9,
  minute: 0
})

const parseTime = (timeStr?: string) => {
  if (!timeStr) {
    return {
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

    if (h > 12) {
      h -= 12
    }
  } else if (h === 0) {
    h = 12
  }

  return {
    ampm,
    hour: h,
    minute
  }
}

const emitTime = () => {
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
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  padding: 6px 8px;
  flex: 1;
  gap: 8px;
  position: relative;
}

/* 🎯 z-index 우선순위를 오버레이(90)보다 높게(95) 명시적으로 설정 */
.ampm-toggle {
  position: relative;
  z-index: 95;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.ampm-toggle:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* 🎯 z-index 우선순위 수정 및 position 추가 */
.time-select-group {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  position: relative;
  z-index: 95;
}
.colon {
  font-size: 15px;
  font-weight: 800;
  color: #a1a1aa;
  padding-bottom: 2px;
  margin: 0 4px;
}

.custom-select-box {
  position: relative;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  transition: all 0.2s ease;
}
.time-box {
  padding: 4px 8px;
  min-width: 36px;
  border: 1px solid transparent;
}
.time-box:hover {
  background: #f4f4f5;
}
.time-box.is-active {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* 🎯 pointer-events와 overscroll-behavior 추가로 스크롤 안정성 확보 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-height: 160px;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  list-style: none;
  padding: 6px;
  margin: 0;
  z-index: 100;
  min-width: 50px;
  text-align: center;
}

.dropdown-menu li {
  padding: 8px 12px;
  font-size: 13px;
  color: #3f3f46;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-menu li:hover {
  background: #f4f4f5;
  color: #18181b;
}
.dropdown-menu li.selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
}
</style>
