<script setup lang="ts">
useSeoMeta({
  title: '會員專區 — 巨亨ONLINE | VIP等級與個人資料',
  description: '巨亨ONLINE會員中心，查看VIP等級、點數餘額、遊戲紀錄，兌換獎勵碼，管理您的帳號。',
  ogTitle: '會員專區 — 巨亨ONLINE',
})

const { isLoggedIn, userInfo, openLogin } = useAppState()

type MemberTab = 'profile' | 'history' | 'vip' | 'redeem'
const activeTab = ref<MemberTab>('profile')

const vipProgress = computed(() => {
  const targets = [0, 10000, 50000, 200000, 500000, 2000000]
  const current = 68500
  const vipLevel = userInfo.value.vip
  const next = targets[vipLevel] ?? targets[targets.length - 1]
  const prev = targets[vipLevel - 1] ?? 0
  return Math.min(100, Math.round(((current - prev) / (next - prev)) * 100))
})

const vipLevels = [
  { level: 1, name: 'VIP 1', color: '#CD7F32', limit: 'NT$50,000/日', benefits: ['每日簽到獎 ×1.2', '優先客服'] },
  { level: 2, name: 'VIP 2', color: '#C0C0C0', limit: 'NT$100,000/日', benefits: ['每日簽到獎 ×1.5', '專屬活動'] },
  { level: 3, name: 'VIP 3', color: '#F5C842', limit: 'NT$200,000/日', benefits: ['每日簽到獎 ×2.0', '生日禮金'] },
  { level: 4, name: 'VIP 4', color: '#60A5FA', limit: 'NT$500,000/日', benefits: ['每日簽到獎 ×3.0', '專屬包廂'] },
  { level: 5, name: 'VIP 5', color: '#A855F7', limit: '無上限',        benefits: ['每日簽到獎 ×5.0', '專屬秘書'] },
  { level: 6, name: 'VIP 6', color: '#EC4899', limit: '無上限',        benefits: ['無限簽到獎', '頂級禮遇'] },
]

const historyItems = [
  { date: '2024/01/15 14:32', game: '老虎機 — 水果大豐收', result: '+NT$2,580', positive: true },
  { date: '2024/01/15 13:20', game: '百家樂',              result: '-NT$500',   positive: false },
  { date: '2024/01/14 22:15', game: '老虎機 — 招財貓',    result: '+NT$1,200', positive: true },
  { date: '2024/01/14 20:08', game: '捕魚機',              result: '+NT$380',   positive: true },
  { date: '2024/01/14 18:55', game: '百家樂',              result: '-NT$1,000', positive: false },
]

const redeemCode = ref('')

const memberTabs = [
  { key: 'profile' as MemberTab, label: '個人資料', icon: '👤' },
  { key: 'history' as MemberTab, label: '遊戲紀錄', icon: '📊' },
  { key: 'vip'     as MemberTab, label: 'VIP 等級', icon: '👑' },
  { key: 'redeem'  as MemberTab, label: '兌換碼',   icon: '🎁' },
]
</script>

