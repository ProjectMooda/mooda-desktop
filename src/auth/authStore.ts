// src/auth/authStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/axios/axios'
import { useScheduleStore } from '@/stores/useScheduleStore'

interface AuthUser {
  id: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const savedAccess = localStorage.getItem('accessToken')
  const savedUser = localStorage.getItem('user')

  const isAuthenticated = ref(!!savedAccess)
  const accessToken = ref<string | null>(savedAccess)
  const user = ref<AuthUser | null>(savedUser ? JSON.parse(savedUser) : null)

  // 🌟 내 프로필 가져오기 함수 추가
  const fetchProfile = async () => {
    try {
      // axios 인터셉터가 알아서 AccessToken을 헤더에 넣어줍니다.
      const response = await api.get('/auth/profile')
      const userData = response.data // { id, email, nickname, avatarText , 카테고리, 중요도 }

      user.value = {
        id: userData.id,
        email: userData.email
      }

      // 카테고리 및 중요도 갱신
      const scheduleStore = useScheduleStore()
      scheduleStore.categories = userData.categories
      scheduleStore.priorityOptions = userData.priorityOptions

      // 로컬 스토리지에 한 번 저장해두기 (오프라인 대비)
      scheduleStore.saveData()
    } catch (error) {
      console.error('프로필 정보를 불러오지 못했습니다.', error)
    }
  }

  const setAuth = async (data: {
    accessToken: string
    refreshToken: string
    userId: string
    email: string
  }) => {
    accessToken.value = data.accessToken
    isAuthenticated.value = true

    localStorage.setItem('accessToken', data.accessToken)
    if (window.electronAPI?.saveRefreshToken) {
      window.electronAPI.saveRefreshToken(data.refreshToken)
    }

    // 🌟 로그인 직후 프로필 데이터 갱신
    await fetchProfile()
  }

  // 🌟 [추가] 토큰만 조용히 갱신할 때 쓰는 함수 (메모리 + 로컬스토리지 둘 다 업데이트)
  const updateAccessToken = (newToken: string) => {
    accessToken.value = newToken
    localStorage.setItem('accessToken', newToken)
  }

  const clearAuth = () => {
    accessToken.value = null
    user.value = null
    isAuthenticated.value = false

    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    if (window.electronAPI?.clearRefreshToken) {
      window.electronAPI.clearRefreshToken()
    }
  }

  return {
    isAuthenticated,
    accessToken,
    user,
    fetchProfile,
    setAuth,
    updateAccessToken, // 👈 밖으로 빼주기
    clearAuth
  }
})
