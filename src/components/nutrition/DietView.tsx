'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DAYS_OF_WEEK, DayOfWeek, Meal } from '@/types/nutrition'
import {
  RefreshCw,
  Settings,
  Trophy,
  Flame,
  Droplet,
  Calendar,
  ChevronRight,
  TrendingDown,
  Loader2,
  Utensils,
  Clock,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

export function DietView() {
  const { state, dispatch, goToStep, regenerateDiet } = useNutrition()
  const { nutritionProfile, selectedDay, isGeneratingDiet } = state
  const { currentDiet, nutritionTargets, weightProjection, dietGoal } = nutritionProfile

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [showAllMilestones, setShowAllMilestones] = useState(false)

  if (!currentDiet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando sua dieta...</p>
        </div>
      </div>
    )
  }

  const selectedDayData = currentDiet.days.find(d => d.dayOfWeek === selectedDay) || currentDiet.days[0]
  const isLosing = (dietGoal?.currentWeight || 0) > (dietGoal?.targetWeight || 0)

  const getMacroPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const toggleMeal = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header com stats */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Sua Dieta
              </h1>
              <p className="text-primary-100">Semana {currentDiet.weekNumber}/{currentDiet.year}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToStep('objetivo')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={regenerateDiet}
                disabled={isGeneratingDiet}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {isGeneratingDiet ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Stats do dia */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-orange-300 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{nutritionTargets?.calories}</p>
              <p className="text-xs text-primary-100">kcal</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <span className="text-lg">🥩</span>
              <p className="text-xl font-bold text-white">{nutritionTargets?.protein}g</p>
              <p className="text-xs text-primary-100">proteína</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <span className="text-lg">🍚</span>
              <p className="text-xl font-bold text-white">{nutritionTargets?.carbs}g</p>
              <p className="text-xs text-primary-100">carbs</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <Droplet className="w-5 h-5 text-cyan-300 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{nutritionTargets?.water}L</p>
              <p className="text-xs text-primary-100">água</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 -mt-14">
        {/* Seletor de dias */}
        <div className="bg-gray-800 rounded-2xl p-2 shadow-xl mb-6">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {DAYS_OF_WEEK.map((day) => {
              const dayData = currentDiet.days.find(d => d.dayOfWeek === day.key)
              const isSelected = selectedDay === day.key
              const isToday = new Date().getDay() === (DAYS_OF_WEEK.findIndex(d => d.key === day.key) + 1) % 7

              return (
                <button
                  key={day.key}
                  onClick={() => dispatch({ type: 'SET_SELECTED_DAY', payload: day.key })}
                  className={`
                    flex-1 min-w-[60px] py-3 px-2 rounded-xl transition-all
                    ${isSelected
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'hover:bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  <p className={`text-xs ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                    {day.short}
                  </p>
                  <p className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {DAYS_OF_WEEK.findIndex(d => d.key === day.key) + 1}
                  </p>
                  {isToday && (
                    <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Card de progresso do dia */}
        <Card className="mb-6 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">
                {selectedDayData.dayName}
              </h3>
              <span className="text-sm text-gray-400">
                {selectedDayData.totalCalories} / {nutritionTargets?.calories} kcal
              </span>
            </div>

            {/* Barra de calorias */}
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{
                  width: `${getMacroPercentage(selectedDayData.totalCalories, nutritionTargets?.calories || 2000)}%`
                }}
              />
            </div>

            {/* Macros do dia */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-blue-400">Proteína</span>
                  <span className="text-gray-300">{selectedDayData.totalProtein}g</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${getMacroPercentage(selectedDayData.totalProtein, nutritionTargets?.protein || 150)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-yellow-400">Carbos</span>
                  <span className="text-gray-300">{selectedDayData.totalCarbs}g</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${getMacroPercentage(selectedDayData.totalCarbs, nutritionTargets?.carbs || 200)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-purple-400">Gorduras</span>
                  <span className="text-gray-300">{selectedDayData.totalFat}g</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${getMacroPercentage(selectedDayData.totalFat, nutritionTargets?.fat || 70)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de refeições */}
        <div className="space-y-4 mb-6">
          {selectedDayData.meals.map((meal, index) => (
            <MealCard
              key={meal.id}
              meal={meal}
              index={index}
              isExpanded={expandedMeal === meal.id}
              onToggle={() => toggleMeal(meal.id)}
            />
          ))}
        </div>

        {/* Dicas do dia */}
        {selectedDayData.tips && selectedDayData.tips.length > 0 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <h4 className="font-medium text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Dicas do Dia
              </h4>
              <div className="space-y-2">
                {selectedDayData.tips.map((tip, index) => (
                  <p key={index} className="text-sm text-gray-400 pl-4 border-l-2 border-primary-500">
                    {tip}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de projeção */}
        {weightProjection && (
          <Card className="mb-6 border-primary-500/30">
            <CardHeader
              title="Sua Jornada"
              icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            />
            <CardContent>
              {/* Resumo */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl text-center">
                  <TrendingDown className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {Math.abs(weightProjection.weeklyChange).toFixed(2)} kg
                  </p>
                  <p className="text-sm text-gray-400">por semana</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl text-center">
                  <Calendar className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {Math.ceil(weightProjection.weeksToGoal)}
                  </p>
                  <p className="text-sm text-gray-400">semanas restantes</p>
                </div>
              </div>

              {/* Barra de progresso da jornada */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">{dietGoal?.currentWeight}kg</span>
                  <span className="text-primary-400 font-bold">{dietGoal?.targetWeight}kg</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    style={{ width: '5%' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Início da jornada!</span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  className="w-full flex items-center justify-between text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span className="text-sm font-medium">Marcos da Jornada</span>
                  {showAllMilestones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAllMilestones && (
                  <div className="space-y-2 pt-2">
                    {weightProjection.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${milestone.percentageComplete >= 100
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                          }
                        `}>
                          {milestone.percentageComplete >= 100 ? '🏆' : `${milestone.percentageComplete}%`}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            Semana {milestone.week}: <strong>{milestone.expectedWeight.toFixed(1)}kg</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            {milestone.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        {milestone.celebration && (
                          <span className="text-sm">{milestone.celebration.split(' ')[0]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data estimada */}
              <div className="mt-4 p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl text-center">
                <Target className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="text-gray-400">Meta prevista para</p>
                <p className="text-xl font-bold text-white">
                  {weightProjection.estimatedDate.toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de ajustar */}
        <Button
          onClick={() => goToStep('objetivo')}
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Settings className="w-5 h-5" />}
          className="mb-8"
        >
          Ajustar Preferências
        </Button>
      </div>
    </div>
  )
}

// Componente de Card de Refeição
interface MealCardProps {
  meal: Meal
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function MealCard({ meal, index, isExpanded, onToggle }: MealCardProps) {
  const mealEmojis = ['☕', '🍎', '🍽️', '🥪', '🌙', '🌜']
  const mealColors = [
    'from-orange-500/20 to-yellow-500/20',
    'from-green-500/20 to-emerald-500/20',
    'from-blue-500/20 to-cyan-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-indigo-500/20 to-purple-500/20',
    'from-gray-500/20 to-slate-500/20'
  ]

  return (
    <div
      className={`
        bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50
        transition-all duration-300
        ${isExpanded ? 'ring-2 ring-primary-500/50' : ''}
      `}
    >
      {/* Header clicável */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4"
      >
        <div className={`
          w-14 h-14 rounded-xl bg-gradient-to-br ${mealColors[index % mealColors.length]}
          flex items-center justify-center text-2xl
        `}>
          {mealEmojis[index % mealEmojis.length]}
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-white">{meal.name}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{meal.time}</span>
            <span className="text-gray-600">•</span>
            <span>{meal.foods.length} itens</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{meal.totalCalories}</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
        <ChevronRight className={`
          w-5 h-5 text-gray-400 transition-transform
          ${isExpanded ? 'rotate-90' : ''}
        `} />
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          {/* Macros da refeição */}
          <div className="flex gap-4 py-3 text-center text-sm">
            <div className="flex-1 p-2 bg-blue-500/10 rounded-lg">
              <p className="text-blue-400">P</p>
              <p className="font-bold text-white">{meal.totalProtein}g</p>
            </div>
            <div className="flex-1 p-2 bg-yellow-500/10 rounded-lg">
              <p className="text-yellow-400">C</p>
              <p className="font-bold text-white">{meal.totalCarbs}g</p>
            </div>
            <div className="flex-1 p-2 bg-purple-500/10 rounded-lg">
              <p className="text-purple-400">G</p>
              <p className="font-bold text-white">{meal.totalFat}g</p>
            </div>
          </div>

          {/* Lista de alimentos */}
          <div className="space-y-2">
            {meal.foods.map((food, foodIndex) => (
              <div
                key={foodIndex}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{food.name}</p>
                  <p className="text-sm text-gray-400">{food.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-400">{food.calories} kcal</p>
                  <p className="text-xs text-gray-500">
                    P:{food.protein} C:{food.carbs} G:{food.fat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
