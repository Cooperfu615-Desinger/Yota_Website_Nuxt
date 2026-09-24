<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

useSeoMeta({
  title: '優惠 — 巨亨ONLINE',
  description: '輸入優惠碼並確認兌換內容，即可領取對應獎勵。',
})
</script>

<template>
  <div class="lobby-page offers-page px-4 py-5">
    <h1 class="section-title mb-4">優惠</h1>
    <div class="offers-content">
      <LobbyPromoCodePanel />
    </div>
  </div>
</template>

<style scoped>
.offers-page { max-width: 1180px; margin: 0 auto; }
.offers-content { max-width: 760px; }
</style>
