<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'
import {
  DEFAULT_GAME_WALLET,
  GAME_WALLET_OPTIONS,
  getGameWalletLabel,
  type GameWalletKey,
} from '~/utils/gameWallets'

const props = defineProps<{ gameKey: string }>()
const emit = defineEmits<{ close: []; enter: [wallet: GameWalletKey] }>()
const allGames: GameItem[] = [...siteContent.games, ...siteContent.lobbyGames] as GameItem[]
const game = computed(() => allGames.find(item => item.key === props.gameKey))
const { resolvePublicAsset } = usePublicAssetPath()
const selectedWallet = ref<GameWalletKey>(DEFAULT_GAME_WALLET)

const selectedWalletLabel = computed(() => getGameWalletLabel(selectedWallet.value))

function enterGame() {
  emit('enter', selectedWallet.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="launch-fade" appear>
      <div class="launch-overlay" role="dialog" aria-modal="true" aria-labelledby="game-launch-title" @click.self="emit('close')">
        <article class="launch-panel">
          <button class="launch-close" aria-label="關閉" @click="emit('close')">×</button>
          <div class="launch-art" :style="game?.imageSrc ? undefined : { background: `linear-gradient(135deg,${game?.color || '#7c3aed'},#120423)` }">
            <img v-if="game?.imageSrc" :src="resolvePublicAsset(game.imageSrc)" :alt="game.name" />
            <div class="launch-mode">真錢模式</div>
          </div>
          <div class="launch-copy">
            <p>GAME ENTRY</p>
            <h2 id="game-launch-title">{{ game?.name || '遊戲' }}</h2>
            <span>{{ game?.provider }}・RTP {{ game?.rtp }}</span>
          </div>

          <form class="wallet-entry" @submit.prevent="enterGame">
            <div class="wallet-entry-heading">
              <div>
                <p>SELECT WALLET</p>
                <h3>選擇使用幣別</h3>
              </div>
              <span aria-hidden="true">01</span>
            </div>

            <label for="game-wallet-select">幣別</label>
            <div class="wallet-select-wrap">
              <select id="game-wallet-select" v-model="selectedWallet" name="game-wallet">
                <option v-for="wallet in GAME_WALLET_OPTIONS" :key="wallet.key" :value="wallet.key">
                  {{ wallet.label }}
                </option>
              </select>
              <span aria-hidden="true">⌄</span>
            </div>

            <div class="wallet-selection-preview" aria-live="polite">
              <small>本次遊戲使用</small>
              <strong>{{ selectedWalletLabel }}</strong>
            </div>

            <div class="launch-actions">
              <button type="button" class="launch-cancel" @click="emit('close')">取消</button>
              <button type="submit" class="launch-enter">進入遊戲 <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.launch-fade-enter-active,
.launch-fade-leave-active { transition: opacity .2s; }
.launch-fade-enter-from,
.launch-fade-leave-to { opacity: 0; }

.launch-overlay {
  position: fixed;
  inset: 0;
  z-index: 1070;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(5, 0, 15, .84);
  backdrop-filter: blur(12px);
}

.launch-panel {
  position: relative;
  width: min(540px, 100%);
  overflow: hidden;
  border: 1px solid rgba(245, 200, 66, .32);
  border-radius: 25px;
  background: linear-gradient(155deg, #21103a, #10051f);
  box-shadow: 0 30px 90px rgba(0, 0, 0, .6);
}

.launch-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 50%;
  color: #fff;
  background: rgba(5, 0, 15, .66);
  font-size: 24px;
}

.launch-art {
  position: relative;
  height: 174px;
  overflow: hidden;
}

.launch-art::after {
  position: absolute;
  inset: 36% 0 0;
  content: '';
  background: linear-gradient(transparent, #18082b);
}

.launch-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.launch-mode {
  position: absolute;
  top: 16px;
  left: 18px;
  z-index: 1;
  padding: 6px 9px;
  border: 1px solid rgba(245, 200, 66, .35);
  border-radius: 999px;
  color: var(--color-gold);
  background: rgba(15, 0, 32, .75);
  font-size: 10px;
  font-weight: 900;
}

.launch-copy {
  position: relative;
  z-index: 1;
  margin-top: -42px;
  padding: 0 24px 18px;
}

.launch-copy p,
.wallet-entry-heading p {
  margin: 0;
  color: var(--color-gold);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .18em;
}

.launch-copy h2 {
  margin: 3px 0;
  color: #fff;
  font-size: 26px;
}

.launch-copy > span {
  color: var(--color-text-muted);
  font-size: 11px;
}

.wallet-entry {
  margin: 0 24px 24px;
  padding: 17px;
  border: 1px solid rgba(168, 85, 247, .22);
  border-radius: 17px;
  background:
    linear-gradient(130deg, rgba(245, 200, 66, .08), transparent 48%),
    rgba(7, 2, 19, .36);
}

.wallet-entry-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.wallet-entry-heading h3 {
  margin: 3px 0 0;
  font-size: 16px;
}

.wallet-entry-heading > span {
  color: rgba(245, 200, 66, .16);
  font-size: 28px;
  font-weight: 950;
  line-height: 1;
}

.wallet-entry > label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 800;
}

.wallet-select-wrap {
  position: relative;
}

.wallet-select-wrap select {
  width: 100%;
  min-height: 46px;
  appearance: none;
  padding: 0 42px 0 13px;
  border: 1px solid rgba(245, 200, 66, .36);
  border-radius: 11px;
  outline: none;
  color: #fff;
  background: #1b0b31;
  font: inherit;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

.wallet-select-wrap select:focus-visible {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(245, 200, 66, .1);
}

.wallet-select-wrap > span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--color-gold);
  font-size: 16px;
  pointer-events: none;
  transform: translateY(-58%);
}

.wallet-selection-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0 15px;
  padding: 9px 11px;
  border-left: 2px solid var(--color-gold);
  color: var(--color-text-muted);
  background: rgba(245, 200, 66, .045);
}

.wallet-selection-preview small { font-size: 9px; }
.wallet-selection-preview strong { color: var(--color-gold); font-size: 11px; }

.launch-actions {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
}

.launch-actions button {
  min-height: 42px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 900;
}

.launch-cancel {
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: rgba(168, 85, 247, .06);
}

.launch-enter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #1b0a25;
  background: linear-gradient(135deg, #fde68a, var(--color-gold));
  box-shadow: 0 8px 22px rgba(245, 200, 66, .14);
}

.launch-enter span { transition: transform .18s ease; }
.launch-enter:hover span { transform: translateX(3px); }

@media (max-width: 520px) {
  .launch-overlay { align-items: end; padding: 0; }
  .launch-panel { max-height: 94dvh; overflow: auto; border-radius: 22px 22px 0 0; }
  .launch-art { height: 142px; }
  .launch-copy { padding-right: 18px; padding-left: 18px; }
  .wallet-entry { margin-right: 12px; margin-bottom: 14px; margin-left: 12px; padding: 15px; }
  .launch-actions { grid-template-columns: 96px 1fr; }
}
</style>
