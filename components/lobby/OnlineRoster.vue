<script setup lang="ts">
import type { OnlinePlayer } from '~/data/siteContent'

const props = defineProps<{ players: OnlinePlayer[] }>()
const emit = defineEmits<{ select: [player: OnlinePlayer]; close: [] }>()

function statusColor(s: string) {
  return s === '在線' ? '#34d399' : s === '遊戲中' ? '#F5C842' : '#9CA3AF'
}
</script>

<template>
  <aside class="roster-panel" @click.stop>
    <header class="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style="border-bottom:1px solid rgba(168,85,247,0.2);">
      <span class="text-sm font-bold" style="color:var(--color-purple-light);">在線玩家 {{ props.players.length }}</span>
      <button aria-label="關閉" style="color:var(--color-text-muted);" @click="emit('close')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </header>
    <ul class="flex-1 overflow-y-auto py-1">
      <li
        v-for="p in props.players"
        :key="p.id"
        class="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
        style="border-bottom:1px solid rgba(168,85,247,0.08);"
        @click="emit('select', p)"
      >
        <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 relative"
              style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
          {{ p.avatar }}
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                :style="`background:${statusColor(p.status)}; border:1.5px solid var(--color-bg-card);`" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-bold truncate" style="color:var(--color-text);">{{ p.name }}</span>
          <span class="block text-xs" style="color:var(--color-text-muted); opacity:0.7;">{{ p.status }}</span>
        </span>
        <span v-if="p.vip > 0" class="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark)); color:#3a2400;">
          V{{ p.vip }}
        </span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.roster-panel {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 78%;
  max-width: 320px;
  background: var(--color-bg-card);
  border-left: 1px solid rgba(168,85,247,0.3);
  box-shadow: -8px 0 24px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  z-index: 20;
  animation: roster-slide 0.22s ease;
}
@keyframes roster-slide {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
</style>
