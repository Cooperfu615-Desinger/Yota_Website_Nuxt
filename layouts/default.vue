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
      <LoginModal />
      <LobbyModal />
    </ClientOnly>
  </div>
</template>
