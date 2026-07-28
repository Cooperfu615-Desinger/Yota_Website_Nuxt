<script setup lang="ts">
import {
  formatGiftRequestRemainingTime,
  type GiftRequest,
} from '~/utils/giftRequest'

type RequestFilter = 'all' | 'incoming' | 'outgoing' | 'expired'

const props = defineProps<{
  requests: GiftRequest[]
  currentPlayerId: string
  now: number
}>()

const emit = defineEmits<{
  accept: [request: GiftRequest]
  reject: [request: GiftRequest]
  cancel: [request: GiftRequest]
}>()

const activeFilter = ref<RequestFilter>('all')

const relatedRequests = computed(() => props.requests
  .filter(request =>
    request.sender.playerId === props.currentPlayerId
    || request.receiver.playerId === props.currentPlayerId
  )
)

const pendingRequests = computed(() => relatedRequests.value
  .filter(request => request.status === 'pending')
  .sort((a, b) => a.expiresAt - b.expiresAt))

const expiredRequests = computed(() => relatedRequests.value
  .filter(request => request.status === 'expired')
  .sort((a, b) =>
    (b.resolvedAt ?? b.expiresAt) - (a.resolvedAt ?? a.expiresAt)
    || a.id.localeCompare(b.id),
  ))

const incomingCount = computed(() => pendingRequests.value
  .filter(request => request.receiver.playerId === props.currentPlayerId).length)

const outgoingCount = computed(() => pendingRequests.value
  .filter(request => request.sender.playerId === props.currentPlayerId).length)

const filterOptions = computed<{ key: RequestFilter; label: string; count: number }[]>(() => [
  { key: 'all', label: '全部', count: pendingRequests.value.length },
  { key: 'incoming', label: '收到', count: incomingCount.value },
  { key: 'outgoing', label: '送出', count: outgoingCount.value },
  { key: 'expired', label: '已過期', count: expiredRequests.value.length },
])

const visibleRequests = computed(() => {
  if (activeFilter.value === 'expired') {
    return expiredRequests.value
  }
  if (activeFilter.value === 'incoming') {
    return pendingRequests.value.filter(request => isIncoming(request))
  }
  if (activeFilter.value === 'outgoing') {
    return pendingRequests.value.filter(request => isOutgoing(request))
  }
  return pendingRequests.value
})

const panelHeading = computed(() =>
  activeFilter.value === 'expired' ? '已過期' : '待處理',
)

const panelSummary = computed(() =>
  activeFilter.value === 'expired'
    ? `${expiredRequests.value.length} 筆過期紀錄`
    : `${pendingRequests.value.length} 筆等待處理`,
)

const emptyMessage = computed(() => {
  if (activeFilter.value === 'expired') return '目前沒有已過期的贈禮'
  if (activeFilter.value === 'incoming') return '目前沒有等待你回覆的贈禮'
  if (activeFilter.value === 'outgoing') return '目前沒有等待對方回覆的贈禮'
  return '目前沒有待處理的贈禮申請'
})

const emptyDescription = computed(() =>
  activeFilter.value === 'expired'
    ? '過期申請會保留在這裡；你送出的金額會自動退回保險箱。'
    : '新的贈禮申請會顯示在這裡，申請期限為 168 小時。',
)

const createdAtFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Taipei',
})

function isIncoming(request: GiftRequest) {
  return request.receiver.playerId === props.currentPlayerId
}

function isOutgoing(request: GiftRequest) {
  return request.sender.playerId === props.currentPlayerId
}

function counterparty(request: GiftRequest) {
  return isIncoming(request) ? request.sender : request.receiver
}

function formatCreatedAt(timestamp: number) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '時間未提供' : createdAtFormatter.format(date)
}

function toDateTime(timestamp: number) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function isUrgent(request: GiftRequest) {
  const remaining = request.expiresAt - props.now
  return remaining > 0 && remaining <= 24 * 60 * 60 * 1000
}

function isPastDue(request: GiftRequest) {
  return request.expiresAt <= props.now
}

function isExpired(request: GiftRequest) {
  return request.status === 'expired'
}
</script>

