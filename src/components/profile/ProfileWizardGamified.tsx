'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  ArrowRight,
  Check,
  Loader2,
  User,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Heart,
  Zap,
  Activity,
  ChevronLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProfile, STEP_ORDER } from '@/contexts/ProfileContext'
import { Gender, Goal } from '@/types/profile'
import { ProgressRing } from '@/components/gamification'

// Mapeamento de steps simplificado para o wizard gamificado
type GamifiedStep = 'nome' | 'peso' | 'altura' | 'idade' | 'genero' | 'objetivo' | 'meta_peso' | 'conclusao'

const GAMIFIED_STEPS: GamifiedStep[] = [
  'nome',
  'peso',
  'altura',
  'idade',
  'genero',
  'objetivo',
  'meta_peso',
  'conclusao'
]

interface GoalOption {
  value: Goal
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const goalOptions: GoalOption[] = [
  {
    value: 'perda_peso',
    label: 'Perder peso',
    description: 'Emagrecer de forma saudavel',
    icon: TrendingDown,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'ganho_massa',
    label: 'Ganhar massa',
    description: 'Aumentar massa muscular',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
  },
  {
    value: 'recomposicao_corporal',
    label: 'Recomposicao',
    description: 'Perder gordura e ganhar musculo',
    icon: RefreshCw,
    color: 'from-purple-500 to-pink-500',
  },
  {
    value: 'saude_geral',
    label: 'Saude geral',
    description: 'Melhorar habitos e bem-estar',
    icon: Heart,
    color: 'from-red-500 to-orange-500',
  },
  {
    value: 'manutencao',
    label: 'Manutencao',
    description: 'Manter peso atual',
    icon: Activity,
    color: 'from-gray-500 to-slate-500',
  },
]

const genderOptions = [
  { value: 'masculino', label: 'Masculino', emoji: '👨' },
  { value: 'feminino', label: 'Feminino', emoji: '👩' },
  { value: 'outro', label: 'Prefiro nao informar', emoji: '🙂' },
]

interface ProfileWizardGamifiedProps {
  onComplete?: () => void
}

export function ProfileWizardGamified({ onComplete }: ProfileWizardGamifiedProps) {
  const router = useRouter()
  const {
    state,
    updateBodyComposition,
    setName,
    setPrimaryGoal,
    setTargetWeight,
    completeOnboarding,
  } = useProfile()

  const { profile, isLoading } = state
  const [currentStep, setCurrentStep] = useState<GamifiedStep>('nome')
  const [isCompleting, setIsCompleting] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Inicializar valor do input quando muda o step
  useEffect(() => {
    setError('')
    switch (currentStep) {
      case 'nome':
        setInputValue(profile.name || '')
        break
      case 'peso':
        setInputValue(profile.bodyComposition?.currentWeight?.toString() || '')
        break
      case 'altura':
        setInputValue(profile.bodyComposition?.height?.toString() || '')
        break
      case 'idade':
        setInputValue(profile.bodyComposition?.age?.toString() || '')
        break
      case 'meta_peso':
        setInputValue(profile.targetWeight?.toString() || '')
        break
      default:
        setInputValue('')
    }
  }, [currentStep, profile])

  const currentIndex = GAMIFIED_STEPS.indexOf(currentStep)
  const progress = ((currentIndex + 1) / GAMIFIED_STEPS.length) * 100

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex < GAMIFIED_STEPS.length) {
      setDirection('forward')
      setCurrentStep(GAMIFIED_STEPS[nextIndex])
    }
  }, [currentIndex])

  const goToPrev = useCallback(() => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setDirection('backward')
      setCurrentStep(GAMIFIED_STEPS[prevIndex])
    }
  }, [currentIndex])

  const handleClose = useCallback(() => {
    router.push('/')
  }, [router])

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

  const validateAndProceed = useCallback(() => {
    setError('')

    switch (currentStep) {
      case 'nome':
        if (!inputValue || inputValue.trim().length < 2) {
          setError('Digite seu nome')
          return
        }
        setName(inputValue.trim())
        goToNext()
        break

      case 'peso':
        const peso = parseFloat(inputValue)
        if (!peso || peso < 20 || peso > 500) {
          setError('Digite um peso valido')
          return
        }
        updateBodyComposition({ currentWeight: peso })
        goToNext()
        break

      case 'altura':
        const altura = parseFloat(inputValue)
        if (!altura || altura < 50 || altura > 300) {
          setError('Digite uma altura valida')
          return
        }
        updateBodyComposition({ height: altura })
        goToNext()
        break

      case 'idade':
        const idade = parseInt(inputValue)
        if (!idade || idade < 10 || idade > 120) {
          setError('Digite uma idade valida')
          return
        }
        updateBodyComposition({ age: idade })
        goToNext()
        break

      case 'genero':
        if (!profile.bodyComposition?.gender) {
          setError('Selecione uma opcao')
          return
        }
        goToNext()
        break

      case 'objetivo':
        if (!profile.primaryGoal) {
          setError('Selecione um objetivo')
          return
        }
        // Se objetivo é perda ou ganho de peso, vai para meta_peso
        if (profile.primaryGoal === 'perda_peso' || profile.primaryGoal === 'ganho_massa') {
          goToNext()
        } else {
          // Pula para conclusão
          setDirection('forward')
          setCurrentStep('conclusao')
        }
        break

      case 'meta_peso':
        const metaPeso = parseFloat(inputValue)
        if (!metaPeso || metaPeso < 30 || metaPeso > 300) {
          setError('Digite um peso meta valido')
          return
        }
        setTargetWeight(metaPeso)
        goToNext()
        break
    }
  }, [currentStep, inputValue, profile, setName, updateBodyComposition, setPrimaryGoal, setTargetWeight, goToNext])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndProceed()
    }
  }, [validateAndProceed])

  const selectGender = useCallback((gender: Gender) => {
    updateBodyComposition({ gender })
  }, [updateBodyComposition])

  const selectGoal = useCallback((goal: Goal) => {
    setPrimaryGoal(goal)
  }, [setPrimaryGoal])

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    const animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'

    switch (currentStep) {
      case 'nome':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                <User className="w-10 h-10 text-primary-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Como podemos te chamar?
              </h1>
              <p className="text-gray-400 text-center">
                Digite seu nome ou apelido
              </p>
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Seu nome"
              autoFocus
              className="w-full py-4 px-6 text-xl text-center bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
            />

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'peso':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                <Scale className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual seu peso atual?
              </h1>
              <p className="text-gray-400 text-center">
                Em quilogramas (kg)
              </p>
            </div>

            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="70"
                autoFocus
                className="w-full py-4 px-6 text-xl text-center bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">kg</span>
            </div>

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'altura':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <span className="text-4xl">📏</span>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual sua altura?
              </h1>
              <p className="text-gray-400 text-center">
                Em centimetros (cm)
              </p>
            </div>

            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="170"
                autoFocus
                className="w-full py-4 px-6 text-xl text-center bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">cm</span>
            </div>

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'idade':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/30 to-yellow-500/30 flex items-center justify-center">
                <span className="text-4xl">🎂</span>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual sua idade?
              </h1>
              <p className="text-gray-400 text-center">
                Em anos
              </p>
            </div>

            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="30"
                autoFocus
                className="w-full py-4 px-6 text-xl text-center bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">anos</span>
            </div>

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'genero':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual seu genero?
              </h1>
              <p className="text-gray-400 text-center">
                Usado para calculos de metabolismo
              </p>
            </div>

            <div className="space-y-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => selectGender(option.value as Gender)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
                    profile.bodyComposition?.gender === option.value
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-lg font-medium text-white">{option.label}</span>
                  {profile.bodyComposition?.gender === option.value && (
                    <Check className="w-6 h-6 text-primary-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'objetivo':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                <Target className="w-10 h-10 text-primary-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual seu objetivo?
              </h1>
              <p className="text-gray-400 text-center">
                Escolha o que mais importa agora
              </p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {goalOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => selectGoal(option.value)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${
                      profile.primaryGoal === option.value
                        ? 'bg-primary-500/20 border-2 border-primary-500'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                    {profile.primaryGoal === option.value && (
                      <Check className="w-6 h-6 text-primary-400" />
                    )}
                  </button>
                )
              })}
            </div>

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'meta_peso':
        const weightDiff = profile.bodyComposition?.currentWeight && inputValue
          ? parseFloat(inputValue) - profile.bodyComposition.currentWeight
          : 0

        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                <TrendingDown className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Qual seu peso meta?
              </h1>
              <p className="text-gray-400 text-center">
                Peso atual: {profile.bodyComposition?.currentWeight} kg
              </p>
            </div>

            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="65"
                autoFocus
                className="w-full py-4 px-6 text-xl text-center bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">kg</span>
            </div>

            {weightDiff !== 0 && inputValue && (
              <p className={`text-center mt-3 font-medium ${weightDiff < 0 ? 'text-green-400' : 'text-blue-400'}`}>
                {weightDiff < 0 ? `Perder ${Math.abs(weightDiff).toFixed(1)} kg` : `Ganhar ${weightDiff.toFixed(1)} kg`}
              </p>
            )}

            {error && (
              <p className="text-red-400 text-center mt-3 animate-shake">{error}</p>
            )}
          </div>
        )

      case 'conclusao':
        return (
          <div className={`flex-1 flex flex-col justify-center px-6 ${animationClass}`}>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pop">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Tudo pronto!
              </h1>
              <p className="text-gray-400 mb-8">
                Seus dados foram salvos. Agora voce pode criar sua dieta personalizada.
              </p>

              {/* Resumo */}
              <div className="bg-gray-800/50 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nome</span>
                  <span className="text-white font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Peso atual</span>
                  <span className="text-white font-medium">{profile.bodyComposition?.currentWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Altura</span>
                  <span className="text-white font-medium">{profile.bodyComposition?.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objetivo</span>
                  <span className="text-white font-medium">
                    {goalOptions.find(g => g.value === profile.primaryGoal)?.label || '-'}
                  </span>
                </div>
                {profile.targetWeight && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meta de peso</span>
                    <span className="text-primary-400 font-medium">{profile.targetWeight} kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 safe-top">
        {currentIndex > 0 ? (
          <button
            onClick={goToPrev}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
        ) : (
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 text-sm"
          >
            Sair
          </button>
        )}

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="text-sm text-gray-500">
          {currentIndex + 1}/{GAMIFIED_STEPS.length}
        </span>
      </div>

      {/* Content */}
      {renderStep()}

      {/* Footer */}
      <div className="px-6 pb-8 safe-bottom">
        {currentStep === 'conclusao' ? (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Concluir
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={validateAndProceed}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
