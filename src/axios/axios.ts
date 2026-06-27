import axios from 'axios'
import { useAuthStore } from '@/auth/authStore'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  // 🌟 [추가] 기본 api 인스턴스에도 우리가 electron임을 명시해두면 좋습니다
  headers: {
    'X-Client-Type': 'electron'
  }
})

// ── Request: accessToken 자동 주입 ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

// ── Response: 401 시 자동 갱신 + 원래 요청 재시도 ─────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

// 갱신 중 쌓인 요청들을 새 토큰으로 한꺼번에 처리
const flushQueue = (error: unknown, newToken: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken!)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      console.log('🔄 [interceptor] 401 감지 → refresh 시도')

      const savedRefreshToken = await window.electronAPI.getRefreshToken()
      console.log(
        '💾 [interceptor] safeStorage refreshToken:',
        savedRefreshToken ? '존재' : 'null ← 여기서 실패'
      )

      if (!savedRefreshToken) throw new Error('저장된 refreshToken 없음')

      // 🌟 [수정 1] axios.post에 { headers: { 'X-Client-Type': 'electron' } } 필수 추가
      const { data } = await axios.post(
        'http://localhost:3000/auth/refresh',
        { refreshToken: savedRefreshToken },
        { headers: { 'X-Client-Type': 'electron' } }
      )
      console.log('📦 [interceptor] refresh 응답:', data)

      // 🌟 [수정 2] 백엔드 응답 키값에 맞게 'refreshToken'으로 추출
      const { accessToken, refreshToken } = data

      if (!accessToken || !refreshToken) {
        throw new Error(
          `응답 필드 누락 — accessToken: ${accessToken ? 'O' : 'X'}, refreshToken: ${refreshToken ? 'O' : 'X'}`
        )
      }

      const authStore = useAuthStore()

      // 🌟🌟🌟 [핵심 수정] 변수에 직접 넣지 말고, localStorage까지 함께 갱신하는 함수 호출!
      authStore.updateAccessToken(accessToken)

      // 🌟 추출한 refreshToken을 safeStorage에 저장
      await window.electronAPI.saveRefreshToken(refreshToken)
      console.log('✅ [interceptor] 갱신 및 safeStorage 저장 완료')

      flushQueue(null, accessToken)
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      console.error('❌ [interceptor] refresh 실패 원인:', refreshError)
      flushQueue(refreshError, null)

      const authStore = useAuthStore()
      authStore.clearAuth()
      authStore.openLoginModal()

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
