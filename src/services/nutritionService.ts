import {
  NutritionProfile,
  WeeklyDiet,
  DailyDiet,
  NutritionTargets,
  WeightProjection,
  WeightMilestone,
  FoodPreferences,
  DietGoal,
  MealPlan,
  Meal,
  DayOfWeek,
  DAYS_OF_WEEK,
  INTENSITY_OPTIONS
} from '@/types/nutrition'
import { UserProfile } from '@/types/profile'
import { getFirebaseDb } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

// ============================================
// CÁLCULOS DE NUTRIÇÃO E PROJEÇÃO DE PESO
// ============================================

/**
 * Calcula as metas nutricionais baseadas no perfil do usuário e objetivo
 */
export function calculateNutritionTargets(
  userProfile: UserProfile,
  dietGoal: DietGoal
): NutritionTargets {
  const { bodyComposition } = userProfile
  const tdee = bodyComposition.dailyMetabolism || bodyComposition.basalMetabolism || 2000

  // Calcular déficit/superávit baseado na intensidade
  const intensityConfig = INTENSITY_OPTIONS[dietGoal.intensity]
  let targetCalories = tdee

  if (dietGoal.type === 'perda_peso') {
    targetCalories = tdee - intensityConfig.deficit
  } else if (dietGoal.type === 'ganho_massa') {
    targetCalories = tdee + (intensityConfig.deficit * 0.7) // Superávit menor para ganho limpo
  } else if (dietGoal.type === 'recomposicao') {
    targetCalories = tdee - 100 // Leve déficit para recomposição
  }

  // Garantir mínimo saudável
  const minCalories = bodyComposition.gender === 'masculino' ? 1500 : 1200
  targetCalories = Math.max(targetCalories, minCalories)

  // Calcular macros baseado no objetivo e peso
  const weight = bodyComposition.currentWeight
  let proteinPerKg = 1.6 // padrão
  let carbPercent = 0.45
  let fatPercent = 0.25

  if (dietGoal.type === 'ganho_massa') {
    proteinPerKg = 2.0
    carbPercent = 0.50
    fatPercent = 0.25
  } else if (dietGoal.type === 'perda_peso') {
    proteinPerKg = 2.2 // Mais proteína para preservar massa magra
    carbPercent = 0.35
    fatPercent = 0.30
  } else if (dietGoal.type === 'recomposicao') {
    proteinPerKg = 2.4
    carbPercent = 0.40
    fatPercent = 0.25
  }

  const protein = Math.round(weight * proteinPerKg)
  const proteinCalories = protein * 4
  const proteinPercent = proteinCalories / targetCalories

  // Ajustar carbs e gordura para o restante das calorias
  const remainingPercent = 1 - proteinPercent
  const adjustedCarbPercent = (carbPercent / (carbPercent + fatPercent)) * remainingPercent
  const adjustedFatPercent = remainingPercent - adjustedCarbPercent

  const carbs = Math.round((targetCalories * adjustedCarbPercent) / 4)
  const fat = Math.round((targetCalories * adjustedFatPercent) / 9)

  // Fibras baseadas nas calorias (14g por 1000kcal é a recomendação)
  const fiber = Math.round((targetCalories / 1000) * 14)

  // Água baseada no peso (35ml por kg)
  const water = Math.round((weight * 35) / 1000 * 10) / 10

  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fat,
    proteinPercent: Math.round(proteinPercent * 100),
    carbsPercent: Math.round(adjustedCarbPercent * 100),
    fatPercent: Math.round(adjustedFatPercent * 100),
    fiber,
    water
  }
}

/**
 * Calcula a projeção de perda/ganho de peso
 */
export function calculateWeightProjection(
  dietGoal: DietGoal,
  nutritionTargets: NutritionTargets,
  tdee: number
): WeightProjection {
  const { currentWeight, targetWeight, intensity } = dietGoal
  const weightDifference = currentWeight - targetWeight
  const isLosing = weightDifference > 0

  // Déficit/superávit calórico diário
  const dailyCalorieDeficit = isLosing
    ? tdee - nutritionTargets.calories
    : nutritionTargets.calories - tdee

  // 1kg de gordura ≈ 7700 calorias
  const weeklyCalorieDeficit = dailyCalorieDeficit * 7
  const weeklyChange = weeklyCalorieDeficit / 7700

  // Semanas para atingir objetivo
  const weeksToGoal = Math.abs(weightDifference) / weeklyChange

  // Data estimada
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(weeksToGoal * 7))

  // Criar marcos intermediários (a cada 4 semanas ou a cada 2kg)
  const milestones: WeightMilestone[] = []
  const milestonesCount = Math.min(Math.ceil(weeksToGoal / 4), 12)
  const weekInterval = Math.ceil(weeksToGoal / milestonesCount)

  const celebrations = [
    '🎉 Primeiro marco alcançado!',
    '💪 Você está arrasando!',
    '🔥 Metade do caminho!',
    '⭐ Quase lá!',
    '🏆 Meta alcançada!'
  ]

  for (let i = 1; i <= milestonesCount; i++) {
    const week = Math.min(i * weekInterval, Math.ceil(weeksToGoal))
    const expectedWeight = isLosing
      ? currentWeight - (weeklyChange * week)
      : currentWeight + (weeklyChange * week)

    const milestoneDate = new Date()
    milestoneDate.setDate(milestoneDate.getDate() + week * 7)

    const percentageComplete = Math.min((week / weeksToGoal) * 100, 100)

    milestones.push({
      week,
      date: milestoneDate,
      expectedWeight: Math.round(expectedWeight * 10) / 10,
      percentageComplete: Math.round(percentageComplete),
      celebration: percentageComplete >= 100
        ? celebrations[4]
        : percentageComplete >= 75
          ? celebrations[3]
          : percentageComplete >= 50
            ? celebrations[2]
            : percentageComplete >= 25
              ? celebrations[1]
              : celebrations[0]
    })
  }

  return {
    dailyCalorieDeficit: Math.round(dailyCalorieDeficit),
    weeklyChange: Math.round(weeklyChange * 100) / 100,
    weeksToGoal: Math.round(weeksToGoal * 10) / 10,
    estimatedDate,
    milestones
  }
}

