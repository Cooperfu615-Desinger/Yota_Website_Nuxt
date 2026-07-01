<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin, logout } = useAppState()
const { app: { baseURL } } = useRuntimeConfig()
const router = useRouter()
const { openAgeGate } = useAgeGateState()

const base = baseURL.replace(/\/$/, '')

function handlePlay() {
  if (isLoggedIn.value) {
    openAgeGate(() => router.push('/lobby'))
  } else {
    openLogin()
  }
}

function handleDeposit() {
  if (isLoggedIn.value) {
    router.push('/deposit')
  } else {
    openLogin()
  }
}
</script>

<template>
  <!-- ══ 手機版：圖片式點擊按鈕 ══ -->
  <button class="fp-mobile-img-btn fp-mobile-img-left lg:hidden" @click="handleDeposit" aria-label="立即儲">
    <img :src="`${base}/btn_002.png`" alt="立即儲" />
  </button>

  <button class="fp-mobile-img-btn fp-mobile-img-right lg:hidden" @click="handlePlay" aria-label="立即玩">
    <img :src="`${base}/btn_001.png`" alt="立即玩" />
  </button>

  <!-- ══ 左側：立即儲 ══ -->
  <div class="fp fp-left hidden lg:flex">
    <!-- 圖片浮在卡片上方 -->
    <div class="fp-hero-wrap" aria-hidden="true">
      <img class="fp-hero-img" :src="`${base}/btn_002.png`" alt="" />
    </div>

    <div class="fp-body">
      <button class="fp-btn-gold" @click="handleDeposit">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
          <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
        </svg>
        前往儲值
      </button>

      <div class="fp-divider">APP 下載</div>

      <a href="#" class="fp-dl-btn" aria-label="Google Play 下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893-2.208 2.208-6.49-3.72 8.698 1.512Zm-2.208-2.915L20 5.765l-1.368 2.868-6.341 1.159ZM12.292 12 20 18.235l-8.109-1.46 2.208-2.208 2.193-2.567Z"/>
        </svg>
        Google Play
      </a>

      <a href="#" class="fp-dl-btn" aria-label="App Store 下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        App Store
      </a>

      <a href="#" class="fp-dl-btn fp-dl-apk" aria-label="APK 直接下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
        </svg>
        APK 下載
      </a>
    </div>
  </div>

  <!-- ══ 右側：立即玩 / 玩家資訊 ══ -->
  <div class="fp fp-right hidden lg:flex">
    <!-- 圖片浮在卡片上方 -->
    <div class="fp-hero-wrap" aria-hidden="true">
      <img class="fp-hero-img" :src="`${base}/btn_001.png`" alt="" />
    </div>

    <div class="fp-body">
      <template v-if="!isLoggedIn">
        <p class="fp-desc">登入後即可快速進入遊戲大廳，立即開玩。</p>
        <button class="fp-btn-primary" @click="openLogin">
          登入 / 註冊
        </button>
      </template>

      <template v-else>
        <div class="fp-section-label">我的資訊</div>
        <div class="fp-avatar-row">
          <div class="fp-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="fp-account">{{ userInfo.name }}</div>
        </div>
        <div class="fp-info-list">
          <div class="fp-info-row">
            <span class="fp-info-label">VIP</span>
            <span class="fp-info-val fp-info-vip">LV {{ userInfo.vip }}</span>
          </div>
          <div class="fp-info-row">
            <span class="fp-info-label">餘額</span>
            <span class="fp-info-val fp-info-balance">${{ userInfo.balance.toLocaleString() }}</span>
          </div>
        </div>
        <button class="fp-btn-primary fp-btn-play" @click="handlePlay">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
          立即玩
        </button>
        <button class="fp-btn-logout" @click="logout">登出</button>
      </template>
    </div>
  </div>
</template>
