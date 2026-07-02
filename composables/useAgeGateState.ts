let pendingAction: (() => void) | null = null

export const useAgeGateState = () => {
  const showAgeGateModal = useState('showAgeGateModal', () => false)
  const ageGateSkipNext = useState('ageGateSkipNext', () => false)
  const ageGateConfirmedThisPage = useState('ageGateConfirmedThisPage', () => false)

  function openAgeGate(action: () => void) {
    if (ageGateConfirmedThisPage.value) {
      action()
      return
    }

    pendingAction = action
    ageGateSkipNext.value = false
    showAgeGateModal.value = true
  }

  function closeAgeGate() {
    showAgeGateModal.value = false
    ageGateSkipNext.value = false
    pendingAction = null
  }

  function confirmAgeGate() {
    if (ageGateSkipNext.value) ageGateConfirmedThisPage.value = true

    const action = pendingAction
    showAgeGateModal.value = false
    ageGateSkipNext.value = false
    pendingAction = null
    action?.()
  }

  return {
    showAgeGateModal,
    ageGateSkipNext,
    openAgeGate,
    closeAgeGate,
    confirmAgeGate,
  }
}
