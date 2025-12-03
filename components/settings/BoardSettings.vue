<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Board Settings</h3>
    <div class="space-y-6">
      <!-- Predefined Boards -->
      <div class="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex flex-col">
          <span class="text-sm text-light-text-primary dark:text-white">Quick Add Boards</span>
          <span class="text-sm text-gray-500 dark:text-gray-400 mb-3">Select from predefined board configurations</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="board in PREDEFINED_BOARDS"
            :key="board.id"
            @click="toggleBoard(board.id)"
            class="flex flex-col items-center justify-center px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
            :class="[
              settingsStore.boardIds.includes(board.id)
                ? 'border-[#5bbcaa] bg-[#5bbcaa] bg-opacity-20 text-[#5bbcaa] dark:border-[#5bbcaa] dark:bg-[#5bbcaa] dark:bg-opacity-20 dark:text-[#5bbcaa]'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            <span class="font-semibold">{{ board.name }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ board.id }}</span>
          </button>
        </div>
      </div>

      <!-- Manual Add -->
      <div class="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-sm text-light-text-primary dark:text-white">Add Custom Board</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">Enter a custom board ID to track</span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newBoardId"
              type="text"
              placeholder="Enter board ID"
              class="w-48 rounded-md border border-light-border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-light-text-primary dark:text-white text-sm focus:border-[#5bbcaa] focus:ring-[#5bbcaa]"
            />
            <button
              @click="addBoard"
              class="px-4 py-1.5 text-sm font-medium text-white bg-[#5bbcaa] hover:bg-[#4ca899] rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5bbcaa] focus:ring-offset-2"
            >
              Add Board
            </button>
          </div>
        </div>
      </div>

      <!-- Current Boards -->
      <div v-if="settingsStore.boardIds.length > 0" class="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div class="flex items-center justify-between mb-3">
          <div class="flex flex-col">
            <span class="text-sm text-light-text-primary dark:text-white">Current Boards</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">List of boards currently being tracked</span>
          </div>
          <button
            @click="clearAllBoards"
            class="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="boardId in settingsStore.boardIds"
            :key="boardId"
            class="flex items-center justify-between rounded-md border border-light-border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700"
          >
            <div>
              <span class="text-sm text-light-text-primary dark:text-white">
                {{ PREDEFINED_BOARDS.find(b => b.id === boardId)?.name || 'Custom Board' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">{{ boardId }}</span>
            </div>
            <button
              @click="settingsStore.removeBoardId(boardId)"
              class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        No boards added. Add a board ID to start fetching data from it.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'

const PREDEFINED_BOARDS = [
  { id: '2154669988', name: 'Bugs Queue' }
] as const

const settingsStore = useSettingsStore()

const toggleBoard = (boardId: string) => {
  if (settingsStore.boardIds.includes(boardId)) {
    settingsStore.removeBoardId(boardId)
  } else {
    settingsStore.addBoardId(boardId)
  }
}

const newBoardId = ref('')

const addBoard = () => {
  if (newBoardId.value && !settingsStore.boardIds.includes(newBoardId.value)) {
    settingsStore.addBoardId(newBoardId.value)
    newBoardId.value = ''
  }
}

const clearAllBoards = () => {
  if (confirm('Are you sure you want to remove all boards?')) {
    settingsStore.boardIds.forEach(id => settingsStore.removeBoardId(id))
  }
}
</script>