<script setup lang="ts">
const { openLobby } = useAppState()
const { current, total, slideStyle, next, prev, goTo, onTouchStart, onTouchEnd } = useBannerSlider(4, 4000)
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

      <!-- Slide 1：立即玩 -->
      <div class="banner-slide" role="group" aria-label="第1張，立即玩">
        <div class="banner-slide-inner" style="background: linear-gradient(135deg, #1a003a 0%, #3B0764 40%, #6B21A8 100%);">
          <div class="float-anim flex flex-col items-center gap-3">
            <div class="text-5xl font-black text-center leading-tight"
                 style="background:linear-gradient(135deg,#F5C842,#fff,#C084FC); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; filter:drop-shadow(0 0 20px rgba(245,200,66,0.3));">
              巨亨<br>ONLINE
            </div>
            <p class="text-sm" style="color:var(--color-text-muted);">全台最刺激的線上娛樂城</p>
            <button class="btn-gold mt-2" @click="openLobby('https://example.com/h5')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              立即玩
            </button>
          </div>
          <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div class="absolute rounded-full" style="width:200px;height:200px;top:-60px;right:-60px;background:radial-gradient(circle,rgba(168,85,247,0.2),transparent);"></div>
            <div class="absolute rounded-full" style="width:150px;height:150px;bottom:-40px;left:-40px;background:radial-gradient(circle,rgba(245,200,66,0.15),transparent);"></div>
          </div>
        </div>
      </div>

      <!-- Slide 2：新手好禮 -->
      <div class="banner-slide" role="group" aria-label="第2張，首儲加倍">
        <div class="banner-slide-inner" style="background: linear-gradient(135deg, #1a0a00 0%, #7C2D12 50%, #1a003a 100%);">
          <div class="flex flex-col items-center gap-3 px-6 text-center">
            <div class="text-xs font-bold tracking-widest" style="color:var(--color-gold);">新手限定</div>
            <div class="text-3xl font-black" style="color:#fff;">首儲最高</div>
            <div class="text-5xl font-black glow-pulse"
                 style="background:linear-gradient(135deg,#F5C842,#FDE68A); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
              +100%
            </div>
            <div class="text-sm" style="color:var(--color-text-muted);">首次儲值即享雙倍點數</div>
            <NuxtLink to="/deposit" class="btn-gold mt-1" style="font-size:14px; padding:10px 24px;">前往儲值</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Slide 3：百萬大獎 -->
      <div class="banner-slide" role="group" aria-label="第3張，百萬大獎賽">
        <div class="banner-slide-inner" style="background: linear-gradient(135deg, #0a1a00 0%, #166534 50%, #1a003a 100%);">
          <div class="flex flex-col items-center gap-3 px-6 text-center">
            <div class="text-xs font-bold tracking-widest" style="color:#4ade80;">限時活動</div>
            <div class="text-3xl font-black text-white">百萬大獎賽</div>
            <div class="text-lg" style="color:#4ade80;">獎金池累積至</div>
            <div class="text-4xl font-black"
                 style="background:linear-gradient(135deg,#F5C842,#4ade80); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
              NT$1,280,000
            </div>
            <NuxtLink to="/events" class="btn-gold mt-1" style="font-size:14px; padding:10px 24px;">查看活動</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Slide 4：APP 下載 -->
      <div class="banner-slide" role="group" aria-label="第4張，APP下載">
        <div class="banner-slide-inner" style="background: linear-gradient(135deg, #1a003a 0%, #0F0020 50%, #1C0A3A 100%);">
          <div class="flex flex-col items-center gap-4 px-6 text-center">
            <div class="text-xs font-bold tracking-widest" style="color:var(--color-purple-glow);">APP 下載</div>
            <div class="text-2xl font-black text-white">隨時隨地，<br>享受精彩娛樂</div>
            <div class="flex gap-3 mt-1">
              <NuxtLink to="/tutorial" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                 style="background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.2);">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                iOS 下載
              </NuxtLink>
              <NuxtLink to="/tutorial" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                 style="background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.2);">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a4.58 4.58 0 0 0 2.492-4.004 4.594 4.594 0 0 0-2.492-4.004l1.005-1.742a.25.25 0 0 0-.096-.341.251.251 0 0 0-.341.096l-1.02 1.764A9.427 9.427 0 0 0 12.5 6.25a9.43 9.43 0 0 0-4.571 1.856L6.908 4.342a.25.25 0 0 0-.341-.096.25.25 0 0 0-.096.341l1.005 1.742A4.594 4.594 0 0 0 4.985 10.337a4.579 4.579 0 0 0 2.491 4.004L6.47 16.083a.25.25 0 1 0 .438.245l1.01-1.755a9.44 9.44 0 0 0 4.582 1.177 9.44 9.44 0 0 0 4.582-1.177l1.01 1.755a.251.251 0 0 0 .438-.245l-1.007-1.742zM9.5 12.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
                Android 下載
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 左右箭頭 -->
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

    <!-- 指示點 -->
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
