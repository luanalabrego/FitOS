'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DAYS_OF_WEEK, DayOfWeek, Meal, MealLog, ConsumedFood, DailyConsumption, FoodItem } from '@/types/nutrition'
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
  Sparkles,
  ArrowRightLeft,
  X,
  Check,
  Plus,
  ClipboardList,
  PieChart,
  BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { EvolutionView } from './EvolutionView'

// Opções de substituição por categoria
const FOOD_SUBSTITUTIONS: Record<string, string[]> = {
  // Proteínas
  'frango': ['peito de peru', 'peixe', 'carne moída magra', 'ovo', 'tofu'],
  'carne': ['frango', 'peixe', 'ovo', 'carne de porco magra'],
  'peixe': ['frango', 'atum em lata', 'sardinha', 'ovo'],
  'ovo': ['clara de ovo', 'tofu', 'queijo cottage'],
  'bacon': ['peito de peru defumado', 'presunto magro'],
  // Carboidratos
  'arroz': ['arroz integral', 'quinoa', 'batata', 'macarrão integral'],
  'pão': ['tapioca', 'cuscuz', 'batata doce', 'wrap integral'],
  'batata': ['batata doce', 'mandioca', 'inhame', 'arroz'],
  'macarrão': ['macarrão integral', 'abobrinha espaguete', 'arroz'],
  // Vegetais
  'brócolis': ['couve-flor', 'couve', 'espinafre', 'vagem'],
  'alface': ['rúcula', 'agrião', 'acelga', 'repolho'],
  'tomate': ['pimentão', 'cenoura ralada', 'beterraba'],
  // Frutas
  'banana': ['maçã', 'mamão', 'manga', 'pera'],
  'maçã': ['pera', 'banana', 'morango', 'kiwi'],
  // Laticínios
  'leite': ['leite desnatado', 'leite de amêndoas', 'leite de aveia'],
  'queijo': ['queijo cottage', 'ricota', 'queijo minas light'],
  'iogurte': ['iogurte grego', 'coalhada', 'kefir']
}

// Formato de data para storage
const getDateKey = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

