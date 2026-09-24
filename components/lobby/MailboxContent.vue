<script setup lang="ts">
import type { InboxMessage } from '~/composables/useMailboxState'

type MessageFilter = 'event' | 'system'

const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
const { messages, markRead, deleteMessage, claimMailReward } = useMailboxState()
const filter = ref<MessageFilter>('event')
const selectedMessageId = ref<number | null>(messages.value.find(message => message.type === 'event')?.id ?? null)
const showMobileDetail = ref(false)
const loadingKey = ref('')
const notice = ref('')

const filteredMessages = computed(() => messages.value.filter(message => (
  filter.value === 'event' ? message.type === 'event' : message.type !== 'event'
)))
const selectedMessage = computed<InboxMessage | null>(() => messages.value.find(message => message.id === selectedMessageId.value) ?? null)
const categoryCounts = computed(() => ({
  event: messages.value.filter(message => message.type === 'event').length,
  system: messages.value.filter(message => message.type !== 'event').length,
}))
const unreadCounts = computed(() => ({
  event: messages.value.filter(message => message.type === 'event' && !message.read).length,
  system: messages.value.filter(message => message.type !== 'event' && !message.read).length,
}))
const walletSymbol = { gold: '金', silver: '銀', bronze: '銅' }
const filters: { key: MessageFilter; label: string; icon: string }[] = [
  { key: 'event', label: '營運公告', icon: '✦' },
  { key: 'system', label: '系統通知', icon: '✉' },
]

function categoryLabel(message: InboxMessage) {
  // 儲值到帳信仍屬現有的系統通知，不另開第三個玩家可見分類。
  return message.type === 'event' ? '營運公告' : '系統通知'
}

function selectFilter(next: MessageFilter) {
  filter.value = next
  showMobileDetail.value = false
  notice.value = ''
  const first = messages.value.find(message => next === 'event' ? message.type === 'event' : message.type !== 'event')
  selectedMessageId.value = first?.id ?? null
  if (first) markRead(first.id)
}

function selectMessage(message: InboxMessage) {
  selectedMessageId.value = message.id
  showMobileDetail.value = true
  markRead(message.id)
}

function removeMessage(id: number) {
  const next = filteredMessages.value.find(message => message.id !== id)
  deleteMessage(id)
  if (selectedMessageId.value === id) {
    selectedMessageId.value = next?.id ?? null
    if (next) markRead(next.id)
  }
  if (!next) showMobileDetail.value = false
  notice.value = '訊息已刪除'
}

async function claimReward(id: number) {
  if (loadingKey.value) return
  loadingKey.value = `mail-${id}`
  await new Promise(resolve => setTimeout(resolve, 700))
  const result = claimMailReward(id)
  loadingKey.value = ''
  notice.value = result ? '附件已領取並更新餘額' : '目前沒有可領取項目'
}

onMounted(() => {
  if (isLoggedIn.value && selectedMessageId.value !== null) markRead(selectedMessageId.value)
})
watch(isLoggedIn, loggedIn => {
  if (loggedIn && selectedMessageId.value !== null) markRead(selectedMessageId.value)
})
</script>

