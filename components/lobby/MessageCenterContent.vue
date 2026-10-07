<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import { canDeleteInboxMessage, getClaimableGold, type InboxCategory, type NewsCategory, type CenterMessage } from '~/utils/messageCenters'

const props = defineProps<{ mode: 'news' | 'inbox'; publicAccess?: boolean }>()
const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
const { announcements, messages, readEventIds, newsUnread, inboxUnread, markRead,
  deleteMessage, claimRewards, claimCategory, claimableCount, claiming } = useMessageCentersState()
const isInbox = computed(() => props.mode === 'inbox')
const canBrowse = computed(() => isLoggedIn.value || (props.publicAccess && !isInbox.value))
const title = computed(() => isInbox.value ? '信箱' : '最新消息')
const categories = computed(() => isInbox.value ? siteContent.messageCenters.inboxCategories : siteContent.messageCenters.newsCategories)
const category = ref<NewsCategory | InboxCategory>(isInbox.value ? 'system' : 'events')
const currentLabel = computed(() => categories.value.find(item => item.key === category.value)?.label ?? '')
const source = computed(() => isInbox.value ? messages.value : announcements.value)
const filtered = computed(() => source.value.filter(message => message.type === category.value))
const selectedId = ref<number | null>(filtered.value[0]?.id ?? null)
const selected = computed(() => filtered.value.find(message => message.id === selectedId.value) ?? null)
const showDetail = ref(false)
const compact = ref(false)
const mounted = ref(false)
const notice = ref('')
let media: MediaQueryList | undefined
function updateScreen() { compact.value = !!media?.matches }
const totalUnread = computed(() => isInbox.value ? inboxUnread.value : newsUnread.value)
const batchCount = computed(() => isInbox.value ? claimableCount(category.value as InboxCategory) : 0)

const eventId = computed(() => mounted.value && typeof route.query.event === 'string' ? Number(route.query.event) : undefined)
function countFor(key: string) {
  return key === 'events' && !isInbox.value ? siteContent.lobbyEvents.length : source.value.filter(item => item.type === key).length
}
function applyNewsQuery() {
  if (isInbox.value) return
  const key = siteContent.messageCenters.newsCategories.find(item => item.key === route.query.category)?.key ?? 'events'
  category.value = key
  const id = typeof route.query.message === 'string' ? Number(route.query.message) : NaN
  const entry = filtered.value.find(item => item.id === id)
  selectedId.value = entry?.id ?? filtered.value[0]?.id ?? null
  showDetail.value = !!entry
}
watch(() => route.query, () => { if (mounted.value) applyNewsQuery() })

function unreadFor(key: string) {
  return key === 'events' && !isInbox.value
    ? siteContent.lobbyEvents.filter(event => !readEventIds.value.includes(event.id)).length
    : source.value.filter(message => message.type === key && !message.read).length
}
function selectCategory(key: NewsCategory | InboxCategory) {
  category.value = key
  selectedId.value = filtered.value[0]?.id ?? null
  showDetail.value = false
  notice.value = ''
}
function selectMessage(message: CenterMessage) {
  selectedId.value = message.id
  showDetail.value = true
  notice.value = ''
}
function claim(ids?: number[]) {
  const result = ids ? claimRewards(ids) : claimCategory(category.value as InboxCategory)
  notice.value = result.ok ? `已領取 ${result.count} 封附件，共 ${result.total.toLocaleString()} 金幣，錢包與交易紀錄已更新。` : '目前沒有可領取項目，或本次領取未成功。'
}
function remove(message: CenterMessage) {
  if (!deleteMessage(message.id)) {
    notice.value = '請先領取附件，才能刪除此信件。'
    return
  }
  if (selectedId.value === message.id) selectedId.value = filtered.value[0]?.id ?? null
  if (!filtered.value.length) showDetail.value = false
  notice.value = '信件已刪除。'
}
watch(filtered, items => {
  if (!items.some(item => item.id === selectedId.value)) selectedId.value = items[0]?.id ?? null
})
watch([mounted, isLoggedIn, compact, showDetail, selected, source], () => {
  if (mounted.value && isLoggedIn.value && (!compact.value || showDetail.value) && selected.value) markRead(props.mode, selected.value.id)
})
onMounted(() => {
  media = window.matchMedia('(max-width: 900px)')
  updateScreen()
  media.addEventListener('change', updateScreen)
  mounted.value = true
  applyNewsQuery()
})
onUnmounted(() => media?.removeEventListener('change', updateScreen))
</script>

