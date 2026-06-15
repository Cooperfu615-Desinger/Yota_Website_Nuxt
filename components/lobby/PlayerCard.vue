<script setup lang="ts">
import type { OnlinePlayer } from '~/data/siteContent'

const props = defineProps<{ player: OnlinePlayer }>()
const emit = defineEmits<{ message: [player: OnlinePlayer]; close: [] }>()
</script>

<template>
  <div class="card-overlay" @click.self="emit('close')">
    <div class="player-card">
      <button class="card-close" aria-label="關閉" @click="emit('close')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-4xl mx-auto"
           style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.35);">
        {{ props.player.avatar }}
      </div>
      <div class="flex items-center justify-center gap-2 mt-3">
        <span class="text-lg font-bold" style="color:var(--color-text);">{{ props.player.name }}</span>
        <span v-if="props.player.vip > 0" class="text-xs font-bold px-1.5 py-0.5 rounded"
              style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark)); color:#3a2400;">
          VIP {{ props.player.vip }}
        </span>
      </div>
      <p class="text-center text-sm mt-1" style="color:var(--color-text-muted);">{{ props.player.status }}</p>
      <button class="btn-gold w-full justify-center mt-4" @click="emit('message', props.player)">
        私訊
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 24px;
}
.player-card {
  position: relative;
  width: 100%;
  max-width: 280px;
  background: var(--color-bg-card);
  border: 1px solid rgba(168,85,247,0.3);
  border-radius: 18px;
  padding: 28px 20px 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  animation: card-pop 0.18s ease;
}
.card-close {
  position: absolute;
  top: 10px; right: 10px;
  color: var(--color-text-muted);
}
@keyframes card-pop {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
