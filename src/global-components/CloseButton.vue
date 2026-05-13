<template>
  <button 
    class="base-close-btn flex-center" 
    :class="[`variant-${variant}`]"
    @click="$emit('click', $event)"
  >
    <!-- 아이콘을 커스텀하고 싶을 때를 대비해 slot 사용 (기본값: ✕) -->
    <slot>✕</slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  // 'circle' (모달용) 또는 'rounded' (리스트 삭제용)
  variant: {
    type: String,
    default: 'rounded',
    validator: (value: string) => ['circle', 'rounded'].includes(value)
  }
})

defineEmits(['click'])
</script>

<style scoped>
/* 공통 스타일 */
.base-close-btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

/* =======================================
   1. 원형 타입 (모달 닫기 버튼용)
   - 크기: 32px
   - 평소엔 투명, 호버 시 붉은색 배경
======================================= */
.variant-circle {
  width: 32px; 
  height: 32px; 
  border-radius: 50%; /* 완전한 원형 */
  font-size: 16px; 
  background: transparent; 
  color: var(--text-muted, #a1a1aa); 
}

.variant-circle:hover {
  color: var(--color-danger, #ef4444); 
  background-color: var(--color-danger-light, #fee2e2); 
}

/* =======================================
   2. 둥근 사각형 타입 (리스트 아이템 삭제용)
   - 크기: 24px
   - 기본적으로 연한 붉은 배경
======================================= */
.variant-rounded {
  width: 24px; 
  height: 24px; 
  border-radius: 6px; /* 둥근 사각형 */
  font-size: 14px;
  background: #fee2e2; 
  color: #ef4444; 
}

.variant-rounded:hover {
  background: #fca5a5; /* 호버 시 살짝 더 진해짐 */
  color: #dc2626;
}
</style>