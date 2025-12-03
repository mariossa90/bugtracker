import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useUserStore } from '~/stores/userStore'

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'total'
export type GroupingType = 'project' | 'projectname' | 'sprint'

interface ProjectStats {
  total: number
  timeTracked: number
}

interface ChartData {
  labels: string[]
  datasets: {
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderRadius?: number
    borderWidth?: number
  }[]
}

interface ChartOptions {
  // Will define specific chart options later
  [key: string]: any
}

interface TaskDetail {
  id: string
  name: string
  timeTracked: number
  status: {
    text: string
    color: string
  }
  assignedUser: {
    name: string
    image: string | null
  }
  boardId: string
}

export function useUserAnalytics(
  selectedPeriod: Ref<PeriodType>,
  selectedDate: Ref<Date>,
  selectedUser: Ref<string | null>,
  groupingMode: Ref<GroupingType>
) {
  const mondayStore = useMondayStore()
  const settingsStore = useSettingsStore()
  const dailyTimeStore = useDailyTimeStore()
  const userStore = useUserStore()

  // Helper function to get group name based on grouping mode
  const getGroupName = (task: any): string => {
    switch (groupingMode.value) {
      case 'project':
        const projectColumn = task.columnValues.find((cv: any) => cv.id === 'project8__1')
        return projectColumn?.text || 'No Task'
      case 'projectname':
        const projectNameColumn = task.columnValues.find((cv: any) => cv.id === 'color_mktaqj05')
        return projectNameColumn?.text || 'No Project Name'
      case 'sprint':
        const sprintColumn = task.columnValues.find((cv: any) => cv.id === 'color_mkx09tgx')
        return sprintColumn?.text || 'No Sprint'
      default:
        return 'Unknown'
    }
  }

  // Helper function to get group color based on grouping mode
  const getGroupColor = (task: any): string => {
    switch (groupingMode.value) {
      case 'project':
        const projectColumn = task.columnValues.find((cv: any) => cv.id === 'project8__1')
        return projectColumn?.label_style?.color || '#5bbcaa'
      case 'projectname':
        const projectNameColumn = task.columnValues.find((cv: any) => cv.id === 'color_mktaqj05')
        return projectNameColumn?.label_style?.color || '#5bbcaa'
      case 'sprint':
        const sprintColumn = task.columnValues.find((cv: any) => cv.id === 'color_mkx09tgx')
        return sprintColumn?.label_style?.color || '#5bbcaa'
      default:
        return '#5bbcaa'
    }
  }

  // Will implement these computed properties later
  const dateRange = computed(() => {
    const date = new Date(selectedDate.value)
    
    switch (selectedPeriod.value) {
      case 'daily':
        return {
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(date.setHours(23, 59, 59, 999))
        }
      
      case 'weekly': {
        const day = date.getDay()
        const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
        const monday = new Date(date.setDate(diff))
        monday.setHours(0, 0, 0, 0)
        
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)
        
        return { start: monday, end: sunday }
      }
      
      case 'monthly': {
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        
        return { start, end }
      }
      
      case 'total':
        return null
    }
  })
  const filteredUserStats = computed(() => {
    const stats = new Map<string, ProjectStats>()
    const tasksByProject = calculateUserTasksByProject.value
    const range = dateRange.value
    
    // Initialize stats with task counts
    for (const [group, taskCount] of tasksByProject) {
      stats.set(group, {
        total: taskCount,
        timeTracked: 0
      })
    }
    
    // Calculate time tracked per group
    if (selectedUser.value) {
      const userId = userStore.users.find(u => u.name === selectedUser.value)?.id.toString()
      
      if (userId) {
        mondayStore.boards.forEach(board => {
          board.tasks.forEach(task => {
            // Get group name based on grouping mode
            const groupName = getGroupName(task)
            
            // For project mode, check visibility
            if (groupingMode.value === 'project') {
              if (!settingsStore.isProjectVisible(groupName)) return
            }
            
            // Get time tracking columns
            const timeColumns = task.columnValues.filter(cv => 
              ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
            )
            
            // Calculate time from main task
            timeColumns.forEach(timeColumn => {
              if (timeColumn.history) {
                const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
                
                if (timeTracked > 0) {
                  const currentStats = stats.get(groupName) || { total: 0, timeTracked: 0 }
                  stats.set(groupName, {
                    ...currentStats,
                    timeTracked: currentStats.timeTracked + timeTracked
                  })
                }
              }
            })
            
            // Calculate time from subitems
            task.subitems?.forEach(subitem => {
              const subitemTimeColumns = subitem.column_values.filter(cv => 
                cv.id === 'zeiterfassung__1'
              )
              
              subitemTimeColumns.forEach(timeColumn => {
                if (timeColumn.history) {
                  const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
                  
                  if (timeTracked > 0) {
                    const currentStats = stats.get(groupName) || { total: 0, timeTracked: 0 }
                    stats.set(groupName, {
                      ...currentStats,
                      timeTracked: currentStats.timeTracked + timeTracked
                    })
                  }
                }
              })
            })
          })
        })
      }
    }
    
    return stats
  })
  
  // Chart data computeds - to be implemented
  const tasksChartData = computed<ChartData>(() => {
    const projects = Array.from(filteredUserStats.value.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([project]) => project)

    const totalTasks = projects.map(project => 
      filteredUserStats.value.get(project)!.total
    )
    
    const projectColors = getProjectStatusColors(projects)

    return {
      labels: projects,
      datasets: [{
        label: 'Tasks Worked On',
        data: totalTasks,
        backgroundColor: projectColors,
        borderRadius: 4
      }]
    }
  })

  const tasksPieChartData = computed<ChartData>(() => {
    const projects = Array.from(filteredUserStats.value.entries())
      .filter(([_, stats]) => stats.total > 0)
      .sort((a, b) => b[1].total - a[1].total)

    const projectColors = getProjectStatusColors(projects.map(([project]) => project))

    return {
      labels: projects.map(([project]) => project),
      datasets: [{
        data: projects.map(([_, stats]) => stats.total),
        backgroundColor: projectColors,
        borderWidth: 0,
        borderRadius: 4
      }]
    }
  })

  const timeChartData = computed<ChartData>(() => {
    const projects = Array.from(filteredUserStats.value.entries())
      .sort((a, b) => b[1].timeTracked - a[1].timeTracked)
      .map(([project]) => project)

    const timeTracked = projects.map(project => {
      const seconds = filteredUserStats.value.get(project)!.timeTracked
      return Math.round(seconds / 3600 * 100) / 100 // Convert to hours with 2 decimal places
    })
    
    const projectColors = getProjectStatusColors(projects)

    return {
      labels: projects,
      datasets: [{
        label: 'Hours Tracked',
        data: timeTracked,
        backgroundColor: projectColors,
        borderRadius: 4
      }]
    }
  })

  const timePieChartData = computed<ChartData>(() => {
    const projects = Array.from(filteredUserStats.value.entries())
      .filter(([_, stats]) => stats.timeTracked > 0)
      .sort((a, b) => b[1].timeTracked - a[1].timeTracked)

    const projectColors = getProjectStatusColors(projects.map(([project]) => project))

    return {
      labels: projects.map(([project]) => project),
      datasets: [{
        data: projects.map(([_, stats]) => Math.round(stats.timeTracked / 3600 * 100) / 100),
        backgroundColor: projectColors,
        borderWidth: 0,
        borderRadius: 4
      }]
    }
  })

  // Chart options computeds - to be implemented
  const pieChartOptions = computed<ChartOptions>(() => ({
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          color: '#64748b',
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11
          },
          boxWidth: 8,
          boxHeight: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const value = context.parsed
            const percentage = Math.round((value / total) * 100)
            return `Tasks: ${value} (${percentage}%)`
          }
        }
      }
    }
  }))
  const timePieChartOptions = computed<ChartOptions>(() => ({
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          color: '#64748b',
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11
          },
          boxWidth: 8,
          boxHeight: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const value = context.parsed
            const percentage = Math.round((value / total) * 100)
            return `Time: ${formatTime(value * 3600)} (${percentage}%)`
          }
        }
      }
    }
  }))
  const tasksChartOptions = computed<ChartOptions>(() => ({
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            return `Tasks: ${value}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          stepSize: 1,
          padding: 8,
          maxTicksLimit: 8
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.2)',
          drawBorder: false
        },
        border: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        left: 8
      }
    }
  }))
  const timeChartOptions = computed<ChartOptions>(() => ({
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const seconds = value * 3600
            return `Time Tracked: ${formatTime(seconds)}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        ticks: {
          color: '#64748b',
          callback: (value: number) => `${value}h`,
          padding: 8,
          maxTicksLimit: 8
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.2)',
          drawBorder: false
        },
        border: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        left: 8
      }
    }
  }))

  const calculateUserTasksByProject = computed(() => {
    if (!selectedUser.value) return new Map<string, number>()
    
    const groupTasks = new Map<string, number>()
    const range = dateRange.value
    
    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        // Check task status
        const statusColumn = task.columnValues.find(cv => cv.id === 'status')
        const taskStatus = statusColumn?.text
        
        // Skip tasks with unwanted statuses
        if (taskStatus === 'Cancelled') return

        // Get group name based on grouping mode
        const groupName = getGroupName(task)

        // Check if user has tracked time on this task
        const timeColumns = task.columnValues.filter(cv => 
          ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
        )

        let hasTimeInPeriod = false
        const userId = userStore.users.find(u => u.name === selectedUser.value)?.id.toString()
        
        timeColumns.forEach(timeColumn => {
          if (timeColumn.history) {
            const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
            if (timeTracked > 0) {
              hasTimeInPeriod = true
            }
          }
        })

        // Count task if user tracked time on it
        if (hasTimeInPeriod) {
          groupTasks.set(
            groupName, 
            (groupTasks.get(groupName) || 0) + 1
          )
        }
        
        // Check subitems
        task.subitems?.forEach(subitem => {
          const subitemTimeColumns = subitem.column_values.filter(cv => 
            cv.id === 'zeiterfassung__1'
          )
          
          let hasSubitemTimeInPeriod = false
          subitemTimeColumns.forEach(timeColumn => {
            if (timeColumn.history) {
              const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
              if (timeTracked > 0) {
                hasSubitemTimeInPeriod = true
              }
            }
          })

          // Count subitem if user tracked time on it
          if (hasSubitemTimeInPeriod) {
            groupTasks.set(
              groupName,
              (groupTasks.get(groupName) || 0) + 1
            )
          }
        })
      })
    })
    
    // Filter visible projects only if grouping by project
    const filteredTasks = new Map<string, number>()
    for (const [group, count] of groupTasks) {
      if (groupingMode.value === 'project') {
        if (settingsStore.isProjectVisible(group)) {
          filteredTasks.set(group, count)
        }
      } else {
        filteredTasks.set(group, count)
      }
    }
    
    return filteredTasks
  })

  // Add this helper function to get group colors
  const getProjectStatusColors = (groups: string[]) => {
    const colors = new Map<string, string>()
    
    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        const groupName = getGroupName(task)
        
        if (!colors.has(groupName)) {
          const color = getGroupColor(task)
          colors.set(groupName, color)
        }
      })
    })

    return groups.map(group => colors.get(group) || '#5bbcaa')
  }

  // Add this helper function to calculate time from history entries
  const calculateTimeFromHistory = (history: any[], userId: string, range: { start: Date, end: Date } | null) => {
    let totalTime = 0

    history.forEach(entry => {
      // Skip active entries (no ended_at)
      if (!entry.ended_at) return

      // Only count time if it was logged by the selected user
      if (entry.started_user_id === userId) {
        const startTime = new Date(entry.started_at)
        const endTime = new Date(entry.ended_at)
        
        // If no range (total period) or if time entry overlaps with range
        if (!range || (
          // Entry starts before range ends AND ends after range starts
          startTime <= range.end && endTime >= range.start
        )) {
          // Calculate the overlap period
          const effectiveStart = range ? new Date(Math.max(startTime.getTime(), range.start.getTime())) : startTime
          const effectiveEnd = range ? new Date(Math.min(endTime.getTime(), range.end.getTime())) : endTime
          
          totalTime += (effectiveEnd.getTime() - effectiveStart.getTime()) / 1000
        }
      }
    })

    return totalTime
  }

  // Add helper function for time formatting
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const projectTasks = computed(() => {
    if (!selectedUser.value) return new Map<string, TaskDetail[]>()
    
    const tasks = new Map<string, TaskDetail[]>()
    const range = dateRange.value
    const userId = userStore.users.find(u => u.name === selectedUser.value)?.id.toString()
    
    if (!userId) return tasks
    
    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        // Get group name based on grouping mode
        const groupName = getGroupName(task)
        
        // For project mode, check visibility
        if (groupingMode.value === 'project') {
          if (!settingsStore.isProjectVisible(groupName)) return
        }
        
        // Get assigned user info
        const personColumn = task.columnValues.find(cv => cv.id === 'person')
        const assignedUserName = personColumn?.text || 'Unassigned'
        const assignedUser = userStore.users.find(u => u.name === assignedUserName)
        
        // Calculate time from main task
        const timeColumns = task.columnValues.filter(cv => 
          ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
        )
        
        let taskTimeTracked = 0
        timeColumns.forEach(timeColumn => {
          if (timeColumn.history) {
            const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
            taskTimeTracked += timeTracked
          }
        })
        
        // Calculate time from subitems
        let subitemTimeTracked = 0
        task.subitems?.forEach(subitem => {
          const subitemTimeColumns = subitem.column_values.filter(cv => 
            cv.id === 'zeiterfassung__1'
          )
          
          subitemTimeColumns.forEach(timeColumn => {
            if (timeColumn.history) {
              const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
              subitemTimeTracked += timeTracked
            }
          })
        })
        
        // Add task if it has time tracked OR if it's total view and assigned to user
        if ((taskTimeTracked > 0 || subitemTimeTracked > 0) || 
            (selectedPeriod.value === 'total' && assignedUserName === selectedUser.value)) {
          const groupTasks = tasks.get(groupName) || []
          groupTasks.push({
            id: task.id,
            name: task.name,
            timeTracked: taskTimeTracked + subitemTimeTracked,
            status: {
              text: task.columnValues.find(cv => cv.id === 'status')?.text || 'No Status',
              color: task.columnValues.find(cv => cv.id === 'status')?.label_style?.color || '#6E6E6E'
            },
            assignedUser: {
              name: assignedUserName,
              image: assignedUser?.photo_thumb_small || null
            },
            boardId: task.boardId
          })
          tasks.set(groupName, groupTasks)
        }
      })
    })
    
    // Sort groups by total time
    return new Map([...tasks.entries()].sort((a, b) => {
      const aTotal = a[1].reduce((sum, task) => sum + task.timeTracked, 0)
      const bTotal = b[1].reduce((sum, task) => sum + task.timeTracked, 0)
      return bTotal - aTotal
    }))
  })

  return {
    // Data
    dateRange,
    filteredUserStats,
    
    // Chart Data
    tasksChartData,
    tasksPieChartData,
    timeChartData,
    timePieChartData,
    
    // Chart Options
    pieChartOptions,
    timePieChartOptions,
    tasksChartOptions,
    timeChartOptions,
    projectTasks,
    getProjectStatusColors,
  }
} 