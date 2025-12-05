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

interface ActivityLog {
  id: string;
  event: string;
  data: string;
  account_id: string;
  entity: string;
  user_id: string;
  created_at: string;
}

interface StatusChangeHistory {
  from_status: string;
  to_status: string;
  changed_by_user_id: string;
  changed_at: string;
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

interface Asset {
  id: string;
  name: string;
  url: string;
  public_url: string;
  url_thumbnail?: string;
  file_extension: string;
  file_size: number;
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
  assets?: Asset[];
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
  assets?: Asset[]
  subitems: SubItem[]
  statusChangeHistory?: StatusChangeHistory[]
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
      
      console.log('🔍 Fetching data for board IDs:', settingsStore.boardIds)
      
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
                items_page(limit: 200${cursor ? `, cursor: "${cursor}"` : ''}) {
                  cursor
                  items {
                    id
                    name
                    column_values {
                      id
                      text
                      value
                      type
                      ... on StatusValue {
                        label_style {
                          border
                          color
                        }
                      }
                      ... on FileValue {
                        files {
                          ... on FileAssetValue {
                            name
                            asset_id
                          }
                          ... on FileLinkValue {
                            name
                            url
                          }
                        }
                      }
                    }
                    assets {
                      id
                      name
                      url
                      public_url
                      url_thumbnail
                      file_extension
                      file_size
                    }
                    subitems {
                      id
                      name
                      column_values {
                        id
                        text
                        value
                        type
                      }
                    }
                  }
                }
                activity_logs(limit: 1000) {
                  id
                  event
                  data
                  account_id
                  entity
                  user_id
                  created_at
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

        // After fetching all items, fetch activity logs for each board to get status change history
        const activityLogsMap = new Map<string, ActivityLog[]>() // Map<ItemId, ActivityLog[]>
        
        for (const [boardId] of boardCursors) {
          const boardData = await $fetch<any>('/api/monday/tasks', {
            method: 'POST',
            body: {
              query: `{
                boards(ids: [${boardId}]) {
                  activity_logs(limit: 1000) {
                    id
                    event
                    data
                    account_id
                    entity
                    user_id
                    created_at
                  }
                }
              }`
            }
          })
          
          if (boardData?.data?.boards?.[0]?.activity_logs) {
            const logs = boardData.data.boards[0].activity_logs as ActivityLog[]
            
            // Group activity logs by item ID
            logs.forEach((log: ActivityLog) => {
              // Filter for status change events related to items (entity: pulse)
              if (log.entity === 'pulse' && (log.event === 'update_column_value' || log.event === 'change_column_value')) {
                try {
                  const logData = JSON.parse(log.data)
                  const itemId = logData.pulse_id || logData.item_id
                  
                  if (itemId) {
                    const itemLogs = activityLogsMap.get(itemId.toString()) || []
                    itemLogs.push(log)
                    activityLogsMap.set(itemId.toString(), itemLogs)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            })
          }
        }

        // Helper function to parse status change history from activity logs
        const parseStatusChangeHistory = (itemId: string, statusColumnId: string): StatusChangeHistory[] => {
          const itemLogs = activityLogsMap.get(itemId) || []
          const statusChanges: StatusChangeHistory[] = []
          
          itemLogs.forEach((log: ActivityLog) => {
            try {
              const logData = JSON.parse(log.data)
              
              // Check if this log is about the status column
              if (logData.column_id === statusColumnId || logData.column_id === 'status' || logData.column_id === 'color_mkvxkwcm') {
                // Parse the value and previous_value which may be JSON strings
                let toStatus = ''
                let fromStatus = ''
                
                try {
                  if (typeof logData.value === 'string') {
                    const valueObj = JSON.parse(logData.value)
                    toStatus = valueObj.text || valueObj.label || ''
                  } else if (logData.value?.text) {
                    toStatus = logData.value.text
                  } else if (logData.value?.label) {
                    toStatus = logData.value.label
                  }
                } catch (e) {
                  toStatus = String(logData.value || '')
                }
                
                try {
                  if (typeof logData.previous_value === 'string') {
                    const prevValueObj = JSON.parse(logData.previous_value)
                    fromStatus = prevValueObj.text || prevValueObj.label || ''
                  } else if (logData.previous_value?.text) {
                    fromStatus = logData.previous_value.text
                  } else if (logData.previous_value?.label) {
                    fromStatus = logData.previous_value.label
                  }
                } catch (e) {
                  fromStatus = String(logData.previous_value || '')
                }
                
                if (toStatus) {
                  const change: StatusChangeHistory = {
                    from_status: fromStatus,
                    to_status: toStatus,
                    changed_by_user_id: log.user_id,
                    changed_at: log.created_at
                  }
                  
                  statusChanges.push(change)
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          })
          
          // Sort by created_at (oldest first)
          return statusChanges.sort((a, b) => {
            const timeA = BigInt(a.changed_at)
            const timeB = BigInt(b.changed_at)
            return timeA < timeB ? -1 : timeA > timeB ? 1 : 0
          })
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
                // Find status column (could be status, color_mkvxkwcm, or other status columns)
                const statusValue = item.column_values.find(cv => 
                  cv.type === 'status' || cv.id === 'status' || cv.id === 'color_mkvxkwcm'
                )

                // Find which board this item came from
                const boardId = Array.from(boardItems.entries()).find(
                  ([_, itemMap]) => itemMap.has(item.id)
                )?.[0] || 'unknown'

                // Get status change history for this item
                const statusColumnId = statusValue?.id || 'status'
                const statusChangeHistory = parseStatusChangeHistory(item.id, statusColumnId)

                return {
                  id: item.id,
                  name: item.name,
                  status: statusValue?.text || 'Not Started',
                  boardId,
                  columnValues: item.column_values,
                  assets: item.assets,
                  subitems: item.subitems,
                  statusChangeHistory,
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
