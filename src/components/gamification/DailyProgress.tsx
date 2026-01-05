'use client'

import { Apple, Check, Circle } from 'lucide-react'
import { ProgressRing } from './ProgressRing'

interface Meal {
  name: string
  completed: boolean
  calories?: number
}

interface DailyProgressProps {
  meals: Meal[]
  targetCalories: number
  consumedCalories: number
  compact?: boolean
}

export function DailyProgress({
  meals,
  targetCalories,
  consumedCalories,
  compact = false
}: DailyProgressProps) {
  const completedMeals = meals.filter(m => m.completed).length
  const totalMeals = meals.length
  const progress = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0
  const calorieProgress = targetCalories > 0 ? (consumedCalories / targetCalories) * 100 : 0

  // Determina a cor baseado no progresso de calorias
  const getCalorieColor = () => {
    if (calorieProgress > 110) return '#ef4444' // Vermelho - passou muito
    if (calorieProgress > 100) return '#f97316' // Laranja - passou um pouco
    if (calorieProgress >= 90) return '#22c55e' // Verde - perfeito
    if (calorieProgress >= 70) return '#fbbf24' // Amarelo - pode comer mais
    return '#60a5fa' // Azul - falta bastante
  }

  if (compact) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* Progress ring */}
          <ProgressRing
            progress={progress}
            size={60}
            strokeWidth={6}
            color="#22c55e"
          >
            <div className="text-center">
              <span className="text-lg font-bold text-white">{completedMeals}</span>
              <span className="text-xs text-gray-400">/{totalMeals}</span>
            </div>
          </ProgressRing>

          {/* Meal dots */}
          <div className="flex gap-2">
            {meals.map((meal, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  meal.completed
                    ? 'bg-primary-500 text-white scale-100'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {meal.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calorie bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Calorias</span>
            <span style={{ color: getCalorieColor() }}>
              {consumedCalories} / {targetCalories} kcal
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, calorieProgress)}%`,
                backgroundColor: getCalorieColor()
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-6 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Apple className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Hoje</h3>
          <p className="text-xs text-gray-400">
            {completedMeals} de {totalMeals} refeicoes
          </p>
        </div>
      </div>

      {/* Central progress ring */}
      <div className="flex justify-center mb-6">
        <ProgressRing
          progress={progress}
          size={140}
          strokeWidth={12}
          color="#22c55e"
        >
          <div className="text-center">
            <span className="text-4xl font-bold text-white">{completedMeals}</span>
            <span className="text-lg text-gray-400">/{totalMeals}</span>
            <p className="text-xs text-gray-500 mt-1">refeicoes</p>
          </div>
        </ProgressRing>
      </div>

      {/* Meal list */}
      <div className="space-y-2 mb-6">
        {meals.map((meal, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
              meal.completed
                ? 'bg-primary-500/10 border border-primary-500/30'
                : 'bg-gray-800/50 border border-gray-700/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  meal.completed
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {meal.completed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span className={meal.completed ? 'text-white' : 'text-gray-400'}>
                {meal.name}
              </span>
            </div>
            {meal.calories && meal.completed && (
              <span className="text-sm text-primary-400">{meal.calories} kcal</span>
            )}
          </div>
        ))}
      </div>

      {/* Calorie progress */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Calorias consumidas</span>
          <span className="text-sm font-semibold" style={{ color: getCalorieColor() }}>
            {Math.round(calorieProgress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, calorieProgress)}%`,
              backgroundColor: getCalorieColor(),
              boxShadow: `0 0 10px ${getCalorieColor()}50`
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">{consumedCalories} kcal</span>
          <span className="text-xs text-gray-500">Meta: {targetCalories} kcal</span>
        </div>
      </div>
    </div>
  )
}
