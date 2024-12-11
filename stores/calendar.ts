import { defineStore } from 'pinia'
import { useGraph } from '~/composables/useGraph'
import type { CalendarEvent } from '~/composables/useGraph'
import { useAbsenceStore } from './absence'

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
        console.error('Calendar fetch error:', error)
      } finally {
        this.loading = false
      }
    }
  },

  persist: true
}) 