<template>  
  <div class="flex items-center gap-2">
    <!-- Next Day Button -->
    <button 
      @click="changeDate(1)"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
      title="Next Day"
    >
      <i class="fas fa-chevron-left w-4 h-4"></i>
    </button>

    <!-- Date Picker -->
    <FloatLabel variant="on">
      <DatePicker 
        v-model="selectedDate"      
        :show-icon="true"
        dateFormat="dd/mm/yy"
        :showTime="false"
        @change="handleDateChange"      
      />
      <label for="start-date">Start Date</label>
    </FloatLabel>

    <!-- Previous Day Button -->
    <button 
      @click="changeDate(-1)"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
      title="Previous Day"
    >
      <i class="fas fa-chevron-right w-4 h-4"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()

const selectedDate = ref(settingsStore.selectedDate)

// Watch the store's selected date and local ref
watch(() => settingsStore.selectedDate, (newValue) => {
  selectedDate.value = newValue
})

watch(selectedDate, (newValue) => {
  // Update the store when date changes
  settingsStore.setSelectedDate(newValue)
})

const handleDateChange = (e: Date) => {
  // Ensure the selected date is set to start of day
  const date = new Date(e)
  date.setHours(0, 0, 0, 0)
  
  // Update both the local ref and the store
  selectedDate.value = date
  settingsStore.setSelectedDate(date)
}

// Add this function to handle date navigation
const changeDate = (days: number) => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + days)
  newDate.setHours(0, 0, 0, 0)
  
  selectedDate.value = newDate
  settingsStore.setSelectedDate(newDate)
}

onMounted(() => {
  // Ensure the initial date in the store is set to start of day
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  settingsStore.setSelectedDate(today)
})
</script>

<style scoped>
:deep(.p-inputtext) {
  text-align: center !important;
}
</style>