<template>
  <div class="lobby-page message-center-page px-4 py-5">
    <section v-if="!canBrowse" class="message-guest card-purple">
      <span class="message-guest-icon" aria-hidden="true">{{ isInbox ? '✉' : '◈' }}</span>
      <h1>{{ title }}</h1>
      <p>{{ isInbox ? '登入後查看個人通知、補單進度與信件附件。' : '登入後查看活動、遊戲公告、維護公告與系統公告。' }}</p>
      <button type="button" class="btn-gold" @click="openLogin(route.fullPath)">立即登入 / 註冊</button>
    </section>
    <template v-else>
      <header class="message-heading">
        <div>
          <p class="message-eyebrow">{{ isInbox ? 'PERSONAL INBOX' : 'NEWS & ANNOUNCEMENTS' }}</p>
          <h1 class="section-title">{{ title }}</h1>
          <p class="message-intro">{{ isInbox ? '你的專屬通知與獎勵，都在這裡。' : '掌握最新活動與服務資訊。個人通知請至信箱查看。' }}</p>
        </div>
        <div class="message-heading-actions">
          <span class="message-total">{{ isLoggedIn ? `未讀 ${totalUnread} 則` : `共 ${siteContent.lobbyEvents.length + announcements.length} 則消息` }}</span>
          <button v-if="isInbox" type="button" class="message-batch btn-gold" :disabled="!batchCount || claiming" @click="claim()">一鍵領取 <span>{{ batchCount }}</span></button>
        </div>
      </header>
      <p v-if="notice" class="message-notice" role="status">{{ notice }}</p>
      <div class="message-center-shell" :class="{ 'is-compact': compact, 'show-detail': showDetail }">
        <nav class="message-category-rail" :aria-label="`${title}分類`">
          <button v-for="item in categories" :key="item.key" type="button" class="message-category"
            :class="{ active: category === item.key }" :aria-pressed="category === item.key"
            :aria-label="isLoggedIn ? `${item.label}，未讀 ${unreadFor(item.key)} 則` : `${item.label}，共 ${countFor(item.key)} 則`" @click="selectCategory(item.key)">
            <span class="message-category-icon" aria-hidden="true">{{ item.icon }}</span>
            <strong>{{ item.label }}</strong>
            <span v-if="isLoggedIn && unreadFor(item.key)" class="message-category-count">{{ unreadFor(item.key) }}</span>
          </button>
        </nav>
        <div class="message-center-content">
          <LobbyEventsContent v-if="!isInbox && category === 'events'" embedded :compact="compact" :initial-event-id="eventId" />
          <div v-else class="message-panels">
            <section class="message-list" :aria-label="`${currentLabel}列表`">
              <div class="message-list-summary"><strong>{{ currentLabel }}</strong><span>{{ filtered.length }} 則<span v-if="isLoggedIn"> · 未讀 {{ unreadFor(category) }}</span></span></div>
              <div class="message-list-scroll">
                <article v-for="message in filtered" :key="message.id" class="message-entry" :class="{ selected: selectedId === message.id, read: message.read }">
                  <button type="button" class="message-entry-main" :aria-pressed="selectedId === message.id" @click="selectMessage(message)">
                    <span class="message-entry-meta"><time>{{ message.date }}</time><span v-if="isLoggedIn" :class="{ unread: !message.read }">{{ message.read ? '已讀' : '未讀' }}</span></span>
                    <strong>{{ message.title }}</strong>
                    <span class="message-preview">{{ message.content.replace(/\s+/g, ' ') }}</span>
                    <span v-if="isInbox && message.attachment" class="message-attachment-tag">{{ message.attachment.claimed ? '附件已領取' : getClaimableGold(message) ? `可領取 · ${message.attachment.amount}` : `附件 · ${message.attachment.amount}` }}</span>
                  </button>
                </article>
                <div v-if="!filtered.length" class="message-empty"><span aria-hidden="true">✉</span><strong>目前沒有{{ currentLabel }}</strong><p>新的訊息會顯示在這裡。</p></div>
              </div>
            </section>
            <section class="message-detail" :aria-label="`${title}內容`">
              <button type="button" class="message-back" @click="showDetail = false">← 返回列表</button>
              <template v-if="selected">
                <header class="message-detail-heading"><span class="message-tag">{{ currentLabel }}</span><time>{{ selected.date }}</time><h2>{{ selected.title }}</h2></header>
                <div class="message-detail-body">
                  <p class="message-body-copy">{{ selected.content }}</p>
                  <div v-if="isInbox && selected.attachment" class="message-reward">
                    <span class="message-reward-icon" aria-hidden="true">{{ getClaimableGold(selected) ? '金' : '▣' }}</span>
                    <div><small>{{ selected.attachment.label }}</small><strong>{{ selected.attachment.amount }}</strong><span>{{ selected.attachment.claimed ? '已完成領取' : getClaimableGold(selected) ? '領取後加入本次示範錢包' : '此附件目前尚未支援領取' }}</span></div>
                    <button type="button" class="btn-gold" :disabled="selected.attachment.claimed || !getClaimableGold(selected) || claiming" @click="claim([selected.id])">{{ selected.attachment.claimed ? '已領取' : getClaimableGold(selected) ? '領取' : '暫不支援' }}</button>
                  </div>
                </div>
                <footer v-if="isInbox" class="message-detail-footer"><span>{{ canDeleteInboxMessage(selected) ? '此信件可以刪除' : '請先領取附件，再刪除信件' }}</span><button type="button" :disabled="!canDeleteInboxMessage(selected) || claiming" @click="remove(selected)">刪除信件</button></footer>
              </template>
              <div v-else class="message-empty"><span aria-hidden="true">◈</span><strong>尚無訊息內容</strong><p>請選擇其他分類查看。</p></div>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.message-center-page{max-width:1440px;margin:0 auto}.message-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.message-eyebrow{margin:0 0 7px;color:var(--color-gold);font-size:11px;font-weight:900;letter-spacing:.15em}.message-heading h1{font-size:26px}.message-intro{margin:9px 0 0;color:var(--color-text-muted);font-size:14px;line-height:1.6}.message-heading-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.message-total{padding:9px 14px;border:1px solid var(--color-border);border-radius:999px;background:rgba(168,85,247,.06);font-size:13px;white-space:nowrap}.message-batch{min-height:44px;font-size:15px;gap:10px}.message-batch span{padding:1px 7px;border-radius:20px;background:rgba(0,0,0,.1)}.message-notice{margin-bottom:16px;padding:14px 18px;border:1px solid rgba(245,200,66,.3);border-radius:12px;background:rgba(245,200,66,.07);color:var(--color-gold-light);font-size:14px;line-height:1.6}
