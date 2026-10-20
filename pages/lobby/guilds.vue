<script setup lang="ts">
import { siteContent, type GuildReviewMode } from '~/data/siteContent'

definePageMeta({ layout: 'lobby' })
useHead({ title: '集團列表 — 巨亨ONLINE' })

const router = useRouter()
const searchQuery = ref('')
const reviewFilter = ref<'all' | GuildReviewMode>('all')
const currentPage = ref(1)
const pageSize = 20
const selectedGuild = ref<(typeof siteContent.guilds)[number] | null>(null)
const showCreateGuild = ref(false)
const createGuildName = ref('')
const createGuildReviewMode = ref<GuildReviewMode>('auto')
const createGuildCost = 1_000
const createGuildRequiredVip = 3
const { userInfo } = useAppState()
const { balance } = useFinancialState()
const { joinedGuild, initGuildState, isPending, isJoined, applyForGuild, joinGuild } = useGuildState()

const canCreateGuild = computed(() => userInfo.value.vip >= createGuildRequiredVip && balance.value >= createGuildCost)
const hasEnoughGold = computed(() => balance.value >= createGuildCost)
const meetsCreateGuildVip = computed(() => userInfo.value.vip >= createGuildRequiredVip)

function redirectJoinedPlayer() {
  if (joinedGuild.value) router.replace('/lobby/guild')
}

onMounted(() => {
  initGuildState()
  redirectJoinedPlayer()
})

watch(joinedGuild, redirectJoinedPlayer)

const reviewLabels: Record<GuildReviewMode, string> = {
  auto: '自動審核',
  manual: '人工審核',
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase()
}

const filteredGuilds = computed(() => {
  const keyword = normalize(searchQuery.value)

  return siteContent.guilds.filter((guild) => {
    const matchesKeyword = !keyword || normalize(guild.name).includes(keyword)
    const matchesReview = reviewFilter.value === 'all' || guild.reviewMode === reviewFilter.value
    return matchesKeyword && matchesReview
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGuilds.value.length / pageSize)))

const visibleGuilds = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredGuilds.value.slice(start, start + pageSize)
})

