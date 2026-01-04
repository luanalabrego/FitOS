'use client'

import { useNutrition } from '@/contexts/NutritionContext'
import { GoalStep } from './steps/GoalStep'
import { PreferencesStep } from './steps/PreferencesStep'
import { MealsStep } from './steps/MealsStep'
import { ReviewStep } from './steps/ReviewStep'
import { DietView } from './DietView'
import { NutritionStep } from '@/types/nutrition'
import { Loader2, Utensils, Heart, Clock, CheckCircle, Sparkles } from 'lucide-react'

const STEPS_CONFIG: {
  key: NutritionStep
  label: string
  icon: React.ReactNode
  shortLabel: string
}[] = [
  { key: 'objetivo', label: 'Seu Objetivo', shortLabel: 'Objetivo', icon: <Utensils className="w-5 h-5" /> },
  { key: 'preferencias', label: 'Preferências', shortLabel: 'Gostos', icon: <Heart className="w-5 h-5" /> },
  { key: 'refeicoes', label: 'Refeições', shortLabel: 'Refeições', icon: <Clock className="w-5 h-5" /> },
  { key: 'revisao', label: 'Revisão', shortLabel: 'Revisar', icon: <CheckCircle className="w-5 h-5" /> },
  { key: 'dieta_gerada', label: 'Sua Dieta', shortLabel: 'Dieta', icon: <Sparkles className="w-5 h-5" /> }
]

export function NutritionWizard() {
  const { state, goToStep } = useNutrition()
  const { currentStep, completedSteps, isLoading } = state

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando seu perfil nutricional...</p>
        </div>
      </div>
    )
  }

  const currentStepIndex = STEPS_CONFIG.findIndex(s => s.key === currentStep)

  const renderStep = () => {
    switch (currentStep) {
      case 'objetivo':
        return <GoalStep />
      case 'preferencias':
        return <PreferencesStep />
      case 'refeicoes':
        return <MealsStep />
      case 'revisao':
        return <ReviewStep />
      case 'dieta_gerada':
        return <DietView />
      default:
        return <GoalStep />
    }
  }

  // Se estiver na dieta gerada, não mostrar o wizard header
  if (currentStep === 'dieta_gerada') {
    return <DietView />
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header com Progress Steps */}
      <div className="sticky top-16 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Título */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              🍽️ Monte sua Dieta
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Vamos criar um plano alimentar perfeito para você
            </p>
          </div>

          {/* Progress Steps - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-2">
            {STEPS_CONFIG.slice(0, -1).map((step, index) => {
              const isCompleted = completedSteps.includes(step.key)
              const isCurrent = currentStep === step.key
              const isClickable = isCompleted || index <= currentStepIndex

              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(step.key)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full transition-all
                      ${isCurrent
                        ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500'
                        : isCompleted
                          ? 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
                          : 'bg-gray-800 text-gray-500'
                      }
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCurrent
                        ? 'bg-primary-500 text-white'
                        : isCompleted
                          ? 'bg-primary-500/30 text-primary-400'
                          : 'bg-gray-700 text-gray-400'
                      }
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <span className="font-medium">{step.label}</span>
                  </button>
                  {index < STEPS_CONFIG.length - 2 && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-primary-500' : 'bg-gray-700'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress Steps - Mobile */}
          <div className="md:hidden">
            <div className="flex justify-between items-center mb-2">
              {STEPS_CONFIG.slice(0, -1).map((step, index) => {
                const isCompleted = completedSteps.includes(step.key)
                const isCurrent = currentStep === step.key

                return (
                  <div
                    key={step.key}
                    className={`
                      flex flex-col items-center gap-1
                      ${isCurrent ? 'text-primary-400' : isCompleted ? 'text-primary-500' : 'text-gray-500'}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isCurrent
                        ? 'bg-primary-500 text-white'
                        : isCompleted
                          ? 'bg-primary-500/30'
                          : 'bg-gray-700'
                      }
                    `}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <span className="text-xs">{step.shortLabel}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / (STEPS_CONFIG.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do passo atual */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {renderStep()}
      </div>
    </div>
  )
}
