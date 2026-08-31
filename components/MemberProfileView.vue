<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import { validateMemberBirthday, validateMemberEmail, validateMemberNickname } from '~/utils/memberProfile'

const props = withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false })
const emit = defineEmits<{ close: [] }>()

type BindingProvider = 'phone' | 'google'

const { isLoggedIn, userInfo, openLogin, updateProfile, setAccountBinding } = useAppState()
const { openLogoutConfirm } = useLogoutState()
const { activeSection } = useMemberProfileState()
const showVipTargetModal = ref(false)
const showAvatarPicker = ref(false)
const avatarPickerTab = ref<'avatar' | 'frame'>('avatar')
const pendingAvatarId = ref(1)
const profileNotice = ref('')
const profileErrors = reactive({ name: '', email: '', birthday: '' })
const showProfileConfirm = ref(false)
const profileSaving = ref(false)
const pendingProfileSave = ref<{ name: string; email: string; birthday: string; bio: string } | null>(null)
const bindingLoading = ref<BindingProvider | null>(null)
const bindingStage = ref<'idle' | 'phone-entry' | 'phone-code'>('idle')
const phoneForm = ref('')
const phoneCode = ref('')
const phoneError = ref('')
const phoneCountdown = ref(0)
const phoneVerifying = ref(false)
let phoneTimer: ReturnType<typeof setInterval> | null = null

const profileForm = reactive({ name: '', email: '', birthday: '', bio: '' })
const avatars = [
  { id: 1, emoji: '👤', name: '初心者' }, { id: 2, emoji: '🦁', name: '雄獅' },
  { id: 3, emoji: '🐉', name: '神龍' }, { id: 4, emoji: '⭐', name: '星耀' },
  { id: 5, emoji: '🃏', name: '王牌' }, { id: 6, emoji: '👑', name: '王者' },
  { id: 7, emoji: '🐱', name: '幸運貓' }, { id: 8, emoji: '🎲', name: '骰王' },
  { id: 9, emoji: '🧧', name: '招財' }, { id: 10, emoji: '🦊', name: '靈狐' },
  { id: 11, emoji: '🐼', name: '國寶', requirement: 'VIP5' }, { id: 12, emoji: '🦄', name: '獨角獸', requirement: 'VIP5' },
  { id: 13, emoji: '🐯', name: '猛虎', requirement: '活動限定' }, { id: 14, emoji: '🦅', name: '蒼鷹', requirement: '活動限定' },
  { id: 15, emoji: '🐺', name: '狼王', requirement: 'VIP8' }, { id: 16, emoji: '🦈', name: '深海王', requirement: 'VIP8' },
  { id: 17, emoji: '🔥', name: '焰心', requirement: '活動限定' }, { id: 18, emoji: '💎', name: '鑽耀', requirement: 'VIP10' },
  { id: 19, emoji: '🌙', name: '月影', requirement: '活動限定' }, { id: 20, emoji: '🪐', name: '星軌', requirement: 'VIP10' },
]
const bindingOptions: { key: BindingProvider; label: string; mark: string; description: string }[] = [
  { key: 'phone', label: '手機號碼', mark: '09', description: '使用驗證碼登入與帳號復原' },
  { key: 'google', label: 'Google', mark: 'G', description: '連結 Google 快速登入' },
]
const sections = [
  { key: 'profile' as const, label: '個人資料', mark: '人' },
  { key: 'bindings' as const, label: '帳號綁定', mark: '鏈' },
  { key: 'vip' as const, label: 'VIP 等級', mark: 'V' },
  { key: 'history' as const, label: '遊戲紀錄', mark: '錄' },
]
const vipUpgrade = siteContent.member.vipUpgrade
const vipLevels = siteContent.member.vipLevels
const birthdayMax = computed(() => {
  const today = new Date()
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
})
const nextVipLevel = computed(() => vipLevels.find(vip => vip.level === userInfo.value.vip + 1) ?? null)
const isMaxVip = computed(() => !nextVipLevel.value)
const depositPct = computed(() => Math.min(100, Math.round(vipUpgrade.deposit.current / vipUpgrade.deposit.target * 100)))
const wagerPct = computed(() => Math.min(100, Math.round(vipUpgrade.wager.current / vipUpgrade.wager.target * 100)))

