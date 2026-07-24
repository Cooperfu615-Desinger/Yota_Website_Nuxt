<script setup lang="ts">
const { pendingConversionNotice, markConversionNoticeRead } = useRewardCardState()

const notice = computed(() => {
  const current = pendingConversionNotice.value
  return current && !current.read ? current : null
})

function closeNotice() {
  markConversionNoticeRead()
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="conversion-modal-fade">
        <div
          v-if="notice"
          class="conversion-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conversion-complete-title"
          @click.self="closeNotice"
        >
          <article class="conversion-modal" :class="notice.sourceCurrency === 'activity-gold' ? 'tone-gold' : 'tone-silver'">
            <div class="conversion-burst" aria-hidden="true">
              {{ notice.sourceCurrency === 'activity-gold' ? '金' : '銀' }}
            </div>
            <p class="conversion-kicker">TURNOVER COMPLETE</p>
            <h2 id="conversion-complete-title">已滿足流水條件</h2>
            <p class="conversion-lead">
              恭喜獲得{{ notice.destinationLabel }}
              <strong>{{ notice.convertedAmount.toLocaleString() }}</strong>
            </p>

            <div class="conversion-route" aria-label="獎勵卡餘額轉換結果">
              <div>
                <small>轉換前</small>
                <strong>{{ notice.sourceLabel }}</strong>
                <span>{{ notice.originalBalance.toLocaleString() }}</span>
              </div>
              <i aria-hidden="true">→</i>
              <div>
                <small>自動入帳</small>
                <strong>{{ notice.destinationLabel }}</strong>
                <span>{{ notice.convertedAmount.toLocaleString() }}</span>
              </div>
            </div>

            <div class="conversion-meta">
              <span>系統回收 <strong>{{ notice.recoveredAmount.toLocaleString() }}</strong></span>
              <span>錢包餘額 <strong>{{ notice.walletBalance.toLocaleString() }}</strong></span>
            </div>
            <p class="conversion-note">入帳與交易紀錄已自動完成，關閉提示不會影響轉換結果。</p>

            <div class="conversion-actions">
              <NuxtLink to="/lobby/transactions" class="conversion-record-link" @click="closeNotice">
                查看交易紀錄
              </NuxtLink>
              <button class="conversion-confirm" @click="closeNotice">確認</button>
            </div>
          </article>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.conversion-overlay {
  position: fixed;
  inset: 0;
  z-index: 1120;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(5, 0, 15, .84);
  backdrop-filter: blur(13px);
}

.conversion-modal {
  --conversion-accent: #f5c842;
  --conversion-soft: #fde68a;
  position: relative;
  width: min(430px, 100%);
  overflow: hidden;
  padding: 28px;
  border: 1px solid color-mix(in srgb, var(--conversion-accent) 42%, transparent);
  border-radius: 25px;
  background:
    radial-gradient(circle at 50% -10%, color-mix(in srgb, var(--conversion-accent) 22%, transparent), transparent 42%),
    linear-gradient(155deg, #21103a, #10051f 70%);
  box-shadow: 0 30px 90px rgba(0, 0, 0, .62), 0 0 35px color-mix(in srgb, var(--conversion-accent) 16%, transparent);
  text-align: center;
}

.conversion-modal.tone-silver {
  --conversion-accent: #d7e2f0;
  --conversion-soft: #f5f9ff;
}

.conversion-modal::before {
  position: absolute;
  inset: 8px;
  border: 1px solid color-mix(in srgb, var(--conversion-accent) 15%, transparent);
  border-radius: 19px;
  content: '';
  pointer-events: none;
}

.conversion-burst {
  position: relative;
  display: grid;
  width: 66px;
  height: 66px;
  place-items: center;
  margin: 0 auto 14px;
  border: 1px solid color-mix(in srgb, var(--conversion-accent) 70%, transparent);
  border-radius: 21px;
  color: #1a1020;
  background: linear-gradient(145deg, var(--conversion-soft), var(--conversion-accent));
  box-shadow: 0 0 30px color-mix(in srgb, var(--conversion-accent) 28%, transparent);
  font-size: 19px;
  font-weight: 1000;
}

.conversion-kicker {
  position: relative;
  margin: 0 0 5px;
  color: var(--conversion-accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .18em;
}

.conversion-modal h2 {
  position: relative;
  margin: 0;
  font-size: 24px;
}

.conversion-lead {
  position: relative;
  margin: 8px 0 18px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.conversion-lead strong {
  margin-left: 4px;
  color: var(--conversion-soft);
  font-size: 19px;
}

.conversion-route {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 24px 1fr;
  align-items: center;
  gap: 7px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 15px;
  background: rgba(0, 0, 0, .2);
}

.conversion-route > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .035);
}

.conversion-route small {
  color: var(--color-text-muted);
  font-size: 8px;
}

.conversion-route strong {
  overflow: hidden;
  color: var(--conversion-accent);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversion-route span {
  color: #fff;
  font-size: 14px;
  font-weight: 900;
}

.conversion-route i {
  color: var(--conversion-accent);
  font-size: 17px;
  font-style: normal;
}

.conversion-meta {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.conversion-meta strong { margin-left: 3px; color: #fff; }

.conversion-note {
  position: relative;
  margin: 14px 0 18px;
  color: var(--color-text-muted);
  font-size: 9px;
  line-height: 1.7;
}

.conversion-actions {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.conversion-actions > * {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 900;
}

.conversion-record-link {
  border: 1px solid rgba(168, 85, 247, .32);
  color: var(--color-purple-light);
  background: rgba(168, 85, 247, .08);
}

.conversion-confirm {
  color: #1a1020;
  background: linear-gradient(135deg, var(--conversion-soft), var(--conversion-accent));
}

.conversion-modal-fade-enter-active,
.conversion-modal-fade-leave-active { transition: opacity .22s ease; }
.conversion-modal-fade-enter-from,
.conversion-modal-fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .conversion-modal { padding: 23px 17px; }
  .conversion-route { padding: 9px; }
  .conversion-route span { font-size: 12px; }
  .conversion-meta { flex-direction: column; gap: 4px; text-align: left; }
}
</style>
