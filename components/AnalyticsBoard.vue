<template>
  <div id="analytics-board" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-h-[calc(100vh-64px)] overflow-y-auto">
    <!-- Period Selection -->
    <div id="period-selection" class="flex flex-col items-end gap-1">
      <div id="period-controls" class="flex items-center gap-4">
        <div id="date-navigation" class="flex items-center gap-2">
          <button 
            @click="navigatePeriod(-1)"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{ 'invisible': selectedPeriod === 'total' }"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <DatePicker 
            v-model="selectedDate" 
            :showIcon="true"
            :manualInput="false"
            dateFormat="dd/mm/yy"
            class="flex-grow [&_.p-inputtext]:text-center"
            :class="{ 'invisible': selectedPeriod === 'total' }"
          />

          <button 
            @click="navigatePeriod(1)"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{ 'invisible': selectedPeriod === 'total' }"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div id="period-buttons" class="flex rounded-lg shadow-sm">
          <button 
            v-for="period in periods" 
            :key="period.value"
            @click="setPeriod(period.value)"
            :class="[
              'px-4 py-2 text-sm font-medium',
              selectedPeriod === period.value
                ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
              'first:rounded-l-lg last:rounded-r-lg',
              'border-[0.5px] border-r first:border-l border-gray-200 dark:border-gray-600'
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Date Range Display -->
      <div id="date-range-display" class="text-sm text-gray-600 dark:text-gray-400">
        {{ dateRangeText }}
      </div>
    </div>

    <!-- Charts Section -->
    <div class="flex flex-col gap-8  h-[calc(90vh-100px)]">
      <div id="tasks-chart-container">
        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Tasks by Project</h3>
        <Chart id="tasks-chart" type="bar" :data="tasksChartData" :options="tasksChartOptions" class="h-[calc(44vh-100px)]" />
      </div>

      <div id="time-chart-container">
        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Time Tracked by Project</h3>
        <Chart id="time-chart" type="bar" :data="timeChartData" :options="timeChartOptions" class="h-[calc(44vh-100px)]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
 interface ProjectStats {
   total: number
   completed: number
   timeTracked: number
 }

import { computed, ref } from 'vue'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useDailyTimeStore } from '~/stores/dailyTime'
import Chart from 'primevue/chart'
import Calendar from 'primevue/calendar'

const mondayStore = useMondayStore()
const settingsStore = useSettingsStore()
const dailyTimeStore = useDailyTimeStore()

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'total'

const periods = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Total', value: 'total' }
] as const

const selectedPeriod = ref<PeriodType>('weekly')
const selectedDate = ref(new Date())

// Calculate date range based on period and selected date
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

// Format date range for display
const dateRangeText = computed(() => {
  if (selectedPeriod.value === 'total') return 'Showing all data'
  
  const range = dateRange.value
  if (!range) return ''
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  
  if (selectedPeriod.value === 'daily') {
    return formatDate(range.start)
  }
  
  return `${formatDate(range.start)} - ${formatDate(range.end)}`
})

// Filter data based on date range
const filteredProjectStats = computed(() => {
  const stats = new Map<string, ProjectStats>()
  const range = dateRange.value
  const isTotal = selectedPeriod.value === 'total'

  // First calculate task statistics
  mondayStore.boards.forEach(board => {
    board.tasks.forEach(task => {
      const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
      const projectName = projectColumn?.text || 'No Project'
      
      // Initialize project stats if not exists
      if (!stats.has(projectName)) {
        stats.set(projectName, { total: 0, completed: 0, timeTracked: 0 })
      }

      const statusColumn = task.columnValues.find(cv => cv.id === 'status')
      const isCompleted = statusColumn?.text === 'Done'
      
      // Get completion date from status column
      let completionDate: Date | null = null
      if (isCompleted && statusColumn?.value) {
        try {
          const statusValue = JSON.parse(statusColumn.value)
          if (statusValue.changed_at) {
            completionDate = new Date(statusValue.changed_at)
          }
        } catch (e) {
          console.warn('Could not parse status value:', statusColumn.value)
        }
      }

      // Only count tasks in task statistics if they meet completion criteria
      if (isTotal || (isCompleted && completionDate && range && completionDate >= range.start && completionDate <= range.end)) {
        stats.get(projectName)!.total++
        if (isCompleted) {
          stats.get(projectName)!.completed++
        }
      }

      // Process subitems if they exist
      task.subitems?.forEach(subitem => {
        const subitemStatus = subitem.column_values.find(cv => cv.id === 'status')
        const isSubitemCompleted = subitemStatus?.text === 'Done'
        
        // Get subitem completion date
        let subitemCompletionDate: Date | null = null
        if (isSubitemCompleted && subitemStatus?.value) {
          try {
            const statusValue = JSON.parse(subitemStatus.value)
            if (statusValue.changed_at) {
              subitemCompletionDate = new Date(statusValue.changed_at)
            }
          } catch (e) {
            console.warn('Could not parse subitem status value:', subitemStatus.value)
          }
        }

        // Only count subitems in task statistics if they meet completion criteria
        if (isTotal || (isSubitemCompleted && subitemCompletionDate && range && subitemCompletionDate >= range.start && subitemCompletionDate <= range.end)) {
          stats.get(projectName)!.total++
          if (isSubitemCompleted) {
            stats.get(projectName)!.completed++
          }
        }
      })
    })
  })

  // Now calculate time tracking separately using dailyTimeStore
  const dailyTimes = dailyTimeStore.getDailyTimes
  dailyTimes.forEach(dailyTime => {
    if (isTotal || (range && 
        new Date(dailyTime.date) >= range.start && 
        new Date(dailyTime.date) <= range.end)) {
      
      dailyTime.entries.forEach(entry => {
        // Get project name from task ID
        const task = mondayStore.boards
          .flatMap(board => board.tasks)
          .find(t => t.id === entry.ticketId)
        
        if (task) {
          const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
          const projectName = projectColumn?.text || 'No Project'
          
          // Initialize project stats if not exists
          if (!stats.has(projectName)) {
            stats.set(projectName, { total: 0, completed: 0, timeTracked: 0 })
          }
          
          // Add duration to project's time tracked
          const [hours, minutes, seconds] = entry.duration.split(':').map(Number)
          const durationInSeconds = (hours * 3600) + (minutes * 60) + seconds
          stats.get(projectName)!.timeTracked += durationInSeconds
        }
      })
    }
  })

  return stats
})

