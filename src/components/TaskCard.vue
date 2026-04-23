<template>
  <section class="studio-card task-section">
    <div class="card-head">
      <h3>{{ formattedDate }} Schedule</h3>
      <button @click="scheduleStore.addTask" class="btn-add">+</button>
    </div>

    <div class="task-scroll-area">
      <div
        v-if="
          !scheduleStore.currentTasks?.length &&
          !scheduleStore.currentMilestones?.length
        "
        class="empty-msg"
      >
        일정이 없습니다. 새로운 일정을 추가해보세요!
      </div>

      <div class="task-group" v-else>
        <div
          v-for="item in scheduleStore.currentMilestones"
          :key="'ms-' + item.ms.id"
          class="task-item milestone-item"
        >
          <input
            type="checkbox"
            v-model="item.ms.done"
            @change="scheduleStore.saveData"
          />
          <div class="task-input-container">
            <span class="milestone-badge">{{ item.goalTitle }}</span>
            <div class="task-display" :class="{ 'is-done': item.ms.done }">
              {{ item.ms.text }}
            </div>
          </div>
        </div>

        <div
          v-for="task in scheduleStore.currentTasks"
          :key="'task-' + task.id"
          class="task-item"
        >
          <input
            type="checkbox"
            v-model="task.done"
            @change="scheduleStore.saveData"
          />

          <div class="task-input-container">
            <div class="task-display" :class="{ 'is-done': task.done }">
              {{ task.text || '내용을 입력하세요...' }}
            </div>

            <textarea
              class="task-textarea"
              v-model="task.text"
              @change="scheduleStore.saveData"
              placeholder="내용을 입력하세요..."
            ></textarea>
          </div>

          <button class="btn-del" @click="scheduleStore.removeTask(task.id)">
            ✕
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore } from '@/store/useScheduleStore'

const scheduleStore = useScheduleStore()

const formattedDate = computed(() => {
  const full = scheduleStore.selectedDate
  if (!full) return ''

  // 방어 로직: 날짜 형식이 맞는지 확인 (YYYY-MM-DD)
  const parts = full.split('-')
  if (parts.length === 3) {
    return `${parts[1]}.${parts[2]}` // MM.DD
  }
  return full // 형식이 다르면 원본 출력
})
</script>
<style scoped>
/* --- 기존 .milestone-item 스타일을 아래로 교체 --- */
.milestone-item {
  /* 카드 형태로 변경 */
  background-color: var(--color-primary-pale); /* 연하고 세련된 블루 배경 */
  border-radius: 12px; /* 둥근 모서리 */
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent); /* 배경보다 살짝 진한 테두리 */

  /* 미세하고 부드러운 그림자 (입체감) */
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);

  /* 간격 및 패딩 최적화 */
  margin-bottom: 10px; /* 항목 간 간격 */
  padding: 16px 20px;

  /* 정렬 미세 조정 */
  display: flex;
  align-items: flex-start; /* 상단 정렬 */
  gap: 16px; /* 내부 요소 간격 확대 */

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.milestone-item:hover {
  /* 호버 시 살짝 들리고 그림자가 진해지는 효과 (최신 트렌드) */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.1);
}

/* 마일스톤 체크박스 정렬 조정 */
.milestone-item input[type='checkbox'] {
  margin-top: 2px;
}

/* --- 기존 .milestone-badge 스타일을 아래로 교체 --- */
.milestone-badge {
  /* 글꼴 및 크기 최적화 */
  font-size: 10px;
  text-transform: uppercase; /* 대문자로 변환 (예쁨) */
  letter-spacing: 0.7px; /* 자간을 넓혀 세련되게 */
  font-weight: 700;

  /* 색상 및 배경 (소프트 그라데이션) */
  color: #ffffff; /* 흰색 글자 */
  background: linear-gradient(
    135deg,
    #60a5fa,
    #3b82f6
  ); /* 부드러운 그라데이션 */

  /* 완벽한 캡슐 모양 (Pill style) */
  padding: 3px 10px;
  border-radius: 100px;

  border: none;

  /* 미세한 빛 효과 */
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);

  display: inline-flex;
  align-items: center;
  margin-bottom: 8px; /* 텍스트와의 간격 */
}

.studio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-head h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
/* 4. Task 영역 (독립 스크롤) */
.btn-add {
  background: var(--text-main);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}
.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg-hover);
}
.task-input-container,
.task-text-wrap {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.task-textarea {
  position: absolute;
  inset: 0;
  opacity: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  resize: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: transparent;
  padding: 4px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
}
.task-textarea:focus {
  opacity: 1;
  color: var(--text-main);
  z-index: 10;
  height: auto;
  min-height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.task-display,
.text-display {
  font-size: 14px;
  color: #27272a;
  line-height: 1.5;
  padding: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  white-space: pre-wrap;
}
.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}
.btn-del {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 16px;
  cursor: pointer;
  opacity: 0;
  transition: 0.2s;
  padding-top: 2px;
}
.task-item:hover .btn-del,
.btn-del-sm {
  opacity: 1;
}
.empty-msg {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
}
</style>
