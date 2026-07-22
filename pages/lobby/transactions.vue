<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
const { isLoggedIn, openLogin, userInfo } = useAppState()
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
      <header class="transactions-hero">
        <div><p>ACCOUNT ACTIVITY</p><h1>交易紀錄</h1><span>儲值、保險箱、贈禮、兌換與獎勵紀錄集中顯示；重新整理後回到 Mock 初始資料</span></div>
        <WalletBalances :user="userInfo" variant="cards" />
      </header>
      <LobbyTransactionRecords hide-header />
    </template>
  </div>
</template>

<style scoped>
.transactions-page{max-width:1180px;margin:0 auto}.transactions-hero{display:grid;grid-template-columns:1fr minmax(300px,430px);align-items:end;gap:24px;padding:18px 0 20px}.transactions-hero p{margin:0 0 3px;color:var(--color-gold);font-size:10px;font-weight:900;letter-spacing:.18em}.transactions-hero h1{margin:0;font-size:30px;font-weight:900}.transactions-hero span{color:var(--color-text-muted);font-size:11px}@media(max-width:800px){.transactions-hero{grid-template-columns:1fr}}
</style>