<template>
  <section class="request-panel card-purple" aria-labelledby="gift-request-heading">
    <header class="request-header">
      <div class="request-title">
        <div>
          <h2 id="gift-request-heading">{{ panelHeading }}</h2>
          <span>{{ panelSummary }}</span>
        </div>
      </div>

      <div class="request-filters tab-bar" role="group" aria-label="贈禮申請篩選">
        <button
          v-for="filter in filterOptions"
          :key="filter.key"
          type="button"
          class="tab-btn request-filter-button"
          :aria-pressed="activeFilter === filter.key"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
          <span>{{ filter.count }}</span>
        </button>
      </div>
    </header>

    <div v-if="visibleRequests.length" class="request-table">
      <div class="request-column-head" aria-hidden="true">
        <span>玩家 / 方向</span>
        <span>贈禮金額</span>
        <span>{{ activeFilter === 'expired' ? '到期時間' : '申請期限' }}</span>
        <span>{{ activeFilter === 'expired' ? '結果' : '操作' }}</span>
      </div>

      <TransitionGroup
        name="request-list"
        tag="div"
        class="request-list"
        role="list"
      >
        <article
          v-for="request in visibleRequests"
          :key="request.id"
          class="request-card"
          role="listitem"
          :class="{
            incoming: isIncoming(request),
            outgoing: isOutgoing(request),
            urgent: isUrgent(request),
            overdue: !isExpired(request) && isPastDue(request),
            expired: isExpired(request),
          }"
        >
          <div class="identity-block">
            <div class="avatar" aria-hidden="true">
              {{ counterparty(request).avatar || '👤' }}
            </div>
            <div class="identity-copy">
              <span class="direction-badge">
                <i aria-hidden="true">{{ isIncoming(request) ? '↓' : '↑' }}</i>
                {{ isIncoming(request) ? '收到贈禮' : '送出贈禮' }}
              </span>
              <strong>{{ counterparty(request).name }}</strong>
              <small>@{{ counterparty(request).account }}</small>
            </div>
          </div>

          <dl class="amount-block">
            <div>
              <dt>贈禮金額</dt>
              <dd>{{ request.amount.toLocaleString() }} <small>金幣</small></dd>
            </div>
            <div class="received-value">
              <dt>
                {{ isExpired(request)
                  ? (isIncoming(request) ? '原可實收' : '對方原可實收')
                  : (isIncoming(request) ? '你將實收' : '對方實收') }}
              </dt>
              <dd>{{ request.actualReceived.toLocaleString() }} <small>金幣</small></dd>
            </div>
          </dl>

          <div class="time-block">
            <div>
              <span>{{ isExpired(request) ? '到期時間' : '剩餘期限' }}</span>
              <time
                v-if="isExpired(request)"
                class="expiry-time"
                :datetime="toDateTime(request.expiresAt)"
              >
                已於 {{ formatCreatedAt(request.expiresAt) }} 過期
              </time>
              <strong v-else>{{ formatGiftRequestRemainingTime(request, now) }}</strong>
            </div>
            <time class="created-time" :datetime="toDateTime(request.createdAt)">
              申請於 {{ formatCreatedAt(request.createdAt) }}
            </time>
          </div>

          <div class="request-actions">
            <div
              v-if="isExpired(request)"
              class="expired-result"
              :class="{ refunded: isOutgoing(request) }"
            >
              <strong>{{ isOutgoing(request) ? '已退回保險箱' : '申請已失效' }}</strong>
              <small>
                {{ isOutgoing(request)
                  ? `原額 ${request.amount.toLocaleString()} 金幣`
                  : '逾期後無法接受' }}
              </small>
            </div>
            <template v-else-if="isIncoming(request)">
              <button
                type="button"
                class="action-button reject"
                :disabled="isPastDue(request)"
                :aria-label="`拒絕 ${counterparty(request).name} 的贈禮`"
                @click="emit('reject', request)"
              >
                拒絕
              </button>
              <button
                type="button"
                class="action-button accept"
                :disabled="isPastDue(request)"
                :aria-label="`接受 ${counterparty(request).name} 的贈禮`"
                @click="emit('accept', request)"
              >
                接受
              </button>
            </template>
            <button
              v-else
                type="button"
                class="action-button cancel"
              :disabled="isPastDue(request)"
              :aria-label="`取消送給 ${counterparty(request).name} 的贈禮申請`"
              @click="emit('cancel', request)"
            >
              取消申請
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <div v-else class="request-empty" role="status">
      <span aria-hidden="true">禮</span>
      <strong>{{ emptyMessage }}</strong>
      <p>{{ emptyDescription }}</p>
    </div>
  </section>
</template>

