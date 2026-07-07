<script setup lang="ts">
const sidebarMobileOpen      = useState('lobby-sidebar-mobile-open',      () => false)
const sidebarDesktopCollapsed = useState('lobby-sidebar-desktop-collapsed', () => false)
const route = useRoute()

function closeMobile() { sidebarMobileOpen.value = false }

function isActive(to: string) {
  if (to === '/lobby') return route.path === '/lobby'
  return route.path.startsWith(to)
}

// 各分區導覽項目
const section1 = [
  { to: '/lobby',             label: '遊戲大廳', icon: '🎮' },
]
const section2 = [
  { to: '/lobby/daily',       label: '每日任務', icon: '📅' },
  { to: '/lobby/events',      label: '活動',     icon: '🎉' },
  { to: '/lobby/leaderboard', label: '排行榜',   icon: '🏆' },
]
const section3 = [
  { to: '/lobby/member',   label: '個人資訊', icon: '👤' },
  { to: '/lobby/bank',     label: '銀行',     icon: '🏦' },
  { to: '/lobby/vault',    label: '保險箱/贈禮', icon: '🔐' },
  { to: '/lobby/inbox',    label: '信箱',     icon: '📬' },
  { to: '/lobby/chat',     label: '聊天',     icon: '💬' },
  { to: '/lobby/settings', label: '設置',     icon: '⚙️' },
]
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

      <!-- ── 第一區：遊戲 ── -->
      <NuxtLink
        v-for="item in section1"
        :key="item.to"
        :to="item.to"
        class="lobby-nav-item"
        :class="{ 'lobby-nav-active': isActive(item.to) }"
        :title="sidebarDesktopCollapsed ? item.label : undefined"
        @click="closeMobile"
      >
        <span class="lobby-nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="lobby-nav-label">{{ item.label }}</span>
      </NuxtLink>

      <!-- 分隔線 -->
      <div class="lobby-nav-divider" aria-hidden="true" />

      <!-- ── 第二區：活動 / 排行榜 ── -->
      <NuxtLink
        v-for="item in section2"
        :key="item.to"
        :to="item.to"
        class="lobby-nav-item"
        :class="{ 'lobby-nav-active': isActive(item.to) }"
        :title="sidebarDesktopCollapsed ? item.label : undefined"
        @click="closeMobile"
      >
        <span class="lobby-nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="lobby-nav-label">{{ item.label }}</span>
      </NuxtLink>

      <!-- 分隔線 -->
      <div class="lobby-nav-divider" aria-hidden="true" />

      <!-- ── 第三區：個人 / 帳務 ── -->
      <NuxtLink
        v-for="item in section3"
        :key="item.to"
        :to="item.to"
        class="lobby-nav-item"
        :class="{ 'lobby-nav-active': isActive(item.to) }"
        :title="sidebarDesktopCollapsed ? item.label : undefined"
        @click="closeMobile"
      >
        <span class="lobby-nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="lobby-nav-label">{{ item.label }}</span>
      </NuxtLink>

    </nav>

    <!-- 底部：返回官網 -->
    <div class="lobby-sidebar-footer">
      <NuxtLink
        to="/"
        class="lobby-nav-item lobby-nav-site"
        :title="sidebarDesktopCollapsed ? '官網首頁' : undefined"
        @click="closeMobile"
      >
        <span class="lobby-nav-icon" aria-hidden="true">🌐</span>
        <span class="lobby-nav-label">官網首頁</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active { transition: opacity 0.3s; }
.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to   { opacity: 0; }
</style>
