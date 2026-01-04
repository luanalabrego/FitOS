'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FOOD_CATEGORIES, DIET_STYLES, DietStyle } from '@/types/nutrition'
import { Heart, ThumbsDown, ThumbsUp, AlertTriangle, ArrowLeft, ArrowRight, ChefHat, HelpCircle, X } from 'lucide-react'
import { useState } from 'react'

type FoodCategory = keyof typeof FOOD_CATEGORIES

// Explicações detalhadas de cada dieta
const DIET_EXPLANATIONS: Record<DietStyle, { title: string; description: string; benefits: string[]; foods: { allowed: string[]; avoid: string[] }; macros: string }> = {
  tradicional: {
    title: 'Dieta Brasileira Tradicional',
    description: 'A dieta tradicional brasileira é baseada em alimentos naturais e preparações típicas do nosso país. É equilibrada e fácil de seguir no dia a dia.',
    benefits: [
      'Fácil de encontrar os alimentos',
      'Preparações simples e conhecidas',
      'Equilibrada em todos os macronutrientes',
      'Flexível e sustentável a longo prazo'
    ],
    foods: {
      allowed: ['Arroz', 'Feijão', 'Carnes magras', 'Frango', 'Peixe', 'Ovos', 'Frutas', 'Legumes', 'Verduras'],
      avoid: ['Alimentos ultraprocessados', 'Excesso de açúcar', 'Frituras em excesso']
    },
    macros: 'Proteína: 20-30% | Carboidratos: 45-55% | Gorduras: 25-30%'
  },
  cetogenica: {
    title: 'Dieta Cetogênica (Keto)',
    description: 'A dieta cetogênica é muito baixa em carboidratos e alta em gorduras. Força o corpo a usar gordura como fonte principal de energia, entrando em estado de cetose.',
    benefits: [
      'Perda de peso acelerada',
      'Redução do apetite',
      'Melhora na clareza mental',
      'Controle da glicemia'
    ],
    foods: {
      allowed: ['Carnes', 'Peixes', 'Ovos', 'Queijos', 'Manteiga', 'Azeite', 'Abacate', 'Castanhas', 'Vegetais folhosos'],
      avoid: ['Arroz', 'Feijão', 'Pão', 'Massas', 'Frutas doces', 'Açúcar', 'Tubérculos', 'Grãos']
    },
    macros: 'Proteína: 20% | Carboidratos: máx 5% (25g) | Gorduras: 75%'
  },
  low_carb: {
    title: 'Dieta Low Carb',
    description: 'Reduz significativamente os carboidratos sem ser tão restritiva quanto a cetogênica. Permite mais flexibilidade mantendo os benefícios da redução de carbs.',
    benefits: [
      'Perda de peso moderada',
      'Mais flexível que a keto',
      'Controle da insulina',
      'Redução da retenção de líquidos'
    ],
    foods: {
      allowed: ['Carnes', 'Peixes', 'Ovos', 'Legumes', 'Algumas frutas', 'Queijos', 'Iogurte natural'],
      avoid: ['Pão branco', 'Arroz branco', 'Massas', 'Açúcar', 'Doces', 'Refrigerantes']
    },
    macros: 'Proteína: 30-35% | Carboidratos: máx 20% (100g) | Gorduras: 45-50%'
  },
  mediterranea: {
    title: 'Dieta Mediterrânea',
    description: 'Baseada na alimentação dos países do Mediterrâneo. Rica em gorduras saudáveis, peixes, vegetais e grãos integrais. Uma das dietas mais estudadas e recomendadas.',
    benefits: [
      'Proteção cardiovascular',
      'Anti-inflamatória',
      'Rica em antioxidantes',
      'Sustentável a longo prazo'
    ],
    foods: {
      allowed: ['Azeite de oliva', 'Peixes', 'Frango', 'Legumes', 'Frutas', 'Grãos integrais', 'Nozes', 'Ervas'],
      avoid: ['Carnes processadas', 'Açúcar refinado', 'Alimentos ultraprocessados']
    },
    macros: 'Proteína: 15-20% | Carboidratos: 40-45% | Gorduras: 35-40%'
  },
  vegetariana: {
    title: 'Dieta Vegetariana',
    description: 'Exclui carnes mas permite ovos e laticínios. Requer atenção especial para garantir proteínas e nutrientes adequados.',
    benefits: [
      'Menor impacto ambiental',
      'Rica em fibras',
      'Pode reduzir colesterol',
      'Variedade de alimentos'
    ],
    foods: {
      allowed: ['Ovos', 'Leite', 'Queijos', 'Iogurte', 'Leguminosas', 'Tofu', 'Grãos', 'Frutas', 'Vegetais'],
      avoid: ['Carnes vermelhas', 'Frango', 'Peixe', 'Frutos do mar']
    },
    macros: 'Proteína: 20-25% | Carboidratos: 50-55% | Gorduras: 25-30%'
  },
  vegana: {
    title: 'Dieta Vegana',
    description: 'Exclui todos os produtos de origem animal. Requer planejamento cuidadoso e possivelmente suplementação de B12.',
    benefits: [
      'Menor impacto ambiental',
      'Rica em fibras e antioxidantes',
      'Pode melhorar digestão',
      'Ética animal'
    ],
    foods: {
      allowed: ['Leguminosas', 'Tofu', 'Tempeh', 'Grãos', 'Frutas', 'Vegetais', 'Castanhas', 'Sementes'],
      avoid: ['Carnes', 'Peixes', 'Ovos', 'Leite', 'Queijos', 'Mel']
    },
    macros: 'Proteína: 20-25% | Carboidratos: 50-55% | Gorduras: 25-30%'
  },
  flexivel: {
    title: 'Dieta Flexível (IIFYM)',
    description: '"If It Fits Your Macros" - foca em atingir metas de macronutrientes, permitindo qualquer alimento dentro dos números. Ideal para quem quer flexibilidade.',
    benefits: [
      'Máxima flexibilidade',
      'Sustentável socialmente',
      'Sem alimentos proibidos',
      'Foco em educação nutricional'
    ],
    foods: {
      allowed: ['Qualquer alimento que caiba nos macros', 'Priorize 80% alimentos nutritivos'],
      avoid: ['Nada é proibido, mas moderação é chave']
    },
    macros: 'Proteína: 25-30% | Carboidratos: 40-45% | Gorduras: 25-30%'
  }
}