<style scoped>
.request-panel {
  --incoming-color: #f5c842;
  --outgoing-color: #c084fc;
  position: relative;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.045)),
    rgba(20, 6, 40, 0.72);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.24),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.request-panel::before {
  position: absolute;
  inset: 0 18% auto;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(245, 200, 66, 0.75), transparent);
  content: "";
}

.request-panel.card-purple:hover {
  transform: none;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.24),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.request-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.13);
}

.request-title > div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.request-title h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.request-title span {
  color: var(--color-text-muted);
  font-size: 11px;
}

.request-filters {
  display: flex;
  width: min(420px, 52%);
  flex: 0 0 auto;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 10px;
  background: rgba(7, 1, 16, 0.32);
}

.request-filter-button {
  display: flex;
  min-width: 0;
  min-height: 38px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 7px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.request-filter-button span {
  display: grid;
  min-width: 18px;
  height: 18px;
  place-items: center;
  padding: 0 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 9px;
}

.request-filter-button:hover {
  color: var(--color-text);
}

.request-filter-button.active {
  color: #fff;
  background: linear-gradient(135deg, var(--color-purple-mid), var(--color-purple));
  box-shadow: 0 3px 12px rgba(124, 58, 237, 0.32);
}

.request-filter-button.active span {
  background: rgba(255, 255, 255, 0.15);
}

.request-table {
  margin: 20px 24px 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: rgba(7, 1, 16, 0.18);
}

.request-column-head {
  display: grid;
  grid-template-columns: minmax(190px, 1.15fr) minmax(230px, 1.3fr) minmax(145px, 0.8fr) minmax(126px, auto);
  gap: 18px;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.13);
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.045);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.request-column-head span:last-child {
  text-align: right;
}

.request-list {
  position: relative;
}

.request-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(190px, 1.15fr) minmax(230px, 1.3fr) minmax(145px, 0.8fr) minmax(126px, auto);
  align-items: center;
  gap: 18px;
  min-height: 88px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  transition: background 0.18s ease;
}

.request-card:last-child {
  border-bottom: 0;
}

.request-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--outgoing-color);
  content: "";
}

.request-card.incoming::before {
  background: var(--incoming-color);
}

.request-card:hover {
  background: rgba(255, 255, 255, 0.045);
}

.request-card.urgent {
  box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.22);
}

.request-card.overdue {
  opacity: 0.65;
}

.request-card.expired {
  background: rgba(255, 255, 255, 0.018);
}

.request-card.expired::before {
  background: rgba(196, 181, 213, 0.34);
}

.request-card.expired:hover {
  background: rgba(255, 255, 255, 0.035);
}

.request-card.expired .avatar {
  border-color: rgba(196, 181, 213, 0.15);
  background: rgba(196, 181, 213, 0.055);
  filter: grayscale(0.45);
  opacity: 0.72;
}

.request-card.expired .direction-badge,
.request-card.expired .identity-copy small,
.request-card.expired .amount-block dt,
.request-card.expired .amount-block dd small {
  color: rgba(196, 181, 213, 0.52);
}

.request-card.expired .identity-copy strong,
.request-card.expired .amount-block dd,
.request-card.expired .amount-block .received-value dd {
  color: rgba(243, 232, 255, 0.72);
}

.identity-block {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}

.avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(192, 132, 252, 0.22);
  border-radius: 9px;
  background: rgba(168, 85, 247, 0.1);
  font-size: 20px;
}

.incoming .avatar {
  border-color: rgba(245, 200, 66, 0.23);
  background: rgba(245, 200, 66, 0.07);
}

.identity-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.direction-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
  color: var(--outgoing-color);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.incoming .direction-badge {
  color: var(--incoming-color);
}

.direction-badge i {
  display: inline-grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-style: normal;
  line-height: 1;
}

