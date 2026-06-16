<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
import { siteContent } from '~/data/siteContent'

const { isLoggedIn, userInfo, openLogin, logout } = useAppState()
const router = useRouter()

const vipUpgrade = siteContent.member.vipUpgrade

const MAX_VIP = 7
const isMaxVip = computed(() => userInfo.value.vip >= MAX_VIP)
const depositPct = computed(() => Math.min(100, Math.round(vipUpgrade.deposit.current / vipUpgrade.deposit.target * 100)))
const wagerPct   = computed(() => Math.min(100, Math.round(vipUpgrade.wager.current / vipUpgrade.wager.target * 100)))

function handleLogout() {
  logout()
  router.push('/lobby')
}
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">🔒</div>
        <h1 class="text-xl font-black mb-2">個人資訊</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可查看您的帳號資訊與遊戲紀錄</p>
        <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>
      <!-- 玩家資訊卡 -->
      <div class="card-purple p-5 mb-4 flex items-center gap-4">
        <div class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
             style="background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); font-size:28px;">
          👤
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-black">{{ userInfo.name }}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold"
                  style="background:rgba(245,200,66,0.2); color:var(--color-gold); border:1px solid rgba(245,200,66,0.4);">
              VIP {{ userInfo.vip }}
            </span>
            <span class="text-sm font-bold" style="color:var(--color-gold);">
              ${{ userInfo.balance.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <!-- VIP 進度卡 -->
      <div class="rounded-2xl p-5 mb-4 relative overflow-hidden" style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark));">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs font-bold tracking-widest" style="color:rgba(0,0,0,0.55);">CURRENT LEVEL</div>
            <div class="text-4xl font-black italic" style="color:#3a2400;">VIP {{ userInfo.vip }}</div>
          </div>
          <div v-if="!isMaxVip" class="text-sm font-bold px-3 py-1.5 rounded-lg" style="background:rgba(0,0,0,0.12); color:#3a2400;">
            目標 VIP {{ userInfo.vip + 1 }}
          </div>
        </div>

        <template v-if="!isMaxVip">
          <!-- 累積儲值 -->
          <div class="mt-5">
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-2 font-bold" style="color:#3a2400;"><span aria-hidden="true">👛</span>累積儲值</span>
              <span class="font-bold" style="color:#3a2400;">{{ vipUpgrade.deposit.current.toLocaleString() }} / {{ vipUpgrade.deposit.target.toLocaleString() }}</span>
            </div>
            <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.18);">
              <div class="h-full rounded-full" :style="`width:${depositPct}%; background:#fff;`" />
            </div>
          </div>

          <!-- 累積投注 -->
          <div class="mt-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-2 font-bold" style="color:#3a2400;"><span aria-hidden="true">📈</span>累積投注</span>
              <span class="font-bold" style="color:#3a2400;">{{ vipUpgrade.wager.current.toLocaleString() }} / {{ vipUpgrade.wager.target.toLocaleString() }}</span>
            </div>
            <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.18);">
              <div class="h-full rounded-full" :style="`width:${wagerPct}%; background:#fff;`" />
            </div>
          </div>

          <p class="text-xs mt-4" style="color:rgba(0,0,0,0.6);">需同時達成累積儲值與累積投注條件，即可升級至 VIP {{ userInfo.vip + 1 }}。</p>
        </template>
        <template v-else>
          <p class="text-sm font-bold mt-5" style="color:#3a2400;">已達最高等級</p>
        </template>
      </div>

      <!-- 遊戲紀錄 -->
      <LobbyGameRecords />

      <!-- 登出 -->
      <button
        class="w-full py-3 rounded-xl text-sm font-bold"
        style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171;"
        @click="handleLogout"
      >
        登出
      </button>
    </template>
  </div>
</template>
