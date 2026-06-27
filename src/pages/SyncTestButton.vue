<template>
  <button
    @click="handleSyncTest"
    style="padding: 10px; background: #3b82f6; color: white; border-radius: 5px"
  >
    동기화 로직 테스트하기
  </button>
</template>

<script setup lang="ts">
import api from '@/axios/axios'

const handleSyncTest = async () => {
  const payload = {
    jobs: [
      {
        entity: 'schedule',
        action: 'CREATE',
        targetId: 'sch9',
        payload: { milestoneId: 'ms1', summary: '스케줄 테스트' },
        timestamp: 1718293000000
      },
      {
        entity: 'milestone',
        action: 'CREATE',
        targetId: 'ms1',
        payload: { goalId: 'g1', title: '마일스톤 테스트' },
        timestamp: 1718292000000
      },
      {
        entity: 'goal',
        action: 'CREATE',
        targetId: 'g1',
        payload: { title: '목표 테스트' },
        timestamp: 1718291000000
      }
    ]
  }

  try {
    console.log('🚀 동기화 테스트 요청 시작...')
    // 이미 axios 인터셉터에서 Bearer 토큰을 넣어주고 있으므로 여기선 그냥 보내면 됩니다.
    const res = await api.post('/sync', payload)
    console.log('✅ 서버 응답:', res.data)
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  }
}
</script>
