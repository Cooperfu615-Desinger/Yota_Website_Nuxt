<script setup lang="ts">
import type { BlockedPlayer } from '~/composables/useSocialState'
import type { AppLanguage } from '~/composables/usePreferencesState'

definePageMeta({ layout: 'lobby' })
const { preferences, updatePreference } = usePreferencesState()
const { setMusicEnabled, setSoundEnabled, playUiSound } = useAudioState()
const { blockedPlayers, unblockPlayer } = useSocialState()
const { openLegal } = useLegalState()
const { openLogoutConfirm } = useLogoutState()
const notice = ref('')

const languages: { key: AppLanguage; label: string; native: string }[] = [
  { key: 'zh-TW', label: '繁體中文', native: '繁中' }, { key: 'en', label: 'English', native: 'EN' }, { key: 'ja', label: '日本語', native: '日' },
]

function showNotice(text: string) { notice.value = text }
function changeLanguage(language: AppLanguage) { updatePreference('language', language); showNotice('語言選擇已儲存；原型文案維持繁體中文') }
function handleUnblock(player: BlockedPlayer) { unblockPlayer(player.playerId); showNotice(`已解除封鎖 ${player.name}`) }
</script>

<template>
  <div class="lobby-page settings-page px-4 py-5">
    <h1 class="section-title mb-4">設置</h1>
    <p v-if="notice" class="settings-notice" aria-live="polite">{{ notice }}</p>

    <section class="settings-card wide"><header><span>01</span><div><p>AUDIO</p><h2>音樂與音效</h2></div></header><div class="setting-row"><div><strong>大廳背景音樂</strong><small>使用前端合成的輕量 Mock 音樂</small></div><button class="setting-switch" :class="{ active: preferences.musicEnabled }" role="switch" :aria-checked="preferences.musicEnabled" @click="setMusicEnabled(!preferences.musicEnabled); showNotice(preferences.musicEnabled ? '背景音樂已開啟' : '背景音樂已關閉')"><i /></button></div><div class="setting-row"><div><strong>操作音效</strong><small>按鈕操作與狀態完成提示音</small></div><div class="setting-action"><button class="preview-sound" @click="playUiSound">試聽</button><button class="setting-switch" :class="{ active: preferences.soundEnabled }" role="switch" :aria-checked="preferences.soundEnabled" @click="setSoundEnabled(!preferences.soundEnabled); showNotice(preferences.soundEnabled ? '操作音效已開啟' : '操作音效已關閉')"><i /></button></div></div></section>

    <section class="settings-card wide"><header><span>02</span><div><p>LANGUAGE FLOW</p><h2>語言</h2></div></header><p class="language-note">本階段只對齊選擇流程，不進行原型多語翻譯。</p><div class="language-grid"><button v-for="language in languages" :key="language.key" :class="{ active: preferences.language === language.key }" @click="changeLanguage(language.key)"><span>{{ language.native }}</span><strong>{{ language.label }}</strong><small>{{ preferences.language === language.key ? '已選擇' : '選擇語言' }}</small></button></div></section>

    <section class="settings-card wide"><header><span>03</span><div><p>SAFETY</p><h2>黑名單管理</h2></div><b>{{ blockedPlayers.length }} 位</b></header><div v-if="blockedPlayers.length" class="blocked-list"><article v-for="player in blockedPlayers" :key="player.playerId"><span>{{ player.avatar }}</span><div><strong>{{ player.name }}</strong><small>#{{ player.playerId }}</small></div><button @click="handleUnblock(player)">解除封鎖</button></article></div><div v-else class="settings-empty">目前沒有黑名單玩家；可從聊天室玩家卡加入。</div></section>

    <section class="settings-card wide"><header><span>04</span><div><p>LEGAL & ACCOUNT</p><h2>條款與帳號</h2></div></header><div class="legal-list"><button @click="openLegal('terms')"><div><strong>會員條款</strong><small>查看會員資格與點數規範</small></div><span>查看 →</span></button><button @click="openLegal('privacy')"><div><strong>隱私政策</strong><small>查看本機資料與 Mock 保存方式</small></div><span>查看 →</span></button><button @click="openLegal('service')"><div><strong>平台服務規範</strong><small>查看社群與公平使用規則</small></div><span>查看 →</span></button></div></section>

    <div class="logout-action">
      <button class="logout-button" @click="openLogoutConfirm">
        <span aria-hidden="true">⇥</span>
        <div><strong>登出目前帳號</strong><small>結束這次登入並返回官網首頁</small></div>
        <b>登出</b>
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-page{max-width:1040px;margin:0 auto}.settings-card header p{margin:0;color:var(--color-gold);font-size:8px;font-weight:900;letter-spacing:.18em}.settings-notice{padding:9px 12px;border:1px solid rgba(74,222,128,.25);border-radius:9px;color:#86efac;background:rgba(74,222,128,.08);font-size:10px}.settings-card{padding:18px;margin-bottom:12px;border:1px solid var(--color-border);border-radius:17px;background:rgba(26,10,46,.68)}.settings-card header{display:flex;align-items:center;gap:10px;margin-bottom:12px}.settings-card header>span{display:grid;width:29px;height:29px;place-items:center;border-radius:9px;color:var(--color-purple-light);background:rgba(168,85,247,.1);font-size:8px;font-weight:900}.settings-card header h2{margin:2px 0;font-size:16px}.settings-card header>b{margin-left:auto;padding:4px 8px;border-radius:99px;color:#fca5a5;background:rgba(248,113,113,.08);font-size:8px}.setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-top:1px solid rgba(255,255,255,.06)}.setting-row>div:first-child{display:flex;flex-direction:column}.setting-row strong{font-size:10px}.setting-row small,.language-note{color:var(--color-text-muted);font-size:8px}.setting-action{display:flex;align-items:center;gap:8px}.preview-sound{color:var(--color-purple-light);font-size:8px}.setting-switch{position:relative;width:43px;height:23px;border-radius:99px;background:rgba(148,163,184,.18)}.setting-switch i{position:absolute;left:3px;top:3px;width:17px;height:17px;border-radius:50%;background:#94a3b8;transition:.2s}.setting-switch.active{background:linear-gradient(90deg,#7c3aed,#a855f7)}.setting-switch.active i{left:23px;background:#fff}.wide{width:100%}.language-note{margin:-5px 0 12px}.language-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.language-grid button{display:grid;grid-template-columns:36px 1fr;gap:0 9px;padding:12px;border:1px solid var(--color-border);border-radius:12px;color:var(--color-text);background:rgba(0,0,0,.1);text-align:left}.language-grid button>span{grid-row:1/3;display:grid;width:34px;height:34px;place-items:center;border-radius:9px;color:var(--color-purple-light);background:rgba(168,85,247,.1);font-size:9px;font-weight:900}.language-grid strong{font-size:10px}.language-grid small{color:var(--color-text-muted);font-size:8px}.language-grid button.active{border-color:var(--color-gold);background:rgba(245,200,66,.06)}.language-grid button.active>span{color:#1b0a25;background:var(--color-gold)}.blocked-list{display:grid;gap:7px}.blocked-list article{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:9px;padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:10px}.blocked-list article>span{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:rgba(168,85,247,.1)}.blocked-list article>div{display:flex;flex-direction:column}.blocked-list strong{font-size:10px}.blocked-list small{color:var(--color-text-muted);font-size:8px}.blocked-list button{color:#fca5a5;font-size:8px;font-weight:800}.settings-empty{padding:28px;border:1px dashed var(--color-border);border-radius:11px;color:var(--color-text-muted);text-align:center;font-size:9px}.legal-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.legal-list button{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:11px;color:var(--color-text);background:rgba(0,0,0,.1);text-align:left}.legal-list button div{display:flex;flex-direction:column}.legal-list strong{font-size:10px}.legal-list small{color:var(--color-text-muted);font-size:8px}.legal-list button>span{color:var(--color-purple-light);font-size:8px}.logout-action{padding-top:2px}.logout-button{display:grid;width:100%;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;padding:13px 15px;border:1px solid rgba(248,113,113,.24);border-radius:14px;color:#fca5a5;background:linear-gradient(90deg,rgba(248,113,113,.08),rgba(248,113,113,.025));text-align:left;transition:border-color .2s,background .2s,transform .2s}.logout-button:hover{border-color:rgba(248,113,113,.46);background:linear-gradient(90deg,rgba(248,113,113,.13),rgba(248,113,113,.04));transform:translateY(-1px)}.logout-button>span{display:grid;width:36px;height:36px;place-items:center;border-radius:10px;background:rgba(248,113,113,.12);font-size:18px}.logout-button>div{display:flex;flex-direction:column;gap:2px}.logout-button strong{font-size:11px}.logout-button small{color:var(--color-text-muted);font-size:8px}.logout-button>b{padding:6px 10px;border-radius:8px;color:#fff;background:#be123c;font-size:9px}
@media(max-width:700px){.language-grid{grid-template-columns:1fr}.legal-list{grid-template-columns:1fr}.settings-card{padding:15px}.logout-button{grid-template-columns:36px 1fr}.logout-button>b{display:none}}
</style>
