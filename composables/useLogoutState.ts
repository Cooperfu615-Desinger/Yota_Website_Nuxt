export const useLogoutState = () => {
  const showLogoutConfirm = useState('showLogoutConfirm', () => false)

  function openLogoutConfirm() {
    showLogoutConfirm.value = true
  }

  function closeLogoutConfirm() {
    showLogoutConfirm.value = false
  }

  return {
    showLogoutConfirm,
    openLogoutConfirm,
    closeLogoutConfirm,
  }
}