function resetProfileForm() {
  profileForm.name = userInfo.value.name
  profileForm.email = userInfo.value.email
  profileForm.birthday = userInfo.value.birthday
  profileForm.bio = userInfo.value.bio
  pendingAvatarId.value = userInfo.value.avatarId
  profileErrors.name = ''
  profileErrors.email = ''
  profileErrors.birthday = ''
}

onMounted(resetProfileForm)
watch(isLoggedIn, loggedIn => { if (loggedIn) resetProfileForm() })
onUnmounted(() => { if (phoneTimer) clearInterval(phoneTimer) })

function validateProfile() {
  profileErrors.name = validateMemberNickname(profileForm.name)
  profileErrors.email = userInfo.value.emailLocked ? '' : validateMemberEmail(profileForm.email)
  profileErrors.birthday = userInfo.value.birthdayLocked ? '' : validateMemberBirthday(profileForm.birthday)
  return !profileErrors.name && !profileErrors.email && !profileErrors.birthday
}

function saveProfile() {
  profileNotice.value = ''
  if (!validateProfile()) return
  pendingProfileSave.value = { name: profileForm.name.trim(), email: profileForm.email.trim(), birthday: profileForm.birthday, bio: profileForm.bio.trim() }
  const hasOneTimeFields = (!userInfo.value.emailLocked && !!profileForm.email.trim()) || (!userInfo.value.birthdayLocked && !!profileForm.birthday)
  if (hasOneTimeFields) { showProfileConfirm.value = true; return }
  void commitProfileSave()
}

async function commitProfileSave() {
  if (!pendingProfileSave.value) return
  profileSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  const next = pendingProfileSave.value
  updateProfile({
    name: next.name,
    email: next.email,
    emailLocked: userInfo.value.emailLocked || !!next.email,
    birthday: next.birthday,
    birthdayLocked: userInfo.value.birthdayLocked || !!next.birthday,
    bio: next.bio,
  })
  profileSaving.value = false
  pendingProfileSave.value = null
  showProfileConfirm.value = false
  profileNotice.value = '個人資料已儲存'
}

function cancelProfileSave() {
  pendingProfileSave.value = null
  showProfileConfirm.value = false
}

function openAvatarPicker() {
  pendingAvatarId.value = userInfo.value.avatarId
  avatarPickerTab.value = 'avatar'
  showAvatarPicker.value = true
}

function selectAvatar(id: number) {
  if (id > 10) { profileNotice.value = '此頭像目前尚未開放'; return }
  pendingAvatarId.value = id
}

function saveAvatar() {
  const selected = avatars.find(item => item.id === pendingAvatarId.value)
  if (!selected || pendingAvatarId.value > 10) return
  updateProfile({ avatar: selected.emoji, avatarId: selected.id })
  showAvatarPicker.value = false
  profileNotice.value = '頭像已更新'
}

function startPhoneBinding() {
  phoneForm.value = ''
  phoneCode.value = ''
  phoneError.value = ''
  bindingStage.value = 'phone-entry'
}

function startPhoneCountdown() {
  if (phoneTimer) clearInterval(phoneTimer)
  phoneCountdown.value = 60
  phoneTimer = setInterval(() => {
    phoneCountdown.value -= 1
    if (phoneCountdown.value <= 0 && phoneTimer) {
      clearInterval(phoneTimer)
      phoneTimer = null
    }
  }, 1000)
}

function sendPhoneCode() {
  phoneError.value = ''
  if (!/^09\d{8}$/.test(phoneForm.value)) {
    phoneError.value = '請輸入正確的 10 碼手機號碼'
    return
  }
  phoneCode.value = ''
  bindingStage.value = 'phone-code'
  startPhoneCountdown()
}

