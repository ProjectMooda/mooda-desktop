import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { IpcRendererEvent } from 'electron'

export interface AuthCallbackPayload {
  accessToken: string | null
  refreshToken: string | null // 🌟 [추가]
  userId: string | null
  email: string | null
}

interface ElectronAPI {
  onClipboardChanged: (callback: (text: string) => void) => void
  writeToClipboard: (text: string) => void
  openPath: (path: string) => void
  getFilePath: (file: File) => string
  selectFile: () => Promise<string | null>
  startDrag: (filePath: string) => void
  clearStash: () => Promise<boolean>
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
  resizeWindow: (size: string) => void

  openExternal: (url: string) => Promise<void>
  notifyReady: () => Promise<void>
  onAuthCallback: (fn: (data: AuthCallbackPayload) => void) => () => void
  onAuthError: (fn: (data: { message: string }) => void) => () => void

  // 🌟 [추가] safeStorage 관련 브릿지
  saveRefreshToken: (token: string) => Promise<void>
  getRefreshToken: () => Promise<string | null>
  clearRefreshToken: () => Promise<void>
}

const api: ElectronAPI = {
  onClipboardChanged: (callback) => {
    ipcRenderer.on('clipboard-changed', (_event, text) => callback(text))
  },
  writeToClipboard: (text) => {
    ipcRenderer.send('write-clipboard', text)
  },
  openPath: (path) => {
    ipcRenderer.send('open-path', path)
  },
  getFilePath: (file) => webUtils.getPathForFile(file),
  selectFile: () => ipcRenderer.invoke('select-file'),
  stashFile: (sourcePath, fileName) =>
    ipcRenderer.invoke('stash-file', sourcePath, fileName),
  startDrag: (filePath) => ipcRenderer.send('ondragstart', filePath),
  clearStash: () => ipcRenderer.invoke('clear-stash'),
  stashData: (buffer, fileName) =>
    ipcRenderer.invoke('stash-data', buffer, fileName),
  stashUrl: (url) => ipcRenderer.invoke('stash-url', url),
  resizeWindow: (size) => {
    ipcRenderer.send('resize-window', size)
  },

  // SQLite 조작을 위한 API 추가
  dbGet: (key: string) => ipcRenderer.invoke('db:get', key),
  dbSet: (key: string, value: any) => ipcRenderer.invoke('db:set', key, value),
  dbClear: () => ipcRenderer.invoke('db:clear'),

  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  notifyReady: () => ipcRenderer.invoke('renderer:ready'),

  onAuthCallback: (fn) => {
    const listener = (_event: IpcRendererEvent, data: AuthCallbackPayload) =>
      fn(data)
    ipcRenderer.on('auth:callback', listener)
    return () => ipcRenderer.removeListener('auth:callback', listener)
  },
  onAuthError: (fn) => {
    const listener = (_event: IpcRendererEvent, data: { message: string }) =>
      fn(data)
    ipcRenderer.on('auth:error', listener)
    return () => ipcRenderer.removeListener('auth:error', listener)
  },

  // 🌟 [추가] 실제 구현부 연결
  saveRefreshToken: (token) =>
    ipcRenderer.invoke('auth:save-refresh-token', token),
  getRefreshToken: () => ipcRenderer.invoke('auth:get-refresh-token'),
  clearRefreshToken: () => ipcRenderer.invoke('auth:clear-refresh-token'),

  onTriggerFinalSync: (callback) => {
    ipcRenderer.on('trigger-final-sync', callback)
    return () => ipcRenderer.removeListener('trigger-final-sync', callback) // cleanup 함수 리턴
  },
  finalSyncDone: () => ipcRenderer.send('final-sync-done')
}

contextBridge.exposeInMainWorld('electronAPI', api)
