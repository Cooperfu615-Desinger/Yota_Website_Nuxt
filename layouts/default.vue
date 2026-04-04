<template>
  <div>
    <AppHeader />
    <main class="main-content fade-in">
      <div class="desktop-container">
        <slot />
      </div>
    </main>
    <AppBottomNav />
    <LoginModal />
    <LobbyModal />
  </div>
</template>
