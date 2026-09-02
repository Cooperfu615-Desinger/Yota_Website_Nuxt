import { siteContent } from '~/data/siteContent'
import { resolveVipReward } from '~/utils/vipReward'

const LS_LOGIN_KEY = 'jh_isLoggedIn'
const LS_USER_KEY = 'jh_userInfo'

type AuthProvider = 'account' | 'guest' | 'phone' | 'facebook' | 'line' | 'apple' | 'google'

interface UserProfile {
  id: string
  account: string
  name: string
  vip: number
  avatar: string
  avatarId: number
  bio: string
  birthday: string
  birthdayLocked: boolean
  email: string
  emailLocked: boolean
  phone: string
  authProvider: AuthProvider
  accountBindings: {
    phone: boolean
    facebook: boolean
    line: boolean
    apple: boolean
    google: boolean
  }
}

function normalizeProfile(saved?: Partial<UserProfile>): UserProfile {
  const base = siteContent.member.defaultUser
  return {
    id: String(saved?.id || base.id),
    account: String(saved?.account || base.account),
    name: String(saved?.name || base.name),
    vip: Number.isFinite(saved?.vip) ? Number(saved?.vip) : base.vip,
    avatar: String(saved?.avatar || base.avatar),
    avatarId: Number.isFinite(saved?.avatarId) ? Number(saved?.avatarId) : base.avatarId,
    bio: String(saved?.bio ?? base.bio),
    birthday: String(saved?.birthday ?? base.birthday),
    birthdayLocked: Boolean(saved?.birthdayLocked ?? base.birthdayLocked),
    email: String(saved?.email ?? base.email),
    emailLocked: Boolean(saved?.emailLocked ?? base.emailLocked),
    phone: String(saved?.phone ?? base.phone),
    authProvider: (saved?.authProvider || base.authProvider) as AuthProvider,
    accountBindings: {
      ...base.accountBindings,
      ...(saved?.accountBindings ?? {}),
    },
  }
}

export const useAppState = () => {
  const isLoggedIn = useState('isLoggedIn', () => false)
  const profile = useState<UserProfile>('userProfile', () => normalizeProfile())
  const authInitialized = useState('authInitialized', () => false)
  const financial = useFinancialState()
  // VIP 領取狀態只存在本次瀏覽工作階段；重新整理或切換帳號後重新開始。
  const vipClaimedRewardLevels = useState<number[]>('vipClaimedRewardLevels', () => [])

  // 向既有畫面提供同一個 userInfo 介面；個人資料可持久化，金融欄位只取自本次工作階段。
  const userInfo = computed(() => ({
    ...profile.value,
    balance: financial.balance.value,
    silverBalance: financial.silverBalance.value,
    bronzeBalance: financial.bronzeBalance.value,
    vaultBalance: financial.vaultBalance.value,
  }))

  const showLoginModal = useState('showLoginModal', () => false)
  const loginTab = useState<'account' | 'phone'>('loginTab', () => 'account')
  const protectedDestination = useState<string | null>('protectedDestination', () => null)

  const showLobbyModal = useState('showLobbyModal', () => false)
  const lobbyUrl = useState('lobbyUrl', () => '')

  function openLogin(destination?: string) {
    protectedDestination.value = destination || null
    showLoginModal.value = true
  }

  function closeLogin() {
    showLoginModal.value = false
  }

  function openLobby(url = 'https://example.com/h5') {
    lobbyUrl.value = url
    showLobbyModal.value = true
  }

  function closeLobby() {
    showLobbyModal.value = false
    lobbyUrl.value = ''
  }

  function persistProfile() {
    if (!import.meta.client) return
    localStorage.setItem(LS_USER_KEY, JSON.stringify(profile.value))
  }

  function login(
    name?: string,
    provider: AuthProvider = 'account',
    closeAfterLogin = true,
    account?: string,
  ) {
    vipClaimedRewardLevels.value = []
    if (name) profile.value.name = name
    if (account) profile.value.account = account
    profile.value.authProvider = provider
    // 規格中的前台 Mock：一般登入者從 VIP6 開始，訪客從 VIP0 開始。
    profile.value.vip = provider === 'guest' ? 0 : 6
    if (provider === 'guest') {
      profile.value.account = `Guest${profile.value.id.replace(/\D/g, '')}`
      profile.value.phone = ''
      profile.value.email = ''
      profile.value.emailLocked = false
      profile.value.birthday = ''
      profile.value.birthdayLocked = false
      profile.value.accountBindings = { ...profile.value.accountBindings, phone: false, google: false }
    }
    isLoggedIn.value = true
    if (closeAfterLogin) closeLogin()
    if (import.meta.client) {
      localStorage.setItem(LS_LOGIN_KEY, 'true')
      persistProfile()
    }
  }

  function claimVipReward(level: number) {
    const rule = siteContent.member.vipLevels.find(vip => vip.level === level)
    const reward = rule ? resolveVipReward(level, rule.upgradeReward) : null
    if (!rule || !reward || profile.value.vip !== level || vipClaimedRewardLevels.value.includes(level)) return null

    const transaction = financial.addWalletReward(
      reward.wallet,
      reward.amount,
      `VIP ${level} 升級獎勵`,
      `本級獎勵：${rule.upgradeReward}`,
    )
    if (!transaction) return null

    vipClaimedRewardLevels.value = [...vipClaimedRewardLevels.value, level]
    return transaction
  }

  function logout() {
    isLoggedIn.value = false
    profile.value = normalizeProfile()
    financial.resetFinancialState()
    vipClaimedRewardLevels.value = []
    useGiftState().resetGiftState()
    useSocialState().resetSocialState()
    useSupportTicketState().resetSupportTicketState()
    protectedDestination.value = null
    if (import.meta.client) {
      localStorage.removeItem(LS_LOGIN_KEY)
      localStorage.removeItem(LS_USER_KEY)
    }
  }

  function updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'avatarId' | 'bio' | 'birthday' | 'birthdayLocked' | 'email' | 'emailLocked' | 'phone'>>) {
    profile.value = normalizeProfile({ ...profile.value, ...updates })
    persistProfile()
  }

  function setAccountBinding(provider: keyof UserProfile['accountBindings'], bound: boolean) {
    profile.value.accountBindings[provider] = bound
    persistProfile()
  }

  function consumeProtectedDestination() {
    const destination = protectedDestination.value
    protectedDestination.value = null
    return destination
  }

  function initFromStorage() {
    if (!import.meta.client || authInitialized.value) return
    authInitialized.value = true
    if (localStorage.getItem(LS_LOGIN_KEY) !== 'true') return
    isLoggedIn.value = true
    try {
      const saved = localStorage.getItem(LS_USER_KEY)
      if (saved) profile.value = normalizeProfile(JSON.parse(saved))
    } catch {}
    persistProfile()
  }

  return {
    isLoggedIn,
    profile,
    userInfo,
    showLoginModal,
    loginTab,
    protectedDestination,
    showLobbyModal,
    lobbyUrl,
    openLogin,
    closeLogin,
    openLobby,
    closeLobby,
    login,
    claimVipReward,
    vipClaimedRewardLevels,
    logout,
    updateProfile,
    setAccountBinding,
    consumeProtectedDestination,
    initFromStorage,
    completeDeposit: financial.completeDeposit,
    addWalletReward: financial.addWalletReward,
    transactions: financial.transactions,
    depositToVault: financial.depositToVault,
    withdrawFromVault: financial.withdrawFromVault,
    transferFromVault: financial.transferFromVault,
    exchangeWalletCurrency: financial.exchangeWalletCurrency,
  }
}
