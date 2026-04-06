<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

const announcements = siteContent.marqueeAnnouncements
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
