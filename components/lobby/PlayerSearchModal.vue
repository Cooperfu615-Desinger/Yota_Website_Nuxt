<script setup lang="ts">
import type { ChatPlayerProfile } from '~/data/siteContent'

type DirectoryTab = 'search' | 'friends'
type SearchMode = 'name' | 'account'

const props = defineProps<{
  open: boolean
  players: ChatPlayerProfile[]
  friendIds: string[]
  currentPlayerId: string
}>()

const emit = defineEmits<{
  select: [player: ChatPlayerProfile]
  close: []
}>()

const activeTab = ref<DirectoryTab>('search')
const searchMode = ref<SearchMode>('name')
const searchQuery = ref('')
const dialogRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const playerSearchTabRef = ref<HTMLButtonElement | null>(null)
const friendListTabRef = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null

const friendIdSet = computed(() => new Set(props.friendIds))
const friendCount = computed(() =>
  props.players.filter(
    player => player.playerId !== props.currentPlayerId && friendIdSet.value.has(player.playerId),
  ).length,
)

const eligiblePlayers = computed(() => {
  const players = props.players.filter(player => player.playerId !== props.currentPlayerId)

  if (activeTab.value === 'friends') {
    return players.filter(player => friendIdSet.value.has(player.playerId))
  }

  return players
})

const filteredPlayers = computed(() => {
  const keyword = searchQuery.value.trim().toLocaleLowerCase('zh-TW')
  if (!keyword) return eligiblePlayers.value

  return eligiblePlayers.value.filter((player) => {
    const target = searchMode.value === 'name' ? player.name : player.account
    return target.toLocaleLowerCase('zh-TW').includes(keyword)
  })
})

const searchLabel = computed(() => searchMode.value === 'name' ? '玩家暱稱' : '玩家帳號')
const searchPlaceholder = computed(() =>
  activeTab.value === 'friends'
    ? `從好友清單搜尋${searchLabel.value}`
    : `輸入${searchLabel.value}`,
)

const emptyTitle = computed(() => {
  if (activeTab.value === 'friends' && !eligiblePlayers.value.length) return '好友清單目前是空的'
  return '找不到符合的玩家'
})

const emptyDescription = computed(() => {
  if (activeTab.value === 'friends' && !eligiblePlayers.value.length) {
    return '加入好友後，就能在這裡快速選擇收禮玩家。'
  }

  return `請確認${searchLabel.value}，或切換其他搜尋方式。`
})

function avatarIsImage(avatar: string) {
  return /^(?:https?:\/\/|\/|data:image\/)/i.test(avatar)
}

function selectTab(tab: DirectoryTab) {
  activeTab.value = tab
  searchQuery.value = ''
  nextTick(() => searchInputRef.value?.focus())
}

function handleTabKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()
  const nextTab: DirectoryTab = event.key === 'ArrowLeft' || event.key === 'Home'
    ? 'search'
    : 'friends'

  activeTab.value = nextTab
  searchQuery.value = ''
  nextTick(() => {
    const tabElement = nextTab === 'search' ? playerSearchTabRef.value : friendListTabRef.value
    tabElement?.focus()
  })
}

function selectMode(mode: SearchMode) {
  searchMode.value = mode
  searchQuery.value = ''
  nextTick(() => searchInputRef.value?.focus())
}

function closeModal() {
  emit('close')
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeModal()
    return
  }

  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusableElements = Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(element => !element.hasAttribute('hidden'))

  if (!focusableElements.length) {
    event.preventDefault()
    dialogRef.value.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement?.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement?.focus()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      if (import.meta.client) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      }
      activeTab.value = 'search'
      searchMode.value = 'name'
      searchQuery.value = ''
      await nextTick()
      searchInputRef.value?.focus()
    } else if (import.meta.client) {
      returnFocus?.focus()
      returnFocus = null
    }
  },
)

onMounted(() => {
  if (!props.open) return
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  nextTick(() => searchInputRef.value?.focus())
})

