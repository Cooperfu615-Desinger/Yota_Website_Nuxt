<script setup lang="ts">
const sidebarMobileOpen      = useState('lobby-sidebar-mobile-open',      () => false)
const sidebarDesktopCollapsed = useState('lobby-sidebar-desktop-collapsed', () => false)
const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
const { openLogoutConfirm } = useLogoutState()

function closeMobile() { sidebarMobileOpen.value = false }

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  if (to === '/lobby') return route.path === '/lobby'
  if (to === '/lobby/bank') return route.path === '/lobby/bank' || route.path === '/lobby/deposit'
  return route.path === to || route.path.startsWith(`${to}/`)
}

const navSections = [
  [{ to: '/', label: '首頁', icon: '⌂' }],
  [{ to: '/lobby', label: '遊戲大廳', icon: '🎮' }],
  [
    { to: '/lobby/daily', label: '每日任務', icon: '📅' },
    { to: '/lobby/events', label: '活動', icon: '🎉' },
    { to: '/lobby/leaderboard', label: '排行榜', icon: '🏆' },
    { to: '/lobby/bank', label: '儲值', icon: '🏦' },
  ],
  [
    { to: '/lobby/member', label: '個人資訊', icon: '👤' },
    { to: '/lobby/vault', label: '保險箱/贈禮', icon: '🔐' },
    { to: '/lobby/inbox', label: '信箱', icon: '📬' },
    { to: '/lobby/gifts', label: '獎勵卡', icon: '🎁' },
    { to: '/lobby/chat', label: '聊天', icon: '💬' },
    { to: '/lobby/exchange', label: '兌換', icon: '⇄' },
    { to: '/lobby/transactions', label: '交易紀錄', icon: '📋' },
    { to: '/lobby/settings', label: '設置', icon: '⚙️' },
  ],
  [
    { to: '/lobby/tutorial', label: '新手教學', icon: '📖' },
    { to: '/lobby/support', label: '客服中心', icon: '🎧' },
  ],
]

const protectedPaths = new Set([
  '/lobby/daily', '/lobby/bank', '/lobby/member', '/lobby/vault', '/lobby/inbox',
  '/lobby/gifts', '/lobby/chat', '/lobby/exchange', '/lobby/transactions', '/lobby/settings',
])

function handleNavigation(event: MouseEvent, to: string) {
  closeMobile()
  if (!protectedPaths.has(to) || isLoggedIn.value) return
  event.preventDefault()
  openLogin(to)
}
</script>

<template>
  <!-- 手機遮罩 -->
  <Transition name="sidebar-overlay">
    <div
      v-if="sidebarMobileOpen"
      class="lobby-sidebar-overlay lg:hidden"
      @click="closeMobile"
    />
  </Transition>

  <aside
    class="lobby-sidebar"
    :class="{
      'sidebar-mobile-open': sidebarMobileOpen,
      'sidebar-desktop-collapsed': sidebarDesktopCollapsed,
    }"
  >
    <nav class="lobby-nav">
      <template v-for="(section, sectionIndex) in navSections" :key="sectionIndex">
        <div v-if="sectionIndex > 0" class="lobby-nav-divider" aria-hidden="true" />
        <NuxtLink
          v-for="item in section"
          :key="item.to"
          :to="item.to"
          class="lobby-nav-item"
          :class="{ 'lobby-nav-active': isActive(item.to) }"
          :title="sidebarDesktopCollapsed ? item.label : undefined"
          @click="handleNavigation($event, item.to)"
        >
          <span class="lobby-nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="lobby-nav-label">{{ item.label }}</span>
        </NuxtLink>
      </template>
    </nav>

    <div v-if="isLoggedIn" class="lobby-sidebar-footer">
      <button
        class="lobby-nav-item lobby-nav-logout"
        :title="sidebarDesktopCollapsed ? '登出' : undefined"
        @click="closeMobile(); openLogoutConfirm()"
      >
        <span class="lobby-nav-icon" aria-hidden="true">⇥</span>
        <span class="lobby-nav-label">登出</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active { transition: opacity 0.3s; }
.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to   { opacity: 0; }
</style>
