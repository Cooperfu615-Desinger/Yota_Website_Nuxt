<script setup lang="ts">
import { siteContent, type GameItem, type ShortcutGuide } from '~/data/siteContent'

type TutorialTab = 'games' | 'features' | 'install' | 'shortcut'
type ShortcutGuideKey = ShortcutGuide['key']
const activeTab = ref<TutorialTab>('games')
const activeShortcutGuide = ref<ShortcutGuideKey>('ios')
const { isLoggedIn, openLogin } = useAppState()
const router = useRouter()

const games: GameItem[] = [...siteContent.lobbyGames] as GameItem[]
const {
  activeCategory: gameCategory,
  searchQuery: gameSearch,
  filteredGames,
} = useGameFilter(games)
const shortcutGuides: ShortcutGuide[] = [...siteContent.shortcutGuides] as ShortcutGuide[]
const currentShortcutGuide = computed(
  () => shortcutGuides.find((guide) => guide.key === activeShortcutGuide.value) ?? shortcutGuides[0]
)

const features = [
  { icon: '🎰', title: '保留座功能', desc: '暫時離開不怕位置被搶，系統自動保留您的遊戲席位長達 10 分鐘。' },
  { icon: '💬', title: '即時聊天室', desc: '與其他玩家即時互動，分享喜悅、交流技巧，讓遊戲更有趣。' },
  { icon: '🏆', title: '即時排行榜', desc: '即時更新的排行榜讓您掌握競爭狀況，激勵您挑戰頂端。' },
  { icon: '🔔', title: '推播通知',   desc: '重要活動、中獎通知不錯過，第一時間掌握最新資訊。' },
  { icon: '🔒', title: 'SSL 安全加密', desc: '所有交易採用銀行級 256-bit SSL 加密，保障您的資金安全。' },
]

const iosSteps = [
  '點選頁面上方「iOS 下載」按鈕',
  '出現「是否要下載設定描述檔？」，點選「允許」',
  '前往 手機設定 → 一般 → VPN 與裝置管理',
  '點選企業應用程式 → 點選「信任」',
  '返回桌面，找到已安裝的 APP 圖示，即可開啟',
]

const androidSteps = [
  '點選頁面下方「Android 下載」按鈕',
  '如出現「此類型檔案可能會損害裝置」，點選「仍要下載」',
  '完成下載後，點選 APK 檔案進行安裝（如要求允許未知來源，請在設定中開啟）',
]

function handlePlay(gameKey: string, mode: 'real' | 'demo') {
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin()
    return
  }
  router.push(`/lobby?game=${gameKey}&mode=${mode}`)
}
</script>

