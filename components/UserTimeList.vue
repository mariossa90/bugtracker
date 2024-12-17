<template>
  <div class="no-select daily-time-list">
    <div class="bg-light-surface dark:bg-gray-800 rounded-xl p-6">
      <div v-if="!selectedUser" class="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
        Please select a user to view their time tracking data
      </div>
      <div v-else-if="selectedUser" class="overflow-x-auto -mx-6 custom-scrollbar">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden relative">
            <table class="min-w-full rounded-lg border dark:border-gray-700 overflow-hidden">
              <!-- Loading overlay -->
              <tbody>
                <tr v-if="isLoading" class="absolute top-0 left-4 right-4 bottom-0 z-50">
                  <td colspan="100%" class="h-full rounded-lg overflow-hidden">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="loading-backdrop rounded-lg"></div>
                      <div class="loading-backdrop-edge rounded-lg"></div>
                      <div class="relative z-10 flex flex-col items-center gap-3">
                        <i class="fas fa-circle-notch fa-spin fa-2x text-[#5bbcaa]"></i>
                        <span class="text-sm font-medium text-[#5bbcaa]">Updating data...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <thead class="bg-[#5bbcaa]/5 dark:bg-[#5bbcaa]/10">
                <tr>
                  <th class="h-12 px-2 text-center text-sm font-semibold text-light-text-primary dark:text-white sticky left-0 bg-[#5bbcaa]/5 dark:bg-[#5bbcaa]/10 uppercase whitespace-nowrap w-[180px]">
                    USER
                  </th>
                  <th v-for="date in lastSevenDays" 
                      :key="date" 
                      class="h-12 px-2 text-center text-sm font-semibold text-light-text-primary dark:text-white bg-[#5bbcaa]/5 dark:bg-[#5bbcaa]/10 uppercase w-[260px]"
                  >
                    {{ formatDateDisplay(date).toUpperCase() }}
                  </th>
                </tr>
              </thead>
              <tbody class="[&>tr:last-child>td]:border-b dark:[&>tr:last-child>td]:border-gray-700">
                <template v-for="(user, index) in uniqueUsers" :key="user">
                  <!-- User row -->
                  <tr class="group">
                    <td class="h-12 py-4 pl-8 font-medium text-light-text-primary dark:text-white bg-gray-400/10 dark:bg-gray-900/70 border dark:border-gray-700">
                      <div class="flex flex-col gap-1 w-[250px]">
                        <!-- User info group -->
                        <div class="flex flex-col gap-2">
                          <!-- User image and name row -->
                          <div class="flex items-center gap-2">
                            <template v-if="settingsStore.showUserImages">
                              <img 
                                v-if="getUserImage(user)"
                                :src="getUserImage(user)!"
                                :alt="user"
                                class="w-8 h-8 rounded-full flex-shrink-0"
                              />
                              <i v-else class="fas fa-user w-8 h-8 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
                            </template>
                            <span class="truncate">{{ formatUserName(user) }}</span>
                          </div>
                          
                          <!-- Current task chip row -->
                          <div v-if="getCurrentTask(user) && isUserCurrentlyWorking(user)" 
                               class="truncate max-w-full"
                          >
                            <div class="text-sm px-2 py-0.5 rounded-full bg-[#5bbcaa]/10 text-[#5bbcaa] dark:bg-[#5bbcaa]/20 truncate"
                                 :title="getCurrentTask(user)"
                            >
                              {{ getCurrentTask(user) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td v-for="date in lastSevenDays" 
                        :key="date" 
                        class="h-12 py-4 px-2 text-center text-light-text-primary dark:text-gray-300 relative transition-opacity duration-200 group-hover:[&:not(:hover)]:opacity-80"
                        :class="[
                          isToday(date) ? 'border-t border-l border-b dark:border-gray-700' : [
                            getAbsenceInfo(user, date) && getAbsenceInfo(user, date) !== 'Business Trip' 
                              ? '' 
                              : getGoalStatusClass(calculateGoalStatus(getDailyTotal(user, date), user, date)),
                            'transition-colors duration-200'
                          ]
                        ]"
                    >
                      <!-- Show absence badge if user is absent -->
                      <span v-if="getAbsenceInfo(user, date)" 
                            class="absolute top-0 right-0 text-base px-4 py-0.5 rounded-bl-lg bg-blue-500 dark:bg-blue-600 text-white dark:text-white flex items-center gap-2 shadow-sm"
                      >
                        <i v-if="getAbsenceInfo(user, date) === 'Sick Leave'" 
                        class="fa-solid fa-house-medical"> 
                        </i> 
                        <i v-if="getAbsenceInfo(user, date) === 'Vacation'" 
                           class="fa-solid fa-umbrella-beach">
                        </i>
                        <i v-if="getAbsenceInfo(user, date) === 'Business Trip'" 
                           class="fa-solid fa-plane-departure">
                        </i>
                        {{ getAbsenceInfo(user, date) }}
                      </span>
                      
                      <div class="flex flex-col items-center justify-center gap-1 mt-2">
                        <div class="flex items-center gap-2">
                          <span class="text-lg font-medium">{{ formatDuration(getDailyTotal(user, date)) }}</span>
                          <button 
                            v-if="hasDailyEntries(user, date) && settingsStore.compactViewMode"
                            @click="toggleExpanded(date, user)"
                            class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            :class="{ 'bg-black/5 dark:bg-white/5': isExpanded(date, user) }"
                          >
                            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded(date, user) }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <!-- Detailed view mode: Show ticket chips -->
                        <div v-if="!settingsStore.compactViewMode && hasDailyEntries(user, date)" 
                             class="flex flex-col gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 w-[260px] self-start"
                        >
                          <div v-for="ticket in getGroupedTickets(user, date)" 
                               :key="ticket.id"
                               class="time-chip inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-full text-left"
                               :title="ticket.name + ' (' + getTicketTimeRange(user, date, ticket.id).start + ' - ' + getTicketTimeRange(user, date, ticket.id).end + ')'"
                          >
                            <span class="flex-shrink-0 mr-1 text-left font-bold">
                              {{ getTicketTimeRange(user, date, ticket.id).start }}{{ getTicketTimeRange(user, date, ticket.id).end === 'NaN:NaN' ? ' - Now Active' : ' - ' + getTicketTimeRange(user, date, ticket.id).end }}:
                            </span>
                            <span class="task-name truncate flex-1 text-left">{{ ticket.name }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Add email button for missed/exceeded goals -->
                      <button v-if="shouldShowEmailButton(user, date)"
                              @click="openEmailTemplate(user, date)"
                              class="absolute top-0 right-0 text-base px-4 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-2 transition-colors"
                              :class="calculateGoalStatus(getDailyTotal(user, date), user, date) === 'GOAL_MISSED' 
                                      ? 'bg-red-500 dark:bg-red-600 text-white dark:text-white hover:bg-red-600 dark:hover:bg-red-700' 
                                      : 'bg-orange-500 dark:bg-orange-600 text-white dark:text-white hover:bg-orange-600 dark:hover:bg-orange-700'"
                              :title="getEmailButtonTitle(user, date)"
                      >
                        <div class="relative">
                          <i class="far fa-envelope text-lg"></i>
                          <i class="fas fa-circle-exclamation text-[0.85em] absolute -bottom-0 -right-3 border-2 rounded-full"
                             :class="calculateGoalStatus(getDailyTotal(user, date), user, date) === 'GOAL_MISSED' 
                                     ? 'border-red-500 dark:border-red-600' 
                                     : 'border-orange-500 dark:border-orange-600'"
                          ></i>
                        </div>
                      </button>
                    </td>
                  </tr>
                  <!-- Details row -->
                  <template v-for="date in lastSevenDays" :key="`${user}-${date}-details`">
                    <tr v-if="isExpanded(date, user)" class="bg-[#5bbcaa]/[0.02] dark:bg-[#5bbcaa]/[0.03]">
                      <td colspan="8" class="p-0">
                        <div class="pl-8 pr-4 py-2">
                          <table class="w-[40%] mr-8 border-l-2 border-[#5bbcaa]/20 dark:border-[#5bbcaa]/30">
                            <thead>
                              <tr class="bg-[#5bbcaa]/[0.08] dark:bg-[#5bbcaa]/[0.12]">
                                <th class="h-12 px-4 py-2 text-left text-sm font-semibold text-light-text-primary dark:text-white uppercase w-[55%]">TICKET</th>
                                <th class="h-12 px-4 py-2 text-center text-sm font-semibold text-light-text-primary dark:text-white uppercase w-[15%]">START TIME</th>
                                <th class="h-12 px-4 py-2 text-center text-sm font-semibold text-light-text-primary dark:text-white uppercase w-[15%]">END TIME</th>
                                <th class="h-12 px-4 py-2 text-center text-sm font-semibold text-light-text-primary dark:text-white uppercase w-[15%]">DURATION</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="entry in getDailyEntries(user, date)" 
                                  :key="entry.ticketId" 
                                  class="h-12 text-sm hover:bg-[#5bbcaa]/[0.08] dark:hover:bg-[#5bbcaa]/[0.12] transition-colors"
                              >
                                <td class="h-12 px-4 py-2 text-left text-light-text-secondary dark:text-gray-300">{{ entry.ticketName }}</td>
                                <td class="h-12 px-4 py-2 text-center text-light-text-secondary dark:text-gray-300">{{ formatTimeOnly(entry.startTime) }}</td>
                                <td class="h-12 px-4 py-2 text-center text-light-text-secondary dark:text-gray-300">{{ formatTimeOnly(entry.endTime) }}</td>
                                <td class="h-12 px-4 py-2 text-center text-light-text-secondary dark:text-gray-300">{{ formatDuration(entry.duration) }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDailyTime } from '~/composables/useDailyTime'
import { useWorkGoals } from '~/composables/useWorkGoals'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useSettingsStore } from '~/stores/settings'
import { useMondayStore } from '~/stores/monday'
import { useUserStore } from '~/stores/userStore'
import { useWorkGoalsStore } from '~/stores/workGoals'
import { useUserName } from '~/composables/useUserName'
import { useAbsenceStore } from '~/stores/absence'

