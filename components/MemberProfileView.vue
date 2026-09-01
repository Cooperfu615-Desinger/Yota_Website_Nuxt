<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import { validateMemberBirthday, validateMemberEmail, validateMemberNickname } from '~/utils/memberProfile'

const props = withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false })
const emit = defineEmits<{ close: [] }>()

type BindingProvider = 'phone' | 'google'

const { isLoggedIn, userInfo, openLogin, updateProfile, setAccountBinding } = useAppState()
const { openLogoutConfirm } = useLogoutState()
const { activeSection, sessionKey } = useMemberProfileState()
const fieldIdPrefix = computed(() => props.embedded ? 'member-modal-' : 'member-page-')
const showVipOverviewModal = ref(false)
const vipOverviewTableWrap = ref<HTMLElement | null>(null)
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
  { id: 1, emoji: '🐯', name: '猛虎' }, { id: 2, emoji: '🦁', name: '雄獅' },
  { id: 3, emoji: '🐉', name: '神龍' }, { id: 4, emoji: '🦊', name: '狐狸' },
  { id: 5, emoji: '🐺', name: '惡狼' }, { id: 6, emoji: '🦅', name: '老鷹' },
  { id: 7, emoji: '🐼', name: '熊貓' }, { id: 8, emoji: '🦄', name: '獨角獸' },
  { id: 9, emoji: '🔥', name: '鳳凰' }, { id: 10, emoji: '❔', name: '謎面' },
  { id: 11, emoji: '👑', name: '王冠', requirement: 'VIP 5+' }, { id: 12, emoji: '💎', name: '鑽耀', requirement: 'VIP 10+' },
  { id: 13, emoji: '🌙', name: '月影', requirement: 'VIP 10+' }, { id: 14, emoji: '⭐', name: '星芒', requirement: 'VIP 10+' },
  { id: 15, emoji: '🪐', name: '星軌', requirement: 'VIP 10+' }, { id: 16, emoji: '🦈', name: '深海', requirement: '活動獎勵' },
  { id: 17, emoji: '🧧', name: '招財', requirement: '活動獎勵' }, { id: 18, emoji: '🎴', name: '花札', requirement: '活動獎勵' },
  { id: 19, emoji: '🎯', name: '必中', requirement: '活動獎勵' }, { id: 20, emoji: '🏆', name: '冠軍', requirement: '活動獎勵' },
]
const bindingOptions: { key: BindingProvider; label: string; mark: string; description: string }[] = [
  { key: 'phone', label: '手機號碼', mark: '09', description: '使用驗證碼登入與帳號復原' },
  { key: 'google', label: 'Google', mark: 'G', description: '連結 Google 快速登入' },
]
const sections = [
  { key: 'profile' as const, label: '基本資料', mark: '人' },
  { key: 'bindings' as const, label: '帳號綁定', mark: '鏈' },
  { key: 'vip' as const, label: 'VIP 等級', mark: 'V' },
  { key: 'history' as const, label: '遊戲紀錄', mark: '錄' },
]
const vipUpgradeSeed = siteContent.member.vipUpgrade
const vipLevels = siteContent.member.vipLevels
const birthdayMax = computed(() => {
  const today = new Date()
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
})
const nextVipLevel = computed(() => vipLevels.find(vip => vip.level === userInfo.value.vip + 1) ?? null)
const currentVipLevel = computed(() => vipLevels.find(vip => vip.level === userInfo.value.vip) ?? vipLevels[0])
const vipUpgrade = computed(() => userInfo.value.vip === 0
  ? { ...vipUpgradeSeed, historicalDeposit: 0, historicalWager: 0, monthlyDeposit: 0, monthlyWager: 0, activeDays: 0, highestVip: 0, upgradeProtection: false, deposit: { current: 0, target: nextVipLevel.value?.historicalDeposit ?? 0 }, wager: { current: 0, target: nextVipLevel.value?.monthlyWager ?? 0 } }
  : vipUpgradeSeed)
