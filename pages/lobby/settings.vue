<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

const soundEnabled  = ref(true)
const musicEnabled  = ref(true)
const notifyEnabled = ref(true)
const lang = ref<'zh-TW' | 'en'>('zh-TW')

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
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <h1 class="section-title mb-4">設置</h1>

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
