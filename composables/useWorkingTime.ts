import { useMondayStore } from '~/stores/monday'
import { useWorkingTimeStore } from '~/stores/workingTime'

export const useWorkingTime = () => {
  const mondayStore = useMondayStore()
  const workingTimeStore = useWorkingTimeStore()

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const processWorkingTime = () => {
    const userMap = new Map<string, {
      totalSeconds: number,
      tickets: Array<{ ticketId: string, ticketName: string, duration: number }>
    }>()

    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        // Get person from person column and handle multiple assignees
        const personColumn = task.columnValues.find(cv => cv.id === 'person')
        if (!personColumn?.text) {
          console.log(`Task ${task.name} (${task.id}) skipped - No person assigned`)
          return
        }

        // Split multiple users if they exist and process each one
        const userNames = personColumn.text.split(', ').map(name => name.trim())
        console.log(`Task ${task.name} (${task.id}) assigned to: ${userNames.join(', ')}`)
        
        // Get duration from time tracking columns
        const timeColumns = task.columnValues.filter(cv => 
          ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id) && 
          cv.value && 
          typeof cv.duration === 'number'
        )

        let totalDuration = 0
        timeColumns.forEach(timeColumn => {
          if (timeColumn.duration) {
            totalDuration += timeColumn.duration
          }
        })

        // Process each assigned user (include even if no time tracked)
        userNames.forEach(userName => {
          if (!userMap.has(userName)) {
            userMap.set(userName, {
              totalSeconds: 0,
              tickets: []
            })
          }

          const userData = userMap.get(userName)!
          userData.totalSeconds += totalDuration
          userData.tickets.push({
            ticketId: task.id,
            ticketName: task.name,
            duration: totalDuration
          })
        })

        // Process subitems if they exist
        task.subitems?.forEach(subitem => {
          const subitemTimeColumns = subitem.column_values.filter(cv => 
            cv.id === 'zeiterfassung__1' && 
            cv.value && 
            typeof cv.duration === 'number'
          )

          let subitemDuration = 0
          subitemTimeColumns.forEach(timeColumn => {
            if (timeColumn.duration) {
              subitemDuration += timeColumn.duration
            }
          })

          // Process subitem for each assigned user (include even if no time tracked)
          userNames.forEach(userName => {
            const userData = userMap.get(userName)!
            userData.totalSeconds += subitemDuration
            userData.tickets.push({
              ticketId: subitem.id,
              ticketName: `${task.name} > ${subitem.name}`,
              duration: subitemDuration
            })
          })
        })
      })
    })

    // Convert Map to array and format durations
    const userWorkTimes = Array.from(userMap.entries()).map(([userName, data]) => ({
      userName,
      totalTime: formatDuration(data.totalSeconds),
      totalSeconds: data.totalSeconds,
      tickets: data.tickets.map(ticket => ({
        ticketId: ticket.ticketId,
        ticketName: ticket.ticketName,
        duration: formatDuration(ticket.duration),
        durationSeconds: ticket.duration
      }))
    }))

    // Sort users by total time
    userWorkTimes.sort((a, b) => b.totalSeconds - a.totalSeconds)

    // Update store
    workingTimeStore.setUserWorkTimes(userWorkTimes)

    return userWorkTimes
  }

  return {
    processWorkingTime
  }
}
