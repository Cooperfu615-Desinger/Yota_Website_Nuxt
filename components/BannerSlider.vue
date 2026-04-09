<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

const slides = siteContent.bannerSlides
const { current, total, slideStyle, next, prev, goTo, onTouchStart, onTouchEnd } = useBannerSlider(slides.length, 4000)
</script>

<template>
  <div
    class="banner-slider"
    role="region"
    aria-label="廣告輪播"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="banner-slides" :style="slideStyle">
      <div
        v-for="slide in slides"
        :key="slide.ariaLabel"
        class="banner-slide"
        role="group"
        :aria-label="slide.ariaLabel"
      >
        <div class="banner-slide-inner" :style="slide.imageSrc ? undefined : { background: slide.background }">
          <img
            v-if="slide.imageSrc"
            class="banner-slide-image"
            :src="slide.imageSrc"
            :alt="slide.imageAlt"
          >
          <div v-else class="banner-slide-fallback" aria-hidden="true" />

          <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div class="absolute rounded-full" style="width:200px;height:200px;top:-60px;right:-60px;background:radial-gradient(circle,rgba(168,85,247,0.2),transparent);"></div>
            <div class="absolute rounded-full" style="width:150px;height:150px;bottom:-40px;left:-40px;background:radial-gradient(circle,rgba(245,200,66,0.15),transparent);"></div>
          </div>
        </div>
      </div>
    </div>

    <button class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.2);"
            aria-label="上一張" @click="prev">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.2);"
            aria-label="下一張" @click="next">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>

    <div class="banner-dots" role="tablist" aria-label="輪播指示">
      <button
        v-for="i in total"
        :key="i"
        class="banner-dot"
        :class="{ active: current === i - 1 }"
        role="tab"
        :aria-selected="current === i - 1"
        :aria-label="`第${i}張`"
        @click="goTo(i - 1)"
      />
    </div>
  </div>
</template>
