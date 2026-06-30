import axios from 'axios'
import { useAuthStore } from '@/auth/authStore'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  // 🌟 기본 api 인스턴스에 electron 명시
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

    // 401 에러가 아니거나 이미 재시도한 요청이면 그대로 reject
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // 1. 이미 다른 요청이 갱신(isRefreshing)을 진행 중이라면 큐에서 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          // 토큰이 갱신되면 대기하던 요청의 헤더를 갈아끼우고 재출발
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
        .catch((err) => {
          // 갱신 자체가 실패했다면 대기하던 요청도 reject
          return Promise.reject(err)
        })
    }

    // 2. 내가 첫 번째 401 에러라면 갱신 로직 시작
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

      // 🌟 axios.post에 { headers: { 'X-Client-Type': 'electron' } } 필수 추가
      const { data } = await axios.post(
        'http://localhost:3000/auth/refresh',
        { refreshToken: savedRefreshToken },
        { headers: { 'X-Client-Type': 'electron' } }
      )
      console.log('📦 [interceptor] refresh 응답:', data)

      // 🌟 백엔드 응답 키값에 맞게 'refreshToken'으로 추출
      const { accessToken, refreshToken } = data

      if (!accessToken || !refreshToken) {
        throw new Error(
          `응답 필드 누락 — accessToken: ${accessToken ? 'O' : 'X'}, refreshToken: ${refreshToken ? 'O' : 'X'}`
        )
      }

      const authStore = useAuthStore()

      // 🌟 변수에 직접 넣지 말고, localStorage까지 함께 갱신하는 함수 호출!
      authStore.updateAccessToken(accessToken)

      // 🌟 추출한 refreshToken을 safeStorage에 저장
      await window.electronAPI.saveRefreshToken(refreshToken)
      console.log('✅ [interceptor] 갱신 및 safeStorage 저장 완료')

      // 🌟 [핵심] 성공 시 대기 중인 큐(failedQueue)를 일제히 resolve 시킴
      flushQueue(null, accessToken)

      // 🌟 처음 401이 났던 아까 그 요청(original)도 새 토큰 달고 재출발!
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      console.error('❌ [interceptor] refresh 실패 원인:', refreshError)

      // 🌟 [핵심] 갱신 실패 시 대기 중인 큐(failedQueue)를 일제히 reject 시킴
      flushQueue(refreshError, null)

      const authStore = useAuthStore()
      authStore.clearAuth()

      return Promise.reject(refreshError)
    } finally {
      // 🌟 마지막에 무조건 플래그 해제
      isRefreshing = false
    }
  }
)

export default api
