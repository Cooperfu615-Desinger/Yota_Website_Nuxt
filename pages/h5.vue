<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: '巨亨ONLINE — Web 版遊戲大廳' })

import { siteContent, type GameItem } from '~/data/siteContent'

const { isLoggedIn, userInfo } = useAppState()
const allGames: GameItem[] = [...siteContent.games] as GameItem[]

// 跑馬燈
const marquee = '🎉 恭喜 Lucky888 在【神龍傳奇】獲得 45,000 金幣大獎！　🏆 DragonKing 百家樂連贏 8 局！　💰 StarPlayer 在【水果老虎機】爆出 1,200,000 金幣！　🎰 JokerAce 觸發免費旋轉贏得 68,000 金幣！'

// 彩金（Jackpot）——示意數字，後台 WebSocket 推送
const jackpots = reactive([
  { tier: 'GRAND', amount: 12345678, color: '#E53E3E', glow: 'rgba(229,62,62,0.5)', border: '#FCA5A5' },
  { tier: 'MAJOR', amount:  3456789, color: '#D97706', glow: 'rgba(217,119,6,0.5)',  border: '#FCD34D' },
  { tier: 'MINI',  amount:   567890, color: '#059669', glow: 'rgba(5,150,105,0.5)',  border: '#6EE7B7' },
  { tier: 'MINOR', amount:    89012, color: '#2563EB', glow: 'rgba(37,99,235,0.5)',  border: '#93C5FD' },
])

// 數字跳動
onMounted(() => {
  setInterval(() => {
    jackpots[0].amount += Math.floor(Math.random() * 150 + 50)
    jackpots[1].amount += Math.floor(Math.random() * 80  + 20)
    jackpots[2].amount += Math.floor(Math.random() * 30  + 5)
    jackpots[3].amount += Math.floor(Math.random() * 10  + 1)
  }, 1200)
})

function fmt(n: number) {
  return n.toLocaleString('zh-TW')
}

// 底部導覽
const bottomNav = [
  { icon: '💬', label: '聊天' },
  { icon: '📋', label: '每日任務' },
  { icon: '🎉', label: '活動' },
  { icon: '🏦', label: '銀行' },
  { icon: '🔒', label: '保險箱' },
  { icon: '📬', label: '信箱' },
  { icon: '🎁', label: '禮物' },
  { icon: '🎧', label: '客服' },
]

// 遊戲分類
const categories = [
  { key: 'all',      label: '全部' },
  { key: 'slots',    label: '老虎機' },
  { key: 'baccarat', label: '百家樂' },
  { key: 'fish',     label: '捕魚機' },
  { key: 'dice',     label: '骰子' },
  { key: 'cards',    label: '棋牌' },
]
const activeCat = ref('all')
const filtered = computed(() =>
  activeCat.value === 'all' ? allGames : allGames.filter(g => g.category === activeCat.value)
)

// 遊戲卡片 Jackpot badge（部分遊戲顯示 Grand/Major）
const jackpotGames = ['dragon-legend', 'shark-hunter', 'lucky-cat-baccarat', 'golden-phoenix']
const jackpotTierMap: Record<string, { tier: string; idx: number }> = {
  'dragon-legend':       { tier: 'MAJOR', idx: 1 },
  'lucky-cat-baccarat':  { tier: 'MINI',  idx: 2 },
  'golden-phoenix':      { tier: 'GRAND', idx: 0 },
  'candy-blast':         { tier: 'MINOR', idx: 3 },
}
</script>

