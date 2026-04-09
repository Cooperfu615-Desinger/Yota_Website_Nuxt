import { siteContent } from '~/data/siteContent'

// 全站共用狀態：登入、大廳 Modal、使用者資訊
// 使用 Nuxt useState 確保 SSR/SSG 時 hydration 正確

const LS_LOGIN_KEY = 'jh_isLoggedIn'
const LS_USER_KEY  = 'jh_userInfo'

export const useAppState = () => {
  const isLoggedIn = useState('isLoggedIn', () => false)
  const userInfo = useState('userInfo', () => ({ ...siteContent.member.defaultUser }))

  // 登入 Modal
  const showLoginModal = useState('showLoginModal', () => false)
  const loginTab = useState<'account' | 'phone'>('loginTab', () => 'account')

  // H5 大廳 Modal
  const showLobbyModal = useState('showLobbyModal', () => false)
  const lobbyUrl = useState('lobbyUrl', () => '')

  function openLogin() {
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
  function login(name?: string) {
    if (name) userInfo.value.name = name
    isLoggedIn.value = true
    closeLogin()
    localStorage.setItem(LS_LOGIN_KEY, 'true')
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userInfo.value))
  }
  function logout() {
    isLoggedIn.value = false
    userInfo.value = { ...siteContent.member.defaultUser }
    localStorage.removeItem(LS_LOGIN_KEY)
    localStorage.removeItem(LS_USER_KEY)
  }

  // 從 localStorage 還原登入狀態（僅在客戶端 onMounted 後呼叫）
  function initFromStorage() {
    if (localStorage.getItem(LS_LOGIN_KEY) === 'true') {
      isLoggedIn.value = true
      try {
        const saved = localStorage.getItem(LS_USER_KEY)
        if (saved) userInfo.value = JSON.parse(saved)
      } catch {}
    }
  }

  return {
    isLoggedIn,
    userInfo,
    showLoginModal,
    loginTab,
    showLobbyModal,
    lobbyUrl,
    openLogin,
    closeLogin,
    openLobby,
    closeLobby,
    login,
    logout,
    initFromStorage,
  }
}
