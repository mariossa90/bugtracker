<template>
  <div class="min-h-screen">
    <div class="bg-light-background dark:bg-gray-900 min-h-screen">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    }
  ]
})

import { useSettingsStore } from '~/stores/settings'
import { useUserStore } from '~/stores/userStore'
import { onMounted, watch } from 'vue'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

const applyTheme = () => {
  const htmlEl = document.documentElement

  // Remove existing theme classes
  htmlEl.classList.remove('light', 'dark')

  if (settingsStore.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    htmlEl.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    htmlEl.classList.add(settingsStore.theme)
  }
}

// Apply theme and fetch users on initial load
onMounted(async () => {
  applyTheme()
  
  // Initialize users store
  if (!userStore.users.length) {
    await userStore.fetchUsers()
  }

  // Add system theme change listener for 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = () => {
    if (settingsStore.theme === 'system') {
      applyTheme()
    }
  }
  
  mediaQuery.addListener(handleThemeChange)
  
  // Cleanup listener
  return () => {
    mediaQuery.removeListener(handleThemeChange)
  }
})

// Watch for theme changes in store
watch(() => settingsStore.theme, applyTheme)
</script>
