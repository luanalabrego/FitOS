import {
  Gender,
  ActivityLevel,
  BMIClassification,
  BMIClassificationElderly,
  BMIInfo,
} from '@/types/profile'

/**
 * Calcula o Índice de Massa Corporal (IMC)
 * Fórmula: peso (kg) / altura² (m²)
 */
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Number((weight / (heightM * heightM)).toFixed(1))
}

/**
 * Classifica o IMC de acordo com a OMS (adultos < 60 anos)
 */
export function classifyBMI(bmi: number): BMIClassification {
  if (bmi < 18.5) return 'abaixo_peso'
  if (bmi < 25) return 'peso_normal'
  if (bmi < 30) return 'sobrepeso'
  if (bmi < 35) return 'obesidade_grau_1'
  if (bmi < 40) return 'obesidade_grau_2'
  if (bmi < 50) return 'obesidade_grau_3'
  if (bmi < 60) return 'super_obesidade'
  return 'super_super_obesidade'
}

/**
 * Classifica o IMC para idosos (>= 60 anos)
 */
export function classifyBMIElderly(bmi: number): BMIClassificationElderly {
  if (bmi < 22) return 'abaixo_peso'
  if (bmi <= 27) return 'peso_normal'
  return 'sobrepeso'
}

/**
 * Retorna informações completas sobre o IMC
 */
export function getBMIInfo(bmi: number, age: number): BMIInfo {
  const isElderly = age >= 60
  const classification = classifyBMI(bmi)
  const classificationElderly = isElderly ? classifyBMIElderly(bmi) : undefined

  const descriptions: Record<BMIClassification, string> = {
    abaixo_peso: 'Abaixo do peso ideal. Recomenda-se acompanhamento nutricional.',
    peso_normal: 'Peso dentro da faixa saudável. Continue mantendo bons hábitos!',
    sobrepeso: 'Acima do peso ideal. Pequenas mudanças podem fazer grande diferença.',
    obesidade_grau_1: 'Obesidade Grau I. Recomenda-se acompanhamento profissional.',
    obesidade_grau_2: 'Obesidade Grau II. Acompanhamento médico é importante.',
    obesidade_grau_3: 'Obesidade Grau III (Mórbida). Procure acompanhamento médico especializado.',
    super_obesidade: 'Super Obesidade (Grau IV). Acompanhamento médico multidisciplinar é essencial.',
    super_super_obesidade: 'Super Super Obesidade (Grau V). Tratamento médico especializado urgente.',
  }

  const healthRisks: Record<BMIClassification, BMIInfo['healthRisk']> = {
    abaixo_peso: 'moderado',
    peso_normal: 'baixo',
    sobrepeso: 'moderado',
    obesidade_grau_1: 'alto',
    obesidade_grau_2: 'muito_alto',
    obesidade_grau_3: 'extremo',
    super_obesidade: 'extremo',
    super_super_obesidade: 'extremo',
  }

  const colors: Record<BMIClassification, string> = {
    abaixo_peso: '#3b82f6',      // blue-500
    peso_normal: '#22c55e',       // green-500
    sobrepeso: '#eab308',         // yellow-500
    obesidade_grau_1: '#f97316',  // orange-500
    obesidade_grau_2: '#ef4444',  // red-500
    obesidade_grau_3: '#dc2626',  // red-600
    super_obesidade: '#b91c1c',   // red-700
    super_super_obesidade: '#991b1b', // red-800
  }

  return {
    value: bmi,
    classification,
    classificationElderly,
    description: descriptions[classification],
    healthRisk: healthRisks[classification],
    color: colors[classification],
  }
}

/**
 * Calcula o Metabolismo Basal (TMB) usando a fórmula de Mifflin-St Jeor
 * Considerada a mais precisa para a maioria das pessoas
 *
 * Homens: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5
 * Mulheres: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161
 */
export function calculateBasalMetabolism(
  weight: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weight + 6.25 * heightCm - 5 * age

  if (gender === 'masculino') {
    return Math.round(base + 5)
  } else if (gender === 'feminino') {
    return Math.round(base - 161)
  } else {
    // Para 'outro', usa a média
    return Math.round(base - 78)
  }
}

/**
 * Multiplicadores de atividade física para calcular TDEE
 */
const activityMultipliers: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  levemente_ativo: 1.375,
  moderadamente_ativo: 1.55,
  muito_ativo: 1.725,
  extremamente_ativo: 1.9,
}

/**
 * Calcula o Gasto Energético Total Diário (TDEE)
 * TDEE = TMB × Fator de Atividade
 */
export function calculateDailyMetabolism(
  basalMetabolism: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(basalMetabolism * activityMultipliers[activityLevel])
}

/**
 * Estima o percentual de gordura corporal usando a fórmula da Marinha dos EUA
 * É uma estimativa, menos precisa que bioimpedância ou DEXA
 *
 * Homens: %GC = 495 / (1.0324 - 0.19077 × log10(cintura - pescoço) + 0.15456 × log10(altura)) - 450
 * Mulheres: %GC = 495 / (1.29579 - 0.35004 × log10(cintura + quadril - pescoço) + 0.22100 × log10(altura)) - 450
 */
export function estimateBodyFatNavy(
  gender: Gender,
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipCm?: number // Obrigatório para mulheres
): number | null {
  if (gender === 'masculino') {
    const logWaistNeck = Math.log10(waistCm - neckCm)
    const logHeight = Math.log10(heightCm)
    const bodyFat = 495 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450
    return Number(Math.max(0, bodyFat).toFixed(1))
  } else if (gender === 'feminino' && hipCm) {
    const logWaistHipNeck = Math.log10(waistCm + hipCm - neckCm)
    const logHeight = Math.log10(heightCm)
    const bodyFat = 495 / (1.29579 - 0.35004 * logWaistHipNeck + 0.221 * logHeight) - 450
    return Number(Math.max(0, bodyFat).toFixed(1))
  }
  return null
}

