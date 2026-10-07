<script setup lang="ts">
import { siteContent, type LobbyEvent } from '~/data/siteContent'
import { getLobbyEventAvailability, type LobbyEventAvailability } from '~/utils/lobbyEventAvailability'
import { getLobbyEventAction } from '~/utils/lobbyEventAction'

const props = withDefaults(defineProps<{ embedded?: boolean; compact?: boolean; initialEventId?: number }>(), { embedded: false, compact: false })

const router = useRouter()
const { isLoggedIn, openLogin } = useAppState()
const lobbyEvents = siteContent.lobbyEvents
const now = useState<number>('lobby-events-now', () => Date.now())
const { readEventIds, markEventRead, supportActivityDraft } = useMessageCentersState()
const selectedId = ref(lobbyEvents[0]!.id)
const showMobileDetail = ref(false)
const eventsShell = ref<HTMLElement | null>(null)
const notice = ref('')
const selectedEvent = computed<LobbyEvent>(() => lobbyEvents.find(event => event.id === selectedId.value) ?? lobbyEvents[0]!)
watch(() => props.initialEventId, id => {
  if (!lobbyEvents.some(event => event.id === id)) return
  selectedId.value = id!
  showMobileDetail.value = true
}, { immediate: true })
const selectedStatus = computed(() => statusOf(selectedEvent.value))
const selectedAction = computed(() => getLobbyEventAction(selectedEvent.value, now.value))
const mounted = ref(false)
const smallScreen = ref(false)
const isCompact = computed(() => props.embedded ? props.compact : smallScreen.value)
let media: MediaQueryList | undefined
function updateScreen() { smallScreen.value = !!media?.matches }
let clock: ReturnType<typeof setInterval> | undefined

const statusLabels: Record<LobbyEventAvailability, string> = {
  upcoming: '即將開始', active: '進行中', ended: '已結束', unknown: '時間待確認',
}

function statusOf(event: LobbyEvent) {
  return getLobbyEventAvailability(event, now.value)
}

function selectEvent(event: LobbyEvent) {
  selectedId.value = event.id
  showMobileDetail.value = true
  notice.value = ''
  if (import.meta.client && window.matchMedia('(max-width: 680px)').matches) {
    nextTick(() => eventsShell.value?.scrollIntoView({ block: 'start' }))
  }
}

function handleAction(event: LobbyEvent) {
  const action = getLobbyEventAction(event, now.value)
  if (!action) return
  const paths = { store: '/lobby/bank', vip: '/lobby/member?tab=vip', games: '/lobby', support: `/lobby/chat?channel=support&activity=${event.id}` }
  if (!isLoggedIn.value) {
    openLogin(paths[action.target])
    return
  }
  if (action.target === 'support') supportActivityDraft.value = event.title
  router.push(paths[action.target])
}

onMounted(() => {
  now.value = Date.now()
  media = window.matchMedia('(max-width: 680px)')
  updateScreen()
  media.addEventListener('change', updateScreen)
  mounted.value = true
  clock = setInterval(() => { now.value = Date.now() }, 60_000)
})
onUnmounted(() => { if (clock) clearInterval(clock); media?.removeEventListener('change', updateScreen) })
watch([mounted, isLoggedIn, selectedId, isCompact, showMobileDetail, readEventIds], () => {
  if (mounted.value && isLoggedIn.value && (!isCompact.value || showMobileDetail.value)) markEventRead(selectedId.value)
})
</script>

