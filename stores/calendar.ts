import { defineStore } from 'pinia'
import { useGraph } from '~/composables/useGraph'
import type { CalendarEvent } from '~/composables/useGraph'
import { useAbsenceStore } from './absence'
import { useSettingsStore } from '~/stores/settings'

interface CalendarState {
  events: CalendarEvent[]
  lastFetch: Date | null
  loading: boolean
  error: string | null
}

export const useCalendarStore = defineStore('calendar', {
  state: (): CalendarState => ({
    events: [],
    lastFetch: null,
    loading: false,
    error: null
  }),

  hydrate(state) {
    state.loading = false
  },

  actions: {
    async fetchCalendarData() {
      const { fetchCalendarEvents } = useGraph()
      const absenceStore = useAbsenceStore()
      const settingsStore = useSettingsStore()
      
      // Check if we need to fetch
      if (this.lastFetch) {
        const updateIntervalHours = settingsStore.calendarUpdateInterval || 6 // fallback to 6 hours
        const updateInterval = new Date(Date.now() - updateIntervalHours * 60 * 60 * 1000)
        if (new Date(this.lastFetch) > updateInterval) {
          // Data is fresh enough, no need to fetch
          return
        }
      }

      this.loading = true
      this.error = null
      
      try {
        // Start date: 1 year ago
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        // End date: today + 1 month
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        
        const events = await fetchCalendarEvents(startDate, endDate)
        if (events) {
          this.events = events
          this.lastFetch = new Date()
          await absenceStore.processCalendarEvents()
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch calendar data'
      } finally {
        this.loading = false
      }
    }
  },

  persist: true
}) 