const isMaxVip = computed(() => !nextVipLevel.value)
const isVip2Undefined = computed(() => nextVipLevel.value?.level === 2 && nextVipLevel.value.historicalDeposit === null)
const depositPct = computed(() => vipUpgrade.value.deposit.target ? Math.min(100, Math.round(vipUpgrade.value.deposit.current / vipUpgrade.value.deposit.target * 100)) : 0)
const wagerPct = computed(() => vipUpgrade.value.wager.target ? Math.min(100, Math.round(vipUpgrade.value.wager.current / vipUpgrade.value.wager.target * 100)) : 0)
const maintainDepositPct = computed(() => currentVipLevel.value.monthlyDeposit ? Math.min(100, Math.round(vipUpgrade.value.monthlyDeposit / currentVipLevel.value.monthlyDeposit * 100)) : 100)
const maintainWagerPct = computed(() => currentVipLevel.value.monthlyWager ? Math.min(100, Math.round(vipUpgrade.value.monthlyWager / currentVipLevel.value.monthlyWager * 100)) : 100)
const maintainActivePct = computed(() => currentVipLevel.value.activeDays ? Math.min(100, Math.round(vipUpgrade.value.activeDays / currentVipLevel.value.activeDays * 100)) : 100)
const maintainReady = computed(() => maintainDepositPct.value >= 100 && maintainWagerPct.value >= 100 && maintainActivePct.value >= 100)

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
watch(showVipOverviewModal, async opened => {
  if (!opened) return
  await nextTick()
  vipOverviewTableWrap.value?.querySelector('tr.current')?.scrollIntoView({ block: 'center' })
})
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
  profileNotice.value = '個人資料已更新'
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
    phoneError.value = '請輸入 09 開頭的 10 碼手機號碼'
    return
  }
  phoneCode.value = ''
  bindingStage.value = 'phone-code'
  startPhoneCountdown()
  profileNotice.value = '驗證碼已發送（Mock：123456）'
}

