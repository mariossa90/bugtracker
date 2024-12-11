import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useUserStore } from '~/stores/userStore'

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'total'

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
  selectedUser: Ref<string | null>
) {
  const mondayStore = useMondayStore()
  const settingsStore = useSettingsStore()
  const dailyTimeStore = useDailyTimeStore()
  const userStore = useUserStore()

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
    for (const [project, taskCount] of tasksByProject) {
      stats.set(project, {
        total: taskCount,
        timeTracked: 0
      })
    }
    
    // Calculate time tracked per project
    if (selectedUser.value) {
      const userId = userStore.users.find(u => u.name === selectedUser.value)?.id.toString()
      
      if (userId) {
        mondayStore.boards.forEach(board => {
          board.tasks.forEach(task => {
            // Get project name
            const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
            const projectName = projectColumn?.text || 'No Project'
            
            if (!settingsStore.isProjectVisible(projectName)) return
            
            // Get time tracking columns
            const timeColumns = task.columnValues.filter(cv => 
              ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
            )
            
            // Calculate time from main task
            timeColumns.forEach(timeColumn => {
              if (timeColumn.history) {
                const timeTracked = calculateTimeFromHistory(timeColumn.history, userId, range)
                
                if (timeTracked > 0) {
                  const currentStats = stats.get(projectName) || { total: 0, timeTracked: 0 }
                  stats.set(projectName, {
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
                    const currentStats = stats.get(projectName) || { total: 0, timeTracked: 0 }
                    stats.set(projectName, {
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
        position: 'right' as const,
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
        position: 'right' as const,
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
        position: 'bottom',
        align: 'end',
        labels: {
          color: '#64748b'
        }
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
        position: 'bottom',
        align: 'end',
        labels: {
          color: '#64748b'
        }
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
    
    const projectTasks = new Map<string, number>()
    const range = dateRange.value
    
    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        // Check task status
        const statusColumn = task.columnValues.find(cv => cv.id === 'status')
        const taskStatus = statusColumn?.text
        
        // Skip tasks with unwanted statuses
        if (taskStatus === 'Cancelled') return

        // Get project name and assigned user
        const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
        const projectName = projectColumn?.text || 'No Project'
        const personColumn = task.columnValues.find(cv => cv.id === 'person')
        const assignedUser = personColumn?.text

        // In total view, include all assigned tasks regardless of time tracking
        if (selectedPeriod.value === 'total' && assignedUser === selectedUser.value) {
          projectTasks.set(
            projectName,
            (projectTasks.get(projectName) || 0) + 1
          )
          return // Skip time tracking check for total view
        }

        // For other views, continue with time tracking check
        const timeColumns = task.columnValues.filter(cv => 
          ['zeiterfassung5__1', 'zeiterfassung__1'].includes(cv.id)
        )

        let hasTimeInPeriod = false
        timeColumns.forEach(timeColumn => {
          if (timeColumn.duration) {
            if (!range) {
              hasTimeInPeriod = true
            } else if (timeColumn.value) {
              try {
                const timeValue = JSON.parse(timeColumn.value)
                const timeDate = new Date(timeValue.changed_at || timeValue.timestamp)
                if (timeDate >= range.start && timeDate <= range.end) {
                  hasTimeInPeriod = true
                }
              } catch (e) {
                console.warn('Could not parse time value:', timeColumn.value)
              }
            }
          }
        })

        // Skip if no time tracked in period (except for total view)
        if (!hasTimeInPeriod) return
        
        // Count task if assigned to user
        if (assignedUser === selectedUser.value) {
          projectTasks.set(
            projectName, 
            (projectTasks.get(projectName) || 0) + 1
          )
        }
        
        // Check subitems if they exist
        task.subitems?.forEach(subitem => {
          const subitemPerson = subitem.column_values.find(cv => cv.id === 'person')
          const subitemAssignedUser = subitemPerson?.text
          
          // Check if subitem has time entries in the selected period
          let hasSubitemTimeInPeriod = false
          const subitemTimeColumns = subitem.column_values.filter(cv => 
            cv.id === 'zeiterfassung__1'
          )
          
          subitemTimeColumns.forEach(timeColumn => {
            if (timeColumn.duration) {
              if (!range) {
                hasSubitemTimeInPeriod = true
              } else if (timeColumn.value) {
                try {
                  const timeValue = JSON.parse(timeColumn.value)
                  const timeDate = new Date(timeValue.changed_at || timeValue.timestamp)
                  if (timeDate >= range.start && timeDate <= range.end) {
                    hasSubitemTimeInPeriod = true
                  }
                } catch (e) {
                  console.warn('Could not parse time value:', timeColumn.value)
                }
              }
            }
          })

          // Only count subitem if it has time tracked in period
          if (hasSubitemTimeInPeriod && subitemAssignedUser === selectedUser.value) {
            projectTasks.set(
              projectName,
              (projectTasks.get(projectName) || 0) + 1
            )
          }
        })
      })
    })
    
    // Filter out projects that should not be visible
    const filteredTasks = new Map<string, number>()
    for (const [project, count] of projectTasks) {
      if (settingsStore.isProjectVisible(project)) {
        filteredTasks.set(project, count)
      }
    }
    
    return filteredTasks
  })

  // Add this helper function to get project colors
  const getProjectStatusColors = (projects: string[]) => {
    const colors = new Map<string, string>()
    
    mondayStore.boards.forEach(board => {
      board.tasks.forEach(task => {
        const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
        const projectName = projectColumn?.text || 'No Project'
        
        if (!colors.has(projectName)) {
          const labelStyle = projectColumn?.label_style
          if (labelStyle?.color) {
            colors.set(projectName, labelStyle.color)
          }
        }
      })
    })

    return projects.map(project => colors.get(project) || '#5bbcaa')
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
        const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
        const projectName = projectColumn?.text || 'No Project'
        
        if (!settingsStore.isProjectVisible(projectName)) return
        
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
          const projectTasks = tasks.get(projectName) || []
          projectTasks.push({
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
          tasks.set(projectName, projectTasks)
        }
      })
    })
    
    // Sort projects by total time
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