/**
 * Estima o percentual de gordura corporal usando a fórmula baseada em IMC
 * Menos precisa, mas útil quando não temos medidas de circunferência
 *
 * Adultos: %GC = (1.20 × IMC) + (0.23 × idade) - (10.8 × gênero) - 5.4
 * Onde gênero = 1 para homens e 0 para mulheres
 */
export function estimateBodyFatFromBMI(
  bmi: number,
  age: number,
  gender: Gender
): number {
  const genderFactor = gender === 'masculino' ? 1 : 0
  const bodyFat = 1.2 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4
  return Number(Math.max(0, bodyFat).toFixed(1))
}

/**
 * Calcula a massa gorda em kg
 */
export function calculateFatMass(weight: number, bodyFatPercentage: number): number {
  return Number((weight * (bodyFatPercentage / 100)).toFixed(1))
}

/**
 * Calcula a massa magra em kg
 */
export function calculateLeanMass(weight: number, bodyFatPercentage: number): number {
  return Number((weight * (1 - bodyFatPercentage / 100)).toFixed(1))
}

/**
 * Calcula a razão cintura-quadril
 */
export function calculateWaistHipRatio(waistCm: number, hipCm: number): number {
  return Number((waistCm / hipCm).toFixed(2))
}

/**
 * Classifica a razão cintura-quadril (risco cardiovascular)
 */
export function classifyWaistHipRatio(
  ratio: number,
  gender: Gender
): 'baixo' | 'moderado' | 'alto' {
  if (gender === 'masculino') {
    if (ratio < 0.9) return 'baixo'
    if (ratio < 1.0) return 'moderado'
    return 'alto'
  } else {
    if (ratio < 0.8) return 'baixo'
    if (ratio < 0.85) return 'moderado'
    return 'alto'
  }
}

/**
 * Calcula o peso ideal usando a fórmula de Devine
 */
export function calculateIdealWeightDevine(heightCm: number, gender: Gender): number {
  const heightInches = heightCm / 2.54
  const over60 = heightInches - 60

  if (gender === 'masculino') {
    return Number((50 + 2.3 * over60).toFixed(1))
  } else {
    return Number((45.5 + 2.3 * over60).toFixed(1))
  }
}

/**
 * Calcula a faixa de peso saudável baseada no IMC (18.5 - 24.9)
 */
export function calculateHealthyWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100
  const heightSquared = heightM * heightM

  return {
    min: Number((18.5 * heightSquared).toFixed(1)),
    max: Number((24.9 * heightSquared).toFixed(1)),
  }
}

/**
 * Calcula as calorias recomendadas com base no objetivo
 */
export function calculateTargetCalories(
  tdee: number,
  goal: 'perda_peso' | 'ganho_massa' | 'manutencao' | 'recomposicao_corporal'
): { min: number; max: number; description: string } {
  switch (goal) {
    case 'perda_peso':
      return {
        min: Math.round(tdee * 0.75), // Déficit de 25%
        max: Math.round(tdee * 0.85), // Déficit de 15%
        description: 'Déficit calórico moderado para perda de peso sustentável',
      }
    case 'ganho_massa':
      return {
        min: Math.round(tdee * 1.1),  // Superávit de 10%
        max: Math.round(tdee * 1.2),  // Superávit de 20%
        description: 'Superávit calórico para ganho de massa muscular',
      }
    case 'recomposicao_corporal':
      return {
        min: Math.round(tdee * 0.95),
        max: Math.round(tdee * 1.05),
        description: 'Calorias próximas à manutenção para recomposição',
      }
    case 'manutencao':
    default:
      return {
        min: Math.round(tdee * 0.95),
        max: Math.round(tdee * 1.05),
        description: 'Calorias de manutenção',
      }
  }
}

/**
 * Formata a classificação do IMC para exibição
 */
export function formatBMIClassification(classification: BMIClassification): string {
  const labels: Record<BMIClassification, string> = {
    abaixo_peso: 'Abaixo do Peso',
    peso_normal: 'Peso Normal',
    sobrepeso: 'Sobrepeso',
    obesidade_grau_1: 'Obesidade Grau I',
    obesidade_grau_2: 'Obesidade Grau II',
    obesidade_grau_3: 'Obesidade Grau III',
    super_obesidade: 'Super Obesidade',
    super_super_obesidade: 'Super Super Obesidade',
  }
  return labels[classification]
}

/**
 * Retorna as faixas de IMC para exibição em gráfico
 */
export function getBMIRanges(): Array<{
  label: string
  min: number
  max: number
  color: string
}> {
  return [
    { label: 'Abaixo do Peso', min: 0, max: 18.5, color: '#3b82f6' },
    { label: 'Peso Normal', min: 18.5, max: 25, color: '#22c55e' },
    { label: 'Sobrepeso', min: 25, max: 30, color: '#eab308' },
    { label: 'Obesidade I', min: 30, max: 35, color: '#f97316' },
    { label: 'Obesidade II', min: 35, max: 40, color: '#ef4444' },
    { label: 'Obesidade III', min: 40, max: 50, color: '#dc2626' },
    { label: 'Super Obesidade', min: 50, max: 60, color: '#b91c1c' },
    { label: 'Super Super Obesidade', min: 60, max: 100, color: '#991b1b' },
  ]
}