// ============================================
// INTEGRAÇÃO COM GPT-4.1
// ============================================

interface GPTDietRequest {
  userProfile: UserProfile
  foodPreferences: FoodPreferences
  dietGoal: DietGoal
  mealPlan: MealPlan
  nutritionTargets: NutritionTargets
}

/**
 * Gera o prompt para o GPT-4.1 criar a dieta
 */
function buildDietPrompt(request: GPTDietRequest): string {
  const { userProfile, foodPreferences, dietGoal, mealPlan, nutritionTargets } = request
  const { bodyComposition } = userProfile

  const goalLabels: Record<string, string> = {
    perda_peso: 'perda de peso',
    ganho_massa: 'ganho de massa muscular',
    manutencao: 'manutenção do peso',
    recomposicao: 'recomposição corporal'
  }

  const dietStyleLabels: Record<string, string> = {
    tradicional: 'brasileira tradicional (arroz, feijão, proteína, salada)',
    low_carb: 'low carb',
    cetogenica: 'cetogênica',
    mediterranea: 'mediterrânea',
    vegetariana: 'vegetariana',
    vegana: 'vegana',
    flexivel: 'flexível'
  }

  return `Você é um nutricionista esportivo experiente. Crie um plano alimentar semanal personalizado.

## DADOS DO PACIENTE
- Sexo: ${bodyComposition.gender === 'masculino' ? 'Masculino' : bodyComposition.gender === 'feminino' ? 'Feminino' : 'Outro'}
- Idade: ${bodyComposition.age} anos
- Peso atual: ${bodyComposition.currentWeight}kg
- Altura: ${bodyComposition.height}cm
- Peso meta: ${dietGoal.targetWeight}kg
- Objetivo: ${goalLabels[dietGoal.type]}
- Taxa metabólica basal: ${bodyComposition.basalMetabolism || 'não informada'}kcal
- Gasto calórico diário: ${bodyComposition.dailyMetabolism || 'não informado'}kcal

## METAS NUTRICIONAIS DIÁRIAS
- Calorias: ${nutritionTargets.calories}kcal
- Proteínas: ${nutritionTargets.protein}g (${nutritionTargets.proteinPercent}%)
- Carboidratos: ${nutritionTargets.carbs}g (${nutritionTargets.carbsPercent}%)
- Gorduras: ${nutritionTargets.fat}g (${nutritionTargets.fatPercent}%)
- Fibras: ${nutritionTargets.fiber}g
- Água: ${nutritionTargets.water}L

## PREFERÊNCIAS ALIMENTARES
- Estilo de dieta: ${foodPreferences.dietStyle ? dietStyleLabels[foodPreferences.dietStyle] : 'tradicional brasileira'}
- Refeições por dia: ${mealPlan.mealsPerDay}
- Incluir lanches: ${mealPlan.includeSnacks ? 'Sim' : 'Não'}
${foodPreferences.dislikedFoods.length > 0 ? `- NÃO INCLUIR (não gosta): ${foodPreferences.dislikedFoods.join(', ')}` : ''}
${foodPreferences.mustHaveFoods.length > 0 ? `- MANTER NA DIETA (favoritos): ${foodPreferences.mustHaveFoods.join(', ')}` : ''}
${foodPreferences.restrictions.length > 0 ? `- RESTRIÇÕES ALIMENTARES: ${foodPreferences.restrictions.join(', ')}` : ''}

## INSTRUÇÕES
1. Crie um cardápio para cada dia da semana (segunda a domingo)
2. Para cada refeição, liste os alimentos com quantidades em gramas ou medidas caseiras
3. Inclua os macros de cada refeição
4. Varie os alimentos durante a semana para não enjoar
5. Use alimentos acessíveis e comuns no Brasil
6. Dê dicas práticas de preparo quando relevante

## FORMATO DE RESPOSTA (JSON)
Responda APENAS com o JSON válido, sem texto adicional:

{
  "days": [
    {
      "dayOfWeek": "segunda",
      "dayName": "Segunda-feira",
      "meals": [
        {
          "name": "Café da Manhã",
          "time": "07:00",
          "foods": [
            {
              "name": "Nome do alimento",
              "quantity": "quantidade",
              "calories": numero,
              "protein": numero,
              "carbs": numero,
              "fat": numero
            }
          ],
          "totalCalories": numero,
          "totalProtein": numero,
          "totalCarbs": numero,
          "totalFat": numero
        }
      ],
      "totalCalories": numero,
      "totalProtein": numero,
      "totalCarbs": numero,
      "totalFat": numero,
      "tips": ["dica 1", "dica 2"]
    }
  ]
}`
}

