import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { IpcRendererEvent } from 'electron'

// 1. 프론트엔드와 공유할 동일한 타입 구조 정의
interface ElectronAPI {
  onClipboardChanged: (callback: (text: string) => void) => void
  writeToClipboard: (text: string) => void
  openPath: (path: string) => void
  getFilePath: (file: File) => string // 🌟 올바른 문법으로 수정
  selectFile: () => Promise<string | null>
  startDrag: (filePath: string) => void
  clearStash: () => Promise<boolean> // 🌟 누락되었던 메서드 타입 추가
  stashFile: (
    sourcePath: string,
    fileName: string
  ) => Promise<{
    success: boolean
    newPath: string
    isDirectory?: boolean
    error?: string
  }>
  stashData: (
    buffer: ArrayBuffer,
    fileName: string
  ) => Promise<{ success: boolean; newPath: string; error?: string }>
  stashUrl: (url: string) => Promise<{
    success: boolean
    newPath: string
    fileName: string
    size: number
    error?: string
  }>
}

const api: ElectronAPI = {
  onClipboardChanged: (callback: (text: string) => void) => {
    ipcRenderer.on(
      'clipboard-changed',
      (_event: IpcRendererEvent, text: string) => callback(text)
    )
  },
  writeToClipboard: (text: string) => {
    ipcRenderer.send('write-clipboard', text)
  },
  openPath: (path: string) => {
    ipcRenderer.send('open-path', path)
  },
  getFilePath: (file: File) => {
    // 🌟 Electron 렌더러 가상환경을 뚫고 실제 OS 경로를 가져오는 치트키 바인딩
    return webUtils.getPathForFile(file)
  },
  selectFile: () => {
    return ipcRenderer.invoke('select-file')
  },
  stashFile: (sourcePath: string, fileName: string) => {
    return ipcRenderer.invoke('stash-file', sourcePath, fileName)
  },
  startDrag: (filePath: string) => {
    ipcRenderer.send('ondragstart', filePath)
  },
  clearStash: () => {
    // 🌟 프론트엔드에서 호출하고 있었으나 정작 이 파일엔 빠져있던 구현부 주입
    return ipcRenderer.invoke('clear-stash')
  },
  stashData: (buffer: ArrayBuffer, fileName: string) => {
    return ipcRenderer.invoke('stash-data', buffer, fileName)
  },
  stashUrl: (url: string) => {
    return ipcRenderer.invoke('stash-url', url)
  },
  // 미니 모드 사이즈 변경
  resizeWindow: (size: string) => ipcRenderer.send('resize-window', size)
}

contextBridge.exposeInMainWorld('electronAPI', api)
