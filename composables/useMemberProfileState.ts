export type MemberSection = 'profile' | 'bindings' | 'vip' | 'history'

/**
 * 玩家資料主彈窗的跨元件狀態。
 * Header、路由頁與彈窗共用同一個目前分頁，關閉後一律回到個人資料。
 */
export const useMemberProfileState = () => {
  const isOpen = useState('memberProfileOpen', () => false)
  const activeSection = useState<MemberSection>('memberProfileSection', () => 'profile')

  function openProfile() {
    activeSection.value = 'profile'
    isOpen.value = true
  }

  function closeProfile() {
    isOpen.value = false
    activeSection.value = 'profile'
  }

  return { isOpen, activeSection, openProfile, closeProfile }
}