onBeforeUnmount(() => {
  if (import.meta.client) returnFocus?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="player-search">
      <div
        v-if="open"
        class="player-search-overlay"
        role="presentation"
        @click.self="closeModal"
      >
        <section
          ref="dialogRef"
          class="player-search-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="player-search-title"
          aria-describedby="player-search-description"
          tabindex="-1"
          @keydown="handleDialogKeydown"
        >
          <header class="modal-header">
            <div class="title-lockup">
              <span class="title-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7.5 1.5 4 4m0-4-4 4M16 7h5"/>
                </svg>
              </span>
              <div>
                <p>GIFT RECIPIENT</p>
                <h2 id="player-search-title">選擇收禮玩家</h2>
              </div>
            </div>
            <button class="close-button" type="button" aria-label="關閉玩家選擇視窗" @click="closeModal">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6 12 12M18 6 6 18"/>
              </svg>
            </button>
          </header>

          <p id="player-search-description" class="modal-description">
            使用暱稱或帳號找到指定玩家，確認身分後再送出贈禮申請。
          </p>

          <div class="directory-tabs" role="tablist" aria-label="玩家來源">
            <button
              id="player-search-tab"
              ref="playerSearchTabRef"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'search'"
              aria-controls="player-directory-panel"
              :tabindex="activeTab === 'search' ? 0 : -1"
              :class="{ active: activeTab === 'search' }"
              @click="selectTab('search')"
              @keydown="handleTabKeydown"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/>
              </svg>
              搜尋玩家
            </button>
            <button
              id="friend-list-tab"
              ref="friendListTabRef"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'friends'"
              aria-controls="player-directory-panel"
              :tabindex="activeTab === 'friends' ? 0 : -1"
              :class="{ active: activeTab === 'friends' }"
              @click="selectTab('friends')"
              @keydown="handleTabKeydown"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-12a4 4 0 0 1 0 7.75"/>
              </svg>
              好友清單
              <span class="friend-count">{{ friendCount }}</span>
            </button>
          </div>

          <div
            id="player-directory-panel"
            class="directory-panel"
            role="tabpanel"
            :aria-labelledby="activeTab === 'search' ? 'player-search-tab' : 'friend-list-tab'"
          >
            <div class="search-controls">
              <div class="search-mode" role="group" aria-label="搜尋方式">
                <button
                  type="button"
                  :class="{ active: searchMode === 'name' }"
                  :aria-pressed="searchMode === 'name'"
                  @click="selectMode('name')"
                >
                  暱稱
                </button>
                <button
                  type="button"
                  :class="{ active: searchMode === 'account' }"
                  :aria-pressed="searchMode === 'account'"
                  @click="selectMode('account')"
                >
                  帳號
                </button>
              </div>

              <label class="sr-only" for="player-search-input">搜尋{{ searchLabel }}</label>
              <div class="search-field">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/>
                </svg>
                <input
                  id="player-search-input"
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="search"
                  autocomplete="off"
                  :placeholder="searchPlaceholder"
                >
                <button
                  v-if="searchQuery"
                  type="button"
                  aria-label="清除搜尋文字"
                  @click="searchQuery = ''"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="result-summary" aria-live="polite" aria-atomic="true">
              <span>{{ activeTab === 'friends' ? '好友玩家' : '可選玩家' }}</span>
              <strong>{{ filteredPlayers.length }} 位</strong>
            </div>

            <ul v-if="filteredPlayers.length" class="player-list" aria-label="玩家搜尋結果">
              <li v-for="player in filteredPlayers" :key="player.playerId" class="player-item">
                <span class="avatar" aria-hidden="true">
                  <img v-if="avatarIsImage(player.avatar)" :src="player.avatar" alt="">
                  <span v-else>{{ player.avatar }}</span>
                </span>
                <span class="player-identity">
                  <span class="player-name">
                    {{ player.name }}
                    <span v-if="friendIdSet.has(player.playerId)" class="friend-mark">好友</span>
                  </span>
                  <span class="player-account">
                    <small>帳號</small>
                    {{ player.account }}
                  </span>
                </span>
                <button
                  class="select-button"
                  type="button"
                  :aria-label="`選擇 ${player.name}，帳號 ${player.account}`"
                  @click="emit('select', player)"
                >
                  選擇
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </li>
            </ul>

            <div v-else class="empty-state">
              <span class="empty-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="10.5" cy="10.5" r="6.5" stroke-width="1.5"/>
                  <path stroke-linecap="round" stroke-width="1.5" d="m15.2 15.2 5 5M8 10.5h5"/>
                </svg>
              </span>
              <strong>{{ emptyTitle }}</strong>
              <p>{{ emptyDescription }}</p>
            </div>
          </div>

          <footer class="safety-note">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 4.5 6v5.4c0 4.7 3.2 8.2 7.5 9.6 4.3-1.4 7.5-4.9 7.5-9.6V6L12 3Zm-3 9 2 2 4-4"/>
            </svg>
            <span>送出前請再次核對玩家暱稱與帳號，避免選錯收禮對象。</span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.player-search-enter-active,
.player-search-leave-active {
  transition: opacity 0.22s ease;
}

.player-search-enter-active .player-search-panel,
.player-search-leave-active .player-search-panel {
  transition: opacity 0.22s ease, transform 0.26s cubic-bezier(.22, 1, .36, 1);
}

.player-search-enter-from,
.player-search-leave-to {
  opacity: 0;
}

.player-search-enter-from .player-search-panel,
.player-search-leave-to .player-search-panel {
  opacity: 0;
  transform: translateY(16px) scale(0.975);
}

.player-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1140;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 50% 20%, rgba(91, 33, 182, 0.16), transparent 36%),
    rgba(5, 0, 15, 0.86);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.player-search-panel {
  position: relative;
  width: min(620px, 100%);
  max-height: min(760px, calc(100dvh - 40px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--color-text, #f3e8ff);
  background:
    linear-gradient(135deg, rgba(245, 200, 66, 0.07), transparent 23%),
    radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.18), transparent 31%),
    linear-gradient(155deg, #21103a 0%, #150729 52%, #0d0319 100%);
  border: 1px solid rgba(245, 200, 66, 0.3);
  border-radius: 26px;
  box-shadow:
    0 35px 100px rgba(0, 0, 0, 0.66),
    0 0 0 1px rgba(255, 255, 255, 0.025) inset;
  outline: none;
}

.player-search-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 28px;
  right: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 230, 145, 0.85), transparent);
  pointer-events: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-shrink: 0;
  padding: 24px 26px 15px;
}

