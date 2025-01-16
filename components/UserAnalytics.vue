<template>
  <div id="user-analytics-container" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-auto min-w-[1024px] max-h-[calc(100vh-104px)]">
    <!-- Period Selection -->
    <div id="period-selection-container" class="flex flex-col items-end gap-1">
      <div id="controls-row" class="flex items-center justify-between w-full gap-4">
        <div id="user-selection" class="flex flex-wrap gap-2 lg:max-w-[60%] xl:max-w-[65%] 2xl:max-w-[70%] max-h-[5.5rem] overflow-y-auto">
          <div class="flex flex-wrap gap-1 w-full">
            <button
              v-for="user in availableUsers"
              :key="user"
              :id="`user-button-${user.replace(/\s+/g, '-').toLowerCase()}`"
              @click="selectedUser = user"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                selectedUser === user
                  ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899]'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              ]"
            >
              <img 
                v-if="settingsStore.showUserImages && getUserImage(user)"
                :src="getUserImage(user)!" 
                :alt="user"
                class="w-6 h-6 rounded-full flex-shrink-0"
              />
              <i 
                v-else-if="settingsStore.showUserImages"
                class="fas fa-user w-6 h-6 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs"
              ></i>
              {{ formatUserName(user) }}
            </button>
          </div>
        </div>

        <div id="date-controls" class="flex items-center gap-4 flex-shrink-0">
          <div id="date-navigation" class="flex items-center gap-2">
            <button 
              id="prev-period"
              @click="navigatePeriod(-1)"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              :class="{ 'invisible': selectedPeriod === 'total' }"
            >
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <DatePicker 
              id="date-picker"
              v-model="selectedDate" 
              :showIcon="true"
              :manualInput="false"
              dateFormat="dd/mm/yy"
              class="flex-grow [&_.p-inputtext]:text-center"
              :class="{ 'invisible': selectedPeriod === 'total' }"
            />

            <button 
              id="next-period"
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
              :id="`period-${period.value}`"
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
      </div>

      <!-- Date Range Display -->
      <div id="date-range-text" class="text-sm text-gray-600 dark:text-gray-400">
        {{ dateRangeText }}
      </div>
    </div>

    <!-- User Tasks Charts -->
    <div id="charts-container" class="mt-6 h-auto">
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Column (Bar Charts) -->
        <div id="bar-charts-column" class="col-span-6 flex flex-col h-[54vh]">
          <div id="bar-chart-header" class="flex items-center justify-between mb-4">
            <h3 id="bar-chart-title" class="text-lg font-medium text-gray-800 dark:text-gray-200">
              {{ showTimeChart ? 'Time Tracked' : 'Assigned Tasks' }}
            </h3>
            <div id="bar-chart-toggle" class="flex rounded-lg shadow-sm">
              <button 
                id="time-chart-button"
                @click="showTimeChart = true"
                class="px-4 py-1.5 text-sm font-medium flex items-center gap-2 border border-r-0 first:rounded-l-lg"
                :class="[
                  showTimeChart
                    ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                ]"
              >
                <i class="fas fa-clock"></i>
                Time
              </button>
              <button 
                id="tasks-chart-button"
                @click="showTimeChart = false"
                class="px-4 py-1.5 text-sm font-medium flex items-center gap-2 border last:rounded-r-lg"
                :class="[
                  !showTimeChart
                    ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                ]"
              >
                <i class="fas fa-tasks"></i>
                Tasks
              </button>
            </div>
          </div>
          
          <!-- Combined Chart Container -->
          <div id="bar-chart-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-[calc(54vh-4rem)]">
            <div v-if="selectedUser" class="h-full">
              <Chart 
                v-if="!showTimeChart"
                type="bar" 
                :data="tasksChartData" 
                :options="tasksChartOptions" 
                class="h-full" 
              />
              <Chart 
                v-if="showTimeChart"
                type="bar" 
                :data="timeChartData" 
                :options="timeChartOptions" 
                class="h-full" 
              />
            </div>
            <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Please select a user to view their {{ showTimeChart ? 'time tracking' : 'tasks' }}
            </div>
          </div>
        </div>

        <!-- Middle Column (Pie Charts) -->
        <div id="pie-charts-column" class="col-span-3 flex flex-col h-[54vh]">
          <div id="pie-chart-header" class="flex items-center justify-between mb-4">
            <h3 id="pie-chart-title" class="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
              {{ showTimePieChart ? 'Time Distribution' : 'Tasks Distribution' }}
            </h3>
            <div id="pie-chart-toggle" class="flex rounded-lg shadow-sm">
              <button 
                id="time-pie-button"
                @click="showTimePieChart = true"
                class="px-4 py-1.5 text-sm font-medium flex items-center gap-2 border border-r-0 first:rounded-l-lg"
                :class="[
                  showTimePieChart
                    ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                ]"
              >
                <i class="fas fa-clock"></i>
                Time
              </button>
              <button 
                id="tasks-pie-button"
                @click="showTimePieChart = false"
                class="px-4 py-1.5 text-sm font-medium flex items-center gap-2 border last:rounded-r-lg"
                :class="[
                  !showTimePieChart
                    ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                ]"
              >
                <i class="fas fa-tasks"></i>
                Tasks
              </button>
            </div>
          </div>
          
          <!-- Combined Pie Chart Container -->
          <div id="pie-chart-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-[calc(54vh-4rem)]">
            <div v-if="selectedUser" class="h-full">
              <Chart 
                v-if="!showTimePieChart"
                type="pie" 
                :data="tasksPieChartData" 
                :options="pieChartOptions" 
                class="h-full w-full" 
              />
              <Chart 
                v-if="showTimePieChart"
                type="pie" 
                :data="timePieChartData" 
                :options="timePieChartOptions" 
                class="h-full w-full" 
              />
            </div>
            <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Please select a user to view their {{ showTimePieChart ? 'time' : 'tasks' }} distribution
            </div>
          </div>
        </div>

        <!-- Task Details Column -->
        <div id="task-details-column" class="col-span-3 flex flex-col h-[54vh]">
          <h3 id="task-details-title" class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-5">Task Details</h3>
          <div id="task-details-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-[calc(54vh-4rem)] overflow-auto">
            <div v-if="selectedUser" class="space-y-2 h-full overflow-y-auto">
              <!-- Summary Section -->
              <div id="summary-section" class="mb-6 grid grid-cols-2 gap-4">
                <div id="total-time-card" class="bg-[#5bbcaa]/10 dark:bg-[#5bbcaa]/20 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                  <div class="text-xl font-semibold text-[#5bbcaa]">
                    {{ formatTime(getTotalTimeTracked()) }}
                  </div>
                </div>
                <div id="total-tasks-card" class="bg-[#5bbcaa]/10 dark:bg-[#5bbcaa]/20 rounded-lg p-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                  <div class="text-xl font-semibold text-[#5bbcaa]">
                    {{ getTotalTasks() }}
                  </div>
                </div>
              </div>
              
              <div 
                v-for="[project, tasks] in projectTasks" 
                :key="project" 
                :id="`project-${project.replace(/\s+/g, '-').toLowerCase()}`"
                class="border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <!-- Project Header -->
                <button 
                  :id="`project-header-${project.replace(/\s+/g, '-').toLowerCase()}`"
                  @click="toggleProject(project)"
                  class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  :style="{
                    borderLeft: `4px solid ${getProjectStatusColors([project])[0]}`,
                    paddingLeft: '1rem'
                  }"
                >
                  <div class="flex items-center gap-2">
                    <i 
                      class="fas fa-chevron-right transition-transform"
                      :class="{ 'rotate-90': expandedProjects.includes(project) }"
                      :style="{ color: getProjectStatusColors([project])[0] }"
                    ></i>
                    <span class="font-medium" :style="{ color: getProjectStatusColors([project])[0] }">{{ project }}</span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                    <span>{{ tasks.length }} tasks</span>
                    <span>{{ formatTime(getProjectTotalTime(tasks)) }} ({{ getProjectTimePercentage(project, getProjectTotalTime(tasks)) }}%)</span>
                  </div>
                </button>
                
                <!-- Task List -->
                <div 
                  :id="`task-list-${project.replace(/\s+/g, '-').toLowerCase()}`"
                  v-show="expandedProjects.includes(project)" 
                  class="border-t border-gray-200 dark:border-gray-600"
                >
                  <div 
                    v-for="task in [...tasks].sort((a, b) => b.timeTracked - a.timeTracked)" 
                    :key="task.id" 
                    :id="`task-${task.id}`"
                    class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600/50 flex items-center justify-between"
                  >
                    <div class="flex items-center justify-between flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <i 
                          class="fas fa-circle text-xs"
                          :style="{ color: task.status.color }"
                          :title="task.status.text"
                        ></i>
                        <div class="w-6 h-6 rounded-full flex-shrink-0" :title="`Assigned to ${task.assignedUser.name}`">
                          <img 
                            v-if="task.assignedUser.image"
                            :src="task.assignedUser.image" 
                            :alt="task.assignedUser.name"
                            class="w-full h-full rounded-full"
                          />
                          <i 
                            v-else
                            class="fas fa-user w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs"
                          ></i>
                        </div>
                        <a 
                          class="truncate min-w-0 lg:max-w-[150px] xl:max-w-[180px] 2xl:max-w-[220px] hover:text-[#5bbcaa] cursor-pointer transition-colors" 
                          :title="task.name"
                          @click.stop="openMondayTask(task.boardId, task.id)"
                        >
                          {{ task.name }}
                        </a>
                        <button 
                          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          @click.stop="copyToClipboard(task.name)"
                          title="Copy task name"
                        >
                          <i class="fas fa-copy text-xs"></i>
                        </button>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 ml-4">
                        {{ formatTime(task.timeTracked) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Please select a user to view their tasks
            </div>
          </div>
        </div>

        <!-- UserTimeList Container -->
        <div id="user-time-list-container" class="col-span-12">
          <UserTimeList 
            :selected-user="selectedUser"
            :selected-date="selectedDate"
            :selected-period="selectedPeriod"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useUserStore } from '~/stores/userStore'
import { useUserName } from '~/composables/useUserName'
import { useUserAnalytics, type PeriodType } from '~/composables/useUserAnalytics'
import Chart from 'primevue/chart'
import Calendar from 'primevue/calendar'
import UserTimeList from '~/components/UserTimeList.vue'

const mondayStore = useMondayStore()
const settingsStore = useSettingsStore()
const dailyTimeStore = useDailyTimeStore()
const userStore = useUserStore()
const { formatUserName } = useUserName()

const periods = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Total', value: 'total' }
] as const

const selectedPeriod = ref<PeriodType>('weekly')
const selectedDate = ref(new Date())
const selectedUser = ref<string | null>(null)

// Get analytics data from composable
const {
  dateRange,
  tasksChartData,
  tasksPieChartData,
  timeChartData,
  timePieChartData,
  pieChartOptions,
  timePieChartOptions,
  tasksChartOptions,
  timeChartOptions,
  projectTasks,
  getProjectStatusColors
} = useUserAnalytics(selectedPeriod, selectedDate, selectedUser)

// Get unique users
const availableUsers = computed(() => {
  return dailyTimeStore.getUniqueUsers.filter(user => settingsStore.isUserVisible(user))
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

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// Get user image
const getUserImage = (userName: string) => {
  const mondayUser = userStore.users.find(u => u.name === userName)
  return mondayUser?.photo_thumb_small || null
}

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

// Add to script setup
const expandedProjects = ref<string[]>([])

// Add these functions
const toggleProject = (project: string) => {
  const index = expandedProjects.value.indexOf(project)
  if (index === -1) {
    expandedProjects.value.push(project)
  } else {
    expandedProjects.value.splice(index, 1)
  }
}

const getProjectTotalTime = (tasks: any[]) => {
  return tasks.reduce((total, task) => total + task.timeTracked, 0)
}



// Add this function with the other functions
const getProjectTimePercentage = (project: string, projectTime: number) => {
  // Get total time across all projects
  const totalTime = Array.from(projectTasks.value.entries()).reduce((total, [_, tasks]) => {
    return total + getProjectTotalTime(tasks)
  }, 0)
  
  // Calculate percentage
  return totalTime > 0 ? Math.round((projectTime / totalTime) * 100) : 0
}

// Add copyToClipboard function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

// Add the function to open Monday task
const openMondayTask = (boardId: string, taskId: string) => {
  const url = `https://woojin-world.monday.com/boards/${boardId}/pulses/${taskId}`
  window.open(url, '_blank')
}

const showTimeChart = ref(true)
const showTimePieChart = ref(true)

// Add these helper functions
const getTotalTimeTracked = () => {
  let totalTime = 0
  for (const [_, tasks] of projectTasks.value) {
    totalTime += getProjectTotalTime(tasks)
  }
  return totalTime
}

const getTotalTasks = () => {
  let totalTasks = 0
  for (const [_, tasks] of projectTasks.value) {
    totalTasks += tasks.length
  }
  return totalTasks
}
</script> 