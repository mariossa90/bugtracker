<template>
  <div class="no-select p-4 bg-light-background dark:bg-gray-900 min-h-screen">
    <div class="mx-auto">
      <div class="flex flex-col gap-2">
        <!-- Header with action buttons -->
        <div class="flex items-center justify-between h-[76px]">
          <div class="flex flex-col">
            <div class="flex items-center gap-4">
              <CurrentDateTime />
            </div>
          </div>
          <div class="flex gap-2">
            <ApiResponseTime :response-time="lastResponseTime" />
            <Button      
              class="bg-[#5bbcaa] hover:bg-[#4ca899] text-white px-4 py-2 rounded-lg transition-colors w-44 inline-block disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5bbcaa]"
              :disabled="isMondayLoading"
              @click="fetchMondayData"
            >
              <div class="flex flex-col items-center gap-0.5">
                <span class="font-medium">
                  {{ isMondayLoading ? 'Updating Bugs...' : 'Update Bugs Data' }}
                </span>
                <AutoUpdateCountdown ref="countdownRef" class="text-white/90" />
              </div>
            </Button>
            <button
              @click="openSettings('general')"
              class="h-[68px] aspect-square flex items-center justify-center text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {{ error }}
        </div>

        <!-- Main content -->
        <div v-if="hasItems" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm relative overflow-hidden">
          <BugsQueueBoard :items="allItems" />
        </div>

        <!-- No boards configured message -->
        <div v-else-if="!settingsStore.boardIds.length" class="text-center py-12">
          <div class="max-w-md mx-auto space-y-4">
            <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No boards configured
            </p>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Please configure your Monday.com board to start viewing bugs. Add board ID: 1340048713
            </p>
            <button 
              @click="openSettings('boards')" 
              class="mx-auto px-6 py-2 bg-[#5bbcaa] hover:bg-[#4ca899] text-white rounded-lg transition-colors"
            >
              Open Board Settings
            </button>
          </div>
        </div>

        <!-- No data message -->
        <div v-else-if="!isLoading" class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">No data available. Click "Update Bugs Data" to load bug entries.</p>
        </div>

        <!-- Settings Modal -->
        <SettingsModal
          :is-open="isSettingsOpen"
          @close="closeSettings"
          @save="saveSettings"
        />
      </div>
      <button
        @click="toggleFullscreen"
        class="fixed bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-105 group"
        :class="{ 'bg-[#5bbcaa]/10 dark:bg-[#5bbcaa]/20': isFullscreen }"
      >
        <i
          v-if="!isFullscreen"
          class="fas fa-expand w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-[#5bbcaa] dark:group-hover:text-[#5bbcaa]"
        ></i>
        <i
          v-else
          class="fas fa-compress w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-[#5bbcaa] dark:group-hover:text-[#5bbcaa]"
        ></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMondayStore } from '~/stores/monday'
import { useSettingsStore } from '~/stores/settings'
import { useMonday } from '~/composables/useMonday'
import { useDailyTime } from '~/composables/useDailyTime'
import SettingsModal from '~/components/SettingsModal.vue'
import AutoUpdateCountdown from '~/components/AutoUpdateCountdown.vue'
import CurrentDateTime from '~/components/CurrentDateTime.vue'
import ApiResponseTime from '~/components/ApiResponseTime.vue'
import { useFullscreen } from '~/composables/useFullscreen'
import BugsQueueBoard from '~/components/BugsQueueBoard.vue'

const mondayStore = useMondayStore()
const settingsStore = useSettingsStore()
const { user, boards, isLoading: isLoadingMonday, error: errorMonday, fetchBoardData: fetchBoardDataFromMonday } = useMonday()
const { processDailyTime } = useDailyTime()
const { isFullscreen, toggleFullscreen } = useFullscreen()

const hasItems = computed(() => {
  return mondayStore.boards.some(board => board.tasks.length > 0)
})

const allItems = computed(() => {
  return mondayStore.boards.flatMap(board => board.tasks)
})

const isSettingsOpen = ref(false)

const openSettings = (menu: 'general' | 'boards' | 'userVisibility' | 'userGoal' = 'general') => {
  isSettingsOpen.value = true
  settingsStore.selectedMenu = menu
}

const closeSettings = () => {
  isSettingsOpen.value = false
}

const saveSettings = () => {
  closeSettings()
}

const countdownRef = ref()

const isLoading = ref(false)
const isMondayLoading = ref(false)
const error = ref<string | null>(null)
const lastResponseTime = ref<number | null>(null)

const fetchMondayData = async () => {
  if (!settingsStore.canUpdateBoard) {
    // Show password prompt dialog
    const password = await prompt('Enter password to update board:')
    if (!password || !settingsStore.validatePassword(password)) {
      error.value = 'Invalid password'
      return
    }
  }

  isMondayLoading.value = true
  error.value = null
  const startTime = performance.now()
  
  try {
    await fetchBoardDataFromMonday()
    const endTime = performance.now()
    lastResponseTime.value = (endTime - startTime) / 1000 // Convert to seconds
    
    // Process the data after fetching
    await processDailyTime()
    
    // Reset auto-update countdown if enabled
    if (countdownRef.value?.resetCountdown) {
      countdownRef.value.resetCountdown()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred while fetching Monday data'
    lastResponseTime.value = null
  } finally {
    isMondayLoading.value = false
  }
}

// Keep the original combined function for backward compatibility and auto-update
const fetchBoardData = async () => {
  if (!settingsStore.canUpdateBoard) {
    // Show password prompt dialog
    const password = await prompt('Enter password to update board:')
    if (!password || !settingsStore.validatePassword(password)) {
      error.value = 'Invalid password'
      return
    }
  }

  isLoading.value = true
  isMondayLoading.value = true
  error.value = null
  const startTime = performance.now()
  
  try {
    await fetchBoardDataFromMonday()
    const endTime = performance.now()
    lastResponseTime.value = (endTime - startTime) / 1000 // Convert to seconds
    
    // Process the data after fetching
    await processDailyTime()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred while fetching data'
    lastResponseTime.value = null
  } finally {
    isLoading.value = false
    isMondayLoading.value = false
  }
}

const processData = async () => {
  await processDailyTime()
}
</script>

<style scoped>
.loading-backdrop {
  position: absolute;
  inset: 0;
  background: hsl(0deg 0% 100% / 0.1);
  pointer-events: none;
  backdrop-filter: blur(16px);
  border-radius: 0.75rem;
}

.loading-backdrop-edge {
  --thickness: 6px;
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.15);
  backdrop-filter: blur(8px) brightness(120%);
  pointer-events: none;
  border-radius: 0.75rem;
}

/* Dark mode adjustments */
:global(.dark) .loading-backdrop {
  background: rgb(255 255 255 / 0.05);
}

:global(.dark) .loading-backdrop-edge {
  background: rgb(255 255 255 / 0.03);
}
</style>