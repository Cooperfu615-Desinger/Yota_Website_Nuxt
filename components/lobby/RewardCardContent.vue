<script setup lang="ts">
import type { RewardCard, RewardCardCurrency, RewardCardStatus } from '~/composables/useRewardCardState'

const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
const {
  rewardCards,
  activateRewardCard,
  pauseRewardCard,
  deleteRewardCard,
} = useRewardCardState()

const notice = ref('')
const deleteTarget = ref<RewardCard | null>(null)
const ruleInfo = ref<{ title: string } | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const activityWalletSummary = [
  { label: '活動金幣', mark: '金', amount: 250_000, tone: 'gold' },
  { label: '活動銀幣', mark: '銀', amount: 250_000, tone: 'silver' },
  { label: '銅幣', mark: '銅', amount: 250_000, tone: 'bronze' },
] as const

const statusLabel: Record<RewardCardStatus, string> = {
  inactive: '未啟用',
  active: '使用中',
  paused: '已停用',
}

const statusDescription: Record<RewardCardStatus, string> = {
  inactive: '啟用後，卡片額度才會加入對應的活動錢包。',
  active: '活動額度目前可使用，達成活動條件後會自動轉入儲值錢包。',
  paused: '活動額度已保留並暫停使用，可隨時重新啟用。',
}

const currencyMark: Record<RewardCardCurrency, string> = {
  'activity-gold': '金',
  'activity-silver': '銀',
}

function showNotice(text: string) {
  notice.value = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 3200)
}

function activate(card: RewardCard) {
  if (activateRewardCard(card.id)) showNotice(`已啟用「${card.title}」獎勵卡`)
}

function pause(card: RewardCard) {
  if (pauseRewardCard(card.id)) showNotice(`已停用「${card.title}」獎勵卡`)
}

function requestDelete(card: RewardCard) {
  if (card.status === 'active') return
  deleteTarget.value = card
}

function confirmDelete() {
  if (!deleteTarget.value) return
  const title = deleteTarget.value.title
  if (deleteRewardCard(deleteTarget.value.id)) showNotice(`已刪除「${title}」獎勵卡`)
  deleteTarget.value = null
}

function showRuleInfo(title: string) {
  ruleInfo.value = { title }
}

onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
})
</script>

