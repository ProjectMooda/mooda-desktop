<template>
  <Modal
    v-model="isOpen"
    title="시작하기"
    :size="1"
    :closeOnOverlay="false"
    :closeOnEsc="false"
  >
    <div class="login-container flex-col gap-12 mt-8 mb-4">
      <p class="text-sub text-sm text-center mb-8">
        서비스 이용을 위해 로그인이 필요합니다.
      </p>

      <BaseButton
        :size="4"
        class="w-full brand-btn btn-kakao"
        @click="handleLogin('kakao')"
      >
        카카오로 시작하기
      </BaseButton>

      <BaseButton
        :size="4"
        class="w-full brand-btn btn-naver"
        @click="handleLogin('google')"
      >
        구글로 시작하기
      </BaseButton>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '../global-modal/components/Modal.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import { useAuthStore } from '@/auth/authStore.ts'

const authStore = useAuthStore()

// 앱 진입 시 자동으로 띄우기 위해
const isOpen = computed({
  get: () => authStore.isLoginModalOpen,
  set: (val) => {
    if (val) authStore.openLoginModal()
    else authStore.closeLoginModal()
  }
})

const emit = defineEmits<{
  (e: 'login-success', provider: 'kakao' | 'google'): void
}>()

// 소셜 로그인 핸들러
// 기존: window.location.href = ... (Electron 창이 직접 이동 — ❌)
// 변경: 시스템 브라우저로 열기
const handleLogin = async (provider: 'kakao' | 'google') => {
  console.log('🖱️ 로그인 버튼 클릭:', provider)
  console.log('📌 window.electronAPI 존재?', !!window.electronAPI)
  await window.electronAPI.openExternal(
    `http://localhost:3000/auth/${provider}` // GET /auth/kakao 엔드포인트
  )
  // 이후 흐름은 딥링크 → main process → IPC → App.vue가 처리
}
</script>

<style scoped>
/* =======================================
   글로벌 유틸리티 보완용 
======================================= */
.text-center {
  text-align: center;
}

/* =======================================
   브랜드 버튼 커스텀 (BaseButton 오버라이딩)
======================================= */
/* BaseButton의 기본 스타일(transition, 클릭 텐션 등)은 유지하되,
  배경색과 글자색만 소셜 브랜드 가이드에 맞게 덮어씁니다.
*/
.brand-btn {
  font-weight: var(--font-semibold);
  /* 버튼 내 텍스트/아이콘 중앙 정렬을 위한 추가 보정 */
  justify-content: center;
}

/* 카카오 (Kakao) */
.btn-kakao {
  background-color: #fee500 !important;
  color: #000000 !important;
  border: none !important;
}
.btn-kakao:not(:disabled):hover {
  background-color: #fdd800 !important;
  opacity: 1 !important;
}

/* 네이버 (Naver) */
.btn-naver {
  background-color: #03c75a !important;
  color: #ffffff !important;
  border: none !important;
}
.btn-naver:not(:disabled):hover {
  background-color: #02b350 !important;
  opacity: 1 !important;
}
</style>
