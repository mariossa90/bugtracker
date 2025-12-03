<template>
  <div id="user-analytics-container" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-hidden min-w-[1024px] h-[calc(100vh-104px)] w-full max-w-full">
    <!-- 2 Column Layout -->
    <div class="flex h-full w-full max-w-full overflow-hidden">
      <!-- Left Column (Takes remaining space) -->
      <div id="left-column" class="flex-1 flex flex-col pr-4 border-r border-gray-200 dark:border-gray-600 min-w-0 overflow-hidden h-full max-h-full">
        <!-- Charts Container -->
        <div id="charts-container" class="flex flex-col h-full min-h-0">
          <div id="charts-row" class="flex gap-6 min-w-0 flex-1 min-h-0 overflow-hidden">
            <!-- Task Details Column (Now First) -->
            <div id="task-details-column" class="flex-1 flex flex-col min-w-0 min-h-0">
              <div id="task-details-header" class="flex items-center justify-between mb-4 min-h-[2.5rem] flex-shrink-0">
                <h3 id="task-details-title" class="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Task Details (by {{ getGroupingLabel() }})
                </h3>
              </div>
              <div id="task-details-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex-1 overflow-y-auto min-h-0">
                <div v-if="selectedUser" class="space-y-2">
                  <!-- Grouping Row (First Row Inside Container) -->
                  <div id="grouping-row" class="flex items-center justify-start gap-2 mb-4">
                    <div id="grouping-buttons" class="flex rounded-lg shadow-sm w-full">
                      <button 
                        v-for="grouping in groupings" 
                        :key="grouping.value"
                        :id="`grouping-${grouping.value}`"
                        @click="selectedGrouping = grouping.value"
                        :class="[
                          'px-3 py-1.5 text-sm font-medium flex items-center justify-center gap-2 flex-1',
                          selectedGrouping === grouping.value
                            ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899] border-[#5bbcaa]'
                            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
                          'first:rounded-l-lg last:rounded-r-lg',
                          'border-[0.5px] border-r first:border-l border-gray-200 dark:border-gray-600'
                        ]"
                      >
                        <i :class="['fas', grouping.icon]"></i>
                        {{ grouping.label }}
                      </button>
                    </div>
                  </div>

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
                    v-for="[group, tasks] in projectTasks" 
                    :key="group" 
                    :id="`group-${group.replace(/\s+/g, '-').toLowerCase()}`"
                    class="border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <!-- Group Header -->
                    <button 
                      :id="`group-header-${group.replace(/\s+/g, '-').toLowerCase()}`"
                      @click="toggleProject(group)"
                      class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      :style="{
                        borderLeft: `4px solid ${getProjectStatusColors([group])[0]}`,
                        paddingLeft: '1rem'
                      }"
                    >
                      <div class="flex items-center gap-2">
                        <i 
                          class="fas fa-chevron-right transition-transform"
                          :class="{ 'rotate-90': expandedProjects.includes(group) }"
                          :style="{ color: getProjectStatusColors([group])[0] }"
                        ></i>
                        <span class="font-medium" :style="{ color: getProjectStatusColors([group])[0] }">{{ group }}</span>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                        <span>{{ tasks.length }} tasks</span>
                        <span>{{ formatTime(getProjectTotalTime(tasks)) }} ({{ getProjectTimePercentage(group, getProjectTotalTime(tasks)) }}%)</span>
                      </div>
                    </button>
                    
                    <!-- Task List -->
                    <div 
                      :id="`task-list-${group.replace(/\s+/g, '-').toLowerCase()}`"
                      v-show="expandedProjects.includes(group)" 
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

            <!-- Bar Charts Column (Now Second) -->
            <div id="bar-charts-column" class="flex-1 flex flex-col min-w-0 min-h-0">
              <div id="bar-chart-header" class="flex items-center justify-between mb-4 min-h-[2.5rem] flex-shrink-0">
                <h3 id="bar-chart-title" class="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {{ showTimeChart ? 'Time Tracked' : `Assigned ${getGroupingLabel()}` }}
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
                    <i :class="['fas', getCurrentGroupingIcon()]"></i>
                    {{ getGroupingLabel() }}
                  </button>
                </div>
              </div>
          
          <!-- Combined Chart Container -->
          <div id="bar-chart-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex-1 min-h-0 overflow-hidden">
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
              Please select a user to view their {{ showTimeChart ? 'time tracking' : getGroupingLabel().toLowerCase() }}
            </div>
            </div>
            </div>

            <!-- Pie Charts Column (Now Third) -->
            <div id="pie-charts-column" class="flex-1 flex flex-col min-w-0 min-h-0">
              <div id="pie-chart-header" class="flex items-center justify-between mb-4 min-h-[2.5rem] flex-shrink-0">
                <h3 id="pie-chart-title" class="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
                  {{ showTimePieChart ? 'Time Distribution' : `${getGroupingLabel()} Distribution` }}
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
                    <i :class="['fas', getCurrentGroupingIcon()]"></i>
                    {{ getGroupingLabel() }}
                  </button>
                </div>
              </div>
          
          <!-- Combined Pie Chart Container -->
          <div id="pie-chart-container" class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex-1 min-h-0 overflow-hidden">
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
              Please select a user to view their {{ showTimePieChart ? 'time' : getGroupingLabel().toLowerCase() }} distribution
            </div>
              </div>
            </div>
          </div>

          <!-- UserTimeList Container -->
          <div 
            id="user-time-list-container" 
            class="w-full flex-shrink-0 overflow-x-auto min-w-0"
          >
            <UserTimeList 
              :selected-user="selectedUser"
              :selected-date="selectedDate"
              :selected-period="selectedPeriod"
            />
          </div>
        </div>
      </div>

      <!-- Right Column (Auto width based on content) -->
      <div id="right-column" class="flex-shrink-0 flex flex-col gap-4 pl-4 overflow-auto">
        <!-- Date Controls -->
        <div id="date-controls" class="flex flex-col items-center gap-2">
          <div id="period-buttons" class="flex rounded-lg shadow-sm w-full">
            <button 
              v-for="period in periods" 
              :key="period.value"
              :id="`period-${period.value}`"
              @click="setPeriod(period.value)"
              :class="[
                'px-4 py-2 text-sm font-medium flex-1',
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

          <div id="date-navigation" class="flex items-center gap-2 w-full">
            <button 
              id="prev-period"
              @click="navigatePeriod(-1)"
              class="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
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
              class="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              :class="{ 'invisible': selectedPeriod === 'total' }"
            >
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Date Range Display -->
          <div id="date-range-text" class="text-sm text-gray-600 dark:text-gray-400 text-center">
            {{ dateRangeText }}
          </div>
        </div>

        <!-- Separator -->
        <div class="border-t border-gray-200 dark:border-gray-600"></div>

        <!-- User Selection List -->
        <div id="user-selection" class="flex flex-col gap-1 overflow-y-auto">
          <button
            v-for="user in availableUsers"
            :key="user"
            :id="`user-button-${user.replace(/\s+/g, '-').toLowerCase()}`"
            @click="selectedUser = user"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 w-full',
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
            <span class="truncate">{{ formatUserName(user) }}</span>
          </button>
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
import { useUserAnalytics, type PeriodType, type GroupingType } from '~/composables/useUserAnalytics'
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

