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
  selectedMenu: 'general' | 'boards' | 'userVisibility' | 'userGoal' | 'analytics'
  hiddenProjects: string[]
  // Add other settings here as needed
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
    showFirstNameOnly: false,
    selectedDate: new Date(), // Initialize with current date
    selectedMenu: 'general', // Default selected menu
    hiddenProjects: [], // Initialize empty hidden projects array
    // Add other settings here as needed
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
    }
  },

  getters: {
    isUserVisible: (state) => (username: string) => {
      return !state.hiddenUsers.includes(username)
    },
    isProjectVisible: (state) => (projectName: string) => {
      return !state.hiddenProjects.includes(projectName)
    }
  },
  persist: true
})
