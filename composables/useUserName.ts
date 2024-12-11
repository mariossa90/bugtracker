import { useSettingsStore } from '~/stores/settings'

export function useUserName() {
  const settingsStore = useSettingsStore()

  const formatUserName = (fullName: string) => {
    if (settingsStore.showFirstNameOnly) {
      return fullName.split(' ')[0]
    }
    return fullName
  }

  return {
    formatUserName
  }
}
