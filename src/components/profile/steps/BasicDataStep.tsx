'use client'

import { useCallback, useEffect } from 'react'
import { User, Ruler, Scale, Calendar } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { Input, Select, RadioGroup, Card, CardHeader, CardContent } from '@/components/ui'
import { Gender } from '@/types/profile'

const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro / Prefiro não informar' },
]

export function BasicDataStep() {
  const { state, updateBodyComposition, setName, setErrors, clearErrors } = useProfile()
  const { profile, errors } = state
  const bodyComp = profile.bodyComposition

  const validateField = useCallback(
    (field: string, value: number | string | undefined) => {
      const newErrors = { ...errors }

      switch (field) {
        case 'name':
          if (!value || (typeof value === 'string' && value.trim().length < 2)) {
            newErrors.name = 'Nome é obrigatório'
          } else {
            delete newErrors.name
          }
          break
        case 'currentWeight':
          if (!value || (typeof value === 'number' && value < 20)) {
            newErrors.currentWeight = 'Peso inválido'
          } else if (typeof value === 'number' && value > 500) {
            newErrors.currentWeight = 'Peso inválido'
          } else {
            delete newErrors.currentWeight
          }
          break
        case 'height':
          if (!value || (typeof value === 'number' && value < 50)) {
            newErrors.height = 'Altura inválida'
          } else if (typeof value === 'number' && value > 300) {
            newErrors.height = 'Altura inválida'
          } else {
            delete newErrors.height
          }
          break
        case 'age':
          if (!value || (typeof value === 'number' && value < 10)) {
            newErrors.age = 'Idade inválida'
          } else if (typeof value === 'number' && value > 120) {
            newErrors.age = 'Idade inválida'
          } else {
            delete newErrors.age
          }
          break
      }

      setErrors(newErrors)
    },
    [errors, setErrors]
  )

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setName(value)
      validateField('name', value)
    },
    [setName, validateField]
  )

  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      updateBodyComposition({ currentWeight: value })
      validateField('currentWeight', value)
    },
    [updateBodyComposition, validateField]
  )

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      updateBodyComposition({ height: value })
      validateField('height', value)
    },
    [updateBodyComposition, validateField]
  )

  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      updateBodyComposition({ age: value })
      validateField('age', value)
    },
    [updateBodyComposition, validateField]
  )

  const handleGenderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBodyComposition({ gender: e.target.value as Gender })
    },
    [updateBodyComposition]
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Dados Pessoais"
          description="Informações básicas para personalizar sua experiência"
          icon={<User className="w-5 h-5" />}
        />
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Nome"
              placeholder="Seu nome"
              value={profile.name || ''}
              onChange={handleNameChange}
              error={errors.name}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Medidas Corporais"
          description="Dados obrigatórios para cálculos de saúde"
          icon={<Scale className="w-5 h-5" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Peso Atual"
              type="number"
              placeholder="70"
              suffix="kg"
              value={bodyComp?.currentWeight || ''}
              onChange={handleWeightChange}
              error={errors.currentWeight}
              required
              min={20}
              max={500}
              step={0.1}
            />

            <Input
              label="Altura"
              type="number"
              placeholder="170"
              suffix="cm"
              value={bodyComp?.height || ''}
              onChange={handleHeightChange}
              error={errors.height}
              required
              min={50}
              max={300}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Idade"
              type="number"
              placeholder="30"
              suffix="anos"
              value={bodyComp?.age || ''}
              onChange={handleAgeChange}
              error={errors.age}
              required
              min={10}
              max={120}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Gênero"
          description="Usado para cálculos de metabolismo e composição corporal"
        />
        <CardContent>
          <RadioGroup
            label=""
            name="gender"
            options={genderOptions}
            value={bodyComp?.gender || ''}
            onChange={handleGenderChange}
            required
          />
        </CardContent>
      </Card>

      <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
        <p className="text-sm text-primary-400">
          <strong>Campos com * são obrigatórios.</strong> Esses dados são
          essenciais para calcular seu IMC, metabolismo basal e outras métricas
          importantes para seu acompanhamento.
        </p>
      </div>
    </div>
  )
}
