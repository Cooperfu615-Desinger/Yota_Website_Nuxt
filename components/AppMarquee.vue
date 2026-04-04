<script setup lang="ts">
// TODO: 串接後端 API 後，將 announcements 改為從 props 或 useFetch 取得
const announcements = [
  { type: 'system', text: '【系統公告】官網改版上線，體驗全新遊戲大廳！' },
  { type: 'win', text: '🎉 恭喜 <b>玩家王**</b> 贏得 <b style="color:var(--color-gold);">NT$88,888</b>' },
  { type: 'system', text: '【防詐騙】官方不會要求玩家提供帳號密碼，請提高警覺' },
  { type: 'win', text: '🎉 恭喜 <b>玩家陳**</b> 單局倍率高達 <b style="color:var(--color-gold);">2,560 倍！</b>' },
  { type: 'system', text: '【維護公告】每日 05:00–05:30 例行維護，請妥善安排遊戲時間' },
  { type: 'win', text: '🎉 恭喜 <b>玩家Lin**</b> 贏得 <b style="color:var(--color-gold);">NT$128,000</b>' },
]
// 複製一份以實現無縫捲動
const items = [...announcements, ...announcements]
</script>

<template>
  <div class="marquee-wrap" role="marquee" aria-label="系統公告">
    <div class="marquee-track">
      <span
        v-for="(item, i) in items"
        :key="i"
        class="marquee-item"
      >
        <span
          class="dot"
          :style="item.type === 'win' ? 'background:#ef4444; box-shadow:0 0 6px #ef4444;' : ''"
        />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="item.text" />
      </span>
    </div>
  </div>
</template>
