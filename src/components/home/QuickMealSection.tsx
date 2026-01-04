'use client'

import { useState, useEffect } from 'react'
import {
  Flame,
  Plus,
  Check,
  X,
  Loader2,
  Utensils,
  Clock,
  ClipboardList,
  Ban,
  Minus,
  ChevronRight
} from 'lucide-react'
import { getCurrentUser } from '@/services/authService'
import { getNutritionProfile } from '@/services/nutritionService'
import {
  NutritionProfile,
  Meal,
  MealLog,
  ConsumedFood,
  DailyConsumption,
  FoodItem,
  DailyDiet
} from '@/types/nutrition'

// Formato de data para storage
const getDateKey = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

// Obter dia da semana atual em português
const getCurrentDayOfWeek = (): string => {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  return days[new Date().getDay()]
}

// Formata data para exibição
const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function QuickMealSection() {
  const [nutritionProfile, setNutritionProfile] = useState<NutritionProfile | null>(null)
  const [dailyConsumption, setDailyConsumption] = useState<DailyConsumption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMealLogModal, setShowMealLogModal] = useState(false)
  const [selectedMealForLog, setSelectedMealForLog] = useState<Meal | null>(null)
  const [selectedFoods, setSelectedFoods] = useState<ConsumedFood[]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customFoodName, setCustomFoodName] = useState('')
  const [customFoodGrams, setCustomFoodGrams] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [quantityMultipliers, setQuantityMultipliers] = useState<Record<string, number>>({})

  const todayDateKey = getDateKey(new Date())
  const currentDayOfWeek = getCurrentDayOfWeek()

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      try {
        const user = getCurrentUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Carregar perfil de nutrição
        const profile = await getNutritionProfile(user.uid)
        if (profile) {
          setNutritionProfile(profile)
        }

        // Carregar consumo do dia do localStorage
        const stored = localStorage.getItem(`consumption_${todayDateKey}`)
        if (stored) {
          setDailyConsumption(JSON.parse(stored))
        } else if (profile?.nutritionTargets) {
          // Inicializar consumo do dia
          setDailyConsumption({
            date: todayDateKey,
            userId: user.uid,
            mealLogs: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            calorieGoal: profile.nutritionTargets.calories,
            proteinGoal: profile.nutritionTargets.protein,
            carbsGoal: profile.nutritionTargets.carbs,
            fatGoal: profile.nutritionTargets.fat
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [todayDateKey])

  // Salvar consumo no localStorage
  const saveConsumption = (consumption: DailyConsumption) => {
    localStorage.setItem(`consumption_${todayDateKey}`, JSON.stringify(consumption))
    setDailyConsumption(consumption)
  }

  // Obter dados do dia atual
  const getTodayData = (): DailyDiet | null => {
    if (!nutritionProfile?.currentDiet) return null
    return nutritionProfile.currentDiet.days.find(d => d.dayOfWeek === currentDayOfWeek) || null
  }

  const todayData = getTodayData()

  // Verificar se uma refeição já foi registrada hoje
  const isMealLogged = (mealName: string) => {
    return dailyConsumption?.mealLogs.some(log => log.mealName === mealName) || false
  }

  // Abrir modal de registro de refeição
  const openMealLogModal = (meal: Meal) => {
    setSelectedMealForLog(meal)
    setSelectedFoods([])
    setShowCustomInput(false)
    setCustomFoodName('')
    setCustomFoodGrams('')
    setQuantityMultipliers({})
    setShowMealLogModal(true)
  }

  // Abrir modal para adicionar refeição customizada (Outros)
  const openCustomMealModal = () => {
    const customMeal: Meal = {
      id: 'custom_meal',
      name: 'Outra Refeição',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    }
    setSelectedMealForLog(customMeal)
    setSelectedFoods([])
    setShowCustomInput(true)
    setCustomFoodName('')
    setCustomFoodGrams('')
    setQuantityMultipliers({})
    setShowMealLogModal(true)
  }

  // Adicionar alimento da dieta à seleção
  const toggleFoodSelection = (food: FoodItem, alternative?: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }) => {
    const foodData = alternative || food
    const existingIndex = selectedFoods.findIndex(f => f.name === foodData.name)

    if (existingIndex >= 0) {
      setSelectedFoods(selectedFoods.filter((_, i) => i !== existingIndex))
      const newMultipliers = { ...quantityMultipliers }
      delete newMultipliers[foodData.name]
      setQuantityMultipliers(newMultipliers)
    } else {
      const gramsMatch = foodData.quantity.match(/(\d+)\s*g/i)
      const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100
      const multiplier = quantityMultipliers[foodData.name] || 1

      setSelectedFoods([...selectedFoods, {
        name: foodData.name,
        quantity: foodData.quantity,
        grams: Math.round(grams * multiplier),
        calories: Math.round(foodData.calories * multiplier),
        protein: Math.round(foodData.protein * multiplier),
        carbs: Math.round(foodData.carbs * multiplier),
        fat: Math.round(foodData.fat * multiplier),
        isCustom: false
      }])
      if (!quantityMultipliers[foodData.name]) {
        setQuantityMultipliers({ ...quantityMultipliers, [foodData.name]: 1 })
      }
    }
  }

  // Atualizar multiplicador de quantidade
  const updateQuantityMultiplier = (foodName: string, multiplier: number) => {
    setQuantityMultipliers({ ...quantityMultipliers, [foodName]: multiplier })

    setSelectedFoods(selectedFoods.map(f => {
      if (f.name === foodName && !f.isCustom) {
        const originalFood = selectedMealForLog?.foods.find(mf => mf.name === foodName)
        if (originalFood) {
          const gramsMatch = originalFood.quantity.match(/(\d+)\s*g/i)
          const baseGrams = gramsMatch ? parseInt(gramsMatch[1]) : 100

          return {
            ...f,
            grams: Math.round(baseGrams * multiplier),
            calories: Math.round(originalFood.calories * multiplier),
            protein: Math.round(originalFood.protein * multiplier),
            carbs: Math.round(originalFood.carbs * multiplier),
            fat: Math.round(originalFood.fat * multiplier)
          }
        }
      }
      return f
    }))
  }

  // Registrar que não comeu nada
  const registerSkippedMeal = () => {
    if (!selectedMealForLog || !dailyConsumption) return

    const mealLog: MealLog = {
      id: `log_${Date.now()}`,
      date: new Date(),
      mealName: selectedMealForLog.name,
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      createdAt: new Date()
    }

    const updatedConsumption: DailyConsumption = {
      ...dailyConsumption,
      mealLogs: [...dailyConsumption.mealLogs, mealLog]
    }

    saveConsumption(updatedConsumption)
    setShowMealLogModal(false)
    setSelectedMealForLog(null)
    setSelectedFoods([])
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
  }

  // Calcular porcentagem
  const getPercentage = (consumed: number, goal: number) => {
    if (goal === 0) return 0
    return Math.min((consumed / goal) * 100, 100)
  }

  // Se está carregando
  if (isLoading) {
    return (
      <div className="mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            <span className="text-gray-400 text-sm">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Se não tem dieta configurada, não mostra nada
  if (!nutritionProfile?.currentDiet || !todayData) {
    return null
  }

  // Emojis e cores das refeições
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
    <>
      {/* Resumo do Dia */}
      <div className="mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Seu Dia Hoje
            </h2>
            <span className="text-xs text-gray-500">{formatDateDisplay(new Date())}</span>
          </div>

          {/* Barra de Calorias */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Calorias</span>
              <span className="text-sm font-medium text-white">
                {dailyConsumption?.totalCalories || 0} / {dailyConsumption?.calorieGoal || nutritionProfile.nutritionTargets?.calories || 0} kcal
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  getPercentage(dailyConsumption?.totalCalories || 0, dailyConsumption?.calorieGoal || 1) > 100
                    ? 'bg-red-500'
                    : getPercentage(dailyConsumption?.totalCalories || 0, dailyConsumption?.calorieGoal || 1) > 80
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500'
                }`}
                style={{
                  width: `${Math.min(getPercentage(dailyConsumption?.totalCalories || 0, dailyConsumption?.calorieGoal || 1), 100)}%`
                }}
              />
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            {/* Proteína */}
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-400">Proteina</span>
              </div>
              <p className="text-lg font-bold text-white">
                {dailyConsumption?.totalProtein || 0}
                <span className="text-xs text-gray-400 font-normal">/{dailyConsumption?.proteinGoal || nutritionProfile.nutritionTargets?.protein || 0}g</span>
              </p>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${getPercentage(dailyConsumption?.totalProtein || 0, dailyConsumption?.proteinGoal || 1)}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-yellow-400">Carbos</span>
              </div>
              <p className="text-lg font-bold text-white">
                {dailyConsumption?.totalCarbs || 0}
                <span className="text-xs text-gray-400 font-normal">/{dailyConsumption?.carbsGoal || nutritionProfile.nutritionTargets?.carbs || 0}g</span>
              </p>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${getPercentage(dailyConsumption?.totalCarbs || 0, dailyConsumption?.carbsGoal || 1)}%` }}
                />
              </div>
            </div>

            {/* Gorduras */}
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-purple-400">Gorduras</span>
              </div>
              <p className="text-lg font-bold text-white">
                {dailyConsumption?.totalFat || 0}
                <span className="text-xs text-gray-400 font-normal">/{dailyConsumption?.fatGoal || nutritionProfile.nutritionTargets?.fat || 0}g</span>
              </p>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${getPercentage(dailyConsumption?.totalFat || 0, dailyConsumption?.fatGoal || 1)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registrar Refeição */}
      <div className="mt-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary-400" />
              Registrar Refeicao
            </h2>
          </div>

          {/* Lista de refeições do dia */}
          <div className="space-y-2">
            {todayData.meals.map((meal, index) => {
              const logged = isMealLogged(meal.name)
              return (
                <button
                  key={meal.id}
                  onClick={() => openMealLogModal(meal)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    logged
                      ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                      : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mealColors[index % mealColors.length]} flex items-center justify-center text-lg relative`}>
                    {mealEmojis[index % mealEmojis.length]}
                    {logged && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${logged ? 'text-green-400' : 'text-white'}`}>
                      {meal.name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.time} - {meal.totalCalories} kcal
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${logged ? 'text-green-400' : 'text-gray-400'}`} />
                </button>
              )
            })}

            {/* Opção Outros */}
            <button
              onClick={openCustomMealModal}
              className="w-full p-3 rounded-xl flex items-center gap-3 bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-primary-400">Outros</p>
                <p className="text-xs text-gray-400">Adicionar outra refeicao</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Registro de Refeição */}
      {showMealLogModal && selectedMealForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Header do modal */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Registrar Refeicao
                </h3>
                <p className="text-sm text-primary-100">
                  {selectedMealForLog.name} - {formatDateDisplay(new Date())}
                </p>
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
              {/* Botão Não Comi Nada - só mostra se não for refeição customizada */}
              {selectedMealForLog.id !== 'custom_meal' && (
                <button
                  onClick={registerSkippedMeal}
                  className="w-full p-3 mb-4 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Ban className="w-5 h-5" />
                  Nao comi nada nesta refeicao
                </button>
              )}

              {selectedMealForLog.foods.length > 0 && (
                <p className="text-gray-400 text-sm mb-4">
                  Selecione o que voce consumiu:
                </p>
              )}

              {/* Lista de alimentos da dieta */}
              {selectedMealForLog.foods.length > 0 && (
                <div className="space-y-3 mb-4">
                  {selectedMealForLog.foods.map((food, index) => {
                    const isSelected = selectedFoods.some(f => f.name === food.name)
                    const multiplier = quantityMultipliers[food.name] || 1

                    return (
                      <div key={index} className="space-y-2">
                        {/* Alimento principal */}
                        <div className={`p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary-500/20 border-primary-500'
                            : 'bg-gray-700/50 border-gray-600'
                        }`}>
                          <button
                            onClick={() => toggleFoodSelection(food)}
                            className="w-full flex items-center justify-between"
                          >
                            <div className="text-left">
                              <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{food.name}</p>
                              <p className="text-sm text-gray-400">
                                {food.quantity} - {Math.round(food.calories * multiplier)} kcal
                              </p>
                            </div>
                            {isSelected ? (
                              <Check className="w-5 h-5 text-primary-400" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {/* Controle de quantidade quando selecionado */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs text-gray-400 mb-2">Ajustar quantidade:</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantityMultiplier(food.name, Math.max(0.25, multiplier - 0.25))}
                                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-white" />
                                </button>
                                <div className="flex-1 text-center">
                                  <span className="text-lg font-bold text-white">{Math.round(multiplier * 100)}%</span>
                                  <p className="text-xs text-gray-400">
                                    ({Math.round(food.calories * multiplier)} kcal)
                                  </p>
                                </div>
                                <button
                                  onClick={() => updateQuantityMultiplier(food.name, Math.min(2, multiplier + 0.25))}
                                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-white" />
                                </button>
                              </div>
                              <div className="flex justify-center gap-2 mt-2">
                                {[0.5, 0.75, 1, 1.25, 1.5].map(preset => (
                                  <button
                                    key={preset}
                                    onClick={() => updateQuantityMultiplier(food.name, preset)}
                                    className={`px-2 py-1 text-xs rounded ${
                                      multiplier === preset
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                  >
                                    {Math.round(preset * 100)}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

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
                    )
                  })}
                </div>
              )}

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
    </>
  )
}