.title-lockup {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.title-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #f5c842;
  background: linear-gradient(145deg, rgba(245, 200, 66, 0.16), rgba(245, 200, 66, 0.035));
  border: 1px solid rgba(245, 200, 66, 0.27);
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.title-icon svg {
  width: 24px;
  height: 24px;
}

.title-lockup p {
  margin: 0 0 3px;
  color: #f5c842;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.21em;
}

.title-lockup h2 {
  margin: 0;
  font-size: clamp(20px, 3vw, 25px);
  font-weight: 950;
  letter-spacing: 0.025em;
}

.close-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: rgba(243, 232, 255, 0.65);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.close-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: rotate(4deg);
}

.close-button svg {
  width: 18px;
  height: 18px;
}

.modal-description {
  margin: 0;
  padding: 0 26px 18px;
  color: rgba(216, 200, 229, 0.65);
  font-size: 12px;
  line-height: 1.65;
}

.directory-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  flex-shrink: 0;
  margin: 0 26px;
  padding: 5px;
  background: rgba(4, 0, 12, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.18);
  border-radius: 14px;
}

.directory-tabs > button {
  min-height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(216, 200, 229, 0.62);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.directory-tabs > button svg {
  width: 17px;
  height: 17px;
}

.directory-tabs > button.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.72), rgba(76, 29, 149, 0.78));
  border-color: rgba(192, 132, 252, 0.3);
  box-shadow: 0 6px 20px rgba(76, 29, 149, 0.27), inset 0 1px 0 rgba(255, 255, 255, 0.09);
}

.friend-count {
  min-width: 21px;
  padding: 2px 6px;
  color: rgba(245, 200, 66, 0.86);
  background: rgba(245, 200, 66, 0.09);
  border: 1px solid rgba(245, 200, 66, 0.14);
  border-radius: 999px;
  font-size: 9px;
  line-height: 1.3;
}

.directory-panel {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 18px 26px 0;
}

.search-controls {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 10px;
  flex-shrink: 0;
}

.search-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(168, 85, 247, 0.19);
  border-radius: 12px;
}

.search-mode button {
  min-height: 40px;
  color: rgba(216, 200, 229, 0.58);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.search-mode button.active {
  color: #261200;
  background: linear-gradient(180deg, #ffe995, #f5c842);
  box-shadow: 0 5px 14px rgba(245, 200, 66, 0.17);
}

.search-field {
  min-width: 0;
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(168, 85, 247, 0.23);
  border-radius: 12px;
  cursor: text;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.search-field:focus-within {
  background: rgba(255, 255, 255, 0.075);
  border-color: rgba(245, 200, 66, 0.48);
  box-shadow: 0 0 0 3px rgba(245, 200, 66, 0.07);
}

.search-field > svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: rgba(192, 132, 252, 0.76);
}

.search-field input {
  min-width: 0;
  width: 100%;
  color: #fff;
  background: none;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 13px;
}

.search-field input::placeholder {
  color: rgba(216, 200, 229, 0.43);
}

.search-field input::-webkit-search-cancel-button {
  display: none;
}

.search-field button {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: rgba(216, 200, 229, 0.65);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
}

.result-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 17px 2px 9px;
  color: rgba(216, 200, 229, 0.5);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.result-summary strong {
  color: rgba(245, 200, 66, 0.78);
  font-size: 10px;
}

.player-list {
  min-height: 0;
  display: grid;
  gap: 7px;
  overflow-y: auto;
  margin: 0;
  padding: 0 4px 5px 0;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.35) transparent;
}

.player-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 10px 11px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(168, 85, 247, 0.13);
  border-radius: 14px;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.player-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(192, 132, 252, 0.25);
  transform: translateY(-1px);
}

.avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.18), transparent 35%),
    linear-gradient(145deg, rgba(168, 85, 247, 0.32), rgba(76, 29, 149, 0.35));
  border: 1px solid rgba(192, 132, 252, 0.28);
  border-radius: 14px;
  font-size: 23px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.11);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-identity {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  color: #f8f0ff;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-mark {
  padding: 2px 6px;
  flex-shrink: 0;
  color: #d8b4fe;
  background: rgba(168, 85, 247, 0.11);
  border: 1px solid rgba(192, 132, 252, 0.18);
  border-radius: 999px;
  font-size: 8px;
  line-height: 1.4;
}

.player-account {
  overflow: hidden;
  color: rgba(216, 200, 229, 0.57);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-account small {
  margin-right: 5px;
  color: rgba(245, 200, 66, 0.64);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.select-button {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 12px;
  color: #321c00;
  background: linear-gradient(180deg, #ffe995, #f5c842);
  border: 1px solid rgba(255, 240, 180, 0.76);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(245, 200, 66, 0.13);
  font-size: 11px;
  font-weight: 950;
  transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
}

.select-button:hover {
  filter: brightness(1.06);
  box-shadow: 0 7px 20px rgba(245, 200, 66, 0.22);
  transform: translateY(-1px);
}

.select-button svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  min-height: 210px;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.empty-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  color: rgba(192, 132, 252, 0.62);
  background: rgba(168, 85, 247, 0.07);
  border: 1px dashed rgba(192, 132, 252, 0.25);
  border-radius: 18px;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-state strong {
  color: rgba(243, 232, 255, 0.88);
  font-size: 14px;
}

.empty-state p {
  max-width: 300px;
  margin: 6px 0 0;
  color: rgba(216, 200, 229, 0.47);
  font-size: 11px;
  line-height: 1.7;
}

.safety-note {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  margin-top: 16px;
  padding: 13px 26px 17px;
  color: rgba(216, 200, 229, 0.54);
  background: rgba(6, 1, 15, 0.35);
  border-top: 1px solid rgba(168, 85, 247, 0.12);
  font-size: 10px;
  line-height: 1.55;
}

.safety-note svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: rgba(245, 200, 66, 0.7);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid #f5c842;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .player-search-overlay {
    align-items: end;
    padding: 0;
  }

  .player-search-panel {
    width: 100%;
    max-height: 92dvh;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 24px 24px 0 0;
  }

  .modal-header {
    padding: 20px 19px 13px;
  }

  .title-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
  }

  .title-lockup p {
    letter-spacing: 0.16em;
  }

  .modal-description {
    padding: 0 19px 15px;
    font-size: 11px;
  }

  .directory-tabs {
    margin: 0 19px;
  }

  .directory-panel {
    padding: 15px 19px 0;
  }

  .search-controls {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .search-mode button {
    min-height: 34px;
  }

  .search-field {
    min-height: 46px;
  }

  .player-item {
    grid-template-columns: 43px minmax(0, 1fr) auto;
    gap: 9px;
    padding: 9px;
  }

  .avatar {
    width: 43px;
    height: 43px;
    border-radius: 12px;
    font-size: 21px;
  }

  .select-button {
    min-width: 42px;
    padding: 0 9px;
    font-size: 0;
  }

  .select-button svg {
    width: 17px;
    height: 17px;
  }

  .safety-note {
    margin-top: 12px;
    padding: 12px 19px calc(12px + env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-search-enter-active,
  .player-search-leave-active,
  .player-search-enter-active .player-search-panel,
  .player-search-leave-active .player-search-panel,
  .player-item,
  .select-button,
  .close-button {
    transition: none;
  }
}
</style>
