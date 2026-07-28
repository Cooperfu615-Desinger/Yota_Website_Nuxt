<script setup lang="ts">
import {
  formatGiftRequestRemainingTime,
  type GiftRequest,
} from '~/utils/giftRequest'

type RequestFilter = 'all' | 'incoming' | 'outgoing'

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

const pendingRequests = computed(() => props.requests
  .filter(request =>
    request.status === 'pending'
    && (
      request.sender.playerId === props.currentPlayerId
      || request.receiver.playerId === props.currentPlayerId
    )
  )
  .sort((a, b) => a.expiresAt - b.expiresAt))

const incomingCount = computed(() => pendingRequests.value
  .filter(request => request.receiver.playerId === props.currentPlayerId).length)

const outgoingCount = computed(() => pendingRequests.value
  .filter(request => request.sender.playerId === props.currentPlayerId).length)

const filterOptions = computed<{ key: RequestFilter; label: string; count: number }[]>(() => [
  { key: 'all', label: '全部', count: pendingRequests.value.length },
  { key: 'incoming', label: '收到', count: incomingCount.value },
  { key: 'outgoing', label: '送出', count: outgoingCount.value },
])

const visibleRequests = computed(() => {
  if (activeFilter.value === 'incoming') {
    return pendingRequests.value.filter(request => isIncoming(request))
  }
  if (activeFilter.value === 'outgoing') {
    return pendingRequests.value.filter(request => isOutgoing(request))
  }
  return pendingRequests.value
})

const emptyMessage = computed(() => {
  if (activeFilter.value === 'incoming') return '目前沒有等待你回覆的贈禮'
  if (activeFilter.value === 'outgoing') return '目前沒有等待對方回覆的贈禮'
  return '目前沒有待處理的贈禮申請'
})

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
</script>

<template>
  <section class="request-panel" aria-labelledby="gift-request-heading">
    <header class="request-header">
      <div class="request-title">
        <p>PENDING GIFT REQUESTS</p>
        <div>
          <h2 id="gift-request-heading">待處理贈禮</h2>
          <span>{{ pendingRequests.length }} 筆等待處理</span>
        </div>
      </div>

      <div class="request-filters" role="tablist" aria-label="待處理贈禮篩選">
        <button
          v-for="filter in filterOptions"
          :key="filter.key"
          type="button"
          role="tab"
          :aria-selected="activeFilter === filter.key"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
          <span>{{ filter.count }}</span>
        </button>
      </div>
    </header>

    <TransitionGroup
      v-if="visibleRequests.length"
      name="request-list"
      tag="div"
      class="request-list"
    >
      <article
        v-for="request in visibleRequests"
        :key="request.id"
        class="request-card"
        :class="{
          incoming: isIncoming(request),
          outgoing: isOutgoing(request),
          urgent: isUrgent(request),
          overdue: isPastDue(request),
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
          <span aria-hidden="true">→</span>
          <div class="received-value">
            <dt>{{ isIncoming(request) ? '你將實收' : '對方實收' }}</dt>
            <dd>{{ request.actualReceived.toLocaleString() }} <small>金幣</small></dd>
          </div>
        </dl>

        <div class="time-block">
          <div>
            <span>剩餘期限</span>
            <strong>{{ formatGiftRequestRemainingTime(request, now) }}</strong>
          </div>
          <time :datetime="toDateTime(request.createdAt)">
            申請於 {{ formatCreatedAt(request.createdAt) }}
          </time>
        </div>

        <div class="request-actions">
          <template v-if="isIncoming(request)">
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

    <div v-else class="request-empty" role="status">
      <span aria-hidden="true">禮</span>
      <strong>{{ emptyMessage }}</strong>
      <p>新的贈禮申請會顯示在這裡，申請期限為 168 小時。</p>
    </div>
  </section>
</template>

<style scoped>
.request-panel {
  --incoming-color: #f5c842;
  --outgoing-color: #c084fc;
  position: relative;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 100% 0, rgba(245, 200, 66, 0.08), transparent 30%),
    linear-gradient(145deg, rgba(26, 10, 46, 0.92), rgba(15, 0, 32, 0.9));
}

.request-panel::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 100% 44px;
  content: "";
  mask-image: linear-gradient(to bottom, black, transparent 76%);
}

