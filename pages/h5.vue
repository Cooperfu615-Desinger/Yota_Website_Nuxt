<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: '巨亨ONLINE — Web 版遊戲大廳' })
const { resolvePublicAsset } = usePublicAssetPath()
const loading = ref(true)
const progress = ref(12)
let progressTimer: ReturnType<typeof setInterval> | null = null
let finishTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  progressTimer = setInterval(() => { progress.value = Math.min(92, progress.value + 8) }, 140)
  finishTimer = setTimeout(() => { progress.value = 100; loading.value = false }, 1800)
})
onUnmounted(() => { if (progressTimer) clearInterval(progressTimer); if (finishTimer) clearTimeout(finishTimer) })
</script>

<template>
  <main class="webhall-root">
    <Transition name="brand-reveal" mode="out-in">
      <section v-if="loading" key="loading" class="brand-loading" aria-live="polite">
        <div class="brand-orbit"><span /><span /><div class="brand-monogram">巨</div></div>
        <p>JUHENG ONLINE</p><h1>Web館</h1><div class="brand-progress"><i :style="{ width: `${progress}%` }" /></div><small>正在開啟獨立遊戲體驗・{{ progress }}%</small>
      </section>
      <img v-else key="hall" :src="resolvePublicAsset('/lobby.jpeg')" alt="巨亨ONLINE Web 版遊戲大廳" class="webhall-image" />
    </Transition>
  </main>
</template>

<style scoped>
.webhall-root{min-height:100dvh;margin:0;display:grid;place-items:center;overflow:hidden;background:#050009}.brand-loading{position:relative;width:100%;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;background:radial-gradient(circle at 50% 42%,rgba(168,85,247,.24),transparent 34%),linear-gradient(145deg,#050009,#140323 60%,#08000d);text-align:center}.brand-loading::before{position:absolute;inset:0;content:"";opacity:.18;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:32px 32px;mask-image:radial-gradient(circle,#000,transparent 70%)}.brand-orbit{position:relative;width:112px;height:112px;display:grid;place-items:center;margin-bottom:22px;border:1px solid rgba(245,200,66,.24);border-radius:50%;animation:brand-float 2.2s ease-in-out infinite}.brand-orbit>span{position:absolute;inset:10px;border:1px solid rgba(168,85,247,.36);border-radius:44% 56% 61% 39%;animation:brand-spin 5s linear infinite}.brand-orbit>span:nth-child(2){inset:-8px;border-color:rgba(245,200,66,.16);animation-direction:reverse;animation-duration:8s}.brand-monogram{position:relative;z-index:1;display:grid;width:66px;height:66px;place-items:center;border-radius:20px;color:#1a0825;background:linear-gradient(145deg,#fde68a,#f5c842 55%,#d97706);font-size:34px;font-weight:1000;box-shadow:0 0 45px rgba(245,200,66,.24)}.brand-loading p{position:relative;margin:0;color:var(--color-gold,#f5c842);font-size:10px;font-weight:900;letter-spacing:.35em}.brand-loading h1{position:relative;margin:7px 0 24px;font-size:38px;letter-spacing:.08em}.brand-progress{position:relative;width:min(280px,64vw);height:3px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.1)}.brand-progress i{display:block;height:100%;background:linear-gradient(90deg,#a855f7,#f5c842);box-shadow:0 0 16px rgba(245,200,66,.6);transition:width .18s ease}.brand-loading small{position:relative;margin-top:12px;color:rgba(255,255,255,.46);font-size:10px;letter-spacing:.08em}.webhall-image{width:100%;height:100dvh;display:block;object-fit:contain;background:#000}.brand-reveal-enter-active,.brand-reveal-leave-active{transition:opacity .4s ease,transform .4s ease}.brand-reveal-enter-from{opacity:0;transform:scale(1.02)}.brand-reveal-leave-to{opacity:0;transform:scale(.98)}@keyframes brand-spin{to{transform:rotate(360deg)}}@keyframes brand-float{50%{transform:translateY(-6px)}}
</style>