// Navigation functions
const setPeriod = (period: PeriodType) => {
  selectedPeriod.value = period
}

const navigatePeriod = (direction: number) => {
  const date = new Date(selectedDate.value)
  
  switch (selectedPeriod.value) {
    case 'daily':
      date.setDate(date.getDate() + direction)
      break
    case 'weekly':
      date.setDate(date.getDate() + (direction * 7))
      break
    case 'monthly':
      date.setMonth(date.getMonth() + direction)
      break
  }
  
  selectedDate.value = date
}

// Add a function to get project status colors
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

  // Return colors for each project, falling back to default colors if not found
  return projects.map(project => colors.get(project) || '#5bbcaa')
}

// Update tasksChartData to use original colors
const tasksChartData = computed(() => {
  const projects = Array.from(filteredProjectStats.value.entries())
    .filter(([project]) => settingsStore.isProjectVisible(project))
    .sort((a, b) => b[1].total - a[1].total)
    .map(([project]) => project)

  const totalTasks = projects.map(project => filteredProjectStats.value.get(project)!.total)
  const completedTasks = projects.map(project => filteredProjectStats.value.get(project)!.completed)
  const pendingTasks = projects.map((_, index) => totalTasks[index] - completedTasks[index])

  return {
    labels: projects,
    datasets: [
      {
        label: 'Completed Tasks',
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // Soft green
        data: completedTasks,
        borderRadius: 4
      },
      {
        label: 'Pending Tasks',
        backgroundColor: 'rgba(249, 115, 22, 0.6)', // Soft orange
        data: pendingTasks,
        borderRadius: 4
      }
    ]
  }
})

// Update timeChartData to use the status colors
const timeChartData = computed(() => {
  const projects = Array.from(filteredProjectStats.value.entries())
    .filter(([project]) => settingsStore.isProjectVisible(project))
    .sort((a, b) => b[1].total - a[1].total)
    .map(([project]) => project)

  const timeTracked = projects.map(project => {
    const seconds = filteredProjectStats.value.get(project)!.timeTracked
    return Math.round(seconds / 3600 * 100) / 100 // Convert to hours with 2 decimal places
  })
  const projectColors = getProjectStatusColors(projects)

  return {
    labels: projects,
    datasets: [
      {
        label: 'Hours Tracked',
        backgroundColor: projectColors,
        data: timeTracked,
        borderRadius: 4
      }
    ]
  }
})

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const tasksChartOptions = computed(() => ({
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
          const label = context.dataset.label || ''
          const value = context.parsed.y
          const total = filteredProjectStats.value.get(context.label)?.total || 0
          const percentage = Math.round((value / total) * 100)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
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
      stacked: true,
      ticks: {
        color: '#64748b'
      },
      grid: {
        color: 'rgba(226, 232, 240, 0.2)',
        drawBorder: false
      },
      border: {
        display: false
      }
    }
  }
}))

const timeChartOptions = computed(() => ({
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
        callback: (value: number) => `${value}h`
      },
      grid: {
        color: 'rgba(226, 232, 240, 0.2)',
        drawBorder: false
      },
      border: {
        display: false
      }
    }
  }
}))
</script>