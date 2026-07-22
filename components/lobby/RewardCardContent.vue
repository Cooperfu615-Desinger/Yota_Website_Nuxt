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
let noticeTimer: ReturnType<typeof setTimeout> | null = null

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

const conversionText: Record<RewardCardCurrency, string> = {
  'activity-gold': '活動金幣 → 儲值金幣',
  'activity-silver': '活動銀幣 → 儲值銀幣',
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
            <small>卡片額度</small>
            <strong>{{ card.amount.toLocaleString() }}</strong>
            <span>{{ card.title }}</span>
          </div>

          <dl>
            <div><dt>獎勵卡專屬返水</dt><dd>{{ card.rebateRate }}%</dd></div>
            <div><dt>完成條件後</dt><dd>{{ conversionText[card.currency] }}</dd></div>
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
  </div>
</template>

<style scoped>
.reward-page{max-width:1180px;margin:0 auto}.reward-login-mark{display:grid;width:60px;height:60px;place-items:center;margin:0 auto 14px;border:1px solid rgba(245,200,66,.45);border-radius:18px;color:#231126;background:linear-gradient(145deg,#fde68a,#f5c842);font-size:18px;font-weight:950}.reward-notice{margin:0 0 14px;padding:10px 13px;border:1px solid rgba(74,222,128,.28);border-radius:10px;color:#86efac;background:rgba(74,222,128,.09);font-size:12px;font-weight:800}.reward-empty{display:flex;min-height:420px;flex-direction:column;align-items:center;justify-content:center;padding:38px;text-align:center}.empty-card-stack{position:relative;width:94px;height:78px;margin-bottom:22px}.empty-card-stack span{position:absolute;inset:0;border:1px solid rgba(168,85,247,.28);border-radius:18px;background:rgba(168,85,247,.06);transform:rotate(-8deg)}.empty-card-stack span:nth-child(2){transform:rotate(7deg)}.empty-card-stack strong{position:absolute;inset:6px;display:grid;place-items:center;border:1px solid rgba(245,200,66,.35);border-radius:15px;color:var(--color-gold);background:#1b0c33;font-size:27px}.reward-empty>p{margin:0 0 5px;color:var(--color-gold);font-size:9px;font-weight:900;letter-spacing:.18em}.reward-empty h2{margin:0 0 8px;font-size:22px}.reward-empty>span{max-width:430px;color:var(--color-text-muted);font-size:12px;line-height:1.7}.reward-empty .btn-gold{margin-top:22px}.reward-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.reward-card{position:relative;overflow:hidden;padding:20px;border:1px solid rgba(168,85,247,.25);border-radius:20px;background:linear-gradient(145deg,rgba(31,16,58,.97),rgba(18,8,37,.97));box-shadow:0 15px 34px rgba(6,1,17,.2)}.reward-card::before{position:absolute;content:'';width:180px;height:180px;right:-90px;top:-95px;border-radius:50%;background:var(--card-glow);filter:blur(4px);opacity:.42}.card-gold{--card-accent:#f5c842;--card-accent-soft:#fde68a;--card-glow:rgba(245,200,66,.22)}.card-silver{--card-accent:#d7e2f0;--card-accent-soft:#eef5ff;--card-glow:rgba(148,181,222,.2)}.reward-card.is-paused{filter:saturate(.72)}.reward-card header{position:relative;display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:12px}.currency-mark{display:grid;width:50px;height:50px;place-items:center;border:1px solid color-mix(in srgb,var(--card-accent) 55%,transparent);border-radius:15px;color:#1c1025;background:linear-gradient(145deg,var(--card-accent-soft),var(--card-accent));font-size:15px;font-weight:1000}.reward-card header small{display:block;color:var(--card-accent);font-size:8px;font-weight:900;letter-spacing:.08em}.reward-card h2{margin:4px 0 0;font-size:18px}.status-badge{padding:5px 8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;color:var(--color-text-muted);background:rgba(255,255,255,.05);font-size:9px;font-weight:900}.is-active .status-badge{border-color:rgba(74,222,128,.32);color:#86efac;background:rgba(74,222,128,.1)}.reward-amount{position:relative;display:grid;grid-template-columns:1fr auto;align-items:end;margin:18px 0 13px;padding:17px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(0,0,0,.18)}.reward-amount small{grid-column:1/-1;margin-bottom:2px;color:var(--color-text-muted);font-size:9px}.reward-amount strong{color:var(--card-accent-soft);font-size:31px;line-height:1}.reward-amount span{color:var(--color-text-muted);font-size:9px}.reward-card dl{position:relative;display:grid;gap:7px;margin:0}.reward-card dl div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,.06)}.reward-card dt{color:var(--color-text-muted);font-size:9px}.reward-card dd{margin:0;color:#fff;font-size:10px;font-weight:850;text-align:right}.reward-card dl div:first-child dd{color:var(--card-accent);font-size:16px}.status-description{min-height:38px;margin:13px 0;color:var(--color-text-muted);font-size:9px;line-height:1.7}.reward-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.reward-actions button{padding:10px 7px;border:1px solid rgba(255,255,255,.12);border-radius:10px;font-size:10px;font-weight:900;transition:transform .18s,background .18s,border-color .18s}.reward-actions button:hover:not(:disabled){transform:translateY(-1px)}.action-enable{color:#1a1020;background:var(--card-accent)}.action-pause{color:#fff;background:rgba(168,85,247,.16)}.action-delete{color:#fca5a5;background:rgba(248,113,113,.08)}.reward-actions button:disabled{cursor:not-allowed;color:rgba(255,255,255,.28);border-color:rgba(255,255,255,.06);background:rgba(255,255,255,.04);transform:none}.delete-hint{display:block;margin-top:7px;color:var(--color-text-muted);font-size:8px;text-align:right}.reward-delete-modal{max-width:360px}.delete-mark{display:grid;width:52px;height:52px;place-items:center;margin:0 auto 13px;border-radius:50%;color:#fca5a5;background:rgba(248,113,113,.12);font-size:26px;font-weight:400}.reward-delete-modal h2{margin:0 0 7px;font-size:19px}.reward-delete-modal p{margin:0 0 18px;color:var(--color-text-muted);font-size:11px;line-height:1.7}.delete-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.delete-actions button{justify-content:center}.confirm-delete{padding:10px;border-radius:10px;color:#fff;background:#b91c1c;font-size:12px;font-weight:900}.reward-modal-fade-enter-active,.reward-modal-fade-leave-active{transition:opacity .22s}.reward-modal-fade-enter-from,.reward-modal-fade-leave-to{opacity:0}@media(max-width:800px){.reward-grid{grid-template-columns:1fr}.reward-empty{min-height:360px}}@media(max-width:480px){.reward-card{padding:16px}.reward-card header{grid-template-columns:44px 1fr auto}.currency-mark{width:42px;height:42px}.reward-amount strong{font-size:27px}.reward-actions button{min-height:42px}.reward-empty{padding:28px 18px}}
</style>
