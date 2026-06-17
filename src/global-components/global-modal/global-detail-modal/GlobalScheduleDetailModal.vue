<template>
  <GlobalScheduleModalLayout
    :is-open="isOpen"
    :show-header="false"
    @close="handleCloseModal"
  >
    <div class="title-date-row">
      <GlobalScheduleTitle
        v-model="localData.summary"
        placeholder="할 일 제목을 입력하세요"
        class="title-input"
      />
      <GlobalDatePicker
        v-model="localData.startDate"
        v-model:multiple-dates="localData.additionalDates"
        align="right"
        :min-date="props.minDate"
        :max-date="props.maxDate"
      />
    </div>

    <div class="form-section">
      <label class="section-label">시간</label>
      <div class="datetime-row">
        <div class="time-inputs">
          <BaseTimePicker
            v-model="localData.startTime"
            class="fixed-time-picker tabular-nums"
          />
          <span class="time-sep">→</span>
          <BaseTimePicker
            v-model="localData.endTime"
            class="fixed-time-picker tabular-nums"
          />
        </div>
      </div>
    </div>

    <GlobalScheduleMeta
      v-model:category="localData.category"
      v-model:priority="localData.priority"
    />

    <GlobalSubtaskCard v-model="localData.subtasks" />

    <template #footer-left>
      <BaseButton variant="danger" :size="3" @click.stop="$emit('delete')">
        삭제
      </BaseButton>
    </template>
    <template #footer-right>
      <BaseButton variant="primary" :size="3" @click="handleSaveAndClose">
        저장
      </BaseButton>
    </template>
  </GlobalScheduleModalLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GlobalScheduleModalLayout from './GlobalScheduleModalLayout.vue'
import BaseTimePicker from '@/base-ui/BaseTimePicker.vue'
import BaseButton from '@/base-ui/BaseButton.vue'
import { useScheduleStore, type ScheduleItem } from '@/stores/useScheduleStore'
import GlobalScheduleTitle from '../global-detail-modal/schedule-form/GlobalScheduleTitle.vue'
import GlobalScheduleMeta from '../global-detail-modal/schedule-form/GlobalScheduleMeta.vue'
import GlobalDatePicker from '@/global-components/global-calendar/GlobalDatePicker.vue'

// 🌟 서브태스크 컴포넌트 임포트 (경로는 프로젝트 설정에 맞게 조정해주세요)
import GlobalSubtaskCard from './schedule-form/GlobalSubtaskCard.vue'
const store = useScheduleStore()

const props = defineProps<{
  isOpen: boolean
  data: ScheduleItem
  minDate?: string
  maxDate?: string
}>()
const emit = defineEmits(['close', 'delete', 'update'])

interface LocalDataType extends Partial<ScheduleItem> {
  additionalDates?: string[]
}

const localData = ref<LocalDataType>({})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.data) {
      let loadedAdditionalDates: string[] = []

      if (props.data.creationMode === 'multiple' && props.data.groupId) {
        const groupItems = store.schedules.filter(
          (s) => s.groupId === props.data.groupId && s.id !== props.data.id
        )
        loadedAdditionalDates = groupItems
          .map((s) => s.startDate)
          .filter(Boolean)
      }

      localData.value = {
        ...props.data,
        additionalDates: loadedAdditionalDates,
        subtasks: props.data.subtasks
          ? props.data.subtasks.map((s) => ({ ...s }))
          : []
      }
    }
  },
  { immediate: true }
)

const handleCloseModal = () => {
  emit('close')
}

const handleSaveAndClose = () => {
  if (localData.value.subtasks && localData.value.subtasks.length > 0) {
    const total = localData.value.subtasks.length
    const completed = localData.value.subtasks.filter((s) => s.done).length
    localData.value.done = total === completed
  }

  const { additionalDates, ...baseDataToSave } = localData.value

  const allSelectedDates = Array.from(
    new Set(
      [baseDataToSave.startDate, ...(additionalDates || [])].filter(Boolean)
    )
  ).sort() as string[]

  delete baseDataToSave.endDate

  store.syncMultipleSchedules(
    props.data.id,
    baseDataToSave as Partial<ScheduleItem>,
    allSelectedDates
  )

  emit('update')
  handleCloseModal()
}
</script>

<style scoped>
/* ==========================================
    Title & Date Section
========================================== */
.title-date-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  padding-bottom: 16px;
  border-bottom: 1.5px solid var(--border-color);
}

.title-input {
  flex: 1 1 0;
  min-width: 0;
}

/* ==========================================
    Date & Time Section
========================================== */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.datetime-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.datetime-box {
  flex: 0 0 140px;
  width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  padding: 0 12px;
  height: 42px;
  transition: border-color 0.2s ease;
  cursor: pointer;
  box-shadow: var(--shadow-1);
  box-sizing: border-box;
}
.datetime-box:focus-within,
.datetime-box:hover {
  border-color: var(--color-primary-light);
}

.datetime-box i {
  font-size: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.hidden-native-input {
  border: none;
  background: transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  width: 100%;
  cursor: pointer;
  min-width: 0;
}

/* 시간 입력칸 */
.time-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.fixed-time-picker {
  flex: 1;
  height: 42px;
  border-radius: 8px !important;
  padding: 0 12px;
}

.fixed-time-picker :deep(.empty-state) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-sep {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}
</style>
