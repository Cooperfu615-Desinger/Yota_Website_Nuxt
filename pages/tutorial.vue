<script setup lang="ts">
useSeoMeta({
  title: '新手教學 — 巨亨ONLINE | APP下載與遊戲介紹',
  description: '巨亨ONLINE新手教學！了解各種遊戲玩法、APP下載安裝步驟（iOS/Android），快速上手開始試玩。',
  ogTitle: '新手教學 — 巨亨ONLINE | APP下載教學',
})

type TutorialTab = 'games' | 'features' | 'install'
const activeTab = ref<TutorialTab>('games')

// 遊戲試玩 Modal
const showTrialModal = ref(false)
const trialGame = ref<{ name: string; url: string } | null>(null)

function openTrial(name: string, url = 'https://example.com/trial') {
  trialGame.value = { name, url }
  showTrialModal.value = true
}
function closeTrial() {
  showTrialModal.value = false
  trialGame.value = null
}

const games = [
  { name: '水果老虎機', desc: '經典水果符號，多線賠率', badge: '熱門', rtp: '96.5%', color: '#F5C842' },
  { name: '招財貓百家樂', desc: '亞洲最受歡迎桌遊', badge: '新上線', rtp: '98.9%', color: '#60A5FA' },
  { name: '海洋捕魚機', desc: '射擊系遊戲，越大越賺', badge: null, rtp: '95.8%', color: '#4ade80' },
  { name: '麻將胡了', desc: '麻將主題老虎機', badge: null, rtp: '96.2%', color: '#F87171' },
  { name: '神龍傳奇', desc: '亞洲神話主題大獎機', badge: '熱門', rtp: '95.5%', color: '#A855F7' },
  { name: '魚蝦蟹', desc: '傳統骰子遊戲，簡單好玩', badge: null, rtp: '97.1%', color: '#FBBF24' },
]

const features = [
  { icon: '🎰', title: '保留座功能', desc: '暫時離開不怕位置被搶，系統自動保留您的遊戲席位長達 10 分鐘。' },
  { icon: '💬', title: '即時聊天室', desc: '與其他玩家即時互動，分享喜悅、交流技巧，讓遊戲更有趣。' },
  { icon: '🏆', title: '即時排行榜', desc: '即時更新的排行榜讓您掌握競爭狀況，激勵您挑戰頂端。' },
  { icon: '🔔', title: '推播通知', desc: '重要活動、中獎通知不錯過，第一時間掌握最新資訊。' },
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
      </div>
    </div>

    <Transition name="tab-fade" mode="out-in">
      <!-- 遊戲介紹 -->
      <div v-if="activeTab === 'games'" key="games" class="px-4">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <article
            v-for="game in games"
            :key="game.name"
            class="card-purple overflow-hidden cursor-pointer group"
            :aria-label="`${game.name}，RTP ${game.rtp}`"
          >
            <!-- 遊戲封面佔位（美術出圖替換） -->
            <div class="aspect-video flex items-center justify-center relative" :style="{ background: `linear-gradient(135deg, var(--color-purple-dark), ${game.color}22)` }">
              <span class="text-4xl" aria-hidden="true">🎮</span>
              <span v-if="game.badge" class="absolute top-1.5 left-1.5 tag-new" :class="game.badge === '新上線' ? 'tag-hot' : ''">{{ game.badge }}</span>
              <!-- TODO: 替換為 <img :src="`/images/games/${game.key}.jpg`" :alt="game.name"> -->
            </div>
            <div class="p-3">
              <h2 class="font-bold text-sm mb-0.5">{{ game.name }}</h2>
              <p class="text-xs" style="color:var(--color-text-muted);">{{ game.desc }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs" style="color:var(--color-purple-light);">RTP {{ game.rtp }}</span>
                <button
                  class="text-xs px-3 py-1 rounded-full font-bold"
                  style="background:var(--color-gold); color:#1a0a00;"
                  @click="openTrial(game.name)"
                >
                  試玩
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- APP 特色 -->
      <div v-else-if="activeTab === 'features'" key="features" class="px-4 grid gap-4 lg:grid-cols-2">
        <div v-for="feat in features" :key="feat.title" class="card-purple p-4 flex gap-4 items-start">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style="background:rgba(168,85,247,0.15);" aria-hidden="true">{{ feat.icon }}</div>
          <div>
            <h2 class="font-bold mb-1">{{ feat.title }}</h2>
            <p class="text-sm" style="color:var(--color-text-muted);">{{ feat.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 安裝教學 -->
      <div v-else key="install" class="px-4 lg:grid lg:grid-cols-2 lg:gap-6">
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
          <!-- TODO: 放置真實 iOS 截圖 -->
          <div class="flex gap-2 mt-3 overflow-x-auto">
            <div v-for="n in 4" :key="n" class="w-32 h-56 flex-shrink-0 rounded-xl flex items-center justify-center text-xs" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);">
              截圖 {{ n }}
            </div>
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
    </Transition>

    <!-- 遊戲試玩 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showTrialModal && trialGame" class="modal-overlay" role="dialog" :aria-label="`${trialGame.name} 試玩`" @click.self="closeTrial">
          <div class="modal-box modal-box-center" style="width:calc(100% - 32px);">
            <button class="modal-close" aria-label="關閉試玩" @click="closeTrial">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <h2 class="modal-title">{{ trialGame.name }} — 試玩</h2>
            <div class="game-trial-wrap mb-3">
              <iframe :src="trialGame.url" :title="`${trialGame.name} 試玩`" allow="fullscreen" sandbox="allow-scripts allow-same-origin" />
            </div>
            <p class="text-center text-xs" style="color:var(--color-text-muted);">試玩模式，不消耗真實餘額</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
