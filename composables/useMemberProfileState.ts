export type MemberSection = 'profile' | 'bindings' | 'vip' | 'history'

/**
 * 玩家資料主彈窗的跨元件狀態。
 * Header、路由頁與彈窗共用同一個目前分頁，關閉後一律回到個人資料。
 */
export const useMemberProfileState = () => {
  const isOpen = useState('memberProfileOpen', () => false)
  const activeSection = useState<MemberSection>('memberProfileSection', () => 'profile')
  const sessionKey = useState('memberProfileSessionKey', () => 0)

  function openProfile() {
    activeSection.value = 'profile'
    sessionKey.value += 1
    isOpen.value = true
  }

  function closeProfile() {
    isOpen.value = false
    activeSection.value = 'profile'
  }

  return { isOpen, activeSection, sessionKey, openProfile, closeProfile }
}
