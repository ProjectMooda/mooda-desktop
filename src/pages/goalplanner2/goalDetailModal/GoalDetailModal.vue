<template>
  <BaseModal 
    title="목표 상세 설정" 
    width="900px" 
    height="680px" 
    @close="$emit('close')"
  >
    <div class="modal-body">
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

        <div class="progress-section">
          <div class="progress-header">
            <label>진행률</label>
            <span class="pct-text">{{ calculateProgress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: calculateProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="ms-section">
        <div class="ms-header-row">
          <label>세부 일정 (Milestones)</label>
          <span class="ms-count">총 {{ goal.milestones?.length || 0 }}개</span>
        </div>

        <div class="add-ms-row">
          <input type="date" v-model="goal.newMilestoneDate" class="s-input date-input shrink-0" />
          <input 
            type="text" 
            v-model="goal.newMilestoneText" 
            placeholder="새로운 일정 추가 후 엔터..." 
            class="s-input flex-1"
            @keyup.enter="addMilestone" 
          />
          <button @click="addMilestone" class="btn-primary shrink-0">추가</button>
        </div>

        <div class="ms-list-container">
          <div 
            v-for="ms in goal.milestones" 
            :key="ms.id" 
            class="ms-card"
            :class="{ 'is-editing': editingId === ms.id }"
          >
            <div class="ms-summary" @click="toggleEdit(ms.id)">
              <label class="cbx-wrap shrink-0" @click.stop>
                <input type="checkbox" v-model="ms.done" @change="store.saveData" />
                <span class="cbx-custom"></span>
              </label>

              <div class="ms-color-bar" :style="{ backgroundColor: ms.color || '#d4d4d8' }"></div>
              
              <div class="ms-content min-w-0">
                <div class="ms-meta">
                  <span class="ms-date">{{ ms.date.slice(5).replace('-', '/') }}</span>
                  <span v-if="ms.category" class="ms-badge category-badge">{{ ms.category }}</span>
                  <span v-if="ms.priority" class="ms-badge" :class="'priority-' + ms.priority">{{ ms.priority }}</span>
                </div>
                <div class="ms-title" :class="{ 'is-done': ms.done }">{{ ms.text }}</div>
              </div>

              <div class="ms-actions shrink-0">
                <button class="icon-btn edit-btn">{{ editingId === ms.id ? '▲' : '▼' }}</button>
              </div>
            </div>

            <div class="ms-editor" v-if="editingId === ms.id">
              <div class="editor-grid">
                <div class="edit-group">
                  <label>색상</label>
                  <div class="color-picker">
                    <button 
                      v-for="color in palette" :key="color"
                      class="color-swatch"
                      :style="{ backgroundColor: color }"
                      :class="{ active: ms.color === color }"
                      @click="ms.color = color; store.saveData()"
                    ></button>
                  </div>
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
                <label>상세 메모</label>
                <textarea 
                  v-model="ms.description" 
                  class="s-textarea" 
                  placeholder="세부적인 계획이나 참고사항을 적어주세요..."
                  @change="store.saveData"
                ></textarea>
              </div>

              <div class="editor-actions">
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
import { useScheduleStore } from '@/store/useScheduleStore'
import BaseModal from '@/components/modal/BaseModal.vue'

const props = defineProps<{ goal: any }>()
const emit = defineEmits(['close'])
const store = useScheduleStore()

// --- UI 상태 및 옵션 ---
const editingId = ref<number | null>(null)
const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#71717a']
const categories = ['기획', '디자인', '개발', '마케팅', '개인일정', '기타']

// 아코디언 토글
const toggleEdit = (id: number) => {
  editingId.value = editingId.value === id ? null : id
}

// 진행률 계산
const calculateProgress = computed(() => {
  if (!props.goal.milestones || props.goal.milestones.length === 0) return 0
  return Math.round((props.goal.milestones.filter((m: any) => m.done).length / props.goal.milestones.length) * 100)
})

// 마일스톤 추가 (기본 색상과 함께 추가)
const addMilestone = () => {
  if (!props.goal.newMilestoneText) return
  props.goal.milestones.push({
    id: Date.now(),
    date: props.goal.newMilestoneDate || store.selectedDate,
    text: props.goal.newMilestoneText,
    done: false,
    color: '#3b82f6' // 기본색상 (파란색)
  })
  props.goal.milestones.sort((a: any, b: any) => a.date.localeCompare(b.date))
  props.goal.newMilestoneText = ''
  store.saveData()
}

// 삭제
const removeMilestone = (msId: number) => {
  const idx = props.goal.milestones.findIndex((m: any) => m.id === msId)
  if (idx > -1) {
    props.goal.milestones.splice(idx, 1)
    store.saveData()
  }
}
</script>

<style scoped>
/* 1. 기본 레이아웃 */
.modal-body { display: flex; height: 100%; gap: 32px; background: #fafafa; }
.info-section { flex: 0 0 300px; display: flex; flex-direction: column; gap: 28px; padding: 32px; background: #fff; border-right: 1px solid #f4f4f5; }
.ms-section { flex: 1; display: flex; flex-direction: column; gap: 20px; padding: 32px 32px 32px 0; min-width: 0; }

/* 2. 공통 요소 */
.form-group label { display: block; font-size: 13px; font-weight: 700; color: #52525b; margin-bottom: 8px; }
.s-input, .s-select, .s-textarea { width: 100%; padding: 12px 14px; border: 1px solid #e4e4e7; border-radius: 10px; background: #fff; font-size: 14px; outline: none; transition: 0.2s; color: #27272a; }
.s-input:focus, .s-select:focus, .s-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.s-textarea { resize: vertical; min-height: 80px; }
.title-input { font-size: 16px; font-weight: 700; padding: 14px 16px; }
.date-row { display: flex; align-items: center; gap: 8px; }
.date-dash { color: #a1a1aa; font-weight: 600; }
.btn-primary { background: #4f46e5; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; }
.btn-primary:hover { background: #4338ca; }
.btn-secondary { background: #f4f4f5; color: #3f3f46; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-secondary:hover { background: #e4e4e7; }
.btn-text-danger { background: transparent; color: #ef4444; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 8px; }
.btn-text-danger:hover { text-decoration: underline; }

/* 3. 진행률 바 */
.progress-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.progress-header label { font-size: 13px; font-weight: 700; color: #52525b; margin: 0; }
.pct-text { font-size: 24px; font-weight: 800; color: #4f46e5; line-height: 1; }
.progress-track { height: 12px; background: #f4f4f5; border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 6px; }

/* 4. 마일스톤 리스트 영역 */
.ms-header-row { display: flex; justify-content: space-between; align-items: center; }
.ms-header-row label { font-size: 16px; font-weight: 800; color: #27272a; margin: 0; }
.ms-count { font-size: 13px; font-weight: 600; color: #71717a; background: #f4f4f5; padding: 4px 10px; border-radius: 20px; }
.add-ms-row { display: flex; gap: 8px; margin-bottom: 8px; }
.date-input { width: 140px; }
.ms-list-container { flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px; }

/* 5. 마일스톤 카드 (아코디언) */
.ms-card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; transition: 0.2s; }
.ms-card:hover { border-color: #d4d4d8; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
.ms-card.is-editing { border-color: #6366f1; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08); }

/* 요약 뷰 */
.ms-summary { display: flex; align-items: center; padding: 14px 16px; gap: 14px; cursor: pointer; user-select: none; }
.ms-color-bar { width: 4px; height: 32px; border-radius: 2px; }
.ms-content { display: flex; flex-direction: column; gap: 4px; }
.ms-meta { display: flex; align-items: center; gap: 8px; }
.ms-date { font-size: 12px; font-weight: 700; color: #71717a; }
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
.cbx-wrap input:checked ~ .cbx-custom { background: #4f46e5; border-color: #4f46e5; }
.cbx-custom:after { content: ''; position: absolute; display: none; left: 5px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.cbx-wrap input:checked ~ .cbx-custom:after { display: block; }

/* 확장 에디터 뷰 */
.ms-editor { padding: 20px 24px; background: #fafafa; border-top: 1px solid #e4e4e7; }
.editor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.edit-group label { display: block; font-size: 12px; font-weight: 700; color: #71717a; margin-bottom: 8px; }
.color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.color-swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: 0.2s; }
.color-swatch:hover { transform: scale(1.1); }
.color-swatch.active { outline: 2px solid #27272a; outline-offset: 2px; }
.mt-16 { margin-top: 16px; }
.editor-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #d4d4d8; }
</style>