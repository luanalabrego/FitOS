'use client'

import { useCallback } from 'react'
import {
  Dumbbell,
  Utensils,
  Moon,
  Droplets,
  AlertCircle,
  Cigarette,
  Wine,
  Stethoscope,
  History,
  Brain,
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import {
  Select,
  RadioGroup,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  Slider,
} from '@/components/ui'
import {
  DietQuality,
  SleepQuality,
  WaterIntake,
  TrainingFrequency,
} from '@/types/profile'

const trainingTypeOptions = [
  { value: 'musculacao', label: 'Musculação' },
  { value: 'cardio', label: 'Cardio (corrida, bike, etc.)' },
  { value: 'funcional', label: 'Treino Funcional' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'natacao', label: 'Natação' },
  { value: 'luta', label: 'Artes Marciais / Luta' },
  { value: 'yoga', label: 'Yoga / Pilates' },
  { value: 'outro', label: 'Outro' },
]

const dietQualityOptions = [
  { value: 'muito_ruim', label: 'Muito ruim', description: 'Fast food frequente, sem controle' },
  { value: 'ruim', label: 'Ruim', description: 'Alimentação irregular, pouca variedade' },
  { value: 'regular', label: 'Regular', description: 'Tenta comer bem mas sem consistência' },
  { value: 'boa', label: 'Boa', description: 'Alimentação balanceada na maioria dos dias' },
  { value: 'excelente', label: 'Excelente', description: 'Alimentação controlada e planejada' },
]

const sleepQualityOptions = [
  { value: 'muito_ruim', label: 'Muito ruim', description: 'Menos de 5h ou muito irregular' },
  { value: 'ruim', label: 'Ruim', description: '5-6h ou qualidade ruim' },
  { value: 'regular', label: 'Regular', description: '6-7h' },
  { value: 'boa', label: 'Boa', description: '7-8h com boa qualidade' },
  { value: 'excelente', label: 'Excelente', description: '8h+ com ótima qualidade' },
]

const waterIntakeOptions = [
  { value: 'muito_baixo', label: 'Muito baixo (< 1L/dia)' },
  { value: 'baixo', label: 'Baixo (1-1.5L/dia)' },
  { value: 'moderado', label: 'Moderado (1.5-2L/dia)' },
  { value: 'adequado', label: 'Adequado (2-3L/dia)' },
  { value: 'alto', label: 'Alto (3L+/dia)' },
]

const stressLevelOptions = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'alto', label: 'Alto' },
  { value: 'muito_alto', label: 'Muito alto' },
]

const experienceOptions = [
  { value: 'iniciante', label: 'Iniciante', description: 'Menos de 1 ano de treino' },
  { value: 'intermediario', label: 'Intermediário', description: '1-3 anos de treino' },
  { value: 'avancado', label: 'Avançado', description: 'Mais de 3 anos de treino consistente' },
]

