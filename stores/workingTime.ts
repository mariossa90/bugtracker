import { defineStore } from 'pinia'

interface TimeEntry {
  ticketId: string
  ticketName: string
  duration: string // in h:m:s format
  durationSeconds: number
}

interface UserWorkTime {
  userName: string
  totalTime: string // in h:m:s format
  totalSeconds: number
  tickets: TimeEntry[]
}

interface WorkingTimeState {
  userWorkTimes: UserWorkTime[]
}

export const useWorkingTimeStore = defineStore('workingTime', {
  state: (): WorkingTimeState => ({
    userWorkTimes: []
  }),

  actions: {
    setUserWorkTimes(workTimes: UserWorkTime[]) {
      this.userWorkTimes = workTimes
    },

    clearUserWorkTimes() {
      this.userWorkTimes = []
    }
  },

  getters: {
    getUserWorkTimes: (state) => state.userWorkTimes
  }
})
