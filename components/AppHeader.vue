<script setup lang="ts">
const route = useRoute()

const navLinks = [
  { to: '/',           label: '首頁' },
  { to: '/events',     label: '活動' },
  { to: '/leaderboard',label: '排行榜' },
  { to: '/deposit',    label: '儲值' },
  { to: '/tutorial',   label: '新手教學' },
  { to: '/support',    label: '客服中心' },
]
</script>

<template>
  <header id="top-nav" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2 no-underline flex-shrink-0" aria-label="巨亨ONLINE 首頁">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center"
           style="background: linear-gradient(135deg, #6B21A8, #F5C842);">
        <span style="color:#fff; font-size:16px; font-weight:900; letter-spacing:-1px;">巨</span>
      </div>
      <span class="logo-text text-xl">巨亨ONLINE</span>
    </NuxtLink>

    <!-- 桌面版中央導覽連結 -->
    <nav class="hidden lg:flex items-center gap-1" aria-label="主要導覽">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all no-underline"
        :class="route.path === link.to
          ? 'text-white'
          : 'hover:text-white'"
        :style="route.path === link.to
          ? 'background:rgba(124,58,237,0.3); color:var(--color-gold); border:1px solid rgba(124,58,237,0.4);'
          : 'color:var(--color-text-muted); border:1px solid transparent;'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="hidden lg:block w-24 flex-shrink-0" aria-hidden="true" />
  </header>
</template>
