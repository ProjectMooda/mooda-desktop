<template>
  <div class="panel-content">
    <div class="panel-header">
      <span class="panel-title">🔗 로컬 파일 링커</span>
      <span class="panel-action" @click="openAddModal">+ 추가</span>
    </div>

    <div class="link-scroll-area">
      <div v-if="localLinks.length === 0" class="empty-state">
        등록된 링크가 없습니다.
      </div>

      <draggable
        v-else
        v-model="localLinks"
        item-key="id"
        handle=".drag-handle"
        ghost-class="drag-ghost"
        tag="ul"
        class="item-list"
      >
        <template #item="{ element: link }">
          <li class="list-item">
            <i class="ti ti-grip-vertical drag-handle"></i>
            <div class="item-body" @click="openLocalFile(link.path)">
              <i
                :class="link.isFolder ? 'ti ti-folder' : 'ti ti-file'"
                class="item-icon"
              ></i>
              <div class="item-content">
                <div class="item-name">{{ link.name }}</div>
                <div class="item-path">{{ link.path }}</div>
              </div>
            </div>
            <div class="item-actions">
              <BaseButton
                class="action-btn"
                @click.stop="openEditModal(link)"
                :size="1"
                style="margin-right: 4px"
              >
                수정
              </BaseButton>
              <BaseDeleteButton
                intent="delete"
                :size="1"
                @click.stop="deleteLink(link.id)"
              />
            </div>
          </li>
        </template>
      </draggable>
    </div>

    <Modal
      v-model="isModalOpen"
      :title="editTarget ? '링크 수정' : '링크 추가'"
      :size="2"
    >
      <div class="modal-form">
        <div class="form-group">
          <label>표시 이름</label>
          <BaseInput
            field="routeName"
            v-model="form.name"
            type="text"
            placeholder="경로 이름을 입력하세요"
          />
        </div>
        <div class="form-group">
          <label>파일 경로</label>
          <div
            class="path-picker"
            @click="pickPath"
            :class="{ 'has-path': form.path }"
          >
            <i class="ti ti-folder-search"></i>
            <span class="path-text">{{
              form.path || '파일 또는 폴더 선택'
            }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer-actions">
          <button class="btn-cancel" @click="isModalOpen = false">취소</button>
          <button class="btn-primary" @click="saveLink">확인</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import Modal from '@/global-components/global-modal/components/Modal.vue'
import BaseDeleteButton from '@/base-ui/BaseDeleteButton.vue'
import BaseInput from '@/base-ui/BaseInput.vue'
import BaseButton from '@/base-ui/BaseButton.vue'

type LinkItem = { id: number; name: string; path: string; isFolder: boolean }
const emit = defineEmits<{ (e: 'update-dot', hasData: boolean): void }>()

const localLinks = ref<LinkItem[]>([])
const isModalOpen = ref(false)
const editTarget = ref<LinkItem | null>(null)
const form = ref({ name: '', path: '', isFolder: false })

onMounted(() => {
  const saved = localStorage.getItem('localLinks')
  if (saved) localLinks.value = JSON.parse(saved)
})

watch(
  localLinks,
  (val) => {
    localStorage.setItem('localLinks', JSON.stringify(val))
    emit('update-dot', val.length > 0)
  },
  { deep: true }
)

const openAddModal = () => {
  editTarget.value = null
  form.value = { name: '', path: '', isFolder: false }
  isModalOpen.value = true
}

const openEditModal = (link: LinkItem) => {
  editTarget.value = link
  form.value = { ...link }
  isModalOpen.value = true
}

const pickPath = async () => {
  const path = await window.electronAPI.selectFile()
  if (!path) return
  form.value.path = path
  form.value.isFolder = !path.includes('.')
  if (!form.value.name) form.value.name = path.split(/[\\/]/).pop() || '새 링크'
}

const saveLink = () => {
  if (!form.value.path) return alert('경로를 선택해주세요.')

  if (editTarget.value) {
    const idx = localLinks.value.findIndex((l) => l.id === editTarget.value!.id)
    if (idx !== -1)
      localLinks.value[idx] = {
        ...editTarget.value,
        ...form.value,
        name: form.value.name || '새 링크'
      }
  } else {
    localLinks.value.unshift({
      id: Date.now(),
      ...form.value,
      name: form.value.name || '새 링크'
    })
  }
  isModalOpen.value = false
  editTarget.value = null
}

const deleteLink = (id: number) => {
  localLinks.value = localLinks.value.filter((l) => l.id !== id)
}

const openLocalFile = (path: string) => window.electronAPI.openPath(path)
</script>

<style scoped>
@import './global-header-components.css';

.list-scroll-area {
  height: 200px;
  overflow-y: auto;
  flex-shrink: 0; /* 부모가 flex일 때 찌그러짐 방지 */
}

/* 리스트 스타일 (높이 관련 속성 제거) */
.item-list {
  padding: var(--space-2) 0;
  margin: 0;
  list-style: none;
}
.list-item {
  display: flex;
  align-items: center;

  padding: 8px 12px;
  border-radius: var(--radius-md);
  gap: 10px;
}

.link-scroll-area {
  height: 200px;
  min-height: 200px;
  overflow-y: auto;
  flex-shrink: 0;
}

/* 빈 상태일 때 200px 영역 정중앙에 예쁘게 배치 */
.empty-state {
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
}

/* 기존 리스트 스타일에서 높이 관련 속성 제거 */
.item-list {
  padding: var(--space-2) 0;
  margin: 0;
  list-style: none;
}
.list-item:hover {
  background: var(--bg-hover);
}

.drag-handle {
  color: var(--text-muted);
  cursor: grab;
  opacity: 0.3;
}
.list-item:hover .drag-handle {
  opacity: 0.7;
}

.item-body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}
.item-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-path {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  gap: 2px;
  opacity: 1; /* 항상 보이도록 변경 */
}

/* 모달 스타일 */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.path-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
}
.path-picker.has-path {
  border-style: solid;
}

.modal-footer-actions {
  display: flex !important;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}
.btn-primary {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}
</style>
