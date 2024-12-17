<template>
  <div class="flex flex-col h-[calc(100vh-64px)] p-6 overflow-hidden">
    <div class="flex-none">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Tickets Dashboard
      </h2>

      <!-- Updated Search Bar -->
      <div class="mb-6">
        <div class="relative w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for tickets..."
            class="w-full px-4 py-3 pl-10 pr-4 text-base border-2 rounded-lg 
                   bg-white dark:bg-gray-800 
                   border-gray-200 dark:border-gray-700
                   text-gray-900 dark:text-gray-100
                   focus:ring-[#5bbcaa] focus:border-[#5bbcaa] focus:ring-2 focus:border-2 focus:outline-none"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fas fa-search text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-grow pb-20">
      <div v-for="ticket in searchResults" 
           :key="ticket.id"
           class="bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-100 dark:border-gray-800 
                    h-fit relative">
        <!-- Card Header -->
        <div class="p-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
              {{ ticket.name }}
            </h3>
            <a :href="getMondayUrl(ticket.id)" 
               target="_blank"
               class="ml-2 text-[#5bbcaa] hover:text-[#4ca899] transition-colors flex-shrink-0">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-3 space-y-2">
          <!-- Project -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Project:</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="getProjectStyle(ticket.project)">
              {{ ticket.project }}
            </span>
          </div>

          <!-- Status -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Status:</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="getStatusStyle(ticket.status, ticket.statusColor)">
              {{ ticket.status }}
            </span>
          </div>

          <!-- Assigned To -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Assigned to:</span>
            <div class="flex items-center gap-2">
              <template v-if="settingsStore.showUserImages">
                <img v-if="getUserImage(ticket.assignedTo)"
                     :src="getUserImage(ticket.assignedTo)"
                     :alt="ticket.assignedTo"
                     class="w-6 h-6 rounded-full flex-shrink-0"
                />
                <i v-else 
                   class="fas fa-user w-6 h-6 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 
                          flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                </i>
              </template>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ ticket.assignedTo }}</span>
            </div>
          </div>

          <!-- Priority -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Priority:</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="getPriorityStyle(ticket.priority, ticket.priorityColor)">
              {{ ticket.priority }}
            </span>
          </div>

          <!-- Development Timeline -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Timeline:</span>
            <span class="text-sm text-gray-700 dark:text-gray-300 flex-1" v-html="ticket.timeline"></span>
          </div>

          <!-- Estimated Duration -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Estimated:</span>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ ticket.estimatedTime }}</span>
          </div>

          <!-- Time Tracking -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32">Time tracked:</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ formatDuration(ticket.totalTime) }}
              </span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div class="h-full rounded-full transition-all duration-300"
                   :style="getProgressBarStyle(ticket.totalTime, ticket.estimatedSeconds)">
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="toggleTimeEntries(ticket.id)"
            class="text-sm text-[#5bbcaa] hover:text-[#4ca899] transition-colors flex items-center gap-1"
          >
            <i :class="['fas', expandedTickets.includes(ticket.id) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            {{ expandedTickets.includes(ticket.id) ? 'Hide' : 'View' }} Time Entries
          </button>

          <!-- Time Entries List -->
          <div v-if="expandedTickets.includes(ticket.id)" class="mt-4">
            <div v-if="ticket.timeEntries.length > 0" 
                 class="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
              <div v-for="(entry, index) in ticket.timeEntries" 
                   :key="index"
                   class="text-sm bg-gray-100 dark:bg-gray-600 rounded-lg p-2 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <template v-if="settingsStore.showUserImages">
                    <img v-if="getUserImage(entry.userName)"
                         :src="getUserImage(entry.userName)"
                         :alt="entry.userName"
                         class="w-6 h-6 rounded-full flex-shrink-0"
                    />
                    <i v-else 
                       class="fas fa-user w-6 h-6 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 
                              flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                    </i>
                  </template>
                  <span class="text-gray-600 dark:text-gray-300">{{ entry.userName }}</span>
                  <span class="text-gray-400 dark:text-gray-500">•</span>
                  <span class="text-gray-600 dark:text-gray-300">{{ formatDate(entry.date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[#5bbcaa]">{{ formatDuration(entry.durationSeconds) }}</span>
                  <span v-if="entry.isRunning" 
                        class="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No time entries found
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useUserStore } from '~/stores/userStore'

const dailyTimeStore = useDailyTimeStore()
const mondayStore = useMondayStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const searchQuery = ref('')
const debouncedSearchQuery = ref('')

let timeout: NodeJS.Timeout | null = null

watch(searchQuery, (newValue) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue
  }, 200) // 200ms delay
})

interface Ticket {
  id: string
  name: string
  project: string
  projectColor: string
  status: string
  statusColor: string
  assignedTo: string
  priority: string
  priorityColor: string
  timeline: string
  estimatedTime: string
  totalTime: number
  estimatedSeconds: number | null
  timeEntries: TimeEntry[]
}

interface TimeEntry {
  userName: string
  date: string
  durationSeconds: number
  isRunning: boolean
}

