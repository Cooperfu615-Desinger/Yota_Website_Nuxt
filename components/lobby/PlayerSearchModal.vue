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
        class="modal-overlay player-search-overlay"
        role="presentation"
        @click.self="closeModal"
      >
        <section
          ref="dialogRef"
          class="modal-box player-search-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="player-search-title"
          aria-describedby="player-search-description"
          tabindex="-1"
          @keydown="handleDialogKeydown"
        >
          <div class="modal-inner player-search-panel">
            <button class="modal-close" type="button" aria-label="關閉玩家選擇視窗" @click="closeModal">×</button>
            <p class="modal-eyebrow">GIFT RECIPIENT</p>
            <h2 id="player-search-title" class="modal-title">選擇收禮玩家</h2>

            <p id="player-search-description" class="modal-description">
              使用暱稱或帳號找到指定玩家，確認身分後再送出贈禮申請。
            </p>

          <div class="login-tab-bar directory-tabs" role="tablist" aria-label="玩家來源">
            <button
              id="player-search-tab"
              ref="playerSearchTabRef"
              class="login-tab-btn"
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
              class="login-tab-btn"
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
                  class="btn-gold select-button"
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

          <div class="safety-note">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 4.5 6v5.4c0 4.7 3.2 8.2 7.5 9.6 4.3-1.4 7.5-4.9 7.5-9.6V6L12 3Zm-3 9 2 2 4-4"/>
            </svg>
            <span>送出前請再次核對玩家暱稱與帳號，避免選錯收禮對象。</span>
          </div>
          </div>
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Align this picker with the website authentication modal, rather than the app sheet. */
.player-search-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.player-search-box {
  width: min(600px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100dvh - 32px);
  overflow: hidden;
  outline: none;
}

.player-search-panel {
  width: 100%;
  height: min(700px, calc(100dvh - 62px));
  max-height: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(180deg, #8890ff 0%, #5a63e8 50%, #3f46aa 100%);
  border: 0;
  border-radius: 14px;
  box-shadow:
    0 0 0 1.5px rgba(255, 255, 255, 0.25),
    0 0 0 3px rgba(122, 131, 255, 0.75),
    0 4px 20px rgba(63, 70, 170, 0.4);
}

.modal-eyebrow {
  flex-shrink: 0;
  margin: 4px 0 3px;
  color: var(--color-gold);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-align: center;
}

.player-search-panel > .modal-title {
  flex-shrink: 0;
  margin: 0 0 10px;
}

.modal-description {
  flex-shrink: 0;
  max-width: 470px;
  margin: 0 auto 18px;
  padding: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.65;
  text-align: center;
}

.directory-tabs {
  width: 100%;
  height: 62px;
  display: flex;
  gap: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 10px;
  background: linear-gradient(180deg, #5f5ccd 0%, #707cff 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
}

.directory-tabs > .login-tab-btn {
  min-height: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #c3d2f6;
  background: transparent;
  border: 0;
  border-radius: 10px;
  box-shadow: none;
  font-size: 14px;
  font-weight: 700;
}

.directory-tabs > .login-tab-btn svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.directory-tabs > .login-tab-btn.active {
  color: #fff;
  background: linear-gradient(180deg, #58acff 0%, #5926f3 100%);
  border: 0;
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 -4px 0 rgba(62, 30, 167, 0.5),
    0 4px 20px rgba(13, 12, 67, 0.25);
}

.friend-count {
  min-width: 22px;
  padding: 2px 6px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  font-size: 10px;
}

.directory-panel {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 0 0;
}

.search-controls {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 10px;
  flex-shrink: 0;
}

.search-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 4px;
  background: rgba(25, 22, 98, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
}

.search-mode button {
  min-height: 40px;
  color: rgba(255, 255, 255, 0.62);
  background: transparent;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 800;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.search-mode button.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.search-field {
  min-width: 0;
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  background: rgba(10, 8, 50, 0.42);
  border: 1.5px solid rgba(255, 255, 255, 0.24);
  border-radius: 10px;
  cursor: text;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.search-field:focus-within {
  background: rgba(10, 8, 50, 0.52);
  border-color: rgba(255, 255, 255, 0.72);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
}

.search-field > svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.68);
}

.search-field input {
  min-width: 0;
  width: 100%;
  color: #fff;
  background: transparent;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 13px;
}

.search-field input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-field input::-webkit-search-cancel-button {
  display: none;
}

.search-field button {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.12);
  border: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
}

.result-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 14px 3px 8px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.result-summary strong {
  color: #fff;
  font-size: 11px;
}

.player-list {
  display: block;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  background: rgba(24, 20, 91, 0.26);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.45) transparent;
}

.player-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 0;
  transform: none;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.player-item:last-child {
  border-bottom: 0;
}

.player-item:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.13);
  transform: none;
}

.avatar {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  box-shadow: none;
  font-size: 21px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-identity {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-mark {
  padding: 2px 6px;
  flex-shrink: 0;
  color: #e8e8ff;
  background: rgba(52, 40, 177, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  font-size: 9px;
  line-height: 1.4;
}

.player-account {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.66);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-account small {
  margin-right: 5px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.select-button {
  min-height: 36px;
  padding: 0 16px;
  justify-content: center;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.select-button:hover {
  filter: none;
}

.select-button svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  min-height: 190px;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: rgba(24, 20, 91, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  text-align: center;
}

.empty-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.35);
  border-radius: 50%;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-state strong {
  color: #fff;
  font-size: 14px;
}

.empty-state p {
  max-width: 300px;
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  line-height: 1.7;
}

.safety-note {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  margin-top: 12px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(24, 20, 91, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  font-size: 10px;
  line-height: 1.55;
}

.safety-note svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: #b8ffe0;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .player-search-overlay {
    align-items: center;
    padding: 14px;
  }

  .player-search-box {
    width: min(600px, calc(100vw - 28px));
    max-height: calc(100dvh - 28px);
    border-radius: 20px;
    padding: 12px;
  }

  .player-search-panel {
    width: 100%;
    height: min(690px, calc(100dvh - 52px));
    max-height: none;
    border: 0;
    border-radius: 12px;
    padding: 24px 16px 18px;
  }

  .modal-eyebrow {
    margin-top: 1px;
  }

  .player-search-panel > .modal-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .modal-description {
    margin-bottom: 14px;
    font-size: 11px;
  }

  .directory-tabs {
    height: 56px;
    margin: 0;
    padding: 6px 8px;
    border-radius: 15px;
  }

  .directory-tabs > .login-tab-btn {
    min-height: 42px;
    height: 42px;
    font-size: 12px;
  }

  .directory-panel {
    padding: 12px 0 0;
  }

  .search-controls {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .search-mode button {
    min-height: 32px;
  }

  .search-field {
    min-height: 44px;
  }

  .player-item {
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 9px;
    padding: 9px 10px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 19px;
  }

  .select-button {
    min-width: auto;
    min-height: 34px;
    padding: 0 11px;
    font-size: 11px;
  }

  .select-button svg {
    width: 13px;
    height: 13px;
  }

  .safety-note {
    margin-top: 10px;
    padding: 9px 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-search-enter-active,
  .player-search-leave-active,
  .player-search-enter-active .player-search-panel,
  .player-search-leave-active .player-search-panel,
  .player-item,
  .select-button,
  .modal-close {
    transition: none;
  }

  .player-search-box {
    animation: none;
  }
}
</style>