<template>
  <div class="lobby-events-page" :class="{ 'lobby-page px-4 py-5': !embedded, 'events-embedded': embedded, 'events-compact': isCompact }">
    <header v-if="!embedded" class="events-heading">
      <div>
        <p class="events-eyebrow">EVENTS & REWARDS</p>
        <h1 class="section-title">活動</h1>
        <p class="events-intro">查看最新活動、獎勵與參與方式。</p>
      </div>
      <span class="events-count">{{ lobbyEvents.length }} 項示範活動</span>
    </header>

    <div ref="eventsShell" class="events-shell" :class="{ 'show-detail-mobile': showMobileDetail }">
      <section class="events-list" aria-label="活動清單">
        <div class="events-list-head">
          <strong>活動清單</strong>
          <span>選擇活動查看內容</span>
        </div>
        <div class="events-list-scroll">
          <button
            v-for="event in lobbyEvents"
            :key="event.id"
            type="button"
            class="event-list-item"
            :class="{ selected: selectedId === event.id }"
            :style="{ '--event-accent': event.accent }"
            :aria-pressed="selectedId === event.id"
            @click="selectEvent(event)"
          >
            <span class="event-list-icon" aria-hidden="true">{{ event.icon }}</span>
            <span class="event-list-copy">
              <span class="event-list-top"><span class="event-status" :class="`event-status--${statusOf(event)}`">{{ statusLabels[statusOf(event)] }}</span><span v-if="isLoggedIn && !readEventIds.includes(event.id)" class="event-unread">未讀</span></span>
              <strong>{{ event.title }}</strong>
              <span class="event-list-summary">{{ event.summary }}</span>
              <span class="event-list-date">開始：{{ event.startTime }}</span>
            </span>
            <span class="event-list-arrow" aria-hidden="true">›</span>
          </button>
        </div>
      </section>

      <article class="events-detail" :style="{ '--event-accent': selectedEvent.accent }">
        <button type="button" class="events-back" @click="showMobileDetail = false">← 返回活動清單</button>
        <div class="events-feature">
          <span class="events-feature-icon" aria-hidden="true">{{ selectedEvent.icon }}</span>
          <span class="event-status" :class="`event-status--${selectedStatus}`">{{ statusLabels[selectedStatus] }}</span>
          <h2>{{ selectedEvent.title }}</h2>
          <p>{{ selectedEvent.summary }}</p>
        </div>

        <div class="events-detail-body">
          <p class="events-overline">活動內容 · 示範資料</p>
          <div class="events-facts">
            <div><small>活動期間</small><strong>{{ selectedEvent.startTime }}<br>至 {{ selectedEvent.endTime }}</strong></div>
            <div><small>活動獎勵</small><strong class="events-prize">{{ selectedEvent.prize }}</strong></div>
          </div>
          <section class="events-description">
            <h3>活動說明</h3>
            <p>{{ selectedEvent.details }}</p>
          </section>
          <p class="events-disclaimer">活動時間與參與資格以正式上線公告為準；此頁目前為原型示範資料。</p>
          <p v-if="notice" class="events-notice" role="status">{{ notice }}</p>
          <button
            v-if="selectedAction"
            type="button"
            class="events-action"
            @click="handleAction(selectedEvent)"
          >{{ selectedAction.label }} <span aria-hidden="true">↗</span></button>
          <p v-else class="events-unavailable">{{ selectedStatus === 'upcoming' ? '活動尚未開始' : selectedStatus === 'ended' ? '活動已結束' : selectedStatus === 'unknown' ? '活動時間待確認' : '此活動目前僅提供內容說明' }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.events-embedded{margin:0;min-width:0}.events-embedded .events-shell{grid-template-columns:minmax(240px,34%) minmax(0,1fr);border:0;border-radius:0;box-shadow:none}.events-embedded .events-feature{padding:24px}.events-embedded .events-feature h2{font-size:24px}.events-embedded .events-detail-body{padding:24px}.events-embedded .events-facts{grid-template-columns:1fr}.events-compact .events-shell{display:block;min-height:0}.events-compact .events-list{border-right:0}.events-compact .events-list-scroll{max-height:none}.events-compact .events-detail{display:none}.events-compact .show-detail-mobile .events-list{display:none}.events-compact .show-detail-mobile .events-detail{display:block}.events-compact .events-back{display:block;width:100%;padding:15px;border:0;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,.05);color:var(--color-gold);font-size:14px;font-weight:800;text-align:left}
