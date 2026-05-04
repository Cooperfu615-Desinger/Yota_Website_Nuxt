<script setup lang="ts">
const sidebarOpen = useState('lobby-sidebar-open', () => false)
const route = useRoute()

function close() { sidebarOpen.value = false }

const navItems = [
  { to: '/lobby',            label: '遊戲大廳', icon: '🎮' },
  { to: '/lobby/events',     label: '活動',     icon: '🎉' },
  { to: '/lobby/leaderboard',label: '排行榜',   icon: '🏆' },
  { to: '/lobby/deposit',    label: '儲值',     icon: '💰' },
  { to: '/lobby/tutorial',   label: '新手教學', icon: '📖' },
  { to: '/lobby/support',    label: '客服中心', icon: '💬' },
]

function isActive(to: string) {
  if (to === '/lobby') return route.path === '/lobby'
  return route.path.startsWith(to)
}
</script>

<template>
  <!-- 手機遮罩 -->
  <div
    v-if="sidebarOpen"
    class="lobby-sidebar-overlay lg:hidden"
    @click="close"
  />

  <aside
    class="lobby-sidebar"
    :class="{ 'lobby-sidebar-open': sidebarOpen }"
  >
    <!-- 手機關閉按鈕 -->
    <button class="lobby-sidebar-close lg:hidden" @click="close" aria-label="關閉選單">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    </button>

    <nav class="lobby-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="lobby-nav-item"
        :class="{ 'lobby-nav-active': isActive(item.to) }"
        @click="close"
      >
        <span class="lobby-nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="lobby-nav-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="lobby-sidebar-footer">
      <NuxtLink to="/" class="lobby-nav-item lobby-nav-site">
        <span class="lobby-nav-icon" aria-hidden="true">🌐</span>
        <span class="lobby-nav-label">官網首頁</span>
      </NuxtLink>
    </div>
  </aside>
</template>