async function verifyPhoneCode() {
  phoneError.value = ''
  if (!/^\d{6}$/.test(phoneCode.value)) {
    phoneError.value = '請輸入 6 碼驗證碼'
    return
  }
  if (phoneCode.value !== '123456') {
    phoneError.value = '驗證碼錯誤，請重新輸入'
    return
  }
  phoneVerifying.value = true
  await new Promise(resolve => setTimeout(resolve, 650))
  updateProfile({ phone: `${phoneForm.value.slice(0, 4)}***${phoneForm.value.slice(-3)}` })
  setAccountBinding('phone', true)
  phoneVerifying.value = false
  bindingStage.value = 'idle'
  phoneCode.value = ''
  phoneError.value = ''
  if (phoneTimer) { clearInterval(phoneTimer); phoneTimer = null }
  phoneCountdown.value = 0
  profileNotice.value = '手機號碼綁定成功'
}

async function bindGoogle() {
  if (userInfo.value.accountBindings.google || bindingLoading.value) return
  bindingLoading.value = 'google'
  await new Promise(resolve => setTimeout(resolve, 850))
  setAccountBinding('google', true)
  bindingLoading.value = null
  profileNotice.value = 'Google 綁定成功'
}
</script>

<template>
  <div v-if="!isLoggedIn" class="member-profile-view member-login-gate">
    <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
      <div class="text-5xl mb-4">🔒</div>
      <h1 class="text-xl font-black mb-2">個人資訊</h1>
      <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可管理個人資料、帳號綁定與 VIP 等級</p>
      <button class="btn-gold w-full justify-center" @click="openLogin('/lobby/member')">立即登入 / 註冊</button>
    </div>
  </div>

  <div v-else class="member-profile-view" :class="{ 'member-profile-view--embedded': props.embedded }">
    <header class="member-page-heading">
      <div>
        <p class="section-kicker">PLAYER PROFILE</p>
        <h1 :id="props.embedded ? 'member-profile-modal-title' : undefined">{{ props.embedded ? '玩家資料' : '個人資訊' }}</h1>
      </div>
      <button v-if="props.embedded" class="member-page-close" type="button" aria-label="關閉玩家資料" @click="emit('close')">×</button>
    </header>

    <header class="member-identity">
      <button class="member-avatar" aria-label="更換頭像" type="button" @click="openAvatarPicker"><span>{{ userInfo.avatar }}</span><i>編輯</i></button>
      <div class="member-name">
        <p>PLAYER PROFILE</p>
        <h2>{{ userInfo.name }}</h2>
        <div class="member-identity-meta"><span>帳號 {{ userInfo.account }}</span><span>ID #{{ userInfo.id }}</span><b>VIP {{ userInfo.vip }}</b></div>
      </div>
      <WalletBalances :user="userInfo" variant="cards" />
    </header>
    <p v-if="profileNotice" class="profile-notice" role="status">{{ profileNotice }}</p>

    <section v-if="showAvatarPicker" class="avatar-picker">
      <header><div><p>AVATAR COLLECTION</p><h2>選擇頭像</h2></div><button type="button" aria-label="關閉頭像選擇" @click="showAvatarPicker = false">×</button></header>
      <div class="avatar-picker-tabs" role="tablist" aria-label="頭像設定"><button type="button" role="tab" :aria-selected="avatarPickerTab === 'avatar'" :class="{ active: avatarPickerTab === 'avatar' }" @click="avatarPickerTab = 'avatar'">頭像</button><button type="button" role="tab" :aria-selected="avatarPickerTab === 'frame'" :class="{ active: avatarPickerTab === 'frame' }" @click="avatarPickerTab = 'frame'">頭像框</button></div>
      <div v-if="avatarPickerTab === 'avatar'" class="avatar-grid"><button v-for="avatar in avatars" :key="avatar.id" type="button" :aria-label="`${avatar.name} ${avatar.requirement ? `（${avatar.requirement}）` : ''}`" :class="{ active: pendingAvatarId === avatar.id, locked: avatar.id > 10 }" @click="selectAvatar(avatar.id)"><span>{{ avatar.emoji }}</span><small>{{ avatar.id > 10 ? avatar.requirement : `#${avatar.id}` }}</small></button></div>
      <div v-else class="avatar-frame-coming"><span aria-hidden="true">▣</span><strong>頭像框</strong><small>即將推出</small><button type="button" disabled>尚未開放</button></div>
      <button v-if="avatarPickerTab === 'avatar'" type="button" class="btn-gold avatar-save" :disabled="pendingAvatarId > 10" @click="saveAvatar">儲存頭像</button>
    </section>

    <div class="member-sections" role="tablist" aria-label="玩家資料分頁">
      <button v-for="section in sections" :key="section.key" type="button" role="tab" :aria-selected="activeSection === section.key" :class="{ active: activeSection === section.key }" @click="activeSection = section.key"><span aria-hidden="true">{{ section.mark }}</span>{{ section.label }}</button>
    </div>

    <section v-if="activeSection === 'profile'" class="member-content profile-editor">
      <header><div><p>EDIT PROFILE</p><h2>編輯個人資料</h2></div><button class="btn-gold" type="button" :disabled="profileSaving" @click="saveProfile">{{ profileSaving ? '儲存中…' : '儲存變更' }}</button></header>
      <div class="profile-grid">
        <div><label class="input-label" for="profile-account">帳號</label><input id="profile-account" :value="userInfo.account" class="input-field input-readonly" readonly disabled /></div>
        <div><label class="input-label" for="profile-id">玩家 ID</label><input id="profile-id" :value="userInfo.id" class="input-field input-readonly" readonly disabled /></div>
        <div><label class="input-label" for="profile-name">暱稱</label><input id="profile-name" v-model="profileForm.name" class="input-field" maxlength="20" :aria-invalid="!!profileErrors.name" aria-describedby="profile-name-error" /><small v-if="profileErrors.name" id="profile-name-error" class="profile-field-error">{{ profileErrors.name }}</small></div>
        <div><label class="input-label" for="profile-email">電子郵件 <em v-if="userInfo.emailLocked">（已設定）</em></label><input id="profile-email" v-model="profileForm.email" type="email" class="input-field" :readonly="userInfo.emailLocked" :disabled="userInfo.emailLocked" :aria-invalid="!!profileErrors.email" aria-describedby="profile-email-error" /><small v-if="profileErrors.email" id="profile-email-error" class="profile-field-error">{{ profileErrors.email }}</small></div>
        <div><label class="input-label" for="profile-birthday">生日 <em v-if="userInfo.birthdayLocked">（已設定）</em></label><input id="profile-birthday" v-model="profileForm.birthday" type="date" class="input-field" min="1900-01-01" :max="birthdayMax" :readonly="userInfo.birthdayLocked" :disabled="userInfo.birthdayLocked" :aria-invalid="!!profileErrors.birthday" aria-describedby="profile-birthday-error" /><small v-if="profileErrors.birthday" id="profile-birthday-error" class="profile-field-error">{{ profileErrors.birthday }}</small></div>
        <div><label class="input-label">手機號碼</label><input :value="userInfo.phone || '尚未綁定'" class="input-field input-readonly" readonly disabled /></div>
        <div class="profile-bio"><label class="input-label" for="profile-bio">個人簡介</label><textarea id="profile-bio" v-model="profileForm.bio" class="input-field" rows="4" maxlength="120" /><small>{{ profileForm.bio.length }} / 120</small></div>
      </div>
    </section>

    <section v-else-if="activeSection === 'bindings'" class="member-content">
      <header><div><p>ACCOUNT SECURITY</p><h2>帳號綁定</h2></div><span>綁定後無法解除</span></header>
      <div class="binding-list">
        <article v-for="option in bindingOptions" :key="option.key">
          <div class="binding-mark" :class="`provider-${option.key}`">{{ option.mark }}</div>
          <div><strong>{{ option.label }}</strong><small>{{ option.description }}</small></div>
          <span :class="{ bound: userInfo.accountBindings[option.key] }">{{ userInfo.accountBindings[option.key] ? '已綁定' : '未綁定' }}</span>
          <button v-if="option.key === 'phone' && !userInfo.accountBindings.phone" type="button" @click="startPhoneBinding">綁定</button>
          <button v-else-if="option.key === 'google' && !userInfo.accountBindings.google" type="button" :disabled="bindingLoading === 'google'" @click="bindGoogle">{{ bindingLoading === 'google' ? '連線中…' : '綁定' }}</button>
          <button v-else type="button" disabled>已綁定</button>
        </article>
      </div>
      <div v-if="bindingStage === 'phone-entry'" class="phone-binding-panel">
        <label class="input-label" for="binding-phone">手機號碼</label>
        <div class="phone-binding-row"><input id="binding-phone" v-model="phoneForm" class="input-field" inputmode="numeric" maxlength="10" placeholder="09xxxxxxxx" @input="phoneForm = phoneForm.replace(/\D/g, '')" /><button type="button" class="btn-gold" @click="sendPhoneCode">發送驗證碼</button></div>
        <small class="binding-hint">僅支援台灣 09 開頭的 10 碼手機號碼</small>
        <p v-if="phoneError" class="profile-field-error" role="alert">{{ phoneError }}</p>
      </div>
      <div v-else-if="bindingStage === 'phone-code'" class="phone-binding-panel">
        <label class="input-label" for="binding-code">驗證碼</label>
        <div class="phone-binding-row"><input id="binding-code" v-model="phoneCode" class="input-field" inputmode="numeric" maxlength="6" placeholder="請輸入 6 碼驗證碼" @input="phoneCode = phoneCode.replace(/\D/g, '')" /><button type="button" class="btn-gold" :disabled="phoneVerifying" @click="verifyPhoneCode">{{ phoneVerifying ? '驗證中…' : '確認驗證' }}</button></div>
        <div class="binding-code-meta"><small>測試驗證碼：123456</small><button type="button" :disabled="phoneCountdown > 0" @click="sendPhoneCode">{{ phoneCountdown > 0 ? `${phoneCountdown} 秒後可重發` : '重新發送' }}</button></div>
        <p v-if="phoneError" class="profile-field-error" role="alert">{{ phoneError }}</p>
      </div>
    </section>

    <section v-else-if="activeSection === 'vip'" class="member-content vip-content"><header><div><p>VIP JOURNEY</p><h2>VIP {{ userInfo.vip }} 升級進度</h2></div><button v-if="nextVipLevel" class="btn-outline-purple" type="button" @click="showVipTargetModal = true">查看 {{ nextVipLevel.name }} 條件</button></header><div v-if="!isMaxVip" class="vip-progress-grid"><article><div><span>累積儲值（金幣）</span><strong>{{ vipUpgrade.deposit.current.toLocaleString() }} / {{ vipUpgrade.deposit.target.toLocaleString() }}</strong></div><i><b :style="{ width: `${depositPct}%` }" /></i><small>升級必須同時達成</small></article><article><div><span>累積投注（金幣）</span><strong>{{ vipUpgrade.wager.current.toLocaleString() }} / {{ vipUpgrade.wager.target.toLocaleString() }}</strong></div><i><b :style="{ width: `${wagerPct}%` }" /></i><small>升級必須同時達成</small></article></div><div class="vip-level-grid"><article v-for="vip in vipLevels" :key="vip.level" :class="{ current: vip.level === userInfo.vip }"><span :style="{ color: vip.color }">VIP {{ vip.level }}</span><strong>返水 {{ vip.rebate }}</strong><small>{{ vip.feeDiscount }}</small></article></div></section>

    <section v-else class="member-content"><header><div><p>GAME HISTORY</p><h2>遊戲紀錄</h2></div></header><LobbyGameRecords /></section>
    <button class="member-logout" type="button" @click="openLogoutConfirm">登出目前帳號</button>

    <div v-if="showProfileConfirm" class="profile-confirm-overlay" role="alertdialog" aria-modal="true" aria-labelledby="profile-confirm-title">
      <div class="profile-confirm-card"><h2 id="profile-confirm-title">確認儲存資料？</h2><p>生日與電子郵件設定後將無法再次修改，請確認資料正確。</p><div><button type="button" class="btn-outline-purple" @click="cancelProfileSave">取消</button><button type="button" class="btn-gold" :disabled="profileSaving" @click="commitProfileSave">{{ profileSaving ? '儲存中…' : '確認儲存' }}</button></div></div>
    </div>

    <ClientOnly><Teleport to="body"><Transition name="modal-fade"><div v-if="showVipTargetModal && nextVipLevel" class="modal-overlay" role="dialog" aria-modal="true" @click.self="showVipTargetModal = false"><div class="modal-box" style="max-width:440px"><div class="modal-inner"><button class="modal-close" type="button" aria-label="關閉 VIP 條件" @click="showVipTargetModal = false">×</button><p class="member-modal-kicker">NEXT VIP LEVEL</p><h2 class="modal-title">{{ nextVipLevel.name }} 條件</h2><div class="vip-benefits"><div><span>返水</span><strong>{{ nextVipLevel.rebate }}</strong></div><div><span>手續費</span><strong>{{ nextVipLevel.feeDiscount }}</strong></div></div><section class="vip-condition"><span>升級條件・需同時達成</span><p>{{ nextVipLevel.upgradeRequirement }}</p></section><section class="vip-condition"><span>保級條件・擇一達成</span><p>{{ nextVipLevel.maintainRequirement }}</p></section></div></div></div></Transition></Teleport></ClientOnly>
  </div>
