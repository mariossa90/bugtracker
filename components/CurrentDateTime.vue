<template>
  <div class="no-select flex flex-col">
    <div class="text-4xl font-bold text-[#5bbcaa]">
      {{ currentTime }}
    </div>
    <div class="text-lg text-light-text-secondary dark:text-gray-400">
      {{ currentDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const currentDate = ref('')
let timeInterval: NodeJS.Timeout | null = null

const updateDateTime = () => {
  const now = new Date()
  
  // Format time (e.g., "14:30" or "2:30 PM")
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  // Format date (e.g., "Thursday, September 14")
  currentDate.value = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