export function PreferencesStep() {
  const { state, dispatch, nextStep, prevStep } = useNutrition()
  const { foodPreferences } = state.nutritionProfile
  const [activeTab, setActiveTab] = useState<'style' | 'dislike' | 'love' | 'restrict'>('style')
  const [showDietInfo, setShowDietInfo] = useState<DietStyle | null>(null)

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
                  <div key={key} className="relative">
                    <button
                      onClick={() => selectDietStyle(key)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-left
                        flex items-center gap-4
                        ${foodPreferences?.dietStyle === key
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }
                      `}
                    >
                      <span className="text-3xl">{style.icon}</span>
                      <div className="flex-1 pr-8">
                        <h4 className="font-semibold text-white">{style.label}</h4>
                        <p className="text-sm text-gray-400">{style.description}</p>
                      </div>
                      {foodPreferences?.dietStyle === key && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                    {/* Botão de ajuda */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDietInfo(key)
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                      title="Saiba mais sobre esta dieta"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Modal de informações da dieta */}
      {showDietInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{DIET_STYLES[showDietInfo].icon}</span>
                <h3 className="text-lg font-bold text-white">
                  {DIET_EXPLANATIONS[showDietInfo].title}
                </h3>
              </div>
              <button
                onClick={() => setShowDietInfo(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              {/* Descrição */}
              <div>
                <p className="text-gray-300 leading-relaxed">
                  {DIET_EXPLANATIONS[showDietInfo].description}
                </p>
              </div>

              {/* Macros */}
              <div className="p-3 bg-primary-500/10 rounded-lg border border-primary-500/30">
                <h4 className="text-sm font-medium text-primary-400 mb-1">Distribuição de Macros</h4>
                <p className="text-white text-sm font-mono">
                  {DIET_EXPLANATIONS[showDietInfo].macros}
                </p>
              </div>

              {/* Benefícios */}
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <span>✅</span> Benefícios
                </h4>
                <ul className="space-y-1">
                  {DIET_EXPLANATIONS[showDietInfo].benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alimentos Permitidos */}
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <span>👍</span> Alimentos Permitidos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_EXPLANATIONS[showDietInfo].foods.allowed.map((food, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alimentos a Evitar */}
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <span>👎</span> Evitar/Limitar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_EXPLANATIONS[showDietInfo].foods.avoid.map((food, index) => (
                    <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setShowDietInfo(null)}
                className="flex-1 p-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  selectDietStyle(showDietInfo)
                  setShowDietInfo(null)
                }}
                className="flex-1 p-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
              >
                Escolher Esta Dieta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
