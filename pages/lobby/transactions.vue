<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
const { isLoggedIn, openLogin } = useAppState()
</script>

<template>
  <div class="lobby-page transactions-page px-4 py-5">
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">📋</div>
        <h1 class="text-xl font-black mb-2">交易紀錄</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可查詢本次工作階段的 Mock 交易狀態</p>
        <button class="btn-gold w-full justify-center" @click="openLogin('/lobby/transactions')">立即登入 / 註冊</button>
      </div>
    </template>
    <template v-else>
      <h1 class="section-title mb-4">交易紀錄</h1>
      <LobbyTransactionRecords hide-header />
    </template>
  </div>
</template>

<style scoped>
.transactions-page{max-width:1180px;margin:0 auto}
</style>
