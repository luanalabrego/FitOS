import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import {
  UserGamification,
  DailyLog,
  StreakData,
  XP_REWARDS,
  calculateLevel,
  getRequiredXPForLevel
} from '@/types/gamification'

const COLLECTION_NAME = 'gamification'

// Obter data de hoje no formato YYYY-MM-DD
function getTodayDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Verificar se duas datas são dias consecutivos
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

// Criar gamificação inicial para novo usuário
export function createInitialGamification(userId: string): UserGamification {
  return {
    id: userId,
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    requiredLevelXP: getRequiredXPForLevel(1),
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      totalDaysLogged: 0
    },
    dailyLogs: [],
    achievements: [],
    lastUpdated: new Date()
  }
}

// Obter dados de gamificação do usuário
export async function getGamification(userId: string): Promise<UserGamification | null> {
  const db = getFirebaseDb()

  if (!db) {
    // Fallback para localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`gamification_${userId}`)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      } as UserGamification
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar gamificação:', error)
    // Fallback para localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`gamification_${userId}`)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }
}

// Salvar dados de gamificação
export async function saveGamification(userId: string, data: UserGamification): Promise<void> {
  // Sempre salva no localStorage como backup
  if (typeof window !== 'undefined') {
    localStorage.setItem(`gamification_${userId}`, JSON.stringify(data))
  }

  const db = getFirebaseDb()
  if (!db) return

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    await setDoc(docRef, {
      ...data,
      lastUpdated: Timestamp.fromDate(new Date())
    }, { merge: true })
  } catch (error) {
    console.error('Erro ao salvar gamificação:', error)
  }
}

// Obter ou criar gamificação
export async function ensureGamification(userId: string): Promise<UserGamification> {
  let gamification = await getGamification(userId)

  if (!gamification) {
    gamification = createInitialGamification(userId)
    await saveGamification(userId, gamification)
  }

  return gamification
}

// Registrar log diário e atualizar streak
export async function logDailyActivity(
  userId: string,
  caloriesConsumed: number,
  caloriesTarget: number,
  mealsLogged: string[]
): Promise<{ gamification: UserGamification; xpGained: number; newAchievements: string[] }> {
  const gamification = await ensureGamification(userId)
  const today = getTodayDate()
  const lastLog = gamification.streak.lastLogDate

  let xpGained = 0
  const newAchievements: string[] = []

  // Verificar se já logou hoje
  const todayLog = gamification.dailyLogs.find(log => log.date === today)

  if (todayLog) {
    // Atualizar log existente
    todayLog.mealsLogged = mealsLogged
    todayLog.caloriesConsumed = caloriesConsumed
    const wasComplete = todayLog.completed
    todayLog.completed = caloriesConsumed >= caloriesTarget * 0.8 && caloriesConsumed <= caloriesTarget * 1.1

    if (!wasComplete && todayLog.completed) {
      xpGained += XP_REWARDS.DAILY_GOAL_COMPLETE
    }
  } else {
    // Novo log
    xpGained += XP_REWARDS.MEAL_LOGGED * mealsLogged.length

    const completed = caloriesConsumed >= caloriesTarget * 0.8 && caloriesConsumed <= caloriesTarget * 1.1
    if (completed) {
      xpGained += XP_REWARDS.DAILY_GOAL_COMPLETE
    }

    const newLog: DailyLog = {
      date: today,
      mealsLogged,
      caloriesConsumed,
      caloriesTarget,
      completed,
      xpEarned: xpGained
    }

    gamification.dailyLogs.push(newLog)
    gamification.streak.totalDaysLogged++

    // Atualizar streak
    if (lastLog) {
      if (areConsecutiveDays(lastLog, today)) {
        gamification.streak.currentStreak++
      } else if (lastLog !== today) {
        // Quebrou o streak
        gamification.streak.currentStreak = 1
      }
    } else {
      gamification.streak.currentStreak = 1
    }

    gamification.streak.lastLogDate = today

    // Atualizar maior streak
    if (gamification.streak.currentStreak > gamification.streak.longestStreak) {
      gamification.streak.longestStreak = gamification.streak.currentStreak
    }

    // Checar conquistas de streak
    const streak = gamification.streak.currentStreak
    if (streak === 3 && !gamification.achievements.includes('streak_3')) {
      xpGained += XP_REWARDS.STREAK_3_DAYS
      gamification.achievements.push('streak_3')
      newAchievements.push('streak_3')
    }
    if (streak === 7 && !gamification.achievements.includes('streak_7')) {
      xpGained += XP_REWARDS.STREAK_7_DAYS
      gamification.achievements.push('streak_7')
      newAchievements.push('streak_7')
    }
    if (streak === 14 && !gamification.achievements.includes('streak_14')) {
      xpGained += XP_REWARDS.STREAK_14_DAYS
      gamification.achievements.push('streak_14')
      newAchievements.push('streak_14')
    }
    if (streak === 30 && !gamification.achievements.includes('streak_30')) {
      xpGained += XP_REWARDS.STREAK_30_DAYS
      gamification.achievements.push('streak_30')
      newAchievements.push('streak_30')
    }
  }

  // Atualizar XP e nível
  gamification.totalXP += xpGained
  const levelData = calculateLevel(gamification.totalXP)
  gamification.level = levelData.level
  gamification.currentLevelXP = levelData.currentXP
  gamification.requiredLevelXP = levelData.requiredXP
  gamification.lastUpdated = new Date()

  // Manter apenas últimos 30 dias de logs
  gamification.dailyLogs = gamification.dailyLogs
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)

  await saveGamification(userId, gamification)

  return { gamification, xpGained, newAchievements }
}

// Adicionar XP por ação específica
export async function addXP(userId: string, amount: number, reason: string): Promise<UserGamification> {
  const gamification = await ensureGamification(userId)

  gamification.totalXP += amount
  const levelData = calculateLevel(gamification.totalXP)
  gamification.level = levelData.level
  gamification.currentLevelXP = levelData.currentXP
  gamification.requiredLevelXP = levelData.requiredXP
  gamification.lastUpdated = new Date()

  await saveGamification(userId, gamification)

  return gamification
}

// Verificar e atualizar streak (deve ser chamado ao abrir o app)
export async function checkAndUpdateStreak(userId: string): Promise<UserGamification> {
  const gamification = await ensureGamification(userId)
  const today = getTodayDate()
  const lastLog = gamification.streak.lastLogDate

  if (lastLog && lastLog !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Se o último log não foi ontem nem hoje, resetar streak
    if (lastLog !== yesterdayStr) {
      gamification.streak.currentStreak = 0
      await saveGamification(userId, gamification)
    }
  }

  return gamification
}

// Obter log de hoje
export async function getTodayLog(userId: string): Promise<DailyLog | null> {
  const gamification = await ensureGamification(userId)
  const today = getTodayDate()

  return gamification.dailyLogs.find(log => log.date === today) || null
}
