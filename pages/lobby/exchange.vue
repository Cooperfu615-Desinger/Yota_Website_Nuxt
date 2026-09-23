<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

await navigateTo('/lobby/vault?tab=exchange', { replace: true })
</script>

<template>
  <span aria-hidden="true" />
</template>
