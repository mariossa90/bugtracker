import { defineStore } from 'pinia'

interface MondayUser {
  id: string
  name: string
  email: string
  photo_original: string
  photo_thumb: string
  photo_thumb_small: string
  photo_tiny: string
}

interface UserState {
  users: MondayUser[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

export const useUserStore = defineStore('users', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: null,
    lastFetchedAt: null
  }),

  actions: {
    async fetchUsers(force = false) {
      // Check if we need to fetch
      if (!force && this.users.length > 0 && this.lastFetchedAt) {
        const oneDayInMs = 24 * 60 * 60 * 1000
        const timeSinceLastFetch = Date.now() - this.lastFetchedAt
        
        if (timeSinceLastFetch < oneDayInMs) {
          console.log('Using cached users, last fetched:', new Date(this.lastFetchedAt).toLocaleString())
          return
        }
      }

      this.loading = true
      this.error = null
      
      try {
        const query = `
          query {
            users {
              id
              name
              email
              photo_original
              photo_thumb
              photo_thumb_small
              photo_tiny
            }
          }
        `

        const response = await fetch('/api/monday/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (data.data?.users) {
          this.users = data.data.users
          this.lastFetchedAt = Date.now()
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An error occurred while fetching users'
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    forceFetchUsers() {
      return this.fetchUsers(true)
    }
  },

  getters: {
    getUsers: (state) => state.users,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getLastFetchedAt: (state) => state.lastFetchedAt ? new Date(state.lastFetchedAt) : null
  },

  persist: true,
})
