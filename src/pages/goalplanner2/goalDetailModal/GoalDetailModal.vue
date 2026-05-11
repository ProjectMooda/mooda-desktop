<template>
  <BaseModal 
    title="목표 상세 설정" 
    width="900px" 
    height="680px" 
    @close="$emit('close')"
  >
    <div class="modal-body">
      <!-- 목표 기본 정보 -->
      <div class="info-section">
        <div class="form-group">
          <label>목표 타이틀</label>
          <input type="text" v-model="goal.title" class="s-input title-input" @change="store.saveData" />
        </div>
        
        <div class="form-group">
          <label>목표 기간</label>
          <div class="date-row">
            <input type="date" v-model="goal.startDate" class="s-input flex-1" @change="store.saveData" />
            <span class="date-dash">~</span>
            <input type="date" v-model="goal.endDate" class="s-input flex-1" @change="store.saveData" />
          </div>
        </div>

        <div class="form-group">
          <label>테마 색상</label>
          <div class="color-picker">
            <button 
              v-for="color in palette" :key="color"
              class="color-swatch"
              :style="{ backgroundColor: color }"
              :class="{ active: (goal.color || '#3b82f6') === color }"
              @click="goal.color = color; store.saveData()"
            ></button>
          </div>
        </div>

        <div class="progress-section mt-auto">
          <div class="progress-header">
            <label>진행률</label>
            <span class="pct-text" :style="{ color: goal.color || '#4f46e5' }">{{ calculateProgress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: calculateProgress + '%', backgroundColor: goal.color || '#4f46e5' }"></div>
          </div>
        </div>
      </div>

      <!-- 세부 일정 (마일스톤) -->
      <div class="ms-section">
        <div class="ms-header-row">
          <label>세부 일정 (Milestones)</label>
          <span class="ms-count">총 {{ goalSchedules.length }}개</span>
        </div>

        <!-- 🚨 로컬 상태(newMsDate, newMsSummary)를 사용하도록 변경 -->
        <div class="add-ms-row">
          <input type="date" v-model="newMsDate" class="s-input date-input shrink-0" />
          <input 
            type="text" 
            v-model="newMsSummary" 
            placeholder="새로운 일정 추가 후 엔터..." 
            class="s-input flex-1"
            @keyup.enter="addMilestone" 
          />
          <button @click="addMilestone" class="btn-primary shrink-0" :style="{ backgroundColor: goal.color || '#4f46e5' }">추가</button>
        </div>

        <div class="ms-list-container">
          <!-- 🚨 스토어에서 필터링해온 goalSchedules를 순회 -->
          <div 
            v-for="ms in goalSchedules" 
            :key="ms.id" 
            class="ms-card"
            :class="{ 'is-editing': editingId === ms.id }"
            :style="{ borderColor: editingId === ms.id ? (goal.color || '#6366f1') : '' }"
          >
            <div class="ms-summary" @click="toggleEdit(ms.id)">
              <label class="cbx-wrap shrink-0" @click.stop>
                <input type="checkbox" v-model="ms.done" @change="store.saveData" />
                <span class="cbx-custom" :style="ms.done ? { backgroundColor: goal.color || '#4f46e5', borderColor: goal.color || '#4f46e5' } : {}"></span>
              </label>

              <div class="ms-color-bar" :style="{ backgroundColor: goal.color || '#3b82f6' }"></div>
              
              <div class="ms-content min-w-0">
                <div class="ms-meta">
                  <!-- 🚨 ms.startDate 로 변경 -->
                  <span class="ms-date">{{ (ms.startDate || '').slice(5).replace('-', '/') }}</span>
                  <span v-if="ms.startTime || ms.endTime" class="ms-time">
                    🕒 {{ ms.startTime || '미정' }} ~ {{ ms.endTime || '미정' }}
                  </span>
                  <span v-if="ms.category" class="ms-badge category-badge">{{ ms.category }}</span>
                  <span v-if="ms.priority" class="ms-badge" :class="'priority-' + ms.priority">{{ ms.priority }}</span>
                </div>
                <!-- 🚨 ms.summary 로 변경 -->
                <div class="ms-title" :class="{ 'is-done': ms.done }">{{ ms.summary }}</div>
              </div>

              <div class="ms-actions shrink-0">
                <button class="icon-btn edit-btn">{{ editingId === ms.id ? '▲' : '▼' }}</button>
              </div>
            </div>

            <div class="ms-editor" v-if="editingId === ms.id" @click.stop>
              <div class="editor-grid">

                <div class="edit-group span-full">
                  <div class="memo-header">
                    <label>한줄 요약</label>
                    <button v-if="editingSummaryId !== ms.id" @click="editingSummaryId = ms.id" class="btn-text-small">
                      ✏️ 수정
                    </button>
                    <button v-else @click="saveField()" class="btn-text-small active">
                      ✅ 완료
                    </button>
                  </div>

                  <div 
                    v-if="editingSummaryId !== ms.id" 
                    class="memo-display single-line" 
                    :class="{ 'empty': !ms.summary }"
                  >
                    {{ ms.summary || '한줄 요약이 없습니다. 수정을 눌러 추가해보세요.' }}
                  </div>

                  <input 
                    v-else
                    type="text" 
                    v-model="ms.summary" 
                    class="s-input" 
                    placeholder="핵심 요약을 한 줄로 적어주세요..."
                    autofocus
                    @keyup.enter="saveField()"
                  />
                </div>

                <div class="edit-group">
                  <label>카테고리</label>
                  <select v-model="ms.category" class="s-select" @change="store.saveData">
                    <option value="">선택 안함</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>

                <div class="edit-group">
                  <label>중요도</label>
                  <select v-model="ms.priority" class="s-select" @change="store.saveData">
                    <option value="">보통</option>
                    <option value="High">🔥 높음</option>
                    <option value="Medium">⭐ 중간</option>
                    <option value="Low">💧 낮음</option>
                  </select>
                </div>
              </div>

              <div class="edit-group mt-16">
                <div class="memo-header">
                  <label>상세 메모</label>
                  <button v-if="editingMemoId !== ms.id" @click="editingMemoId = ms.id" class="btn-text-small">
                    ✏️ 수정
                  </button>
                  <button v-else @click="saveField()" class="btn-text-small active">
                    ✅ 완료
                  </button>
                </div>

                <div 
                  v-if="editingMemoId !== ms.id" 
                  class="memo-display" 
                  :class="{ 'empty': !ms.memo }"
                >
                  <!-- 🚨 ms.memo 로 변경 -->
                  {{ ms.memo || '작성된 메모가 없습니다. 수정을 눌러 추가해보세요.' }}
                </div>

                <textarea 
                  v-else
                  v-model="ms.memo" 
                  class="s-textarea memo-textarea" 
                  placeholder="세부적인 계획이나 참고사항을 적어주세요..."
                  autofocus
                ></textarea>
              </div>

              <div class="editor-actions">
                <!-- 🚨 삭제 로직 변경 -->
                <button @click="removeMilestone(ms.id)" class="btn-text-danger">이 일정 삭제</button>
                <button @click="editingId = null" class="btn-secondary">닫기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore, type Goal } from '@/stores/useScheduleStore'