export function DiagnosisStep() {
  const { state, updateDiagnosis } = useProfile()
  const { profile } = state
  const diagnosis = profile.diagnosis

  const handleTrainingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ currentlyTraining: e.target.checked })
    },
    [updateDiagnosis]
  )

  const handleFrequencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ trainingFrequency: parseInt(e.target.value) as TrainingFrequency })
    },
    [updateDiagnosis]
  )

  const handleTrainingTypeToggle = useCallback(
    (type: string) => {
      const current = diagnosis?.trainingTypes || []
      if (current.includes(type)) {
        updateDiagnosis({ trainingTypes: current.filter((t) => t !== type) })
      } else {
        updateDiagnosis({ trainingTypes: [...current, type] })
      }
    },
    [updateDiagnosis, diagnosis?.trainingTypes]
  )

  const handleDietQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ dietQuality: e.target.value as DietQuality })
    },
    [updateDiagnosis]
  )

  const handleMealsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ mealsPerDay: parseInt(e.target.value) })
    },
    [updateDiagnosis]
  )

  const handleSleepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ sleepQuality: e.target.value as SleepQuality })
    },
    [updateDiagnosis]
  )

  const handleWaterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateDiagnosis({ waterIntake: e.target.value as WaterIntake })
    },
    [updateDiagnosis]
  )

  const handleStressChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateDiagnosis({
        stressLevel: e.target.value as 'baixo' | 'moderado' | 'alto' | 'muito_alto',
      })
    },
    [updateDiagnosis]
  )

  const handleSmokingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateDiagnosis({
        smokingStatus: e.target.value as 'nunca' | 'ex_fumante' | 'fumante',
      })
    },
    [updateDiagnosis]
  )

  const handleAlcoholChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateDiagnosis({
        alcoholConsumption: e.target.value as
          | 'nunca'
          | 'raramente'
          | 'socialmente'
          | 'frequente',
      })
    },
    [updateDiagnosis]
  )

  const handleExperienceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({
        trainingExperience: e.target.value as 'iniciante' | 'intermediario' | 'avancado',
      })
    },
    [updateDiagnosis]
  )

  const handleChronicConditionsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ hasChronicConditions: e.target.checked })
    },
    [updateDiagnosis]
  )

  const handlePreviousAttemptsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDiagnosis({ previousWeightLossAttempts: e.target.checked })
    },
    [updateDiagnosis]
  )

  return (
    <div className="space-y-6">
      {/* Treino */}
      <Card>
        <CardHeader
          title="Atividade Física"
          description="Conte-nos sobre sua rotina de exercícios"
          icon={<Dumbbell className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-4">
            <Checkbox
              label="Pratico exercícios físicos atualmente"
              checked={diagnosis?.currentlyTraining || false}
              onChange={handleTrainingChange}
            />

            {diagnosis?.currentlyTraining && (
              <>
                <Slider
                  label="Frequência de treino"
                  min={1}
                  max={7}
                  value={diagnosis?.trainingFrequency || 3}
                  onChange={handleFrequencyChange}
                  valueFormat={(v) => `${v}x por semana`}
                  marks={[
                    { value: 1, label: '1x' },
                    { value: 3, label: '3x' },
                    { value: 5, label: '5x' },
                    { value: 7, label: '7x' },
                  ]}
                />

                <div>
                  <p className="text-sm font-medium text-gray-200 mb-3">
                    Tipos de treino que pratica
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {trainingTypeOptions.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={diagnosis?.trainingTypes?.includes(option.value)}
                        onChange={() => handleTrainingTypeToggle(option.value)}
                      />
                    ))}
                  </div>
                </div>

                <RadioGroup
                  label="Nível de experiência"
                  name="experience"
                  options={experienceOptions}
                  value={diagnosis?.trainingExperience || ''}
                  onChange={handleExperienceChange}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alimentação */}
      <Card>
        <CardHeader
          title="Alimentação"
          description="Como você avalia sua alimentação atual"
          icon={<Utensils className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-4">
            <RadioGroup
              label="Qualidade da alimentação"
              name="dietQuality"
              options={dietQualityOptions}
              value={diagnosis?.dietQuality || 'regular'}
              onChange={handleDietQualityChange}
            />

            <Slider
              label="Refeições por dia"
              min={1}
              max={8}
              value={diagnosis?.mealsPerDay || 3}
              onChange={handleMealsChange}
              valueFormat={(v) => `${v} refeições`}
            />

            <div className="grid grid-cols-2 gap-2">
              <Checkbox
                label="Acompanho com nutricionista"
                checked={diagnosis?.hasNutritionist || false}
                onChange={(e) =>
                  updateDiagnosis({ hasNutritionist: e.target.checked })
                }
              />
              <Checkbox
                label="Sigo uma dieta específica"
                checked={diagnosis?.followsDiet || false}
                onChange={(e) =>
                  updateDiagnosis({ followsDiet: e.target.checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sono e Hidratação */}
      <Card>
        <CardHeader
          title="Sono e Hidratação"
          description="Fatores essenciais para resultados"
          icon={<Moon className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-4">
            <RadioGroup
              label="Qualidade do sono"
              name="sleepQuality"
              options={sleepQualityOptions}
              value={diagnosis?.sleepQuality || 'regular'}
              onChange={handleSleepChange}
            />

            <Select
              label="Consumo de água"
              options={waterIntakeOptions}
              value={diagnosis?.waterIntake || 'moderado'}
              onChange={handleWaterChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estilo de Vida */}
      <Card>
        <CardHeader
          title="Estilo de Vida"
          description="Outros fatores que influenciam sua saúde"
          icon={<Brain className="w-5 h-5" />}
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Nível de estresse"
              options={stressLevelOptions}
              value={diagnosis?.stressLevel || 'moderado'}
              onChange={handleStressChange}
            />

            <Select
              label="Tabagismo"
              options={[
                { value: 'nunca', label: 'Nunca fumei' },
                { value: 'ex_fumante', label: 'Ex-fumante' },
                { value: 'fumante', label: 'Fumante' },
              ]}
              value={diagnosis?.smokingStatus || 'nunca'}
              onChange={handleSmokingChange}
            />

            <Select
              label="Consumo de álcool"
              options={[
                { value: 'nunca', label: 'Nunca' },
                { value: 'raramente', label: 'Raramente' },
                { value: 'socialmente', label: 'Socialmente' },
                { value: 'frequente', label: 'Frequentemente' },
              ]}
              value={diagnosis?.alcoholConsumption || 'raramente'}
              onChange={handleAlcoholChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader
          title="Histórico de Saúde"
          description="Informações importantes para personalizar suas recomendações"
          icon={<Stethoscope className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-3">
            <Checkbox
              label="Tenho condições crônicas de saúde"
              description="Diabetes, hipertensão, problemas cardíacos, etc."
              checked={diagnosis?.hasChronicConditions || false}
              onChange={handleChronicConditionsChange}
            />

            <Checkbox
              label="Tomo medicamentos regularmente"
              checked={diagnosis?.takesMedication || false}
              onChange={(e) =>
                updateDiagnosis({ takesMedication: e.target.checked })
              }
            />

            <Checkbox
              label="Tenho lesões ou limitações físicas"
              checked={diagnosis?.hasInjuries || false}
              onChange={(e) =>
                updateDiagnosis({ hasInjuries: e.target.checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader
          title="Histórico"
          description="Tentativas anteriores e desafios"
          icon={<History className="w-5 h-5" />}
        />
        <CardContent>
          <Checkbox
            label="Já tentei perder peso/mudar hábitos antes"
            description="Dietas, programas de exercício, tratamentos, etc."
            checked={diagnosis?.previousWeightLossAttempts || false}
            onChange={handlePreviousAttemptsChange}
          />
        </CardContent>
      </Card>

      {/* Aviso de Saúde */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Importante</p>
            <p className="text-sm text-yellow-200/70 mt-1">
              As informações fornecidas são para personalização do app e não
              substituem acompanhamento médico. Consulte um profissional de
              saúde antes de iniciar qualquer programa de exercícios ou dieta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