<template>
  <div class="lobby-page reward-page px-4 py-5">
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="reward-login-mark" aria-hidden="true">卡</div>
        <h1 class="text-xl font-black mb-2">獎勵卡</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可查看並管理活動獎勵卡</p>
        <button class="btn-gold w-full justify-center" @click="openLogin(route.fullPath)">立即登入 / 註冊</button>
      </div>
    </template>

    <template v-else>
      <h1 class="section-title mb-4">獎勵卡</h1>

      <section class="activity-wallet-summary" aria-labelledby="activity-wallet-title">
        <header>
          <div>
            <p>ACTIVITY WALLET</p>
            <h2 id="activity-wallet-title">活動資產總覽</h2>
          </div>
          <span>獎勵卡專用額度</span>
        </header>
        <div class="activity-wallet-grid">
          <article
            v-for="wallet in activityWalletSummary"
            :key="wallet.label"
            :class="`wallet-${wallet.tone}`"
          >
            <span class="wallet-mark" aria-hidden="true">{{ wallet.mark }}</span>
            <div>
              <small>{{ wallet.label }}</small>
              <strong>{{ wallet.amount.toLocaleString() }}</strong>
              <em>總額</em>
            </div>
          </article>
        </div>
      </section>

      <p v-if="notice" class="reward-notice" role="status" aria-live="polite">{{ notice }}</p>

      <section v-if="rewardCards.length === 0" class="reward-empty card-purple">
        <div class="empty-card-stack" aria-hidden="true"><span /><span /><strong>0</strong></div>
        <p>REWARD CARD WALLET</p>
        <h2>目前沒有獎勵卡</h2>
        <span>完成每日任務第 15 天與第 20 天，即可領取活動幣獎勵卡。</span>
        <NuxtLink to="/lobby/daily" class="btn-gold">前往每日任務</NuxtLink>
      </section>

      <section v-else class="reward-grid" aria-label="我的獎勵卡">
        <article
          v-for="card in rewardCards"
          :key="card.id"
          class="reward-card"
          :class="[`is-${card.status}`, card.currency === 'activity-gold' ? 'card-gold' : 'card-silver']"
        >
          <header>
            <div class="currency-mark" aria-hidden="true">{{ currencyMark[card.currency] }}</div>
            <div>
              <small>每日任務・第 {{ card.milestoneDay }} 天</small>
              <h2>{{ card.title }}</h2>
            </div>
            <span class="status-badge">{{ statusLabel[card.status] }}</span>
          </header>

          <div class="reward-amount">
            <small>目前餘額 / 總金額</small>
            <div>
              <strong>{{ card.currentBalance.toLocaleString() }}</strong>
              <span>/ {{ card.amount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="rebate-progress-block">
            <div class="rebate-progress-label">
              <span>返水 {{ card.rebateRate }}%</span>
              <strong>{{ card.rebateProgress }}%</strong>
            </div>
            <div
              class="rebate-progress-track"
              role="progressbar"
              :aria-label="`${card.title}返水進度`"
              :aria-valuenow="card.rebateProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <i :style="{ width: `${card.rebateProgress}%` }" />
            </div>
          </div>

          <dl class="reward-meta">
            <div>
              <dt>
                轉換上限
                <button type="button" class="info-trigger" aria-label="查看轉換上限規則" @click="showRuleInfo('轉換上限規則')">i</button>
              </dt>
              <dd>{{ card.conversionLimit.toLocaleString() }}</dd>
            </div>
            <div>
              <dt>
                有效期限
                <button type="button" class="info-trigger" aria-label="查看有效期限規則" @click="showRuleInfo('有效期限規則')">i</button>
              </dt>
              <dd>{{ card.expiresAt }}</dd>
            </div>
          </dl>

          <p class="status-description">{{ statusDescription[card.status] }}</p>

          <div class="reward-actions">
            <button
              class="action-enable"
              :disabled="card.status === 'active'"
              @click="activate(card)"
            >啟用</button>
            <button
              class="action-pause"
              :disabled="card.status !== 'active'"
              @click="pause(card)"
            >停用</button>
            <button
              class="action-delete"
              :disabled="card.status === 'active'"
              :title="card.status === 'active' ? '請先停用卡片再刪除' : '刪除獎勵卡'"
              @click="requestDelete(card)"
            >刪除</button>
          </div>
          <small v-if="card.status === 'active'" class="delete-hint">如需刪除，請先停用卡片。</small>
        </article>
      </section>
    </template>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="reward-modal-fade">
          <div
            v-if="deleteTarget"
            class="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-reward-card-title"
            @click.self="deleteTarget = null"
          >
            <div class="modal-box reward-delete-modal">
              <div class="modal-inner text-center">
                <div class="delete-mark" aria-hidden="true">×</div>
                <h2 id="delete-reward-card-title">刪除獎勵卡？</h2>
                <p>刪除「{{ deleteTarget.title }}」後，本次瀏覽階段無法再次領取。</p>
                <div class="delete-actions">
                  <button class="btn-outline-purple" @click="deleteTarget = null">取消</button>
                  <button class="confirm-delete" @click="confirmDelete">確認刪除</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="reward-modal-fade">
          <div
            v-if="ruleInfo"
            class="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-rule-title"
            @click.self="ruleInfo = null"
          >
            <div class="modal-box reward-rule-modal">
              <div class="modal-inner text-center">
                <div class="rule-mark" aria-hidden="true">i</div>
                <h2 id="reward-rule-title">{{ ruleInfo.title }}</h2>
                <p>待補充</p>
                <button class="btn-gold w-full justify-center" @click="ruleInfo = null">我知道了</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.reward-page {
  max-width: 1180px;
  margin: 0 auto;
}

.reward-login-mark {
  display: grid;
  width: 60px;
  height: 60px;
  place-items: center;
  margin: 0 auto 14px;
  border: 1px solid rgba(245, 200, 66, .45);
  border-radius: 18px;
  color: #231126;
  background: linear-gradient(145deg, #fde68a, #f5c842);
  font-size: 18px;
  font-weight: 950;
}

.activity-wallet-summary {
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(168, 85, 247, .22);
  border-left: 3px solid var(--color-gold);
  border-radius: 16px;
  background:
    linear-gradient(100deg, rgba(245, 200, 66, .07), transparent 36%),
    rgba(11, 4, 26, .72);
}

.activity-wallet-summary::after {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 220px;
  height: 160px;
  border-radius: 50%;
  background: rgba(168, 85, 247, .09);
  filter: blur(12px);
  content: '';
  pointer-events: none;
}

.activity-wallet-summary > header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.activity-wallet-summary header p {
  margin: 0;
  color: var(--color-gold);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .18em;
}

.activity-wallet-summary header h2 {
  margin: 3px 0 0;
  font-size: 15px;
}

.activity-wallet-summary > header > span {
  color: var(--color-text-muted);
  font-size: 9px;
}

.activity-wallet-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.activity-wallet-grid article {
  --wallet-accent: #f5c842;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid color-mix(in srgb, var(--wallet-accent) 24%, transparent);
  border-radius: 12px;
  background: rgba(255, 255, 255, .035);
}

.activity-wallet-grid article.wallet-silver { --wallet-accent: #d7e2f0; }
.activity-wallet-grid article.wallet-bronze { --wallet-accent: #d88a4b; }

.wallet-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--wallet-accent) 48%, transparent);
  border-radius: 50%;
  color: var(--wallet-accent);
  background: color-mix(in srgb, var(--wallet-accent) 8%, transparent);
  font-size: 10px;
  font-weight: 950;
}

.activity-wallet-grid article > div {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  min-width: 0;
}

.activity-wallet-grid small {
  grid-column: 1 / -1;
  color: var(--color-text-muted);
  font-size: 8px;
}

.activity-wallet-grid strong {
  overflow: hidden;
  color: var(--wallet-accent);
  font-size: 17px;
  line-height: 1.2;
  text-overflow: ellipsis;
}

.activity-wallet-grid em {
  color: var(--color-text-muted);
  font-size: 7px;
  font-style: normal;
}

.reward-notice {
  margin: 0 0 14px;
  padding: 10px 13px;
  border: 1px solid rgba(74, 222, 128, .28);
  border-radius: 10px;
  color: #86efac;
  background: rgba(74, 222, 128, .09);
  font-size: 12px;
  font-weight: 800;
}

.reward-empty {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 38px;
  text-align: center;
}

.empty-card-stack {
  position: relative;
  width: 94px;
  height: 78px;
  margin-bottom: 22px;
}

.empty-card-stack span {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(168, 85, 247, .28);
  border-radius: 18px;
  background: rgba(168, 85, 247, .06);
  transform: rotate(-8deg);
}

.empty-card-stack span:nth-child(2) { transform: rotate(7deg); }

.empty-card-stack strong {
  position: absolute;
  inset: 6px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(245, 200, 66, .35);
  border-radius: 15px;
  color: var(--color-gold);
  background: #1b0c33;
  font-size: 27px;
}

.reward-empty > p {
  margin: 0 0 5px;
  color: var(--color-gold);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .18em;
}

.reward-empty h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.reward-empty > span {
  max-width: 430px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.reward-empty .btn-gold { margin-top: 22px; }

.reward-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.reward-card {
  --card-accent: #f5c842;
  --card-accent-soft: #fde68a;
  --card-glow: rgba(245, 200, 66, .22);
  position: relative;
  overflow: hidden;
  padding: 20px;
  border: 1px solid rgba(168, 85, 247, .25);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(31, 16, 58, .97), rgba(18, 8, 37, .97));
  box-shadow: 0 15px 34px rgba(6, 1, 17, .2);
  transition: border-color .25s ease, box-shadow .25s ease, filter .25s ease;
}

.reward-card::before {
  position: absolute;
  top: -95px;
  right: -90px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--card-glow);
  content: '';
  filter: blur(4px);
  opacity: .42;
}

.reward-card::after {
  position: absolute;
  inset: 5px;
  border: 1px solid transparent;
  border-radius: 15px;
  content: '';
  pointer-events: none;
  transition: border-color .25s ease;
}

.card-gold {
  --card-accent: #f5c842;
  --card-accent-soft: #fde68a;
  --card-glow: rgba(245, 200, 66, .24);
}

.card-silver {
  --card-accent: #d7e2f0;
  --card-accent-soft: #eef5ff;
  --card-glow: rgba(148, 181, 222, .23);
}

.reward-card.is-active {
  border-color: var(--card-accent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--card-accent) 45%, transparent),
    0 0 28px var(--card-glow),
    0 20px 44px rgba(6, 1, 17, .42);
  animation: active-reward-glow 2.6s ease-in-out infinite;
}

