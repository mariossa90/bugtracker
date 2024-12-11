<template>
  <div v-if="settingsStore.autoUpdate" class="text-xs opacity-75">
    Next update in {{ formattedTime }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useAutoUpdate } from '~/composables/useAutoUpdate'

const settingsStore = useSettingsStore()
const { secondsLeft, startInterval } = useAutoUpdate()

const formattedTime = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = secondsLeft.value % 60
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Expose reset method
defineExpose({
  resetCountdown: startInterval
})
</script>
