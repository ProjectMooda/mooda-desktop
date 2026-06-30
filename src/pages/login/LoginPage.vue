<template>
  <div class="login-page-wrapper">
    <!-- =============================================
         온보딩 화면 (첫 방문)
    ============================================= -->
    <div v-if="isFirstVisit" class="onb-card fade-in">
      <!-- 상단 헤더 -->
      <div class="onb-header">
        <span class="onb-wordmark">MOODA</span>
        <span class="onb-pill">Beta</span>
      </div>

      <!-- 스텝 콘텐츠 -->
      <transition name="step-fade" mode="out-in">
        <div class="onb-body" :key="currentStep">
          <!-- ── 시각 영역 ── -->
          <div class="onb-visual">
            <!-- Step 1: 세 개의 기능 카드 -->
            <div v-if="currentStep === 1" class="vis-trio">
              <div class="vis-card">
                <span class="vc-emoji">📅</span>
                <span class="vc-name">캘린더</span>
                <span class="vc-sub">일정·반복 관리</span>
              </div>
              <div class="vis-card vc-featured">
                <span class="vc-emoji">🎯</span>
                <span class="vc-name">목표 관리</span>
                <span class="vc-sub">Goal & 마일스톤</span>
              </div>
              <div class="vis-card">
                <span class="vc-emoji">✅</span>
                <span class="vc-name">할 일</span>
                <span class="vc-sub">우선순위·완료</span>
              </div>
            </div>

            <!-- Step 2: Goal → Milestone → Task 계층 흐름도 -->
            <div v-if="currentStep === 2" class="vis-flow">
              <div class="vf-node vf-goal">
                <div class="vfn-left">
                  <span class="vfn-ico">🏆</span>
                </div>
                <div class="vfn-right">
                  <strong>Goal</strong>
                  <span>연간 큰 목표 설정 및 기간 지정</span>
                </div>
                <div class="vfn-badge">목표</div>
              </div>

              <div class="vf-branch-connector">
                <div class="vbc-stem"></div>
                <div class="vbc-arms">
                  <div class="vbc-arm"></div>
                  <div class="vbc-arm"></div>
                </div>
              </div>

              <div class="vf-ms-row">
                <div class="vf-node vf-ms">
                  <span class="vfn-ico">📍</span>
                  <div class="vfn-right">
                    <strong>마일스톤 A</strong>
                    <span>6월 세부 목표</span>
                  </div>
                </div>
                <div class="vf-node vf-ms">
                  <span class="vfn-ico">📍</span>
                  <div class="vfn-right">
                    <strong>마일스톤 B</strong>
                    <span>12월 세부 목표</span>
                  </div>
                </div>
              </div>

              <div class="vf-arrow-down">↓</div>

              <div class="vf-node vf-task">
                <span class="vfn-ico">☑️</span>
                <div class="vfn-right">
                  <strong>오늘의 할 일 &amp; 일정</strong>
                  <span>진행률 자동 계산</span>
                </div>
              </div>
            </div>

            <!-- Step 3: 동기화 다이어그램 -->
            <div v-if="currentStep === 3" class="vis-sync">
              <div class="vs-hub">
                <div class="vs-hub-ring"></div>
                <span class="vs-hub-ico">☁️</span>
              </div>
              <div class="vs-nodes">
                <div class="vs-node">
                  <div class="vs-node-ico">💻</div>
                  <span>PC</span>
                  <div class="vs-status online">온라인</div>
                </div>
                <div class="vs-divider-v"></div>
                <div class="vs-node vs-node-center">
                  <div class="vs-node-ico">🔄</div>
                  <span>실시간</span>
                  <div class="vs-status syncing">동기화 중</div>
                </div>
                <div class="vs-divider-v"></div>
                <div class="vs-node">
                  <div class="vs-node-ico">📱</div>
                  <span>모바일</span>
                  <div class="vs-status offline">오프라인</div>
                </div>
              </div>
              <p class="vs-note">
                오프라인에서도 그대로 작동하고,<br />연결되면 자동으로 최신
                상태를 맞춥니다.
              </p>
            </div>
          </div>

          <!-- ── 텍스트 영역 ── -->
          <div class="onb-text">
            <div class="onb-eyebrow">
              {{ currentStep }} / {{ steps.length }}
            </div>
            <h1 class="onb-title">{{ steps[currentStep - 1].title }}</h1>
            <p class="onb-desc" v-html="steps[currentStep - 1].desc"></p>
          </div>
        </div>
      </transition>

      <!-- 하단 네비게이션 -->
      <div class="onb-footer">
        <div class="onb-dots">
          <span
            v-for="n in steps.length"
            :key="n"
            class="dot"
            :class="{ active: currentStep === n }"
          ></span>
        </div>
        <div class="onb-btn-row">
          <button v-if="currentStep > 1" class="btn-ghost" @click="prevStep">
            이전
          </button>
          <button
            v-if="currentStep < steps.length"
            class="btn-dark"
            @click="nextStep"
          >
            다음 <span class="btn-arr">→</span>
          </button>
          <button v-else class="btn-blue" @click="finishOnboarding">
            MOODA 시작하기
          </button>
        </div>
      </div>
    </div>

    <!-- =============================================
         로그인 화면
    ============================================= -->
    <div v-else class="login-card fade-in">
      <!-- 브랜드 헤더 -->
      <div class="lc-brand">
        <div class="lc-logo">MOODA</div>
        <h1 class="lc-headline">생산성의 새로운 기준</h1>
        <p class="lc-tagline">
          목표부터 오늘의 할 일까지,<br />MOODA 하나로 연결하고 관리하세요.
        </p>
      </div>

      <!-- 핵심 기능 3개 -->
      <div class="lc-features">
        <div class="lf-item">
          <div class="lf-ico">🎯</div>
          <div class="lf-body">
            <strong>목표 → 마일스톤 → 할 일</strong>
            <span>큰 목표를 실행 가능한 단계로 세분화</span>
          </div>
        </div>
        <div class="lf-item">
          <div class="lf-ico">📅</div>
          <div class="lf-body">
            <strong>스마트 캘린더</strong>
            <span>반복 일정, 우선순위, 카테고리 한 번에</span>
          </div>
        </div>
        <div class="lf-item">
          <div class="lf-ico">☁️</div>
          <div class="lf-body">
            <strong>오프라인 우선 동기화</strong>
            <span>끊김 없이 사용하고, 자동으로 최신 상태 유지</span>
          </div>
        </div>
      </div>

      <!-- 구분선 -->
      <div class="lc-divider">
        <span class="ld-line"></span>
        <span class="ld-text">간편 로그인으로 시작</span>
        <span class="ld-line"></span>
      </div>

      <!-- 로그인 버튼 (디자인 수정 절대 금지) -->
      <div class="login-actions">
        <button class="kakao-btn" @click="handleLogin('kakao')">
          <div class="kakao-icon-wrapper">
            <svg
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 2C4.029 2 0 5.148 0 9.031C0 11.517 1.579 13.689 3.993 14.887C3.805 15.498 3.327 17.067 3.284 17.218C3.24 17.368 3.398 17.382 3.493 17.323C3.606 17.253 5.766 15.824 6.784 15.111C7.493 15.282 8.232 15.378 9 15.378C13.971 15.378 18 12.23 18 8.347C18 4.464 13.971 2 9 2Z"
                fill="#000000"
              />
            </svg>
          </div>
          <span class="kakao-btn-text">카카오 로그인</span>
        </button>

        <button class="gsi-material-button" @click="handleLogin('google')">
          <div class="gsi-material-button-state"></div>
          <div class="gsi-material-button-content-wrapper">
            <div class="gsi-material-button-icon">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                style="display: block"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span class="gsi-material-button-contents"
              >Google 계정으로 로그인</span
            >
            <span style="display: none">Google 계정으로 로그인</span>
          </div>
        </button>
      </div>

      <!-- 약관 -->
      <p class="lc-terms">
        로그인 시 MOODA의 <a href="#">이용약관</a>과
        <a href="#">개인정보처리방침</a>에 동의합니다.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 최초 방문 여부