<template>
  <div class="h5-root">

    <!-- ── Header ── -->
    <header class="h5-header">
      <!-- 左：玩家資訊 -->
      <div class="h5-header-left">
        <div class="h5-avatar">👤</div>
        <div class="h5-player-info">
          <div class="h5-player-name">{{ isLoggedIn ? userInfo.name : '訪客玩家' }}</div>
          <div class="h5-currencies">
            <span class="h5-cur h5-cur-gold">🪙 {{ isLoggedIn ? userInfo.balance.toLocaleString() : '0' }}</span>
            <span class="h5-cur h5-cur-silver">🔘 {{ isLoggedIn ? '1,234' : '0' }}</span>
          </div>
        </div>
      </div>

      <!-- 中：購買 / 特惠 Tab -->
      <div class="h5-shop-tabs">
        <button class="h5-shop-tab h5-shop-active">購買</button>
        <button class="h5-shop-tab">特惠</button>
      </div>

      <!-- 右：VIP + 存錢筒 + 漢堡 -->
      <div class="h5-header-right">
        <div class="h5-vip-badge">
          <span class="h5-vip-icon">⭐</span>
          <span>VIP {{ isLoggedIn ? userInfo.vip : 0 }}</span>
        </div>
        <div class="h5-piggy">
          🐷
          <span class="h5-piggy-label">儲值</span>
        </div>
        <button class="h5-hamburger" aria-label="選單">
          <span /><span /><span />
        </button>
      </div>
    </header>

    <!-- ── 跑馬燈 ── -->
    <div class="h5-marquee-wrap">
      <span class="h5-marquee-icon">📢</span>
      <div class="h5-marquee-track">
        <span class="h5-marquee-text">{{ marquee }}&nbsp;&nbsp;&nbsp;{{ marquee }}</span>
      </div>
    </div>

    <!-- ── Jackpot 彩金列 ── -->
    <div class="h5-jackpot-row">
      <div
        v-for="jp in jackpots"
        :key="jp.tier"
        class="h5-jackpot-card"
        :style="`border-color:${jp.border}40; box-shadow:0 0 14px ${jp.glow};`"
      >
        <div class="h5-jackpot-tier" :style="`color:${jp.color};`">{{ jp.tier }}</div>
        <div class="h5-jackpot-amount" :style="`color:${jp.border};`">
          {{ fmt(jp.amount) }}
        </div>
      </div>
    </div>

    <!-- ── 分類 Tab ── -->
    <div class="h5-cat-tabs">
      <button
        v-for="c in categories"
        :key="c.key"
        class="h5-cat-btn"
        :class="{ 'h5-cat-active': activeCat === c.key }"
        @click="activeCat = c.key"
      >
        {{ c.label }}
      </button>
    </div>

    <!-- ── 遊戲卡片格 ── -->
    <div class="h5-game-grid">
      <div
        v-for="g in filtered"
        :key="g.key"
        class="h5-game-card"
        :style="`--card-color:${g.color};`"
      >
        <!-- Jackpot 標籤 -->
        <div
          v-if="jackpotTierMap[g.key]"
          class="h5-card-jackpot"
          :style="`background:${jackpots[jackpotTierMap[g.key].idx].color};`"
        >
          {{ jackpotTierMap[g.key].tier }}
          <span>{{ fmt(jackpots[jackpotTierMap[g.key].idx].amount) }}</span>
        </div>

        <!-- 遊戲封面（色塊 + 遊戲名，實際可換成 <img>） -->
        <div class="h5-card-cover">
          <div class="h5-card-game-icon">🎮</div>
          <div class="h5-card-game-name">{{ g.name }}</div>
          <div class="h5-card-provider">{{ g.provider }}</div>
        </div>

        <!-- 底部：RTP + 熱門標籤 -->
        <div class="h5-card-footer">
          <span class="h5-card-rtp">RTP {{ g.rtp }}</span>
          <span v-if="g.badge" class="h5-card-badge">{{ g.badge }}</span>
        </div>

        <!-- 愛心收藏 -->
        <button class="h5-card-heart" aria-label="收藏">♡</button>
      </div>
    </div>

    <!-- ── 底部導覽 ── -->
    <nav class="h5-bottom-nav">
      <button
        v-for="item in bottomNav"
        :key="item.label"
        class="h5-bottom-item"
      >
        <span class="h5-bottom-icon">{{ item.icon }}</span>
        <span class="h5-bottom-label">{{ item.label }}</span>
      </button>
    </nav>

  </div>
</template>

