// @/composables/useScheduleActions.ts
import { useScheduleStore } from '@/stores/useScheduleStore'

export function useScheduleActions() {
  const store = useScheduleStore()

  const handleModalUpdate = (scheduleId: number, payload: any) => {
    if (payload.type === 'add-subtask') {
      store.addSubtask(scheduleId, payload.text)
    }
    // 기타 공통 업데이트 로직들...
  }

  return { handleModalUpdate }
}