const isFirstVisit = ref(localStorage.getItem('hasSeenOnboarding') !== 'true')
const currentStep = ref(1)

// 개선된 온보딩 스텝 (앱의 핵심 개념을 명확히 전달)
const steps = [
  {
    icon: '🎯',
    title: '하루를 체계적으로 설계하세요',
    desc: 'MOODA는 <strong>캘린더, 목표 관리, 할 일</strong>을 하나로 연결합니다.<br>흩어진 일정을 통합하고, 나만의 생산성 시스템을 구축해 보세요.'
  },
  {
    icon: '🗺️',
    title: '목표에서 실행까지 한 번에',
    desc: '큰 목표를 <strong>마일스톤</strong>으로 세분화하고,<br>마일스톤을 <strong>일일 할 일</strong>로 연결합니다.<br>진행률은 자동으로 계산되어 실행력을 높여 드려요.'
  },
  {
    icon: '☁️',
    title: '언제 어디서나 이어서',
    desc: '오프라인에서도 <strong>끊김 없이 사용</strong>할 수 있고,<br>네트워크가 연결되면 자동으로 <strong>동기화</strong>됩니다.<br>로그인으로 데이터를 안전하게 보관하세요.'
  }
]

const nextStep = () => {
  if (currentStep.value < steps.length) currentStep.value++
}
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
const finishOnboarding = () => {
  localStorage.setItem('hasSeenOnboarding', 'true')
  isFirstVisit.value = false
}
const handleLogin = async (provider: 'kakao' | 'google') => {
  console.log(`🖱️ ${provider} 로그인 시도`)
  await window.electronAPI.openExternal(
    `http://localhost:3000/auth/${provider}`
  )
}
</script>