const mondayStore = useMondayStore()
const dailyTimeStore = useDailyTimeStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const workGoalsStore = useWorkGoalsStore()
const { processDailyTime } = useDailyTime()
const { calculateGoalStatus, getGoalStatusClass, formatGoalProgress, durationToHours } = useWorkGoals()
const { formatUserName } = useUserName()
const absenceStore = useAbsenceStore()

const props = defineProps<{
  selectedUser: string | null
  selectedDate: Date
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'total'
}>()

const expandedRow = ref<string | null>(null)

const isLoading = computed(() => mondayStore.loading);

const selectedUser = computed(() => props.selectedUser)

const lastSevenDays = computed(() => {
  if (!props.selectedDate) return []
  
  const dates = []
  const startDate = new Date(props.selectedDate)
  startDate.setHours(0, 0, 0, 0)
  
  let i = 0
  let daysAdded = 0
  
  // If period is 'total', get all available dates from dailyTimeStore
  if (props.selectedPeriod === 'total') {
    const allDates = dailyTimeStore.getDailyTimes
      .filter(item => item.userName === props.selectedUser)
      .map(item => formatDate(item.date))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort descending
    return allDates
  }
  
  const daysToShow = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  }[props.selectedPeriod]
  
  while (daysAdded < daysToShow) {
    const date = new Date(startDate)
    date.setDate(date.getDate() - i)
    
    // Skip weekends if hideWeekends is enabled
    const dayOfWeek = date.getDay()
    if (settingsStore.hideWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      i++
      continue
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
    
    i++
    daysAdded++
  }
  return dates
})

