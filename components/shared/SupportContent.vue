<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

type FaqCategory = 'account' | 'deposit' | 'game' | 'install'
const activeCategory = ref<FaqCategory>('account')
const categories = siteContent.faq.categories
const faqs = siteContent.faq.items

const openFaqs = ref<Record<number, boolean>>({})
const { isLoggedIn, openLogin } = useAppState()
const router = useRouter()
const supportNotice = ref('')
function toggleFaq(index: number) {
  openFaqs.value[index] = !openFaqs.value[index]
}

function contactSiteSupport() {
  supportNotice.value = '正在開啟客服頻道…'
  const supportPath = '/lobby/chat?channel=support'
  if (isLoggedIn.value) router.push(supportPath)
  else openLogin(supportPath)
}

function contactLineSupport() {
  supportNotice.value = 'LINE 客服連結尚未設定'
}

const lineSvgPath = 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314'
</script>

<template>
  <div class="support-content px-4 pt-4 pb-4">
    <h1 class="section-title mb-4">客服中心</h1>

    <div class="support-actions">
      <section class="support-card support-card-site" aria-labelledby="site-support-heading">
        <div class="support-card-heading">
          <div class="support-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 13v-1a8 8 0 0 1 16 0v1M4 12H3v6h3v-6H4Zm16 0h1v6h-3v-6h2Zm0 6v1a2 2 0 0 1-2 2h-4" />
            </svg>
          </div>
          <div class="support-card-copy">
            <h2 id="site-support-heading">站內客服</h2>
            <p>前往聊天中的客服頻道<br>提出問題、查看客服回覆</p>
          </div>
        </div>
        <button type="button" class="support-contact-button" @click="contactSiteSupport">前往客服頻道</button>
      </section>

      <section class="support-card support-card-line" aria-labelledby="line-support-heading">
        <div class="support-card-heading">
          <div class="support-card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="lineSvgPath" /></svg>
          </div>
          <div class="support-card-copy">
            <h2 id="line-support-heading">LINE 官方客服</h2>
            <p>24 小時即時線上服務<br>快速處理您的問題</p>
          </div>
        </div>
        <button type="button" class="support-contact-button" @click="contactLineSupport">聯繫 LINE 客服</button>
      </section>
    </div>
    <p v-if="supportNotice" role="status" class="support-notice">{{ supportNotice }}</p>

    <!-- FAQ -->
    <section class="support-faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading" class="section-title mb-4">常見問題</h2>

      <div class="flex gap-2 overflow-x-auto pb-2 mb-4" style="scrollbar-width:none;" role="tablist">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
          :class="activeCategory === cat.key ? 'text-white' : 'text-app-muted'"
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

      <Transition name="tab-fade" mode="out-in">
        <div :key="activeCategory" class="card-purple px-4">
          <div v-for="(faq, i) in faqs[activeCategory]" :key="i" class="faq-item">
            <button
              class="faq-question w-full text-left"
              :aria-expanded="!!openFaqs[i]"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <svg class="faq-icon w-5 h-5 flex-shrink-0" :class="{ open: openFaqs[i] }" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <Transition name="faq-slide">
              <div v-if="openFaqs[i]" class="faq-answer">{{ faq.a }}</div>
            </Transition>
          </div>
        </div>
      </Transition>
    </section>

    <div class="support-information">
    <!-- 防詐騙警示 -->
    <div class="p-4 rounded-xl" style="background:rgba(239,68,68,0.1); border:1.5px solid rgba(239,68,68,0.3);">
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
    <div class="card-purple p-4">
      <h2 class="font-bold mb-3" style="color:var(--color-gold);">服務時間</h2>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between"><span style="color:var(--color-text-muted);">LINE 客服</span><span class="font-bold" style="color:#4ade80;">24 小時</span></div>
        <div class="flex justify-between"><span style="color:var(--color-text-muted);">儲值到帳</span><span style="color:var(--color-text);">即時～30 分</span></div>
        <div class="flex justify-between"><span style="color:var(--color-text-muted);">帳務／訂單</span><span style="color:var(--color-text);">1–3 工作天</span></div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.support-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.support-card { display: flex; flex-direction: column; min-width: 0; padding: 20px; border-radius: 16px; color: white; }
.support-card-site { background: linear-gradient(135deg, var(--color-purple-mid), var(--color-purple)); }
.support-card-line { background: linear-gradient(135deg, #06C755, #00A041); }
.support-card-heading { display: flex; align-items: center; gap: 16px; flex: 1; }
.support-card-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,0.2); }
.support-card-icon svg { width: 40px; height: 40px; }
.support-card-copy { min-width: 0; }
.support-card-copy h2 { font-size: 18px; font-weight: 900; }
.support-card-copy p { margin-top: 4px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.85); }
.support-contact-button { width: 100%; min-height: 48px; margin-top: 16px; padding: 12px 8px; border: 1.5px solid rgba(255,255,255,0.4); border-radius: 12px; background: rgba(255,255,255,0.2); color: white; font-size: 14px; font-weight: 700; transition: background 0.2s; }
.support-contact-button:hover { background: rgba(255,255,255,0.3); }
.support-contact-button:focus-visible { outline: 2px solid white; outline-offset: 3px; }
.support-notice { margin-top: 12px; color: #86efac; font-size: 14px; }
.support-faq { margin-top: 24px; }
.support-information { display: grid; grid-template-columns: minmax(0, 1fr) 320px; align-items: start; gap: 16px; margin-top: 24px; }
@media (max-width: 767px) {
  .support-actions { gap: 12px; }
  .support-card { padding: 12px; }
  .support-card-heading { flex-direction: column; align-items: flex-start; gap: 12px; }
  .support-card-icon { width: 44px; height: 44px; border-radius: 12px; }
  .support-card-icon svg { width: 28px; height: 28px; }
  .support-card-copy h2 { font-size: 15px; }
  .support-card-copy p { font-size: 12px; }
  .support-contact-button { font-size: 12px; }
  .support-information { grid-template-columns: minmax(0, 1fr); }
}

.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
.faq-slide-enter-active, .faq-slide-leave-active { transition: opacity 0.2s, max-height 0.3s; overflow: hidden; max-height: 200px; }
.faq-slide-enter-from, .faq-slide-leave-to { opacity: 0; max-height: 0; }
</style>