.reward-card.is-active::after {
  border-color: color-mix(in srgb, var(--card-accent) 28%, transparent);
}

.reward-card.is-paused { filter: saturate(.72); }

.reward-card > header {
  position: relative;
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 12px;
}

.currency-mark {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--card-accent) 55%, transparent);
  border-radius: 15px;
  color: #1c1025;
  background: linear-gradient(145deg, var(--card-accent-soft), var(--card-accent));
  font-size: 15px;
  font-weight: 1000;
}

.reward-card > header small {
  display: block;
  color: var(--card-accent);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .08em;
}

.reward-card h2 {
  margin: 4px 0 0;
  font-size: 18px;
}

.status-badge {
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 999px;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, .05);
  font-size: 9px;
  font-weight: 900;
}

.is-active .status-badge {
  border-color: color-mix(in srgb, var(--card-accent) 42%, transparent);
  color: var(--card-accent-soft);
  background: color-mix(in srgb, var(--card-accent) 11%, transparent);
}

.reward-amount {
  position: relative;
  margin: 18px 0 13px;
  padding: 17px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 15px;
  background: rgba(0, 0, 0, .18);
}

.reward-amount small {
  display: block;
  margin-bottom: 5px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.reward-amount > div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.reward-amount strong {
  color: var(--card-accent-soft);
  font-size: 31px;
  line-height: 1;
}

.reward-amount span {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
}

.rebate-progress-block {
  position: relative;
  margin-bottom: 13px;
  padding: 12px 13px;
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 12px;
  background: rgba(255, 255, 255, .025);
}

.rebate-progress-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 9px;
}

