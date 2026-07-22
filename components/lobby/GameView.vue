<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'
import { getGameWalletLabel, type GameWalletKey } from '~/utils/gameWallets'

const props = defineProps<{
  gameKey: string
  mode: 'real' | 'demo'
  wallet?: GameWalletKey | null
  machineId?: string
}>()
const emit  = defineEmits<{ close: []; switchMode: ['real' | 'demo'] }>()

const allGames: GameItem[] = [...siteContent.games, ...siteContent.lobbyGames] as GameItem[]
const game = computed(() => allGames.find(g => g.key === props.gameKey))
const currentWalletLabel = computed(() => getGameWalletLabel(props.wallet))

// 實際整合時換成真實遊戲 URL
const gameUrl = computed(() =>
  props.mode === 'demo'
    ? `https://example.com/demo/${props.gameKey}`
    : `https://example.com/real/${props.gameKey}`
)

// 分類中文對應
const categoryLabel: Record<string, string> = {
  slots:    '老虎機',
  baccarat: '百家樂',
  fish:     '捕魚機',
  dice:     '骰子',
  cards:    '棋牌',
}

// 遊戲詳情描述（示意，後續由後台 API 補充）
const descMap: Record<string, string> = {
  'fruit-slots':       '水果老虎機是最經典的老虎機遊戲之一，採用多線設計帶來更高的中獎機率。轉動轉輪，讓水果符號排成一線，即可獲得豐厚獎賞！',
  'dragon-legend':     '神龍傳奇以亞洲神話為主題，配備自由旋轉與連乘倍率機制。集齊神龍符號可觸發大獎彩蛋，帶給玩家無盡的驚喜體驗。',
  'lucky-cat-slots':   '招財貓老虎機融合日式幸運元素，Free Spin 功能可讓獎金翻倍。在每次旋轉中感受招財貓帶來的好運，輕鬆贏取大獎。',
  'mahjong-wins':      '麻將胡了將傳統麻將與現代老虎機完美結合，轉動轉輪讓麻將牌排成胡牌組合。充滿東方色彩的視覺體驗讓每次旋轉都充滿期待。',
  'treasure-hunt':     '尋寶大冒險帶你踏上尋寶之旅，豐富的彩蛋機制讓每次旋轉都充滿驚喜。找到隱藏寶藏，解鎖特殊加成與免費旋轉功能。',
  'golden-phoenix':    '金鳳凰以東方神話為背景，搭配驚人的倍率機制。在自由旋轉期間，火焰鳳凰符號可帶來連環大獎，體驗傳奇財富的誕生。',
  'zeus-thunder':      '宙斯雷神以希臘神話為主題，當宙斯降下雷霆時觸發免費旋轉。多種特殊符號組合帶來爆炸性的獎金體驗。',
  'candy-blast':       '糖果爆爆樂採用創新 Megaways™ 玩法，每次旋轉都提供不同的連線方式。甜蜜主題搭配層疊符號機制，讓中獎機會無限延伸。',
  'lucky-cat-baccarat':'招財貓百家樂結合傳統百家樂與趣味招財主題，提供多種旁注選項。高達 98.9% 的超高 RTP 讓玩家享有最大勝率優勢。',
  'classic-baccarat':  '經典百家樂採用正宗六副牌設計，開牌速度快、規則清晰。最受亞洲玩家喜愛的桌遊之一，簡單易懂但策略深度無窮。',
  'speed-baccarat':    '極速百家樂每局僅需 30 秒，快節奏的遊戲體驗讓每一分鐘都充滿刺激。適合喜歡高效率遊戲體驗的玩家。',
  'dragon-tiger':      '龍虎鬥規則極為簡單：一張牌決定勝負，龍或虎哪方點數大即獲勝。快速刺激的遊戲節奏讓每局都充滿張力。',
  'ocean-fish':        '海洋捕魚機讓你化身為深海獵人，瞄準各式各樣的海洋生物獲得獎金。魚越大、獎金越高，配合特殊武器讓戰績翻倍！',
  'deep-sea':          '深海獵人帶你探索神秘的深海世界，擊敗深海 Boss 可獲得超高倍率獎金。累積能量條並啟動必殺技，一擊清場贏得巨額獎勵。',
  'dragon-fish':       '龍宮捕魚以中國神話龍宮為舞台，配備多種神器武器與特殊技能。集中火力攻擊神龍，解鎖傳說級別的豐厚獎賞。',
  'neon-fish':         '霓虹捕魚以炫目的霓虹燈效為主題，特殊連鎖武器可一次清除大範圍目標。華麗的視覺效果搭配爽快的射擊手感。',
  'fish-shrimp-crab':  '魚蝦蟹是傳統民間骰子遊戲的數位化版本，選擇你看好的圖案下注，三顆骰子開出越多該圖案獎金越高，簡單有趣！',
  'sic-bo':            '骰寶提供豐富多樣的下注選項，從簡單大小到特定點數組合應有盡有。靈活的策略搭配多樣玩法，讓每一擲都充滿可能。',
  'roulette':          '歐式輪盤採用單零設計，提供更高的理論勝率。從直注到外注多種選擇，運用策略系統地攻略轉盤，追求最高回報。',
  'andar-bahar':       'Andar Bahar 是源自印度的傳統紙牌遊戲，規則簡單卻充滿魅力。預測目標牌出現在 Andar（內）或 Bahar（外），猜中即贏！',
  'three-card':        '三公撲克三張牌見高下，快速刺激。比較莊閒點數，搭配旁注玩法讓每局更多驚喜，是最受歡迎的東方撲克遊戲之一。',
  'texas-holdem':      '德州撲克是全球最受歡迎的撲克遊戲，考驗玩家的心理戰術與策略思維。精通手牌組合與下注時機，在牌桌上成為最強王者。',
  'pai-gow':           '牌九源自中國的傳統骨牌遊戲，以深厚的策略性著稱。將七張牌分成兩手，同時擊敗莊家的兩手才能獲得全額賠率。',
  'teen-patti':        'Teen Patti 是南亞最流行的紙牌遊戲，規則類似三張牌撲克。考驗玩家的膽識與判斷力，享受緊張刺激的虛張聲勢博弈體驗。',
}

