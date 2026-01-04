'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, ArrowLeft, ArrowRight, Utensils, Coffee, Sun, Sunset, Moon, Apple } from 'lucide-react'

const MEAL_OPTIONS = [
  { count: 3, label: '3 refeições', description: 'Café, almoço e jantar', icon: '🍽️' },
  { count: 4, label: '4 refeições', description: '+ 1 lanche', icon: '🥪' },
  { count: 5, label: '5 refeições', description: '+ 2 lanches', icon: '🥗' },
  { count: 6, label: '6 refeições', description: '+ ceia', icon: '🌙' }
]

const MEAL_TIMES_PREVIEW = {
  3: [
    { name: 'Café da Manhã', time: '07:00', icon: <Coffee className="w-5 h-5" /> },
    { name: 'Almoço', time: '12:30', icon: <Sun className="w-5 h-5" /> },
    { name: 'Jantar', time: '19:30', icon: <Moon className="w-5 h-5" /> }
  ],
  4: [
    { name: 'Café da Manhã', time: '07:00', icon: <Coffee className="w-5 h-5" /> },
    { name: 'Almoço', time: '12:00', icon: <Sun className="w-5 h-5" /> },
    { name: 'Lanche', time: '16:00', icon: <Apple className="w-5 h-5" /> },
    { name: 'Jantar', time: '19:30', icon: <Moon className="w-5 h-5" /> }
  ],
  5: [
    { name: 'Café da Manhã', time: '07:00', icon: <Coffee className="w-5 h-5" /> },
    { name: 'Lanche da Manhã', time: '10:00', icon: <Apple className="w-5 h-5" /> },
    { name: 'Almoço', time: '12:30', icon: <Sun className="w-5 h-5" /> },
    { name: 'Lanche da Tarde', time: '16:00', icon: <Sunset className="w-5 h-5" /> },
    { name: 'Jantar', time: '19:30', icon: <Moon className="w-5 h-5" /> }
  ],
  6: [
    { name: 'Café da Manhã', time: '07:00', icon: <Coffee className="w-5 h-5" /> },
    { name: 'Lanche da Manhã', time: '10:00', icon: <Apple className="w-5 h-5" /> },
    { name: 'Almoço', time: '12:30', icon: <Sun className="w-5 h-5" /> },
    { name: 'Lanche da Tarde', time: '16:00', icon: <Sunset className="w-5 h-5" /> },
    { name: 'Jantar', time: '19:30', icon: <Moon className="w-5 h-5" /> },
    { name: 'Ceia', time: '21:30', icon: <Moon className="w-5 h-5" /> }
  ]
}

export function MealsStep() {
  const { state, dispatch, nextStep, prevStep } = useNutrition()
  const { mealPlan } = state.nutritionProfile

  const handleMealsChange = (count: number) => {
    dispatch({
      type: 'UPDATE_MEAL_PLAN',
      payload: { mealsPerDay: count }
    })
  }

  const toggleMealPrep = () => {
    dispatch({
      type: 'UPDATE_MEAL_PLAN',
      payload: { mealPrep: !mealPlan?.mealPrep }
    })
  }

  const toggleSnacks = () => {
    dispatch({
      type: 'UPDATE_MEAL_PLAN',
      payload: { includeSnacks: !mealPlan?.includeSnacks }
    })
  }

  const currentMeals = MEAL_TIMES_PREVIEW[mealPlan?.mealsPerDay as keyof typeof MEAL_TIMES_PREVIEW] || MEAL_TIMES_PREVIEW[5]

  return (
    <div className="space-y-6">
      {/* Card de número de refeições */}
      <Card>
        <CardHeader
          title="Quantas refeições por dia?"
          subtitle="Escolha a quantidade ideal para sua rotina"
          icon={<Utensils className="w-6 h-6 text-orange-400" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {MEAL_OPTIONS.map((option) => (
              <button
                key={option.count}
                onClick={() => handleMealsChange(option.count)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${mealPlan?.mealsPerDay === option.count
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }
                `}
              >
                {mealPlan?.mealsPerDay === option.count && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <span className="text-4xl mb-2 block">{option.icon}</span>
                <h3 className="font-bold text-white text-lg">{option.label}</h3>
                <p className="text-sm text-gray-400">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview de horários */}
      <Card>
        <CardHeader
          title="Distribuição das Refeições"
          subtitle="Horários sugeridos para cada refeição"
          icon={<Clock className="w-6 h-6 text-blue-400" />}
        />
        <CardContent>
          <div className="space-y-3">
            {currentMeals.map((meal, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                  {meal.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{meal.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-primary-400 font-mono font-bold">{meal.time}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Os horários são sugestões. Adapte à sua rotina!
          </p>
        </CardContent>
      </Card>

      {/* Opções adicionais */}
      <Card>
        <CardHeader
          title="Preferências Adicionais"
          subtitle="Personalize ainda mais sua dieta"
        />
        <CardContent>
          <div className="space-y-3">
            {/* Toggle Snacks */}
            <button
              onClick={toggleSnacks}
              className={`
                w-full p-4 rounded-xl border-2 transition-all text-left
                flex items-center justify-between
                ${mealPlan?.includeSnacks
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <h4 className="font-medium text-white">Lanches Saudáveis</h4>
                  <p className="text-sm text-gray-400">Incluir opções de lanches entre refeições</p>
                </div>
              </div>
              <div className={`
                w-12 h-6 rounded-full transition-all
                ${mealPlan?.includeSnacks ? 'bg-primary-500' : 'bg-gray-700'}
              `}>
                <div className={`
                  w-5 h-5 rounded-full bg-white shadow-md transform transition-all mt-0.5
                  ${mealPlan?.includeSnacks ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}
                `} />
              </div>
            </button>

            {/* Toggle Meal Prep */}
            <button
              onClick={toggleMealPrep}
              className={`
                w-full p-4 rounded-xl border-2 transition-all text-left
                flex items-center justify-between
                ${mealPlan?.mealPrep
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 bg-gray-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h4 className="font-medium text-white">Meal Prep</h4>
                  <p className="text-sm text-gray-400">Preparar marmitas para a semana toda</p>
                </div>
              </div>
              <div className={`
                w-12 h-6 rounded-full transition-all
                ${mealPlan?.mealPrep ? 'bg-primary-500' : 'bg-gray-700'}
              `}>
                <div className={`
                  w-5 h-5 rounded-full bg-white shadow-md transform transition-all mt-0.5
                  ${mealPlan?.mealPrep ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}
                `} />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Dica motivacional */}
      <div className="p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl border border-primary-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-medium text-primary-400">Dica de ouro!</h4>
            <p className="text-sm text-gray-300 mt-1">
              Comer a cada 3-4 horas mantém seu metabolismo ativo e evita a fome excessiva.
              Escolha um número de refeições que você consiga manter consistentemente!
            </p>
          </div>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex gap-3">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Voltar
        </Button>
        <Button
          onClick={nextStep}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Revisar e Gerar Dieta
        </Button>
      </div>
    </div>
  )
}
