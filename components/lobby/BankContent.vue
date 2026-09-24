<script setup lang="ts">
const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
</script>

<template>
  <div class="lobby-page bank-page px-4 py-5">
    <template v-if="!isLoggedIn"><div class="card-purple p-8 text-center max-w-sm mx-auto mt-8"><div class="text-5xl mb-4">🏦</div><h1 class="text-xl font-black mb-2">儲值</h1><p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可使用官網儲值渠道</p><button class="btn-gold w-full justify-center" @click="openLogin(route.fullPath)">立即登入 / 註冊</button></div></template>
    <template v-else>
      <h1 class="section-title mb-4">儲值</h1>
      <SharedDepositContent embedded :show-activity-tab="false" />
    </template>
  </div>
</template>

<style scoped>
.bank-page{max-width:1180px;margin:0 auto}
</style>