const uniqueUsers = computed(() => {
  if (!selectedUser.value) return []
  
  const users = dailyTimeStore.getUniqueUsers
  const filteredUsers = users.filter(user => settingsStore.isUserVisible(user))
  return filteredUsers.filter(user => user === selectedUser.value)
})

const getDailyEntries = (user: string, date: string) => {
  const dailyTimes = dailyTimeStore.getDailyTimes
  return dailyTimes
    .filter(item => item.userName === user && formatDate(item.date) === formatDate(date))
    .map(item => item.entries)
    .flat()
}

const getDailyTotal = (user: string, date: string) => {
  const dailyTimes = dailyTimeStore.getDailyTimes
  const entry = dailyTimes.find(item => 
    item.userName === user && 
    formatDate(item.date) === formatDate(date)
  )
  if (!entry) return '-'
  
  // Convert totalTime from HH:mm:ss to Xh Xm format
  if (entry.totalTime.includes(':')) {
    const [hours, minutes] = entry.totalTime.split(':')
    return `${parseInt(hours)}h ${parseInt(minutes)}m`
  }
  return entry.totalTime
}

const formatDate = (date: string) => {
  return new Date(date).toISOString().split('T')[0]
}

const hasDailyEntries = (user: string, date: string) => {
  return getDailyEntries(user, date).length > 0
}

const toggleExpanded = (date: string, userName: string) => {
  const rowKey = `${date}-${userName}`
  expandedRow.value = expandedRow.value === rowKey ? null : rowKey
}

const isExpanded = (date: string, userName: string) => {
  return expandedRow.value === `${date}-${userName}`
}



