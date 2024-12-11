import { useCalendarStore } from '~/stores/calendar'

export default defineNuxtPlugin(async () => {
  const calendarStore = useCalendarStore()
  
  // Initial fetch
  if (process.env.NUXT_PUBLIC_USE_CALENDAR === 'true') {
    await calendarStore.fetchCalendarData()
    
    // Refresh every hour
    setInterval(() => {
      calendarStore.fetchCalendarData()
    }, 60 * 60 * 1000)
  }
}) 