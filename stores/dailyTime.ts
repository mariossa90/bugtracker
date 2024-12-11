import { defineStore } from 'pinia'

interface DailyTimeEntry {
  date: string
  userName: string
  totalTime: string // in h:m:s format
  totalSeconds: number
  entries: Array<{
    ticketId: string
    ticketName: string
    project: string
    startTime: string
    endTime: string
    duration: string
    durationSeconds: number
    isRunning: boolean
  }>
}

interface DailyTimeState {
  dailyTimes: DailyTimeEntry[]
}

export const useDailyTimeStore = defineStore('dailyTime', {
  state: (): DailyTimeState => ({
    dailyTimes: []
  }),

  actions: {
    setDailyTimes(times: DailyTimeEntry[]) {
      this.dailyTimes = times
    },

    clearDailyTimes() {
      this.dailyTimes = []
    }
  },

  getters: {
    getDailyTimes: (state) => state.dailyTimes,
    
    // Get unique dates for filtering
    getUniqueDates: (state) => {
      const dates = new Set(state.dailyTimes.map(entry => entry.date))
      return Array.from(dates).sort()
    },

    // Get unique users for filtering
    getUniqueUsers: (state) => {
      const users = new Set(state.dailyTimes.map(entry => entry.userName))
      return Array.from(users).sort()
    }
  }
})
