<template>
  <div>
    <div class="space-y-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Default Goals</h3>
      
      <!-- Default Goals Section -->
      <div class="overflow-hidden rounded-lg border border-light-border dark:border-gray-700 bg-light-surface dark:bg-gray-800">
        <table class="min-w-full divide-y divide-light-border dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="w-1/4 h-12 px-4 text-left text-sm font-medium text-light-text-primary dark:text-white">Type</th>
              <th class="w-1/4 h-12 px-4 text-center text-sm font-medium text-light-text-primary dark:text-white">Daily Hours</th>
              <th class="w-1/4 h-12 px-4 text-center text-sm font-medium text-light-text-primary dark:text-white">Friday Hours</th>
              <th class="w-1/4 h-12 px-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-border dark:divide-gray-700">
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
              <td class="px-4 py-3 text-sm text-light-text-primary dark:text-white">Default</td>
              <td class="px-4 py-3">
                <div class="flex justify-center relative">
                  <input
                    type="number"
                    v-model="defaultDailyHours"
                    min="0"
                    max="24"
                    step="0.5"
                    class="block w-32 rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
                    placeholder="Enter default daily hours"
                  >
                  <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <span class="text-sm text-gray-500 dark:text-gray-400">hrs</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center relative">
                  <input
                    type="number"
                    v-model="defaultFridayHours"
                    min="0"
                    max="24"
                    step="0.5"
                    class="block w-32 rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
                    placeholder="Enter Friday hours goal"
                  >
                  <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <span class="text-sm text-gray-500 dark:text-gray-400">hrs</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User-specific goals -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">User-Specific Goals</h3>
        <div class="overflow-hidden rounded-lg border border-light-border dark:border-gray-700 bg-light-surface dark:bg-gray-800">
          <table class="min-w-full divide-y divide-light-border dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="w-1/4 h-12 px-4 text-left text-sm font-medium text-light-text-primary dark:text-white">User</th>
                <th class="w-1/4 h-12 px-4 text-center text-sm font-medium text-light-text-primary dark:text-white">Daily Hours</th>
                <th class="w-1/4 h-12 px-4 text-center text-sm font-medium text-light-text-primary dark:text-white">Friday Hours</th>
                <th class="w-1/4 h-12 px-4 text-center text-sm font-medium text-light-text-primary dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-light-border dark:divide-gray-700">
              <tr v-for="user in users" :key="user" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td class="px-4 py-3 text-sm text-light-text-primary dark:text-white">{{ user }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-center relative">
                    <input
                      type="number"
                      v-model="userGoals[user]"
                      min="0"
                      max="24"
                      step="0.5"
                      class="block w-32 rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
                      :placeholder="defaultDailyHours?.toString() || ''"
                    >
                    <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <span class="text-sm text-gray-500 dark:text-gray-400">hrs</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-center relative">
                    <input
                      type="number"
                      v-model="userFridayGoals[user]"
                      min="0"
                      max="24"
                      step="0.5"
                      class="block w-32 rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa] text-center"
                      :placeholder="defaultFridayHours?.toString() || ''"
                    >
                    <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <span class="text-sm text-gray-500 dark:text-gray-400">hrs</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="resetUserGoal(user)"
                    class="inline-flex items-center px-3 py-1.5 text-sm text-light-text-primary dark:text-white hover:text-[#5bbcaa] dark:hover:text-[#5bbcaa] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <i class="fas fa-undo-alt mr-2"></i>
                    Reset
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove spinners for Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove spinners for Firefox and add standard definition for compatibility */
input[type="number"] {
  appearance: none; /* Standard property for compatibility */
  -moz-appearance: textfield;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkGoalsStore } from '~/stores/workGoals'
import { useDailyTimeStore } from '~/stores/dailyTime'

const workGoalsStore = useWorkGoalsStore()
const dailyTimeStore = useDailyTimeStore()

const defaultDailyHours = ref(workGoalsStore.defaultDailyHours || 8)
const defaultFridayHours = ref(workGoalsStore.defaultFridayHours.hours || 6)

const allUsers = computed(() => dailyTimeStore.getUniqueUsers)
const users = computed(() => allUsers.value)

const userGoals = ref<Record<string, number>>({})
const userFridayGoals = ref<Record<string, number>>({})

watch(defaultDailyHours, (newValue) => {
  workGoalsStore.setDefaultDailyHours(newValue)
})

watch(defaultFridayHours, (newValue) => {
  workGoalsStore.setDefaultFridayHours(newValue)
})

watch(userGoals, (newValue) => {
  Object.entries(newValue).forEach(([userId, hours]) => {
    const fridayHours = userFridayGoals.value[userId]
    workGoalsStore.setUserGoal(userId, hours, {
      fridayHours: { hours: fridayHours }
    })
  })
}, { deep: true })

watch(userFridayGoals, (newValue) => {
  Object.entries(newValue).forEach(([userId, hours]) => {
    if (hours !== null) {
      workGoalsStore.setUserFridayGoal(userId, hours)
    }
  })
}, { deep: true })

onMounted(() => {
  users.value.forEach(user => {
    const goal = workGoalsStore.getUserGoal(user)
    if (goal) {
      userGoals.value[user] = goal.dailyHours ?? defaultDailyHours.value
      userFridayGoals.value[user] = goal.fridayHours.hours ?? defaultFridayHours.value
    }
  })
})

const resetUserGoal = (user: string) => {
  userGoals.value[user] = defaultDailyHours.value
  userFridayGoals.value[user] = defaultFridayHours.value
  workGoalsStore.setUserGoal(user, defaultDailyHours.value, {
    fridayHours: { 
      hours: defaultFridayHours.value
    }
  })
}
</script>