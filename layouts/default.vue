<script setup lang="ts">
const { initFromStorage } = useAppState()
const { initSocialFromStorage } = useSocialState()
onMounted(() => {
  initFromStorage()
  initSocialFromStorage()
})
</script>

<template>
  <div>
    <AppHeader />
    <main class="main-content fade-in">
      <div class="desktop-container">
        <slot />
      </div>
    </main>
    <AppFooter />
    <AppBottomNav />
    <ClientOnly>
      <FloatingPanels />
      <LoginModal />
      <LobbyModal />
    </ClientOnly>
  </div>
</template>