</template>

<style scoped>
.member-profile-view { max-width: 1180px; margin: 0 auto; }
.member-profile-view--embedded { max-width: none; }
.member-page-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:14px; }
.member-page-heading h1 { margin: 3px 0 0; font-size: 24px; font-weight: 900; }
.section-kicker,.member-name p,.member-content header p,.avatar-picker header p,.member-modal-kicker { margin:0; color:var(--color-gold); font-size:8px; font-weight:900; letter-spacing:.17em; }
.member-page-close { padding: 1px 9px; color:var(--color-text-muted); background:none; font-size:28px; line-height:1; }
.member-identity { display:grid; grid-template-columns:92px 1fr minmax(300px,430px); align-items:center; gap:18px; padding:18px; margin-bottom:14px; border:1px solid rgba(245,200,66,.23); border-radius:20px; background:linear-gradient(145deg,rgba(245,200,66,.07),rgba(168,85,247,.06)); }
.member-avatar { position:relative; width:82px; height:82px; border:3px solid var(--color-gold); border-radius:50%; background:linear-gradient(145deg,#6b21a8,#a855f7); font-size:38px; }
.member-avatar i { position:absolute; left:50%; bottom:-7px; transform:translateX(-50%); padding:3px 8px; border-radius:99px; color:#1b0a25; background:var(--color-gold); font-size:8px; font-style:normal; font-weight:900; }
.member-name h2 { margin:4px 0; font-size:25px; }
.member-identity-meta { display:flex; flex-wrap:wrap; gap:7px; }
.member-identity-meta span,.member-identity-meta b { padding:4px 7px; border-radius:7px; color:var(--color-text-muted); background:rgba(255,255,255,.05); font-size:8px; }
.member-identity-meta b { color:var(--color-gold); }
.profile-notice { padding:9px 12px; border:1px solid rgba(74,222,128,.25); border-radius:9px; color:#86efac; background:rgba(74,222,128,.08); font-size:10px; }
.avatar-picker { padding:16px; margin-bottom:14px; border:1px solid var(--color-border); border-radius:17px; background:rgba(15,0,32,.72); }
.avatar-picker header,.member-content>header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:14px; }
.avatar-picker h2,.member-content h2 { margin:3px 0; font-size:19px; }
.avatar-picker header button { color:var(--color-text-muted); background:none; font-size:22px; }
.avatar-picker-tabs { display:flex; gap:6px; margin-bottom:10px; }
.avatar-picker-tabs button { flex:1; padding:8px; border:1px solid var(--color-border); border-radius:9px; color:var(--color-text-muted); background:rgba(168,85,247,.05); font-size:10px; font-weight:800; }
.avatar-picker-tabs button.active { color:#1b0a25; border-color:var(--color-gold); background:var(--color-gold); }
.avatar-grid { display:grid; grid-template-columns:repeat(10,1fr); gap:7px; }
.avatar-grid button { display:flex; flex-direction:column; align-items:center; padding:8px 4px; border:1px solid var(--color-border); border-radius:11px; background:rgba(168,85,247,.05); }
.avatar-picker button>span { font-size:25px; }.avatar-picker button>small { color:var(--color-text-muted); font-size:7px; }
.avatar-picker button.active { border-color:var(--color-gold); background:rgba(245,200,66,.1); }.avatar-picker button.locked { filter:grayscale(1); opacity:.45; }
.avatar-save { width:100%; justify-content:center; margin-top:12px; }.avatar-save:disabled { opacity:.45; cursor:not-allowed; }
.avatar-frame-coming { display:flex; flex-direction:column; align-items:center; gap:5px; padding:24px 12px; border:1px dashed var(--color-border); border-radius:12px; color:var(--color-text-muted); }.avatar-frame-coming>span { color:var(--color-gold); font-size:30px; }.avatar-frame-coming strong { color:var(--color-text); font-size:12px; }.avatar-frame-coming small { font-size:9px; }.avatar-frame-coming button { padding:7px 12px; margin-top:6px; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:var(--color-text-muted); background:rgba(255,255,255,.05); font-size:9px; }
.member-sections { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; padding:6px; margin-bottom:14px; border:1px solid var(--color-border); border-radius:15px; background:rgba(15,0,32,.58); }
.member-sections button { display:flex; align-items:center; justify-content:center; gap:7px; padding:10px; border-radius:10px; color:var(--color-text-muted); font-size:10px; font-weight:800; }
.member-sections button span { display:grid; width:23px; height:23px; place-items:center; border-radius:7px; background:rgba(168,85,247,.1); font-size:8px; }.member-sections button.active { color:#1b0a25; background:var(--color-gold); }
.member-content { padding:20px; margin-bottom:14px; border:1px solid var(--color-border); border-radius:18px; background:rgba(26,10,46,.66); }.member-content header>span { color:var(--color-text-muted); font-size:9px; }
.profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }.profile-bio { position:relative; grid-column:1/-1; }.profile-bio textarea { resize:vertical; }.profile-bio small { position:absolute; right:8px; bottom:7px; color:var(--color-text-muted); font-size:8px; }
.profile-grid em { color:var(--color-text-muted); font-size:8px; font-style:normal; }.input-readonly { opacity:.65; cursor:not-allowed; }.profile-field-error { display:block; margin-top:5px; color:#fca5a5; font-size:9px; }
.binding-list { display:grid; gap:8px; }.binding-list article { display:grid; grid-template-columns:40px 1fr auto 70px; align-items:center; gap:11px; padding:12px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(0,0,0,.14); }.binding-mark { display:grid; width:38px; height:38px; place-items:center; border-radius:11px; color:#fff; background:#6b21a8; font-size:11px; font-weight:900; }.provider-facebook { background:#1877f2; }.provider-line { background:#06c755; }.provider-apple { background:#555; }.provider-google { background:#ea4335; }.binding-list article>div:nth-child(2) { display:flex; flex-direction:column; }.binding-list strong { font-size:11px; }.binding-list small { color:var(--color-text-muted); font-size:8px; }.binding-list article>span { padding:4px 7px; border-radius:99px; color:var(--color-text-muted); background:rgba(255,255,255,.05); font-size:8px; }.binding-list article>span.bound { color:#86efac; background:rgba(74,222,128,.08); }.binding-list article>button { padding:7px; border:1px solid var(--color-border); border-radius:8px; color:var(--color-purple-light); font-size:9px; font-weight:800; }
.phone-binding-panel { padding:14px; margin-top:12px; border:1px solid rgba(168,85,247,.22); border-radius:12px; background:rgba(15,0,32,.35); }.phone-binding-row { display:flex; gap:8px; }.phone-binding-row .input-field { flex:1; }.phone-binding-row .btn-gold { flex-shrink:0; padding-inline:16px; justify-content:center; }.binding-hint { display:block; margin-top:6px; color:var(--color-text-muted); font-size:9px; }.binding-code-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:7px; }.binding-code-meta small { color:var(--color-text-muted); font-size:9px; }.binding-code-meta button { color:var(--color-purple-light); font-size:9px; }.binding-code-meta button:disabled { color:var(--color-text-muted); cursor:not-allowed; }
.vip-progress-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.vip-progress-grid article { padding:14px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(0,0,0,.14); }.vip-progress-grid article>div { display:flex; justify-content:space-between; font-size:10px; }.vip-progress-grid strong { color:var(--color-gold); }.vip-progress-grid i { display:block; height:7px; margin:10px 0 5px; overflow:hidden; border-radius:99px; background:rgba(168,85,247,.12); }.vip-progress-grid b { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#a855f7,#f5c842); }.vip-progress-grid small { color:var(--color-text-muted); font-size:8px; }
.vip-level-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; margin-top:12px; }.vip-level-grid article { display:flex; flex-direction:column; gap:3px; padding:10px; border:1px solid rgba(255,255,255,.07); border-radius:10px; background:rgba(0,0,0,.12); }.vip-level-grid article.current { border-color:var(--color-gold); background:rgba(245,200,66,.08); }.vip-level-grid span { font-size:9px; font-weight:900; }.vip-level-grid strong { font-size:9px; }.vip-level-grid small { color:var(--color-text-muted); font-size:7px; }
.member-logout { width:100%; padding:11px; border:1px solid rgba(248,113,113,.24); border-radius:11px; color:#fca5a5; background:rgba(248,113,113,.07); font-size:10px; font-weight:900; }.member-modal-kicker { text-align:center; }.vip-benefits { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }.vip-benefits>div { padding:12px; border:1px solid rgba(245,200,66,.17); border-radius:11px; background:rgba(245,200,66,.05); }.vip-benefits span,.vip-benefits strong { display:block; }.vip-benefits span { color:var(--color-text-muted); font-size:8px; }.vip-benefits strong { margin-top:3px; color:var(--color-gold); font-size:14px; }.vip-condition { padding:12px; margin-top:8px; border:1px solid var(--color-border); border-radius:11px; background:rgba(168,85,247,.07); }.vip-condition span { color:var(--color-purple-light); font-size:9px; font-weight:900; }.vip-condition p { margin:5px 0 0; color:var(--color-text-muted); font-size:10px; line-height:1.7; }
.profile-confirm-overlay { position:fixed; inset:0; z-index:1100; display:grid; place-items:center; padding:16px; background:rgba(0,0,0,.58); backdrop-filter:blur(4px); }.profile-confirm-card { width:min(420px,100%); padding:22px; border:1px solid rgba(255,255,255,.22); border-radius:17px; background:linear-gradient(160deg,#3a315d,#211a3c); box-shadow:0 16px 48px rgba(0,0,0,.5); }.profile-confirm-card h2 { margin:0 0 8px; font-size:18px; }.profile-confirm-card p { margin:0; color:var(--color-text-muted); font-size:11px; line-height:1.7; }.profile-confirm-card>div { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }.profile-confirm-card button { min-width:92px; justify-content:center; }
@media(max-width:800px){.member-identity{grid-template-columns:74px 1fr}.member-identity>.wallet-balances{grid-column:1/-1}.member-avatar{width:68px;height:68px}.avatar-grid{grid-template-columns:repeat(5,1fr)}.vip-level-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:520px){.member-sections{grid-template-columns:1fr 1fr}.profile-grid,.vip-progress-grid{grid-template-columns:1fr}.binding-list article{grid-template-columns:36px 1fr auto}.binding-list article>span{display:none}.phone-binding-row{flex-direction:column}.phone-binding-row .btn-gold{width:100%;justify-content:center}.vip-level-grid{grid-template-columns:repeat(2,1fr)}}
</style>
