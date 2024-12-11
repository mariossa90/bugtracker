import { useMondayStore } from '~/stores/monday'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useUserStore } from '~/stores/userStore'

export const useDailyTime = () => {
  const mondayStore = useMondayStore()
  const dailyTimeStore = useDailyTimeStore()
  const userStore = useUserStore()

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateDurationInSeconds = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.floor((end.getTime() - start.getTime()) / 1000)
  }

  const formatDate = (date: string): string => {
    return new Date(date).toISOString().split('T')[0]
  }

  const processDailyTime = () => {
    if (!mondayStore.boards || mondayStore.boards.length === 0) {
      dailyTimeStore.setDailyTimes([])
      return []
    }

    const dailyMap = new Map<string, Map<string, {
      totalSeconds: number,
      entries: Array<{
        ticketId: string,
        ticketName: string,
        project: string,
        startTime: string,
        endTime: string | null,
        durationSeconds: number,
        isRunning: boolean
      }>
    }>>()

    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        // Get project from project column
        const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
        const projectName = projectColumn?.text || 'No Project'

        // Get time tracking columns with history
        const timeColumns = task.columnValues.filter(cv => 
          ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id) && 
          cv.history && cv.history.length > 0
        )

        // Process each time tracking entry
        timeColumns.forEach(timeColumn => {
          if (timeColumn.history && timeColumn.history.length > 0) {
            timeColumn.history.forEach(entry => {
              // Process both completed entries and running timers
              if (entry.started_at && entry.started_user_id) {
                const date = formatDate(entry.started_at)
                const userName = userStore.users.find(u => String(u.id) === String(entry.started_user_id))?.name
                
                if (userName) {
                  if (!dailyMap.has(date)) {
                    dailyMap.set(date, new Map())
                  }

                  const dateMap = dailyMap.get(date)!
                  if (!dateMap.has(userName)) {
                    dateMap.set(userName, {
                      totalSeconds: 0,
                      entries: []
                    })
                  }

                  const userEntry = dateMap.get(userName)!
                  const now = new Date().toISOString()
                  const endTime = entry.ended_at || now
                  const durationSeconds = calculateDurationInSeconds(entry.started_at, endTime)
                  
                  userEntry.totalSeconds += durationSeconds
                  userEntry.entries.push({
                    ticketId: task.id,
                    ticketName: task.name,
                    project: projectName,
                    startTime: entry.started_at,
                    endTime: entry.ended_at || null,
                    durationSeconds,
                    isRunning: !entry.ended_at
                  })
                }
              }
            })
          }
        })

        // Process subitems with the same logic
        task.subitems?.forEach(subitem => {
          const subitemTimeColumns = subitem.column_values.filter(cv => 
            cv.id === 'zeiterfassung__1' && 
            cv.history && cv.history.length > 0
          )

          subitemTimeColumns.forEach(timeColumn => {
            if (timeColumn.history && timeColumn.history.length > 0) {
              timeColumn.history.forEach(entry => {
                if (entry.started_at && entry.started_user_id) {
                  const date = formatDate(entry.started_at)
                  const userName = userStore.users.find(u => String(u.id) === String(entry.started_user_id))?.name
                  
                  if (userName) {
                    if (!dailyMap.has(date)) {
                      dailyMap.set(date, new Map())
                    }

                    const dateMap = dailyMap.get(date)!
                    if (!dateMap.has(userName)) {
                      dateMap.set(userName, {
                        totalSeconds: 0,
                        entries: []
                      })
                    }

                    const userEntry = dateMap.get(userName)!
                    const now = new Date().toISOString()
                    const endTime = entry.ended_at || now
                    const durationSeconds = calculateDurationInSeconds(entry.started_at, endTime)
                    
                    userEntry.totalSeconds += durationSeconds
                    userEntry.entries.push({
                      ticketId: subitem.id,
                      ticketName: `${task.name} > ${subitem.name}`,
                      project: projectName,
                      startTime: entry.started_at,
                      endTime: entry.ended_at || null,
                      durationSeconds,
                      isRunning: !entry.ended_at
                    })
                  }
                }
              })
            }
          })
        })
      })
    })

    // Convert Map to array and format durations
    const dailyTimes = Array.from(dailyMap.entries()).flatMap(([date, userMap]) => 
      Array.from(userMap.entries()).map(([userName, data]) => ({
        date,
        userName,
        totalTime: formatDuration(data.totalSeconds),
        totalSeconds: data.totalSeconds,
        entries: data.entries.map(entry => ({
          ticketId: entry.ticketId,
          ticketName: entry.ticketName,
          project: entry.project,
          startTime: entry.startTime,
          endTime: entry.endTime || '', 
          duration: formatDuration(entry.durationSeconds),
          durationSeconds: entry.durationSeconds,
          isRunning: entry.isRunning as boolean
        }))
      }))
    )

    // Sort by date (newest first) and total time
    dailyTimes.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return b.totalSeconds - a.totalSeconds
    })

    // Update store
    dailyTimeStore.setDailyTimes(dailyTimes)

    return dailyTimes
  }

  return {
    processDailyTime
  }
}
