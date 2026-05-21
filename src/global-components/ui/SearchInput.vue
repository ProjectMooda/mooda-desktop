<!-- src/global-components/ui/SearchInput.vue -->
<template>
  <div class="search-wrapper">
    <span class="search-icon">🔍</span>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="s-input search-input"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '검색어를 입력하세요...'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #a1a1aa;
}

/* s-input의 기본 스타일 (다른 곳과 일관성을 위해 포함) */
.s-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  color: #27272a;
}
.s-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 검색바 특화 스타일 */
.search-input {
  padding-left: 38px;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