<template>
  <div class="pb-4">
    <div class="px-4 pt-4 pb-2">
      <h1 class="section-title">新手教學</h1>
    </div>

    <!-- Tab -->
    <div class="px-4 mb-4">
      <div class="tab-bar" role="tablist">
        <button class="tab-btn" :class="{ active: activeTab === 'games' }"    role="tab" :aria-selected="activeTab === 'games'"    @click="activeTab = 'games'">遊戲介紹</button>
        <button class="tab-btn" :class="{ active: activeTab === 'features' }" role="tab" :aria-selected="activeTab === 'features'" @click="activeTab = 'features'">APP 特色</button>
        <button class="tab-btn" :class="{ active: activeTab === 'install' }"  role="tab" :aria-selected="activeTab === 'install'"  @click="activeTab = 'install'">安裝教學</button>
        <button class="tab-btn" :class="{ active: activeTab === 'shortcut' }" role="tab" :aria-selected="activeTab === 'shortcut'" @click="activeTab = 'shortcut'">新增捷徑</button>
      </div>
    </div>

    <Transition name="tab-fade" mode="out-in">
      <!-- 遊戲介紹 -->
      <div v-if="activeTab === 'games'" key="games" class="px-4">
        <SharedGameFilterBar
          v-model:category="gameCategory"
          v-model:search="gameSearch"
        />
        <div class="game-count">共 {{ filteredGames.length }} 款遊戲</div>

        <div v-if="filteredGames.length" class="game-grid tutorial-game-grid">
          <LobbyGameCard
            v-for="game in filteredGames"
            :key="game.key"
            :game="game"
            @play="handlePlay"
          />
        </div>
        <div v-else class="game-grid-empty">
          <p>找不到相符的遊戲</p>
        </div>
      </div>

      <!-- APP 特色 -->
      <div v-else-if="activeTab === 'features'" key="features" class="px-4 grid gap-4 lg:grid-cols-2">
        <div v-for="feat in features" :key="feat.title" class="card-purple p-4 flex gap-4 items-start">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style="background:rgba(168,85,247,0.15);" aria-hidden="true">{{ feat.icon }}</div>
          <div>
            <h2 class="font-bold mb-1">{{ feat.title }}</h2>
            <p class="text-sm" style="color:var(--color-text-muted);">{{ feat.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 安裝教學 -->
      <div v-else-if="activeTab === 'install'" key="install" class="px-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <!-- iOS -->
        <section class="mb-6" aria-labelledby="ios-heading">
          <div class="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <h2 id="ios-heading" class="section-title">iOS 安裝步驟</h2>
          </div>
          <div class="card-purple p-4 flex flex-col gap-4">
            <div v-for="(step, i) in iosSteps" :key="i" class="step-item">
              <div class="step-num" :aria-label="`步驟${i + 1}`">{{ i + 1 }}</div>
              <p class="text-sm pt-0.5" style="color:var(--color-text-muted);">{{ step }}</p>
            </div>
          </div>
          <div class="flex gap-2 mt-3 overflow-x-auto">
            <div v-for="n in 4" :key="n" class="w-32 h-56 flex-shrink-0 rounded-xl flex items-center justify-center text-xs" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);">截圖 {{ n }}</div>
          </div>
          <button class="btn-gold w-full justify-center mt-4">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            iOS 下載
          </button>
        </section>

        <!-- Android -->
        <section aria-labelledby="android-heading">
          <div class="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="#3DDC84" aria-hidden="true"><path d="M17.523 15.341a4.58 4.58 0 0 0 2.492-4.004 4.594 4.594 0 0 0-2.492-4.004l1.005-1.742a.25.25 0 0 0-.096-.341.251.251 0 0 0-.341.096l-1.02 1.764A9.427 9.427 0 0 0 12.5 6.25a9.43 9.43 0 0 0-4.571 1.856L6.908 4.342a.25.25 0 0 0-.341-.096.25.25 0 0 0-.096.341l1.005 1.742A4.594 4.594 0 0 0 4.985 10.337a4.579 4.579 0 0 0 2.491 4.004L6.47 16.083a.25.25 0 1 0 .438.245l1.01-1.755a9.44 9.44 0 0 0 4.582 1.177 9.44 9.44 0 0 0 4.582-1.177l1.01 1.755a.251.251 0 0 0 .438-.245l-1.007-1.742zM9.5 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
            <h2 id="android-heading" class="section-title">Android 安裝步驟</h2>
          </div>
          <div class="card-purple p-4 flex flex-col gap-4">
            <div v-for="(step, i) in androidSteps" :key="i" class="step-item">
              <div class="step-num" :aria-label="`步驟${i + 1}`">{{ i + 1 }}</div>
              <p class="text-sm pt-0.5" style="color:var(--color-text-muted);">{{ step }}</p>
            </div>
          </div>
          <button class="btn-gold w-full justify-center mt-4">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a4.58 4.58 0 0 0 2.492-4.004 4.594 4.594 0 0 0-2.492-4.004l1.005-1.742a.25.25 0 0 0-.096-.341.251.251 0 0 0-.341.096l-1.02 1.764A9.427 9.427 0 0 0 12.5 6.25a9.43 9.43 0 0 0-4.571 1.856L6.908 4.342a.25.25 0 0 0-.341-.096.25.25 0 0 0-.096.341l1.005 1.742A4.594 4.594 0 0 0 4.985 10.337a4.579 4.579 0 0 0 2.491 4.004L6.47 16.083a.25.25 0 1 0 .438.245l1.01-1.755a9.44 9.44 0 0 0 4.582 1.177 9.44 9.44 0 0 0 4.582-1.177l1.01 1.755a.251.251 0 0 0 .438-.245l-1.007-1.742zM9.5 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
            Android 下載
          </button>
        </section>
      </div>

      <!-- 新增捷徑 -->
      <div v-else key="shortcut" class="px-4">
        <section class="card-purple p-4 lg:p-5 shortcut-panel" aria-labelledby="shortcut-heading">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
            <div>
              <p class="text-xs font-bold tracking-[0.18em] uppercase mb-1" style="color:var(--color-gold);">Shortcut Guide</p>
              <h2 id="shortcut-heading" class="text-xl font-black">建立捷徑教學</h2>
              <p class="text-sm mt-1" style="color:var(--color-text-muted);">
                將巨亨ONLINE 加入主畫面、Dock 或桌面，之後就能像 App 一樣快速開啟。
              </p>
            </div>
            <div class="shortcut-badge">iOS / Android / Chrome / Safari</div>
          </div>

          <div class="shortcut-platform-tabs" role="tablist" aria-label="捷徑教學平台">
            <button
              v-for="guide in shortcutGuides"
              :key="guide.key"
              class="shortcut-platform-btn"
              :class="{ active: activeShortcutGuide === guide.key }"
              type="button"
              role="tab"
              :aria-selected="activeShortcutGuide === guide.key"
              @click="activeShortcutGuide = guide.key"
            >
              {{ guide.label }}
            </button>
          </div>

          <div class="shortcut-content">
            <div class="shortcut-copy">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div class="shortcut-info-card">
                  <span>適用裝置</span>
                  <strong>{{ currentShortcutGuide.platform }}</strong>
                </div>
                <div class="shortcut-info-card">
                  <span>建議瀏覽器</span>
                  <strong>{{ currentShortcutGuide.browser }}</strong>
                </div>
              </div>

              <div class="flex flex-col gap-4">
                <div v-for="(step, i) in currentShortcutGuide.steps" :key="`${currentShortcutGuide.key}-${i}`" class="step-item">
                  <div class="step-num" :aria-label="`步驟${i + 1}`">{{ i + 1 }}</div>
                  <p class="text-sm pt-0.5" style="color:var(--color-text-muted);">{{ step }}</p>
                </div>
              </div>

              <p class="shortcut-note">
                {{ currentShortcutGuide.note }}
              </p>
              <p class="shortcut-note subtle">
                不同瀏覽器版本的選單名稱可能略有差異，請以實際畫面顯示為準。
              </p>
            </div>

            <div class="shortcut-visual" aria-label="捷徑教學示意圖占位">
              <div class="shortcut-visual-top">
                <span>{{ currentShortcutGuide.label }}</span>
                <span>{{ currentShortcutGuide.browser }}</span>
              </div>
              <div class="shortcut-visual-body">
                <div class="shortcut-phone-frame">
                  <div class="shortcut-screen-glow"></div>
                  <span>美術示意圖</span>
                </div>
              </div>
              <p>此區後續可替換為 {{ currentShortcutGuide.label }} 操作截圖。</p>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }

