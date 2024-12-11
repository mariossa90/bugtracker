import { ref } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err)
    }
  }

  // Update fullscreen state when it changes externally (e.g., Esc key)
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = !!document.fullscreenElement
    })
  }

  return {
    isFullscreen,
    toggleFullscreen
  }
}
