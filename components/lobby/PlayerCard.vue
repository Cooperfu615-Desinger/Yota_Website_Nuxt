<script setup lang="ts">
import type { ChatPlayerProfile } from '~/data/siteContent'

const props = defineProps<{ player: ChatPlayerProfile }>()
const emit = defineEmits<{
  message: [player: ChatPlayerProfile]
  report: [player: ChatPlayerProfile]
  block: [player: ChatPlayerProfile]
  gift: [player: ChatPlayerProfile]
  transfer: [player: ChatPlayerProfile]
  close: []
}>()

const { isBlockedPlayer } = useSocialState()
const showBlockConfirm = ref(false)
const isFriend = ref(Boolean(props.player.isFriend))

const isBlocked = computed(() => isBlockedPlayer(props.player.playerId))

function requestMessage() {
  if (isBlocked.value) return
  emit('message', props.player)
}

function confirmBlock() {
  emit('block', props.player)
  showBlockConfirm.value = false
}
</script>

<template>
  <div class="card-overlay" @click.self="emit('close')">
    <div class="player-card">
      <button class="card-close" type="button" aria-label="關閉" @click="emit('close')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <aside class="profile-panel">
        <div class="card-kicker">
          <span>✧</span>
          <span>PLAYER CARD</span>
        </div>

        <div class="avatar-wrap">
          <div class="avatar-face">
            {{ props.player.avatar }}
          </div>
          <span v-if="props.player.vip > 0" class="vip-pill">VIP {{ props.player.vip }}</span>
        </div>

        <h2 class="player-name">{{ props.player.name }}</h2>
        <div class="player-id">
          <span>#</span>
          <span>{{ props.player.playerId }}</span>
        </div>
        <p class="player-level">Level {{ props.player.level }}</p>
        <p class="player-status" :class="{ blocked: isBlocked }">
          {{ isBlocked ? '已加入黑名單' : props.player.status }}
        </p>

        <button
          class="chat-primary"
          type="button"
          :disabled="isBlocked"
          @click="requestMessage"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 0 1-4.2-.9L3 20l.9-3.6A7.7 7.7 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/>
          </svg>
          <span>{{ isBlocked ? '已封鎖聊天' : '聊天' }}</span>
        </button>
      </aside>

      <section class="profile-content">
        <div class="info-box">
          <h3>玩家簡述</h3>
          <p>{{ props.player.bio }}</p>
        </div>

        <div>
          <h3 class="section-title">
            <span>🎮</span>
            <span>最近遊玩</span>
          </h3>
          <div class="recent-grid">
            <article
              v-for="game in props.player.recentGames"
              :key="game.id"
              class="recent-card"
            >
              <div class="game-cover" :style="{ background: game.color }" />
              <p>{{ game.name }}</p>
            </article>
          </div>
        </div>

        <div class="action-group">
          <p class="group-label">社交操作</p>
          <div class="action-grid social">
            <button
              type="button"
              class="action-btn muted"
              :class="{ active: isFriend }"
              @click="isFriend = true"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21a6 6 0 0 1 12 0"/>
              </svg>
              <span>{{ isFriend ? '已是好友' : '加好友' }}</span>
            </button>
            <button type="button" class="action-btn gift" @click="emit('gift', props.player)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12v8H4v-8m16 0H4m16 0h1V8h-5.5M4 12H3V8h5.5m7 0H12m3.5 0C17.43 8 19 6.657 19 5s-1.57-3-3.5-3S12 3.343 12 5s1.57 3 3.5 3Zm-7 0C10.43 8 12 6.657 12 5S10.43 2 8.5 2 5 3.343 5 5s1.57 3 3.5 3Z"/>
              </svg>
              <span>贈禮</span>
            </button>
            <button type="button" class="action-btn transfer" @click="emit('transfer', props.player)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 1v6m0 0 3-3m-3 3-3-3M7 23v-6m0 0 3 3m-3-3-3 3M19 12a7 7 0 0 0-11.9-5M5 12a7 7 0 0 0 11.9 5"/>
              </svg>
              <span>轉點</span>
            </button>
          </div>
        </div>

        <div class="security-box">
          <p class="group-label">
            <span>🛡</span>
            <span>安全操作</span>
          </p>
          <div class="action-grid security">
            <button
              type="button"
              class="action-btn block"
              :disabled="isBlocked"
              @click="showBlockConfirm = true"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span>{{ isBlocked ? '已在黑名單' : '黑名單' }}</span>
            </button>
            <button type="button" class="action-btn report" @click="emit('report', props.player)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v16m0-16c4-2 7 2 11 0v9c-4 2-7-2-11 0"/>
              </svg>
              <span>檢舉</span>
            </button>
          </div>
        </div>
      </section>

      <div v-if="showBlockConfirm" class="confirm-layer">
        <div class="confirm-card">
          <h3>加入黑名單？</h3>
          <p>加入後將無法私訊此玩家，也無法再次查看該玩家個人資料。</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" @click="showBlockConfirm = false">取消</button>
            <button type="button" class="confirm-danger" @click="confirmBlock">確認加入</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.64);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 18px;
}
.player-card {
  position: relative;
  width: 100%;
  max-width: 980px;
  min-height: min(720px, calc(100dvh - 36px));
  display: grid;
  grid-template-columns: minmax(260px, 34%) 1fr;
  overflow: hidden;
  background: #0d001b;
  border: 1px solid rgba(168,85,247,0.35);
  border-radius: 22px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.72), 0 0 60px rgba(168,85,247,0.18);
  animation: card-pop 0.18s ease;
}
.card-close {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 2;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,0.75);
  background: rgba(0,0,0,0.45);
  border-radius: 999px;
  transition: all 0.18s ease;
}
.card-close:hover {
  color: #fff;
  transform: rotate(90deg);
}
.profile-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 28px;
  background:
    radial-gradient(circle at 16% 92%, rgba(245,200,66,0.12), transparent 34%),
    linear-gradient(180deg, rgba(168,85,247,0.24), rgba(63,18,102,0.16) 48%, rgba(15,0,32,0.94));
  border-right: 1px solid rgba(168,85,247,0.28);
}
.card-kicker {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 18px;
  border: 1px solid rgba(245,200,66,0.42);
  border-radius: 999px;
  color: #ffe600;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.04em;
}
.avatar-wrap {
  position: relative;
  margin-top: 38px;
  margin-bottom: 34px;
}
.avatar-face {
  width: 156px;
  height: 156px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ed4aa4, #a855f7);
  border: 7px solid #100018;
  border-radius: 999px;
  font-size: 72px;
  box-shadow: 0 20px 42px rgba(0,0,0,0.36);
}
.vip-pill {
  position: absolute;
  left: 50%;
  bottom: -15px;
  transform: translateX(-50%);
  min-width: 88px;
  padding: 8px 18px;
  text-align: center;
  color: #150b00;
  background: linear-gradient(135deg, #ffe600, var(--color-gold-dark));
  border: 2px solid rgba(255,255,255,0.35);
  border-radius: 999px;
  font-weight: 950;
}
.player-name {
  margin: 0;
  color: #fff;
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 950;
  line-height: 1.1;
  text-align: center;
}
.player-id {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 7px 20px;
  color: #d8d0e9;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  font-weight: 900;
}
.player-id span:first-child,
.player-level {
  color: #ffe600;
}
.player-level {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 950;
}
.player-status {
  margin-top: 6px;
  color: #34d399;
  font-size: 13px;
  font-weight: 800;
}
.player-status.blocked {
  color: #fb7185;
}
.chat-primary {
  margin-top: auto;
  width: 100%;
  min-height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #160d00;
  background: linear-gradient(135deg, #ffe600, var(--color-gold-dark));
  border-radius: 16px;
  font-size: 19px;
  font-weight: 950;
  box-shadow: 0 14px 34px rgba(245,200,66,0.18);
  transition: transform 0.18s ease, filter 0.18s ease;
}
.chat-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.06);
}
.chat-primary:disabled {
  cursor: not-allowed;
  color: rgba(255,255,255,0.45);
  background: rgba(148,163,184,0.16);
  box-shadow: none;
}
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 42px 42px 34px;
}
.info-box {
  padding: 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
}
.info-box h3,
.section-title {
  margin: 0 0 14px;
  color: #fff;
  font-size: 19px;
  font-weight: 950;
}
.info-box p {
  margin: 0;
  color: #d8d0e9;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.7;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.recent-card {
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}
.game-cover {
  height: 100px;
  opacity: 0.92;
}
.recent-card p {
  margin: 0;
  padding: 14px;
  color: #e9ddff;
  font-size: 15px;
  font-weight: 900;
  text-align: center;
}
.action-group {
  margin-top: auto;
}
.group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: rgba(233,221,255,0.75);
  font-size: 15px;
  font-weight: 950;
}
.action-grid {
  display: grid;
  gap: 16px;
}
.action-grid.social {
  grid-template-columns: repeat(3, 1fr);
}
.action-grid.security {
  grid-template-columns: repeat(2, 1fr);
}
.action-btn {
  min-height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 16px;
  font-weight: 950;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}