const formatTimeOnly = (timeString: string) => {
  const date = new Date(timeString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatDuration = (durationString: string) => {
  // If it's in HH:mm:ss format, convert to Xh Xm
  if (durationString.includes(':')) {
    const [hours, minutes] = durationString.split(':')
    return `${parseInt(hours)}h ${parseInt(minutes)}m`
  }
  // If it's already in Xh Xm format, return as is
  if (durationString.includes('h') && durationString.includes('m')) {
    return durationString
  }
  return durationString
}

const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const getCurrentTask = (user: string) => {
  const today = new Date().toISOString().split('T')[0]
  const entries = getDailyEntries(user, today)
  
  // Only show running tasks
  const runningEntry = entries.find(entry => entry.isRunning)
  return runningEntry ? runningEntry.ticketName : '-'
}

const isToday = (date: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return today.getTime() === compareDate.getTime()
}

const getUserImage = (userName: string) => {
  const mondayUser = userStore.users.find(u => u.name === userName)
  return mondayUser?.photo_thumb_small || null
}

const getGroupedTickets = (user: string, date: string) => {
  const entries = getDailyEntries(user, date)
  const ticketMap = new Map()
  
  entries.forEach(entry => {
    const existing = ticketMap.get(entry.ticketId)
    if (existing) {
      existing.totalDuration = addDurations(existing.totalDuration, entry.duration)
      if (new Date(entry.startTime) < new Date(existing.startTime)) {
        existing.startTime = entry.startTime
      }
    } else {
      ticketMap.set(entry.ticketId, {
        id: entry.ticketId,
        name: entry.ticketName,
        totalDuration: entry.duration,
        startTime: entry.startTime
      })
    }
  })
  
  return Array.from(ticketMap.values())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

const addDurations = (duration1: string, duration2: string): string => {
  const [h1, m1, s1] = duration1.split(':').map(Number)
  const [h2, m2, s2] = duration2.split(':').map(Number)
  
  let totalSeconds = s1 + s2
  let totalMinutes = m1 + m2
  let totalHours = h1 + h2
  
  if (totalSeconds >= 60) {
    totalMinutes += Math.floor(totalSeconds / 60)
    totalSeconds %= 60
  }
  
  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60)
    totalMinutes %= 60
  }
  
  return `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`
}

const getTicketTimeRange = (user: string, date: string, ticketId: string) => {
  const entries = getDailyEntries(user, date).filter(entry => entry.ticketId === ticketId)
  if (!entries.length) return { start: '', end: '' }
  
  const startTimes = entries.map(e => e.startTime)
  const endTimes = entries.map(e => e.endTime)
  
  return {
    start: formatTimeOnly(startTimes.sort()[0]),
    end: formatTimeOnly(endTimes.sort().reverse()[0])
  }
}

const getAbsenceInfo = (user: string, date: string) => {
  const reason = absenceStore.getUserAbsenceReason(user, date)
  return reason || null
}

const isUserCurrentlyWorking = (user: string) => {
  const entries = getDailyEntries(user, formatDate(new Date().toISOString()))
  return entries.some(entry => !entry.endTime || entry.endTime === 'NaN:NaN')
}

const shouldShowEmailButton = (user: string, date: string) => {
  if (!settingsStore.enableGoalEmails) return false
  
  const status = calculateGoalStatus(getDailyTotal(user, date), user, date)
  // Don't show button if:
  // 1. It's today's column
  // 2. User is marked as absent
  // 3. Status is not missed or exceeded
  const isTodays = isToday(date)
  const isAbsent = getAbsenceInfo(user, date) !== null
  const isRelevantStatus = status === 'GOAL_MISSED' || status === 'GOAL_EXCEEDED'
  
  return !isTodays && !isAbsent && isRelevantStatus
}

const getEmailButtonTitle = (user: string, date: string) => {
  const status = calculateGoalStatus(getDailyTotal(user, date), user, date)
  return status === 'GOAL_MISSED' ? 'Send reminder email' : 'Send overtime notification'
}

const openEmailTemplate = (user: string, date: string) => {
  const userEmail = userStore.users.find(u => u.name === user)?.email
  if (!userEmail) return

  const status = calculateGoalStatus(getDailyTotal(user, date), user, date)
  const hours = durationToHours(getDailyTotal(user, date))
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  const timeFormatted = `${wholeHours}h ${minutes}m`
  const goalHours = workGoalsStore.getEffectiveUserGoal(user, date)
  const firstName = user.split(' ')[0]
  
  // Format date for email - use actual date instead of "Yesterday"
  const emailDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
  
  let subject, body
  
  if (status === 'GOAL_MISSED') {
    subject = `[Monday] Missed Work Goal on ${emailDate}`
    body = `Hi ${firstName},\n\nI noticed that you logged ${timeFormatted} on ${emailDate}, which is below the daily goal of ${goalHours}h.\nPlease make sure to log your time accurately. \n\nBest regards`
  } else {
    subject = `Overtime Notice for ${emailDate}`
    body = `Hi ${firstName},\n\nI noticed that you logged ${timeFormatted} on ${emailDate}, which is more than double the daily goal of ${goalHours}h. Please check if you forgot to stop the timer on a ticket, or if its correct make sure to maintain a healthy work-life balance.\n\nBest regards`
  }

  const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  console.log('Attempting to open email with:', mailtoLink)

  // Create and click a temporary anchor element
  const a = document.createElement('a')
  a.href = mailtoLink
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<style scoped>
.daily-time-list {
  @apply relative;
}

.time-chip {
  @apply select-none;
}
.time-chip .task-name {
  @apply select-text;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #5bbcaa40;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #5bbcaa60;
}

.loading-backdrop {
  position: absolute;
  inset: 0;
  height: 200%;
  background: hsl(0deg 0% 100% / 0.1);
  pointer-events: none;
  backdrop-filter: blur(16px);
  border-radius: 0.5rem;
  mask-image: linear-gradient(
    to bottom,
    black 0,
    black 50%,
    transparent 50%
  );
}

.loading-backdrop-edge {
  --thickness: 6px;
  position: absolute;
  inset: 0;
  height: 100%;
  transform: translateY(100%);
  background: rgb(0 0 0 / 0.15);
  backdrop-filter: blur(8px) brightness(120%);
  pointer-events: none;
  border-radius: 0.5rem;
  mask-image: linear-gradient(
    to bottom,
    black 0,
    black var(--thickness),
    transparent var(--thickness)
  );
}

/* Dark mode adjustments */
:global(.dark)  .loading-backdrop {
  background: rgb(255 255 255 / 0.05);
}

:global(.dark) .loading-backdrop-edge {
  background: rgb(255 255 255 / 0.03);
}

.absence-badge {
  @apply text-sm px-2 py-1 rounded-md;
  @apply bg-orange-100 dark:bg-orange-900/30;
  @apply text-orange-800 dark:text-orange-200;
}

.goal-met {
  background-color: v-bind('settingsStore.goalColors.light.goalMet.color');
  color: v-bind('settingsStore.goalColors.light.textColor');
}
.dark .goal-met {
  background-color: v-bind('settingsStore.goalColors.dark.goalMet.color');
  color: v-bind('settingsStore.goalColors.dark.textColor');
}

.goal-partial {
  background-color: v-bind('settingsStore.goalColors.light.goalPartial.color');
  color: v-bind('settingsStore.goalColors.light.textColor');
}
.dark .goal-partial {
  background-color: v-bind('settingsStore.goalColors.dark.goalPartial.color');
  color: v-bind('settingsStore.goalColors.dark.textColor');
}

.goal-missed {
  background-color: v-bind('settingsStore.goalColors.light.goalMissed.color');
  color: v-bind('settingsStore.goalColors.light.textColor');
}
.dark .goal-missed {
  background-color: v-bind('settingsStore.goalColors.dark.goalMissed.color');
  color: v-bind('settingsStore.goalColors.dark.textColor');
}

.weekend-no-time {
  background-color: v-bind('settingsStore.goalColors.light.weekendNoTime.color');
  color: v-bind('settingsStore.goalColors.light.textColor');
}
.dark .weekend-no-time {
  background-color: v-bind('settingsStore.goalColors.dark.weekendNoTime.color');
  color: v-bind('settingsStore.goalColors.dark.textColor');
}

.time-chip {
  background-color: v-bind('settingsStore.chipColors.light.background');
  color: v-bind('settingsStore.chipColors.light.text');
}

.dark .time-chip {
  background-color: v-bind('settingsStore.chipColors.dark.background');
  color: v-bind('settingsStore.chipColors.dark.text');
}

.goal-exceeded {
  background-color: v-bind('settingsStore.goalColors.light.goalExceeded.color');
  color: v-bind('settingsStore.goalColors.light.textColor');
}
.dark .goal-exceeded {
  background-color: v-bind('settingsStore.goalColors.dark.goalExceeded.color');
  color: v-bind('settingsStore.goalColors.dark.textColor');
}
</style>