.shortcut-panel {
  position: relative;
  overflow: hidden;
}

.shortcut-panel::before {
  content: '';
  position: absolute;
  inset: -40% -10% auto auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(245, 200, 66, 0.16), transparent 62%);
  pointer-events: none;
}

.shortcut-badge {
  align-self: flex-start;
  padding: 8px 12px;
  border: 1px solid rgba(245, 200, 66, 0.28);
  border-radius: 999px;
  color: var(--color-gold);
  background: rgba(245, 200, 66, 0.08);
  font-size: 12px;
  font-weight: 800;
}

.shortcut-platform-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: rgba(15, 0, 32, 0.65);
}

.shortcut-platform-btn {
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  color: var(--color-text-muted);
  background: transparent;
  font-weight: 900;
  transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.shortcut-platform-btn:hover {
  color: var(--color-text);
  transform: translateY(-1px);
}

.shortcut-platform-btn.active {
  color: #1a0a00;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  box-shadow: 0 8px 22px rgba(245, 200, 66, 0.22);
}

.shortcut-content {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.shortcut-info-card {
  padding: 12px;
  border: 1px solid rgba(168, 85, 247, 0.22);
  border-radius: 16px;
  background: rgba(15, 0, 32, 0.42);
}

.shortcut-info-card span {
  display: block;
  margin-bottom: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.shortcut-info-card strong {
  color: var(--color-text);
  font-size: 15px;
}

.shortcut-note {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid rgba(245, 200, 66, 0.18);
  border-radius: 14px;
  color: rgba(243, 232, 255, 0.82);
  background: rgba(245, 200, 66, 0.06);
  font-size: 13px;
  line-height: 1.7;
}

.shortcut-note.subtle {
  margin-top: 8px;
  border-color: rgba(168, 85, 247, 0.18);
  background: rgba(168, 85, 247, 0.06);
  color: var(--color-text-muted);
}

.shortcut-visual {
  border: 1px solid rgba(168, 85, 247, 0.24);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(124, 58, 237, 0.18), rgba(15, 0, 32, 0.8)),
    radial-gradient(circle at 20% 20%, rgba(245, 200, 66, 0.14), transparent 36%);
  overflow: hidden;
}

.shortcut-visual-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 900;
}

.shortcut-visual-body {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.shortcut-phone-frame {
  position: relative;
  width: min(190px, 70vw);
  aspect-ratio: 9 / 16;
  border: 1px solid rgba(245, 200, 66, 0.28);
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 0, 32, 0.95), rgba(91, 33, 182, 0.34));
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
  overflow: hidden;
}

.shortcut-screen-glow {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  background: rgba(245, 200, 66, 0.16);
  filter: blur(22px);
}

.shortcut-phone-frame span {
  position: relative;
}

.shortcut-visual p {
  padding: 0 16px 16px;
  color: var(--color-text-muted);
  font-size: 12px;
  text-align: center;
}

@media (min-width: 768px) {
  .shortcut-platform-tabs {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .shortcut-content {
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
    align-items: stretch;
  }
}
</style>
