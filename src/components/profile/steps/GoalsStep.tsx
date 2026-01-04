'use client'

import { useCallback } from 'react'
import {
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { Input, Card, CardHeader, CardContent, Checkbox } from '@/components/ui'
import { Goal } from '@/types/profile'
import { calculateHealthyWeightRange } from '@/utils/calculations'
import { LucideIcon } from 'lucide-react'

interface GoalOption {
  value: Goal
  label: string
  description: string
  icon: LucideIcon
  color: string
}

const goalOptions: GoalOption[] = [
  {
    value: 'perda_peso',
    label: 'Perda de Peso',
    description: 'Reduzir gordura corporal de forma saudável e sustentável',
    icon: TrendingDown,
    color: 'text-blue-400 bg-blue-500/20',
  },
  {
    value: 'ganho_massa',
    label: 'Ganho de Massa Muscular',
    description: 'Aumentar massa muscular com treino e alimentação adequada',
    icon: TrendingUp,
    color: 'text-green-400 bg-green-500/20',
  },
  {
    value: 'recomposicao_corporal',
    label: 'Recomposição Corporal',
    description: 'Perder gordura e ganhar músculo simultaneamente',
    icon: RefreshCw,
    color: 'text-purple-400 bg-purple-500/20',
  },
  {
    value: 'saude_geral',
    label: 'Melhorar Saúde Geral',
    description: 'Foco em hábitos saudáveis, energia e bem-estar',
    icon: Heart,
    color: 'text-red-400 bg-red-500/20',
  },
  {
    value: 'performance_atletica',
    label: 'Performance Atlética',
    description: 'Melhorar desempenho em esportes e atividades físicas',
    icon: Zap,
    color: 'text-yellow-400 bg-yellow-500/20',
  },
  {
    value: 'manutencao',
    label: 'Manutenção',
    description: 'Manter o peso e forma física atual',
    icon: Activity,
    color: 'text-gray-400 bg-gray-500/20',
  },
]

export function GoalsStep() {
  const { state, setPrimaryGoal, setSecondaryGoals, setTargetWeight } = useProfile()
  const { profile } = state
  const bodyComp = profile.bodyComposition

  // Calcular faixa de peso saudável
  const healthyRange = bodyComp?.height
    ? calculateHealthyWeightRange(bodyComp.height)
    : null

  const handlePrimaryGoalChange = useCallback(
    (goal: Goal) => {
      setPrimaryGoal(goal)
      // Remover do secondary se estava lá
      if (profile.secondaryGoals?.includes(goal)) {
        setSecondaryGoals(profile.secondaryGoals.filter((g) => g !== goal))
      }
    },
    [setPrimaryGoal, setSecondaryGoals, profile.secondaryGoals]
  )

  const handleSecondaryGoalToggle = useCallback(
    (goal: Goal) => {
      const current = profile.secondaryGoals || []
      if (current.includes(goal)) {
        setSecondaryGoals(current.filter((g) => g !== goal))
      } else {
        setSecondaryGoals([...current, goal])
      }
    },
    [setSecondaryGoals, profile.secondaryGoals]
  )

  const handleTargetWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      setTargetWeight(value)
    },
    [setTargetWeight]
  )

  return (
    <div className="space-y-6">
      {/* Objetivo Principal */}
      <Card>
        <CardHeader
          title="Objetivo Principal"
          description="Escolha seu foco principal no momento"
          icon={<Target className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-3">
            {goalOptions.map((option) => {
              const Icon = option.icon
              const isSelected = profile.primaryGoal === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePrimaryGoalChange(option.value)}
                  className={`
                    w-full flex items-start gap-4 p-4
                    rounded-xl border-2 transition-all duration-200
                    text-left
                    ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`p-2.5 rounded-xl ${option.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{option.label}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-primary-500' : 'border-gray-600'}
                    `}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meta de Peso */}
      {(profile.primaryGoal === 'perda_peso' ||
        profile.primaryGoal === 'ganho_massa') && (
        <Card>
          <CardHeader
            title="Meta de Peso"
            description="Defina um peso objetivo realista"
          />
          <CardContent>
            <Input
              label="Peso Desejado"
              type="number"
              placeholder="65"
              suffix="kg"
              value={profile.targetWeight || ''}
              onChange={handleTargetWeightChange}
              min={30}
              max={300}
              step={0.5}
            />

            {healthyRange && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">
                  Faixa de peso saudável para sua altura:
                  <span className="text-primary-400 font-semibold ml-2">
                    {healthyRange.min} - {healthyRange.max} kg
                  </span>
                </p>
              </div>
            )}

            {profile.targetWeight && bodyComp?.currentWeight && (
              <div className="mt-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                <p className="text-sm text-primary-300">
                  {profile.targetWeight < bodyComp.currentWeight
                    ? `Você precisa perder ${(bodyComp.currentWeight - profile.targetWeight).toFixed(1)} kg`
                    : profile.targetWeight > bodyComp.currentWeight
                    ? `Você precisa ganhar ${(profile.targetWeight - bodyComp.currentWeight).toFixed(1)} kg`
                    : 'Você já está no seu peso desejado!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objetivos Secundários */}
      <Card>
        <CardHeader
          title="Objetivos Secundários"
          description="Selecione outros objetivos que também são importantes para você (opcional)"
        />
        <CardContent>
          <div className="space-y-2">
            {goalOptions
              .filter((option) => option.value !== profile.primaryGoal)
              .map((option) => {
                const Icon = option.icon
                const isSelected = profile.secondaryGoals?.includes(option.value)

                return (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    checked={isSelected}
                    onChange={() => handleSecondaryGoalToggle(option.value)}
                  />
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Dica */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-300">
          <strong>Dica:</strong> É melhor focar em um objetivo principal por vez.
          Objetivos conflitantes (como perder peso e ganhar massa simultaneamente)
          são mais difíceis de alcançar. A recomposição corporal é possível, mas
          requer mais tempo e precisão.
        </p>
      </div>
    </div>
  )
}
