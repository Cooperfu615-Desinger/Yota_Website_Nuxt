<script setup lang="ts">
import type { ChatPlayerProfile } from '~/data/siteContent'

defineProps<{ player: ChatPlayerProfile }>()
const emit = defineEmits<{ close: []; submit: [reason: string, detail: string] }>()
const reason = ref('不當言論')
const detail = ref('')
const submitting = ref(false)
const reasons = ['不當言論', '騷擾行為', '疑似詐騙', '冒用身份', '其他']

async function submitReport() {
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 700))
  emit('submit', reason.value, detail.value.trim())
  submitting.value = false
}
</script>

<template>
  <Teleport to="body"><Transition name="report-fade" appear><div class="report-overlay" role="dialog" aria-modal="true" aria-label="檢舉玩家" @click.self="emit('close')"><form class="report-panel" @submit.prevent="submitReport">
    <header><div><p>PLAYER SAFETY</p><h2>檢舉 {{ player.name }}</h2><span>#{{ player.playerId }}</span></div><button type="button" aria-label="關閉" @click="emit('close')">×</button></header>
    <div class="report-body"><label>檢舉原因</label><div class="reason-grid"><button v-for="item in reasons" :key="item" type="button" :class="{ active: reason === item }" @click="reason = item">{{ item }}</button></div><label for="report-detail">補充說明</label><textarea id="report-detail" v-model="detail" class="input-field" rows="5" maxlength="300" placeholder="請描述發生時間、對話內容或其他可供客服確認的資訊（選填）" /><small>{{ detail.length }} / 300</small></div>
    <footer><button type="button" class="btn-outline-purple" @click="emit('close')">取消</button><button type="submit" class="btn-gold" :disabled="submitting">{{ submitting ? '送出中…' : '送出檢舉' }}</button></footer>
  </form></div></Transition></Teleport>
</template>

<style scoped>
.report-fade-enter-active,.report-fade-leave-active{transition:opacity .2s}.report-fade-enter-from,.report-fade-leave-to{opacity:0}.report-overlay{position:fixed;inset:0;z-index:1090;display:grid;place-items:center;padding:18px;background:rgba(5,0,15,.86);backdrop-filter:blur(12px)}.report-panel{width:min(520px,100%);overflow:hidden;border:1px solid rgba(248,113,113,.26);border-radius:22px;background:linear-gradient(155deg,#21103a,#10051f);box-shadow:0 30px 90px rgba(0,0,0,.6)}.report-panel header{display:flex;justify-content:space-between;padding:22px 24px;border-bottom:1px solid var(--color-border)}.report-panel header p{margin:0;color:#fca5a5;font-size:9px;font-weight:900;letter-spacing:.17em}.report-panel header h2{margin:4px 0 1px;font-size:21px}.report-panel header span{color:var(--color-text-muted);font-size:10px}.report-panel header button{color:var(--color-text-muted);background:none;font-size:25px}.report-body{display:flex;flex-direction:column;gap:9px;padding:22px 24px}.report-body>label{margin-top:4px;font-size:11px;font-weight:900}.reason-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.reason-grid button{padding:9px 6px;border:1px solid var(--color-border);border-radius:9px;color:var(--color-text-muted);background:rgba(168,85,247,.06);font-size:10px;font-weight:800}.reason-grid button.active{border-color:rgba(248,113,113,.4);color:#fecaca;background:rgba(248,113,113,.1)}.report-body textarea{resize:vertical;line-height:1.6}.report-body small{align-self:flex-end;color:var(--color-text-muted);font-size:9px}.report-panel footer{display:grid;grid-template-columns:1fr 1.4fr;gap:9px;padding:0 24px 22px}.report-panel footer>*{justify-content:center}@media(max-width:520px){.report-overlay{align-items:end;padding:0}.report-panel{border-radius:22px 22px 0 0}.reason-grid{grid-template-columns:1fr 1fr}}
</style>
