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
  <div class="lobby-root">
    <LobbyHeader />
    <div class="lobby-body">
      <LobbySidebar />
      <main class="lobby-main">
        <slot />
      </main>
    </div>

    <!-- 精簡頁腳 -->
    <footer class="lobby-footer">
      <p>© 2024 巨亨ONLINE 版權所有｜本平台僅供娛樂，請理性遊戲</p>
    </footer>

    <AppBottomNav />

    <ClientOnly>
      <AgeGateModal />
      <LoginModal />
      <LegalModal />
      <LobbyModal />
      <LogoutConfirmModal />
      <MemberProfileModal />
    </ClientOnly>
  </div>
</template>