.lobby-events-page{max-width:1320px;margin:0 auto}.events-heading{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:20px}.events-eyebrow,.events-overline{margin:0 0 5px;color:var(--color-gold);font-size:11px;font-weight:900;letter-spacing:.14em}.events-heading h1{font-size:24px}.events-intro{margin:8px 0 0;color:var(--color-text-muted);font-size:14px}.events-count{white-space:nowrap;padding:8px 13px;border:1px solid var(--color-border-gold);border-radius:999px;color:var(--color-gold-light);font-size:13px;font-weight:700;background:rgba(245,200,66,.07)}
.events-shell{display:grid;grid-template-columns:minmax(300px,38%) minmax(0,1fr);min-height:620px;border:1px solid rgba(255,255,255,.23);border-radius:20px;overflow:hidden;background:linear-gradient(145deg,rgba(32,20,63,.96),rgba(22,16,48,.95));box-shadow:0 18px 40px rgba(0,0,0,.18)}.events-list{min-width:0;border-right:1px solid var(--color-border);background:rgba(8,9,31,.34)}.events-list-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:17px 20px;border-bottom:1px solid var(--color-border)}.events-list-head strong{font-size:17px}.events-list-head span{color:var(--color-text-muted);font-size:12px}.events-list-scroll{max-height:720px;overflow-y:auto}.event-list-item{display:flex;align-items:start;gap:14px;width:100%;padding:18px 16px;border:0;border-bottom:1px solid rgba(255,255,255,.09);border-left:4px solid transparent;background:transparent;color:var(--color-text);text-align:left;cursor:pointer;transition:background .2s,border-color .2s}.event-list-item:hover{background:rgba(168,85,247,.09)}.event-list-item.selected{border-left-color:var(--color-gold);background:rgba(245,200,66,.075)}.event-list-item:focus-visible,.events-action:focus-visible,.events-back:focus-visible{outline:2px solid var(--color-gold);outline-offset:-3px}.event-list-icon{display:grid;flex:none;place-items:center;width:45px;height:45px;border:1px solid color-mix(in srgb,var(--event-accent) 50%,transparent);border-radius:13px;background:color-mix(in srgb,var(--event-accent) 13%,transparent);color:var(--event-accent);font-size:24px}.event-list-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}.event-list-top{display:flex;align-items:center;gap:7px}.event-list-copy strong{overflow:hidden;font-size:16px;text-overflow:ellipsis;white-space:nowrap}.event-list-summary{overflow:hidden;color:var(--color-text-muted);font-size:13px;text-overflow:ellipsis;white-space:nowrap}.event-list-date{color:var(--color-text-muted);font-size:12px}.event-list-arrow{align-self:center;color:var(--color-purple-glow);font-size:25px}.event-status{display:inline-flex;align-items:center;width:max-content;padding:4px 9px;border:1px solid transparent;border-radius:999px;font-size:12px;font-weight:800}.event-status--active{border-color:rgba(74,222,128,.3);background:rgba(74,222,128,.12);color:#86efac}.event-status--upcoming{border-color:rgba(96,165,250,.3);background:rgba(96,165,250,.12);color:#bfdbfe}.event-status--ended{border-color:rgba(203,213,225,.2);background:rgba(203,213,225,.09);color:#cbd5e1}.event-status--unknown{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.11);color:#fde68a}.event-unread{color:#fca5a5;font-size:12px;font-weight:800}
.events-detail{min-width:0}.events-back{display:none}.events-feature{position:relative;min-height:214px;overflow:hidden;padding:32px;background:linear-gradient(115deg,color-mix(in srgb,var(--event-accent) 24%,#191b3e),#222149 68%,#15112f);border-bottom:1px solid rgba(255,255,255,.15)}.events-feature::after{content:'';position:absolute;right:-35px;bottom:-105px;width:260px;height:260px;border:1px solid color-mix(in srgb,var(--event-accent) 40%,transparent);border-radius:50%;box-shadow:0 0 0 38px color-mix(in srgb,var(--event-accent) 6%,transparent),0 0 0 78px color-mix(in srgb,var(--event-accent) 4%,transparent)}.events-feature-icon{position:absolute;right:26px;top:10px;color:color-mix(in srgb,var(--event-accent) 38%,transparent);font-size:120px;line-height:1}.events-feature>*:not(.events-feature-icon){position:relative;z-index:1}.events-feature h2{margin:20px 0 6px;font-size:28px;font-weight:900;line-height:1.25}.events-feature p{max-width:34rem;margin:0;color:var(--color-text-muted);font-size:15px;line-height:1.6}.events-detail-body{padding:28px 32px 34px}.events-facts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:12px 0 26px}.events-facts>div{display:flex;flex-direction:column;gap:9px;padding:18px;border:1px solid var(--color-border);border-radius:13px;background:rgba(255,255,255,.04)}.events-facts small{color:var(--color-text-muted);font-size:12px;font-weight:700}.events-facts strong{font-size:15px;line-height:1.65}.events-facts .events-prize{color:var(--color-gold);font-size:18px}.events-description h3{margin:0 0 9px;font-size:17px}.events-description p{margin:0;padding:18px;border:1px solid var(--color-border);border-radius:13px;background:rgba(12,8,30,.3);font-size:15px;line-height:1.85;white-space:pre-wrap}.events-disclaimer{margin:15px 0 0;color:var(--color-text-muted);font-size:12px;line-height:1.6}.events-notice{margin:16px 0 0;padding:11px 14px;border-radius:10px;background:rgba(74,222,128,.12);color:#bbf7d0;font-size:14px}.events-action{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:48px;margin-top:25px;border:0;border-radius:12px;background:linear-gradient(120deg,var(--color-gold-light),var(--color-gold-dark));color:#28142d;font-size:16px;font-weight:900;cursor:pointer}.events-action:hover:not(:disabled){filter:brightness(1.08)}.events-action:disabled{opacity:.48;cursor:not-allowed}.events-unavailable{margin:24px 0 0;padding:14px;border:1px solid var(--color-border);border-radius:11px;color:var(--color-text-muted);font-size:14px;text-align:center}
@media(max-width:850px){.events-shell{grid-template-columns:minmax(265px,41%) minmax(0,1fr)}.events-feature{padding:25px}.events-detail-body{padding:22px}.events-facts{grid-template-columns:1fr}}
@media(max-width:680px){.events-heading{align-items:start;flex-direction:column}.events-shell{display:block;min-height:0;scroll-margin-top:calc(var(--nav-h) + 10px)}.events-list{border-right:0}.events-list-scroll{max-height:none}.events-detail{display:none}.events-shell.show-detail-mobile .events-list{display:none}.events-shell.show-detail-mobile .events-detail{display:block}.events-back{display:block;width:100%;padding:15px 19px;border:0;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,.05);color:var(--color-gold-light);font-size:14px;font-weight:800;text-align:left}.events-feature{min-height:200px;padding:23px}.events-feature h2{font-size:23px}.events-detail-body{padding:20px}.events-facts{grid-template-columns:1fr 1fr}}
@media(max-width:420px){.events-facts{grid-template-columns:1fr}.events-feature-icon{right:5px;font-size:95px}}
</style>