watch([searchQuery, reviewFilter], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function selectPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function openGuild(guild: (typeof siteContent.guilds)[number]) {
  selectedGuild.value = guild
}

function closeGuild() {
  selectedGuild.value = null
}

function openCreateGuild() {
  showCreateGuild.value = true
}

function closeCreateGuild() {
  showCreateGuild.value = false
}

function submitCreateGuild() {
  if (!createGuildName.value.trim() || !canCreateGuild.value) return
  closeCreateGuild()
}

function applyGuild(guild: (typeof siteContent.guilds)[number]) {
  if (isJoined(guild.rank)) {
    closeGuild()
    router.push('/lobby/guild')
    return
  }
  if (isPending(guild.rank)) return
  if (guild.reviewMode === 'auto') {
    joinGuild(guild.rank)
    closeGuild()
    router.push('/lobby/guild')
    return
  }
  applyForGuild(guild.rank)
}

function applicationLabel(guild: (typeof siteContent.guilds)[number]) {
  if (isJoined(guild.rank)) return '已加入'
  if (isPending(guild.rank)) return '申請中'
  return '申請加入'
}
</script>

<template>
  <div class="guild-page lobby-page px-4 py-5">
    <div class="guild-heading">
      <div>
        <h1 class="section-title">集團列表</h1>
        <p class="guild-intro">瀏覽熱門集團，找到適合你的遊戲夥伴。</p>
      </div>
      <span v-if="joinedGuild" class="guild-status is-joined"><span aria-hidden="true">✓</span> 已加入 {{ joinedGuild.name }}</span>
      <button v-else type="button" class="guild-status create-guild-trigger" @click="openCreateGuild"><span aria-hidden="true">◈</span> 創建集團</button>
    </div>

    <section class="guild-toolbar card-purple" aria-label="集團列表篩選">
      <label class="guild-search">
        <span aria-hidden="true">⌕</span>
        <span class="sr-only">搜尋集團名稱</span>
        <input v-model="searchQuery" type="search" placeholder="搜尋集團名稱" />
      </label>
      <label class="guild-review-filter">
        <span>審核機制</span>
        <select v-model="reviewFilter" aria-label="依審核機制篩選">
          <option value="all">全部</option>
          <option value="auto">自動審核</option>
          <option value="manual">人工審核</option>
        </select>
      </label>
    </section>

    <section class="guild-list-card card-purple" aria-label="集團列表">
      <div v-if="visibleGuilds.length" class="guild-table-wrap">
        <table class="guild-table">
          <thead>
            <tr>
              <th scope="col">名次</th>
              <th scope="col">集團名稱</th>
              <th scope="col">人數</th>
              <th scope="col">集團影響力</th>
              <th scope="col">審核機制</th>
              <th scope="col">申請</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="guild in visibleGuilds"
              :key="guild.name"
              class="guild-row-clickable"
              tabindex="0"
              @click="openGuild(guild)"
              @keydown.enter="openGuild(guild)"
              @keydown.space.prevent="openGuild(guild)"
            >
              <td><span class="guild-rank" :class="{ 'is-top': guild.rank <= 3 }">{{ guild.rank }}</span></td>
              <td><span class="guild-name-link">{{ guild.name }}</span></td>
              <td>{{ guild.members }} / {{ guild.maxMembers }}</td>
              <td><strong class="guild-score">{{ guild.score.toLocaleString() }}</strong></td>
              <td><span class="guild-review" :class="`is-${guild.reviewMode}`">{{ reviewLabels[guild.reviewMode] }}</span></td>
              <td>
                <button
                  type="button"
                  class="guild-apply-button"
                  :class="{ 'is-pending': isPending(guild.rank), 'is-joined': isJoined(guild.rank) }"
                  :disabled="isPending(guild.rank) || isJoined(guild.rank)"
                  @click.stop="applyGuild(guild)"
                >
                  {{ applicationLabel(guild) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="guild-empty">
        <span class="guild-empty-icon" aria-hidden="true">⌕</span>
        <h2>找不到符合條件的集團</h2>
        <p>請調整集團名稱或審核機制，再試一次。</p>
      </div>

      <nav v-if="filteredGuilds.length" class="guild-pagination" aria-label="集團列表分頁">
        <button type="button" :disabled="currentPage === 1" aria-label="上一頁" @click="selectPage(currentPage - 1)">‹</button>
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="{ active: currentPage === page }"
          :aria-current="currentPage === page ? 'page' : undefined"
          @click="selectPage(page)"
        >
          {{ page }}
        </button>
        <button type="button" :disabled="currentPage === totalPages" aria-label="下一頁" @click="selectPage(currentPage + 1)">›</button>
      </nav>
    </section>

    <div
      v-if="selectedGuild"
      class="guild-modal-backdrop"
      role="presentation"
      @click.self="closeGuild"
      @keydown.esc="closeGuild"
    >
      <section
        class="guild-modal card-purple"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guild-modal-title"
      >
        <button type="button" class="guild-modal-close" aria-label="關閉集團資訊" @click="closeGuild">×</button>

        <div class="guild-detail-hero">
          <div class="guild-badge" aria-hidden="true">⚔️</div>
          <div>
            <h2 id="guild-modal-title">{{ selectedGuild.name }}</h2>
            <p>查看集團資料與加入條件</p>
          </div>
        </div>

        <div class="guild-detail-stats">
          <div class="guild-detail-stat">
            <span>集團影響力</span>
            <strong>{{ selectedGuild.score.toLocaleString() }}</strong>
          </div>
          <div class="guild-detail-stat">
            <span>人數</span>
            <strong>{{ selectedGuild.members }} / {{ selectedGuild.maxMembers }}</strong>
          </div>
          <div class="guild-detail-stat">
            <span>審核機制</span>
            <strong>{{ reviewLabels[selectedGuild.reviewMode] }}</strong>
          </div>
        </div>

        <div class="guild-detail-action">
          <p v-if="selectedGuild.reviewMode === 'auto'">此集團採自動審核，申請後將立即加入集團。</p>
          <p v-else>此集團採人工審核，申請送出後請等待會長審核。</p>
          <button
            type="button"
            class="btn-gold guild-detail-apply"
            :class="{ 'is-pending': isPending(selectedGuild.rank), 'is-joined': isJoined(selectedGuild.rank) }"
            :disabled="isPending(selectedGuild.rank) || isJoined(selectedGuild.rank)"
            @click="applyGuild(selectedGuild)"
          >
            {{ applicationLabel(selectedGuild) }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="showCreateGuild"
      class="guild-modal-backdrop"
      role="presentation"
      @click.self="closeCreateGuild"
      @keydown.esc="closeCreateGuild"
    >
      <section
        class="guild-modal card-purple create-guild-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-guild-modal-title"
      >
        <button type="button" class="guild-modal-close" aria-label="關閉創建集團視窗" @click="closeCreateGuild">×</button>
        <div class="create-guild-heading">
          <span class="create-guild-icon" aria-hidden="true">◈</span>
          <div>
            <h2 id="create-guild-modal-title">創建集團</h2>
            <p>設定你的集團名稱與加入規則，集團人數會隨等級提升。</p>
          </div>
        </div>
        <form class="create-guild-form" @submit.prevent="submitCreateGuild">
          <label class="create-guild-field">
            <span>集團名稱</span>
            <input v-model="createGuildName" type="text" maxlength="20" placeholder="輸入集團名稱" required />
          </label>
          <label class="create-guild-field">
            <span>審核機制</span>
            <select v-model="createGuildReviewMode">
              <option value="auto">自動審核</option>
              <option value="manual">人工審核</option>
            </select>
          </label>
          <div class="create-guild-requirements" aria-label="創建條件">
            <div class="create-guild-requirement" :class="{ 'is-unmet': !meetsCreateGuildVip }" :aria-label="meetsCreateGuildVip ? 'VIP 等級符合條件' : 'VIP 等級未達成條件'">
              <span class="create-guild-condition-icon" aria-hidden="true">{{ meetsCreateGuildVip ? '✓' : '✕' }}</span>
              <div class="create-guild-requirement-body">
                <span>VIP 等級</span>
                <strong>VIP {{ createGuildRequiredVip }} 以上</strong>
                <em>{{ meetsCreateGuildVip ? '符合條件' : '未達成條件' }}</em>
              </div>
            </div>
            <div class="create-guild-requirement" :class="{ 'is-unmet': !hasEnoughGold }" :aria-label="hasEnoughGold ? '創建消耗符合條件' : '創建消耗未達成條件'">
              <span class="create-guild-condition-icon" aria-hidden="true">{{ hasEnoughGold ? '✓' : '✕' }}</span>
              <div class="create-guild-requirement-body">
                <span>創建消耗</span>
                <strong>{{ createGuildCost.toLocaleString() }} 金幣</strong>
                <em>{{ hasEnoughGold ? '符合條件' : '未達成條件' }}</em>
              </div>
            </div>
            <div class="create-guild-requirement" :class="{ 'is-unmet': !hasEnoughGold }" :aria-label="hasEnoughGold ? '目前金幣符合條件' : '目前金幣未達成條件'">
              <span class="create-guild-condition-icon" aria-hidden="true">{{ hasEnoughGold ? '✓' : '✕' }}</span>
              <div class="create-guild-requirement-body">
                <span>目前金幣</span>
                <strong>{{ balance.toLocaleString() }}</strong>
                <em>{{ hasEnoughGold ? '符合條件' : '未達成條件' }}</em>
              </div>
            </div>
          </div>
          <div class="create-guild-actions">
            <button type="button" class="guild-modal-secondary" @click="closeCreateGuild">取消</button>
            <button type="submit" class="btn-gold" :disabled="!canCreateGuild">確認創建</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.guild-page { max-width: 1280px; margin: 0 auto; }
.guild-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.guild-eyebrow { margin: 0 0 6px; color: var(--color-gold); font-size: 11px; font-weight: 900; letter-spacing: .18em; }
.guild-heading .section-title { margin: 0; }
.guild-intro { margin: 8px 0 0; color: var(--color-text-muted); font-size: 14px; }
.guild-status { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 8px 13px; border: 1px solid var(--color-border-gold); border-radius: 999px; color: var(--color-gold-light); background: rgba(245, 200, 66, .08); font-size: 13px; font-weight: 700; }
.create-guild-trigger { cursor: pointer; font: inherit; }
.create-guild-trigger:hover { color: #fff; background: rgba(245, 200, 66, .16); }
.guild-status.is-joined { border-color: rgba(74, 222, 128, .45); color: #bbf7d0; background: rgba(34, 197, 94, .12); }
.guild-toolbar { display: flex; align-items: center; gap: 14px; padding: 14px; margin-bottom: 18px; }
.guild-search { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; min-height: 46px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 12px; background: rgba(18, 12, 41, .8); }
.guild-search > span { color: var(--color-purple-light); font-size: 24px; line-height: 1; }
.guild-search input { width: 100%; min-width: 0; padding: 9px 0; border: 0; outline: 0; color: var(--color-text); background: transparent; font: inherit; }
.guild-search input::placeholder { color: var(--color-text-muted); }
.guild-review-filter { display: flex; align-items: center; gap: 9px; color: var(--color-text-muted); font-size: 13px; white-space: nowrap; }
.guild-review-filter select { min-height: 46px; padding: 0 34px 0 13px; border: 1px solid var(--color-border); border-radius: 12px; color: var(--color-text); background: #120c29; font: inherit; }
.guild-list-card { overflow: hidden; }
.guild-table-wrap { overflow-x: auto; }
.guild-table { width: 100%; min-width: 860px; border-collapse: collapse; text-align: left; }
.guild-table th, .guild-table td { padding: 15px 22px; border-bottom: 1px solid rgba(255, 255, 255, .08); white-space: nowrap; }
.guild-table th { color: var(--color-text-muted); background: rgba(0, 0, 0, .14); font-size: 12px; font-weight: 700; }
.guild-table td { color: var(--color-text-muted); font-size: 14px; }
.guild-table tbody tr { transition: background .18s; }
.guild-table tbody tr:hover { background: rgba(168, 85, 247, .09); }
.guild-row-clickable { cursor: pointer; }
.guild-row-clickable:focus-visible { outline: 2px solid var(--color-gold); outline-offset: -2px; }
.guild-table td:nth-child(1) { width: 90px; }
.guild-table td:nth-child(2) { width: 30%; color: var(--color-text); }
.guild-name-link { color: var(--color-text); font-weight: 800; }
.guild-name-link:hover { color: var(--color-gold-light); }
.guild-rank { display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 7px; border-radius: 999px; color: var(--color-purple-light); background: rgba(168, 85, 247, .15); font-weight: 900; }
.guild-rank.is-top { color: #1a0a00; background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); }
.guild-score { color: var(--color-gold-light); }
.guild-review { display: inline-flex; padding: 5px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.guild-review.is-auto { color: #bbf7d0; background: rgba(34, 197, 94, .14); }
.guild-review.is-manual { color: #ddd6fe; background: rgba(139, 92, 246, .18); }
.guild-apply-button { min-width: 82px; padding: 8px 11px; border: 1px solid var(--color-border-gold); border-radius: 9px; color: #1a0a00; background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); font-size: 12px; font-weight: 800; cursor: pointer; }
.guild-apply-button:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
.guild-apply-button:disabled { border-color: rgba(255, 255, 255, .12); color: var(--color-text-muted); background: rgba(255, 255, 255, .1); cursor: not-allowed; }
.guild-apply-button.is-joined { color: #bbf7d0; border-color: rgba(74, 222, 128, .32); background: rgba(34, 197, 94, .14); }
.guild-pagination { display: flex; justify-content: center; gap: 7px; padding: 18px; }
.guild-pagination button { display: grid; place-items: center; min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid var(--color-border); border-radius: 9px; color: var(--color-text-muted); background: rgba(18, 12, 41, .75); font-size: 13px; font-weight: 700; cursor: pointer; }
.guild-pagination button:hover:not(:disabled), .guild-pagination button.active { border-color: var(--color-purple-light); color: #fff; background: linear-gradient(135deg, var(--color-purple-mid), var(--color-purple)); }
.guild-pagination button:disabled { cursor: not-allowed; opacity: .35; }
.guild-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 68px 24px; text-align: center; }
.guild-empty-icon { color: var(--color-gold); font-size: 38px; }
.guild-empty h2 { margin: 0; font-size: 20px; }
.guild-empty p { margin: 0; color: var(--color-text-muted); font-size: 14px; }
.guild-modal-backdrop { position: fixed; z-index: 40; inset: 0; display: grid; place-items: center; padding: 24px; background: rgba(5, 3, 18, .78); backdrop-filter: blur(6px); }
.guild-modal { position: relative; width: min(100%, 640px); max-height: min(760px, calc(100vh - 48px)); overflow-y: auto; padding: 28px; box-shadow: 0 24px 80px rgba(0, 0, 0, .42); }
.guild-modal-close { position: absolute; top: 12px; right: 14px; display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 50%; color: var(--color-text-muted); background: rgba(0, 0, 0, .18); font-size: 24px; line-height: 1; cursor: pointer; }
.guild-modal-close:hover { color: var(--color-text); border-color: var(--color-border-gold); }
.guild-detail-hero { display: flex; align-items: center; gap: 18px; padding: 0 42px 26px 0; border-bottom: 1px solid rgba(255, 255, 255, .1); }
.guild-badge { display: grid; place-items: center; flex-shrink: 0; width: 82px; height: 82px; border: 2px solid var(--color-gold); border-radius: 24px; background: linear-gradient(145deg, #8b5cf6, #3b0764); box-shadow: 0 10px 24px rgba(124, 58, 237, .35), inset 0 0 0 5px rgba(245, 200, 66, .12); font-size: 38px; }
.guild-detail-hero h2 { margin: 0; font-size: 28px; font-weight: 900; }
.guild-detail-hero p:last-child { margin: 6px 0 0; color: var(--color-text-muted); font-size: 14px; }
.guild-detail-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 24px 0; }
.guild-detail-stat { padding: 16px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; background: rgba(0, 0, 0, .14); }
.guild-detail-stat span { display: block; color: var(--color-text-muted); font-size: 12px; }
.guild-detail-stat strong { display: block; margin-top: 7px; color: var(--color-gold-light); font-size: 21px; }
.guild-detail-action { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 22px; border-top: 1px solid rgba(255, 255, 255, .1); }
.guild-detail-action p { margin: 0; color: var(--color-text-muted); font-size: 14px; line-height: 1.7; }
.guild-detail-apply { min-width: 150px; justify-content: center; }
.guild-detail-apply.is-pending, .guild-detail-apply.is-joined { color: var(--color-text-muted); background: rgba(255, 255, 255, .12); box-shadow: none; cursor: not-allowed; }
.guild-detail-apply.is-joined { color: #bbf7d0; border: 1px solid rgba(74, 222, 128, .32); }
.create-guild-heading { display: flex; align-items: center; gap: 14px; padding: 0 42px 22px 0; border-bottom: 1px solid rgba(255, 255, 255, .1); }
.create-guild-heading h2 { margin: 0; font-size: 24px; }
.create-guild-heading p { margin: 6px 0 0; color: var(--color-text-muted); font-size: 14px; }
.create-guild-icon { display: grid; place-items: center; width: 54px; height: 54px; border: 1px solid var(--color-border-gold); border-radius: 16px; color: var(--color-gold-light); background: rgba(245, 200, 66, .1); font-size: 27px; }
.create-guild-form { display: grid; gap: 16px; padding-top: 22px; }
.create-guild-field { display: grid; gap: 8px; color: var(--color-text-muted); font-size: 13px; font-weight: 700; }
.create-guild-field input, .create-guild-field select { width: 100%; min-height: 46px; padding: 0 13px; border: 1px solid var(--color-border); border-radius: 11px; color: var(--color-text); background: rgba(18, 12, 41, .82); font: inherit; outline: none; }
.create-guild-field input:focus, .create-guild-field select:focus { border-color: var(--color-gold); box-shadow: 0 0 0 3px rgba(245, 200, 66, .1); }
.create-guild-requirements { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.create-guild-requirement { display: flex; align-items: start; gap: 8px; min-width: 0; padding: 10px 11px; border: 1px solid rgba(74, 222, 128, .3); border-radius: 10px; background: rgba(34, 197, 94, .08); }
.create-guild-condition-icon { display: grid; place-items: center; flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; color: #052e16; background: #4ade80; font-size: 13px; font-weight: 900; line-height: 1; }
.create-guild-requirement-body { display: grid; min-width: 0; gap: 4px; }
.create-guild-requirement-body > span { color: var(--color-text-muted); font-size: 11px; }
.create-guild-requirement-body strong { color: var(--color-gold-light); font-size: 13px; white-space: nowrap; }
.create-guild-requirement-body em { color: #86efac; font-size: 11px; font-style: normal; font-weight: 800; }
.create-guild-requirement.is-unmet { border-color: rgba(248, 113, 113, .45); background: rgba(239, 68, 68, .1); }
.create-guild-requirement.is-unmet .create-guild-condition-icon { color: #450a0a; background: #f87171; }
.create-guild-requirement.is-unmet .create-guild-requirement-body em { color: #fca5a5; }
.create-guild-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 6px; }
.guild-modal-secondary { min-width: 92px; padding: 10px 16px; border: 1px solid var(--color-border); border-radius: 9px; color: var(--color-text-muted); background: rgba(255, 255, 255, .06); font: inherit; font-weight: 800; cursor: pointer; }
.guild-modal-secondary:hover { color: var(--color-text); background: rgba(255, 255, 255, .1); }
.create-guild-actions .btn-gold:disabled { cursor: not-allowed; filter: grayscale(.45); opacity: .45; }
@media (max-width: 640px) {
  .guild-heading { align-items: start; flex-direction: column; }
  .guild-status { align-self: start; }
  .guild-toolbar { align-items: stretch; flex-direction: column; }
  .guild-search { min-width: 0; }
  .guild-review-filter { justify-content: space-between; }
  .guild-review-filter select { flex: 1; }
  .guild-table th, .guild-table td { padding: 13px 14px; }
  .guild-modal-backdrop { padding: 14px; }
  .guild-modal { padding: 20px 16px; }
  .guild-detail-hero { align-items: start; }
  .guild-badge { width: 64px; height: 64px; border-radius: 18px; font-size: 30px; }
  .guild-detail-hero h2 { font-size: 22px; }
  .guild-detail-stats { grid-template-columns: 1fr; }
  .guild-detail-action { align-items: stretch; flex-direction: column; }
  .guild-detail-apply { width: 100%; }
  .create-guild-heading { align-items: start; }
  .create-guild-requirements { grid-template-columns: 1fr; }
  .create-guild-actions { flex-direction: column-reverse; }
  .create-guild-actions button { width: 100%; }
}
</style>