import BaseModal from '@/global-components/modal/BaseModal.vue'

// 🚨 any 제거 및 Goal 타입 부여
const props = defineProps<{ goal: Goal }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

// --- UI 상태 ---
const editingId = ref<number | null>(null)
const editingMemoId = ref<number | null>(null)
const editingSummaryId = ref<number | null>(null)

// 새로운 마일스톤 입력을 위한 로컬 상태 (더 이상 goal 객체에 섞이지 않습니다)
const newMsDate = ref(store.selectedDate)
const newMsSummary = ref('')

const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#71717a']
const categories = ['기획', '디자인', '개발', '마케팅', '개인일정', '기타']

// 🚨 핵심 포인트: 현재 목표에 해당하는 일정만 스토어에서 필터링해서 가져옴
const goalSchedules = computed(() => {
  return store.schedules.filter(s => s.goalId === props.goal.id)
})

const toggleEdit = (id: number) => {
  editingId.value = editingId.value === id ? null : id
  editingMemoId.value = null
  editingSummaryId.value = null
}

// 진행률 계산 로직 변경
const calculateProgress = computed(() => {
  if (goalSchedules.value.length === 0) return 0
  const completed = goalSchedules.value.filter(m => m.done).length
  return Math.round((completed / goalSchedules.value.length) * 100)
})

// 마일스톤 추가 방식 스토어에 맞게 변경
const addMilestone = () => {
  if (!newMsSummary.value.trim()) return
  
  // ✨ 헬퍼 함수 호출 (객체 껍데기 없이 핵심 파라미터만 전달)
  store.addMilestone(props.goal.id, newMsSummary.value, newMsDate.value)
  
  newMsSummary.value = ''
}


const saveField = () => {
  editingSummaryId.value = null
  editingMemoId.value = null
  store.saveData()
}

// splice 대신 스토어의 remove 액션 사용
const removeMilestone = (msId: number) => {
  store.removeSchedule(msId)
}
</script>