.rebate-progress-label span {
  color: var(--card-accent-soft);
  font-weight: 900;
}

.rebate-progress-label strong {
  color: var(--card-accent);
  font-size: 11px;
}

.rebate-progress-track {
  height: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .05);
  border-radius: 99px;
  background: rgba(0, 0, 0, .28);
}

.rebate-progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--card-accent), var(--card-accent-soft));
  box-shadow: 0 0 14px var(--card-glow);
  transition: width .35s ease;
}

.reward-meta {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
}

.reward-meta > div {
  display: block;
  padding: 10px 11px;
  border: 1px solid rgba(255, 255, 255, .06);
  border-radius: 10px;
  background: rgba(0, 0, 0, .12);
}

.reward-meta dt {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
  font-size: 8px;
}

.reward-meta dd {
  margin: 5px 0 0;
  color: #fff;
  font-size: 12px;
  font-weight: 850;
}

.info-trigger {
  display: inline-grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--card-accent) 45%, transparent);
  border-radius: 50%;
  color: var(--card-accent);
  background: color-mix(in srgb, var(--card-accent) 8%, transparent);
  font-family: Georgia, serif;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  transition: background .18s ease, transform .18s ease;
}

.info-trigger:hover,
.info-trigger:focus-visible {
  background: color-mix(in srgb, var(--card-accent) 18%, transparent);
  outline: none;
  transform: scale(1.08);
}