<template>
  <div class="lobby-page news-page px-4 py-5">
    <template v-if="!isLoggedIn">
      <section class="news-guest card-purple">
        <span class="news-guest-icon" aria-hidden="true">✉</span>
        <h1>最新消息</h1>
        <p>登入後即可查看營運公告、系統通知與信件附件。</p>
        <button type="button" class="btn-gold" @click="openLogin(route.fullPath)">立即登入 / 註冊</button>
      </section>
    </template>

    <template v-else>
      <header class="news-heading">
        <div>
          <p class="news-eyebrow">NEWS & ANNOUNCEMENTS</p>
          <h1 class="section-title">最新消息</h1>
          <p class="news-intro">營運公告與系統通知，都可以在這裡查看。</p>
        </div>
        <span class="news-total">{{ messages.length }} 則訊息</span>
      </header>

      <p v-if="notice" class="news-notice" role="status">{{ notice }}</p>

      <div class="news-shell" :class="{ 'show-detail-mobile': showMobileDetail }">
        <section class="news-list" aria-label="消息列表">
          <div class="news-filter" role="tablist" aria-label="消息分類">
            <button
              v-for="item in filters"
              :key="item.key"
              type="button"
              role="tab"
              :aria-selected="filter === item.key"
              :class="{ active: filter === item.key }"
              @click="selectFilter(item.key)"
            >
              <span aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
              <span class="news-filter-count">{{ categoryCounts[item.key] }}</span>
              <i v-if="unreadCounts[item.key]" class="news-filter-dot" :aria-label="`${unreadCounts[item.key]} 則未讀`" />
            </button>
          </div>
          <div class="news-list-summary">
            <strong>{{ filter === 'event' ? '營運公告' : '系統通知' }}</strong>
            <span>未讀 {{ unreadCounts[filter] }} 則</span>
          </div>

          <div class="news-list-scroll">
            <article
              v-for="message in filteredMessages"
              :key="message.id"
              class="news-entry"
              :class="{ selected: selectedMessageId === message.id, read: message.read }"
            >
              <button type="button" class="news-entry-main" :aria-pressed="selectedMessageId === message.id" @click="selectMessage(message)">
                <span class="news-entry-meta">
                  <span class="news-tag">{{ categoryLabel(message) }}</span>
                  <span class="news-read-state">{{ message.read ? '已讀' : '未讀' }}</span>
                  <time>{{ message.time }}</time>
                </span>
                <strong>{{ message.title }}</strong>
                <span class="news-preview">{{ message.preview }}</span>
                <span v-if="message.reward" class="news-attachment-tag" :class="{ claimed: message.reward.claimed }">{{ message.reward.claimed ? '附件已領取' : `可領附件 · ${message.reward.label}` }}</span>
              </button>
              <span v-if="!message.read" class="news-unread-dot" aria-hidden="true" />
              <button type="button" class="news-entry-delete" :aria-label="`刪除${message.title}`" @click="removeMessage(message.id)">✕</button>
            </article>
            <div v-if="!filteredMessages.length" class="news-empty">
              <span aria-hidden="true">✉</span>
              <strong>目前沒有{{ filter === 'event' ? '營運公告' : '系統通知' }}</strong>
              <p>新的訊息會顯示在這裡。</p>
            </div>
          </div>
        </section>

        <section class="news-detail" aria-label="消息內容">
          <button type="button" class="news-back" @click="showMobileDetail = false">← 返回消息列表</button>
          <template v-if="selectedMessage">
            <div class="news-detail-heading">
              <div class="news-detail-meta"><span class="news-tag">{{ categoryLabel(selectedMessage) }}</span><time>{{ selectedMessage.time }}</time></div>
              <h2>{{ selectedMessage.title }}</h2>
            </div>
            <div class="news-detail-body">
              <p class="news-body-copy">{{ selectedMessage.body }}</p>
              <div v-if="selectedMessage.reward" class="news-reward">
                <span class="news-reward-icon" aria-hidden="true">{{ walletSymbol[selectedMessage.reward.wallet] }}</span>
                <div>
                  <small>信件附件</small>
                  <strong>{{ selectedMessage.reward.label }}</strong>
                  <span>{{ selectedMessage.reward.claimed ? '已完成領取' : '領取後立即加入錢包' }}</span>
                </div>
                <button
                  type="button"
                  :disabled="selectedMessage.reward.claimed || !!loadingKey"
                  @click="claimReward(selectedMessage.id)"
                >{{ loadingKey === `mail-${selectedMessage.id}` ? '領取中…' : selectedMessage.reward.claimed ? '已領取' : '領取' }}</button>
              </div>
            </div>
            <div class="news-detail-footer"><button type="button" @click="removeMessage(selectedMessage.id)">刪除此訊息</button></div>
          </template>
          <div v-else class="news-empty news-detail-empty"><span aria-hidden="true">✉</span><strong>選擇一則消息</strong><p>內容與附件會顯示在這裡。</p></div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.news-page{max-width:1320px;margin:0 auto}.news-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:20px}.news-eyebrow{margin:0 0 5px;color:var(--color-gold);font-size:11px;font-weight:900;letter-spacing:.14em}.news-heading h1{font-size:24px}.news-intro{margin:8px 0 0;color:var(--color-text-muted);font-size:14px}.news-total{white-space:nowrap;padding:8px 13px;border:1px solid var(--color-border-gold);border-radius:999px;color:var(--color-gold-light);background:rgba(245,200,66,.07);font-size:13px;font-weight:700}.news-notice{margin:0 0 12px;padding:10px 14px;border:1px solid rgba(74,222,128,.25);border-radius:10px;background:rgba(74,222,128,.1);color:#bbf7d0;font-size:14px}
.news-shell{display:grid;grid-template-columns:minmax(300px,38%) minmax(0,1fr);min-height:620px;border:1px solid rgba(255,255,255,.23);border-radius:20px;overflow:hidden;background:linear-gradient(145deg,rgba(32,20,63,.96),rgba(22,16,48,.95));box-shadow:0 18px 40px rgba(0,0,0,.18)}.news-list{min-width:0;border-right:1px solid var(--color-border);background:rgba(8,9,31,.34)}.news-filter{display:flex;gap:9px;padding:17px;border-bottom:1px solid var(--color-border)}.news-filter button{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;flex:1;min-width:0;min-height:44px;padding:8px 10px;border:1px solid var(--color-border);border-radius:10px;background:rgba(255,255,255,.04);color:var(--color-text-muted);font-size:14px;font-weight:800;white-space:nowrap;cursor:pointer}.news-filter button.active{border-color:var(--color-border-gold);background:rgba(245,200,66,.15);color:var(--color-gold-light)}.news-filter-count{display:grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:999px;background:rgba(255,255,255,.12);font-size:12px}.news-filter-dot{position:absolute;right:4px;top:4px;width:7px;height:7px;border-radius:50%;background:#f87171}.news-list-summary{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.1)}.news-list-summary strong{font-size:16px}.news-list-summary span{color:var(--color-text-muted);font-size:13px}.news-list-scroll{max-height:720px;overflow-y:auto}.news-entry{position:relative;display:flex;align-items:stretch;border-left:4px solid transparent;border-bottom:1px solid rgba(255,255,255,.09);transition:background .2s}.news-entry:hover{background:rgba(168,85,247,.09)}.news-entry.selected{border-left-color:var(--color-gold);background:rgba(245,200,66,.075)}.news-entry.read:not(.selected){opacity:.78}.news-entry-main{display:flex;flex:1;min-width:0;flex-direction:column;align-items:start;gap:8px;padding:19px 10px 19px 18px;border:0;background:transparent;color:var(--color-text);text-align:left;cursor:pointer}.news-entry-meta{display:flex;align-items:center;gap:7px;width:100%;padding-right:8px}.news-tag{display:inline-flex;padding:4px 8px;border:1px solid var(--color-border-gold);border-radius:6px;background:rgba(245,200,66,.1);color:var(--color-gold-light);font-size:12px;font-weight:800;white-space:nowrap}.news-read-state{color:var(--color-text-muted);font-size:12px}.news-entry-meta time{margin-left:auto;color:var(--color-text-muted);font-size:12px;white-space:nowrap}.news-entry-main strong{display:block;max-width:100%;overflow:hidden;font-size:16px;text-overflow:ellipsis;white-space:nowrap}.news-preview{display:block;max-width:100%;overflow:hidden;color:var(--color-text-muted);font-size:14px;text-overflow:ellipsis;white-space:nowrap}.news-attachment-tag{padding:5px 9px;border-radius:7px;background:rgba(245,200,66,.11);color:var(--color-gold-light);font-size:12px;font-weight:700}.news-attachment-tag.claimed{background:rgba(255,255,255,.07);color:var(--color-text-muted)}.news-unread-dot{position:absolute;left:6px;top:24px;width:7px;height:7px;border-radius:50%;background:#f87171}.news-entry-delete{align-self:start;margin:17px 10px 0 0;padding:7px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--color-text-muted);font-size:13px;cursor:pointer}.news-entry-delete:hover{border-color:rgba(248,113,113,.3);color:#fca5a5}.news-entry-main:focus-visible,.news-entry-delete:focus-visible,.news-filter button:focus-visible,.news-back:focus-visible,.news-reward button:focus-visible{outline:2px solid var(--color-gold);outline-offset:-2px}
.news-detail{display:flex;min-width:0;flex-direction:column}.news-back{display:none}.news-detail-heading{padding:26px 30px 22px;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,.025)}.news-detail-meta{display:flex;align-items:center;gap:12px}.news-detail-meta time{color:var(--color-text-muted);font-size:13px}.news-detail-heading h2{margin:15px 0 0;font-size:23px;font-weight:900;line-height:1.4}.news-detail-body{flex:1;padding:26px 30px}.news-body-copy{min-height:185px;margin:0;padding:20px;border:1px solid var(--color-border);border-radius:14px;background:rgba(12,8,30,.36);font-size:15px;line-height:1.9;white-space:pre-wrap}.news-reward{display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:13px;margin-top:17px;padding:15px;border:1px solid var(--color-border-gold);border-radius:13px;background:rgba(245,200,66,.07)}.news-reward-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:11px;background:linear-gradient(135deg,var(--color-gold-light),var(--color-gold-dark));color:#291b31;font-size:19px;font-weight:900}.news-reward>div{display:flex;min-width:0;flex-direction:column;gap:3px}.news-reward small,.news-reward>div>span{color:var(--color-text-muted);font-size:12px}.news-reward strong{font-size:16px}.news-reward button{min-width:70px;padding:10px 13px;border:0;border-radius:9px;background:var(--color-gold);color:#26162c;font-size:14px;font-weight:900;cursor:pointer}.news-reward button:disabled{opacity:.45;cursor:not-allowed}.news-detail-footer{display:flex;justify-content:flex-end;padding:16px 30px;border-top:1px solid var(--color-border)}.news-detail-footer button{padding:9px 13px;border:1px solid rgba(248,113,113,.32);border-radius:9px;background:rgba(248,113,113,.08);color:#fca5a5;font-size:13px;font-weight:800;cursor:pointer}.news-empty{display:flex;min-height:260px;flex-direction:column;align-items:center;justify-content:center;padding:25px;color:var(--color-text-muted);text-align:center}.news-empty>span{font-size:38px}.news-empty strong{margin-top:10px;color:var(--color-text);font-size:17px}.news-empty p{margin:6px 0 0;font-size:14px}.news-detail-empty{flex:1}.news-guest{display:flex;max-width:440px;min-height:320px;flex-direction:column;align-items:center;justify-content:center;gap:13px;margin:30px auto;padding:30px;text-align:center}.news-guest-icon{font-size:44px}.news-guest h1{margin:0;font-size:24px}.news-guest p{margin:0;color:var(--color-text-muted);font-size:15px;line-height:1.7}.news-guest button{margin-top:8px}
@media(max-width:850px){.news-shell{grid-template-columns:minmax(265px,42%) minmax(0,1fr)}.news-detail-heading{padding:23px}.news-detail-body{padding:23px}.news-reward{grid-template-columns:42px 1fr}.news-reward-icon{width:42px;height:42px}.news-reward button{grid-column:1/-1}}
@media(max-width:680px){.news-heading{align-items:start;flex-direction:column}.news-shell{display:block;min-height:0}.news-list{border-right:0}.news-list-scroll{max-height:none}.news-detail{display:none}.news-shell.show-detail-mobile .news-list{display:none}.news-shell.show-detail-mobile .news-detail{display:flex}.news-back{display:block;width:100%;padding:15px 19px;border:0;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,.05);color:var(--color-gold-light);font-size:14px;font-weight:800;text-align:left}.news-detail-heading{padding:21px}.news-detail-body{padding:20px}.news-detail-heading h2{font-size:21px}.news-detail-footer{padding:15px 20px}}
@media(max-width:390px){.news-filter{padding:12px;gap:6px}.news-filter button{font-size:12px}.news-entry-meta{flex-wrap:wrap}.news-entry-meta time{margin-left:0}.news-reward{grid-template-columns:1fr}.news-reward button{grid-column:auto}}
</style>
