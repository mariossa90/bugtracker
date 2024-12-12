<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Table Settings</h3>
    
    <div class="space-y-4">
      <!-- View Mode Settings -->
      <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
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

      <!-- Visible Days Setting -->
      <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
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

      <!-- Weekend Visibility Setting -->
      <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
const settingsStore = useSettingsStore()

const toggleCompactMode = () => {
  settingsStore.setCompactViewMode(!settingsStore.compactViewMode)
}

const toggleWeekends = () => {
  settingsStore.setHideWeekends(!settingsStore.hideWeekends)
}
</script> 