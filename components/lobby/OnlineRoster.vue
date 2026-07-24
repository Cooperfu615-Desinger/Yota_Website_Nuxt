<script setup lang="ts">
import type { OnlinePlayer } from '~/data/siteContent'

const props = defineProps<{ players: OnlinePlayer[] }>()
const emit = defineEmits<{
  select: [player: OnlinePlayer]
  friendAdded: [player: OnlinePlayer]
  close: []
}>()

type SearchMode = 'name' | 'account'

const searchMode = ref<SearchMode>('name')
const searchQuery = ref('')
const { addFriend, isFriendPlayer, isBlockedPlayer } = useSocialState()

const searchPlaceholder = computed(() =>
  searchMode.value === 'name' ? '輸入玩家暱稱' : '輸入玩家帳號',
)

const filteredPlayers = computed(() => {
  const keyword = searchQuery.value.trim().toLocaleLowerCase('zh-TW')
  if (!keyword) return props.players

  return props.players.filter((player) => {
    const value = searchMode.value === 'name' ? player.name : player.account
    return value.toLocaleLowerCase('zh-TW').includes(keyword)
  })
})

function quickAddFriend(player: OnlinePlayer) {
  if (!addFriend(player)) return
  emit('friendAdded', player)
}
</script>

<template>
  <aside class="roster-panel" @click.stop>
    <header class="roster-header">
      <div>
        <p>PLAYER DIRECTORY</p>
        <h2>玩家清單</h2>
      </div>
      <button class="roster-close" type="button" aria-label="關閉玩家清單" @click="emit('close')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </header>

    <section class="roster-search" aria-label="搜尋玩家">
      <div class="search-mode" role="group" aria-label="搜尋方式">
        <button
          type="button"
          :class="{ active: searchMode === 'name' }"
          :aria-pressed="searchMode === 'name'"
          @click="searchMode = 'name'"
        >
          暱稱
        </button>
        <button
          type="button"
          :class="{ active: searchMode === 'account' }"
          :aria-pressed="searchMode === 'account'"
          @click="searchMode = 'account'"
        >
          帳號
        </button>
      </div>

      <div class="search-field">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          :aria-label="searchPlaceholder"
          :placeholder="searchPlaceholder"
        >
        <button v-if="searchQuery" type="button" aria-label="清除搜尋" @click="searchQuery = ''">×</button>
      </div>
    </section>

    <ul v-if="filteredPlayers.length" class="roster-list">
      <li
        v-for="player in filteredPlayers"
        :key="player.id"
        class="player-row"
      >
        <button
          class="player-profile"
          type="button"
          :aria-label="`查看 ${player.name} 的玩家資訊`"
          @click="emit('select', player)"
        >
          <span class="player-avatar">{{ player.avatar }}</span>
          <span class="player-name">{{ player.name }}</span>
        </button>
        <button
          v-if="!isFriendPlayer(player.playerId) && !isBlockedPlayer(player.playerId)"
          class="quick-add"
          type="button"
          :aria-label="`加入 ${player.name} 為好友`"
          @click.stop="quickAddFriend(player)"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </li>
    </ul>

    <div v-else class="roster-empty">
      <span>⌕</span>
      <strong>找不到符合的玩家</strong>
      <p>請調整搜尋文字或切換搜尋方式</p>
    </div>
  </aside>
</template>

<style scoped>
.roster-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  width: 82%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(circle at 100% 0%, rgba(168,85,247,0.15), transparent 34%),
    var(--color-bg-card);
  border-left: 1px solid rgba(168,85,247,0.3);
  box-shadow: -12px 0 36px rgba(0,0,0,0.55);
  animation: roster-slide 0.22s ease;
}

.roster-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 15px 16px 13px;
  border-bottom: 1px solid rgba(168,85,247,0.18);
}

.roster-header p {
  margin: 0 0 2px;
  color: var(--color-gold);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.roster-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 900;
}

.roster-close {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--color-text-muted);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 50%;
  transition: color 0.18s ease, background 0.18s ease;
}

.roster-close:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

.roster-close svg {
  width: 17px;
  height: 17px;
}

.roster-search {
  display: grid;
  gap: 9px;
  flex-shrink: 0;
  padding: 12px 14px;
  background: rgba(15,0,32,0.34);
  border-bottom: 1px solid rgba(168,85,247,0.14);
}

.search-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 3px;
  background: rgba(0,0,0,0.24);
  border: 1px solid rgba(168,85,247,0.18);
  border-radius: 10px;
}

.search-mode button {
  min-height: 29px;
  color: var(--color-text-muted);
  border-radius: 7px;
  font-size: 11px;
  font-weight: 900;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.search-mode button.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(124,58,237,0.85), rgba(107,33,168,0.92));
  box-shadow: 0 3px 10px rgba(76,29,149,0.34);
}

.search-field {
  min-height: 39px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(168,85,247,0.24);
  border-radius: 11px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-field:focus-within {
  border-color: rgba(192,132,252,0.58);
  box-shadow: 0 0 0 3px rgba(168,85,247,0.1);
}

.search-field > svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--color-purple-light);
}

.search-field input {
  min-width: 0;
  flex: 1;
  color: var(--color-text);
  background: transparent;
  font-size: 12px;
  outline: none;
}

.search-field input::placeholder {
  color: rgba(196,181,213,0.46);
}

.search-field input::-webkit-search-cancel-button {
  display: none;
}

.search-field button {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-text-muted);
  background: rgba(255,255,255,0.07);
  border-radius: 50%;
  font-size: 15px;
  line-height: 1;
}

.roster-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px 0;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 6px 12px 6px 14px;
  border-bottom: 1px solid rgba(168,85,247,0.08);
  transition: background 0.16s ease;
}

.player-row:hover {
  background: rgba(168,85,247,0.07);
}

.player-profile {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  text-align: left;
}

.player-avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: rgba(168,85,247,0.16);
  border: 1px solid rgba(168,85,247,0.26);
  border-radius: 12px;
  font-size: 18px;
}

.player-name {
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-add {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(145deg, #8b5cf6, #6b21a8);
  border: 1px solid rgba(216,180,254,0.46);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(91,33,182,0.28);
  transition: transform 0.16s ease, filter 0.16s ease;
}

.quick-add:hover {
  transform: translateY(-1px) scale(1.04);
  filter: brightness(1.12);
}

.quick-add svg {
  width: 15px;
  height: 15px;
}

.roster-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  flex-direction: column;
  padding: 28px 20px;
  color: var(--color-text-muted);
  text-align: center;
}

.roster-empty > span {
  color: rgba(192,132,252,0.55);
  font-size: 34px;
}

.roster-empty strong {
  margin-top: 6px;
  color: var(--color-text);
  font-size: 13px;
}

.roster-empty p {
  margin: 5px 0 0;
  font-size: 10px;
}

@keyframes roster-slide {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@media (max-width: 420px) {
  .roster-panel {
    width: 88%;
  }
}
</style>
