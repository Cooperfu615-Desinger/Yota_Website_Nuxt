<script setup lang="ts">
const { openLobby } = useAppState()
const route = useRoute()

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav id="bottom-nav" class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2" aria-label="主要導覽">
    <!-- 首頁 -->
    <NuxtLink to="/" class="bottom-nav-item" :class="{ active: isActive('/') }" aria-label="首頁">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      <span>首頁</span>
    </NuxtLink>

    <!-- 活動 -->
    <NuxtLink to="/events" class="bottom-nav-item" :class="{ active: isActive('/events') }" aria-label="熱門活動">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>活動</span>
    </NuxtLink>

    <!-- 中央大廳按鈕 -->
    <button
      class="bottom-nav-center"
      aria-label="進入遊戲大廳"
      @click="openLobby('https://example.com/h5')"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
      </svg>
      <span>大廳</span>
    </button>

    <!-- 排行榜 -->
    <NuxtLink to="/leaderboard" class="bottom-nav-item" :class="{ active: isActive('/leaderboard') }" aria-label="排行榜">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2M4 20h16"/>
      </svg>
      <span>排行榜</span>
    </NuxtLink>

    <!-- 會員 -->
    <NuxtLink to="/member" class="bottom-nav-item" :class="{ active: isActive('/member') }" aria-label="會員專區">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      <span>會員</span>
    </NuxtLink>
  </nav>
</template>