.message-center-shell{display:grid;grid-template-columns:124px minmax(0,1fr);min-height:620px;overflow:hidden;border:1px solid rgba(196,181,213,.23);border-radius:20px;background:linear-gradient(145deg,#20143f,#161030);box-shadow:0 18px 40px rgba(0,0,0,.18)}.message-category-rail{display:flex;flex-direction:column;gap:10px;padding:14px 10px;border-right:1px solid var(--color-border);background:rgba(8,5,24,.3)}.message-category{position:relative;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:94px;padding:12px 6px;border:1px solid transparent;border-radius:14px;background:transparent;color:var(--color-text-muted);cursor:pointer}.message-category:hover{background:rgba(168,85,247,.09);color:var(--color-text)}.message-category.active{background:linear-gradient(135deg,var(--color-gold-light),var(--color-gold-dark));color:#28142d;box-shadow:0 6px 20px rgba(245,200,66,.15)}.message-category-icon{font-size:24px;line-height:1.1}.message-category strong{font-size:15px;white-space:nowrap}.message-category-count{position:absolute;top:6px;right:6px;display:grid;place-items:center;min-width:19px;height:19px;padding:0 4px;border-radius:20px;background:#ec4899;color:white;font-size:11px;font-weight:800}.message-category:focus-visible,.message-entry-main:focus-visible,.message-back:focus-visible{outline:2px solid var(--color-gold);outline-offset:-3px}.message-center-content{min-width:0}.message-panels{display:grid;grid-template-columns:minmax(240px,34%) minmax(0,1fr);min-height:620px}.message-list{min-width:0;border-right:1px solid var(--color-border);background:rgba(8,9,31,.3)}.message-list-summary{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:20px 18px;border-bottom:1px solid var(--color-border)}.message-list-summary strong{font-size:16px}.message-list-summary span{font-size:12px;color:var(--color-text-muted);white-space:nowrap}.message-list-scroll{max-height:720px;overflow-y:auto}.message-entry{border-bottom:1px solid rgba(255,255,255,.08);border-left:3px solid transparent}.message-entry.selected{border-left-color:var(--color-gold);background:rgba(245,200,66,.07)}.message-entry-main{display:flex;flex-direction:column;gap:9px;width:100%;padding:20px 17px;border:0;background:transparent;color:var(--color-text);text-align:left;cursor:pointer}.message-entry-main:hover{background:rgba(168,85,247,.07)}.message-entry-main>strong{font-size:16px;line-height:1.5}.message-entry-meta{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--color-text-muted)}.message-entry-meta .unread{color:#f9a8d4;font-weight:800}.message-preview{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.7;color:var(--color-text-muted)}.message-attachment-tag{align-self:start;padding:4px 8px;border:1px solid rgba(245,200,66,.2);border-radius:6px;color:var(--color-gold);font-size:12px}.message-detail{display:flex;flex-direction:column;min-width:0}.message-detail-heading{padding:28px;border-bottom:1px solid var(--color-border)}.message-tag{display:inline-block;padding:5px 10px;border-radius:6px;background:rgba(168,85,247,.13);color:var(--color-purple-light);font-size:12px;font-weight:800}.message-detail-heading time{margin-left:12px;font-size:13px;color:var(--color-text-muted)}.message-detail-heading h2{margin:18px 0 0;font-size:24px;font-weight:900;line-height:1.5;overflow-wrap:anywhere}.message-detail-body{flex:1;padding:28px}.message-body-copy{margin:0;white-space:pre-wrap;font-size:15px;line-height:1.9;overflow-wrap:anywhere}.message-reward{display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:14px;margin-top:30px;padding:20px;border:1px solid rgba(245,200,66,.3);border-radius:16px;background:rgba(245,200,66,.06)}.message-reward-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:rgba(245,200,66,.12);color:var(--color-gold);font-size:23px;font-weight:900}.message-reward small,.message-reward strong,.message-reward div>span{display:block}.message-reward small{font-size:12px;color:var(--color-text-muted)}.message-reward strong{margin:5px 0;color:var(--color-gold);font-size:20px}.message-reward div>span{font-size:12px;line-height:1.6;color:var(--color-text-muted)}.message-reward button{font-size:14px}.message-detail-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 28px;border-top:1px solid var(--color-border)}.message-detail-footer span{font-size:12px;color:var(--color-text-muted)}.message-detail-footer button{padding:9px 14px;border:1px solid rgba(248,113,113,.3);border-radius:8px;background:rgba(248,113,113,.08);color:#fca5a5;font-size:14px;cursor:pointer}.message-back{display:none}button:disabled{opacity:.45;cursor:not-allowed}.message-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;flex:1;padding:60px 18px;text-align:center;color:var(--color-text-muted)}.message-empty>span{font-size:38px;color:var(--color-purple-light)}.message-empty strong{font-size:16px;color:var(--color-text)}.message-empty p{margin:0;font-size:14px}.message-guest{display:flex;align-items:center;flex-direction:column;gap:18px;padding:70px 25px;text-align:center}.message-guest-icon{font-size:50px;color:var(--color-gold)}.message-guest h1{font-size:28px;font-weight:900}.message-guest p{font-size:15px;line-height:1.8;color:var(--color-text-muted)}
@media(max-width:1100px){.message-center-shell{grid-template-columns:108px minmax(0,1fr)}.message-category-rail{padding:10px 7px}.message-detail-heading,.message-detail-body{padding:22px}.message-reward{grid-template-columns:40px minmax(0,1fr);padding:16px}.message-reward button{grid-column:1/-1}}
.is-compact .message-panels{display:block;min-height:500px}.is-compact .message-list{border-right:0}.is-compact .message-list-scroll{max-height:none}.is-compact .message-detail{display:none}.is-compact.show-detail .message-list{display:none}.is-compact.show-detail .message-detail{display:flex;min-height:500px}.is-compact .message-back{display:block;padding:15px 18px;border:0;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,.04);color:var(--color-gold);font-size:14px;font-weight:800;text-align:left}
@media(max-width:600px){.message-heading{align-items:start;flex-direction:column;gap:14px}.message-heading-actions{width:100%;justify-content:space-between}.message-center-shell{grid-template-columns:86px minmax(0,1fr);border-radius:16px;min-height:500px}.message-category-rail{padding:8px 5px;gap:6px}.message-category{min-height:85px}.message-category strong{font-size:14px}.message-category-icon{font-size:21px}.message-list-summary{align-items:start;flex-direction:column;padding:16px}.message-entry-main{padding:16px 13px}.message-detail-heading,.message-detail-body{padding:18px}.message-detail-heading h2{font-size:21px}.message-detail-heading time{display:block;margin:8px 0 0}.message-detail-footer{padding:15px;align-items:start;flex-direction:column}.message-reward{gap:10px;padding:14px;grid-template-columns:1fr}.message-reward button{grid-column:auto}.message-reward-icon{display:none}.message-reward strong{font-size:19px}.message-intro{font-size:14px}.message-body-copy{font-size:15px}}
</style>