.status-description {
  min-height: 38px;
  margin: 13px 0;
  color: var(--color-text-muted);
  font-size: 9px;
  line-height: 1.7;
}

.reward-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.reward-actions button {
  padding: 10px 7px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 900;
  transition: transform .18s, background .18s, border-color .18s;
}

.reward-actions button:hover:not(:disabled) { transform: translateY(-1px); }
.action-enable { color: #1a1020; background: var(--card-accent); }
.action-pause { color: #fff; background: rgba(168, 85, 247, .16); }
.action-delete { color: #fca5a5; background: rgba(248, 113, 113, .08); }

.reward-actions button:disabled {
  cursor: not-allowed;
  color: rgba(255, 255, 255, .28);
  border-color: rgba(255, 255, 255, .06);
  background: rgba(255, 255, 255, .04);
  transform: none;
}

.delete-hint {
  display: block;
  margin-top: 7px;
  color: var(--color-text-muted);
  font-size: 8px;
  text-align: right;
}

.reward-delete-modal,
.reward-rule-modal { max-width: 360px; }

.delete-mark,
.rule-mark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  margin: 0 auto 13px;
  border-radius: 50%;
  font-size: 26px;
  font-weight: 400;
}

.delete-mark {
  color: #fca5a5;
  background: rgba(248, 113, 113, .12);
}

.rule-mark {
  border: 1px solid rgba(245, 200, 66, .34);
  color: var(--color-gold);
  background: rgba(245, 200, 66, .09);
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 800;
}

.reward-delete-modal h2,
.reward-rule-modal h2 {
  margin: 0 0 7px;
  font-size: 19px;
}

.reward-delete-modal p,
.reward-rule-modal p {
  margin: 0 0 18px;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.7;
}

.delete-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.delete-actions button { justify-content: center; }

.confirm-delete {
  padding: 10px;
  border-radius: 10px;
  color: #fff;
  background: #b91c1c;
  font-size: 12px;
  font-weight: 900;
}

.reward-modal-fade-enter-active,
.reward-modal-fade-leave-active { transition: opacity .22s; }
.reward-modal-fade-enter-from,
.reward-modal-fade-leave-to { opacity: 0; }

@keyframes active-reward-glow {
  0%, 100% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--card-accent) 38%, transparent),
      0 0 22px var(--card-glow),
      0 20px 44px rgba(6, 1, 17, .42);
  }
  50% {
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--card-accent) 60%, transparent),
      0 0 38px var(--card-glow),
      0 20px 44px rgba(6, 1, 17, .42);
  }
}

@media (max-width: 800px) {
  .reward-grid { grid-template-columns: 1fr; }
  .activity-wallet-grid article { grid-template-columns: 30px minmax(0, 1fr); padding: 10px; }
  .wallet-mark { width: 29px; height: 29px; }
  .activity-wallet-grid strong { font-size: 14px; }
}

@media (max-width: 520px) {
  .activity-wallet-summary { padding: 13px 10px; }
  .activity-wallet-summary > header > span { display: none; }
  .activity-wallet-grid { gap: 5px; }
  .activity-wallet-grid article { display: block; padding: 9px 7px; text-align: center; }
  .wallet-mark { margin: 0 auto 6px; }
  .activity-wallet-grid article > div { display: block; }
  .activity-wallet-grid small,
  .activity-wallet-grid strong,
  .activity-wallet-grid em { display: block; }
  .activity-wallet-grid strong { margin-top: 2px; font-size: 13px; }
  .activity-wallet-grid em { margin-top: 2px; }
  .reward-card { padding: 16px; }
  .reward-card > header { grid-template-columns: 44px 1fr auto; }
  .currency-mark { width: 42px; height: 42px; }
  .reward-amount strong { font-size: 27px; }
  .reward-amount span { font-size: 11px; }
  .reward-actions button { min-height: 42px; }
  .reward-empty { padding: 28px 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .reward-card.is-active { animation: none; }
}
</style>
