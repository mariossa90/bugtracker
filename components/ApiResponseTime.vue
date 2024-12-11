<template>
  <Transition name="fade-scale">
    <div v-if="isVisible" 
         class="flex items-center gap-2 px-3 py-1.5 bg-[#5bbcaa]/5 dark:bg-[#5bbcaa]/10 border border-[#5bbcaa]/10 dark:border-[#5bbcaa]/20 rounded-full text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 shadow-sm">
      <span class="text-gray-500 dark:text-gray-400">Updated in:</span>
      <div class="flex items-center gap-1.5">
        <i class="fas fa-clock text-[#5bbcaa] dark:text-[#4ca692]"></i>
        <span class="font-medium">{{ formattedTime }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch, ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
  responseTime: number | null
}>()

const isVisible = ref(false)
let hideTimeout: NodeJS.Timeout | null = null

const formattedTime = computed(() => {
  if (props.responseTime === null) return '--'
  return `${props.responseTime.toFixed(1)}s`
})

// Watch for changes in response time to trigger visibility
watch(() => props.responseTime, (newValue) => {
  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  
  // Show the component whenever we get a response time, even if it's the same value
  if (newValue !== null) {
    isVisible.value = true
    
    hideTimeout = setTimeout(() => {
      isVisible.value = false
    }, 5000)
  }
}, { immediate: false })

// Clean up on component unmount
onBeforeUnmount(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 1s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
