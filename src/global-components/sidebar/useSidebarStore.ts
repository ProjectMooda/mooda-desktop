import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('layout', () => {
  // 이거 3가지 페이지 변경에 가져다가 씀
  const currentTab = ref(1)
  const showSettings = ref(false)
  const menuItems = ref([{ label: 'Calendar' }, { label: 'GoalPlanner' }])

  // sidebar에서 사용되는 함수들
  const setTab = (tabIndex: number) => {
    currentTab.value = tabIndex
  }

  // setting 열고 닫기
  const openSettings = () => {
    showSettings.value = true
  }

  const closeSettings = () => {
    showSettings.value = false
  }

  return {
    currentTab,
    showSettings,
    menuItems,
    setTab,
    openSettings,
    closeSettings
  }
})
