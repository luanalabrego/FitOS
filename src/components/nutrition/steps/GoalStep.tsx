'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { INTENSITY_OPTIONS } from '@/types/nutrition'
import { Target, TrendingDown, TrendingUp, Scale, Dumbbell, ArrowRight, Flame, Zap, Rocket, AlertTriangle, Dumbbell as Exercise, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

// Calorias mínimas recomendadas para saúde
const MIN_CALORIES_MALE = 1500
const MIN_CALORIES_FEMALE = 1200
const DANGER_CALORIES_MALE = 1200
const DANGER_CALORIES_FEMALE = 1000

const GOAL_OPTIONS = [
  {
    type: 'perda_peso' as const,
    label: 'Perder Peso',
    description: 'Emagrecer e perder gordura',
    icon: <TrendingDown className="w-6 h-6" />,
    emoji: '🔥',
    color: 'from-red-500 to-orange-500'
  },
  {
    type: 'ganho_massa' as const,
    label: 'Ganhar Massa',
    description: 'Aumentar músculos',
    icon: <Dumbbell className="w-6 h-6" />,
    emoji: '💪',
    color: 'from-blue-500 to-purple-500'
  },
  {
    type: 'manutencao' as const,
    label: 'Manter Peso',
    description: 'Manter o peso atual',
    icon: <Scale className="w-6 h-6" />,
    emoji: '⚖️',
    color: 'from-green-500 to-teal-500'
  },
  {
    type: 'recomposicao' as const,
    label: 'Recomposição',
    description: 'Perder gordura e ganhar músculo',
    icon: <Target className="w-6 h-6" />,
    emoji: '🎯',
    color: 'from-purple-500 to-pink-500'
  }
]

const INTENSITY_ICONS = {
  leve: <Flame className="w-5 h-5" />,
  moderado: <Zap className="w-5 h-5" />,
  agressivo: <Rocket className="w-5 h-5" />
}

export function GoalStep() {
  const { state, dispatch, nextStep, userProfile, calculateTargets } = useNutrition()
  const { dietGoal } = state.nutritionProfile
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCustomCalories, setShowCustomCalories] = useState(dietGoal?.useCustomCalories || false)

  // Valores para alertas
  const isMale = userProfile?.bodyComposition?.gender === 'masculino'
  const minCalories = isMale ? MIN_CALORIES_MALE : MIN_CALORIES_FEMALE
  const dangerCalories = isMale ? DANGER_CALORIES_MALE : DANGER_CALORIES_FEMALE
  const calculatedCalories = state.nutritionProfile.nutritionTargets?.calories || 0
  const customCalories = dietGoal?.customCalories || calculatedCalories
  const activeCalories = dietGoal?.useCustomCalories ? customCalories : calculatedCalories

  // Verificar alertas de saúde
  const isCaloriesTooLow = activeCalories < minCalories && activeCalories > 0
  const isCaloriesDangerous = activeCalories < dangerCalories && activeCalories > 0

  // Calcular metas quando os dados mudam
  useEffect(() => {
    if (dietGoal?.currentWeight && dietGoal?.targetWeight && dietGoal?.type) {
      calculateTargets()
    }
  }, [dietGoal?.currentWeight, dietGoal?.targetWeight, dietGoal?.type, dietGoal?.intensity])

  // Sincronizar showCustomCalories com dietGoal
  useEffect(() => {
    setShowCustomCalories(dietGoal?.useCustomCalories || false)
  }, [dietGoal?.useCustomCalories])

  const handleGoalSelect = (type: typeof GOAL_OPTIONS[number]['type']) => {
    dispatch({ type: 'UPDATE_DIET_GOAL', payload: { type } })
  }

  const handleIntensitySelect = (intensity: 'leve' | 'moderado' | 'agressivo') => {
    dispatch({ type: 'UPDATE_DIET_GOAL', payload: { intensity } })
  }

  const handleWeightChange = (field: 'currentWeight' | 'targetWeight', value: string) => {
    const numValue = parseFloat(value) || 0
    dispatch({ type: 'UPDATE_DIET_GOAL', payload: { [field]: numValue } })
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleCustomCaloriesToggle = () => {
    const newValue = !showCustomCalories
    setShowCustomCalories(newValue)
    dispatch({
      type: 'UPDATE_DIET_GOAL',
      payload: {
        useCustomCalories: newValue,
        customCalories: newValue ? (dietGoal?.customCalories || calculatedCalories) : undefined
      }
    })
  }

  const handleCustomCaloriesChange = (value: string) => {
    const numValue = parseInt(value) || 0
    dispatch({
      type: 'UPDATE_DIET_GOAL',
      payload: { customCalories: numValue }
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!dietGoal?.currentWeight || dietGoal.currentWeight < 30) {
      newErrors.currentWeight = 'Informe seu peso atual'
    }
    if (!dietGoal?.targetWeight || dietGoal.targetWeight < 30) {
      newErrors.targetWeight = 'Informe seu peso objetivo'
    }
    if (!dietGoal?.type) {
      newErrors.type = 'Selecione um objetivo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      nextStep()
    }
  }

  const weightDiff = (dietGoal?.currentWeight || 0) - (dietGoal?.targetWeight || 0)
  const isLosing = weightDiff > 0
  const isGaining = weightDiff < 0
  const showIntensity = dietGoal?.type && dietGoal.type !== 'manutencao'

  return (
    <div className="space-y-6">
      {/* Card de Objetivo */}
      <Card>
        <CardHeader
          title="Qual é seu objetivo?"
          subtitle="Escolha o que mais combina com você"
          icon={<Target className="w-6 h-6 text-primary-400" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.type}
                onClick={() => handleGoalSelect(goal.type)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${dietGoal?.type === goal.type
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                  }
                `}
              >
                {dietGoal?.type === goal.type && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className={`
                  w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color}
                  flex items-center justify-center text-white mb-3
                `}>
                  <span className="text-2xl">{goal.emoji}</span>
                </div>
                <h3 className="font-semibold text-white">{goal.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-red-500 text-sm mt-2">{errors.type}</p>
          )}
        </CardContent>
      </Card>

      {/* Card de Pesos */}
      <Card>
        <CardHeader
          title="Seus números"
          subtitle="De onde você parte e onde quer chegar"
          icon={<Scale className="w-6 h-6 text-accent-400" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Peso Atual"
              type="number"
              value={dietGoal?.currentWeight || ''}
              onChange={(e) => handleWeightChange('currentWeight', e.target.value)}
              suffix="kg"
              placeholder="Ex: 80"
              error={errors.currentWeight}
              className="text-center text-lg font-bold"
            />
            <Input
              label="Peso Objetivo"
              type="number"
              value={dietGoal?.targetWeight || ''}
              onChange={(e) => handleWeightChange('targetWeight', e.target.value)}
              suffix="kg"
              placeholder="Ex: 70"
              error={errors.targetWeight}
              className="text-center text-lg font-bold"
            />
          </div>

          {/* Indicador visual de diferença */}
          {dietGoal?.currentWeight && dietGoal?.targetWeight && Math.abs(weightDiff) > 0 && (
            <div className={`
              mt-4 p-4 rounded-xl
              ${isLosing ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}
            `}>
              <div className="flex items-center justify-center gap-3">
                {isLosing ? (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                )}
                <span className={`text-lg font-bold ${isLosing ? 'text-red-400' : 'text-blue-400'}`}>
                  {isLosing ? 'Perder' : 'Ganhar'} {Math.abs(weightDiff).toFixed(1)} kg
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Intensidade */}
      {showIntensity && (
        <Card>
          <CardHeader
            title="Intensidade"
            subtitle="Quão rápido você quer ver resultados?"
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
          />
          <CardContent>
            <div className="space-y-3">
              {(Object.entries(INTENSITY_OPTIONS) as [keyof typeof INTENSITY_OPTIONS, typeof INTENSITY_OPTIONS[keyof typeof INTENSITY_OPTIONS]][]).map(([key, option]) => (
                <button
                  key={key}
                  onClick={() => handleIntensitySelect(key)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all
                    flex items-center justify-between
                    ${dietGoal?.intensity === key
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${key === 'leve' ? 'bg-green-500/20 text-green-400'
                        : key === 'moderado' ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }
                    `}>
                      {INTENSITY_ICONS[key]}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{option.label}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  {dietGoal?.intensity === key && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview de Projeção */}
      {state.nutritionProfile.weightProjection && (
        <Card className="border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Com base nas suas escolhas:</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="px-4 py-2 bg-primary-500/20 rounded-full">
                  <span className="text-primary-400 font-bold">
                    {Math.abs(state.nutritionProfile.weightProjection.weeklyChange).toFixed(2)} kg/semana
                  </span>
                </div>
                <div className="px-4 py-2 bg-accent-500/20 rounded-full">
                  <span className="text-accent-400 font-bold">
                    ~{Math.ceil(state.nutritionProfile.weightProjection.weeksToGoal)} semanas
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Meta prevista para {state.nutritionProfile.weightProjection.estimatedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Calorias Customizadas */}
      {calculatedCalories > 0 && (
        <Card>
          <CardHeader
            title="Calorias Diárias"
            subtitle="Personalize suas calorias ou use o cálculo automático"
            icon={<Flame className="w-6 h-6 text-orange-400" />}
          />
          <CardContent>
            {/* Calorias calculadas automaticamente */}
            <div className="p-4 bg-gray-800/50 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Calorias recomendadas</p>
                  <p className="text-2xl font-bold text-white">{calculatedCalories} kcal</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Baseado no seu</p>
                  <p className="text-xs text-gray-500">perfil e objetivo</p>
                </div>
              </div>
            </div>

            {/* Toggle para calorias customizadas */}
            <button
              onClick={handleCustomCaloriesToggle}
              className={`
                w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between
                ${showCustomCalories
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${showCustomCalories ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-700 text-gray-400'}
                `}>
                  <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">Definir calorias manualmente</h4>
                  <p className="text-sm text-gray-400">Eu sei quantas calorias quero consumir</p>
                </div>
              </div>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${showCustomCalories ? 'bg-primary-500 text-white' : 'bg-gray-700'}
              `}>
                {showCustomCalories && <span className="text-xs">✓</span>}
              </div>
            </button>

            {/* Input de calorias customizadas */}
            {showCustomCalories && (
              <div className="mt-4">
                <Input
                  label="Suas calorias diárias"
                  type="number"
                  value={customCalories || ''}
                  onChange={(e) => handleCustomCaloriesChange(e.target.value)}
                  suffix="kcal"
                  placeholder="Ex: 1800"
                  className="text-center text-lg font-bold"
                />
              </div>
            )}

            {/* Alertas de saúde */}
            {isCaloriesDangerous && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Atenção: Calorias muito baixas!</p>
                    <p className="text-sm text-red-300 mt-1">
                      Consumir menos de {dangerCalories} kcal/dia pode ser perigoso para a saúde.
                      Pode causar perda muscular, deficiências nutricionais e problemas metabólicos.
                      Consulte um profissional de saúde antes de prosseguir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCaloriesTooLow && !isCaloriesDangerous && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-400">Calorias abaixo do recomendado</p>
                    <p className="text-sm text-yellow-300 mt-1">
                      O mínimo recomendado para {isMale ? 'homens' : 'mulheres'} é {minCalories} kcal/dia.
                      Dietas muito restritivas podem ser difíceis de manter e causar efeito sanfona.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alerta de Exercício Físico */}
      {dietGoal?.type === 'perda_peso' && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-teal-500/5">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-green-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Dica: Combine com exercícios!
                </h4>
                <p className="text-sm text-gray-300 mt-2">
                  Com exercício físico regular, a queima de calorias pode ser ainda maior!
                  Uma caminhada de 30 minutos queima aproximadamente <strong className="text-green-400">150-200 kcal</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  💡 Musculação + cardio = maior gasto calórico e preservação muscular
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de próximo */}
      <Button
        onClick={handleNext}
        variant="primary"
        size="lg"
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continuar
      </Button>
    </div>
  )
}
