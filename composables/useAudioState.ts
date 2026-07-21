let audioContext: AudioContext | null = null
let ambientOscillators: OscillatorNode[] = []
let ambientGain: GainNode | null = null

function getAudioContext() {
  if (!import.meta.client) return null
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  audioContext ||= new AudioContextClass()
  return audioContext
}

export const useAudioState = () => {
  const { preferences, updatePreference } = usePreferencesState()

  async function playUiSound() {
    if (!preferences.value.soundEnabled) return
    const context = getAudioContext()
    if (!context) return
    await context.resume()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.08)
    gain.gain.setValueAtTime(0.045, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.13)
  }

  async function setMusicEnabled(enabled: boolean) {
    updatePreference('musicEnabled', enabled)
    const context = getAudioContext()
    if (!context) return

    if (!enabled) {
      ambientGain?.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)
      ambientOscillators.forEach(oscillator => oscillator.stop(context.currentTime + 0.2))
      ambientOscillators = []
      ambientGain = null
      return
    }

    await context.resume()
    if (ambientOscillators.length) return
    ambientGain = context.createGain()
    ambientGain.gain.setValueAtTime(0.0001, context.currentTime)
    ambientGain.gain.exponentialRampToValueAtTime(0.012, context.currentTime + 0.3)
    ambientGain.connect(context.destination)
    for (const frequency of [110, 164.81]) {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(ambientGain)
      oscillator.start()
      ambientOscillators.push(oscillator)
    }
  }

  function setSoundEnabled(enabled: boolean) {
    updatePreference('soundEnabled', enabled)
    if (enabled) window.setTimeout(playUiSound, 20)
  }

  return { playUiSound, setMusicEnabled, setSoundEnabled }
}
