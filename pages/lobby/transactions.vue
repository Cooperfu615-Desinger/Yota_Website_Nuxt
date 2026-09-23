<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

await navigateTo('/lobby/vault?tab=records', { replace: true })
</script>

<template>
  <span aria-hidden="true" />
</template>
