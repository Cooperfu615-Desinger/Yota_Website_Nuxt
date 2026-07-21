<script setup lang="ts">
const { initFromStorage } = useAppState()
const { initSocialFromStorage } = useSocialState()
const { initPreferences } = usePreferencesState()
onMounted(() => {
  initFromStorage()
  initSocialFromStorage()
  initPreferences()
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
      <AgeGateModal />
      <LoginModal />
      <LegalModal />
      <LobbyModal />
    </ClientOnly>
  </div>
</template>