const groupings = [
  { label: 'Task', value: 'project', icon: 'fa-tasks' },
  { label: 'Project Name', value: 'projectname', icon: 'fa-folder' },
  { label: 'Sprint', value: 'sprint', icon: 'fa-rocket' }
] as const

const selectedPeriod = ref<PeriodType>('weekly')
const selectedDate = ref(new Date())
const selectedUser = ref<string | null>(null)
const selectedGrouping = ref<GroupingType>('project')

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
} = useUserAnalytics(selectedPeriod, selectedDate, selectedUser, selectedGrouping)

// Get unique users
const availableUsers = computed(() => {
  return dailyTimeStore.getUniqueUsers.filter(user => settingsStore.isUserVisible(user))
})

// Auto-select first user on mount
onMounted(() => {
  if (availableUsers.value.length > 0 && !selectedUser.value) {
    selectedUser.value = availableUsers.value[0]
  }
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

// Get grouping label
const getGroupingLabel = () => {
  const grouping = groupings.find(g => g.value === selectedGrouping.value)
  return grouping?.label || 'Task'
}

// Get current grouping icon
const getCurrentGroupingIcon = () => {
  const grouping = groupings.find(g => g.value === selectedGrouping.value)
  return grouping?.icon || 'fa-tasks'
}
</script> 