<script setup lang="ts">
const { initFromStorage } = useAppState()
onMounted(() => { initFromStorage() })
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
