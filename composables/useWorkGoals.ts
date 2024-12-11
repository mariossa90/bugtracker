import { computed } from 'vue'
import { useWorkGoalsStore } from '~/stores/workGoals'

export type GoalStatus = 'GOAL_MET' | 'GOAL_PARTIAL' | 'GOAL_MISSED' | 'GOAL_NOT_SET' | 'WEEKEND_NO_TIME'

export const useWorkGoals = () => {
  const workGoalsStore = useWorkGoalsStore()

  const durationToHours = (duration: string | null | undefined): number => {
    if (!duration || duration === '-') return 0
    const matches = duration.match(/(\d+)h\s*(\d+)?m?/)
    if (!matches) return 0
    const hours = parseInt(matches[1]) || 0
    const minutes = parseInt(matches[2]) || 0
    return hours + (minutes / 60)
  }

  const calculateGoalStatus = (duration: string, userId: string, date: string): GoalStatus => {
    // Check if it's weekend
    const dayOfWeek = new Date(date).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // 0 is Sunday, 6 is Saturday

    // For weekends, if there's no time logged (duration is '-' or '0h 0m'), return WEEKEND_NO_TIME
    if (isWeekend && (!duration || duration === '-' || duration === '0h 0m')) {
      return 'WEEKEND_NO_TIME'
    }

    const hours = durationToHours(duration)
    const goalHours = workGoalsStore.getEffectiveUserGoal(userId, date)
    
    if (goalHours === null) return 'GOAL_NOT_SET'
    if (hours >= goalHours) return 'GOAL_MET'
    if (hours >= goalHours * 0.7) return 'GOAL_PARTIAL'
    return 'GOAL_MISSED'
  }

  const getGoalStatusClass = (status: GoalStatus): string => {
    const classes = {
      'GOAL_MET': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      'GOAL_PARTIAL': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      'GOAL_MISSED': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
      'GOAL_NOT_SET': '',
      'WEEKEND_NO_TIME': 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
    }
    return classes[status]
  }

  const formatGoalProgress = (duration: string, userId: string, date: string): string => {
    const hours = durationToHours(duration)
    const goalHours = workGoalsStore.getEffectiveUserGoal(userId, date)
    if (goalHours === null) return ''
    
    const percentage = Math.round((hours / goalHours) * 100)
    return `${percentage}%`
  }

  return {
    calculateGoalStatus,
    getGoalStatusClass,
    formatGoalProgress
  }
}