.request-header {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.request-title > p {
  margin: 0 0 4px;
  color: var(--color-gold);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.request-title > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.request-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.request-title span {
  color: var(--color-text-muted);
  font-size: 10px;
}

.request-filters {
  display: flex;
  padding: 3px;
  border: 1px solid rgba(168, 85, 247, 0.18);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.18);
}

.request-filters button {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 800;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.request-filters button span {
  display: grid;
  min-width: 17px;
  height: 17px;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 8px;
}

.request-filters button:hover {
  color: var(--color-text);
}

.request-filters button.active {
  color: #1c0a22;
  background: var(--color-gold);
  box-shadow: 0 4px 14px rgba(245, 200, 66, 0.18);
}

.request-filters button.active span {
  background: rgba(28, 10, 34, 0.12);
}

.request-list {
  position: relative;
  display: grid;
  gap: 9px;
}

.request-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(190px, 1.15fr) minmax(230px, 1.3fr) minmax(145px, 0.8fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 96px;
  padding: 14px 14px 14px 17px;
  border: 1px solid rgba(168, 85, 247, 0.17);
  border-radius: 15px;
  overflow: hidden;
  background: rgba(9, 2, 20, 0.42);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.request-card::before {
  position: absolute;
  inset: 12px auto 12px 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--outgoing-color);
  box-shadow: 0 0 14px rgba(192, 132, 252, 0.45);
  content: "";
}

.request-card.incoming::before {
  background: var(--incoming-color);
  box-shadow: 0 0 14px rgba(245, 200, 66, 0.42);
}

.request-card:hover {
  border-color: rgba(192, 132, 252, 0.31);
  background: rgba(20, 7, 38, 0.74);
  transform: translateY(-1px);
}

.request-card.incoming:hover {
  border-color: rgba(245, 200, 66, 0.27);
}

.request-card.urgent {
  border-color: rgba(248, 113, 113, 0.28);
}

.request-card.overdue {
  opacity: 0.65;
}

.identity-block {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}

.avatar {
  display: grid;
  width: 45px;
  height: 45px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(192, 132, 252, 0.22);
  border-radius: 14px;
  background: rgba(168, 85, 247, 0.1);
  font-size: 21px;
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
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.incoming .direction-badge {
  color: var(--incoming-color);
}

.direction-badge i {
  font-style: normal;
}

.identity-copy strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-copy small {
  max-width: 100%;
  margin-top: 1px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-block {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) 20px minmax(90px, 1fr);
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 1px solid rgba(255, 255, 255, 0.07);
}

.amount-block > span {
  color: rgba(196, 181, 213, 0.35);
  font-size: 13px;
  text-align: center;
}

.amount-block dt,
.time-block span {
  margin-bottom: 3px;
  color: var(--color-text-muted);
  font-size: 8px;
}

.amount-block dd {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}

.amount-block dd small {
  color: var(--color-text-muted);
  font-size: 8px;
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
  font-size: 11px;
  font-weight: 900;
}

.urgent .time-block strong,
.overdue .time-block strong {
  color: #fca5a5;
}

.time-block time {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-button {
  min-width: 58px;
  min-height: 34px;
  padding: 7px 11px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 900;
  white-space: nowrap;
  transition: filter 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
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
  background: var(--color-gold);
  box-shadow: 0 5px 15px rgba(245, 200, 66, 0.14);
}

.action-button.reject,
.action-button.cancel {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.22);
  background: rgba(248, 113, 113, 0.08);
}

.action-button.cancel {
  min-width: 74px;
}

.request-empty {
  position: relative;
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 18px;
  border: 1px dashed rgba(168, 85, 247, 0.22);
  border-radius: 15px;
  color: var(--color-text-muted);
  text-align: center;
  background: rgba(0, 0, 0, 0.1);
}

.request-empty > span {
  display: grid;
  width: 45px;
  height: 45px;
  margin-bottom: 10px;
  place-items: center;
  border: 1px solid rgba(245, 200, 66, 0.25);
  border-radius: 50%;
  color: var(--color-gold);
  background: rgba(245, 200, 66, 0.07);
  font-size: 15px;
  font-weight: 900;
}

.request-empty strong {
  color: var(--color-text);
  font-size: 12px;
}

.request-empty p {
  margin: 4px 0 0;
  font-size: 9px;
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

@media (max-width: 1040px) {
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
  .request-panel {
    padding: 15px;
    border-radius: 17px;
  }

  .request-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .request-filters {
    width: 100%;
  }

  .request-filters button {
    flex: 1;
    justify-content: center;
  }

  .request-card {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 13px;
    padding: 14px 13px 14px 16px;
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
  }

  .action-button {
    flex: 1;
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
