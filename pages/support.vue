<script setup lang="ts">
useSeoMeta({
  title: '客服中心 — 巨亨ONLINE | 24小時線上客服',
  description: '巨亨ONLINE客服中心，提供LINE即時客服、常見問題解答，全天候為您服務。',
  ogTitle: '客服中心 — 巨亨ONLINE',
})

type FaqCategory = 'account' | 'deposit' | 'game' | 'install'
const activeCategory = ref<FaqCategory>('account')

const categories: { key: FaqCategory; label: string }[] = [
  { key: 'account', label: '帳號相關' },
  { key: 'deposit', label: '儲值問題' },
  { key: 'game',    label: '遊戲問題' },
  { key: 'install', label: '安裝問題' },
]

const faqs: Record<FaqCategory, { q: string; a: string }[]> = {
  account: [
    { q: '忘記帳號密碼怎麼辦？', a: '您可以透過手機號碼驗證重設密碼。請點選登入頁面的「忘記密碼」，輸入您的手機號碼，收到驗證碼後即可設定新密碼。' },
    { q: '如何更換手機號碼？', a: '請聯繫客服提出申請，需提供帳號驗證資訊進行身份確認。為保護您的帳號安全，此操作需要人工審核。' },
    { q: '帳號被停用了怎麼辦？', a: '帳號停用可能因違反使用條款或異常活動所致。請聯繫客服說明情況，我們的客服人員將協助您處理。' },
    { q: '如何修改個人資料？', a: '登入後前往「會員專區」，點選「個人資料」即可修改暱稱、頭像等資訊。基本資料（真實姓名、身分證）修改需聯繫客服。' },
  ],
  deposit: [
    { q: '儲值後點數沒有到帳？', a: '儲值完成後通常在 5 分鐘內到帳。若超過 30 分鐘仍未到帳，請保留儲值證明並聯繫客服。不同支付方式的到帳時間可能有所不同。' },
    { q: '支援哪些付款方式？', a: '目前支援：信用卡（Visa/MasterCard）、ATM 轉帳、超商代碼繳費（7-11/全家/萊爾富/OK超商）、MyCard、GASH、FunPay、iWin 點數卡。' },
    { q: '儲值有上下限嗎？', a: '最低儲值金額為 NT$300，每日最高儲值上限依 VIP 等級不同：一般玩家 NT$50,000 / VIP3 NT$200,000 / VIP6 無上限。' },
    { q: '如何申請提款？', a: '提款需完成身份認證，登入後前往「會員專區」→「申請提款」，填寫銀行帳戶資訊。審核時間約 1-3 個工作天。' },
  ],
  game: [
    { q: '遊戲載入失敗怎麼辦？', a: '請先確認網路連線是否穩定。若使用 iOS 設備，請確保已完成信任設定。建議清除瀏覽器快取後重試，或改用 APP 進行遊戲。' },
    { q: '遊戲過程中斷線怎麼辦？', a: '我們的系統會自動記錄您斷線前的遊戲狀態。重新連線後，您的資產不會有任何損失，遊戲紀錄也會完整保存。' },
    { q: '試玩模式與正式模式有何不同？', a: '試玩模式使用虛擬點數，不消耗真實餘額，適合熟悉遊戲規則。正式模式使用真實餘額，贏得的獎金可提款。' },
    { q: '遊戲公平性如何保障？', a: '我們所有遊戲均採用國際認證的 RNG（隨機數生成器），確保每局結果完全隨機公正。相關認證報告可在官網查詢。' },
  ],
  install: [
    { q: 'iOS 設備無法安裝 APP？', a: '由於 App Store 審核限制，iOS 版本需透過企業憑證安裝。請至「新手教學」頁面，按照 iOS 安裝步驟操作，並完成「信任企業開發者」設定。' },
    { q: 'Android 安裝顯示「禁止安裝未知來源」？', a: '請至手機「設定」→「安全性」→ 開啟「允許安裝未知來源應用程式」。安裝完成後可選擇關閉此設定。' },
    { q: 'APP 更新後無法開啟？', a: '請先嘗試重新啟動手機，若問題仍存在，請解除安裝後重新從官網下載最新版本。您的帳號資料不會遺失。' },
    { q: 'APP 與網頁版有什麼差異？', a: 'APP 版本支援推播通知、離線下載、更流暢的遊戲體驗，以及獨家 APP 用戶優惠。整體功能與網頁版一致，建議優先使用 APP。' },
  ],
}

