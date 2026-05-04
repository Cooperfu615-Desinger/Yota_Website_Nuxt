<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin } = useAppState()

const sidebarOpen = useState('lobby-sidebar-open', () => false)
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
</script>

<template>
  <header class="lobby-header">
    <!-- 漢堡選單（手機） -->
    <button class="lobby-header-burger lg:hidden" @click="toggleSidebar" aria-label="開啟選單">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
        <path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Logo -->
    <NuxtLink to="/lobby" class="lobby-header-logo">
      <span class="lobby-logo-text">巨亨</span>
      <span class="lobby-logo-sub">ONLINE</span>
    </NuxtLink>

    <!-- 右側使用者區 -->
    <div class="lobby-header-right">
      <template v-if="isLoggedIn">
        <div class="lobby-header-balance">
          <span class="lobby-balance-label">餘額</span>
          <span class="lobby-balance-val">${{ userInfo.balance.toLocaleString() }}</span>
        </div>
        <button class="lobby-header-deposit-btn" @click="$router.push('/deposit')">儲值</button>
        <div class="lobby-header-avatar" @click="$router.push('/member')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
          </svg>
          <span class="hidden sm:inline">{{ userInfo.name }}</span>
        </div>
      </template>
      <template v-else>
        <button class="lobby-header-login-btn" @click="openLogin">登入 / 註冊</button>
      </template>
    </div>
  </header>
</template>
