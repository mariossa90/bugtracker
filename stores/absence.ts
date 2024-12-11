import { defineStore } from 'pinia'
import { useCalendarStore } from './calendar'
import { useUserStore } from './userStore'
import { parseSubject, findMatchingUser } from '~/utils/calendarParser'

interface AbsenceReason {
  type: 'Urlaub' | 'Pflege' | 'DR' | 'Krank' | string
  startDate: string
  endDate: string
  isAllDay: boolean
}

interface UserAbsence {
  username: string  // Monday.com username
  absences: AbsenceReason[]
}

interface AbsenceState {
  userAbsences: Map<string, AbsenceReason[]>
  lastUpdate: Date | null
  loading: boolean
  error: string | null
}

export const useAbsenceStore = defineStore('absence', {
  state: (): AbsenceState => ({
    userAbsences: new Map(),
    lastUpdate: null,
    loading: false,
    error: null
  }),

  actions: {
    async processCalendarEvents() {
      const calendarStore = useCalendarStore()
      const userStore = useUserStore()
      this.loading = true

      try {
        this.userAbsences.clear()

        calendarStore.events.forEach(event => {
          if (event.organizer?.emailAddress?.address !== 'Abwesenheitskalender@woojin.at') {
            return
          }

          const parsedUsers = parseSubject(event.subject)
          parsedUsers.forEach(parsedUser => {
            const mondayUser = findMatchingUser(parsedUser.name, userStore.users)
            if (mondayUser) {
              const startDate = new Date(event.start.dateTime)
              const endDate = new Date(event.end.dateTime)
              
              // Adjust start date if it begins at midnight (00:00)
              if (startDate.getHours() === 0 && 
                  startDate.getMinutes() === 0 && 
                  startDate.getSeconds() === 0) {
                startDate.setDate(startDate.getDate() + 1)
              }
              
              // Map German reasons to English
              let mappedReason = parsedUser.reason || 'Vacation'
              switch (mappedReason) {
                case 'DR':
                  mappedReason = 'Business Trip'
                  break
                case 'Urlaub':
                  mappedReason = 'Vacation'
                  break
                case 'Krank':
                case 'Pflege':
                  mappedReason = 'Sick Leave'
                  break
                default:
                  break
              }

              this.addAbsence(mondayUser.name, {
                type: mappedReason,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                isAllDay: event.isAllDay
              })
            }
          })
        })

        this.lastUpdate = new Date()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to process absences'
      } finally {
        this.loading = false
      }
    },

    addAbsence(username: string, absence: AbsenceReason) {
      const userAbsences = this.userAbsences.get(username) || []
      userAbsences.push(absence)
      this.userAbsences.set(username, userAbsences)
    }
  },

  getters: {
    isUserAbsent: (state) => (username: string, date: string) => {
      const absences = state.userAbsences.get(username) || []
      return absences.some((absence: AbsenceReason) => 
        date >= absence.startDate && date <= absence.endDate
      )
    },

    getUserAbsenceReason: (state) => (username: string, date: string) => {
      const absences = state.userAbsences.get(username) || []
      return absences.find((absence: AbsenceReason) => 
        date >= absence.startDate && date <= absence.endDate
      )?.type || null
    }
  }
}) 