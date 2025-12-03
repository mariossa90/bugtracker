<!-- GeneralSettings.vue -->
<template>
   <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Theme selection</h3>
    <div class="grid grid-cols-3 gap-4 py-4">
      <!-- Dark Theme Button -->
      <div class="theme-button bg-light-surface dark:bg-gray-900" :class="{ 'border-2 border-[#5bbcaa]': selectedTheme === 'dark' }" @click="selectedTheme = 'dark'">
        <div class="inner-element bg-gray-800 py-4">
          <div class="h-2 bg-gray-500 my-2 rounded w-4/5 mx-auto"></div>
          <div class="h-2 bg-gray-500 my-2 rounded w-4/5 mx-auto"></div>
          <div class="h-2 bg-gray-500 my-2 rounded w-4/5 mx-auto"></div>
        </div>
        <p class="text-center mt-2 text-light-text-primary dark:text-white">Dark Theme</p>
      </div>
      
      <!-- Light Theme Button -->
      <div class="theme-button bg-light-surface dark:bg-gray-900" :class="{ 'border-2 border-[#5bbcaa]': selectedTheme === 'light' }" @click="selectedTheme = 'light'">
        <div class="inner-element bg-gray-200 py-4">
          <div class="h-2 bg-gray-300 my-2 rounded w-4/5 mx-auto"></div>
          <div class="h-2 bg-gray-300 my-2 rounded w-4/5 mx-auto"></div>
          <div class="h-2 bg-gray-300 my-2 rounded w-4/5 mx-auto"></div>
        </div>
        <p class="text-center mt-2 text-light-text-primary dark:text-white">Light Theme</p>
      </div>

      <!-- System Theme Button -->
      <div class="theme-button bg-transparent" :class="[systemThemeClass, { 'border-2 border-[#5bbcaa]': selectedTheme === 'system' }]" @click="selectedTheme = 'system'">
        <div class="inner-element py-4" :class="systemInnerClass">
          <div class="h-2 my-2 rounded w-4/5 mx-auto" :class="systemLineClass"></div>
          <div class="h-2 my-2 rounded w-4/5 mx-auto" :class="systemLineClass"></div>
          <div class="h-2 my-2 rounded w-4/5 mx-auto" :class="systemLineClass"></div>
        </div>
        <p class="text-center mt-2 text-light-text-primary dark:text-white">System Theme</p>
      </div>
    </div>
    
    <!-- Auto Update Settings -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Auto Update Settings</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
          <div class="flex flex-col">
            <span class="text-sm text-light-text-primary dark:text-white">Enable Auto Update</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">Automatically refresh data at specified intervals</span>
          </div>
          <button
            @click="toggleAutoUpdate"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
            :class="settingsStore.autoUpdate ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
          >
            <span 
              class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="settingsStore.autoUpdate ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>
        
        <!-- Update Interval Input -->
        <div v-if="settingsStore.autoUpdate" class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
          <div class="flex flex-col">
            <span class="text-sm text-light-text-primary dark:text-white">Update Interval</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">Time between automatic updates</span>
          </div>
          <div class="relative w-32">
            <input
              type="number"
              v-model="settingsStore.updateInterval"
              min="5"
              max="3600"
              step="5"
              class="block w-full rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
              placeholder="Enter minutes"
            >
            <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <span class="text-sm text-gray-500 dark:text-gray-400">min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Calendar Update Settings -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Calendar Update Settings</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
          <div class="flex flex-col">
            <span class="text-sm text-light-text-primary dark:text-white">Calendar Update Interval</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">Time between calendar data updates</span>
          </div>
          <div class="relative w-32">
            <input
              type="number"
              v-model="settingsStore.calendarUpdateInterval"
              min="1"
              max="24"
              step="1"
              class="block w-full rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
              placeholder="Enter hours"
            >
            <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <span class="text-sm text-gray-500 dark:text-gray-400">h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.theme-button {
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
  user-select: none; /* Prevent text cursor */
}

.theme-button:hover {
  transform: scale(1.03);
}

.theme-button:focus {
  outline: none;
}

.inner-element {
  height: 100px;
  border-radius: 8px;
}

/* Remove spinners for Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
  appearance: none; /* Reset default appearance */
  -webkit-appearance: none; /* For Safari */
  -moz-appearance: none; /* For Firefox */
}

/* Remove spinners for Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: none; /* Reset default appearance */
  -webkit-appearance: none; /* For Safari */
  -moz-appearance: none; /* For Firefox */
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const selectedTheme = ref(settingsStore.theme)

const toggleAutoUpdate = () => {
  settingsStore.autoUpdate = !settingsStore.autoUpdate
}

watch(selectedTheme, (newTheme) => {
  settingsStore.setTheme(newTheme)
})

const systemThemeClass = computed(() => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'bg-gray-900'
    : 'bg-light-surface'
})

const systemInnerClass = computed(() => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'bg-gray-800'
    : 'bg-gray-200'
})

const systemLineClass = computed(() => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'bg-gray-500'
    : 'bg-gray-300'
})
</script>
