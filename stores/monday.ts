import { defineStore } from 'pinia'

interface Column {
  title: string
  id: string
  type: string
}

interface Group {
  title: string
  id: string
}

interface TimeTrackingHistory {
  status: string;
  ended_at: string;
  ended_user_id: number;
  started_at: string;
  started_user_id: number;
}

interface ColumnValue {
  id: string
  text: string | null
  value: string | null
  type?: string
  duration?: number
  history?: TimeTrackingHistory[]
  label_style?: {
    border: string
    color: string
  }
}

interface SubItem {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

interface Item {
  id: string;
  name: string;
  column_values: ColumnValue[];
  subitems: SubItem[];
}

interface ItemsPage {
  cursor: string | null;
  items: Item[];
}

interface Task {
  id: string
  name: string
  status: string
  boardId: string
  columnValues: ColumnValue[]
  subitems: SubItem[]
  // Add other relevant task properties based on your Monday.com schema
}

interface Board {
  id: string
  name: string
  columns: Column[]
  groups: Group[]
  tasks: Task[]
  items_page?: ItemsPage
}

interface User {
  name: string
}

interface MondayState {
  user: User | null
  boards: Board[]
  loading: boolean
  error: string | null
}

interface MondayGraphQLQuery {
  query: string
  variables?: Record<string, unknown>
}

interface MondayApiResponse {
  data?: {
    boards: {
      items_page: ItemsPage;
    }[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
}

import { useSettingsStore } from './settings'

export const useMondayStore = defineStore('monday', {
  state: (): MondayState => ({
    user: null,
    boards: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchBoardData() {
      const settingsStore = useSettingsStore()
      
      if (settingsStore.boardIds.length === 0) {
        this.error = 'No boards configured. Please add board IDs in settings.'
        return
      }

      this.loading = true
      this.error = null
      const boardItems = new Map<string, Map<string, Item>>() // Map<BoardId, Map<ItemId, Item>>
      settingsStore.boardIds.forEach(id => boardItems.set(id.toString(), new Map()))
      
      try {
        // Track cursor for each board separately
        const boardCursors = new Map<string, string | null>()
        settingsStore.boardIds.forEach(id => boardCursors.set(id.toString(), null))
        
        let hasMore = true
        
        while (hasMore) {
          const cursorConditions = Array.from(boardCursors.entries())
            .map(([boardId, cursor]) => `
              board_${boardId}: boards(ids: [${boardId}]) {
                items_page(limit: 300${cursor ? `, cursor: "${cursor}"` : ''}) {
                  cursor
                  items {
                    id
                    name
                    column_values(ids: [
                      "zeiterfassung5__1",
                      "zeiterfassung__1",
                      "priority",
                      "name",
                      "status",
                      "person",
                      "zahlen",
                      "zeitleiste",
                      "datum1",
                      "datum8",
                      "project8__1"
                    ]) {
                      id
                      text
                      value
                      ... on TimeTrackingValue {
                        history {
                          status
                          ended_at
                          ended_user_id
                          started_at
                          started_user_id
                        }
                        duration
                      }
                      ... on StatusValue {
                        label_style{border, color}
                      }
                    }
                    subitems {
                      id
                      name
                      column_values(ids: ["zeiterfassung__1", "status"]) {
                        id
                        text
                        value
                        ... on TimeTrackingValue {
                          history {
                            status
                            ended_at
                            ended_user_id
                            started_at
                            started_user_id
                          }
                          duration
                        }
                      }
                    }
                  }
                }
              }
            `)
            .join('\n')

          const query: MondayGraphQLQuery = {
            query: `{
              ${cursorConditions}
            }`
          }

          const response = await $fetch<any>('/api/monday/tasks', {
            method: 'POST',
            body: query
          })

          if (response.data) {
            hasMore = false // Reset hasMore flag

            // Process items from each board
            for (const [boardId] of boardCursors) {
              const boardData = response.data[`board_${boardId}`]
              if (boardData?.[0]?.items_page) {
                const itemsPage = boardData[0].items_page
                const boardItemMap = boardItems.get(boardId) || new Map()
                
                // Add new items to the map, using item ID as key to ensure uniqueness
                itemsPage.items.forEach((item: Item) => {
                  boardItemMap.set(item.id, item)
                })
                
                boardItems.set(boardId, boardItemMap)
                
                // Update cursor for this board
                if (itemsPage.cursor) {
                  boardCursors.set(boardId, itemsPage.cursor)
                  hasMore = true // Continue if any board has more items
                } else {
                  boardCursors.set(boardId, null)
                }
              }
            }
          } else {
            hasMore = false
          }
        }

        // Create a Map to deduplicate items across all boards
        const uniqueItems = new Map<string, Item>()
        
        for (const [, itemMap] of boardItems) {
          // Add items to the unique items map
          for (const [itemId, item] of itemMap) {
            uniqueItems.set(itemId, item)
          }
        }

        const allItems = Array.from(uniqueItems.values())

        // Only update the store once all items are collected
        if (allItems.length > 0) {
          this.boards = [{
            id: 'Combined Boards',
            name: 'Combined Boards',
            columns: [],
            groups: [],
            tasks: allItems.map((item: Item) => {
              const statusValue = item.column_values.find(cv => cv.id === "status")
              const timeTrackingColumns = item.column_values.filter(cv => 
                ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
              ).map(cv => {
                if (cv.value) {
                  try {
                    const parsed = JSON.parse(cv.value)
                    if (parsed.history) {
                      cv.history = parsed.history
                    }
                    if (parsed.duration) {
                      cv.duration = parsed.duration
                    }
                  } catch (e) {
                    console.error('Error parsing time tracking value:', e)
                  }
                }
                return cv
              })

              // Find which board this item came from
              const boardId = Array.from(boardItems.entries()).find(
                ([_, itemMap]) => itemMap.has(item.id)
              )?.[0] || 'unknown'

              return {
                id: item.id,
                name: item.name,
                status: statusValue?.text || 'Not Started',
                boardId, // Add the original board ID
                columnValues: [
                  ...item.column_values.filter(cv => 
                    !['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
                  ),
                  ...timeTrackingColumns
                ],
                subitems: item.subitems,
              }
            })
          }]
        } else {
          this.boards = []
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An error occurred while fetching board data'
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    getUser: (state) => state.user,
    getBoards: (state) => state.boards,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
})
