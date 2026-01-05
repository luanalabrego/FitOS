'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Utensils,
  Scale,
  ChevronRight,
  Loader2,
  Trophy,
  Target,
  TrendingDown
} from 'lucide-react'
import { Header } from '@/components'
import {
  StreakCounter,
  BMIScale,
  ProgressRing,
  ActionButton
} from '@/components/gamification'
import { getProfile } from '@/services/profileService'
import { getNutritionProfile } from '@/services/nutritionService'
import { ensureGamification, checkAndUpdateStreak } from '@/services/gamificationService'
import { getCurrentUser, onAuthChange } from '@/services/authService'
import { UserProfile } from '@/types/profile'
import { NutritionProfile, DailyConsumption } from '@/types/nutrition'
import { UserGamification } from '@/types/gamification'

// Formato de data para storage
const getDateKey = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

// Obter dia da semana atual em português
const getCurrentDayOfWeek = (): string => {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  return days[new Date().getDay()]
}

export default function Home() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
  const [nutritionProfile, setNutritionProfile] = useState<NutritionProfile | null>(null)
  const [gamification, setGamification] = useState<UserGamification | null>(null)
  const [dailyConsumption, setDailyConsumption] = useState<DailyConsumption | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const todayDateKey = getDateKey(new Date())

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getCurrentUser()
        if (user) {
          // Carregar todos os dados em paralelo
          const [userProfile, nutrition, gamificationData] = await Promise.all([
            getProfile(user.uid),
            getNutritionProfile(user.uid),
            ensureGamification(user.uid).then(g => checkAndUpdateStreak(user.uid))
          ])

          setProfile(userProfile)
          setNutritionProfile(nutrition)
          setGamification(gamificationData)

          // Carregar consumo do dia do localStorage
          const stored = localStorage.getItem(`consumption_${todayDateKey}`)
          if (stored) {
            setDailyConsumption(JSON.parse(stored))
          } else if (nutrition?.nutritionTargets) {
            setDailyConsumption({
              date: todayDateKey,
              userId: user.uid,
              mealLogs: [],
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFat: 0,
              calorieGoal: nutrition.nutritionTargets.calories,
              proteinGoal: nutrition.nutritionTargets.protein,
              carbsGoal: nutrition.nutritionTargets.carbs,
              fatGoal: nutrition.nutritionTargets.fat
            })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const [userProfile, nutrition, gamificationData] = await Promise.all([
          getProfile(user.uid),
          getNutritionProfile(user.uid),
          ensureGamification(user.uid)
        ])
        setProfile(userProfile)
        setNutritionProfile(nutrition)
        setGamification(gamificationData)
      } else {
        setProfile(null)
        setNutritionProfile(null)
        setGamification(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [todayDateKey])

  const isProfileComplete = profile?.onboardingCompleted === true
  const hasDiet = nutritionProfile?.isConfigured === true
  const userName = profile?.name?.split(' ')[0] || 'Usuario'
  const bmi = profile?.bodyComposition?.bmi || 0
  const currentWeight = profile?.bodyComposition?.currentWeight || 0
  const targetWeight = profile?.targetWeight || currentWeight
  const weightToLose = currentWeight - targetWeight

  // Calcular progresso de calorias do dia
  const calorieGoal = dailyConsumption?.calorieGoal || nutritionProfile?.nutritionTargets?.calories || 2000
  const caloriesConsumed = dailyConsumption?.totalCalories || 0
  const calorieProgress = calorieGoal > 0 ? Math.min((caloriesConsumed / calorieGoal) * 100, 100) : 0

  // Contar refeições registradas hoje
  const todayMeals = dailyConsumption?.mealLogs?.length || 0
  const totalMeals = nutritionProfile?.currentDiet?.days?.find(d => d.dayOfWeek === getCurrentDayOfWeek())?.meals?.length || 5

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Carregando...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 pb-8">
      <Header />

      <section className="pt-20 px-4 max-w-lg mx-auto">
        {/* Header Gamificado */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <p className="text-gray-400 text-sm">Ola,</p>
            <h1 className="text-2xl font-bold text-white">{userName}!</h1>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-4">
            <StreakCounter
              days={gamification?.streak?.currentStreak || 0}
              size="sm"
              showLabel={false}
            />
          </div>
        </div>

        {/* Botão Cadastrar Dados - Se não completou onboarding */}
        {!isProfileComplete && (
          <div className="mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <ActionButton
              label="Cadastrar seus dados"
              sublabel="Configure seu perfil para comecar"
              icon={User}
              onClick={() => router.push('/perfil')}
              variant="warning"
              pulse
            />
          </div>
        )}

        {/* Botão Cadastrar Dieta - Se completou perfil mas não tem dieta */}
        {isProfileComplete && !hasDiet && (
          <div className="mb-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <ActionButton
              label="Criar sua dieta"
              sublabel="Gere um plano alimentar personalizado"
              icon={Utensils}
              onClick={() => router.push('/nutricao')}
              variant="primary"
              pulse
            />
          </div>
        )}

        {/* Conteúdo quando tem perfil completo */}
        {isProfileComplete && (
          <>
            {/* Card de Streak expandido */}
            <div
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-5 border border-gray-700/50 mb-4 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <StreakCounter
                    days={gamification?.streak?.currentStreak || 0}
                    size="md"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">Sequencia atual</p>
                    <p className="text-white font-semibold">
                      {gamification?.streak?.currentStreak === 0
                        ? 'Comece hoje!'
                        : gamification?.streak?.currentStreak === 1
                          ? 'Continue assim!'
                          : 'Voce esta on fire!'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Recorde</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-400">
                    {gamification?.streak?.longestStreak || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card de Progresso do Dia */}
            {hasDiet && (
              <div
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-5 border border-gray-700/50 mb-4 animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary-400" />
                  <h3 className="font-semibold text-white">Progresso de Hoje</h3>
                </div>

                <div className="flex items-center gap-6">
                  {/* Círculo de progresso */}
                  <ProgressRing
                    progress={calorieProgress}
                    size={100}
                    strokeWidth={10}
                    color={calorieProgress > 100 ? '#ef4444' : '#22c55e'}
                  >
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white">
                        {Math.round(calorieProgress)}%
                      </span>
                    </div>
                  </ProgressRing>

                  {/* Info de calorias */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Calorias</span>
                        <span className="text-white font-medium">
                          {caloriesConsumed} / {calorieGoal}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            calorieProgress > 100 ? 'bg-red-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Refeicoes</span>
                      <span className="text-white font-medium">
                        {todayMeals} / {totalMeals}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão para registrar refeição */}
                <button
                  onClick={() => router.push('/nutricao')}
                  className="w-full mt-4 py-3 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-xl text-primary-400 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Utensils className="w-5 h-5" />
                  Registrar refeicao
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Card de Escala de Obesidade / BMI */}
            {bmi > 0 && (
              <div
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-5 border border-gray-700/50 mb-4 animate-slide-up"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Seu IMC</h3>
                </div>

                <BMIScale bmi={bmi} />

                {/* Info de peso */}
                {weightToLose > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-primary-400" />
                        <span className="text-gray-400 text-sm">Meta</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-semibold">{targetWeight} kg</span>
                        <p className="text-xs text-primary-400">
                          -{weightToLose.toFixed(1)} kg para a meta
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card Motivacional */}
            <div
              className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-3xl p-5 border border-primary-500/30 animate-slide-up"
              style={{ animationDelay: '500ms' }}
            >
              <div className="text-center">
                <p className="text-lg text-white font-medium mb-2">
                  {gamification?.streak?.currentStreak === 0
                    ? 'Cada jornada comeca com um passo!'
                    : gamification?.streak?.currentStreak && gamification.streak.currentStreak >= 7
                      ? 'Voce e imparavel! Continue assim!'
                      : 'Voce esta no caminho certo!'}
                </p>
                <p className="text-sm text-gray-400">
                  {hasDiet
                    ? 'Registre suas refeicoes para manter o streak'
                    : 'Crie sua dieta para comecar a acompanhar'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Quando não tem perfil - Tela inicial */}
        {!isProfileComplete && (
          <div className="text-center py-8 animate-fade-in">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                <Scale className="w-12 h-12 text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Comece sua jornada
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Configure seus dados para receber um plano alimentar personalizado e acompanhar seu progresso.
              </p>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <StreakCounter days={7} size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-gray-400">Streak diario</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-400" />
                </div>
                <p className="text-xs text-gray-400">Metas claras</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-gray-400">IMC visual</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
