import { ref } from 'vue'
import type { Ref } from 'vue'

export interface CalendarEvent {
  id: string
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  isAllDay: boolean
  showAs: string
  organizer?: {
    emailAddress?: {
      address?: string
    }
  }
}

export const useGraph = () => {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchCalendarEvents = async (
    startDate: string, 
    endDate: string
  ): Promise<CalendarEvent[] | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate
        })
      })

      if (!response.ok) throw new Error('Failed to fetch calendar events')
      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    fetchCalendarEvents,
    loading,
    error
  }
} 