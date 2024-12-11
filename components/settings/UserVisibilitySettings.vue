<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">User Visibility</h3>
    
    <!-- Show User Images Toggle -->
    <div class="mb-8">
      <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
          <span class="text-sm text-light-text-primary dark:text-white">Show User Images</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Display user profile pictures in the time tracking table</span>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="settingsStore.showUserImages"
          @click="settingsStore.setShowUserImages(!settingsStore.showUserImages)"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
          :class="settingsStore.showUserImages ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
        >
          <span 
            class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="settingsStore.showUserImages ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
      </div>
    </div>
    <!-- Show First Names Only Toggle -->
    <div class="mb-8">
      <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
          <span class="text-sm text-light-text-primary dark:text-white">Show First Names Only</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Display only first names in the time tracking table</span>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="settingsStore.showFirstNameOnly"
          @click="settingsStore.setShowFirstNameOnly(!settingsStore.showFirstNameOnly)"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
          :class="settingsStore.showFirstNameOnly ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
        >
          <span 
            class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="settingsStore.showFirstNameOnly ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
      </div>
    </div>
    <!-- User List -->
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">User List</h3>
    <div class="grid grid-cols-2 gap-4">
      <template v-for="user in allUsers" :key="user">
        <div class="flex items-center justify-between 
                    group 
                    px-4 py-3 
                    rounded-lg 
                    hover:bg-gray-100 
                    dark:hover:bg-gray-700/50 
                    transition-colors 
                    duration-200">
          <div class="flex items-center gap-4 flex-grow min-w-0">
            <img 
              v-if="getUserImage(user)"
              :src="getUserImage(user)!" 
              :alt="user"
              class="w-10 h-10 rounded-full flex-shrink-0"
            />
            <i v-else class="fas fa-user w-10 h-10 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
            <label 
              :for="'user-' + user" 
              class="text-sm text-light-text-primary dark:text-white flex-grow truncate 
                     group-hover:text-[#5bbcaa] 
                     transition-colors 
                     duration-200"
            >
              {{ formatUserName(user) }}
            </label>
          </div>
          <button
            :id="'user-' + user"
            type="button"
            role="switch"
            :aria-checked="settingsStore.isUserVisible(user)"
            @click="settingsStore.toggleUserVisibility(user)"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
            :class="settingsStore.isUserVisible(user) ? 'bg-[#5bbcaa]' : 'bg-gray-200 dark:bg-gray-700'"
          >
            <span 
              class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="settingsStore.isUserVisible(user) ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.group {
  user-select: none; /* Prevent text cursor */
}
</style>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useDailyTimeStore } from '~/stores/dailyTime'
import { useUserStore } from '~/stores/userStore'
import { useUserName } from '~/composables/useUserName'

const settingsStore = useSettingsStore()
const dailyTimeStore = useDailyTimeStore()
const userStore = useUserStore()
const { formatUserName } = useUserName()

const allUsers = computed(() => dailyTimeStore.getUniqueUsers)
const users = computed(() => allUsers.value)

const getUserImage = (userName: string) => {
  const mondayUser = userStore.users.find(u => u.name === userName)
  return mondayUser?.photo_thumb_small || null
}

onMounted(async () => {
  
  
  users.value.forEach(user => {
    // Removed code related to work goals
  })
})
</script>