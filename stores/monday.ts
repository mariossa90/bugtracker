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
  event: string;
  data: string;
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
  name: string;
  url: string;
  public_url: string;
  url_thumbnail?: string;
}

interface Reply {
  id: string;
  text_body: string;
  creator_id: string;
  created_at: string;
}

interface Update {
  id: string;
  text_body: string;
  creator_id: string;
  created_at: string;
  replies?: Reply[];
}

interface SubItem {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

interface Creator {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  creator?: Creator | null;
  column_values: ColumnValue[];
  assets?: Asset[];
  subitems: SubItem[];
  updates?: Update[];
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
  creator?: Creator | null
  columnValues: ColumnValue[]
  assets?: Asset[]
  subitems: SubItem[]
  statusChangeHistory?: StatusChangeHistory[]
  updates?: Update[]
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
        // Populated after the items_page pagination loop finishes. Declared up
        // front so buildTasks() can reference it during progressive renders
        // (it simply yields empty statusChangeHistory until activity logs arrive).
        const activityLogsMap = new Map<string, ActivityLog[]>()

        const parseStatusChangeHistory = (itemId: string, statusColumnId: string): StatusChangeHistory[] => {
          const itemLogs = activityLogsMap.get(itemId) || []
          const statusChanges: StatusChangeHistory[] = []

          itemLogs.forEach((log: ActivityLog) => {
            try {
              const logData = JSON.parse(log.data)

              if (logData.column_id === statusColumnId || logData.column_id === 'status' || logData.column_id === 'color_mkvxkwcm') {
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
                  statusChanges.push({
                    from_status: fromStatus,
                    to_status: toStatus,
                    changed_by_user_id: log.user_id,
                    changed_at: log.created_at
                  })
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          })

          return statusChanges.sort((a, b) => {
            const timeA = BigInt(a.changed_at)
            const timeB = BigInt(b.changed_at)
            return timeA < timeB ? -1 : timeA > timeB ? 1 : 0
          })
        }

        // Rebuilds `this.boards` from whatever items have arrived so far.
        // Called after every page fetch (for progressive rendering) and again
        // once activity logs are loaded (to fill in statusChangeHistory).
        const publishBoards = () => {
          const uniqueItems = new Map<string, Item>()
          for (const [, itemMap] of boardItems) {
            for (const [itemId, item] of itemMap) {
              uniqueItems.set(itemId, item)
            }
          }
          const allItems = Array.from(uniqueItems.values())

          if (allItems.length === 0) {
            this.boards = []
            return
          }

          this.boards = [{
            id: 'Combined Boards',
            name: 'Combined Boards',
            columns: [],
            groups: [],
            tasks: allItems.map((item: Item) => {
              const statusValue = item.column_values.find(cv =>
                cv.type === 'status' || cv.id === 'status' || cv.id === 'color_mkvxkwcm'
              )
              const boardId = Array.from(boardItems.entries()).find(
                ([_, itemMap]) => itemMap.has(item.id)
              )?.[0] || 'unknown'
              const statusColumnId = statusValue?.id || 'status'
              const statusChangeHistory = parseStatusChangeHistory(item.id, statusColumnId)

              return {
                id: item.id,
                name: item.name,
                status: statusValue?.text || 'Not Started',
                boardId,
                creator: item.creator ?? null,
                columnValues: item.column_values,
                assets: item.assets,
                subitems: item.subitems || [],
                statusChangeHistory,
                updates: item.updates || [],
              }
            })
          }]
        }

        // Track cursor for each board separately
        const boardCursors = new Map<string, string | null>()
        settingsStore.boardIds.forEach(id => boardCursors.set(id.toString(), null))

        let hasMore = true

        while (hasMore) {
          const cursorConditions = Array.from(boardCursors.entries())
            .map(([boardId, cursor]) => {
              // Server-side filter: only WABOT-project tickets on board 1340048713.
              // Monday inherits query_params across cursor pagination, so the filter
              // is only attached on the initial (cursor-less) call. Other boards
              // stay unfiltered — they don't necessarily have a color_mktaqj05 column.
              const wabotFilter = boardId === '1340048713' && !cursor
                ? ', query_params: {rules: [{column_id: "color_mktaqj05", compare_value: [0]}]}'
                : ''
              return `
                board_${boardId}: boards(ids: [${boardId}]) {
                  items_page(limit: 50${cursor ? `, cursor: "${cursor}"` : ''}${wabotFilter}) {
                    cursor
                    items {
                      id
                      name
                      creator {
                        id
                        name
                      }
                      column_values(ids: ["status", "priority", "project8__1", "color_mktaqj05", "person", "release_version", "text__1", "long_text__1", "datum1", "files__1"]) {
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
                        name
                        url
                        public_url
                        url_thumbnail
                      }
                      updates(limit: 100) {
                        id
                        text_body
                        creator_id
                        created_at
                        replies {
                          id
                          text_body
                          creator_id
                          created_at
                        }
                      }
                    }
                  }
                }
              `
            })
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
            hasMore = false

            for (const [boardId] of boardCursors) {
              const boardData = response.data[`board_${boardId}`]
              if (boardData?.[0]?.items_page) {
                const itemsPage = boardData[0].items_page
                const boardItemMap = boardItems.get(boardId) || new Map()

                itemsPage.items.forEach((item: Item) => {
                  boardItemMap.set(item.id, item)
                })

                boardItems.set(boardId, boardItemMap)

                if (itemsPage.cursor) {
                  boardCursors.set(boardId, itemsPage.cursor)
                  hasMore = true
                } else {
                  boardCursors.set(boardId, null)
                }
              }
            }

            // Publish partial results so the UI starts rendering immediately
            // instead of waiting for every page and the activity_logs fetch.
            publishBoards()
          } else {
            hasMore = false
          }
        }

        // Activity logs are fetched after items so the board is already visible.
        // Once populated, we republish to fill in statusChangeHistory.
        for (const [boardId] of boardCursors) {
          const boardData = await $fetch<any>('/api/monday/tasks', {
            method: 'POST',
            body: {
              query: `{
                boards(ids: [${boardId}]) {
                  activity_logs(limit: 1000) {
                    event
                    data
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
            logs.forEach((log: ActivityLog) => {
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

        publishBoards()
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
