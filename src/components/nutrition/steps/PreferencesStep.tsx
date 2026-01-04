'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FOOD_CATEGORIES, DIET_STYLES, DietStyle } from '@/types/nutrition'
import { Heart, ThumbsDown, ThumbsUp, AlertTriangle, ArrowLeft, ArrowRight, ChefHat } from 'lucide-react'
import { useState } from 'react'

type FoodCategory = keyof typeof FOOD_CATEGORIES

export function PreferencesStep() {
  const { state, dispatch, nextStep, prevStep } = useNutrition()
  const { foodPreferences } = state.nutritionProfile
  const [activeTab, setActiveTab] = useState<'style' | 'dislike' | 'love' | 'restrict'>('style')

  const toggleFood = (list: 'dislikedFoods' | 'mustHaveFoods' | 'restrictions', food: string) => {
    const currentList = foodPreferences?.[list] || []
    const newList = currentList.includes(food)
      ? currentList.filter(f => f !== food)
      : [...currentList, food]

    dispatch({
      type: 'UPDATE_FOOD_PREFERENCES',
      payload: { [list]: newList }
    })
  }

  const selectDietStyle = (style: DietStyle) => {
    dispatch({
      type: 'UPDATE_FOOD_PREFERENCES',
      payload: { dietStyle: style }
    })
  }

  const tabs = [
    { id: 'style' as const, label: 'Estilo', icon: <ChefHat className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'dislike' as const, label: 'Não Gosto', icon: <ThumbsDown className="w-4 h-4" />, color: 'text-red-400' },
    { id: 'love' as const, label: 'Adoro', icon: <ThumbsUp className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'restrict' as const, label: 'Restrições', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-400' }
  ]

  const renderFoodSelector = (
    list: 'dislikedFoods' | 'mustHaveFoods' | 'restrictions',
    selectedColor: string,
    emptyMessage: string
  ) => {
    const selectedFoods = foodPreferences?.[list] || []

    return (
      <div className="space-y-4">
        {/* Preview dos selecionados */}
        {selectedFoods.length > 0 && (
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Selecionados ({selectedFoods.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedFoods.map(food => (
                <span
                  key={food}
                  onClick={() => toggleFood(list, food)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all ${selectedColor} hover:opacity-80`}
                >
                  {food} ✕
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categorias */}
        {Object.entries(FOOD_CATEGORIES).map(([key, category]) => (
          <div key={key} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.items.map(food => {
                const isSelected = selectedFoods.includes(food)
                return (
                  <button
                    key={food}
                    onClick={() => toggleFood(list, food)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${isSelected
                        ? selectedColor
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {food}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {selectedFoods.length === 0 && (
          <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Suas Preferências Alimentares"
          subtitle="Personalize sua dieta do seu jeito"
          icon={<Heart className="w-6 h-6 text-pink-400" />}
        />
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
                {tab.label}
                {tab.id !== 'style' && (
                  <span className={`
                    w-5 h-5 rounded-full text-xs flex items-center justify-center
                    ${activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-700'}
                  `}>
                    {(foodPreferences?.[
                      tab.id === 'dislike' ? 'dislikedFoods'
                        : tab.id === 'love' ? 'mustHaveFoods'
                        : 'restrictions'
                    ] || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Conteúdo da Tab */}
          {activeTab === 'style' && (
            <div className="space-y-3">
              <p className="text-gray-400 mb-4">
                Escolha o estilo de dieta que mais combina com você:
              </p>
              <div className="grid gap-3">
                {(Object.entries(DIET_STYLES) as [DietStyle, typeof DIET_STYLES[DietStyle]][]).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => selectDietStyle(key)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      flex items-center gap-4
                      ${foodPreferences?.dietStyle === key
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }
                    `}
                  >
                    <span className="text-3xl">{style.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{style.label}</h4>
                      <p className="text-sm text-gray-400">{style.description}</p>
                    </div>
                    {foodPreferences?.dietStyle === key && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dislike' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <ThumbsDown className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">
                  Estes alimentos <strong>NÃO</strong> aparecerão na sua dieta
                </p>
              </div>
              {renderFoodSelector(
                'dislikedFoods',
                'bg-red-500/20 text-red-300',
                'Selecione alimentos que você não gosta'
              )}
            </div>
          )}

          {activeTab === 'love' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <ThumbsUp className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm">
                  Vamos incluir estes alimentos na sua dieta sempre que possível
                </p>
              </div>
              {renderFoodSelector(
                'mustHaveFoods',
                'bg-green-500/20 text-green-300',
                'Selecione alimentos que você adora'
              )}
            </div>
          )}

          {activeTab === 'restrict' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-300 text-sm">
                  Restrições alimentares, alergias ou intolerâncias
                </p>
              </div>

              {/* Restrições comuns */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-400">Restrições Comuns:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Lactose', 'Glúten', 'Frutos do mar', 'Amendoim', 'Soja', 'Ovo'].map(restriction => {
                    const isSelected = (foodPreferences?.restrictions || []).includes(restriction)
                    return (
                      <button
                        key={restriction}
                        onClick={() => toggleFood('restrictions', restriction)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-all
                          ${isSelected
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }
                        `}
                      >
                        {restriction}
                      </button>
                    )
                  })}
                </div>
              </div>

              {renderFoodSelector(
                'restrictions',
                'bg-yellow-500/20 text-yellow-300',
                'Selecione alimentos que você não pode comer'
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo das Preferências */}
      <Card className="bg-gray-800/30">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-400">
                {(foodPreferences?.dislikedFoods || []).length}
              </p>
              <p className="text-xs text-gray-400">Não gosto</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {(foodPreferences?.mustHaveFoods || []).length}
              </p>
              <p className="text-xs text-gray-400">Favoritos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {(foodPreferences?.restrictions || []).length}
              </p>
              <p className="text-xs text-gray-400">Restrições</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          Continuar
        </Button>
      </div>
    </div>
  )
}
