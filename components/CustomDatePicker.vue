<template>  
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