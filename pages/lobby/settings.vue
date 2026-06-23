<script setup lang="ts">
import type { BlockedPlayer } from '~/composables/useSocialState'

definePageMeta({ layout: 'lobby' })

const soundEnabled  = ref(true)
const musicEnabled  = ref(true)
const notifyEnabled = ref(true)
const lang = ref<'zh-TW' | 'en'>('zh-TW')
const { blockedPlayers, unblockPlayer } = useSocialState()
const noticeText = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const sections = [
  {
    title: '音效設定',
    items: [
      { label: '遊戲音效', desc: '啟用遊戲中的音效回饋', model: soundEnabled },
      { label: '背景音樂', desc: '啟用大廳背景音樂',     model: musicEnabled },
    ],
  },
  {
    title: '通知設定',
    items: [
      { label: '站內通知', desc: '接收系統公告與活動通知', model: notifyEnabled },
    ],
  },
]

function formatBlockedAt(blockedAt: number) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(blockedAt)
}

function showNotice(text: string) {
  noticeText.value = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    noticeText.value = ''
  }, 2400)
}

function handleUnblock(player: BlockedPlayer) {
  unblockPlayer(player.playerId)
  showNotice(`已將 ${player.name} 移出黑名單`)
}
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <div class="settings-header mb-4">
      <div>
        <h1 class="section-title">設置</h1>
        <p class="settings-subtitle">管理音效、通知與社交安全偏好</p>
      </div>
      <div class="security-count">
        <span>{{ blockedPlayers.length }}</span>
        <small>黑名單</small>
      </div>
    </div>

    <Transition name="notice">
      <div v-if="noticeText" class="settings-notice">
        {{ noticeText }}
      </div>
    </Transition>

    <!-- 設定區塊 -->
    <div v-for="sec in sections" :key="sec.title" class="card-purple mb-4">
      <div class="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider"
           style="color:var(--color-text-muted);">
        {{ sec.title }}
      </div>
      <div
        v-for="item in sec.items"
        :key="item.label"
        class="px-4 py-3 border-t flex items-center justify-between gap-3"
        style="border-color:rgba(168,85,247,0.1);"
      >
        <div>
          <div class="text-sm font-bold">{{ item.label }}</div>
          <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.desc }}</div>
        </div>
        <!-- Toggle switch -->
        <button
          class="relative w-12 h-6 rounded-full flex-shrink-0 transition-all duration-200"
          :style="item.model.value
            ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple));'
            : 'background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.25);'"
          :aria-checked="item.model.value"
          role="switch"
          :aria-label="item.label"
          @click="item.model.value = !item.model.value"
        >
          <span
            class="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
            :style="item.model.value
              ? 'left: calc(100% - 22px); background:#fff;'
              : 'left: 2px; background:rgba(196,181,213,0.5);'"
          />
        </button>
      </div>
    </div>

    <!-- 語言選擇 -->
    <div class="card-purple mb-4">
      <div class="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider"
           style="color:var(--color-text-muted);">
        語言 / Language
      </div>
      <div class="px-4 py-3 border-t flex gap-3" style="border-color:rgba(168,85,247,0.1);">
        <button
          v-for="opt in [{ v: 'zh-TW', label: '繁體中文' }, { v: 'en', label: 'English' }]"
          :key="opt.v"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :style="lang === opt.v
            ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff;'
            : 'background:rgba(168,85,247,0.1); color:var(--color-text-muted); border:1px solid var(--color-border);'"
          @click="lang = opt.v as 'zh-TW' | 'en'"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 黑名單管理 -->
    <section class="blacklist-card mb-4">
      <div class="blacklist-aurora" aria-hidden="true" />
      <header class="blacklist-header">
        <div class="blacklist-title-wrap">
          <div class="blacklist-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <div>
            <h2>黑名單管理</h2>
            <p>已封鎖玩家無法私訊，也無法查看個人資料。</p>
          </div>
        </div>
        <span class="blacklist-pill">{{ blockedPlayers.length }} 位玩家</span>
      </header>

      <div class="blacklist-body">
        <div v-if="blockedPlayers.length === 0" class="blacklist-empty">
          <div class="empty-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
          <h3>目前沒有黑名單玩家</h3>
          <p>從聊天玩家資訊彈窗加入黑名單後，玩家會顯示在這裡，並可隨時解除封鎖。</p>
        </div>

        <div v-else class="blacklist-list">
          <article
            v-for="player in blockedPlayers"
            :key="player.playerId"
            class="blocked-row"
          >
            <div class="blocked-avatar">
              <span>{{ player.avatar || player.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="blocked-info">
              <div class="blocked-main">
                <h3>{{ player.name }}</h3>
                <span>已封鎖</span>
              </div>
              <div class="blocked-meta">
                <span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5v14"/>
                  </svg>
                  {{ player.playerId }}
                </span>
                <span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"/>
                  </svg>
                  {{ formatBlockedAt(player.blockedAt) }}
                </span>
                <span class="blocked-effect">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  私訊與資料查看已停用
                </span>
              </div>
            </div>
            <button class="unblock-btn" type="button" @click="handleUnblock(player)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 10.5V6.75a3.75 3.75 0 1 1 7.5 0v3.75M3.75 10.5h10.5A2.25 2.25 0 0 1 16.5 12.75v5.25A2.25 2.25 0 0 1 14.25 20.25H3.75A2.25 2.25 0 0 1 1.5 18v-5.25A2.25 2.25 0 0 1 3.75 10.5Z"/>
              </svg>
              解除封鎖
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- 版本資訊 -->
    <div class="card-purple px-4 py-4">
      <div class="flex justify-between items-center text-sm">
        <span style="color:var(--color-text-muted);">版本</span>
        <span class="font-bold" style="color:var(--color-purple-light);">v1.0.0</span>
      </div>
      <div class="flex justify-between items-center text-sm mt-3">
        <span style="color:var(--color-text-muted);">服務條款</span>
        <span class="font-bold" style="color:var(--color-purple-light);">查看 →</span>
      </div>
      <div class="flex justify-between items-center text-sm mt-3">
        <span style="color:var(--color-text-muted);">隱私政策</span>
        <span class="font-bold" style="color:var(--color-purple-light);">查看 →</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.settings-subtitle {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 13px;
}
.security-count {
  min-width: 74px;
  padding: 10px 12px;
  border: 1px solid rgba(244,63,94,0.28);
  border-radius: 16px;
  background: rgba(190,18,60,0.12);
  text-align: center;
}
.security-count span {
  display: block;
  color: #fecdd3;
  font-size: 22px;
  font-weight: 950;
  line-height: 1;
}
.security-count small {
  color: rgba(254,205,211,0.72);
  font-size: 11px;
  font-weight: 800;
}
.settings-notice {
  position: sticky;
  top: 10px;
  z-index: 10;
  margin-bottom: 12px;
  padding: 10px 14px;
  color: #d1fae5;
  background: rgba(6,78,59,0.88);
  border: 1px solid rgba(52,211,153,0.34);
  border-radius: 999px;
  text-align: center;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 14px 34px rgba(0,0,0,0.28);
}
.notice-enter-active,
.notice-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.blacklist-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(26,10,46,0.98), rgba(16,5,31,0.98));
  border: 1px solid rgba(168,85,247,0.22);
  border-radius: 22px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.26);
}
.blacklist-aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 4% 0%, rgba(244,63,94,0.24), transparent 30%),
    radial-gradient(circle at 96% 0%, rgba(245,200,66,0.12), transparent 32%);
}
.blacklist-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.blacklist-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}
.blacklist-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: #fecdd3;
  background: rgba(244,63,94,0.14);
  border: 1px solid rgba(252,165,165,0.25);
  border-radius: 16px;
}
.blacklist-header h2,
.blacklist-empty h3,
.blocked-main h3 {
  margin: 0;
  color: #fff;
  font-weight: 950;
}
.blacklist-header h2 {
  font-size: 20px;
}
.blacklist-header p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}
.blacklist-pill {
  flex-shrink: 0;
  padding: 6px 12px;
  color: rgba(243,232,255,0.88);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
}
.blacklist-body {
  position: relative;
  padding: 16px;
}
.blacklist-empty {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 18px;
  text-align: center;
}
.empty-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  color: #a7f3d0;
  background: rgba(52,211,153,0.1);
  border: 1px solid rgba(110,231,183,0.25);
  border-radius: 999px;
}
.blacklist-empty p {
  max-width: 420px;
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.7;
}
.blacklist-list {
  display: grid;
  gap: 12px;
}
.blocked-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}
.blocked-row:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.07);
  border-color: rgba(252,165,165,0.32);
}
.blocked-avatar {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(168,85,247,0.22), rgba(244,63,94,0.16));
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 18px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.22);
}
.blocked-avatar span {
  font-size: 22px;
  font-weight: 950;
}
.blocked-info {
  min-width: 0;
}
.blocked-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.blocked-main h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
}
.blocked-main span {
  padding: 3px 8px;
  color: #fecdd3;
  background: rgba(244,63,94,0.12);
  border: 1px solid rgba(244,63,94,0.26);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 950;
}
.blocked-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}
.blocked-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.blocked-meta svg {
  color: var(--color-gold);
}
.blocked-meta .blocked-effect {
  color: rgba(254,205,211,0.82);
}
.blocked-meta .blocked-effect svg {
  color: #fb7185;
}
.unblock-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  color: #d1fae5;
  background: rgba(16,185,129,0.11);
  border: 1px solid rgba(110,231,183,0.28);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 950;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}
.unblock-btn:hover {
  transform: translateY(-1px);
  background: rgba(16,185,129,0.18);
  border-color: rgba(167,243,208,0.46);
}
@media (max-width: 680px) {
  .settings-header,
  .blacklist-header {
    align-items: stretch;
    flex-direction: column;
  }
  .security-count {
    align-self: flex-start;
  }
  .blacklist-pill {
    align-self: flex-start;
  }
  .blocked-row {
    grid-template-columns: auto 1fr;
  }
  .unblock-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
