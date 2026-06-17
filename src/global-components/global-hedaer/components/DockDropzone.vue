<template>
  <div class="panel-content panel-stash">
    <div class="panel-header">
      <span class="panel-title">📥 임시 파일 드롭존</span>
      <span
        v-if="droppedFiles.length > 0"
        class="panel-action text-danger"
        @click="clearFiles"
      >
        비우기
      </span>
    </div>

    <div class="album-grid">
      <div
        v-for="(file, idx) in droppedFiles"
        :key="idx"
        class="album-item"
        draggable="true"
        @dragstart="onDragStart($event, file)"
      >
        <div class="album-icon">
          <img
            v-if="file.type.includes('image')"
            :src="`file://${file.path}`"
            class="thumb-img"
          />
          <i v-else :class="getFileIcon(file.type)"></i>
        </div>

        <div class="album-info">
          <div class="album-name" :title="file.name">
            {{
              file.name.length > 10 ? file.name.slice(0, 10) + '...' : file.name
            }}
          </div>
          <div class="album-size">
            {{ file.type === 'folder' ? '폴더' : formatSize(file.size) }}
          </div>
        </div>
      </div>

      <div
        v-if="droppedFiles.length === 0"
        class="drop-zone-empty"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <i class="ti ti-upload-cloud"></i>
        <span>파일을 던져두세요</span>
        <span class="sub-txt">최대 10개까지 보관 가능</span>
      </div>

      <div
        v-else-if="droppedFiles.length < MAX_FILES"
        class="drop-zone-add"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <i class="ti ti-plus"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DroppedFile {
  name: string
  size: number
  type: string
  path: string
}

const droppedFiles = ref<DroppedFile[]>([])
const MAX_FILES = 10
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const files = e.dataTransfer?.files

  if (files && files.length > 0) {
    for (const rawFile of Array.from(files)) {
      if (droppedFiles.value.length >= MAX_FILES) {
        alert(`임시 보관함은 최대 ${MAX_FILES}개까지만 저장할 수 있습니다.`)
        break
      }

      // 🌟 [핵심 수정] 백엔드가 파일을 이동/삭제하기 "직전"에 오리지널 용량을 무조건 먼저 백업합니다.
      const currentSize = rawFile.size

      const resolvedPath = window.electronAPI.getFilePath(rawFile)
      let finalPath = ''
      let fileType = rawFile.type || 'file'

      if (resolvedPath) {
        const result = await window.electronAPI.stashFile(
          resolvedPath,
          rawFile.name
        )
        if (result.success) {
          finalPath = result.newPath
          if (result.isDirectory) {
            fileType = 'folder'
          }
        } else {
          alert(`가져오기 실패: ${result.error}`)
          continue
        }
      } else {
        const arrayBuffer = await rawFile.arrayBuffer()
        const result = await window.electronAPI.stashData(
          arrayBuffer,
          rawFile.name
        )
        if (result.success) finalPath = result.newPath
      }

      if (finalPath) {
        droppedFiles.value.push({
          name: rawFile.name,
          size: currentSize, // 🌟 백업해둔 안전한 용량 데이터 주입
          type: fileType,
          path: finalPath
        })
      }
    }
  } else {
    // ... (URL 처리 영역은 기존과 동일)
    if (droppedFiles.value.length >= MAX_FILES) {
      alert(`임시 보관함은 최대 ${MAX_FILES}개까지만 저장할 수 있습니다.`)
      return
    }

    const url =
      e.dataTransfer?.getData('text/uri-list') ||
      e.dataTransfer?.getData('text/plain')
    if (url && url.startsWith('http')) {
      const result = await window.electronAPI.stashUrl(url)
      if (result.success) {
        droppedFiles.value.push({
          name: result.fileName,
          size: result.size,
          type: 'image/png',
          path: result.newPath
        })
      }
    }
  }
}

const getFileIcon = (type: string) => {
  if (!type) return 'ti ti-file'
  if (type === 'folder') return 'ti ti-folder'
  if (type.includes('pdf')) return 'ti ti-file-text'
  if (type.includes('zip') || type.includes('compressed')) return 'ti ti-zip'
  return 'ti ti-file'
}

const onDragStart = (e: DragEvent, file: DroppedFile) => {
  e.preventDefault()
  if (window.electronAPI?.startDrag) {
    window.electronAPI.startDrag(file.path)
  }
}

const clearFiles = async () => {
  droppedFiles.value = []
  if (window.electronAPI?.clearStash) {
    try {
      await window.electronAPI.clearStash()
    } catch (error) {
      console.error('메인 프로세스 보관함 삭제 중 오류 발생:', error)
    }
  }
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
@import './global-header-components.css';

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
  height: 200px;
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden; /* 🌟 가로 스크롤 생성 원천 차단 */
  align-content: start;
}

/* 스크롤바 커스텀 */
.album-grid::-webkit-scrollbar {
  width: 6px;
}
.album-grid::-webkit-scrollbar-track {
  background: transparent;
}
.album-grid::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
.album-grid::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color, #4facfe);
}

.album-item {
  min-width: 0; /* 🌟 Grid 안에서 긴 텍스트 때문에 아이템이 우측으로 터지는 현상 해결 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 104px;
  padding: 10px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color);
  cursor: grab;
  box-sizing: border-box;
  transition:
    transform 0.15s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.album-item:hover {
  border-color: var(--primary-color, #4facfe);
  transform: translateY(-2px);
}
.album-item:active {
  cursor: grabbing;
}

.album-icon {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;

  margin-bottom: 6px;
}

.thumb-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.album-info {
  width: 100%;
  text-align: center;
  overflow: hidden;
}

.album-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-main, #eee);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.album-size {
  font-size: 0.65rem;
  color: var(--text-muted, #888);
  margin-top: 1px;
}

.drop-zone-empty {
  grid-column: 1 / -1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 212px; /* 총 그리드 높이 내에 딱 들어맞게 조절 */
  border: 2px dashed #444;
  border-radius: var(--radius-md, 8px);
  color: var(--text-muted, #888);
  box-sizing: border-box;
  transition:
    border-color 0.25s,
    background 0.25s,
    color 0.25s;
}
.drop-zone-empty i {
  font-size: 3rem;
  margin-bottom: 8px;
  color: #555;
  transition:
    color 0.25s,
    transform 0.25s;
}
.drop-zone-empty:hover {
  border-color: var(--primary-color, #4facfe);
  background: rgba(79, 172, 254, 0.03);
  color: #fff;
}
.drop-zone-empty:hover i {
  color: var(--primary-color, #4facfe);
  transform: translateY(-4px);
}
.drop-zone-empty .sub-txt {
  font-size: 0.65rem;

  margin-top: 4px;
}

.drop-zone-add {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104px;
  border: 2px dashed var(--border-color, #3a3a3a);
  border-radius: var(--radius-md, 8px);
  color: var(--text-muted, #666);
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.drop-zone-add i {
  font-size: 1.5rem;
}
.drop-zone-add:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: var(--primary-color, #4facfe);
  color: var(--primary-color, #4facfe);
}
</style>
