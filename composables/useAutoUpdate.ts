import { ref, onUnmounted, watch, onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useMonday } from '~/composables/useMonday'
import { useDailyTime } from '~/composables/useDailyTime'
import { useCalendarStore } from '~/stores/calendar'

export function useAutoUpdate() {
  const settingsStore = useSettingsStore()
  const { fetchBoardData } = useMonday()
  const { processDailyTime } = useDailyTime()
  const calendarStore = useCalendarStore()
  
  let updateInterval: NodeJS.Timeout | null = null
  const secondsLeft = ref(0)

  const startInterval = () => {
    // Clear any existing interval
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }

    // Only start if auto-update is enabled
    if (settingsStore.autoUpdate && settingsStore.updateInterval > 0) {
      // Set initial countdown
      secondsLeft.value = settingsStore.updateInterval * 60

      // Create countdown interval
      updateInterval = setInterval(async () => {
        if (secondsLeft.value > 0) {
          secondsLeft.value--
        } else {
          // Reset countdown and fetch data
          secondsLeft.value = settingsStore.updateInterval * 60
          
          // Always fetch Monday data during auto-update
          await fetchBoardData()
          await processDailyTime()
          
          // Optionally fetch calendar data (it has its own smart caching)
          await calendarStore.fetchCalendarData()
        }
      }, 1000)
    }
  }

  // Watch for changes in settings, but only on client side
  onMounted(() => {
    watch(
      () => [settingsStore.autoUpdate, settingsStore.updateInterval],
      () => {
        startInterval()
      },
      { immediate: true }
    )
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  })

  const resetCountdown = () => {
    if (settingsStore.autoUpdate && settingsStore.updateInterval > 0) {
      secondsLeft.value = settingsStore.updateInterval * 60
    }
  }

  return {
    secondsLeft,
    resetCountdown,
    startInterval
  }
}
