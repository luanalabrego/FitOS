// Tipos para o módulo de perfil do FitOS

export type Gender = 'masculino' | 'feminino' | 'outro'

export type Goal =
  | 'perda_peso'
  | 'ganho_massa'
  | 'manutencao'
  | 'saude_geral'
  | 'performance_atletica'
  | 'recomposicao_corporal'

export type ActivityLevel =
  | 'sedentario'           // Pouco ou nenhum exercício
  | 'levemente_ativo'      // Exercício leve 1-3 dias/semana
  | 'moderadamente_ativo'  // Exercício moderado 3-5 dias/semana
  | 'muito_ativo'          // Exercício intenso 6-7 dias/semana
  | 'extremamente_ativo'   // Exercício muito intenso, trabalho físico

export type TrainingFrequency = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type DietQuality =
  | 'muito_ruim'   // Fast food frequente, sem controle
  | 'ruim'         // Alimentação irregular, pouca variedade
  | 'regular'      // Tenta comer bem mas sem consistência
  | 'boa'          // Alimentação balanceada na maioria dos dias
  | 'excelente'    // Alimentação controlada e planejada

export type SleepQuality =
  | 'muito_ruim'   // Menos de 5h ou muito irregular
  | 'ruim'         // 5-6h ou qualidade ruim
  | 'regular'      // 6-7h
  | 'boa'          // 7-8h com boa qualidade
  | 'excelente'    // 8h+ com ótima qualidade

export type WaterIntake =
  | 'muito_baixo'  // Menos de 1L/dia
  | 'baixo'        // 1-1.5L/dia
  | 'moderado'     // 1.5-2L/dia
  | 'adequado'     // 2-3L/dia
  | 'alto'         // 3L+/dia

// Classificação de IMC baseada na OMS
export type BMIClassification =
  | 'abaixo_peso'          // IMC < 18.5
  | 'peso_normal'          // IMC 18.5 - 24.9
  | 'sobrepeso'            // IMC 25 - 29.9
  | 'obesidade_grau_1'     // IMC 30 - 34.9
  | 'obesidade_grau_2'     // IMC 35 - 39.9
  | 'obesidade_grau_3'     // IMC 40 - 49.9 (obesidade mórbida)
  | 'super_obesidade'      // IMC 50 - 59.9 (grau IV)
  | 'super_super_obesidade' // IMC >= 60 (grau V)

// Para idosos (>= 60 anos), a classificação é diferente
export type BMIClassificationElderly =
  | 'abaixo_peso'    // IMC < 22
  | 'peso_normal'    // IMC 22 - 27
  | 'sobrepeso'      // IMC > 27

// Nova classificação 2025 (The Lancet)
export type ObesityType2025 =
  | 'sem_obesidade'
  | 'pre_clinica'    // Excesso de gordura sem disfunção orgânica
  | 'clinica'        // Doença sistêmica com sinais de disfunção

export interface BMIInfo {
  value: number
  classification: BMIClassification
  classificationElderly?: BMIClassificationElderly
  obesityType2025?: ObesityType2025
  description: string
  healthRisk: 'baixo' | 'moderado' | 'alto' | 'muito_alto' | 'extremo'
  color: string // Cor para exibição visual
}

export interface BodyComposition {
  // Dados obrigatórios
  currentWeight: number        // kg
  height: number               // cm
  gender: Gender
  age: number

  // Dados calculados ou inseridos manualmente
  bmi?: number                 // Índice de Massa Corporal
  bodyFatPercentage?: number   // % de gordura corporal
  fatMass?: number             // Peso de gordura (kg)
  leanMass?: number            // Massa magra (kg)
  basalMetabolism?: number     // Metabolismo basal (kcal/dia)
  dailyMetabolism?: number     // Metabolismo diário (TDEE) (kcal/dia)

  // Medidas adicionais (bioimpedância)
  visceralFat?: number         // Nível de gordura visceral
  muscleMass?: number          // Massa muscular (kg)
  boneMass?: number            // Massa óssea (kg)
  bodyWater?: number           // % de água corporal
  metabolicAge?: number        // Idade metabólica

  // Medidas antropométricas
  waistCircumference?: number  // Circunferência abdominal (cm)
  hipCircumference?: number    // Circunferência do quadril (cm)
  waistHipRatio?: number       // Razão cintura-quadril

  // Método de preenchimento
  inputMethod: 'manual' | 'formula' | 'bioimpedancia'
}

export interface ProfilePhoto {
  id: string
  url: string
  date: Date
  type: 'profile' | 'progress'
  notes?: string
}

export interface Diagnosis {
  // Treino
  currentlyTraining: boolean
  trainingFrequency: TrainingFrequency
  trainingTypes: string[]       // musculação, cardio, funcional, etc.
  trainingDuration?: number     // minutos por sessão
  trainingExperience?: 'iniciante' | 'intermediario' | 'avancado'

  // Alimentação
  dietQuality: DietQuality
  mealsPerDay: number
  hasNutritionist: boolean
  followsDiet: boolean
  dietType?: string             // low carb, cetogênica, vegetariana, etc.
  foodRestrictions?: string[]   // alergias, intolerâncias

  // Estilo de vida
  sleepQuality: SleepQuality
  sleepHours?: number
  waterIntake: WaterIntake
  stressLevel: 'baixo' | 'moderado' | 'alto' | 'muito_alto'
  smokingStatus: 'nunca' | 'ex_fumante' | 'fumante'
  alcoholConsumption: 'nunca' | 'raramente' | 'socialmente' | 'frequente'

  // Saúde
  hasChronicConditions: boolean
  chronicConditions?: string[]  // diabetes, hipertensão, etc.
  takesMedication: boolean
  medications?: string[]
  hasInjuries: boolean
  injuries?: string[]

  // Histórico
  previousWeightLossAttempts: boolean
  previousMethods?: string[]    // dietas anteriores, procedimentos
  biggestChallenges?: string[]  // falta de tempo, motivação, etc.
}

export interface UserProfile {
  id: string
  name: string
  email?: string

  // Dados corporais
  bodyComposition: BodyComposition

  // Classificação
  bmiInfo?: BMIInfo

  // Objetivos
  primaryGoal: Goal
  secondaryGoals?: Goal[]
  targetWeight?: number
  targetBodyFat?: number
  targetDate?: Date

  // Diagnóstico
  diagnosis: Diagnosis

  // Fotos
  profilePhoto?: ProfilePhoto
  progressPhotos: ProfilePhoto[]

  // Metadados
  createdAt: Date
  updatedAt: Date
  onboardingCompleted: boolean
}

// Estado do formulário de perfil (para wizard/steps)
export type ProfileStep =
  | 'dados_basicos'
  | 'composicao_corporal'
  | 'objetivos'
  | 'diagnostico'
  | 'fotos'
  | 'resumo'

export interface ProfileFormState {
  currentStep: ProfileStep
  completedSteps: ProfileStep[]
  profile: Partial<UserProfile>
  errors: Record<string, string>
  isSubmitting: boolean
}
