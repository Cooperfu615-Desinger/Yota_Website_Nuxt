<script setup lang="ts">
const { showLobbyModal, lobbyUrl, closeLobby } = useAppState()
</script>

<template>
  <Teleport to="body">
    <Transition name="lobby-fade">
      <div v-if="showLobbyModal" class="lobby-modal-overlay" role="dialog" aria-modal="true" aria-label="遊戲大廳">
        <!-- 關閉列 -->
        <div class="flex items-center justify-between w-full px-4" style="max-width:900px;">
          <span class="text-sm font-bold" style="color:var(--color-gold);">🎮 遊戲大廳</span>
          <button class="modal-close" style="position:static;" aria-label="關閉大廳" @click="closeLobby">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- iframe 容器 (16:9 橫式) -->
        <div class="lobby-iframe-wrap">
          <template v-if="lobbyUrl">
            <iframe
              :src="lobbyUrl"
              title="遊戲大廳"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </template>
          <div v-else class="lobby-placeholder">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>遊戲載入中...</p>
            <p class="text-xs">（遊戲 URL 由後端 API 提供）</p>
          </div>
        </div>

        <p class="text-xs" style="color:var(--color-text-muted);">建議橫式操作以獲得最佳體驗</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lobby-fade-enter-active,
.lobby-fade-leave-active { transition: opacity 0.2s; }
.lobby-fade-enter-from,
.lobby-fade-leave-to { opacity: 0; }
</style>