<template>
  <div class="pb-4">
    <!-- 未登入狀態 -->
    <template v-if="!isLoggedIn">
      <div class="px-4 pt-6">
        <div class="card-purple p-6 text-center mb-4">
          <div class="text-5xl mb-4" aria-hidden="true">🔒</div>
          <h1 class="text-xl font-black mb-2">會員專區</h1>
          <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可查看您的帳號資訊、VIP等級與遊戲紀錄</p>
          <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
        </div>

        <!-- 未登入預覽卡 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="card-purple p-4 text-center" style="filter:blur(2px); pointer-events:none;" aria-hidden="true">
            <div class="text-2xl font-black" style="color:var(--color-gold);">VIP 3</div>
            <div class="text-xs mt-1" style="color:var(--color-text-muted);">我的等級</div>
          </div>
          <div class="card-purple p-4 text-center" style="filter:blur(2px); pointer-events:none;" aria-hidden="true">
            <div class="text-2xl font-black" style="color:var(--color-gold);">$12,580</div>
            <div class="text-xs mt-1" style="color:var(--color-text-muted);">帳戶餘額</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 已登入狀態 -->
    <template v-else>
      <!-- 會員資訊卡 -->
      <div class="card-gold-border mx-4 mt-4 p-5">
        <div class="flex items-center gap-4 mb-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                 style="background:linear-gradient(135deg,#6B21A8,#A855F7); border:3px solid var(--color-gold);"
                 aria-label="頭像">👤</div>
            <span class="vip-badge absolute -bottom-1 -right-1 text-xs">VIP {{ userInfo.vip }}</span>
          </div>
          <div class="flex-1">
            <div class="font-black text-lg">{{ userInfo.name }}</div>
            <div class="text-sm mt-0.5" style="color:var(--color-text-muted);">帳戶餘額</div>
            <div class="text-2xl font-black" style="color:var(--color-gold);">${{ userInfo.balance.toLocaleString() }}</div>
          </div>
        </div>

        <!-- VIP 升級進度 -->
        <div>
          <div class="flex justify-between text-xs mb-1.5" style="color:var(--color-text-muted);">
            <span>VIP {{ userInfo.vip }} 進度</span>
            <span>{{ vipProgress }}%</span>
          </div>
          <div class="w-full h-2 rounded-full" style="background:rgba(168,85,247,0.2);">
            <div
              class="h-full rounded-full transition-all duration-700"
              style="background:linear-gradient(90deg,var(--color-purple-mid),var(--color-gold));"
              :style="{ width: `${vipProgress}%` }"
              role="progressbar"
              :aria-valuenow="vipProgress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`VIP${userInfo.vip}升級進度 ${vipProgress}%`"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-4">
          <NuxtLink to="/deposit" class="btn-gold flex-1 justify-center py-2.5 text-sm">儲值</NuxtLink>
          <button class="btn-outline-purple flex-1 justify-center py-2.5 text-sm">提款</button>
        </div>
      </div>

      <!-- 分頁 Tab -->
      <div class="px-4 mt-4 mb-4">
        <div class="grid grid-cols-4 gap-1" style="background:rgba(0,0,0,0.3); border-radius:10px; padding:4px;" role="tablist">
          <button
            v-for="tab in memberTabs"
            :key="tab.key"
            class="flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all"
            :class="activeTab === tab.key ? 'text-white' : 'text-app-muted'"
            :style="activeTab === tab.key ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); box-shadow:0 2px 12px rgba(124,58,237,0.4);' : ''"
            role="tab"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span aria-hidden="true">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab 內容 -->
      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab" class="px-4">

          <!-- 個人資料 -->
          <div v-if="activeTab === 'profile'" class="card-purple p-4 flex flex-col gap-4">
            <div>
              <label class="input-label" for="nickname">暱稱</label>
              <input id="nickname" type="text" class="input-field" :placeholder="userInfo.name" />
            </div>
            <div>
              <label class="input-label" for="email">電子郵件</label>
              <input id="email" type="email" class="input-field" placeholder="example@email.com" autocomplete="email" />
            </div>
            <div class="divider-purple" />
            <p class="text-xs" style="color:var(--color-text-muted);">真實姓名、手機號碼如需修改請聯繫客服</p>
            <button class="btn-gold justify-center">儲存變更</button>
          </div>

          <!-- 遊戲紀錄 -->
          <div v-else-if="activeTab === 'history'" class="card-purple overflow-hidden">
            <div v-for="(item, i) in historyItems" :key="i" class="flex items-center gap-3 px-4 py-3" :class="i < historyItems.length - 1 ? 'border-b' : ''" style="border-color:rgba(168,85,247,0.1);">
              <div class="flex-1">
                <div class="text-sm font-bold">{{ item.game }}</div>
                <time class="text-xs" style="color:var(--color-text-muted);">{{ item.date }}</time>
              </div>
              <span class="text-sm font-bold" :style="{ color: item.positive ? '#4ade80' : '#f87171' }">{{ item.result }}</span>
            </div>
          </div>

          <!-- VIP 等級 -->
          <div v-else-if="activeTab === 'vip'" class="flex flex-col gap-3">
            <div
              v-for="vip in vipLevels"
              :key="vip.level"
              class="card-purple p-4"
              :class="{ 'ring-2 ring-gold': vip.level === userInfo.vip }"
              :style="vip.level === userInfo.vip ? 'border-color:var(--color-gold); box-shadow:0 0 16px rgba(245,200,66,0.2);' : ''"
              :aria-label="`${vip.name}${vip.level === userInfo.vip ? '（目前等級）' : ''}`"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" :style="{ background: `linear-gradient(135deg, ${vip.color}, #1a0a00)`, color: vip.color }">
                  {{ vip.level }}
                </div>
                <div>
                  <div class="font-bold">{{ vip.name }}</div>
                  <div class="text-xs" style="color:var(--color-text-muted);">每日提款限額：{{ vip.limit }}</div>
                </div>
                <span v-if="vip.level === userInfo.vip" class="ml-auto text-xs px-2 py-0.5 rounded-full" style="background:rgba(245,200,66,0.15); color:var(--color-gold); border:1px solid rgba(245,200,66,0.3);">目前等級</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="b in vip.benefits" :key="b" class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);">{{ b }}</span>
              </div>
            </div>
          </div>

          <!-- 兌換碼 -->
          <div v-else-if="activeTab === 'redeem'" class="card-purple p-4">
            <h2 class="text-sm font-bold mb-1">輸入兌換碼</h2>
            <p class="text-xs mb-4" style="color:var(--color-text-muted);">輸入活動兌換碼即可領取額外點數或獎勵</p>
            <input v-model="redeemCode" type="text" class="input-field mb-3" placeholder="請輸入兌換碼" autocomplete="off" />
            <button class="btn-gold w-full justify-center" :disabled="!redeemCode">確認兌換</button>
          </div>

        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
