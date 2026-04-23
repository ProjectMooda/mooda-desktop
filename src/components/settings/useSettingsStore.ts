import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AppSize = 'max' | 'middle' | 'min'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const appSize = ref<AppSize>('middle')

  // Actions
  const loadSettings = () => {
    const saved = localStorage.getItem('jarvis_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.appSize) appSize.value = parsed.appSize
    }
  }

  const updateAppSize = (size: AppSize) => {
    appSize.value = size
    localStorage.setItem('jarvis_settings', JSON.stringify({ appSize: size }))

    // Electron IPC 통신 로직
    const win = window as any
    if (win.require) {
      const { ipcRenderer } = win.require('electron')
      ipcRenderer.send('resize-window', size)
    }
  }

  return {
    appSize,
    loadSettings,
    updateAppSize
  }
})
