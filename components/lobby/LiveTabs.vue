<script setup lang="ts">
defineProps<{ items: { id: string; label: string }[]; modelValue: string; label: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <div class="live-tabs" role="group" :aria-label="label">
    <button v-for="item in items" :key="item.id" type="button" :aria-pressed="modelValue === item.id" @click="$emit('update:modelValue', item.id)">{{ item.label }}</button>
  </div>
</template>
