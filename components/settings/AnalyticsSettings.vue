<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Visibility</h3>
    
    <div class="grid grid-cols-2 gap-4">
      <template v-for="project in availableProjects" :key="project">
        <div class="flex items-center justify-between 
                    group 
                    px-4 py-3 
                    rounded-lg 
                    hover:bg-gray-100 
                    dark:hover:bg-gray-700/50 
                    transition-colors 
                    duration-200
                    cursor-pointer"
             @click="toggleProjectVisibility(project)"
        >
          <div class="flex items-center gap-4 flex-grow min-w-0">
            <div 
              class="px-2 py-0.5 rounded-full text-xs font-medium truncate"
              :style="{
                backgroundColor: `${getProjectStatusColor(project)}20`,
                color: getProjectStatusColor(project),
                borderWidth: '1px',
                borderColor: getProjectStatusColor(project)
              }"
            >
              {{ project }}
            </div>
          </div>
          <button
            :id="'project-' + project"
            type="button"
            role="switch"
            :aria-checked="isProjectVisible(project)"
            @click.stop
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
            :class="[
              isProjectVisible(project)
                ? 'bg-[#5bbcaa]'
                : 'bg-gray-200 dark:bg-gray-700'
            ]"
          >
            <span 
              class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="isProjectVisible(project) ? 'translate-x-5' : 'translate-x-0'"
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
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useMondayStore } from '~/stores/monday'

const settingsStore = useSettingsStore()
const mondayStore = useMondayStore()

// Get unique project names from all tasks
const availableProjects = computed(() => {
  const projects = new Set<string>()
  
  mondayStore.boards.forEach(board => {
    board.tasks.forEach(task => {
      const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
      const projectName = projectColumn?.text || 'No Project'
      projects.add(projectName)
    })
  })
  
  return Array.from(projects).sort()
})

const isProjectVisible = (projectName: string) => {
  return settingsStore.isProjectVisible(projectName)
}

const toggleProjectVisibility = (projectName: string) => {
  settingsStore.toggleProjectVisibility(projectName)
}

// Add function to get project status color
const getProjectStatusColor = (projectName: string): string => {
  let color = '#5bbcaa' // Default color
  
  mondayStore.boards.forEach(board => {
    board.tasks.forEach(task => {
      const projectColumn = task.columnValues.find(cv => cv.id === 'project8__1')
      const taskProjectName = projectColumn?.text || 'No Project'
      
      if (taskProjectName === projectName) {
        const labelStyle = projectColumn?.label_style
        if (labelStyle?.color) {
          color = labelStyle.color
        }
      }
    })
  })

  return color
}
</script> 