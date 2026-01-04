'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Sparkles,
  Target,
  Utensils,
  Heart,
  Calendar,
  TrendingDown,
  TrendingUp,
  Flame,
  Droplet,
  Loader2,
  Edit2
} from 'lucide-react'
import { DIET_STYLES, INTENSITY_OPTIONS } from '@/types/nutrition'

export function ReviewStep() {
  const { state, generateDiet, prevStep, goToStep, calculateTargets } = useNutrition()
  const { nutritionProfile, isGeneratingDiet } = state
  const { dietGoal, foodPreferences, mealPlan, nutritionTargets, weightProjection } = nutritionProfile

  // Calcular targets se ainda não existir
  if (!nutritionTargets && dietGoal?.currentWeight && dietGoal?.targetWeight) {
    calculateTargets()
  }

  const isLosing = (dietGoal?.currentWeight || 0) > (dietGoal?.targetWeight || 0)
  const isGaining = (dietGoal?.currentWeight || 0) < (dietGoal?.targetWeight || 0)

  const handleGenerate = async () => {
    await generateDiet()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Tudo pronto!</h2>
        <p className="text-gray-400 mt-2">
          Revise suas escolhas antes de gerar sua dieta personalizada
        </p>
      </div>

      {/* Card de Objetivo */}
      <Card>
        <CardHeader
          title="Seu Objetivo"
          icon={<Target className="w-5 h-5 text-primary-400" />}
          action={
            <button
              onClick={() => goToStep('objetivo')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Peso Atual</p>
              <p className="text-xl font-bold text-white">{dietGoal?.currentWeight} kg</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl flex flex-col items-center justify-center">
              {isLosing ? (
                <TrendingDown className="w-6 h-6 text-red-400 mb-1" />
              ) : isGaining ? (
                <TrendingUp className="w-6 h-6 text-blue-400 mb-1" />
              ) : (
                <span className="text-gray-400">=</span>
              )}
              <p className={`text-sm font-bold ${isLosing ? 'text-red-400' : isGaining ? 'text-blue-400' : 'text-gray-400'}`}>
                {Math.abs((dietGoal?.currentWeight || 0) - (dietGoal?.targetWeight || 0)).toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Peso Meta</p>
              <p className="text-xl font-bold text-primary-400">{dietGoal?.targetWeight} kg</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Intensidade:</span>
              <span className={`font-medium ${INTENSITY_OPTIONS[dietGoal?.intensity || 'moderado']?.color}`}>
                {INTENSITY_OPTIONS[dietGoal?.intensity || 'moderado']?.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Metas Nutricionais */}
      {nutritionTargets && (
        <Card className="border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
          <CardHeader
            title="Suas Metas Diárias"
            icon={<Flame className="w-5 h-5 text-orange-400" />}
          />
          <CardContent>
            {/* Calorias em destaque */}
            <div className="text-center p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl mb-4">
              <p className="text-gray-400 text-sm">Meta de Calorias</p>
              <p className="text-4xl font-bold text-white mt-1">
                {nutritionTargets.calories}
                <span className="text-lg text-gray-400 ml-1">kcal</span>
              </p>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl text-center">
                <p className="text-xs text-blue-400">Proteínas</p>
                <p className="text-xl font-bold text-white">{nutritionTargets.protein}g</p>
                <p className="text-xs text-gray-500">{nutritionTargets.proteinPercent}%</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl text-center">
                <p className="text-xs text-yellow-400">Carboidratos</p>
                <p className="text-xl font-bold text-white">{nutritionTargets.carbs}g</p>
                <p className="text-xs text-gray-500">{nutritionTargets.carbsPercent}%</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-center">
                <p className="text-xs text-purple-400">Gorduras</p>
                <p className="text-xl font-bold text-white">{nutritionTargets.fat}g</p>
                <p className="text-xs text-gray-500">{nutritionTargets.fatPercent}%</p>
              </div>
            </div>

            {/* Água */}
            <div className="mt-3 p-3 bg-cyan-500/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400">Meta de Água</span>
              </div>
              <span className="font-bold text-white">{nutritionTargets.water}L / dia</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Projeção */}
      {weightProjection && (
        <Card>
          <CardHeader
            title="Projeção de Resultados"
            icon={<Calendar className="w-5 h-5 text-green-400" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl text-center">
                <p className="text-sm text-gray-400">Por semana</p>
                <p className="text-2xl font-bold text-green-400">
                  {isLosing ? '-' : '+'}{Math.abs(weightProjection.weeklyChange).toFixed(2)} kg
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-accent-500/10 to-yellow-500/10 rounded-xl text-center">
                <p className="text-sm text-gray-400">Tempo estimado</p>
                <p className="text-2xl font-bold text-accent-400">
                  ~{Math.ceil(weightProjection.weeksToGoal)} semanas
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-800/50 rounded-xl text-center">
              <p className="text-gray-400">Meta prevista para</p>
              <p className="text-lg font-bold text-white">
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

      {/* Card de Preferências */}
      <Card>
        <CardHeader
          title="Preferências"
          icon={<Heart className="w-5 h-5 text-pink-400" />}
          action={
            <button
              onClick={() => goToStep('preferencias')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          }
        />
        <CardContent>
          {/* Estilo de dieta */}
          {foodPreferences?.dietStyle && (
            <div className="p-3 bg-gray-800/50 rounded-xl mb-3 flex items-center gap-3">
              <span className="text-2xl">
                {DIET_STYLES[foodPreferences.dietStyle].icon}
              </span>
              <div>
                <p className="text-sm text-gray-400">Estilo de Dieta</p>
                <p className="font-medium text-white">
                  {DIET_STYLES[foodPreferences.dietStyle].label}
                </p>
              </div>
            </div>
          )}

          {/* Tags de preferências */}
          <div className="space-y-3">
            {(foodPreferences?.dislikedFoods || []).length > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-2">❌ Não gosta:</p>
                <div className="flex flex-wrap gap-1">
                  {foodPreferences?.dislikedFoods?.slice(0, 5).map(food => (
                    <span key={food} className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                      {food}
                    </span>
                  ))}
                  {(foodPreferences?.dislikedFoods?.length || 0) > 5 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                      +{(foodPreferences?.dislikedFoods?.length || 0) - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {(foodPreferences?.mustHaveFoods || []).length > 0 && (
              <div>
                <p className="text-xs text-green-400 mb-2">✅ Favoritos:</p>
                <div className="flex flex-wrap gap-1">
                  {foodPreferences?.mustHaveFoods?.slice(0, 5).map(food => (
                    <span key={food} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      {food}
                    </span>
                  ))}
                  {(foodPreferences?.mustHaveFoods?.length || 0) > 5 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                      +{(foodPreferences?.mustHaveFoods?.length || 0) - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {(foodPreferences?.restrictions || []).length > 0 && (
              <div>
                <p className="text-xs text-yellow-400 mb-2">⚠️ Restrições:</p>
                <div className="flex flex-wrap gap-1">
                  {foodPreferences?.restrictions?.map(food => (
                    <span key={food} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card de Refeições */}
      <Card>
        <CardHeader
          title="Refeições"
          icon={<Utensils className="w-5 h-5 text-orange-400" />}
          action={
            <button
              onClick={() => goToStep('refeicoes')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          }
        />
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Refeições por dia:</span>
            <span className="font-bold text-white text-xl">{mealPlan?.mealsPerDay}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {mealPlan?.includeSnacks && (
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                🍎 Com lanches
              </span>
            )}
            {mealPlan?.mealPrep && (
              <span className="px-3 py-1 bg-accent-500/20 text-accent-400 rounded-full text-sm">
                📦 Meal Prep
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="space-y-3">
        <Button
          onClick={handleGenerate}
          variant="primary"
          size="lg"
          fullWidth
          disabled={isGeneratingDiet}
          leftIcon={isGeneratingDiet ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
        >
          {isGeneratingDiet ? 'Gerando sua dieta...' : '✨ Gerar Minha Dieta'}
        </Button>

        <Button
          onClick={prevStep}
          variant="ghost"
          size="lg"
          fullWidth
          disabled={isGeneratingDiet}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Voltar e Ajustar
        </Button>
      </div>

      {/* Mensagem durante geração */}
      {isGeneratingDiet && (
        <div className="text-center p-6 bg-gray-800/50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/20 mb-4">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
          <p className="text-gray-300">
            🧠 Nossa IA está criando sua dieta personalizada...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Isso pode levar alguns segundos
          </p>
        </div>
      )}
    </div>
  )
}
