'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, Calculator, Scale, Info, Zap } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import {
  Input,
  RadioGroup,
  Card,
  CardHeader,
  CardContent,
  Button,
} from '@/components/ui'
import { formatBMIClassification, getBMIRanges } from '@/utils/calculations'

const inputMethodOptions = [
  {
    value: 'formula',
    label: 'Calcular automaticamente',
    description: 'Usaremos fórmulas científicas para estimar seus dados',
  },
  {
    value: 'manual',
    label: 'Preencher manualmente',
    description: 'Se você já sabe seus valores (ex: de exame ou balança)',
  },
  {
    value: 'bioimpedancia',
    label: 'Tenho dados de bioimpedância',
    description: 'Ideal para dados mais precisos de uma balança de bioimpedância',
  },
]

export function BodyCompositionStep() {
  const { state, updateBodyComposition, calculateMetrics } = useProfile()
  const { profile } = state
  const bodyComp = profile.bodyComposition
  const bmiInfo = profile.bmiInfo

  const [showOptionalFields, setShowOptionalFields] = useState(
    bodyComp?.inputMethod !== 'formula'
  )

  // Calcular métricas quando os dados básicos estiverem completos
  useEffect(() => {
    if (bodyComp?.currentWeight && bodyComp?.height && bodyComp?.age && bodyComp?.gender) {
      calculateMetrics()
    }
  }, [
    bodyComp?.currentWeight,
    bodyComp?.height,
    bodyComp?.age,
    bodyComp?.gender,
    bodyComp?.inputMethod,
    calculateMetrics,
  ])

  const handleInputMethodChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const method = e.target.value as 'formula' | 'manual' | 'bioimpedancia'
      updateBodyComposition({ inputMethod: method })
      setShowOptionalFields(method !== 'formula')
    },
    [updateBodyComposition]
  )

  const handleFieldChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || undefined
      updateBodyComposition({ [field]: value })
    },
    [updateBodyComposition]
  )

  const bmiRanges = getBMIRanges()

  return (
    <div className="space-y-6">
      {/* IMC Card - Sempre visível após cálculo */}
      {bmiInfo && (
        <Card className="overflow-hidden">
          <div
            className="h-2"
            style={{ backgroundColor: bmiInfo.color }}
          />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Seu IMC</p>
                <p className="text-3xl font-bold text-white">
                  {bmiInfo.value}
                  <span className="text-lg font-normal text-gray-400 ml-2">
                    kg/m²
                  </span>
                </p>
              </div>
              <div
                className="px-4 py-2 rounded-xl font-semibold"
                style={{
                  backgroundColor: `${bmiInfo.color}20`,
                  color: bmiInfo.color,
                }}
              >
                {formatBMIClassification(bmiInfo.classification)}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">{bmiInfo.description}</p>

            {/* Barra visual do IMC */}
            <div className="relative h-4 rounded-full overflow-hidden bg-gray-700">
              <div className="flex h-full">
                {bmiRanges.slice(0, 6).map((range, index) => (
                  <div
                    key={range.label}
                    className="h-full"
                    style={{
                      backgroundColor: range.color,
                      width: `${100 / 6}%`,
                    }}
                  />
                ))}
              </div>
              {/* Indicador */}
              <div
                className="absolute top-0 w-1 h-full bg-white shadow-lg"
                style={{
                  left: `${Math.min(Math.max((bmiInfo.value / 45) * 100, 2), 98)}%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Método de preenchimento */}
      <Card>
        <CardHeader
          title="Composição Corporal"
          description="Escolha como deseja preencher seus dados"
          icon={<Scale className="w-5 h-5" />}
        />
        <CardContent>
          <RadioGroup
            label=""
            name="inputMethod"
            options={inputMethodOptions}
            value={bodyComp?.inputMethod || 'formula'}
            onChange={handleInputMethodChange}
          />
        </CardContent>
      </Card>

      {/* Dados calculados automaticamente */}
      {bodyComp?.inputMethod === 'formula' && bmiInfo && (
        <Card>
          <CardHeader
            title="Dados Calculados"
            description="Baseado nas suas informações básicas"
            icon={<Calculator className="w-5 h-5" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">Metabolismo Basal</p>
                <p className="text-xl font-semibold text-white">
                  {bodyComp?.basalMetabolism || '-'}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    kcal/dia
                  </span>
                </p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">% Gordura (estimado)</p>
                <p className="text-xl font-semibold text-white">
                  {bodyComp?.bodyFatPercentage || '-'}
                  <span className="text-sm font-normal text-gray-400 ml-1">%</span>
                </p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">Massa Gorda</p>
                <p className="text-xl font-semibold text-white">
                  {bodyComp?.fatMass || '-'}
                  <span className="text-sm font-normal text-gray-400 ml-1">kg</span>
                </p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">Massa Magra</p>
                <p className="text-xl font-semibold text-white">
                  {bodyComp?.leanMass || '-'}
                  <span className="text-sm font-normal text-gray-400 ml-1">kg</span>
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-300">
                  Estes valores são estimativas baseadas em fórmulas científicas.
                  Para dados mais precisos, recomendamos usar uma balança de
                  bioimpedância ou realizar exames específicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos manuais / bioimpedância */}
      {(bodyComp?.inputMethod === 'manual' ||
        bodyComp?.inputMethod === 'bioimpedancia') && (
        <Card>
          <CardHeader
            title={
              bodyComp?.inputMethod === 'bioimpedancia'
                ? 'Dados da Bioimpedância'
                : 'Dados Manuais'
            }
            description={
              bodyComp?.inputMethod === 'bioimpedancia'
                ? 'Insira os dados da sua balança de bioimpedância'
                : 'Preencha os campos abaixo com seus dados'
            }
            icon={<Activity className="w-5 h-5" />}
          />
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="% Gordura Corporal"
                  type="number"
                  placeholder="20"
                  suffix="%"
                  value={bodyComp?.bodyFatPercentage || ''}
                  onChange={handleFieldChange('bodyFatPercentage')}
                  min={1}
                  max={70}
                  step={0.1}
                />

                <Input
                  label="Metabolismo Basal"
                  type="number"
                  placeholder="1800"
                  suffix="kcal"
                  value={bodyComp?.basalMetabolism || ''}
                  onChange={handleFieldChange('basalMetabolism')}
                  min={500}
                  max={5000}
                />
              </div>

              {bodyComp?.inputMethod === 'bioimpedancia' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Massa Muscular"
                      type="number"
                      placeholder="30"
                      suffix="kg"
                      value={bodyComp?.muscleMass || ''}
                      onChange={handleFieldChange('muscleMass')}
                      min={10}
                      max={100}
                      step={0.1}
                    />

                    <Input
                      label="Gordura Visceral"
                      type="number"
                      placeholder="8"
                      suffix="nível"
                      value={bodyComp?.visceralFat || ''}
                      onChange={handleFieldChange('visceralFat')}
                      hint="Geralmente de 1 a 30"
                      min={1}
                      max={30}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Massa Óssea"
                      type="number"
                      placeholder="3"
                      suffix="kg"
                      value={bodyComp?.boneMass || ''}
                      onChange={handleFieldChange('boneMass')}
                      min={1}
                      max={10}
                      step={0.1}
                    />

                    <Input
                      label="% Água Corporal"
                      type="number"
                      placeholder="55"
                      suffix="%"
                      value={bodyComp?.bodyWater || ''}
                      onChange={handleFieldChange('bodyWater')}
                      min={30}
                      max={80}
                      step={0.1}
                    />
                  </div>

                  <Input
                    label="Idade Metabólica"
                    type="number"
                    placeholder="28"
                    suffix="anos"
                    value={bodyComp?.metabolicAge || ''}
                    onChange={handleFieldChange('metabolicAge')}
                    min={10}
                    max={120}
                  />
                </>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-200 mb-3">
                  Medidas Antropométricas (opcional)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Circunf. Abdominal"
                    type="number"
                    placeholder="85"
                    suffix="cm"
                    value={bodyComp?.waistCircumference || ''}
                    onChange={handleFieldChange('waistCircumference')}
                    hint="Medida na altura do umbigo"
                    min={40}
                    max={200}
                  />

                  <Input
                    label="Circunf. Quadril"
                    type="number"
                    placeholder="95"
                    suffix="cm"
                    value={bodyComp?.hipCircumference || ''}
                    onChange={handleFieldChange('hipCircumference')}
                    hint="Parte mais larga do quadril"
                    min={50}
                    max={200}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendação de bioimpedância */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-300">
              Recomendação: Balança de Bioimpedância
            </p>
            <p className="text-sm text-orange-200/70 mt-1">
              Para dados mais precisos de composição corporal, recomendamos usar
              uma balança de bioimpedância. Ela fornece medidas de gordura
              corporal, massa muscular, água corporal e outros indicadores
              importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
