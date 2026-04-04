<template>
  <div>
    <AppHeader />
    <main class="main-content fade-in">
      <slot />
    </main>
    <AppBottomNav />
    <LoginModal />
    <LobbyModal />
  </div>
</template>
