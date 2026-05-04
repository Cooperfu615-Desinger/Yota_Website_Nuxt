<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
import { siteContent } from '~/data/siteContent'

const { isLoggedIn, userInfo, openLogin, logout } = useAppState()
const router = useRouter()

const historyItems = siteContent.member.historyItems
const vipLevels    = siteContent.member.vipLevels
const vipProgress  = computed(() => {
  const targets  = siteContent.member.vipTargets
  const current  = 68500
  const vipLevel = userInfo.value.vip
  const next  = targets[vipLevel] ?? targets[targets.length - 1]
  const prev  = targets[vipLevel - 1] ?? 0
  return Math.min(100, Math.round(((current - prev) / (next - prev)) * 100))
})

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
          <!-- VIP 進度條 -->
          <div class="mt-2">
            <div class="flex justify-between text-xs mb-1" style="color:var(--color-text-muted);">
              <span>升級進度</span><span>{{ vipProgress }}%</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(168,85,247,0.15);">
              <div class="h-full rounded-full" :style="`width:${vipProgress}%; background:linear-gradient(90deg,var(--color-purple-mid),var(--color-gold))`" />
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <button class="card-purple p-4 text-center" @click="$router.push('/lobby/bank')">
          <div class="text-2xl mb-1" aria-hidden="true">🏦</div>
          <div class="text-sm font-bold" style="color:var(--color-gold);">前往儲值</div>
        </button>
        <button class="card-purple p-4 text-center" @click="$router.push('/lobby/inbox')">
          <div class="text-2xl mb-1" aria-hidden="true">📬</div>
          <div class="text-sm font-bold" style="color:var(--color-purple-light);">查看信箱</div>
        </button>
      </div>

      <!-- 遊戲紀錄 -->
      <div class="card-purple mb-4">
        <div class="px-4 pt-4 pb-2 font-bold" style="color:var(--color-gold);">最近遊戲紀錄</div>
        <div v-for="item in historyItems" :key="item.date" class="px-4 py-3 border-t" style="border-color:rgba(168,85,247,0.1);">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-sm font-bold">{{ item.game }}</div>
              <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.date }}</div>
            </div>
            <span class="text-sm font-black" :style="item.positive ? 'color:#4ade80;' : 'color:#f87171;'">
              {{ item.result }}
            </span>
          </div>
        </div>
      </div>

      <!-- VIP 等級一覽 -->
      <div class="card-purple mb-4">
        <div class="px-4 pt-4 pb-2 font-bold" style="color:var(--color-gold);">VIP 等級</div>
        <div class="overflow-x-auto">
          <div class="flex gap-3 px-4 pb-4" style="min-width:max-content;">
            <div
              v-for="lv in vipLevels"
              :key="lv.level"
              class="p-3 rounded-xl flex-shrink-0 w-32"
              :style="`background:rgba(28,10,58,0.8); border:1px solid ${lv.level === userInfo.vip ? lv.color : 'rgba(168,85,247,0.15)'};`"
            >
              <div class="text-sm font-black" :style="`color:${lv.color}`">{{ lv.name }}</div>
              <div class="text-xs mt-1" style="color:var(--color-text-muted);">{{ lv.limit }}</div>
            </div>
          </div>
        </div>
      </div>

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