<style scoped>
/* ── Root ── */
.h5-root {
  min-height: 100dvh;
  background: linear-gradient(160deg, #1a003e 0%, #0d0025 40%, #001a3a 100%);
  color: #f3e8ff;
  font-family: 'Noto Sans TC', sans-serif;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ── Header ── */
.h5-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 8px;
  background: rgba(20,0,50,0.85);
  border-bottom: 1px solid rgba(168,85,247,0.2);
  flex-shrink: 0;
}
.h5-header-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.h5-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg,#7c3aed,#a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
  border: 2px solid rgba(245,200,66,0.5);
}
.h5-player-info { min-width: 0; }
.h5-player-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.h5-currencies { display: flex; gap: 8px; margin-top: 2px; }
.h5-cur { font-size: 11px; font-weight: 700; }
.h5-cur-gold  { color: #f5c842; }
.h5-cur-silver{ color: #c4b5fd; }

.h5-shop-tabs {
  display: flex;
  background: rgba(0,0,0,0.4);
  border-radius: 20px;
  padding: 3px;
  border: 1px solid rgba(168,85,247,0.3);
}
.h5-shop-tab {
  padding: 5px 14px; border-radius: 16px;
  font-size: 12px; font-weight: 800; cursor: pointer;
  color: rgba(196,181,213,0.7); transition: all 0.2s;
}
.h5-shop-active {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.h5-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.h5-vip-badge {
  display: flex; align-items: center; gap: 3px;
  background: rgba(245,200,66,0.15); border: 1px solid rgba(245,200,66,0.4);
  border-radius: 12px; padding: 3px 8px;
  font-size: 11px; font-weight: 700; color: #f5c842;
}
.h5-vip-icon { font-size: 12px; }
.h5-piggy {
  display: flex; flex-direction: column; align-items: center;
  font-size: 20px; cursor: pointer;
}
.h5-piggy-label { font-size: 9px; color: #f5c842; font-weight: 700; margin-top: -2px; }

.h5-hamburger {
  display: flex; flex-direction: column; gap: 4px;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(168,85,247,0.2);
  align-items: center; justify-content: center;
  cursor: pointer;
}
.h5-hamburger span {
  display: block; width: 16px; height: 2px;
  background: #c084fc; border-radius: 2px;
}

/* ── 跑馬燈 ── */
.h5-marquee-wrap {
  display: flex; align-items: center; gap: 8px;
  background: rgba(124,58,237,0.15);
  border-bottom: 1px solid rgba(168,85,247,0.2);
  padding: 6px 12px;
  overflow: hidden;
  flex-shrink: 0;
}
.h5-marquee-icon { font-size: 14px; flex-shrink: 0; }
.h5-marquee-track { flex: 1; overflow: hidden; }
.h5-marquee-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 12px;
  color: #c4b5fd;
  animation: marquee-scroll 30s linear infinite;
}
@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── Jackpot ── */
.h5-jackpot-row {
  display: flex; gap: 8px; padding: 10px 12px;
  flex-shrink: 0; overflow-x: auto;
  scrollbar-width: none;
}
.h5-jackpot-row::-webkit-scrollbar { display: none; }
.h5-jackpot-card {
  flex: 1; min-width: 0;
  background: rgba(10,0,30,0.8);
  border: 1px solid;
  border-radius: 12px;
  padding: 8px 6px;
  text-align: center;
  flex-shrink: 0;
}
.h5-jackpot-tier {
  font-size: 10px; font-weight: 900;
  letter-spacing: 0.08em; margin-bottom: 4px;
  text-shadow: 0 0 8px currentColor;
}
.h5-jackpot-amount {
  font-size: 12px; font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* ── 分類 Tab ── */
.h5-cat-tabs {
  display: flex; gap: 6px; padding: 0 12px 8px;
  overflow-x: auto; flex-shrink: 0;
  scrollbar-width: none;
}
.h5-cat-tabs::-webkit-scrollbar { display: none; }
.h5-cat-btn {
  flex-shrink: 0; padding: 5px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 700;
  background: rgba(168,85,247,0.1);
  border: 1px solid rgba(168,85,247,0.2);
  color: rgba(196,181,213,0.7);
  cursor: pointer; transition: all 0.2s;
}
.h5-cat-active {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 10px rgba(124,58,237,0.4);
}

/* ── 遊戲格 ── */
.h5-game-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 10px 10px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(168,85,247,0.3) transparent;
}
@media (min-width: 480px) {
  .h5-game-grid { grid-template-columns: repeat(4, 1fr); }
}

.h5-game-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 3/4;
  background: linear-gradient(160deg, rgba(var(--card-rgb), 0.3), rgba(10,0,30,0.9));
  border: 1px solid rgba(168,85,247,0.2);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex; flex-direction: column;
  /* card colour via CSS var */
  background: linear-gradient(160deg, color-mix(in srgb, var(--card-color) 30%, #0a001e), #0a001e);
}
.h5-game-card:active { transform: scale(0.96); }

.h5-card-jackpot {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 3px 6px; text-align: center;
  font-size: 9px; font-weight: 900; letter-spacing: 0.05em;
  color: #fff; display: flex; justify-content: center; gap: 4px;
  z-index: 2;
}
.h5-card-jackpot span { font-size: 9px; opacity: 0.9; }

.h5-card-cover {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 12px 8px 4px;
}
.h5-card-game-icon { font-size: 28px; margin-bottom: 6px; }
.h5-card-game-name {
  font-size: 11px; font-weight: 800; text-align: center;
  color: #fff; line-height: 1.3;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}
.h5-card-provider {
  font-size: 9px; color: rgba(196,181,213,0.6);
  margin-top: 3px;
}

.h5-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 8px 6px;
}
.h5-card-rtp { font-size: 9px; color: #f5c842; font-weight: 700; }
.h5-card-badge {
  font-size: 9px; font-weight: 700;
  background: rgba(168,85,247,0.4); border-radius: 6px;
  padding: 1px 5px; color: #c084fc;
}

.h5-card-heart {
  position: absolute; bottom: 28px; right: 7px;
  font-size: 16px; color: rgba(255,255,255,0.4);
  cursor: pointer; z-index: 2;
  transition: color 0.2s;
}
.h5-card-heart:hover { color: #f87171; }

/* ── 底部導覽 ── */
.h5-bottom-nav {
  display: flex;
  background: rgba(15,0,35,0.97);
  border-top: 1px solid rgba(168,85,247,0.25);
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 0 env(safe-area-inset-bottom, 0px);
}
.h5-bottom-nav::-webkit-scrollbar { display: none; }
.h5-bottom-item {
  flex: 1; min-width: 56px;
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 4px 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.h5-bottom-item:hover { background: rgba(168,85,247,0.1); }
.h5-bottom-icon { font-size: 22px; }
.h5-bottom-label { font-size: 10px; color: rgba(196,181,213,0.7); margin-top: 3px; font-weight: 600; }
</style>