export function DietView() {
  const { state, dispatch, startEditing, regenerateDiet } = useNutrition()
  const { nutritionProfile, selectedDay, isGeneratingDiet } = state
  const { currentDiet, nutritionTargets, weightProjection, dietGoal } = nutritionProfile

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [showAllMilestones, setShowAllMilestones] = useState(false)

  // Estado para registro de refeições
  const [showMealLogModal, setShowMealLogModal] = useState(false)
  const [selectedMealForLog, setSelectedMealForLog] = useState<Meal | null>(null)
  const [dailyConsumption, setDailyConsumption] = useState<DailyConsumption | null>(null)
  const [customFoodName, setCustomFoodName] = useState('')
  const [customFoodGrams, setCustomFoodGrams] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedFoods, setSelectedFoods] = useState<ConsumedFood[]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [evolutionRefreshTrigger, setEvolutionRefreshTrigger] = useState(0)

  // Estado para troca de alimento via IA
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapFoodIndex, setSwapFoodIndex] = useState<number | null>(null)
  const [swapMealIndex, setSwapMealIndex] = useState<number | null>(null)
  const [swapRequest, setSwapRequest] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapSuggestion, setSwapSuggestion] = useState<FoodItem | null>(null)

  // Carregar consumo do dia do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`consumption_${getDateKey()}`)
    if (stored) {
      setDailyConsumption(JSON.parse(stored))
    } else if (nutritionTargets) {
      // Inicializar consumo do dia
      setDailyConsumption({
        date: getDateKey(),
        userId: currentDiet?.userId || '',
        mealLogs: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        calorieGoal: nutritionTargets.calories,
        proteinGoal: nutritionTargets.protein,
        carbsGoal: nutritionTargets.carbs,
        fatGoal: nutritionTargets.fat
      })
    }
  }, [nutritionTargets, currentDiet?.userId])

  // Salvar consumo no localStorage
  const saveConsumption = (consumption: DailyConsumption) => {
    localStorage.setItem(`consumption_${getDateKey()}`, JSON.stringify(consumption))
    setDailyConsumption(consumption)
  }

  // Abrir modal de registro de refeição
  const openMealLogModal = (meal: Meal) => {
    setSelectedMealForLog(meal)
    setSelectedFoods([])
    setShowCustomInput(false)
    setCustomFoodName('')
    setCustomFoodGrams('')
    setShowMealLogModal(true)
  }

  // Adicionar alimento da dieta à seleção
  const toggleFoodSelection = (food: FoodItem, alternative?: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }) => {
    const foodData = alternative || food
    const existingIndex = selectedFoods.findIndex(f => f.name === foodData.name)

    if (existingIndex >= 0) {
      setSelectedFoods(selectedFoods.filter((_, i) => i !== existingIndex))
    } else {
      // Extrair gramas da quantidade (aproximado)
      const gramsMatch = foodData.quantity.match(/(\d+)\s*g/i)
      const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100

      setSelectedFoods([...selectedFoods, {
        name: foodData.name,
        quantity: foodData.quantity,
        grams,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        isCustom: false
      }])
    }
  }

  // Calcular calorias de alimento customizado via IA
  const calculateCustomFood = async () => {
    if (!customFoodName || !customFoodGrams) return

    setIsCalculating(true)
    try {
      const response = await fetch('/api/nutrition/calculate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customFoodName,
          grams: parseInt(customFoodGrams)
        })
      })

      const data = await response.json()
      if (data.nutrition) {
        setSelectedFoods([...selectedFoods, {
          name: data.nutrition.name,
          quantity: `${data.nutrition.grams}g`,
          grams: data.nutrition.grams,
          calories: data.nutrition.calories,
          protein: data.nutrition.protein,
          carbs: data.nutrition.carbs,
          fat: data.nutrition.fat,
          isCustom: true
        }])
        setCustomFoodName('')
        setCustomFoodGrams('')
        setShowCustomInput(false)
      }
    } catch (error) {
      console.error('Erro ao calcular calorias:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Registrar refeição
  const registerMeal = () => {
    if (!selectedMealForLog || selectedFoods.length === 0 || !dailyConsumption) return

    const mealLog: MealLog = {
      id: `log_${Date.now()}`,
      date: new Date(),
      mealName: selectedMealForLog.name,
      foods: selectedFoods,
      totalCalories: selectedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalProtein: selectedFoods.reduce((sum, f) => sum + f.protein, 0),
      totalCarbs: selectedFoods.reduce((sum, f) => sum + f.carbs, 0),
      totalFat: selectedFoods.reduce((sum, f) => sum + f.fat, 0),
      createdAt: new Date()
    }

    const updatedConsumption: DailyConsumption = {
      ...dailyConsumption,
      mealLogs: [...dailyConsumption.mealLogs, mealLog],
      totalCalories: dailyConsumption.totalCalories + mealLog.totalCalories,
      totalProtein: dailyConsumption.totalProtein + mealLog.totalProtein,
      totalCarbs: dailyConsumption.totalCarbs + mealLog.totalCarbs,
      totalFat: dailyConsumption.totalFat + mealLog.totalFat
    }

    saveConsumption(updatedConsumption)
    setShowMealLogModal(false)
    setSelectedMealForLog(null)
    setSelectedFoods([])
    // Atualizar gráfico de evolução
    setEvolutionRefreshTrigger(prev => prev + 1)
  }

  // Verificar se uma refeição já foi registrada hoje
  const isMealLogged = (mealName: string) => {
    return dailyConsumption?.mealLogs.some(log => log.mealName === mealName) || false
  }

  // Calcular porcentagem consumida
  const getConsumptionPercentage = (consumed: number, goal: number) => {
    return Math.min((consumed / goal) * 100, 100)
  }

  // Abrir modal de troca de alimento
  const openSwapModal = (mealIndex: number, foodIndex: number) => {
    setSwapMealIndex(mealIndex)
    setSwapFoodIndex(foodIndex)
    setSwapRequest('')
    setSwapSuggestion(null)
    setShowSwapModal(true)
  }

  // Solicitar sugestão de troca via IA
  const requestSwapSuggestion = async () => {
    if (swapMealIndex === null || swapFoodIndex === null || !swapRequest.trim()) return

    const meal = selectedDayData?.meals[swapMealIndex]
    const food = meal?.foods[swapFoodIndex]
    if (!meal || !food) return

    setIsSwapping(true)
    try {
      const response = await fetch('/api/nutrition/swap-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentFood: {
            name: food.name,
            quantity: food.quantity,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          },
          userRequest: swapRequest,
          mealName: meal.name,
          dietStyle: nutritionProfile.foodPreferences?.dietStyle || 'tradicional',
          goalType: dietGoal?.type || 'manutencao',
          targetCalories: food.calories
        })
      })

      const data = await response.json()
      if (data.suggestion) {
        setSwapSuggestion(data.suggestion)
      }
    } catch (error) {
      console.error('Erro ao buscar sugestão:', error)
    } finally {
      setIsSwapping(false)
    }
  }

  // Aplicar troca de alimento (apenas visual, não persiste)
  const applySwap = () => {
    // Por enquanto apenas fecha o modal
    // Em uma implementação completa, salvaria a alteração no banco
    setShowSwapModal(false)
    setSwapSuggestion(null)
    setSwapRequest('')
  }

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
                onClick={startEditing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Editar preferências"
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

          {/* Barra de progresso do dia */}
          {dailyConsumption && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Consumo de Hoje
                </span>
                <span className="text-primary-100 text-sm">
                  {dailyConsumption.totalCalories} / {dailyConsumption.calorieGoal} kcal
                </span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    getConsumptionPercentage(dailyConsumption.totalCalories, dailyConsumption.calorieGoal) > 100
                      ? 'bg-red-500'
                      : getConsumptionPercentage(dailyConsumption.totalCalories, dailyConsumption.calorieGoal) > 80
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${Math.min(getConsumptionPercentage(dailyConsumption.totalCalories, dailyConsumption.calorieGoal), 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-primary-100">
                <span>P: {dailyConsumption.totalProtein}g / {dailyConsumption.proteinGoal}g</span>
                <span>C: {dailyConsumption.totalCarbs}g / {dailyConsumption.carbsGoal}g</span>
                <span>G: {dailyConsumption.totalFat}g / {dailyConsumption.fatGoal}g</span>
              </div>
            </div>
          )}

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
              onRegisterMeal={() => openMealLogModal(meal)}
              onSwapFood={openSwapModal}
              isLogged={isMealLogged(meal.name)}
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

        {/* Módulo de Evolução */}
        {nutritionTargets && (
          <div className="mb-6">
            <EvolutionView
              calorieGoal={nutritionTargets.calories}
              proteinGoal={nutritionTargets.protein}
              carbsGoal={nutritionTargets.carbs}
              fatGoal={nutritionTargets.fat}
              refreshTrigger={evolutionRefreshTrigger}
            />
          </div>
        )}

        {/* Botão de ajustar */}
        <Button
          onClick={startEditing}
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Settings className="w-5 h-5" />}
          className="mb-8"
        >
          Ajustar Preferências
        </Button>
      </div>

      {/* Modal de registro de refeição */}
      {showMealLogModal && selectedMealForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Header do modal */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Registrar Refeição
                </h3>
                <p className="text-sm text-primary-100">{selectedMealForLog.name}</p>
              </div>
              <button
                onClick={() => setShowMealLogModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-gray-400 text-sm mb-4">
                Selecione o que você consumiu nesta refeição:
              </p>

              {/* Lista de alimentos da dieta */}
              <div className="space-y-3 mb-4">
                {selectedMealForLog.foods.map((food, index) => (
                  <div key={index} className="space-y-2">
                    {/* Alimento principal */}
                    <button
                      onClick={() => toggleFoodSelection(food)}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                        selectedFoods.some(f => f.name === food.name)
                          ? 'bg-primary-500/20 border-primary-500 text-white'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-400">{food.quantity} - {food.calories} kcal</p>
                      </div>
                      {selectedFoods.some(f => f.name === food.name) ? (
                        <Check className="w-5 h-5 text-primary-400" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {/* Alternativas */}
                    {food.alternatives && food.alternatives.length > 0 && (
                      <div className="pl-4 space-y-2">
                        <p className="text-xs text-gray-500">ou escolha uma alternativa:</p>
                        {food.alternatives.map((alt, altIndex) => (
                          <button
                            key={altIndex}
                            onClick={() => toggleFoodSelection(food, alt)}
                            className={`w-full p-2 rounded-lg border transition-all flex items-center justify-between text-sm ${
                              selectedFoods.some(f => f.name === alt.name)
                                ? 'bg-accent-500/20 border-accent-500 text-white'
                                : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <div className="text-left">
                              <p>{alt.name}</p>
                              <p className="text-xs text-gray-500">{alt.quantity} - {alt.calories} kcal</p>
                            </div>
                            {selectedFoods.some(f => f.name === alt.name) ? (
                              <Check className="w-4 h-4 text-accent-400" />
                            ) : (
                              <Plus className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar alimento customizado */}
              <div className="border-t border-gray-700 pt-4">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full p-3 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar outro alimento
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">Digite o alimento e a quantidade:</p>
                    <input
                      type="text"
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      placeholder="Ex: Arroz integral"
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customFoodGrams}
                        onChange={(e) => setCustomFoodGrams(e.target.value)}
                        placeholder="Gramas"
                        className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                      />
                      <button
                        onClick={calculateCustomFood}
                        disabled={isCalculating || !customFoodName || !customFoodGrams}
                        className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                      >
                        {isCalculating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Adicionar
                          </>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="text-sm text-gray-500 hover:text-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Lista de alimentos selecionados */}
              {selectedFoods.length > 0 && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Selecionados:</p>
                  <div className="space-y-2">
                    {selectedFoods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-white">
                          {food.name} {food.isCustom && <span className="text-xs text-accent-400">(outro)</span>}
                        </span>
                        <span className="text-primary-400">{food.calories} kcal</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-600 pt-2 flex items-center justify-between font-medium">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400">
                        {selectedFoods.reduce((sum, f) => sum + f.calories, 0)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do modal */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setShowMealLogModal(false)}
                className="flex-1 p-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={registerMeal}
                disabled={selectedFoods.length === 0}
                className="flex-1 p-3 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de troca de alimento via IA */}
      {showSwapModal && swapMealIndex !== null && swapFoodIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header do modal */}
            <div className="p-4 bg-gradient-to-r from-accent-600 to-primary-600 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Trocar Alimento
                </h3>
                <p className="text-sm text-primary-100">
                  {selectedDayData?.meals[swapMealIndex]?.foods[swapFoodIndex]?.name}
                </p>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-4">
              <p className="text-gray-400 text-sm mb-4">
                O que você gostaria de comer no lugar?
              </p>

              {/* Campo de texto para pedido */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={swapRequest}
                  onChange={(e) => setSwapRequest(e.target.value)}
                  placeholder="Ex: quero algo com frango, ou prefiro peixe..."
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && requestSwapSuggestion()}
                />
                <button
                  onClick={requestSwapSuggestion}
                  disabled={isSwapping || !swapRequest.trim()}
                  className="w-full p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSwapping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando sugestão...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Pedir sugestão à IA
                    </>
                  )}
                </button>
              </div>

              {/* Sugestão da IA */}
              {swapSuggestion && (
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-lg border border-primary-500/30">
                  <p className="text-xs text-gray-400 mb-2">Sugestão da IA:</p>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">{swapSuggestion.name}</h4>
                    <p className="text-gray-300">{swapSuggestion.quantity}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-primary-400">{swapSuggestion.calories} kcal</span>
                      <span className="text-blue-400">P: {swapSuggestion.protein}g</span>
                      <span className="text-yellow-400">C: {swapSuggestion.carbs}g</span>
                      <span className="text-purple-400">G: {swapSuggestion.fat}g</span>
                    </div>
                    {(swapSuggestion as { explanation?: string }).explanation && (
                      <p className="text-sm text-gray-400 mt-2 italic">
                        {(swapSuggestion as { explanation?: string }).explanation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer do modal */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowSwapModal(false)
                  setSwapSuggestion(null)
                }}
                className="flex-1 p-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              {swapSuggestion && (
                <button
                  onClick={applySwap}
                  className="flex-1 p-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Salvar troca
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Função para encontrar substituições para um alimento
function findSubstitutions(foodName: string): string[] {
  const lowerName = foodName.toLowerCase()

  // Procura correspondência direta ou parcial
  for (const [key, subs] of Object.entries(FOOD_SUBSTITUTIONS)) {
    if (lowerName.includes(key) || key.includes(lowerName.split(' ')[0])) {
      return subs
    }
  }

  // Substitutos genéricos por tipo de alimento
  if (lowerName.includes('grelhad') || lowerName.includes('carne') || lowerName.includes('frango') || lowerName.includes('peixe')) {
    return ['frango grelhado', 'carne moída', 'ovo cozido', 'peixe grelhado', 'atum em lata']
  }
  if (lowerName.includes('salada') || lowerName.includes('folha') || lowerName.includes('verde')) {
    return ['alface', 'rúcula', 'agrião', 'couve', 'espinafre']
  }

  return ['Não há sugestões específicas para este alimento']
}

// Componente de Card de Refeição
interface MealCardProps {
  meal: Meal
  index: number
  isExpanded: boolean
  onToggle: () => void
  onRegisterMeal: () => void
  onSwapFood: (mealIndex: number, foodIndex: number) => void
  isLogged: boolean
}

function MealCard({ meal, index, isExpanded, onToggle, onRegisterMeal, onSwapFood, isLogged }: MealCardProps) {
  const [showSubstitutions, setShowSubstitutions] = useState<number | null>(null)
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
        ${isLogged ? 'border-green-500/30' : ''}
      `}
    >
      {/* Header clicável */}
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className="flex-1 p-4 flex items-center gap-4"
        >
          <div className={`
            w-14 h-14 rounded-xl bg-gradient-to-br ${mealColors[index % mealColors.length]}
            flex items-center justify-center text-2xl relative
          `}>
            {mealEmojis[index % mealEmojis.length]}
            {isLogged && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-white flex items-center gap-2">
              {meal.name}
              {isLogged && <span className="text-xs text-green-400 font-normal">(registrado)</span>}
            </h4>
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

        {/* Botão Registrar Refeição */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRegisterMeal()
          }}
          className={`mr-4 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            isLogged
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
          }`}
          title={isLogged ? 'Registrar novamente' : 'Registrar o que comeu'}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="hidden sm:inline">{isLogged ? 'Atualizar' : 'Registrar'}</span>
        </button>
      </div>

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
              <div key={foodIndex} className="relative">
                <div className="p-3 bg-gray-800 rounded-lg">
                  {/* Alimento principal + alternativas inline */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Nome com alternativas */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-white font-medium">{food.name}</span>
                        {food.alternatives && food.alternatives.length > 0 && (
                          <>
                            {food.alternatives.map((alt, altIdx) => (
                              <span key={altIdx} className="flex items-center gap-1">
                                <span className="text-gray-500 text-sm">ou</span>
                                <span className="text-accent-400 font-medium">{alt.name}</span>
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{food.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-400">{food.calories} kcal</p>
                        <p className="text-xs text-gray-500">
                          P:{food.protein} C:{food.carbs} G:{food.fat}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSwapFood(index, foodIndex)
                        }}
                        className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors group"
                        title="Trocar alimento via IA"
                      >
                        <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-primary-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSubstitutions(showSubstitutions === foodIndex ? null : foodIndex)
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ver alternativas e substituições"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-gray-400 hover:text-primary-400" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes das alternativas quando expandido */}
                  {food.alternatives && food.alternatives.length > 0 && showSubstitutions === foodIndex && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-2">Detalhes das alternativas:</p>
                      <div className="space-y-2">
                        {food.alternatives.map((alt, altIdx) => (
                          <div key={altIdx} className="flex items-center justify-between text-sm bg-gray-700/50 p-2 rounded">
                            <div>
                              <span className="text-accent-400">{alt.name}</span>
                              <span className="text-gray-500 ml-2">({alt.quantity})</span>
                            </div>
                            <div className="text-gray-400">
                              {alt.calories} kcal | P:{alt.protein} C:{alt.carbs} G:{alt.fat}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Painel de substituições extras (não da IA) */}
                {showSubstitutions === foodIndex && (!food.alternatives || food.alternatives.length === 0) && (
                  <div className="mt-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">
                        Não gostou? Substitua por:
                      </p>
                      <button
                        onClick={() => setShowSubstitutions(null)}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {findSubstitutions(food.name).map((sub, subIndex) => (
                        <span
                          key={subIndex}
                          className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Mantenha quantidades similares para manter os macros
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
