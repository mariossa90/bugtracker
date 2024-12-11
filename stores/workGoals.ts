import { defineStore } from 'pinia'

interface DaySpecificGoal {
  hours: number | null
}

interface WorkGoal {
  userId: string
  dailyHours: number | null  // default goal for most days
  weeklyHours: number | null // optional weekly goal
  fridayHours: DaySpecificGoal // specific goal for Fridays
}

interface WorkGoalsState {
  goals: Record<string, WorkGoal>
  defaultDailyHours: number
  defaultFridayHours: DaySpecificGoal
}

export const useWorkGoalsStore = defineStore('workGoals', {
  state: (): WorkGoalsState => ({
    goals: {},
    defaultDailyHours: 8,
    defaultFridayHours: {
      hours: 5
    }
  }),

  actions: {
    setDefaultDailyHours(hours: number) {
      this.defaultDailyHours = hours
    },

    setDefaultFridayHours(hours: number) {
      this.defaultFridayHours.hours = hours
    },

    setUserGoal(userId: string, dailyHours: number | null, options?: {
      weeklyHours?: number | null,
      fridayHours?: DaySpecificGoal
    }) {
      this.goals[userId] = {
        userId,
        dailyHours,
        weeklyHours: options?.weeklyHours ?? null,
        fridayHours: options?.fridayHours ?? { ...this.defaultFridayHours }
      }
    },

    setUserFridayGoal(userId: string, hours: number | null) {
      const userGoal = this.goals[userId]
      if (userGoal) {
        userGoal.fridayHours.hours = hours
      }
    },

    removeUserGoal(userId: string) {
      delete this.goals[userId]
    },

    getUserGoal(userId: string): WorkGoal | null {
      return this.goals[userId] || null
    }
  },

  getters: {
    getEffectiveUserGoal: (state) => (userId: string, date: string): number => {
      const userGoal = state.goals[userId]
      const dayOfWeek = new Date(date).getDay()
      
      // If no user goal is set, use defaults
      if (!userGoal) {
        return dayOfWeek === 5 
          ? state.defaultFridayHours.hours ?? state.defaultDailyHours
          : state.defaultDailyHours
      }

      // If it's Friday, use Friday hours
      if (dayOfWeek === 5) {
        return userGoal.fridayHours.hours ?? userGoal.dailyHours ?? state.defaultDailyHours
      }

      // Otherwise use regular daily hours
      return userGoal.dailyHours ?? state.defaultDailyHours
    }
  },

  persist: true  // Persist goals in localStorage
})
