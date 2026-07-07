<script setup lang="ts">
const { isLoggedIn, userInfo } = useAppState()
const route = useRoute()
const { drawerOpen, closeDrawer } = useMobileMenuState()

const navLinks = [
  { to: '/',           label: '首頁' },
  { to: '/events',     label: '活動' },
  { to: '/leaderboard',label: '排行榜' },
  { to: '/deposit',    label: '儲值' },
  { to: '/tutorial',   label: '新手教學' },
  { to: '/support',    label: '客服中心' },
]

// 抽屜導覽（手機版，順序依需求）
const drawerLinks = [
  { to: '/deposit',    label: '儲值',    icon: '💰' },
  { to: '/events',     label: '活動',    icon: '🎉' },
  { to: '/leaderboard',label: '排行榜',  icon: '🏆' },
  { to: '/tutorial',   label: '新手教學',icon: '📖' },
  { to: '/support',    label: '客服中心',icon: '🎧' },
  { to: '/',           label: '回首頁',  icon: '🏠' },
]

watch(() => route.path, () => closeDrawer())
</script>

<template>
  <header id="top-nav" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6">

    <!-- 左側群組：Logo（手機選單入口已移到底部導覽列） -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 no-underline flex-shrink-0" aria-label="巨亨ONLINE 首頁">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center"
             style="background: linear-gradient(135deg, #6B21A8, #F5C842);">
          <span style="color:#fff; font-size:16px; font-weight:900; letter-spacing:-1px;">巨</span>
        </div>
        <span class="logo-text text-xl">巨亨ONLINE</span>
      </NuxtLink>
    </div>

    <!-- 桌面版中央導覽連結 -->
    <nav class="hidden lg:flex items-center gap-1" aria-label="主要導覽">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all no-underline"
        :class="route.path === link.to ? 'text-white' : 'hover:text-white'"
        :style="route.path === link.to
          ? 'background:rgba(124,58,237,0.3); color:var(--color-gold); border:1px solid rgba(124,58,237,0.4);'
          : 'color:var(--color-text-muted); border:1px solid transparent;'"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <!-- 右側：登入 / 用戶資訊 -->
    <template v-if="isLoggedIn">
      <NuxtLink to="/lobby/member" class="flex items-center gap-2 no-underline lg:hidden" aria-label="會員專區">
        <div class="flex flex-col items-end min-w-[112px]">
          <span class="text-xs font-bold truncate" style="color:var(--color-text); max-width:92px; line-height:1;">{{ userInfo.name }}</span>
          <div class="flex items-center gap-1 self-end">
            <span class="vip-badge text-xs">VIP {{ userInfo.vip }}</span>
          </div>
          <WalletBalances :user="userInfo" variant="compact" />
        </div>
        <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
             style="background:linear-gradient(135deg,#6B21A8,#A855F7); border:2px solid var(--color-gold);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
          </svg>
        </div>
      </NuxtLink>
    </template>

    <div class="hidden lg:block w-24 flex-shrink-0" aria-hidden="true" />
  </header>

  <!-- 手機抽屜（ClientOnly 避免 SSG Teleport hydration mismatch） -->
  <ClientOnly>
    <Teleport to="body">
      <Transition name="drawer-overlay">
        <div
          v-if="drawerOpen"
          class="fixed inset-0 z-[300]"
          style="bottom:calc(var(--bottom-nav-h) + env(safe-area-inset-bottom)); background:rgba(0,0,0,0.55);"
          aria-hidden="true"
          @click="closeDrawer"
        />
      </Transition>

      <Transition name="drawer-slide">
        <nav
          v-if="drawerOpen"
          class="fixed top-0 left-0 bottom-0 z-[301] flex flex-col"
          style="width:260px; bottom:calc(var(--bottom-nav-h) + env(safe-area-inset-bottom)); background:linear-gradient(180deg,#1a003e 0%,#0f0020 100%); border-right:1px solid rgba(168,85,247,0.2); box-shadow:4px 0 32px rgba(0,0,0,0.5);"
          aria-label="手機導覽選單"
        >
          <!-- 抽屜頂部 Logo -->
          <div class="flex items-center px-5 py-4" style="border-bottom:1px solid rgba(168,85,247,0.15);">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   style="background:linear-gradient(135deg,#6B21A8,#F5C842);">
                <span style="color:#fff; font-size:14px; font-weight:900;">巨</span>
              </div>
              <span class="font-black text-base" style="color:var(--color-text);">巨亨ONLINE</span>
            </div>
          </div>

          <!-- 導覽項目 -->
          <div class="flex-1 overflow-y-auto py-3">
            <NuxtLink
              v-for="link in drawerLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 px-5 py-3.5 no-underline transition-all"
              :style="route.path === link.to
                ? 'background:rgba(124,58,237,0.2); border-left:3px solid var(--color-purple-light); color:var(--color-purple-light);'
                : 'color:var(--color-text-muted); border-left:3px solid transparent;'"
              @click="closeDrawer"
            >
              <span class="text-xl w-7 text-center">{{ link.icon }}</span>
              <span class="font-bold text-sm">{{ link.label }}</span>
            </NuxtLink>
          </div>

          <!-- 底部版權 -->
          <div class="px-5 py-4" style="border-top:1px solid rgba(168,85,247,0.12); color:var(--color-text-muted); font-size:11px;">
            © 2024 巨亨ONLINE 版權所有
          </div>
        </nav>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.drawer-overlay-enter-active, .drawer-overlay-leave-active { transition: opacity 0.25s; }
.drawer-overlay-enter-from, .drawer-overlay-leave-to { opacity: 0; }

.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.28s ease; }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(-100%); }
</style>
