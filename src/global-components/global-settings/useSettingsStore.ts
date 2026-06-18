import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AppSize = 'max' | 'middle' | 'min'
export type AppTheme = 'light' | 'dark' | 'tree'

export const useSettingsStore = defineStore('settings', () => {
  // --- UI Settings State ---
  const appSize = ref<AppSize>('middle')
  const theme = ref<AppTheme>('light')

  // --- User Account State (소셜 로그인 연동 시 이 값을 업데이트) ---
  const isLoggedIn = ref<boolean>(true) // 테스트용 (false로 바꾸면 미로그인 표시)
  const userName = ref<string>('Tony Stark')
  const subscription = ref<'free' | 'pro'>('pro')

  // --- Actions ---
  const loadSettings = () => {
    const saved = localStorage.getItem('jarvis_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.appSize) appSize.value = parsed.appSize
      if (parsed.theme) updateTheme(parsed.theme, false) // 저장된 테마 불러오기
    }
  }

  const saveSettings = () => {
    localStorage.setItem(
      'jarvis_settings',
      JSON.stringify({
        appSize: appSize.value,
        theme: theme.value
      })
    )
  }

  const updateAppSize = (size: AppSize) => {
    appSize.value = size
    saveSettings()

    const win = window as any
    if (win.electronAPI) {
      console.log('2. electronAPI 객체 확인됨') // 추가
      win.electronAPI.resizeWindow(size)
    } else {
      console.error('3. electronAPI가 없습니다!') // 추가
    }
  }

  const updateTheme = (newTheme: AppTheme, save = true) => {
    theme.value = newTheme
    // HTML 태그에 data-theme 속성을 달아주면 CSS가 자동으로 바뀝니다!
    document.documentElement.setAttribute('data-theme', newTheme)
    if (save) saveSettings()
  }

  return {
    appSize,
    theme,
    isLoggedIn,
    userName,
    subscription,
    loadSettings,
    updateAppSize,
    updateTheme
  }
})
