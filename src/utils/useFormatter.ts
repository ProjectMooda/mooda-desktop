// src/composables/useFormatter.ts
import { useScheduleStore } from '@/stores/useScheduleStore'

export function useFormatter() {
  const store = useScheduleStore()

  // 1. 텍스트 자르기 (이건 상태가 필요 없으니 유틸 함수 그대로 가져와도 됨)
  const truncateText = (text: string | undefined, length: number): string => {
    if (!text) return ''
    return text.length > length ? text.slice(0, length) + '...' : text
  }

  // 2. 동적 우선순위 라벨 반환
  const getPriorityLabel = (priorityId: string): string => {
    const option = store.priorityOptions.find(opt => opt.id === priorityId)
    if (!option) return priorityId // 매칭되는 옵션 없으면 원래 값 반환
    return `${option.emoji} ${option.label}`
  }

  // 3. 동적 색상 반환 (배지 스타일용)
  const getPriorityStyle = (priorityId: string) => {
    const option = store.priorityOptions.find(opt => opt.id === priorityId)
    return option ? { backgroundColor: option.color } : {}
  }

  return {
    truncateText,
    getPriorityLabel,
    getPriorityStyle
  }
}