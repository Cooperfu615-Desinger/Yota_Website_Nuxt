<script setup lang="ts">
const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()
</script>

<template>
  <LobbyGameBrowser @play="(key, mode) => emit('play', key, mode)" />
</template>
