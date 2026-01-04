'use client'

import {
  User,
  Scale,
  Target,
  Activity,
  Camera,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Heart,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { formatBMIClassification } from '@/utils/calculations'
import { Goal } from '@/types/profile'

const goalLabels: Record<Goal, { label: string; icon: typeof Target }> = {
  perda_peso: { label: 'Perda de Peso', icon: TrendingDown },
  ganho_massa: { label: 'Ganho de Massa', icon: TrendingUp },
  recomposicao_corporal: { label: 'Recomposição Corporal', icon: RefreshCw },
  saude_geral: { label: 'Saúde Geral', icon: Heart },
  performance_atletica: { label: 'Performance Atlética', icon: Zap },
  manutencao: { label: 'Manutenção', icon: Activity },
}

const dietQualityLabels: Record<string, string> = {
  muito_ruim: 'Muito ruim',
  ruim: 'Ruim',
  regular: 'Regular',
  boa: 'Boa',
  excelente: 'Excelente',
}

const sleepQualityLabels: Record<string, string> = {
  muito_ruim: 'Muito ruim',
  ruim: 'Ruim',
  regular: 'Regular',
  boa: 'Boa',
  excelente: 'Excelente',
}

export function SummaryStep() {
  const { state } = useProfile()
  const { profile } = state
  const bodyComp = profile.bodyComposition
  const diagnosis = profile.diagnosis
  const bmiInfo = profile.bmiInfo

  const goalInfo = profile.primaryGoal ? goalLabels[profile.primaryGoal] : null
  const GoalIcon = goalInfo?.icon || Target

  return (
    <div className="space-y-6">
      {/* Header de sucesso */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Perfil Completo!</h2>
        <p className="text-gray-400 mt-2">
          Revise suas informações antes de finalizar
        </p>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader
          title="Dados Pessoais"
          icon={<User className="w-5 h-5" />}
        />
        <CardContent>
          <div className="flex items-center gap-4">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto.url}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-white">
                {profile.name || 'Não informado'}
              </p>
              <p className="text-sm text-gray-400">
                {bodyComp?.age} anos • {bodyComp?.gender === 'masculino' ? 'Masculino' : bodyComp?.gender === 'feminino' ? 'Feminino' : 'Outro'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composição Corporal */}
      <Card>
        <CardHeader
          title="Composição Corporal"
          icon={<Scale className="w-5 h-5" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400">Peso</p>
              <p className="text-lg font-semibold text-white">
                {bodyComp?.currentWeight} kg
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400">Altura</p>
              <p className="text-lg font-semibold text-white">
                {bodyComp?.height} cm
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400">IMC</p>
              <p className="text-lg font-semibold text-white">
                {bmiInfo?.value || '-'}
              </p>
              {bmiInfo && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: bmiInfo.color }}
                >
                  {formatBMIClassification(bmiInfo.classification)}
                </p>
              )}
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-400">Metabolismo Basal</p>
              <p className="text-lg font-semibold text-white">
                {bodyComp?.basalMetabolism || '-'} kcal
              </p>
            </div>
            {bodyComp?.bodyFatPercentage && (
              <>
                <div className="p-3 bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-400">% Gordura</p>
                  <p className="text-lg font-semibold text-white">
                    {bodyComp.bodyFatPercentage}%
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-400">Massa Magra</p>
                  <p className="text-lg font-semibold text-white">
                    {bodyComp.leanMass} kg
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivo */}
      <Card>
        <CardHeader
          title="Objetivo"
          icon={<Target className="w-5 h-5" />}
        />
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <GoalIcon className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-white">{goalInfo?.label}</p>
              {profile.targetWeight && (
                <p className="text-sm text-gray-400">
                  Meta: {profile.targetWeight} kg
                </p>
              )}
            </div>
          </div>

          {profile.secondaryGoals && profile.secondaryGoals.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-400 mb-2">Objetivos secundários:</p>
              <div className="flex flex-wrap gap-2">
                {profile.secondaryGoals.map((goal) => (
                  <span
                    key={goal}
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                  >
                    {goalLabels[goal]?.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card>
        <CardHeader
          title="Diagnóstico"
          icon={<Activity className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Treina atualmente</span>
              <span className="text-white">
                {diagnosis?.currentlyTraining
                  ? `Sim, ${diagnosis.trainingFrequency}x/semana`
                  : 'Não'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Alimentação</span>
              <span className="text-white">
                {dietQualityLabels[diagnosis?.dietQuality || 'regular']}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Sono</span>
              <span className="text-white">
                {sleepQualityLabels[diagnosis?.sleepQuality || 'regular']}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Refeições/dia</span>
              <span className="text-white">{diagnosis?.mealsPerDay || 3}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fotos de Progresso */}
      {profile.progressPhotos && profile.progressPhotos.length > 0 && (
        <Card>
          <CardHeader
            title="Fotos de Progresso"
            icon={<Camera className="w-5 h-5" />}
          />
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {profile.progressPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="Foto de progresso"
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {profile.progressPhotos.length} foto(s) registrada(s)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Aviso */}
      <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl text-center">
        <p className="text-sm text-primary-300">
          Clique em <strong>Finalizar</strong> para salvar seu perfil e começar a usar o FitOS!
        </p>
      </div>
    </div>
  )
}
