<script setup lang="ts">
const { showLegalModal, legalDocument, closeLegal } = useLegalState()

const documents = {
  terms: {
    eyebrow: 'TERMS REVIEW',
    title: '會員條款審閱',
    sections: [
      ['帳號與資格', '使用者須年滿十八歲並妥善保管登入資訊。所有註冊、登入及驗證流程在本原型中均為前端 Mock，不會傳送真實資料。'],
      ['遊戲與點數', '平台點數僅用於原型操作展示。儲值、贈禮、兌換、提款及交易結果不構成真實金流或權利義務。'],
      ['理性娛樂', '請依自身狀況安排遊戲時間。若操作影響日常生活，應立即停止並尋求適當協助。'],
    ],
  },
  privacy: {
    eyebrow: 'PRIVACY',
    title: '隱私政策',
    sections: [
      ['資料使用', '本原型只使用瀏覽器端 Mock 資料呈現功能，不會將表單內容傳送至後端服務。'],
      ['本機保存', '登入狀態、個人資料與偏好設定可能保存在瀏覽器 localStorage；金融與社交 Mock 於重新整理後重置。'],
      ['使用者控制', '使用者可透過登出清除登入與個人資料，也可以清除瀏覽器網站資料恢復全部預設值。'],
    ],
  },
  service: {
    eyebrow: 'SERVICE POLICY',
    title: '平台服務規範',
    sections: [
      ['公平使用', '禁止冒用他人身份、騷擾玩家或利用平台功能從事違法行為。'],
      ['社群互動', '好友、封鎖與檢舉皆為 Mock 流程；重新整理後會回到原始示範資料。'],
      ['服務調整', '本原型內容可能因產品驗證需求調整，實際服務仍以正式上線公告為準。'],
    ],
  },
} as const

const currentDocument = computed(() => documents[legalDocument.value])
</script>

<template>
  <Teleport to="body">
    <Transition name="legal-fade">
      <div
        v-if="showLegalModal"
        class="legal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="currentDocument.title"
        @click.self="closeLegal(false)"
      >
        <article class="legal-panel">
          <header class="legal-header">
            <div>
              <p class="legal-eyebrow">{{ currentDocument.eyebrow }}</p>
              <h2>{{ currentDocument.title }}</h2>
            </div>
            <button type="button" class="legal-close" aria-label="關閉條款" @click="closeLegal(false)">×</button>
          </header>

          <div class="legal-body">
            <p class="legal-intro">請完整審閱下列內容。此文件用於呈現 APP 對齊後的原型操作流程。</p>
            <section v-for="([title, content], index) in currentDocument.sections" :key="title" class="legal-section">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ title }}</h3>
                <p>{{ content }}</p>
              </div>
            </section>
          </div>

          <footer class="legal-footer">
            <button type="button" class="btn-outline-purple" @click="closeLegal(false)">稍後再看</button>
            <button type="button" class="btn-gold" @click="closeLegal(true)">我已閱讀並了解</button>
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.legal-fade-enter-active,.legal-fade-leave-active{transition:opacity .22s ease}.legal-fade-enter-from,.legal-fade-leave-to{opacity:0}
.legal-overlay{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:18px;background:rgba(5,0,15,.82);backdrop-filter:blur(12px)}
.legal-panel{width:min(620px,100%);max-height:min(760px,92dvh);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(245,200,66,.28);border-radius:24px;background:linear-gradient(155deg,#21103a 0%,#10051f 70%);box-shadow:0 30px 90px rgba(0,0,0,.56)}
.legal-header{display:flex;align-items:flex-start;justify-content:space-between;padding:24px 26px 18px;border-bottom:1px solid rgba(168,85,247,.2)}
.legal-eyebrow{margin:0 0 4px;color:var(--color-gold);font-size:11px;font-weight:900;letter-spacing:.2em}.legal-header h2{margin:0;color:var(--color-text);font-size:24px;font-weight:900}.legal-close{width:36px;height:36px;border:1px solid rgba(255,255,255,.15);border-radius:50%;color:#fff;background:rgba(255,255,255,.06);font-size:24px;line-height:1}
.legal-body{overflow:auto;padding:22px 26px}.legal-intro{margin:0 0 20px;color:var(--color-text-muted);font-size:13px;line-height:1.75}.legal-section{display:grid;grid-template-columns:34px 1fr;gap:12px;padding:17px 0;border-top:1px solid rgba(168,85,247,.15)}.legal-section>span{color:var(--color-purple-light);font-size:11px;font-weight:900;letter-spacing:.1em}.legal-section h3{margin:0 0 6px;color:var(--color-text);font-size:15px}.legal-section p{margin:0;color:var(--color-text-muted);font-size:13px;line-height:1.8}
.legal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 26px 22px;border-top:1px solid rgba(168,85,247,.18);background:rgba(15,0,32,.72)}
@media(max-width:640px){.legal-overlay{align-items:end;padding:0}.legal-panel{max-height:92dvh;border-radius:24px 24px 0 0}.legal-header,.legal-body{padding-left:20px;padding-right:20px}.legal-footer{padding:14px 20px calc(14px + env(safe-area-inset-bottom));}.legal-footer>*{flex:1;justify-content:center}}
</style>
