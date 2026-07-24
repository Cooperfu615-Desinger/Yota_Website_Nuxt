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

const { isBlockedPlayer, isFriendPlayer, addFriend, removeFriend } = useSocialState()
const showBlockConfirm = ref(false)
const friendNotice = ref('')

const isBlocked = computed(() => isBlockedPlayer(props.player.playerId))
const isFriend = computed(() => isFriendPlayer(props.player.playerId))

function requestMessage() {
  if (isBlocked.value) return
  emit('message', props.player)
}

function confirmBlock() {
  emit('block', props.player)
  showBlockConfirm.value = false
}

function toggleFriend() {
  if (isFriend.value) {
    removeFriend(props.player.playerId)
    friendNotice.value = '已從好友名單移除'
  } else {
    addFriend(props.player)
    friendNotice.value = '已加入好友名單'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="player-modal" appear>
      <div
        class="modal-overlay player-card-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`${props.player.name} 的玩家個人資訊`"
        @click.self="emit('close')"
      >
        <div class="modal-box player-modal-box">
          <div class="modal-inner player-modal-inner">
            <button class="modal-close" type="button" aria-label="關閉玩家資訊" @click="emit('close')">×</button>

            <p class="player-eyebrow">PLAYER PROFILE</p>
            <h2 class="modal-title player-modal-title">玩家個人資訊</h2>

            <section class="profile-hero">
              <div class="avatar-wrap">
                <div class="avatar-face">{{ props.player.avatar }}</div>
                <span v-if="props.player.vip > 0" class="vip-pill">VIP {{ props.player.vip }}</span>
              </div>

              <div class="profile-summary">
                <div class="identity-grid">
                  <div class="identity-field">
                    <span>暱稱</span>
                    <strong>{{ props.player.name }}</strong>
                  </div>
                  <div class="identity-field">
                    <span>帳號</span>
                    <strong>{{ props.player.account }}</strong>
                  </div>
                </div>
                <div class="player-meta">
                  <span>LV. {{ props.player.level }}</span>
                  <span class="status-dot" :class="{ blocked: isBlocked }" />
                  <span :class="{ 'status-blocked': isBlocked }">
                    {{ isBlocked ? '已加入黑名單' : props.player.status }}
                  </span>
                </div>
              </div>
            </section>

            <section class="info-box">
              <h3>玩家簡述</h3>
              <p>{{ props.player.bio }}</p>
            </section>

            <section>
              <h3 class="card-section-title"><span>🎮</span> 最近遊玩</h3>
              <div class="recent-grid">
                <article v-for="game in props.player.recentGames" :key="game.id" class="recent-card">
                  <div class="game-cover" :style="{ background: game.color }" />
                  <p>{{ game.name }}</p>
                </article>
              </div>
            </section>

            <section class="action-group">
              <p class="group-label">社交操作</p>
              <div class="action-grid social">
                <button type="button" class="action-btn friend" :class="{ active: isFriend }" @click="toggleFriend">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21a6 6 0 0 1 12 0"/>
                  </svg>
                  <span>{{ isFriend ? '刪除好友' : '加好友' }}</span>
                </button>
                <button type="button" class="action-btn gift" @click="emit('gift', props.player)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12v8H4v-8m16 0H4m16 0h1V8h-5.5M4 12H3V8h5.5m7 0H12m3.5 0C17.43 8 19 6.657 19 5s-1.57-3-3.5-3S12 3.343 12 5s1.57 3 3.5 3Zm-7 0C10.43 8 12 6.657 12 5S10.43 2 8.5 2 5 3.343 5 5s1.57 3 3.5 3Z"/>
                  </svg>
                  <span>贈禮</span>
                </button>
                <button type="button" class="action-btn transfer" @click="emit('transfer', props.player)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 1v6m0 0 3-3m-3 3-3-3M7 23v-6m0 0 3 3m-3-3-3 3M19 12a7 7 0 0 0-11.9-5M5 12a7 7 0 0 0 11.9 5"/>
                  </svg>
                  <span>轉點</span>
                </button>
              </div>
              <p v-if="friendNotice" class="friend-notice" aria-live="polite">{{ friendNotice }}</p>
            </section>

            <button class="chat-primary" type="button" :disabled="isBlocked" @click="requestMessage">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 0 1-4.2-.9L3 20l.9-3.6A7.7 7.7 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/>
              </svg>
              <span>{{ isBlocked ? '已封鎖聊天' : '開始聊天' }}</span>
            </button>

            <section class="security-box">
              <p class="group-label"><span>🛡</span> 安全操作</p>
              <div class="action-grid security">
                <button
                  type="button"
                  class="action-btn block"
                  :disabled="isBlocked"
                  @click="showBlockConfirm = true"
                >
                  <span>{{ isBlocked ? '已在黑名單' : '加入黑名單' }}</span>
                </button>
                <button type="button" class="action-btn report" @click="emit('report', props.player)">檢舉玩家</button>
              </div>
            </section>

            <div v-if="showBlockConfirm" class="confirm-layer" role="alertdialog" aria-modal="true" aria-label="加入黑名單確認">
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.player-card-overlay {
  padding: 14px;
}

.player-modal-box {
  width: min(540px, calc(100vw - 28px));
  max-width: 540px;
  max-height: calc(100dvh - 28px);
  overflow: hidden;
}

.player-modal-inner {
  max-height: calc(100dvh - 58px);
  overflow-y: auto;
  padding: 26px 24px 22px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.28) transparent;
}

.player-eyebrow {
  margin: 0 0 4px;
  color: rgba(255,255,255,0.72);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-align: center;
}

.player-modal-title {
  margin-bottom: 16px;
}

.profile-hero {
  display: grid;
  grid-template-columns: 84px 1fr;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.24);
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}

