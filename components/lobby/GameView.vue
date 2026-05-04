<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'

const props = defineProps<{ gameKey: string; mode: 'real' | 'demo' }>()
const emit  = defineEmits<{ close: []; switchMode: ['real' | 'demo'] }>()

const allGames: GameItem[] = [...siteContent.games] as GameItem[]
const game = computed(() => allGames.find(g => g.key === props.gameKey))

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
    <div class="gv-frame-outer">
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
        <button class="gv-ctrl-icon" aria-label="全螢幕">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </button>
      </div>

      <!-- 中間：品牌名稱 -->
      <span class="gv-brand">巨亨 ONLINE</span>

      <!-- 右側：模式切換 -->
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
          <div class="gv-spec-label">遊戲類型</div>
          <div class="gv-spec-value">{{ categoryLabel[game.category] ?? game.category }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">供應商</div>
          <div class="gv-spec-value">{{ game.provider }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">理論 RTP</div>
          <div class="gv-spec-value" style="color:var(--color-gold);">{{ game.rtp }}</div>
        </div>
        <div class="gv-spec-item">
          <div class="gv-spec-label">遊戲語言</div>
          <div class="gv-spec-value">繁體中文</div>
        </div>
      </div>
    </div>
  </div>
</template>
