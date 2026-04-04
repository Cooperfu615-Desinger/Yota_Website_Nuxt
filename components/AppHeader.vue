<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin } = useAppState()
const route = useRoute()
</script>

<template>
  <header id="top-nav" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2 no-underline" aria-label="巨亨ONLINE 首頁">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center"
           style="background: linear-gradient(135deg, #6B21A8, #F5C842);">
        <span style="color:#fff; font-size:16px; font-weight:900; letter-spacing:-1px;">巨</span>
      </div>
      <span class="logo-text text-xl">巨亨ONLINE</span>
    </NuxtLink>

    <!-- 右側：未登入 / 已登入 -->
    <div class="flex items-center gap-2">
      <template v-if="!isLoggedIn">
        <button @click="openLogin" class="btn-outline-purple text-sm px-4 py-2" aria-label="登入或註冊">
          登入 / 註冊
        </button>
      </template>
      <template v-else>
        <NuxtLink to="/member" class="flex items-center gap-2 no-underline" aria-label="會員專區">
          <div class="flex flex-col items-end">
            <span class="text-xs font-bold" style="color:var(--color-text);">{{ userInfo.name }}</span>
            <div class="flex items-center gap-1">
              <span class="vip-badge text-xs">VIP {{ userInfo.vip }}</span>
              <span class="text-xs" style="color:var(--color-gold);">
                ${{ userInfo.balance.toLocaleString() }}
              </span>
            </div>
          </div>
          <div class="w-9 h-9 rounded-full flex items-center justify-center"
               style="background:linear-gradient(135deg,#6B21A8,#A855F7); border:2px solid var(--color-gold);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
        </NuxtLink>
      </template>
    </div>
  </header>
</template>
