<template>
  <div :class="['base-card', `card-size-${size}`, `shadow-${shadow}`]">
    <header v-if="$slots.header || title" class="card-header shrink-0">
      <slot name="header">
        <h3 v-if="title" class="card-title text-main font-bold">
          {{ title }}
        </h3>
      </slot>
    </header>

    <div :class="['card-body flex-1 min-h-0', { 'no-padding': noPadding }]">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="card-footer shrink-0">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * BaseCard.vue
 * 1~5단계 스케일이 적용된 전역 카드 컴포넌트
 */
withDefaults(
  defineProps<{
    title?: string
    noPadding?: boolean // 리스트나 차트가 꽉 차야 할 때 body 패딩 제거
    shadow?: 'none' | '1' | '2' | '3' // 그림자 뎁스
    size?: 1 | 2 | 3 | 4 | 5 // 카드 스케일 (여백, 둥글기, 폰트 크기 결정)
  }>(),
  {
    title: '',
    noPadding: false,
    shadow: '1',
    size: 3 // 기본 대시보드 위젯 사이즈
  }
)
</script>

<style scoped>
/* =======================================
   BASE 컨테이너 (뼈대만 유지)
======================================= */
.base-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);

  /* 내부 자식이 둥근 모서리를 뚫고 나가는 현상 방지 */
  overflow: hidden;
  transition: all var(--transition-base);
}

/* =======================================
   내부 영역 구조 (크기/패딩은 전역 유틸리티에서 제어)
======================================= */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  margin: 0;
  line-height: var(--leading-tight);
}

.card-body {
  overflow-y: auto;
}

.card-body.no-padding {
  padding: 0 !important;
}

.card-footer {
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-app); /* 시각적 분리를 위한 옅은 배경 */
}
</style>