const gameDesc = computed(() =>
  game.value ? (descMap[game.value.key] ?? `${game.value.name} 是一款精彩的${categoryLabel[game.value.category] ?? ''}遊戲，由 ${game.value.provider} 提供。`) : ''
)

// 遊戲規則說明
const rulesMap: Record<string, string> = {
  // ── 老虎機 ──
  'fruit-slots':
    '1. 選擇下注金額，點擊「旋轉」開始遊戲。\n2. 符號從左至右排列，滿足賠付線組合即獲獎。\n3. 出現 Wild 符號可替代任意符號完成連線。\n4. 出現 Scatter 符號（3 個以上）觸發免費旋轉，免費旋轉期間獎金翻倍。\n5. 最高單次獲獎為下注額的 5,000 倍。',
  'dragon-legend':
    '1. 選擇下注金額與賠付線數，點擊旋轉。\n2. 神龍 Wild 可替代所有普通符號並帶有 2x 倍率加成。\n3. 出現 3 個以上寶珠 Scatter 觸發龍之旋轉（免費旋轉）。\n4. 免費旋轉期間，每次觸發神龍符號可重新計算倍率，最高累積至 8,888 倍。\n5. 連續觸發免費旋轉次數無上限。',
  'lucky-cat-slots':
    '1. 採用 243 連線方式，符號在相鄰滾輪上出現即可獲獎（不限特定線路）。\n2. 招財貓 Wild 出現在第 2、3、4 滾輪，可擴展至整列。\n3. 3 個以上 Scatter 觸發 Free Spin（8～20 次），期間 Wild 黏滯不移動。\n4. Free Spin 可重複觸發，最高再追加 20 次。',
  'mahjong-wins':
    '1. 採用 4,096 連線設計，只需在相鄰滾輪上出現相同牌即可獲獎。\n2. 萬字 Wild 可替代所有普通符號。\n3. 出現 3 個以上紅中 Scatter 觸發免費旋轉（10 次起跳）。\n4. 免費旋轉期間，連線符號消除後上方符號下落，可產生連鎖獲獎。',
  'treasure-hunt':
    '1. 標準 20 線老虎機，從左至右計算連線。\n2. 寶圖 Wild 可擴展至整列，並觸發重新旋轉。\n3. 收集 5 個藏寶線索符號（不分位置）可進入彩蛋選寶箱環節。\n4. 選寶箱可獲得即時現金獎或觸發免費旋轉（最多 25 次）。\n5. 免費旋轉期間所有獎金 ×3 計算。',
  'golden-phoenix':
    '1. 50 線高波動老虎機，符號由左至右連線計算。\n2. 火焰鳳凰 Wild 出現時自動展開至 3×3 大 Wild，並觸發 3 次重旋。\n3. Scatter 出現 3 個以上觸發鳳凰飛翔（免費旋轉 12 次）。\n4. 免費旋轉期間所有 Wild 均為黏滯狀態，每次觸發再增加 3 次。\n5. 最高倍率可達 20,000 倍。',
  'zeus-thunder':
    '1. 25 線神話老虎機，符號由左至右計算。\n2. 宙斯 Wild 隨機出現並將整列變為 Wild，帶有雷電特效。\n3. 閃電 Scatter 出現 3 個以上觸發免費旋轉（10 次）。\n4. 免費旋轉期間出現宙斯符號，可再追加旋轉次數（最多額外 +20）。',
  'candy-blast':
    '1. 採用 Megaways™ 系統，每次旋轉最高提供 117,649 種連線方式。\n2. 串聯中獎（Cascade）：獲獎符號消除後，上方符號落下可產生連鎖。\n3. 連鎖達 4 次以上觸發倍率計量器，最高 10x 連鎖倍率。\n4. Scatter 出現 4 個以上進入 Free Spins（12 次），倍率計量器不重置。',
  // ── 百家樂 ──
  'lucky-cat-baccarat':
    '1. 基本規則與傳統百家樂相同：莊、閒各發 2～3 張牌，靠近 9 點者獲勝。\n2. 可下注「莊」、「閒」或「和局」；「和局」賠率 8:1。\n3. 特色旁注：招財貓符號隨機觸發 2x～5x 獎金加成。\n4. 另有對子旁注（莊對/閒對），賠率 11:1。',
  'classic-baccarat':
    '1. 使用 6 副牌，每局發 2～3 張牌，A=1，2～9 按面值，10/J/Q/K=0。\n2. 牌值超過 9 時取個位數（如 7+6=13 → 3 點）。\n3. 閒方先補牌：若點數為 0～5 則補牌，6～7 不補，8～9 為天牌停牌。\n4. 莊方是否補牌視閒方第三張牌與自身點數而定（依標準規則表）。\n5. 莊贏賠率 0.95:1（含 5% 佣金），閒贏 1:1，和局 8:1。',
  'speed-baccarat':
    '1. 規則與經典百家樂相同，但每局限時 27 秒（含下注時間 12 秒）。\n2. 荷官快速發牌，所有牌面朝上不翻牌，直接宣告結果。\n3. 每小時可玩局數約為傳統百家樂的 2 倍。',
  'dragon-tiger':
    '1. 龍方與虎方各發 1 張牌，點數較高者獲勝（A 為最小，K 為最大）。\n2. 下注「龍」或「虎」獲勝，賠率 1:1（平局時退回 50%）。\n3. 下注「和局」賠率 8:1。\n4. 可加注「套裝」（同花色）、「大/小」等旁注選項。',
  // ── 捕魚機 ──
  'ocean-fish':
    '1. 使用搖桿或點擊屏幕瞄準並發射子彈，擊中魚即可獲得對應籌碼。\n2. 不同魚種有不同的倍率（小魚 ×1～×5，大魚 ×50～×200）。\n3. 出現 Boss 魚（章魚、鯊魚）時，多人集火可獲得最高倍率。\n4. 特殊武器（魚雷/炸彈）可一次擊中大範圍目標，需額外扣除砲彈費用。',
  'deep-sea':
    '1. 基本射擊與海洋捕魚機相同，但加入 Boss 關卡機制。\n2. 累積能量條（擊中普通魚填充）達到上限可啟動必殺技，清屏並計算全部獎金。\n3. 深海 Boss（龍目烏賊、發光巨魚）出現時，倍率高達 ×2,000。\n4. 特殊活動時段出現「彩金魚」，擊中即中彩金池獎金。',
  'dragon-fish':
    '1. 瞄準龍宮各式生物射擊，倍率從 ×2 至 ×3,000 不等。\n2. 收集龍鱗碎片（擊中普通魚隨機掉落）可觸發龍神模式。\n3. 龍神模式持續 30 秒，全場魚倍率提升 ×3。\n4. 神器武器（龍神炮/海嘯波）效果覆蓋全屏，費用較高但擊中率大幅提升。',
  'neon-fish':
    '1. 霓虹主題射擊遊戲，標準射擊方式同其他捕魚機。\n2. 連鎖武器：命中一條魚後，電流傳導至附近魚群並一同計算獎金。\n3. 累積霓虹能量條，觸發「霓虹爆發」——畫面所有魚倍率提升並自動計算獎金。\n4. 特殊「幻彩魚群」出現時，擊中任意一條即觸發群組連帶獎金。',
  // ── 骰子 ──
  'fish-shrimp-crab':
    '1. 三顆骰子各有 6 種圖案（魚、蝦、蟹、葫蘆、硬幣、雞）。\n2. 下注任一圖案；開出該圖案的骰子數越多，賠率越高（1 個=1:1，2 個=2:1，3 個=3:1）。\n3. 可同時下注多個圖案，也可下注「三同」（三顆相同圖案）賠率 24:1。\n4. 每局開盤時間約 30 秒。',
  'sic-bo':
    '1. 三顆骰子搖出結果，可下注的選項包含：大（11～17）/小（4～10）、單/雙、指定點數、對子、三同等。\n2. 大/小賠率 1:1（三顆相同點數視為莊贏）。\n3. 指定三顆骰子點數（圍骰）賠率最高達 150:1～180:1。\n4. 策略玩法：分散下注大/小與特定組合，可在不同結果下保持穩定回報。',
  'roulette':
    '1. 歐式輪盤含 0～36 共 37 個號碼（單零設計，理論 RTP 97.3%）。\n2. 內注：直注（35:1）、分注（17:1）、街注（11:1）、角注（8:1）、線注（5:1）。\n3. 外注：紅/黑（1:1）、單/雙（1:1）、大/小（1:1）、列注（2:1）、打注（2:1）。\n4. 下注時間結束後荷官放球，球落點即為中獎號碼。',
  'andar-bahar':
    '1. 荷官翻出一張「目標牌」，玩家預測下一張相同點數的牌出現在「Andar（左）」還是「Bahar（右）」。\n2. 基本賠率：Andar 獲勝賠 0.9:1，Bahar 獲勝賠 1:1。\n3. 若目標牌為黑色，Andar 先發牌；目標牌為紅色則 Bahar 先發牌。\n4. 另有旁注：猜測需發幾張牌才出現目標點數（賠率最高 90:1）。',
  // ── 棋牌 ──
  'three-card':
    '1. 莊閒各發 3 張牌，比較所有牌的點數總和，靠近 9 點者獲勝（取個位數）。\n2. 點數計算：A=1，2～9 按面值，10/J/Q/K=0。\n3. 旁注選項：天牌（3 張皆為 9 點，賠率 20:1）、豹子（3 張同點，賠率 40:1）。\n4. 莊贏賠率 0.95:1，閒贏 1:1，和局 8:1。',
  'texas-holdem':
    '1. 每位玩家發 2 張底牌，桌面共享 5 張公共牌（翻牌→轉牌→河牌）。\n2. 用自己 2 張底牌加上任意公共牌，組成最佳 5 張牌型。\n3. 牌型大小（由大到小）：皇家同花順 > 同花順 > 四條 > 葫蘆 > 同花 > 順子 > 三條 > 兩對 > 一對 > 高牌。\n4. 每輪可選擇：過牌（Check）、下注（Bet）、加注（Raise）、跟注（Call）、棄牌（Fold）。',
  'pai-gow':
    '1. 玩家從 7 張牌中分出「大手（5 張）」與「小手（2 張）」。\n2. 大手必須比小手點數高，否則視為犯規（自動輸）。\n3. 大手與小手同時勝過莊家對應手牌才能全額獲獎（賠率 1:1，扣 5% 佣金）。\n4. 只有一手勝出視為平局，退回下注；兩手皆輸則全輸。\n5. 大手最強牌型：五張 A（需含百搭牌）。',
  'teen-patti':
    '1. 每位玩家及莊家各發 3 張牌，比較牌型大小決定勝負。\n2. 牌型大小（由大到小）：三條 > 同花順 > 順子 > 同花 > 對子 > 高牌。\n3. 遊戲開始後可選擇「看牌（Seen）」或「暗注（Blind，下注金額減半）」。\n4. 所有玩家比牌後，最大牌型者獲得底池全部籌碼。',
}

