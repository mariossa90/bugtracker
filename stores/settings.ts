import { defineStore } from 'pinia'

interface SettingsState {
  hiddenUsers: string[]
  boardIds: string[]
  theme: 'light' | 'dark' | 'system'
  autoUpdate: boolean
  updateInterval: number
  showUserImages: boolean
  compactViewMode: boolean
  showFirstNameOnly: boolean
  selectedDate: Date
  selectedMenu: 'general' | 'boards' | 'userVisibility' | 'userGoal' | 'analytics' | 'table'
  hiddenProjects: string[]
  enableGoalEmails: boolean
  calendarUpdateInterval: number
  visibleDays: number
  hideWeekends: boolean
  goalColors: {
    light: {
      textColor: string
      goalMet: {
        color: string
      }
      goalPartial: {
        color: string
      }
      goalMissed: {
        color: string
      }
      weekendNoTime: {
        color: string
      }
      goalExceeded: {
        color: string
      }
    }
    dark: {
      textColor: string
      goalMet: {
        color: string
      }
      goalPartial: {
        color: string
      }
      goalMissed: {
        color: string
      }
      weekendNoTime: {
        color: string
      }
      goalExceeded: {
        color: string
      }
    }
  }
  chipColors: {
    light: {
      background: string
      text: string
    }
    dark: {
      background: string
      text: string
    }
  }
  boardUpdatePassword: string | null
  hasEnteredPassword: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    hiddenUsers: [],
    boardIds: [],
    theme: 'system',
    autoUpdate: false,
    updateInterval: 5,
    showUserImages: true,
    compactViewMode: false,
    showFirstNameOnly: true,
    selectedDate: new Date(), // Initialize with current date
    selectedMenu: 'general', // Default selected menu
    hiddenProjects: [], // Initialize empty hidden projects array
    enableGoalEmails: true,
    calendarUpdateInterval: 6,
    visibleDays: 7,
    hideWeekends: false,
    goalColors: {
      light: {
        textColor: '#374151',
        goalMet: {
          color: '#adf0cd',
        },
        goalPartial: {
          color: '#dafbea',
        },
        goalMissed: {
          color: '#fca5a5',
        },
        weekendNoTime: {
          color: '#f9fafb',
        },
        goalExceeded: {
          color: '#fca5a5',
        }
      },
      dark: {
        textColor: '#f5f5f5',
        goalMet: {
          color: '#277c48',
        },
        goalPartial: {
          color: '#3aa664',
        },
        goalMissed: {
          color: '#762828',
        },
        weekendNoTime: {
          color: '#111827',
        },
        goalExceeded: {
          color: '#fca5a5',
        }
      }
    },
    chipColors: {
      light: {
        background: '#6bdbc7',
        text: '#2f504a'
      },
      dark: {
        background: '#52b7a6',
        text: '#12352f'
      }
    },
    boardUpdatePassword: 'xK9#mP2$vL5nR8@jQ3', // Generated strong random password
    hasEnteredPassword: false
  }),

  actions: {
    toggleUserVisibility(username: string) {
      const index = this.hiddenUsers.indexOf(username)
      if (index > -1) {
        this.hiddenUsers.splice(index, 1)
      } else {
        this.hiddenUsers.push(username)
      }
    },

    addBoardId(boardId: string) {
      if (!this.boardIds.includes(boardId)) {
        this.boardIds.push(boardId)
      }
    },

    removeBoardId(boardId: string) {
      const index = this.boardIds.indexOf(boardId)
      if (index > -1) {
        this.boardIds.splice(index, 1)
      }
    },

    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme
    },

    setShowUserImages(show: boolean) {
      this.showUserImages = show
    },

    setCompactViewMode(enabled: boolean) {
      this.compactViewMode = enabled
    },

    setShowFirstNameOnly(enabled: boolean) {
      this.showFirstNameOnly = enabled
    },

    setSelectedDate(date: Date) {
      this.selectedDate = date
    },

    toggleProjectVisibility(projectName: string) {
      const index = this.hiddenProjects.indexOf(projectName)
      if (index > -1) {
        this.hiddenProjects.splice(index, 1)
      } else {
        this.hiddenProjects.push(projectName)
      }
    },

    setCalendarUpdateInterval(hours: number) {
      this.calendarUpdateInterval = hours
    },

    setVisibleDays(days: number) {
      this.visibleDays = days
    },

    setHideWeekends(hide: boolean) {
      this.hideWeekends = hide
    },

    resetGoalColors() {
      this.goalColors = {
        light: {
          textColor: '#374151',
          goalMet: { color: '#adf0cd' },
          goalPartial: { color: '#dafbea' },
          goalMissed: { color: '#fca5a5' },
          weekendNoTime: { color: '#f9fafb' },
          goalExceeded: { color: '#fca5a5' }
        },
        dark: {
          textColor: '#f5f5f5',
          goalMet: { color: '#277c48' },
          goalPartial: { color: '#3aa664' },
          goalMissed: { color: '#762828' },
          weekendNoTime: { color: '#111827' },
          goalExceeded: { color: '#762828' }
        }
      }
    },

    resetChipColors() {
      this.chipColors = {
        light: {
          background: '#6bdbc7',
          text: '#2f504a'
        },
        dark: {
          background: '#52b7a6',
          text: '#12352f'
        }
      }
    },

    validatePassword(password: string): boolean {
      if (password === this.boardUpdatePassword) {
        this.hasEnteredPassword = true
        return true
      }
      return false
    },

    setPassword(newPassword: string) {
      this.boardUpdatePassword = newPassword
    },

    resetPasswordStatus() {
      this.hasEnteredPassword = false
    }
  },

  getters: {
    isUserVisible: (state) => (username: string) => {
      return !state.hiddenUsers.includes(username)
    },
    isProjectVisible: (state) => (projectName: string) => {
      return !state.hiddenProjects.includes(projectName)
    },
    canUpdateBoard: (state) => state.hasEnteredPassword
  },
  persist: true
})