.avatar-wrap {
  position: relative;
  align-self: start;
}

.avatar-face {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.1));
  border: 2px solid rgba(255,255,255,0.78);
  border-radius: 22px;
  font-size: 38px;
  box-shadow: 0 8px 20px rgba(38,28,122,0.3);
}

.vip-pill {
  position: absolute;
  left: 50%;
  bottom: -7px;
  transform: translateX(-50%);
  min-width: 56px;
  padding: 3px 8px;
  color: #3a2400;
  background: linear-gradient(180deg, #fde68a, #f5c842);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 950;
  text-align: center;
  white-space: nowrap;
}

.profile-summary {
  min-width: 0;
}

.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.identity-field {
  min-width: 0;
  padding: 9px 10px;
  background: rgba(22,15,84,0.2);
  border: 1px solid rgba(255,255,255,0.17);
  border-radius: 11px;
}

.identity-field span {
  display: block;
  margin-bottom: 3px;
  color: rgba(255,255,255,0.62);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.identity-field strong {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  color: rgba(255,255,255,0.75);
  font-size: 11px;
  font-weight: 800;
}

.status-dot {
  width: 6px;
  height: 6px;
  margin-left: 3px;
  background: #86efac;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(134,239,172,0.7);
}

.status-dot.blocked {
  background: #fda4af;
  box-shadow: 0 0 8px rgba(253,164,175,0.6);
}

.status-blocked {
  color: #ffe4e6;
}

.info-box,
.security-box {
  margin-top: 14px;
  padding: 13px 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
}

.info-box h3,
.card-section-title,
.group-label {
  margin: 0 0 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.info-box p {
  margin: 0;
  color: rgba(255,255,255,0.78);
  font-size: 12px;
  line-height: 1.65;
}

.card-section-title {
  margin-top: 14px;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.recent-card {
  overflow: hidden;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 11px;
}

.game-cover {
  height: 38px;
  opacity: 0.9;
}

.recent-card p {
  margin: 0;
  padding: 7px 6px;
  overflow: hidden;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-group {
  margin-top: 14px;
}

.action-grid {
  display: grid;
  gap: 8px;
}

.action-grid.social {
  grid-template-columns: repeat(3, 1fr);
}

.action-grid.security {
  grid-template-columns: repeat(2, 1fr);
}

.action-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: 11px;
  color: #fff;
  background: rgba(255,255,255,0.1);
  font-size: 11px;
  font-weight: 900;
  transition: transform 0.18s ease, background 0.18s ease;
}

.action-btn svg,
.chat-primary svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.18);
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.action-btn.friend.active {
  color: #e0f2fe;
  background: rgba(14,165,233,0.22);
}

.action-btn.gift {
  color: #fce7f3;
  background: rgba(236,72,153,0.16);
}

.action-btn.transfer {
  color: #fef3c7;
  background: rgba(245,158,11,0.16);
}

.friend-notice {
  margin: 7px 0 0;
  color: #d1fae5;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

.chat-primary {
  width: 100%;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  color: #fff;
  background: linear-gradient(180deg, #a3ffd1 0%, #1ab16d 100%);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  font-size: 13px;
  font-weight: 900;
  text-shadow: 0 1px 3px rgba(0,0,0,0.22);
  transition: transform 0.18s ease, filter 0.18s ease;
}

.chat-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.chat-primary:disabled {
  cursor: not-allowed;
  color: rgba(255,255,255,0.55);
  background: rgba(148,163,184,0.3);
  border-color: rgba(255,255,255,0.2);
  box-shadow: none;
}

.security-box {
  margin-top: 12px;
  background: rgba(65,26,97,0.17);
}

.security-box .group-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.block {
  color: #ffe4e6;
  background: rgba(190,18,60,0.2);
}

.action-btn.report {
  color: #ffedd5;
  background: rgba(194,65,12,0.2);
}

.confirm-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(26,12,64,0.78);
  backdrop-filter: blur(7px);
  border-radius: 14px;
}

.confirm-card {
  width: min(360px, 100%);
  padding: 20px;
  background: linear-gradient(160deg, #3f46aa, #252b79);
  border: 1px solid rgba(255,255,255,0.34);
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.42);
}

.confirm-card h3 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.confirm-card p {
  margin: 0;
  color: rgba(255,255,255,0.74);
  font-size: 12px;
  line-height: 1.65;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
}

.confirm-cancel,
.confirm-danger {
  min-height: 40px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
}

.confirm-cancel {
  color: #fff;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.24);
}

.confirm-danger {
  color: #fff;
  background: linear-gradient(135deg, #e11d48, #9f1239);
  border: 1px solid rgba(255,255,255,0.3);
}

.player-modal-enter-active,
.player-modal-leave-active {
  transition: opacity 0.22s ease;
}

.player-modal-enter-from,
.player-modal-leave-to {
  opacity: 0;
}

@media (max-width: 460px) {
  .player-card-overlay {
    align-items: flex-start;
    padding: 8px;
  }

  .player-modal-box {
    width: calc(100vw - 16px);
    max-height: calc(100dvh - 16px);
    padding: 9px;
    border-radius: 19px;
  }

  .player-modal-inner {
    max-height: calc(100dvh - 34px);
    padding: 24px 15px 18px;
  }

  .profile-hero {
    grid-template-columns: 68px 1fr;
    gap: 10px;
    padding: 11px;
  }

  .avatar-face {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    font-size: 31px;
  }

  .identity-grid {
    gap: 5px;
  }

  .identity-field {
    padding: 7px;
  }

  .identity-field strong {
    font-size: 12px;
  }

  .action-btn {
    min-height: 40px;
    padding: 7px 4px;
  }
}
</style>
