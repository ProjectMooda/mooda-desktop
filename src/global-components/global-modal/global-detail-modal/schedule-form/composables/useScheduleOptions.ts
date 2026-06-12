import { computed } from 'vue'
import { useScheduleStore } from '@/stores/useScheduleStore'

export function useScheduleOptions() {
  const store = useScheduleStore()

  const goalOptions = computed(() => [
    { label: '선택 안 함 (독립 일정)', value: null },
    ...store.goals.map((g) => ({ label: g.title, value: g.id }))
  ])

  const categoryOptions = computed(() => [
    { label: '카테고리 없음', value: '' },
    ...store.categories.map((cat) => ({ label: cat, value: cat }))
  ])

  const priorityOptions = computed(() => [
    { label: '선택 안 함', value: '' },
    ...store.priorityOptions.map((pri) => ({
      label: `${pri.emoji} ${pri.label}`,
      value: pri.id
    }))
  ])

  return {
    goalOptions,
    categoryOptions,
    priorityOptions
  }
}