// 波動性顏色 class
function volatilityClass(v?: string) {
  if (v === '低')  return 'gv-vol-low'
  if (v === '中')  return 'gv-vol-mid'
  if (v === '高')  return 'gv-vol-high'
  if (v === '極高') return 'gv-vol-max'
  return ''
}

// 遊戲規則折疊狀態
const rulesOpen = ref(false)

const gameRules = computed(() => {
  if (!game.value) return ''
  return rulesMap[game.value.key] ?? `${game.value.name} 的詳細遊戲規則請在遊戲內查閱說明頁面，或聯繫客服了解更多。`
})

const frameOuter = ref<HTMLElement | null>(null)
async function toggleFullscreen() {
  if (!import.meta.client || !frameOuter.value) return
  if (document.fullscreenElement) await document.exitFullscreen()
  else await frameOuter.value.requestFullscreen()
}
</script>

<template>
  <div class="gv-wrap">
    <!-- 返回按鈕 -->
    <div class="gv-back-row">
      <button class="gv-back-btn" @click="emit('close')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回大廳
      </button>
    </div>

    <!-- 遊戲 iframe 容器 (16:9) -->
    <div ref="frameOuter" class="gv-frame-outer">
      <ClientOnly>
        <iframe
          :src="gameUrl"
          :title="game?.name ?? '遊戲'"
          class="gv-iframe"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        <template #fallback>
          <div class="gv-loading">
            <div class="gv-loading-spinner" />
            <p>遊戲載入中…</p>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 控制列（iframe 正下方） -->
    <div class="gv-controls">
      <!-- 左側工具 -->
      <div class="flex items-center gap-2">
        <!-- 全螢幕 icon（示意） -->
        <button class="gv-ctrl-icon" aria-label="全螢幕" @click="toggleFullscreen">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </button>
      </div>

      <!-- 中間：品牌名稱 -->
      <span class="gv-brand">巨亨 ONLINE<span v-if="machineId">・{{ machineId.split('-').pop() }}</span></span>

      <!-- 右側：目前幣別與模式切換 -->
      <div class="gv-session-controls">
        <div v-if="mode === 'real' && currentWalletLabel" class="gv-wallet-indicator" aria-label="目前遊戲幣別">
          <span>目前幣別</span>
          <strong>{{ currentWalletLabel }}</strong>
        </div>
        <div class="gv-mode-tabs">
          <button
            class="gv-mode-btn"
            :class="{ 'gv-mode-active': mode === 'demo' }"
            @click="emit('switchMode', 'demo')"
          >
            試玩模式
          </button>
          <button
            class="gv-mode-btn"
            :class="{ 'gv-mode-active': mode === 'real' }"
            @click="emit('switchMode', 'real')"
          >
            真錢模式
          </button>
        </div>
      </div>
    </div>

    <!-- 遊戲資訊區塊 -->
    <div v-if="game" class="gv-info">

      <!-- 供應商列 -->
      <div class="gv-provider-row">
        <div class="gv-provider-logo">
          {{ game.provider.charAt(0) }}
        </div>
        <div>
          <div class="gv-provider-name">{{ game.provider }}</div>
          <div class="gv-provider-status">
            <span class="gv-dot" />&nbsp;{{ categoryLabel[game.category] ?? game.category }} 遊戲
          </div>
        </div>
      </div>

      <!-- 遊戲名稱 + 徽章 -->
      <div class="gv-title-row">
        <h1 class="gv-game-title">{{ game.name }}</h1>
        <span v-if="game.badge" class="gv-badge">{{ game.badge }}</span>
      </div>

      <!-- 標籤列 -->
      <div class="gv-tags">
        <span class="gv-tag gv-tag-rtp">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4H6l4 4 4-4h-3V7z"/></svg>
          RTP {{ game.rtp }}
        </span>
        <span class="gv-tag">{{ categoryLabel[game.category] ?? game.category }}</span>
        <span class="gv-tag">{{ game.provider }}</span>
      </div>

      <!-- 分隔線 -->
      <div class="gv-divider" />

      <!-- 遊戲描述 -->
      <div class="gv-desc-section">
        <h2 class="gv-desc-title">遊戲介紹</h2>
        <p class="gv-desc-text">{{ gameDesc }}</p>
      </div>

      <!-- 遊戲規格 -->
      <div class="gv-spec-grid">
        <div class="gv-spec-item">
          <div class="gv-spec-label">理論 RTP</div>
          <div class="gv-spec-value" style="color:var(--color-gold);">{{ game.rtp }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">波動性</div>
          <div class="gv-spec-value" :class="volatilityClass(game.volatility)">{{ game.volatility ?? '—' }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">最大倍數</div>
          <div class="gv-spec-value">{{ game.maxMultiplier ?? '—' }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">賠付線</div>
          <div class="gv-spec-value">{{ game.paylines ?? '—' }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">遊戲類型</div>
          <div class="gv-spec-value">{{ categoryLabel[game.category] ?? game.category }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">供應商</div>
          <div class="gv-spec-value">{{ game.provider }}</div>
        </div>
      </div>

      <!-- 遊戲規則說明（可折疊） -->
      <div class="gv-rules-section">
        <button class="gv-rules-toggle" @click="rulesOpen = !rulesOpen" :aria-expanded="rulesOpen">
          <span>遊戲規則說明</span>
          <svg
            class="gv-rules-chevron"
            :class="{ 'gv-rules-chevron-open': rulesOpen }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <Transition name="rules-expand">
          <div v-if="rulesOpen" class="gv-rules-body">
            <p v-for="(line, i) in gameRules.split('\n')" :key="i" class="gv-rules-line">{{ line }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gv-session-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.gv-wallet-indicator {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid rgba(245, 200, 66, .28);
  border-radius: 10px;
  background: rgba(245, 200, 66, .06);
}

.gv-wallet-indicator span {
  color: var(--color-text-muted);
  font-size: 8px;
}

.gv-wallet-indicator strong {
  color: var(--color-gold);
  font-size: 10px;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .gv-controls {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 7px 10px;
  }

  .gv-brand {
    justify-self: end;
    font-size: 11px;
  }

  .gv-session-controls {
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .gv-wallet-indicator { flex: 1; }
  .gv-mode-btn { padding-right: 10px; padding-left: 10px; font-size: 10px; }
}
</style>