.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
.action-btn.muted {
  color: #a8b3c7;
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(125,211,252,0.22);
}
.action-btn.muted.active {
  color: #cbd5e1;
  background: rgba(148,163,184,0.16);
}
.action-btn.gift {
  color: #f9c8e8;
  background: rgba(236,72,153,0.12);
  border: 1px solid rgba(236,72,153,0.34);
}
.action-btn.transfer {
  color: #ffe600;
  background: rgba(245,200,66,0.1);
  border: 1px solid rgba(245,200,66,0.34);
}
.security-box {
  padding: 16px;
  background: rgba(127,29,29,0.12);
  border: 1px solid rgba(248,113,113,0.22);
  border-radius: 18px;
}
.action-btn.block {
  color: #fecdd3;
  background: rgba(190,18,60,0.12);
  border: 1px solid rgba(244,63,94,0.36);
}
.action-btn.report {
  color: #fed7aa;
  background: rgba(217,119,6,0.12);
  border: 1px solid rgba(251,146,60,0.32);
}
.confirm-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
}
.confirm-card {
  width: min(420px, 100%);
  padding: 24px;
  background: var(--color-bg-card);
  border: 1px solid rgba(244,63,94,0.38);
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.55);
}
.confirm-card h3 {
  margin: 0 0 10px;
  color: #fff;
  font-size: 22px;
  font-weight: 950;
}
.confirm-card p {
  margin: 0;
  color: rgba(233,221,255,0.76);
  line-height: 1.7;
}
.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}
.confirm-cancel,
.confirm-danger {
  min-height: 44px;
  border-radius: 12px;
  font-weight: 950;
}
.confirm-cancel {
  color: var(--color-text);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
}
.confirm-danger {
  color: #fff;
  background: linear-gradient(135deg, #be123c, #7f1d1d);
  border: 1px solid rgba(244,63,94,0.42);
}
@keyframes card-pop {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@media (max-width: 860px) {
  .card-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }
  .player-card {
    min-height: auto;
    grid-template-columns: 1fr;
    border-radius: 18px;
  }
  .profile-panel {
    padding: 24px 20px;
    border-right: 0;
    border-bottom: 1px solid rgba(168,85,247,0.28);
  }
  .card-close {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }
  .avatar-wrap {
    margin-top: 26px;
  }
  .avatar-face {
    width: 118px;
    height: 118px;
    font-size: 54px;
  }
  .profile-content {
    padding: 22px 16px 18px;
    gap: 20px;
  }
  .recent-grid,
  .action-grid.social,
  .action-grid.security {
    grid-template-columns: 1fr;
  }
  .game-cover {
    height: 72px;
  }
  .action-btn {
    min-height: 54px;
  }
}
</style>
