<script setup lang="ts">
const { isLoggedIn, openLogin } = useAppState()
const router = useRouter()
const route = useRoute()
const { openDrawer } = useMobileMenuState()
const { openAgeGate } = useAgeGateState()
const lobbySidebarMobileOpen = useState('lobby-sidebar-mobile-open', () => false)

const isActive = (path: string) => route.path === path
const inLobby = computed(() => route.path === '/lobby' || route.path.startsWith('/lobby/'))
const isLobbyActive = computed(() => route.path === '/lobby')
const shopPath = computed(() => inLobby.value ? '/lobby/bank' : '/deposit')
const shopActive = computed(() => inLobby.value ? route.path === '/lobby/bank' : route.path === '/deposit')

function handleMenu() {
  if (inLobby.value) {
    lobbySidebarMobileOpen.value = true
    return
  }
  openDrawer()
}

function handleLobby() {
  if (isLoggedIn.value) {
    openAgeGate(() => router.push('/lobby'))
  } else {
    openLogin()
  }
}

function pushProtected(path: string) {
  if (isLoggedIn.value) {
    router.push(path)
  } else {
    openLogin()
  }
}
</script>

<template>
  <nav id="bottom-nav" class="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around px-2" aria-label="主要導覽">
    <!-- 選單 -->
    <button class="bottom-nav-item" type="button" aria-label="開啟選單" @click="handleMenu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h12M4 12h16M4 17h8"/>
      </svg>
      <span>選單</span>
    </button>

    <!-- 商城 -->
    <NuxtLink :to="shopPath" class="bottom-nav-item" :class="{ active: shopActive }" aria-label="商城">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16l-2 12H6L4 7Zm0 0 1-3h3m3 8h2m-1-1v2"/>
      </svg>
      <span>商城</span>
    </NuxtLink>

    <!-- 中央遊戲按鈕 -->
    <button
      class="bottom-nav-center"
      :class="{ active: isLobbyActive }"
      aria-label="進入遊戲"
      @click="handleLobby"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
      </svg>
      <span>遊戲</span>
    </button>

    <!-- 信箱 -->
    <button
      class="bottom-nav-item"
      type="button"
      :class="{ active: isActive('/lobby/inbox') }"
      aria-label="信箱"
      @click="pushProtected('/lobby/inbox')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16v12H4V6Zm0 0 8 7 8-7"/>
      </svg>
      <span>信箱</span>
    </button>

    <!-- 聊天 -->
    <button
      class="bottom-nav-item"
      type="button"
      :class="{ active: isActive('/lobby/chat') }"
      aria-label="聊天"
      @click="pushProtected('/lobby/chat')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.3 10.3 0 0 1-3.62-.64L3 20l1.54-3.7A6.56 6.56 0 0 1 3 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5Z"/>
      </svg>
      <span>聊天</span>
    </button>
  </nav>
</template>
