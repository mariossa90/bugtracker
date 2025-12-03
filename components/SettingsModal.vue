<template>
  <div v-if="isOpen" class="no-select fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 transition-opacity duration-300"
      @click="close"
    >
      <div class="backdrop"></div>
      <div class="backdrop-edge"></div>
    </div>

    <!-- Modal -->
    <div class="fixed inset-0 p-4 pointer-events-none">
      <div 
        ref="modalRef"
        :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
        class="absolute bg-light-surface dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full pointer-events-auto"
        style="top: 0; left: 0;"
      >
        <!-- Header - Make it draggable -->
        <div 
          @mousedown="startDrag"
          class="flex items-center justify-between p-4 border-b border-light-border dark:border-gray-600 drag-handle"
        >
          <h3 class="text-lg font-semibold text-light-text-primary dark:text-white">
            Settings
          </h3>
          <button
            @click="close"
            class="text-light-text-muted hover:text-light-text-primary dark:text-gray-400 dark:hover:text-gray-300"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex h-[600px]">
          <!-- Sidebar Menu -->
          <div class="w-48 border-r border-light-border dark:border-gray-600">
            <div class="p-4 space-y-1">
              <button
                @click="settingsStore.selectedMenu = 'general'"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedMenu === 'general'
                    ? 'bg-[#5bbcaa] bg-opacity-10 text-[#5bbcaa]'
                    : 'text-light-text-secondary dark:text-gray-300 hover:bg-light-secondary dark:hover:bg-gray-700/50'
                ]"
              >
                General
              </button>
              <button
                @click="settingsStore.selectedMenu = 'boards'"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedMenu === 'boards'
                    ? 'bg-[#5bbcaa] bg-opacity-10 text-[#5bbcaa]'
                    : 'text-light-text-secondary dark:text-gray-300 hover:bg-light-secondary dark:hover:bg-gray-700/50'
                ]"
              >
                Boards
              </button>
              
            </div>
          </div>

          <!-- Settings Content -->
          <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div v-if="selectedMenu === 'general'" >
              <GeneralSettings />
            </div>
            <div v-else-if="selectedMenu === 'boards'">
              <BoardSettings />
            </div>
          </div>
        </div>    
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import GeneralSettings from './settings/GeneralSettings.vue'
import BoardSettings from './settings/BoardSettings.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const settingsStore = useSettingsStore()
const selectedMenu = computed(() => settingsStore.selectedMenu)

const close = () => {
  // Reset selected menu to default
  settingsStore.selectedMenu = 'general'
  // Emit close event to parent
  emit('close')
}

const modalRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

const initializePosition = () => {
  if (!modalRef.value) return
  
  const modalWidth = modalRef.value.offsetWidth
  const modalHeight = modalRef.value.offsetHeight
  
  // Calculate center position relative to viewport
  position.value = {
    x: (window.innerWidth - modalWidth) / 2,
    y: (window.innerHeight - modalHeight) / 2
  }
}

const startDrag = (event: MouseEvent) => {
  if (!modalRef.value) return
  
  isDragging.value = true
  
  // Get current transform values
  const currentTransform = window.getComputedStyle(modalRef.value).transform
  const matrix = new DOMMatrix(currentTransform)
  const currentX = matrix.m41
  const currentY = matrix.m42
  
  // Set initial position to current transform
  position.value = {
    x: currentX,
    y: currentY
  }
  
  // Calculate offset from current mouse position
  dragOffset.value = {
    x: event.clientX - currentX,
    y: event.clientY - currentY
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value || !modalRef.value) return
  
  // Calculate new position
  position.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Watch for modal opening
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    position.value = { x: 0, y: 0 } // Reset position first
    nextTick(() => {
      initializePosition()
    })
  }
})

// Clean up event listeners
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.backdrop {
  position: absolute;
  inset: 0;
  height: 200%;
  background:hsl(0deg 0% 100% / 0.1);
  pointer-events: none;
  backdrop-filter: blur(16px);
  transition: all 0.3s ease;
  mask-image: linear-gradient(
    to bottom,
    black 0,
    black 50%,
    transparent 50%
  );
}

.backdrop-transparent .backdrop {
  background: transparent;
  backdrop-filter: none;
}

.backdrop-transparent .backdrop-edge {
  background: transparent;
  backdrop-filter: none;
}

.backdrop-edge {
  --thickness: 6px;
  position: absolute;
  inset: 0;
  height: 100%;
  transform: translateY(100%);
  background: rgb(0 0 0 / 0.15);
  backdrop-filter: blur(8px) brightness(120%);
  pointer-events: none;
  transition: all 0.3s ease;
  mask-image: linear-gradient(
    to bottom,
    black 0,
    black var(--thickness),
    transparent var(--thickness)
  );
}

/* Dark mode adjustments */
:global(.dark) .backdrop {
  background: rgb(255 255 255 / 0.05);
}

:global(.dark) .backdrop-edge {
  background: rgb(255 255 255 / 0.03);
}

/* Add this to prevent text selection while dragging */
.drag-handle {
  cursor: pointer;
  user-select: none;
}
</style>