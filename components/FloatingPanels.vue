<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin, openLobby, logout } = useAppState()
const router = useRouter()

function handleDeposit() {
  if (isLoggedIn.value) {
    router.push('/deposit')
  } else {
    openLogin()
  }
}
</script>

<template>
  <!-- ══ 左側：立即玩 ══ -->
  <div class="fp fp-left">
    <!-- 裝飾圖示標題區 -->
    <div class="fp-deco fp-deco-play">
      <div class="fp-deco-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="fp-deco-title">立即玩</div>
    </div>

    <!-- 內容區 -->
    <div class="fp-body">
      <!-- 未登入 -->
      <template v-if="!isLoggedIn">
        <p class="fp-desc">登入後進入遊戲大廳，享受百款精彩遊戲！</p>
        <button class="fp-btn-primary" @click="openLogin">
          登入 / 註冊
        </button>
      </template>

      <!-- 已登入 -->
      <template v-else>
        <div class="fp-section-label">我的資訊</div>

        <!-- 頭像 + 帳號 -->
        <div class="fp-avatar-row">
          <div class="fp-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="fp-account">{{ userInfo.name }}</div>
        </div>

        <!-- 資訊列表 -->
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

        <!-- 進入大廳 -->
        <button class="fp-btn-gold" @click="openLobby()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
          開始遊戲
        </button>

        <!-- 登出 -->
        <button class="fp-btn-logout" @click="logout">登出</button>
      </template>
    </div>
  </div>

  <!-- ══ 右側：立即儲 ══ -->
  <div class="fp fp-right">
    <!-- 裝飾圖示標題區 -->
    <div class="fp-deco fp-deco-deposit">
      <div class="fp-deco-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="fp-deco-title">立即儲</div>
    </div>

    <!-- 內容區 -->
    <div class="fp-body">
      <!-- 儲值按鈕 -->
      <button class="fp-btn-gold" @click="handleDeposit">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
          <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
        </svg>
        前往儲值
      </button>

      <div class="fp-divider">APP 下載</div>

      <!-- Google Play -->
      <a href="#" class="fp-dl-btn" aria-label="Google Play 下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893-2.208 2.208-6.49-3.72 8.698 1.512Zm-2.208-2.915L20 5.765l-1.368 2.868-6.341 1.159ZM12.292 12 20 18.235l-8.109-1.46 2.208-2.208 2.193-2.567Z"/>
        </svg>
        Google Play
      </a>

      <!-- App Store -->
      <a href="#" class="fp-dl-btn" aria-label="App Store 下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        App Store
      </a>

      <!-- APK -->
      <a href="#" class="fp-dl-btn fp-dl-apk" aria-label="APK 直接下載">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
        </svg>
        APK 下載
      </a>
    </div>
  </div>
</template>
