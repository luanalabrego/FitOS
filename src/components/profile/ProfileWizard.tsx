'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2, Cloud, CloudOff } from 'lucide-react'
import { useProfile, STEP_ORDER } from '@/contexts/ProfileContext'
import { Button, ProgressSteps } from '@/components/ui'
import {
  BasicDataStep,
  BodyCompositionStep,
  GoalsStep,
  DiagnosisStep,
  PhotosStep,
  SummaryStep,
} from './steps'
import { ProfileStep } from '@/types/profile'

const stepInfo: Record<ProfileStep, { label: string; title: string; description: string }> = {
  dados_basicos: {
    label: 'Dados',
    title: 'Dados Básicos',
    description: 'Vamos começar com suas informações pessoais',
  },
  composicao_corporal: {
    label: 'Corpo',
    title: 'Composição Corporal',
    description: 'Entenda melhor sua composição física atual',
  },
  objetivos: {
    label: 'Objetivos',
    title: 'Seus Objetivos',
    description: 'O que você quer alcançar?',
  },
  diagnostico: {
    label: 'Diagnóstico',
    title: 'Diagnóstico',
    description: 'Conte-nos sobre seus hábitos atuais',
  },
  fotos: {
    label: 'Fotos',
    title: 'Fotos',
    description: 'Registre seu ponto de partida (opcional)',
  },
  resumo: {
    label: 'Resumo',
    title: 'Resumo',
    description: 'Revise suas informações',
  },
}

interface ProfileWizardProps {
  onComplete?: () => void
}

export function ProfileWizard({ onComplete }: ProfileWizardProps) {
  const {
    state,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    goToStep,
    completeOnboarding,
    setErrors,
  } = useProfile()

  const [isCompleting, setIsCompleting] = useState(false)

  const { currentStep, completedSteps, profile, isLoading, isSaving, lastSaved, saveError } = state

  const steps = useMemo(
    () =>
      STEP_ORDER.map((id) => ({
        id,
        label: stepInfo[id].label,
      })),
    []
  )

  const currentStepInfo = stepInfo[currentStep]

  // Validação do step atual
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 'dados_basicos') {
      if (!profile.name || profile.name.trim().length < 2) {
        newErrors.name = 'Nome é obrigatório'
      }
      if (!profile.bodyComposition?.currentWeight || profile.bodyComposition.currentWeight < 20) {
        newErrors.currentWeight = 'Peso é obrigatório'
      }
      if (!profile.bodyComposition?.height || profile.bodyComposition.height < 50) {
        newErrors.height = 'Altura é obrigatória'
      }
      if (!profile.bodyComposition?.age || profile.bodyComposition.age < 10) {
        newErrors.age = 'Idade é obrigatória'
      }
      if (!profile.bodyComposition?.gender) {
        newErrors.gender = 'Gênero é obrigatório'
      }
    }

    if (currentStep === 'objetivos') {
      if (!profile.primaryGoal) {
        newErrors.primaryGoal = 'Selecione um objetivo principal'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentStep, profile, setErrors])

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }, [validateCurrentStep, nextStep])

  const handlePrev = useCallback(() => {
    prevStep()
  }, [prevStep])

  const handleComplete = useCallback(async () => {
    setIsCompleting(true)
    try {
      await completeOnboarding()
      onComplete?.()
    } catch (error) {
      console.error('Erro ao finalizar:', error)
    } finally {
      setIsCompleting(false)
    }
  }, [completeOnboarding, onComplete])

  const handleStepClick = useCallback(
    (stepId: string) => {
      const stepIndex = STEP_ORDER.indexOf(stepId as ProfileStep)
      const currentIndex = STEP_ORDER.indexOf(currentStep)

      // Só permite ir para steps anteriores ou já completados
      if (stepIndex < currentIndex || completedSteps.includes(stepId as ProfileStep)) {
        goToStep(stepId as ProfileStep)
      }
    },
    [currentStep, completedSteps, goToStep]
  )

  // Renderizar o step atual
  const renderStep = () => {
    switch (currentStep) {
      case 'dados_basicos':
        return <BasicDataStep />
      case 'composicao_corporal':
        return <BodyCompositionStep />
      case 'objetivos':
        return <GoalsStep />
      case 'diagnostico':
        return <DiagnosisStep />
      case 'fotos':
        return <PhotosStep />
      case 'resumo':
        return <SummaryStep />
      default:
        return null
    }
  }

  const isLastStep = currentStep === 'resumo'

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando seu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header com progresso */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ProgressSteps
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Título do step */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{currentStepInfo.title}</h1>
          <p className="text-gray-400 mt-1">{currentStepInfo.description}</p>
        </div>

        {/* Step atual */}
        <div className="animate-fade-in">{renderStep()}</div>
      </div>

      {/* Footer com navegação */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
        {/* Indicador de salvamento */}
        <div className="max-w-2xl mx-auto px-4 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />
                <span className="text-gray-400">Salvando...</span>
              </>
            ) : saveError ? (
              <>
                <CloudOff className="w-3 h-3 text-yellow-500" />
                <span className="text-yellow-500">{saveError}</span>
              </>
            ) : lastSaved ? (
              <>
                <Cloud className="w-3 h-3 text-primary-500" />
                <span className="text-gray-500">
                  Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {canGoPrev() ? (
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={handlePrev}
              disabled={isCompleting}
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <Button
              variant="primary"
              icon={isCompleting ? undefined : Check}
              iconPosition="right"
              onClick={handleComplete}
              loading={isCompleting}
              disabled={isCompleting}
            >
              {isCompleting ? 'Salvando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleNext}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
