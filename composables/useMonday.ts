import { useMondayStore } from '~/stores/monday'

export const useMonday = () => {
  const store = useMondayStore()
  
  const user = computed(() => store.getUser)
  const boards = computed(() => store.getBoards)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.getError)

  const fetchBoardData = async () => {
    await store.fetchBoardData()
  }

  return {
    user,
    boards,
    isLoading,
    error,
    fetchBoardData
  }
}