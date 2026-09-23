<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'
import {
  DEFAULT_GAME_WALLET,
  resolveGameWalletOptions,
  type GameWalletKey,
} from '~/utils/gameWallets'

const props = defineProps<{ gameKey: string }>()
const emit = defineEmits<{ close: []; enter: [wallet: GameWalletKey] }>()
const allGames: GameItem[] = [...siteContent.games, ...siteContent.lobbyGames] as GameItem[]
const game = computed(() => allGames.find(item => item.key === props.gameKey))
const { resolvePublicAsset } = usePublicAssetPath()
const selectedWallet = ref<GameWalletKey>(DEFAULT_GAME_WALLET)
const { balance, silverBalance, bronzeBalance } = useFinancialState()

const walletOptions = computed(() => resolveGameWalletOptions({
  gold: balance.value,
  silver: silverBalance.value,
  bronze: bronzeBalance.value,
}))

const rtpComparison = computed(() => game.value?.rtpComparison ?? '尚無比較資料')
const selectedWalletOption = computed(() => walletOptions.value.find(wallet => wallet.key === selectedWallet.value))
const canEnter = computed(() => (selectedWalletOption.value?.amount ?? 0) > 0)

function enterGame() {
  if (!canEnter.value) return
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
            <div class="launch-mode">立即玩</div>
          </div>
          <div class="launch-copy">
            <p>GAME ENTRY</p>
            <h2 id="game-launch-title">{{ game?.name || '遊戲' }}</h2>
            <span>{{ game?.provider || '供應商待提供' }}</span>
          </div>

          <div v-if="game" class="launch-metrics" aria-label="遊戲資訊">
            <div class="launch-metric">
              <span>供應商</span>
              <strong>{{ game.provider || '待提供' }}</strong>
            </div>
            <div class="launch-metric">
              <span>波動率</span>
              <strong>{{ game.volatility || '待提供' }}</strong>
            </div>
            <div class="launch-metric launch-metric-rtp">
              <span>RTP</span>
              <strong>{{ game.rtp || '待提供' }}</strong>
              <small>{{ rtpComparison }}</small>
            </div>
            <div class="launch-metric">
              <span>最大倍率</span>
              <strong>{{ game.maxMultiplier || '待提供' }}</strong>
            </div>
          </div>

          <form class="wallet-entry" @submit.prevent="enterGame">
            <div class="wallet-entry-heading">
              <div>
                <p>SELECT WALLET</p>
                <h3>選擇遊戲錢包</h3>
              </div>
              <span aria-hidden="true">01</span>
            </div>

            <div class="wallet-options" role="radiogroup" aria-label="選擇使用錢包">
              <button
                v-for="wallet in walletOptions"
                :key="wallet.key"
                type="button"
                class="wallet-option"
                :class="{ active: selectedWallet === wallet.key }"
                :aria-pressed="selectedWallet === wallet.key"
                :aria-label="`${wallet.label}，餘額 ${wallet.amount.toLocaleString('en-US')}`"
                :disabled="wallet.amount <= 0"
                @click="selectedWallet = wallet.key"
              >
                <span class="wallet-option-name">{{ wallet.label }}</span>
                <strong>{{ wallet.amount.toLocaleString('en-US') }}</strong>
              </button>
            </div>

            <div class="launch-actions">
              <button type="button" class="launch-cancel" @click="emit('close')">取消</button>
              <button type="submit" class="launch-enter" :disabled="!canEnter">進入遊戲 <span aria-hidden="true">→</span></button>
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

.launch-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0 24px 16px;
}

.launch-metric {
  min-width: 0;
  padding: 10px 9px;
  border: 1px solid rgba(168, 85, 247, .18);
  border-radius: 12px;
  background: rgba(7, 2, 19, .38);
}

.launch-metric span,
.launch-metric small {
  display: block;
  color: var(--color-text-muted);
  font-size: 9px;
}

.launch-metric strong {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.launch-metric small {
  margin-top: 4px;
  color: var(--color-gold);
  font-size: 8px;
  line-height: 1.3;
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

.wallet-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

.wallet-option {
  display: flex;
  min-width: 0;
  min-height: 68px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  border: 1px solid rgba(168, 85, 247, .26);
  border-radius: 12px;
  color: var(--color-text-muted);
  background: rgba(15, 0, 32, .56);
  text-align: left;
  transition: border-color .18s ease, background .18s ease, transform .18s ease, box-shadow .18s ease;
}

.wallet-option:hover:not(:disabled) {
  border-color: rgba(245, 200, 66, .62);
  transform: translateY(-1px);
}

.wallet-option.active {
  border-color: var(--color-gold);
  color: #fff;
  background: linear-gradient(135deg, rgba(245, 200, 66, .2), rgba(168, 85, 247, .14));
  box-shadow: 0 0 0 2px rgba(245, 200, 66, .1), 0 8px 20px rgba(0, 0, 0, .18);
}

.wallet-option:disabled {
  cursor: not-allowed;
  opacity: .42;
}

.wallet-option-name {
  font-size: 10px;
  font-weight: 800;
}

.wallet-option strong {
  overflow: hidden;
  color: var(--color-gold);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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
.launch-enter:disabled {
  cursor: not-allowed;
  opacity: .42;
  box-shadow: none;
}

@media (max-width: 520px) {
  .launch-overlay { align-items: end; padding: 0; }
  .launch-panel { max-height: 94dvh; overflow: auto; border-radius: 22px 22px 0 0; }
  .launch-art { height: 142px; }
  .launch-copy { padding-right: 18px; padding-left: 18px; }
  .launch-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-right: 18px; margin-left: 18px; }
  .wallet-entry { margin-right: 12px; margin-bottom: 14px; margin-left: 12px; padding: 15px; }
  .launch-actions { grid-template-columns: 96px 1fr; }
}
</style>