<style scoped>
/* 1. 기본 레이아웃 */
.modal-body { display: flex; height: 100%; gap: 32px; background: #fafafa; overflow: hidden;}
.info-section { flex: 0 0 300px; display: flex; flex-direction: column; gap: 28px; padding: 32px; background: #fff; border-right: 1px solid #f4f4f5; }
.ms-section { flex: 1; display: flex; flex-direction: column; gap: 20px; padding: 32px 32px 32px 0; min-width: 0; min-height: 0;}

/* 2. 공통 요소 */
.form-group label { display: block; font-size: 13px; font-weight: 700; color: #52525b; margin-bottom: 8px; }
.s-input, .s-select, .s-textarea { width: 100%; padding: 12px 14px; border: 1px solid #e4e4e7; border-radius: 10px; background: #fff; font-size: 14px; outline: none; transition: 0.2s; color: #27272a; }
.s-input:focus, .s-select:focus, .s-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.title-input { font-size: 16px; font-weight: 700; padding: 14px 16px; }
.date-row { display: flex; align-items: center; gap: 8px; }
.date-dash { color: #a1a1aa; font-weight: 600; }
.mt-auto { margin-top: auto; }

/* 버튼 공통 */
.btn-primary { color: #fff; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; }
.btn-primary:hover { filter: brightness(0.9); }
.btn-secondary { background: #f4f4f5; color: #3f3f46; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-secondary:hover { background: #e4e4e7; }
.btn-text-danger { background: transparent; color: #ef4444; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 8px; }
.btn-text-danger:hover { text-decoration: underline; }

/* 3. 색상 선택기 (목표 단위) */
.color-picker { display: flex; gap: 10px; flex-wrap: wrap; }
.color-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: 0.2s; }
.color-swatch:hover { transform: scale(1.1); }
.color-swatch.active { outline: 2px solid #27272a; outline-offset: 2px; }

/* 4. 진행률 바 */
.progress-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.progress-header label { font-size: 13px; font-weight: 700; color: #52525b; margin: 0; }
.pct-text { font-size: 24px; font-weight: 800; line-height: 1; }
.progress-track { height: 12px; background: #f4f4f5; border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 6px; }

/* 5. 마일스톤 리스트 영역 */
.ms-header-row { display: flex; justify-content: space-between; align-items: center; }
.ms-header-row label { font-size: 16px; font-weight: 800; color: #27272a; margin: 0; }
.ms-count { font-size: 13px; font-weight: 600; color: #71717a; background: #f4f4f5; padding: 4px 10px; border-radius: 20px; }
.add-ms-row { display: flex; gap: 8px; margin-bottom: 8px; }
.date-input { width: 140px; }
.ms-list-container { flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }

/* 6. 마일스톤 카드 */
.ms-card { flex-shrink: 0; background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; transition: max-height 0.2s; max-height: 80px; }
.ms-card:hover { border-color: #d4d4d8; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
.ms-card.is-editing { max-height: 600px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }

/* 요약 뷰 */
.ms-summary { display: flex; align-items: center; padding: 14px 16px; gap: 14px; cursor: pointer; user-select: none; }
.ms-color-bar { width: 4px; height: 32px; border-radius: 2px; }
.ms-content { display: flex; flex-direction: column; gap: 4px; }
.ms-meta { display: flex; align-items: center; gap: 8px; }
.ms-date { font-size: 12px; font-weight: 700; color: #71717a; }
.ms-time { font-size: 12px; font-weight: 600; color: #a1a1aa; }
.ms-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.category-badge { background: #f4f4f5; color: #52525b; border: 1px solid #e4e4e7; }
.priority-High { background: #fee2e2; color: #ef4444; }
.priority-Medium { background: #fef3c7; color: #d97706; }
.priority-Low { background: #e0f2fe; color: #0284c7; }
.ms-title { font-size: 15px; font-weight: 600; color: #27272a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ms-title.is-done { text-decoration: line-through; color: #a1a1aa; }
.icon-btn { background: #f4f4f5; border: none; width: 28px; height: 28px; border-radius: 6px; color: #71717a; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.ms-card:hover .icon-btn { background: #e4e4e7; color: #27272a; }

/* 커스텀 체크박스 */
.cbx-wrap { position: relative; width: 20px; height: 20px; cursor: pointer; }
.cbx-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
.cbx-custom { position: absolute; inset: 0; border: 2px solid #d4d4d8; border-radius: 6px; transition: 0.2s; }
.cbx-custom:after { content: ''; position: absolute; display: none; left: 5px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.cbx-wrap input:checked ~ .cbx-custom:after { display: block; }

/* 7. 확장 에디터 뷰 */
.ms-editor { padding: 20px 24px; background: #fafafa; border-top: 1px solid #e4e4e7; }
.editor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.edit-group label { display: block; font-size: 12px; font-weight: 700; color: #71717a; margin-bottom: 8px; }
.span-full { grid-column: 1 / -1; }

/* 시간, 메모 뷰 */
.mt-16 { margin-top: 16px; }

.memo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.memo-header label { margin-bottom: 0; }
.btn-text-small { background: none; border: none; font-size: 12px; font-weight: 600; color: #71717a; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: 0.2s; }
.btn-text-small:hover { background: #e4e4e7; color: #27272a; }
.btn-text-small.active { color: #22c55e; }

/* 클릭 이벤트가 제거되었으므로 cursor 속성을 제거하여 일반 텍스트 뷰처럼 작동하게 함 */
.memo-display { background: #fff; border: 1px solid #e4e4e7; padding: 14px; border-radius: 10px; font-size: 14px; color: #3f3f46; min-height: 60px; white-space: pre-wrap; line-height: 1.5; transition: 0.2s; }
.memo-display:hover { border-color: #d4d4d8; background: #fefefe; }
.memo-display.empty { color: #a1a1aa; font-style: italic; }

/* 한줄 요약을 위한 뷰어 스타일 */
.memo-display.single-line { min-height: auto; padding: 12px 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.memo-textarea { resize: vertical; min-height: 100px; }

.editor-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #d4d4d8; }
</style>