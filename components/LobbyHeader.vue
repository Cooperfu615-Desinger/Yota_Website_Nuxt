<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin } = useAppState()
const router = useRouter()
</script>

<template>
  <header class="lobby-header">
    <!-- Logo -->
    <NuxtLink to="/lobby" class="lobby-header-logo">
      <span class="lobby-logo-text">巨亨</span>
      <span class="lobby-logo-sub">ONLINE</span>
    </NuxtLink>

    <!-- 右側使用者區 -->
    <div class="lobby-header-right">
      <template v-if="isLoggedIn">
        <!-- 統一樣式：VIP 徽章 + 姓名/錢包 + 頭像 -->
        <button class="lobby-user-card" aria-label="個人資訊" @click="router.push('/lobby/member')">
          <span class="lobby-user-vip">VIP {{ userInfo.vip }}</span>
          <div class="lobby-user-info">
            <span class="lobby-user-name">{{ userInfo.name }}</span>
            <WalletBalances :user="userInfo" variant="compact" />
          </div>
          <div class="lobby-user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </template>
      <template v-else>
        <button class="lobby-header-login-btn" @click="openLogin">登入 / 註冊</button>
      </template>
    </div>
  </header>
</template>