const getProjectStyle = (projectName: string) => {
  const color = getProjectColorFromMonday(projectName)
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const getProjectColorFromMonday = (projectName: string): string => {
  for (const board of mondayStore.boards) {
    for (const task of board.tasks) {
      const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
      if (projectColumn?.text === projectName) {
        return projectColumn.label_style?.color || '#cbd5e1'
      }
    }
  }
  return '#cbd5e1'
}

const getStatusStyle = (status: string, color: string) => {
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const getPriorityStyle = (priority: string, color: string) => {
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const getProgressBarStyle = (actual: number, estimated: number | null) => {
  if (!estimated || estimated === 0) {
    return { 
      width: '0%',
      backgroundColor: '#5bbcaa'
    };
  }
  
  const percentage = Math.min((actual / estimated) * 100, 100);
  const isOvertime = actual > estimated;
  
  return { 
    width: `${percentage}%`,
    backgroundColor: isOvertime ? '#ef4444' : '#5bbcaa'  // red if overtime, default accent color otherwise
  };
}

const getMondayUrl = (taskId: string): string => {
  const task = mondayStore.boards
    .flatMap(board => board.tasks)
    .find(t => t.id === taskId)
  
  return `https://woojin-world.monday.com/boards/${task?.boardId}/pulses/${taskId}`
}

const formatTimelineDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}. ${month} ${year}`;
}

const formatTimeline = (timeline: string): string => {
  if (!timeline) return 'No Timeline';
  
  const dates = timeline.split(' - ');
  if (dates.length !== 2) return timeline;
  
  const startDate = formatTimelineDate(dates[0]);
  const endDate = formatTimelineDate(dates[1]);
  
  return `From <span class="text-[#5bbcaa]">${startDate}</span> Until <span class="text-[#5bbcaa]">${endDate}</span>`;
}

const searchResults = computed<Ticket[]>(() => {
  if (!debouncedSearchQuery.value) return []
  
  const query = debouncedSearchQuery.value.toLowerCase()
  const results: Ticket[] = []

  // Create a map of time entries by ticket ID
  const timeEntriesMap = new Map<string, {
    totalTime: number,
    entries: TimeEntry[]
  }>()

  // Process all time entries first
  dailyTimeStore.dailyTimes.forEach(dailyTime => {
    dailyTime.entries.forEach(entry => {
      if (!timeEntriesMap.has(entry.ticketId)) {
        timeEntriesMap.set(entry.ticketId, {
          totalTime: 0,
          entries: []
        })
      }

      const timeData = timeEntriesMap.get(entry.ticketId)!
      timeData.totalTime += entry.durationSeconds
      timeData.entries.push({
        userName: dailyTime.userName,
        date: dailyTime.date,
        durationSeconds: entry.durationSeconds,
        isRunning: entry.isRunning
      })
    })
  })

  // Then process Monday tasks
  for (const board of mondayStore.boards) {
    for (const task of board.tasks) {
      if (task.name.toLowerCase().includes(query)) {
        const timeData = timeEntriesMap.get(task.id)
        
        // Get columns using the correct IDs from the Monday data
        const statusColumn = task.columnValues.find(cv => cv.id === 'status')
        const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
        const assignedColumn = task.columnValues.find(cv => cv.id === 'person')
        const priorityColumn = task.columnValues.find(cv => cv.id === 'priority')
        const estimatedColumn = task.columnValues.find(cv => cv.id === 'zahlen')
        const timelineColumn = task.columnValues.find(cv => cv.id === 'zeitleiste')

        results.push({
          id: task.id,
          name: task.name,
          project: projectColumn?.text || 'No Project',
          projectColor: projectColumn?.label_style?.color || '#cbd5e1',
          status: statusColumn?.text || 'No Status',
          statusColor: statusColumn?.label_style?.color || '#cbd5e1',
          assignedTo: assignedColumn?.text || 'Unassigned',
          priority: priorityColumn?.text || 'No Priority',
          priorityColor: priorityColumn?.label_style?.color || '#cbd5e1',
          timeline: timelineColumn?.text ? formatTimeline(timelineColumn.text) : 'No Timeline',
          estimatedTime: estimatedColumn?.text ? `${estimatedColumn.text}h` : 'No Estimate',
          estimatedSeconds: estimatedColumn?.value ? parseInt(estimatedColumn.value.replace('"', '')) * 3600 : null,
          totalTime: timeData?.totalTime || 0,
          timeEntries: timeData?.entries || []
        })
      }
    }
  }

  return results
})

const getUserImage = (userName: string): string | undefined => {
  const user = userStore.users.find(u => u.name === userName)
  return user?.photo_thumb_small || undefined
}

// Add new ref for expanded tickets
const expandedTickets = ref<string[]>([])

// Add toggle function
const toggleTimeEntries = (ticketId: string) => {
  const index = expandedTickets.value.indexOf(ticketId)
  if (index === -1) {
    expandedTickets.value.push(ticketId)
  } else {
    expandedTickets.value.splice(index, 1)
  }
}

// Add date formatter
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #5bbcaa #e2e8f0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #e2e8f0;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #5bbcaa;
  border-radius: 3px;
}

:global(.dark) .custom-scrollbar {
  scrollbar-color: #5bbcaa #1f2937;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}
</style> 