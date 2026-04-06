<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

const { openLobby } = useAppState()
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
        <div class="banner-slide-inner" :style="{ background: slide.background }">
          <div v-if="slide.kind === 'lobby'" class="float-anim flex flex-col items-center gap-3">
            <div
              class="text-5xl font-black text-center leading-tight"
              style="white-space:pre-line; color:var(--color-gold-light); text-shadow:0 0 20px rgba(245,200,66,0.25);"
            >
              {{ slide.title }}
            </div>
            <p class="text-sm" style="color:var(--color-text-muted);">{{ slide.subtitle }}</p>
            <button class="btn-gold mt-2" @click="openLobby('https://example.com/h5')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              {{ slide.buttonLabel }}
            </button>
          </div>

          <div v-else-if="slide.kind === 'promo'" class="flex flex-col items-center gap-3 px-6 text-center">
            <div class="text-xs font-bold tracking-widest" :style="{ color: slide.eyebrowColor || 'var(--color-gold)' }">
              {{ slide.eyebrow }}
            </div>
            <div class="text-3xl font-black text-white">{{ slide.headline }}</div>
            <div class="text-5xl font-black glow-pulse" :style="{ background: slide.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }">
              {{ slide.highlight }}
            </div>
            <div class="text-sm" style="color:var(--color-text-muted);">{{ slide.note }}</div>
            <NuxtLink :to="slide.buttonTo || '/'" class="btn-gold mt-1" style="font-size:14px; padding:10px 24px;">
              {{ slide.buttonLabel }}
            </NuxtLink>
          </div>

          <div v-else class="flex flex-col items-center gap-4 px-6 text-center">
            <div class="text-xs font-bold tracking-widest" :style="{ color: slide.accent }">{{ slide.eyebrow }}</div>
            <div class="text-2xl font-black text-white" style="white-space:pre-line;">{{ slide.headline }}</div>
            <div class="flex gap-3 mt-1">
              <NuxtLink
                v-for="button in slide.buttons"
                :key="button.label"
                :to="button.to"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style="background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.2);"
              >
                <svg v-if="button.label === 'iOS 下載'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a4.58 4.58 0 0 0 2.492-4.004 4.594 4.594 0 0 0-2.492-4.004l1.005-1.742a.25.25 0 0 0-.096-.341.251.251 0 0 0-.341.096l-1.02 1.764A9.427 9.427 0 0 0 12.5 6.25a9.43 9.43 0 0 0-4.571 1.856L6.908 4.342a.25.25 0 0 0-.341-.096.25.25 0 0 0-.096.341l1.005 1.742A4.594 4.594 0 0 0 4.985 10.337a4.579 4.579 0 0 0 2.491 4.004L6.47 16.083a.25.25 0 1 0 .438.245l1.01-1.755a9.44 9.44 0 0 0 4.582 1.177 9.44 9.44 0 0 0 4.582-1.177l1.01 1.755a.251.251 0 0 0 .438-.245l-1.007-1.742zM9.5 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
                {{ button.label }}
              </NuxtLink>
            </div>
          </div>

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
