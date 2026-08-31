<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin } = useAppState()
const { openProfile } = useMemberProfileState()
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
        <button class="lobby-user-card" aria-label="開啟玩家資料" @click="openProfile">
          <span class="lobby-user-vip">VIP {{ userInfo.vip }}</span>
          <div class="lobby-user-info">
            <span class="lobby-user-name">{{ userInfo.name }}</span>
            <WalletBalances :user="userInfo" variant="compact" />
          </div>
          <div class="lobby-user-avatar">
            <span aria-hidden="true">{{ userInfo.avatar }}</span>
          </div>
        </button>
      </template>
      <template v-else>
        <button class="lobby-header-login-btn" @click="openLogin">登入 / 註冊</button>
      </template>
    </div>
  </header>
</template>
