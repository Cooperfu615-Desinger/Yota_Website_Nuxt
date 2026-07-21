export type AppTheme = 'dark' | 'light'
export type AppLanguage = 'zh-TW' | 'en' | 'ja'

export interface PreferencesState {
  musicEnabled: boolean
  soundEnabled: boolean
  theme: AppTheme
  language: AppLanguage
  pushEnabled: boolean
}

const LS_PREFERENCES_KEY = 'jh_preferences'

function createDefaultPreferences(): PreferencesState {
  return {
    musicEnabled: true,
    soundEnabled: true,
    theme: 'dark',
    language: 'zh-TW',
    pushEnabled: true,
  }
}

export const usePreferencesState = () => {
  const preferences = useState<PreferencesState>('preferencesState', createDefaultPreferences)
  const preferencesInitialized = useState('preferencesInitialized', () => false)

  function applyTheme() {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = preferences.value.theme
  }

  function persistPreferences() {
    if (!import.meta.client) return
    const persistentPreferences = {
      musicEnabled: preferences.value.musicEnabled,
      soundEnabled: preferences.value.soundEnabled,
      theme: preferences.value.theme,
      language: preferences.value.language,
    }
    localStorage.setItem(LS_PREFERENCES_KEY, JSON.stringify(persistentPreferences))
  }

  function initPreferences() {
    if (!import.meta.client || preferencesInitialized.value) return
    preferencesInitialized.value = true
    try {
      const saved = localStorage.getItem(LS_PREFERENCES_KEY)
      if (saved) preferences.value = { ...preferences.value, ...JSON.parse(saved) }
    } catch {}
    applyTheme()
  }

  function updatePreference<K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) {
    preferences.value[key] = value
    if (key === 'theme') applyTheme()
    if (key !== 'pushEnabled') persistPreferences()
  }

  return {
    preferences,
    initPreferences,
    updatePreference,
  }
}