.identity-copy strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-copy small {
  max-width: 100%;
  margin-top: 1px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-block {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  align-items: center;
  gap: 18px;
  margin: 0;
  padding: 0 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 1px solid rgba(255, 255, 255, 0.07);
}

.amount-block .received-value {
  padding-left: 18px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.amount-block dt,
.time-block span {
  margin-bottom: 3px;
  color: var(--color-text-muted);
  font-size: 10px;
}

.amount-block dd {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
}

.amount-block dd small {
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 600;
}

.amount-block .received-value dd {
  color: var(--color-gold);
}

.time-block {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.time-block > div {
  display: flex;
  flex-direction: column;
}

.time-block strong {
  color: var(--color-text);
  font-size: 12px;
  font-weight: 900;
}

.urgent .time-block strong,
.overdue .time-block strong {
  color: #fca5a5;
}

.time-block time {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-block .expiry-time {
  color: rgba(243, 232, 255, 0.7);
  font-size: 12px;
  font-weight: 900;
}

.request-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.expired-result {
  display: flex;
  min-width: 118px;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  text-align: right;
}

.expired-result strong {
  color: rgba(243, 232, 255, 0.72);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.expired-result small {
  color: rgba(196, 181, 213, 0.5);
  font-size: 9px;
  white-space: nowrap;
}

.expired-result.refunded strong {
  color: rgba(245, 200, 66, 0.72);
}

.action-button {
  min-width: 62px;
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
  transition: filter 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.action-button:focus-visible,
.request-filters button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.action-button.accept {
  color: #1c0a22;
  background: linear-gradient(135deg, #f5c842, #d97706);
  box-shadow: 0 4px 15px rgba(245, 200, 66, 0.22);
}

.action-button.reject {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(248, 113, 113, 0.08);
}

.action-button.cancel {
  min-width: 82px;
  color: var(--color-purple-light);
  border-color: rgba(192, 132, 252, 0.42);
  background: rgba(168, 85, 247, 0.08);
}

.request-empty {
  position: relative;
  display: flex;
  min-height: 172px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px 24px 24px;
  padding: 28px 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: var(--color-text-muted);
  text-align: center;
  background: rgba(7, 1, 16, 0.18);
}

.request-empty > span {
  display: grid;
  width: 45px;
  height: 45px;
  margin-bottom: 10px;
  place-items: center;
  border: 1px solid rgba(245, 200, 66, 0.25);
  border-radius: 9px;
  color: var(--color-gold);
  background: rgba(245, 200, 66, 0.07);
  font-size: 15px;
  font-weight: 900;
}

.request-empty strong {
  color: var(--color-text);
  font-size: 13px;
}

.request-empty p {
  margin: 4px 0 0;
  font-size: 10px;
}

.request-list-enter-active,
.request-list-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.request-list-enter-from,
.request-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 1100px) {
  .request-column-head {
    display: none;
  }

  .request-card {
    grid-template-columns: minmax(180px, 1fr) minmax(215px, 1.2fr) auto;
  }

  .time-block {
    grid-column: 1 / 3;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .time-block > div {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .time-block span {
    margin: 0;
  }

  .time-block time {
    text-align: right;
  }

  .request-actions {
    grid-column: 3;
    grid-row: 1 / 3;
  }
}

@media (max-width: 720px) {
  .request-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    padding: 19px 16px 16px;
  }

  .request-filters {
    width: 100%;
  }

  .request-filters button {
    flex: 1;
    justify-content: center;
  }

  .request-table {
    margin: 16px;
  }

  .request-card {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 13px;
    padding: 15px 14px 15px 16px;
  }

  .identity-block {
    grid-column: 1;
  }

  .amount-block {
    grid-column: 1 / 3;
    grid-row: 2;
    padding: 12px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    border-left: 0;
  }

  .amount-block .received-value {
    padding-left: 14px;
  }

  .time-block {
    grid-column: 1 / 3;
    grid-row: 3;
    padding-top: 0;
    border: 0;
  }

  .request-actions {
    grid-column: 2;
    grid-row: 1;
  }
}

@media (max-width: 440px) {
  .request-title > div {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .request-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .request-filter-button {
    gap: 4px;
    padding: 7px 5px;
    font-size: 11px;
  }

  .request-filter-button span {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 8px;
  }

  .identity-block,
  .amount-block,
  .time-block,
  .request-actions {
    grid-column: 1;
  }

  .identity-block {
    grid-row: 1;
  }

  .amount-block {
    grid-row: 2;
  }

  .time-block {
    grid-row: 3;
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .time-block time {
    text-align: left;
  }

  .request-actions {
    grid-row: 4;
    width: 100%;
    justify-content: stretch;
  }

  .expired-result {
    width: 100%;
    align-items: flex-start;
    padding-top: 2px;
    text-align: left;
  }

  .action-button {
    flex: 1;
  }

  .request-empty {
    margin: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .request-card,
  .action-button,
  .request-filters button,
  .request-list-enter-active,
  .request-list-leave-active {
    transition: none;
  }
}
</style>
