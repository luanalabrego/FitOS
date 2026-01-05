// Tipos para gamificação do FitOS

export interface DailyLog {
  date: string // formato YYYY-MM-DD
  mealsLogged: string[] // IDs das refeições registradas
  caloriesConsumed: number
  caloriesTarget: number
  completed: boolean // se completou a meta do dia
  xpEarned: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLogDate: string | null // formato YYYY-MM-DD
  totalDaysLogged: number
}

export interface UserGamification {
  id: string
  level: number
  totalXP: number
  currentLevelXP: number
  requiredLevelXP: number
  streak: StreakData
  dailyLogs: DailyLog[]
  achievements: string[]
  lastUpdated: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: Date
}

// XP rewards por ação
export const XP_REWARDS = {
  MEAL_LOGGED: 10,
  DAILY_GOAL_COMPLETE: 50,
  STREAK_3_DAYS: 100,
  STREAK_7_DAYS: 250,
  STREAK_14_DAYS: 500,
  STREAK_30_DAYS: 1000,
  FIRST_DIET_CREATED: 200,
  PROFILE_COMPLETE: 150,
} as const

// XP necessário por nível
export function getRequiredXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Calcular nível baseado no XP total
export function calculateLevel(totalXP: number): { level: number; currentXP: number; requiredXP: number } {
  let level = 1
  let xpUsed = 0

  while (true) {
    const required = getRequiredXPForLevel(level)
    if (xpUsed + required > totalXP) {
      return {
        level,
        currentXP: totalXP - xpUsed,
        requiredXP: required
      }
    }
    xpUsed += required
    level++
  }
}