/**
 * Chama a API do GPT-4.1 para gerar a dieta
 */
export async function generateDietWithGPT(
  request: GPTDietRequest
): Promise<WeeklyDiet> {
  const prompt = buildDietPrompt(request)

  const response = await fetch('/api/nutrition/generate-diet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })

  if (!response.ok) {
    throw new Error('Erro ao gerar dieta. Tente novamente.')
  }

  const data = await response.json()

  // Processar resposta do GPT
  const gptDiet = data.diet

  // Criar WeeklyDiet a partir da resposta
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Segunda-feira

  const weeklyDiet: WeeklyDiet = {
    id: `diet_${Date.now()}`,
    userId: request.userProfile.id,
    weekNumber: getWeekNumber(now),
    year: now.getFullYear(),
    startDate: startOfWeek,
    days: gptDiet.days.map((day: DailyDiet, index: number) => ({
      ...day,
      waterGoal: request.nutritionTargets.water,
      meals: day.meals.map((meal: Meal, mealIndex: number) => ({
        ...meal,
        id: `meal_${index}_${mealIndex}`
      }))
    })),
    nutritionTargets: request.nutritionTargets,
    createdAt: now,
    updatedAt: now
  }

  return weeklyDiet
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ============================================
// FIREBASE/FIRESTORE OPERATIONS
// ============================================

/**
 * Salva o perfil de nutrição no Firestore
 */
export async function saveNutritionProfile(
  userId: string,
  profile: Partial<NutritionProfile>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    console.warn('Firebase não configurado, salvando localmente')
    localStorage.setItem(`nutrition_${userId}`, JSON.stringify(profile))
    return
  }

  try {
    const docRef = doc(db, 'nutrition_profiles', userId)
    await setDoc(docRef, {
      ...removeUndefined(profile),
      updatedAt: serverTimestamp()
    }, { merge: true })
  } catch (error) {
    console.error('Erro ao salvar perfil de nutrição:', error)
    throw error
  }
}

/**
 * Carrega o perfil de nutrição do Firestore
 */
export async function getNutritionProfile(
  userId: string
): Promise<NutritionProfile | null> {
  const db = getFirebaseDb()
  if (!db) {
    const local = localStorage.getItem(`nutrition_${userId}`)
    return local ? JSON.parse(local) : null
  }

  try {
    const docRef = doc(db, 'nutrition_profiles', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return deserializeNutritionProfile(data)
  } catch (error) {
    console.error('Erro ao carregar perfil de nutrição:', error)
    return null
  }
}

/**
 * Salva a dieta semanal no Firestore
 */
export async function saveWeeklyDiet(
  userId: string,
  diet: WeeklyDiet
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    localStorage.setItem(`diet_${userId}_${diet.weekNumber}`, JSON.stringify(diet))
    return
  }

  try {
    const docRef = doc(db, 'weekly_diets', `${userId}_${diet.year}_${diet.weekNumber}`)
    await setDoc(docRef, {
      ...removeUndefined(diet),
      startDate: Timestamp.fromDate(diet.startDate),
      createdAt: Timestamp.fromDate(diet.createdAt),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao salvar dieta:', error)
    throw error
  }
}

// Helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeUndefined<T extends Record<string, any>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        result[key] = removeUndefined(obj[key] as Record<string, unknown>)
      } else {
        result[key] = obj[key]
      }
    }
  }
  return result
}

function deserializeNutritionProfile(data: Record<string, unknown>): NutritionProfile {
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt as string),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt as string),
    weightProjection: data.weightProjection ? {
      ...(data.weightProjection as Record<string, unknown>),
      estimatedDate: (data.weightProjection as Record<string, unknown>).estimatedDate instanceof Timestamp
        ? ((data.weightProjection as Record<string, unknown>).estimatedDate as Timestamp).toDate()
        : new Date((data.weightProjection as Record<string, unknown>).estimatedDate as string),
      milestones: ((data.weightProjection as Record<string, unknown>).milestones as Array<Record<string, unknown>>)?.map((m) => ({
        ...m,
        date: m.date instanceof Timestamp ? m.date.toDate() : new Date(m.date as string)
      }))
    } as WeightProjection : undefined
  } as NutritionProfile
}