<style scoped>
/* ==============================================
   기반 & 애니메이션
============================================== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

.login-page-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 시그니처: 따뜻한 스톤 그라운드 — 차가운 회색이나 흰색과 다르게 집중감을 주는 배경 */
  background-color: #f2f0ec;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo',
    'Noto Sans KR', 'Malgun Gothic', sans-serif;
}

.fade-in {
  animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 스텝 전환 애니메이션 */
.step-fade-enter-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-fade-leave-active {
  transition: all 0.18s ease-in;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* ==============================================
   온보딩 카드
============================================== */
.onb-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.onb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 24px;
  border-bottom: 1px solid #ede9e4;
}

.onb-wordmark {
  font-size: 15px;
  font-weight: 900;
  color: #3b82f6;
  letter-spacing: -0.6px;
}

.onb-pill {
  font-size: 11px;
  font-weight: 600;
  color: #71717a;
  background: #f4f4f5;
  border-radius: 20px;
  padding: 2px 8px;
  letter-spacing: 0.2px;
}

/* 바디 */
.onb-body {
  padding: 28px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Step 1: 기능 카드 3개 ── */
.vis-trio {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.vis-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 18px 10px 16px;
  background: #fafaf9;
  border: 1px solid #ede9e4;
  border-radius: 14px;
  text-align: center;
  transition: border-color 0.2s;
}

.vis-card.vc-featured {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.vc-emoji {
  font-size: 24px;
  line-height: 1;
}
.vc-name {
  font-size: 12px;
  font-weight: 600;
  color: #18181b;
  margin-top: 2px;
}
.vc-sub {
  font-size: 11px;
  color: #a1a1aa;
}

/* ── Step 2: 흐름도 ── */
.vis-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.vf-node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  width: 100%;
  position: relative;
}

.vfn-left {
  flex-shrink: 0;
}
.vfn-ico {
  font-size: 18px;
}

.vfn-right {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.vfn-right strong {
  font-size: 13px;
  font-weight: 600;
  color: #18181b;
}
.vfn-right span {
  font-size: 11px;
  color: #71717a;
}

.vfn-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  color: #2563eb;
  background: #dbeafe;
  border-radius: 20px;
  padding: 2px 8px;
  flex-shrink: 0;
}

.vf-goal {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.vf-ms {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  flex: 1;
}
.vf-task {
  background: #fafaf9;
  border: 1px solid #ede9e4;
}

/* 브랜치 커넥터 (Goal → 두 마일스톤) */
.vf-branch-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2px 0;
  gap: 0;
}
.vbc-stem {
  width: 1px;
  height: 10px;
  background: #d4d4d8;
}
.vbc-arms {
  display: flex;
  width: calc(50% + 2px);
  height: 8px;
  border-left: 1px solid #d4d4d8;
  border-bottom: 1px solid #d4d4d8;
  border-right: 1px solid #d4d4d8;
}

.vf-ms-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.vf-arrow-down {
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1;
  margin: 4px 0;
}

/* ── Step 3: 동기화 ── */
.vis-sync {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.vs-hub {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vs-hub-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
}
.vs-hub-ico {
  font-size: 30px;
  position: relative;
  z-index: 1;
}

.vs-nodes {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.vs-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #fafaf9;
  border: 1px solid #ede9e4;
  border-radius: 10px;
  font-size: 12px;
  color: #52525b;
}
.vs-node-center {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.vs-node-ico {
  font-size: 20px;
}

.vs-status {
  font-size: 10px;
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 7px;
}
.vs-status.online {
  color: #16a34a;
  background: #dcfce7;
}
.vs-status.syncing {
  color: #2563eb;
  background: #dbeafe;
}
.vs-status.offline {
  color: #71717a;
  background: #f4f4f5;
}

.vs-divider-v {
  width: 1px;
  height: 40px;
  background: repeating-linear-gradient(
    to bottom,
    #d4d4d8 0,
    #d4d4d8 4px,
    transparent 4px,
    transparent 8px
  );
  flex-shrink: 0;
}

.vs-note {
  font-size: 12px;
  color: #71717a;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* ── 텍스트 ── */
.onb-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.onb-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.onb-title {
  font-size: 20px;
  font-weight: 700;
  color: #0d0d0d;
  line-height: 1.3;
  margin: 0;
  letter-spacing: -0.3px;
}

.onb-desc {
  font-size: 14px;
  color: #52525b;
  line-height: 1.7;
  margin: 0;
}
.onb-desc :deep(strong) {
  color: #27272a;
  font-weight: 600;
}

/* ── 푸터 네비게이션 ── */
.onb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px 20px;
  border-top: 1px solid #ede9e4;
}

.onb-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4d4d8;
  transition: all 0.25s ease;
}
.dot.active {
  background: #3b82f6;
  width: 20px;
  border-radius: 3px;
}

.onb-btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-ghost {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  background: transparent;
  color: #71717a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover {
  background: #f4f4f5;
  color: #27272a;
}

/* Linear 스타일: 어두운 "다음" 버튼 — 중립적이고 프로페셔널 */
.btn-dark {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #18181b;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-dark:hover {
  background: #27272a;
}
.btn-arr {
  font-size: 12px;
  opacity: 0.7;
}

.btn-blue {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-blue:hover {
  background: #2563eb;
}

/* ==============================================
   로그인 카드
============================================== */
.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* 브랜드 */
.lc-brand {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.lc-logo {
  font-size: 30px;
  font-weight: 900;
  color: #3b82f6;
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: 2px;
}

.lc-headline {
  font-size: 18px;
  font-weight: 700;
  color: #0d0d0d;
  margin: 0;
  letter-spacing: -0.3px;
}

.lc-tagline {
  font-size: 13px;
  color: #71717a;
  line-height: 1.65;
  margin: 0;
}

/* 기능 리스트 */
.lc-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lf-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  background: #fafaf9;
  border: 1px solid #ede9e4;
  border-radius: 10px;
  transition: border-color 0.15s;
}
.lf-item:hover {
  border-color: #d4d4d8;
}

.lf-ico {
  font-size: 18px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #ede9e4;
  border-radius: 8px;
  flex-shrink: 0;
}

.lf-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lf-body strong {
  font-size: 13px;
  font-weight: 600;
  color: #18181b;
}
.lf-body span {
  font-size: 12px;
  color: #71717a;
}

/* 구분선 */
.lc-divider {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ld-line {
  flex: 1;
  height: 1px;
  background: #e4e4e7;
}
.ld-text {
  font-size: 11px;
  color: #a1a1aa;
  white-space: nowrap;
  font-weight: 500;
}

/* 로그인 액션 */
.login-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 약관 */
.lc-terms {
  text-align: center;
  font-size: 11px;
  color: #a1a1aa;
  margin: 0;
  line-height: 1.6;
}
.lc-terms a {
  color: #71717a;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: #d4d4d8;
  transition: color 0.15s;
}
.lc-terms a:hover {
  color: #27272a;
}

/* ==============================================
   카카오 / 구글 버튼 (원본 그대로 유지)
============================================== */
.kakao-btn {
  width: 100%;
  height: 40px;
  background-color: #fee500;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0 12px;
  position: relative;
  transition: background-color 0.2s;
}
.kakao-btn:hover {
  background-color: #e6ce00;
}

.kakao-icon-wrapper {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kakao-icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.kakao-btn-text {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: white;
  background-image: none;
  border: 1px solid #747775;
  -webkit-border-radius: 12px;
  border-radius: 12px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  -webkit-transition:
    background-color 0.218s,
    border-color 0.218s,
    box-shadow 0.218s;
  transition:
    background-color 0.218s,
    border-color 0.218s,
    box-shadow 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
  max-width: 100%;
  min-width: min-content;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 10px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  -webkit-align-items: center;
  align-items: center;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  -webkit-flex-grow: 0;
  flex-grow: 0;
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.gsi-material-button-icon {
  position: absolute;
  left: 0;
}

.gsi-material-button .gsi-material-button-state {
  -webkit-transition: opacity 0.218s;
  transition: opacity 0.218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: default;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}
.gsi-material-button:disabled .gsi-material-button-contents {
  opacity: 38%;
}
.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 38%;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state,
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 12%;
}

.gsi-material-button:not(:disabled):hover {
  -webkit-box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 1px 3px 1px rgba(60, 64, 67, 0.15);
  box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.3),
    0 1px 3px 1px rgba(60, 64, 67, 0.15);
}
.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
  background-color: #303030;
  opacity: 8%;
}
</style>
