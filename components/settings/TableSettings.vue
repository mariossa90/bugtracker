<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Table Settings</h3>
    
    <div class="grid grid-cols-2 gap-3 mb-6">
      <!-- View Mode Settings -->
      <div class="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col gap-0.5">
          <span class="text-sm text-light-text-primary dark:text-white">Compact View Mode</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Show less details in the time table</span>
        </div>
        <button
          @click="toggleCompactMode"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
          :class="settingsStore.compactViewMode ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
        >
          <span 
            class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="settingsStore.compactViewMode ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
      </div>

      <!-- Weekend Visibility Setting -->
      <div class="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col gap-0.5">
          <span class="text-sm text-light-text-primary dark:text-white">Hide Weekends</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Remove Saturday and Sunday from the table</span>
        </div>
        <button
          @click="toggleWeekends"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
          :class="settingsStore.hideWeekends ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
        >
          <span 
            class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="settingsStore.hideWeekends ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
      </div>

      <!-- Visible Days Setting -->
      <div class="col-span-2 flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col gap-0.5">
          <span class="text-sm text-light-text-primary dark:text-white">Visible Days</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Number of days shown in the table</span>
        </div>
        <div class="flex items-center gap-4">
          <input
            type="range"
            v-model="settingsStore.visibleDays"
            min="1"
            max="7"
            step="1"
            class="w-32 accent-[#5bbcaa]"
          >
          <span class="text-sm text-light-text-primary dark:text-white w-8 text-center">
            {{ settingsStore.visibleDays }}
          </span>
        </div>
      </div>
    </div>

    <!-- Colors Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-md font-medium text-gray-900 dark:text-white">Colors</h4>
        <button 
          @click="restoreDefaultColors" 
          class="px-2.5 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <i class="fas fa-rotate-left text-xs"></i>
          Restore Defaults
        </button>
      </div>
      
      <div class="grid grid-cols-2 gap-x-4">
        <!-- Goal Colors Settings -->
        <div class="space-y-2 col-span-1">
          <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Status</h5>
          
          <!-- Text Color Setting -->
          <div class="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <span class="text-sm text-light-text-primary dark:text-white">Text Color</span>
            <div class="flex items-center gap-6">
              <div class="relative group">
                <input 
                  type="color" 
                  :value="settingsStore.goalColors[currentTheme].textColor"
                  @input="e => updateTextColor(currentTheme, (e.target as HTMLInputElement).value)"
                  class="w-8 h-8 rounded cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative z-10"
                >
                <span class="absolute inset-0 rounded ring-2 ring-transparent group-hover:ring-[#5bbcaa] transition-all duration-200 pointer-events-none"></span>
              </div>            
            </div>
          </div>
          
          <!-- Color Settings Grid -->
          <div class="grid gap-1">
            <template v-for="(status, index) in ['goalMet', 'goalPartial', 'goalMissed', 'weekendNoTime']" :key="status">
              <div class="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <span class="text-sm text-light-text-primary dark:text-white">
                  {{ formatStatusLabel(status) }}
                </span>
                <div class="relative group">
                  <input 
                    type="color" 
                    :value="settingsStore.goalColors[currentTheme][(status as StatusType)].color"
                    @input="e => updateColor(currentTheme, status as StatusType, (e.target as HTMLInputElement).value)"
                    class="w-8 h-8 rounded cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative z-10"
                  >
                  <span class="absolute inset-0 rounded ring-2 ring-transparent group-hover:ring-[#5bbcaa] transition-all duration-200 pointer-events-none"></span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Chip Colors Settings -->
        <div class="space-y-2 col-span-1">
          <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Chips</h5>
          
          <div class="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <span class="text-sm text-light-text-primary dark:text-white">
              Background
            </span>
            <div class="relative group">
              <input 
                type="color" 
                :value="settingsStore.chipColors[currentTheme].background"
                @input="e => updateChipBackground(currentTheme, (e.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative z-10"
              >
              <span class="absolute inset-0 rounded ring-2 ring-transparent group-hover:ring-[#5bbcaa] transition-all duration-200 pointer-events-none"></span>
            </div>
          </div>
          
          <div class="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <span class="text-sm text-light-text-primary dark:text-white">
              Text Color
            </span>
            <div class="relative group">
              <input 
                type="color" 
                :value="settingsStore.chipColors[currentTheme].text"
                @input="e => updateChipText(currentTheme, (e.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative z-10"
              >
              <span class="absolute inset-0 rounded ring-2 ring-transparent group-hover:ring-[#5bbcaa] transition-all duration-200 pointer-events-none"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import debounce from 'lodash/debounce'

const settingsStore = useSettingsStore()

const toggleCompactMode = () => {
  settingsStore.setCompactViewMode(!settingsStore.compactViewMode)
}

const toggleWeekends = () => {
  settingsStore.setHideWeekends(!settingsStore.hideWeekends)
}

// Get current theme
const currentTheme = computed(() => {
  if (settingsStore.theme === 'system') {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return settingsStore.theme
})

// Format status labels for display
const formatStatusLabel = (status: string): string => {
  const labels = {
    goalMet: 'Goal Met',
    goalPartial: 'Goal Partial',
    goalMissed: 'Goal Missed',
    weekendNoTime: 'Weekend'
  }
  return labels[status as keyof typeof labels]
}

// Restore default colors
const restoreDefaultColors = () => {
  settingsStore.resetGoalColors()
  settingsStore.resetChipColors()
}

type ThemeType = 'light' | 'dark'
type StatusType = 'goalMet' | 'goalPartial' | 'goalMissed' | 'weekendNoTime'

// Create debounced update functions
const updateColor = debounce((theme: ThemeType, status: StatusType, color: string) => {
  settingsStore.goalColors[theme][status].color = color
}, 16)

const updateTextColor = debounce((theme: ThemeType, color: string) => {
  settingsStore.goalColors[theme].textColor = color
}, 16)

// Add back the chip color update functions
const updateChipBackground = debounce((theme: ThemeType, color: string) => {
  settingsStore.chipColors[theme].background = color
}, 16)

const updateChipText = debounce((theme: ThemeType, color: string) => {
  settingsStore.chipColors[theme].text = color
}, 16)
</script> 