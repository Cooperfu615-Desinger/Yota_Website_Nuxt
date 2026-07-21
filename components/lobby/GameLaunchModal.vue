<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'

const props = defineProps<{ gameKey: string; mode: 'real' | 'demo' }>()
const emit = defineEmits<{ close: []; quick: []; seats: [] }>()
const allGames: GameItem[] = [...siteContent.games, ...siteContent.lobbyGames] as GameItem[]
const game = computed(() => allGames.find(item => item.key === props.gameKey))
const { resolvePublicAsset } = usePublicAssetPath()
</script>

<template>
  <Teleport to="body">
    <Transition name="launch-fade" appear>
      <div class="launch-overlay" role="dialog" aria-modal="true" aria-label="選擇遊戲進入方式" @click.self="emit('close')">
        <article class="launch-panel">
          <button class="launch-close" aria-label="關閉" @click="emit('close')">×</button>
          <div class="launch-art" :style="game?.imageSrc ? undefined : { background: `linear-gradient(135deg,${game?.color || '#7c3aed'},#120423)` }">
            <img v-if="game?.imageSrc" :src="resolvePublicAsset(game.imageSrc)" :alt="game.name" />
            <div class="launch-mode">{{ mode === 'real' ? '真錢模式' : '試玩模式' }}</div>
          </div>
          <div class="launch-copy"><p>GAME ENTRY</p><h2>{{ game?.name || '遊戲' }}</h2><span>{{ game?.provider }}・RTP {{ game?.rtp }}</span></div>
          <div class="launch-options">
            <button class="launch-option quick" @click="emit('quick')"><span>QUICK PLAY</span><strong>快速遊玩</strong><small>系統自動配置空閒機台</small><b>立即進入 →</b></button>
            <button class="launch-option seats" @click="emit('seats')"><span>SEAT MAP</span><strong>選擇機台</strong><small>查看即時狀態與機台統計</small><b>開啟選位 →</b></button>
          </div>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.launch-fade-enter-active,.launch-fade-leave-active{transition:opacity .2s}.launch-fade-enter-from,.launch-fade-leave-to{opacity:0}.launch-overlay{position:fixed;inset:0;z-index:1070;display:grid;place-items:center;padding:18px;background:rgba(5,0,15,.84);backdrop-filter:blur(12px)}.launch-panel{position:relative;width:min(560px,100%);overflow:hidden;border:1px solid rgba(245,200,66,.28);border-radius:25px;background:linear-gradient(155deg,#21103a,#10051f);box-shadow:0 30px 90px rgba(0,0,0,.6)}.launch-close{position:absolute;top:14px;right:14px;z-index:2;width:36px;height:36px;border:1px solid rgba(255,255,255,.2);border-radius:50%;color:#fff;background:rgba(5,0,15,.66);font-size:24px}.launch-art{position:relative;height:190px;overflow:hidden}.launch-art::after{position:absolute;inset:40% 0 0;content:"";background:linear-gradient(transparent,#18082b)}.launch-art img{width:100%;height:100%;object-fit:cover}.launch-mode{position:absolute;left:18px;top:16px;z-index:1;padding:6px 9px;border:1px solid rgba(245,200,66,.35);border-radius:999px;color:var(--color-gold);background:rgba(15,0,32,.75);font-size:10px;font-weight:900}.launch-copy{position:relative;margin-top:-42px;padding:0 24px 20px;z-index:1}.launch-copy p{margin:0;color:var(--color-gold);font-size:9px;font-weight:900;letter-spacing:.18em}.launch-copy h2{margin:3px 0;color:#fff;font-size:26px}.launch-copy span{color:var(--color-text-muted);font-size:11px}.launch-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 24px 25px}.launch-option{display:flex;min-height:155px;flex-direction:column;align-items:flex-start;padding:18px;border:1px solid var(--color-border);border-radius:17px;color:#fff;background:rgba(168,85,247,.07);text-align:left}.launch-option>span{color:var(--color-purple-light);font-size:8px;font-weight:900;letter-spacing:.16em}.launch-option strong{margin:8px 0 3px;font-size:17px}.launch-option small{color:var(--color-text-muted);font-size:10px;line-height:1.5}.launch-option b{margin-top:auto;color:var(--color-gold);font-size:11px}.launch-option.quick{border-color:rgba(245,200,66,.25);background:linear-gradient(145deg,rgba(245,200,66,.12),rgba(245,200,66,.03))}.launch-option:hover{transform:translateY(-2px);border-color:rgba(245,200,66,.5)}@media(max-width:520px){.launch-art{height:150px}.launch-options{grid-template-columns:1fr}.launch-option{min-height:118px}.launch-panel{max-height:94dvh;overflow:auto}}
</style>