async function verifyPhoneCode() {
  phoneError.value = ''
  if (!/^\d{6}$/.test(phoneCode.value)) {
    phoneError.value = '請輸入 6 碼驗證碼'
    return
  }
  if (phoneCode.value !== '123456') {
    phoneError.value = '驗證碼錯誤，請輸入 123456'
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

    <div v-if="showAvatarPicker" class="avatar-picker-overlay" role="dialog" aria-modal="true" :aria-labelledby="`${fieldIdPrefix}avatar-picker-title`">
      <section class="avatar-picker">
        <header><div><p>AVATAR COLLECTION</p><h2 :id="`${fieldIdPrefix}avatar-picker-title`">選擇頭像</h2></div><button type="button" aria-label="關閉頭像選擇" @click="showAvatarPicker = false">×</button></header>
        <div class="avatar-picker-tabs" role="tablist" aria-label="頭像設定"><button type="button" role="tab" :aria-selected="avatarPickerTab === 'avatar'" :class="{ active: avatarPickerTab === 'avatar' }" @click="avatarPickerTab = 'avatar'">頭像</button><button type="button" role="tab" :aria-selected="avatarPickerTab === 'frame'" :class="{ active: avatarPickerTab === 'frame' }" @click="avatarPickerTab = 'frame'">頭像框</button></div>
        <div v-if="avatarPickerTab === 'avatar'" class="avatar-grid"><button v-for="avatar in avatars" :key="avatar.id" type="button" :disabled="avatar.id > 10" :aria-label="`${avatar.name} ${avatar.requirement ? `（${avatar.requirement}）` : ''}`" :class="{ active: pendingAvatarId === avatar.id, locked: avatar.id > 10 }" @click="selectAvatar(avatar.id)"><span>{{ avatar.emoji }}</span><small>{{ avatar.id > 10 ? avatar.requirement : `#${avatar.id}` }}</small></button></div>
        <div v-else class="avatar-frame-coming"><span aria-hidden="true">▣</span><strong>頭像框</strong><small>即將推出</small><button type="button" disabled>尚未開放</button></div>
        <button v-if="avatarPickerTab === 'avatar'" type="button" class="btn-gold avatar-save" :disabled="pendingAvatarId > 10 || pendingAvatarId === userInfo.avatarId" @click="saveAvatar">儲存頭像</button>
      </section>
    </div>

    <div class="member-sections" role="tablist" aria-label="玩家資料分頁">
      <button v-for="section in sections" :key="section.key" type="button" role="tab" :aria-selected="activeSection === section.key" :class="{ active: activeSection === section.key }" @click="activeSection = section.key"><span aria-hidden="true">{{ section.mark }}</span>{{ section.label }}</button>
    </div>

    <section v-if="activeSection === 'profile'" class="member-content profile-editor">
      <header><div><p>EDIT PROFILE</p><h2>編輯個人資料</h2><small class="profile-guide">暱稱與簡介可隨時修改；生日與電子郵件設定後不可再次變更</small></div><button class="btn-gold" type="button" :disabled="profileSaving" @click="saveProfile">{{ profileSaving ? '儲存中…' : '儲存資料' }}</button></header>
      <div class="profile-grid">
        <div><label class="input-label" :for="`${fieldIdPrefix}profile-account`">帳號</label><input :id="`${fieldIdPrefix}profile-account`" :value="userInfo.account" class="input-field input-readonly" readonly disabled /></div>
        <div><label class="input-label" :for="`${fieldIdPrefix}profile-id`">玩家 ID</label><input :id="`${fieldIdPrefix}profile-id`" :value="userInfo.id" class="input-field input-readonly" readonly disabled /></div>
        <div><label class="input-label" :for="`${fieldIdPrefix}profile-name`">暱稱</label><input :id="`${fieldIdPrefix}profile-name`" v-model="profileForm.name" class="input-field" maxlength="20" :aria-invalid="!!profileErrors.name" :aria-describedby="`${fieldIdPrefix}profile-name-error`" /><small v-if="profileErrors.name" :id="`${fieldIdPrefix}profile-name-error`" class="profile-field-error">{{ profileErrors.name }}</small></div>
        <div><label class="input-label" :for="`${fieldIdPrefix}profile-email`">電子郵件 <em v-if="userInfo.emailLocked">（已設定）</em></label><input :id="`${fieldIdPrefix}profile-email`" v-model="profileForm.email" type="email" class="input-field" :readonly="userInfo.emailLocked" :disabled="userInfo.emailLocked" :aria-invalid="!!profileErrors.email" :aria-describedby="`${fieldIdPrefix}profile-email-error`" /><small v-if="profileErrors.email" :id="`${fieldIdPrefix}profile-email-error`" class="profile-field-error">{{ profileErrors.email }}</small></div>
        <div><label class="input-label" :for="`${fieldIdPrefix}profile-birthday`">生日 <em v-if="userInfo.birthdayLocked">（已設定）</em></label><input :id="`${fieldIdPrefix}profile-birthday`" v-model="profileForm.birthday" type="date" class="input-field" min="1900-01-01" :max="birthdayMax" :readonly="userInfo.birthdayLocked" :disabled="userInfo.birthdayLocked" :aria-invalid="!!profileErrors.birthday" :aria-describedby="`${fieldIdPrefix}profile-birthday-error`" /><small v-if="profileErrors.birthday" :id="`${fieldIdPrefix}profile-birthday-error`" class="profile-field-error">{{ profileErrors.birthday }}</small></div>
        <div><label class="input-label">手機號碼</label><input :value="userInfo.phone || '尚未綁定'" class="input-field input-readonly" readonly disabled /></div>
        <div class="profile-bio"><label class="input-label" :for="`${fieldIdPrefix}profile-bio`">個人簡介</label><textarea :id="`${fieldIdPrefix}profile-bio`" v-model="profileForm.bio" class="input-field" rows="4" maxlength="120" /><small>{{ profileForm.bio.length }} / 120</small></div>
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
        <label class="input-label" :for="`${fieldIdPrefix}binding-phone`">手機號碼</label>
        <div class="phone-binding-row"><input :id="`${fieldIdPrefix}binding-phone`" v-model="phoneForm" class="input-field" inputmode="numeric" maxlength="10" placeholder="09xxxxxxxx" @input="phoneForm = phoneForm.replace(/\D/g, '')" /><button type="button" class="btn-gold" @click="sendPhoneCode">發送驗證碼</button></div>
        <small class="binding-hint">僅支援台灣 09 開頭的 10 碼手機號碼</small>
        <p v-if="phoneError" class="profile-field-error" role="alert">{{ phoneError }}</p>
      </div>
      <div v-else-if="bindingStage === 'phone-code'" class="phone-binding-panel">
        <label class="input-label" :for="`${fieldIdPrefix}binding-code`">驗證碼</label>
        <div class="phone-binding-row"><input :id="`${fieldIdPrefix}binding-code`" v-model="phoneCode" class="input-field" inputmode="numeric" maxlength="6" placeholder="請輸入 6 碼驗證碼" @input="phoneCode = phoneCode.replace(/\D/g, '')" /><button type="button" class="btn-gold" :disabled="phoneVerifying || phoneCode.length !== 6" @click="verifyPhoneCode">{{ phoneVerifying ? '驗證中…' : '確認驗證' }}</button></div>
        <div class="binding-code-meta"><small>測試驗證碼：123456</small><div><button type="button" class="binding-back" @click="startPhoneBinding">返回修改</button><button type="button" :disabled="phoneCountdown > 0" @click="sendPhoneCode">{{ phoneCountdown > 0 ? `${phoneCountdown} 秒後可重發` : '重新發送' }}</button></div></div>
        <p v-if="phoneError" class="profile-field-error" role="alert">{{ phoneError }}</p>
      </div>
    </section>

    <section v-else-if="activeSection === 'vip'" class="member-content vip-content">
      <header><div><p>VIP JOURNEY</p><h2>VIP {{ userInfo.vip }}・{{ currentVipLevel.name }}</h2></div><button class="btn-outline-purple" type="button" @click="showVipOverviewModal = true">查看全部等級</button></header>
      <div class="vip-main-grid">
        <article class="vip-panel vip-current-panel"><div class="vip-panel-label">目前等級</div><strong class="vip-current-number" :style="{ color: currentVipLevel.color }">VIP {{ userInfo.vip }}</strong><b>{{ currentVipLevel.name }}</b><div class="vip-stat-list"><span>歷史最高 <strong>VIP {{ vipUpgrade.highestVip }}</strong></span><span>歷史儲值 <strong>{{ vipUpgrade.historicalDeposit.toLocaleString() }} 金幣</strong></span><span>歷史投注 <strong>{{ vipUpgrade.historicalWager.toLocaleString() }} 金幣</strong></span></div><small class="vip-muted">每日 00:00 判定升級，月結算判定保級</small></article>
        <article class="vip-panel vip-benefit-panel"><div class="vip-panel-label">等級權益</div><div class="vip-benefit-row"><span>贈禮手續費</span><strong>{{ currentVipLevel.p2pFee }}</strong></div><div class="vip-benefit-row"><span>本級升級獎勵</span><strong>{{ currentVipLevel.upgradeReward }}</strong></div><div class="vip-benefit-row"><span>獎勵狀態</span><strong>{{ userInfo.vip === 0 ? '不適用' : '已發放' }}</strong></div><small class="vip-muted">已取得的同級獎勵不重複發放</small></article>
        <article class="vip-panel vip-upgrade-panel"><div class="vip-panel-label">升級條件・全數達成</div><div v-if="isMaxVip" class="vip-max-state">已達目前最高等級</div><div v-else-if="isVip2Undefined" class="vip-undefined-state">VIP2 升級條件待設定</div><template v-else><div class="vip-next-line"><span>下一級 VIP {{ nextVipLevel.level }}・{{ nextVipLevel.name }}</span><strong>{{ nextVipLevel.upgradeRequirement }}</strong></div><div class="vip-progress-row"><span>歷史儲值</span><b>{{ vipUpgrade.deposit.current.toLocaleString() }} / {{ nextVipLevel.historicalDeposit?.toLocaleString() }}</b><i><em :style="{ width: `${depositPct}%` }" /></i></div><div class="vip-progress-row"><span>當月有效投注</span><b>{{ vipUpgrade.wager.current.toLocaleString() }} / {{ nextVipLevel.monthlyWager?.toLocaleString() }}</b><i><em :style="{ width: `${wagerPct}%` }" /></i></div><small class="vip-muted">資料要求：無額外要求</small></template></article>
        <article class="vip-panel vip-maintain-panel"><div class="vip-panel-label">保級狀態・全數達成</div><div class="vip-maintain-status" :class="{ ready: maintainReady }">{{ vipUpgrade.upgradeProtection ? '本月升級保護中' : maintainReady ? '本月已達保級條件' : '本月保級進度' }}</div><div class="vip-progress-row"><span>月儲值</span><b>{{ vipUpgrade.monthlyDeposit.toLocaleString() }} / {{ currentVipLevel.monthlyDeposit?.toLocaleString() || '無條件' }}</b><i><em :style="{ width: `${maintainDepositPct}%` }" /></i></div><div class="vip-progress-row"><span>月投注</span><b>{{ vipUpgrade.monthlyWager.toLocaleString() }} / {{ currentVipLevel.monthlyWager?.toLocaleString() || '無條件' }}</b><i><em :style="{ width: `${maintainWagerPct}%` }" /></i></div><div class="vip-progress-row"><span>活躍天數</span><b>{{ vipUpgrade.activeDays }} / {{ currentVipLevel.activeDays || '無條件' }} 天</b><i><em :style="{ width: `${maintainActivePct}%` }" /></i></div></article>
      </div>
    </section>

    <section v-else class="member-content"><header><div><p>GAME HISTORY</p><h2>遊戲紀錄</h2></div></header><LobbyGameRecords :key="sessionKey" /></section>
    <button class="member-logout" type="button" @click="openLogoutConfirm">登出目前帳號</button>

    <div v-if="showProfileConfirm" class="profile-confirm-overlay" role="alertdialog" aria-modal="true" :aria-labelledby="`${fieldIdPrefix}profile-confirm-title`">
      <div class="profile-confirm-card"><h2 :id="`${fieldIdPrefix}profile-confirm-title`">確認儲存一次性資料？</h2><p>以下資料儲存後將無法再次修改：</p><ul><li v-if="!userInfo.birthdayLocked && pendingProfileSave?.birthday">生日</li><li v-if="!userInfo.emailLocked && pendingProfileSave?.email">電子郵件</li></ul><div><button type="button" class="btn-outline-purple" @click="cancelProfileSave">返回修改</button><button type="button" class="btn-gold" :disabled="profileSaving" @click="commitProfileSave">{{ profileSaving ? '儲存中…' : '確認並儲存' }}</button></div></div>
    </div>

    <ClientOnly><Teleport to="body"><Transition name="modal-fade"><div v-if="showVipOverviewModal" class="modal-overlay" role="dialog" aria-modal="true" :aria-labelledby="`${fieldIdPrefix}vip-overview-title`" @click.self="showVipOverviewModal = false"><div class="modal-box vip-overview-modal"><div class="modal-inner"><button class="modal-close" type="button" aria-label="關閉 VIP 等級總覽" @click="showVipOverviewModal = false">×</button><p class="member-modal-kicker">VIP LEVELS</p><h2 :id="`${fieldIdPrefix}vip-overview-title`" class="modal-title">VIP 等級總覽</h2><div ref="vipOverviewTableWrap" class="vip-overview-table-wrap"><table class="vip-overview-table"><thead><tr><th>等級</th><th>升級條件</th><th>保級條件</th><th>升級獎勵</th><th>P2P 手續費</th></tr></thead><tbody><tr v-for="vip in vipLevels" :key="vip.level" :class="{ current: vip.level === userInfo.vip }"><td><strong :style="{ color: vip.color }">VIP {{ vip.level }}</strong><small v-if="vip.level === userInfo.vip">目前等級</small></td><td>{{ vip.upgradeRequirement }}</td><td>{{ vip.maintainRequirement }}</td><td>{{ vip.upgradeReward }}</td><td>{{ vip.p2pFee }}</td></tr></tbody></table></div></div></div></div></Transition></Teleport></ClientOnly>
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
.avatar-picker-overlay { position:fixed; inset:0; z-index:1050; display:grid; place-items:center; overflow-y:auto; padding:16px; background:rgba(0,0,0,.58); backdrop-filter:blur(5px); }
.avatar-picker-overlay .avatar-picker { width:min(760px,100%); max-height:calc(100dvh - 32px); overflow-y:auto; margin:0; box-shadow:0 18px 55px rgba(0,0,0,.55); }
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
.profile-grid em { color:var(--color-text-muted); font-size:8px; font-style:normal; }.input-readonly { opacity:.65; cursor:not-allowed; }.profile-field-error { display:block; margin-top:5px; color:#fca5a5; font-size:9px; }.profile-guide { display:block; max-width:420px; margin-top:5px; color:var(--color-text-muted); font-size:9px; line-height:1.55; }
.binding-list { display:grid; gap:8px; }.binding-list article { display:grid; grid-template-columns:40px 1fr auto 70px; align-items:center; gap:11px; padding:12px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(0,0,0,.14); }.binding-mark { display:grid; width:38px; height:38px; place-items:center; border-radius:11px; color:#fff; background:#6b21a8; font-size:11px; font-weight:900; }.provider-facebook { background:#1877f2; }.provider-line { background:#06c755; }.provider-apple { background:#555; }.provider-google { background:#ea4335; }.binding-list article>div:nth-child(2) { display:flex; flex-direction:column; }.binding-list strong { font-size:11px; }.binding-list small { color:var(--color-text-muted); font-size:8px; }.binding-list article>span { padding:4px 7px; border-radius:99px; color:var(--color-text-muted); background:rgba(255,255,255,.05); font-size:8px; }.binding-list article>span.bound { color:#86efac; background:rgba(74,222,128,.08); }.binding-list article>button { padding:7px; border:1px solid var(--color-border); border-radius:8px; color:var(--color-purple-light); font-size:9px; font-weight:800; }
.phone-binding-panel { padding:14px; margin-top:12px; border:1px solid rgba(168,85,247,.22); border-radius:12px; background:rgba(15,0,32,.35); }.phone-binding-row { display:flex; gap:8px; }.phone-binding-row .input-field { flex:1; }.phone-binding-row .btn-gold { flex-shrink:0; padding-inline:16px; justify-content:center; }.binding-hint { display:block; margin-top:6px; color:var(--color-text-muted); font-size:9px; }.binding-code-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:7px; }.binding-code-meta small { color:var(--color-text-muted); font-size:9px; }.binding-code-meta div { display:flex; gap:10px; }.binding-code-meta button { color:var(--color-purple-light); font-size:9px; }.binding-code-meta button:disabled { color:var(--color-text-muted); cursor:not-allowed; }.binding-code-meta .binding-back { color:var(--color-text-muted); }
.vip-progress-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.vip-progress-grid article { padding:14px; border:1px solid rgba(255,255,255,.07); border-radius:12px; background:rgba(0,0,0,.14); }.vip-progress-grid article>div { display:flex; justify-content:space-between; font-size:10px; }.vip-progress-grid strong { color:var(--color-gold); }.vip-progress-grid i { display:block; height:7px; margin:10px 0 5px; overflow:hidden; border-radius:99px; background:rgba(168,85,247,.12); }.vip-progress-grid b { display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#a855f7,#f5c842); }.vip-progress-grid small { color:var(--color-text-muted); font-size:8px; }
.vip-level-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; margin-top:12px; }.vip-level-grid article { display:flex; flex-direction:column; gap:3px; padding:10px; border:1px solid rgba(255,255,255,.07); border-radius:10px; background:rgba(0,0,0,.12); }.vip-level-grid article.current { border-color:var(--color-gold); background:rgba(245,200,66,.08); }.vip-level-grid span { font-size:9px; font-weight:900; }.vip-level-grid strong { font-size:9px; }.vip-level-grid small { color:var(--color-text-muted); font-size:7px; }
.vip-main-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }.vip-panel { min-height:178px; padding:16px; border:1px solid rgba(255,255,255,.22); border-radius:14px; background:rgba(18,10,43,.36); }.vip-panel-label { margin-bottom:9px; color:var(--color-text-muted); font-size:9px; font-weight:800; letter-spacing:.08em; }.vip-current-number { display:block; font-size:30px; font-weight:950; line-height:1.1; }.vip-current-panel>b { display:block; margin-top:4px; color:var(--color-text); font-size:13px; }.vip-stat-list { display:grid; gap:5px; margin-top:14px; }.vip-stat-list span { display:flex; justify-content:space-between; color:var(--color-text-muted); font-size:9px; }.vip-stat-list strong { color:var(--color-text); }.vip-muted { display:block; margin-top:10px; color:var(--color-text-muted); font-size:8px; line-height:1.6; }.vip-benefit-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08); color:var(--color-text-muted); font-size:9px; }.vip-benefit-row strong { color:var(--color-gold); font-size:11px; text-align:right; }.vip-next-line { display:grid; gap:4px; margin-bottom:12px; }.vip-next-line span { color:var(--color-purple-light); font-size:10px; font-weight:900; }.vip-next-line strong { color:var(--color-text); font-size:9px; line-height:1.6; }.vip-progress-row { display:grid; grid-template-columns:1fr auto; gap:5px 8px; margin-top:9px; color:var(--color-text-muted); font-size:8px; }.vip-progress-row b { color:var(--color-text); font-size:8px; font-weight:800; }.vip-progress-row i { grid-column:1/-1; display:block; height:6px; overflow:hidden; border-radius:99px; background:rgba(168,85,247,.15); }.vip-progress-row i em { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,var(--color-purple-glow),var(--color-gold)); }.vip-maintain-status { color:var(--color-text); font-size:12px; font-weight:900; }.vip-maintain-status.ready { color:#86efac; }.vip-max-state,.vip-undefined-state { display:grid; min-height:112px; place-items:center; color:var(--color-gold); font-size:14px; font-weight:900; text-align:center; }.vip-undefined-state { color:var(--color-purple-light); }.vip-overview-modal { max-width:min(1040px,calc(100vw - 30px)); }.vip-overview-table-wrap { max-height:60vh; overflow:auto; border:1px solid rgba(255,255,255,.15); border-radius:10px; }.vip-overview-table { width:100%; min-width:760px; border-collapse:collapse; font-size:9px; }.vip-overview-table th { position:sticky; top:0; z-index:1; padding:9px 8px; color:var(--color-gold); background:#292147; text-align:left; }.vip-overview-table td { padding:9px 8px; border-top:1px solid rgba(255,255,255,.08); color:var(--color-text-muted); vertical-align:top; line-height:1.55; }.vip-overview-table td:first-child { white-space:nowrap; }.vip-overview-table tr.current td { background:rgba(168,85,247,.18); }.vip-overview-table td strong { display:block; font-size:10px; }.vip-overview-table td small { display:block; margin-top:3px; color:var(--color-gold); font-size:7px; }
.member-logout { width:100%; padding:11px; border:1px solid rgba(248,113,113,.24); border-radius:11px; color:#fca5a5; background:rgba(248,113,113,.07); font-size:10px; font-weight:900; }.member-modal-kicker { text-align:center; }.vip-benefits { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }.vip-benefits>div { padding:12px; border:1px solid rgba(245,200,66,.17); border-radius:11px; background:rgba(245,200,66,.05); }.vip-benefits span,.vip-benefits strong { display:block; }.vip-benefits span { color:var(--color-text-muted); font-size:8px; }.vip-benefits strong { margin-top:3px; color:var(--color-gold); font-size:14px; }.vip-condition { padding:12px; margin-top:8px; border:1px solid var(--color-border); border-radius:11px; background:rgba(168,85,247,.07); }.vip-condition span { color:var(--color-purple-light); font-size:9px; font-weight:900; }.vip-condition p { margin:5px 0 0; color:var(--color-text-muted); font-size:10px; line-height:1.7; }
.profile-confirm-overlay { position:fixed; inset:0; z-index:1100; display:grid; place-items:center; padding:16px; background:rgba(0,0,0,.58); backdrop-filter:blur(4px); }.profile-confirm-card { width:min(420px,100%); padding:22px; border:1px solid rgba(255,255,255,.22); border-radius:17px; background:linear-gradient(160deg,#3a315d,#211a3c); box-shadow:0 16px 48px rgba(0,0,0,.5); }.profile-confirm-card h2 { margin:0 0 8px; font-size:18px; }.profile-confirm-card p { margin:0; color:var(--color-text-muted); font-size:11px; line-height:1.7; }.profile-confirm-card ul { margin:8px 0 0; padding-left:18px; color:var(--color-text); font-size:11px; line-height:1.7; }.profile-confirm-card>div { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }.profile-confirm-card button { min-width:92px; justify-content:center; }
@media(max-width:800px){.member-identity{grid-template-columns:74px 1fr}.member-identity>.wallet-balances{grid-column:1/-1}.member-avatar{width:68px;height:68px}.avatar-grid{grid-template-columns:repeat(5,1fr)}.vip-main-grid{grid-template-columns:1fr}.vip-level-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:520px){.member-sections{grid-template-columns:1fr 1fr}.profile-grid,.vip-progress-grid{grid-template-columns:1fr}.binding-list article{grid-template-columns:36px 1fr auto}.binding-list article>span{display:none}.phone-binding-row{flex-direction:column}.phone-binding-row .btn-gold{width:100%;justify-content:center}.vip-level-grid{grid-template-columns:repeat(2,1fr)}}
</style>
