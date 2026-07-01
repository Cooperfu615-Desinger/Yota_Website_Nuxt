const LS_AGE_GATE_CONFIRMED = 'jh_ageGateConfirmed'

let pendingAction: (() => void) | null = null

export const useAgeGateState = () => {
  const showAgeGateModal = useState('showAgeGateModal', () => false)
  const ageGateSkipNext = useState('ageGateSkipNext', () => false)

  function hasConfirmedAgeGate() {
    if (!import.meta.client) return false
    return localStorage.getItem(LS_AGE_GATE_CONFIRMED) === 'true'
  }

  function openAgeGate(action: () => void) {
    if (hasConfirmedAgeGate()) {
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
    if (import.meta.client && ageGateSkipNext.value) {
      localStorage.setItem(LS_AGE_GATE_CONFIRMED, 'true')
    }

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