const openFaqs = ref<Record<number, boolean>>({})
function toggleFaq(index: number) {
  openFaqs.value[index] = !openFaqs.value[index]
}
</script>

<template>
  <div class="pb-4">
    <!-- 標題 -->
    <div class="px-4 pt-4 pb-2">
      <h1 class="section-title">客服中心</h1>
    </div>

    <!-- LINE 客服卡 -->
    <div class="mx-4 mb-4 p-5 rounded-2xl" style="background:linear-gradient(135deg,#06C755,#00A041); position:relative; overflow:hidden;">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.2);">
          <svg viewBox="0 0 24 24" class="w-10 h-10" fill="white" aria-hidden="true">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="font-black text-lg text-white">LINE 官方客服</div>
          <div class="text-sm mt-1" style="color:rgba(255,255,255,0.85);">24 小時即時線上服務<br>快速處理您的問題</div>
        </div>
      </div>
      <button class="w-full mt-4 py-3 rounded-xl font-bold text-sm" style="background:rgba(255,255,255,0.2); color:white; border:1.5px solid rgba(255,255,255,0.4);" aria-label="開啟LINE客服">
        📱 立即聯繫客服
      </button>
      <!-- TODO: 置換為真實 QR Code 圖片 -->
      <div class="absolute top-3 right-3 w-12 h-12 rounded-lg flex items-center justify-center text-xs" style="background:rgba(255,255,255,0.15); color:rgba(255,255,255,0.6);">QR</div>
    </div>

    <!-- 防詐騙警示 -->
    <div class="mx-4 mb-5 p-4 rounded-xl" style="background:rgba(239,68,68,0.1); border:1.5px solid rgba(239,68,68,0.3);">
      <div class="flex items-start gap-3">
        <span class="text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
        <div>
          <div class="font-bold text-sm mb-1" style="color:#f87171;">防詐騙警告</div>
          <p class="text-xs leading-relaxed" style="color:rgba(248,113,113,0.8);">
            官方客服絕不會主動要求您提供帳號密碼、銀行資料或轉帳操作。
            如有任何可疑聯繫，請立即回報並封鎖。
          </p>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <section class="px-4" aria-labelledby="faq-heading">
      <h2 id="faq-heading" class="section-title mb-4">常見問題</h2>

      <!-- 分類 Tab -->
      <div class="flex gap-2 overflow-x-auto pb-2 mb-4" style="scrollbar-width:none;" role="tablist">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
          :class="activeCategory === cat.key
            ? 'text-white'
            : 'text-app-muted'"
          :style="activeCategory === cat.key
            ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); box-shadow:0 2px 12px rgba(124,58,237,0.4);'
            : 'background:rgba(168,85,247,0.1); border:1px solid var(--color-border);'"
          role="tab"
          :aria-selected="activeCategory === cat.key"
          @click="activeCategory = cat.key; openFaqs = {}"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- FAQ 列表 -->
      <Transition name="tab-fade" mode="out-in">
        <div :key="activeCategory" class="card-purple px-4">
          <div
            v-for="(faq, i) in faqs[activeCategory]"
            :key="i"
            class="faq-item"
          >
            <button
              class="faq-question w-full text-left"
              :aria-expanded="!!openFaqs[i]"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <svg
                class="faq-icon w-5 h-5 flex-shrink-0"
                :class="{ open: openFaqs[i] }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <Transition name="faq-slide">
              <div v-if="openFaqs[i]" class="faq-answer">
                {{ faq.a }}
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
.faq-slide-enter-active, .faq-slide-leave-active { transition: opacity 0.2s, max-height 0.3s; overflow: hidden; max-height: 200px; }
.faq-slide-enter-from, .faq-slide-leave-to { opacity: 0; max-height: 0; }
</style>
