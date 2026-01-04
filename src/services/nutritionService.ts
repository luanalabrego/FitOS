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
 * Distribuição de macros por estilo de dieta
 */
interface MacroDistribution {
  proteinPerKg: number
  carbPercent: number
  fatPercent: number
  maxCarbs?: number  // Limite máximo de carboidratos em gramas (para low carb/keto)
  minFatPercent?: number  // Mínimo de gordura em % (para keto)
}

function getMacroDistributionByDietStyle(
  dietStyle: string,
  goalType: string
): MacroDistribution {
  // Distribuições base por estilo de dieta
  const distributions: Record<string, MacroDistribution> = {
    tradicional: {
      proteinPerKg: goalType === 'ganho_massa' ? 2.0 : goalType === 'perda_peso' ? 2.2 : 1.6,
      carbPercent: goalType === 'ganho_massa' ? 0.50 : goalType === 'perda_peso' ? 0.35 : 0.45,
      fatPercent: goalType === 'ganho_massa' ? 0.25 : goalType === 'perda_peso' ? 0.30 : 0.25
    },
    cetogenica: {
      proteinPerKg: 1.8,  // Moderada para não sair da cetose
      carbPercent: 0.05,  // Máximo 5% das calorias
      fatPercent: 0.75,   // 70-75% das calorias de gordura
      maxCarbs: 25,       // Máximo 25g para manter cetose
      minFatPercent: 0.70
    },
    low_carb: {
      proteinPerKg: goalType === 'ganho_massa' ? 2.2 : 2.0,
      carbPercent: 0.20,  // ~20% das calorias
      fatPercent: 0.45,   // ~45% das calorias
      maxCarbs: 100       // Máximo 100g de carbs
    },
    mediterranea: {
      proteinPerKg: 1.6,
      carbPercent: 0.40,  // Carboidratos de grãos integrais e legumes
      fatPercent: 0.35    // Gorduras boas (azeite, peixes)
    },
    vegetariana: {
      proteinPerKg: goalType === 'ganho_massa' ? 2.2 : 1.8,  // Mais proteína para compensar
      carbPercent: 0.50,
      fatPercent: 0.25
    },
    vegana: {
      proteinPerKg: goalType === 'ganho_massa' ? 2.4 : 2.0,  // Mais proteína ainda
      carbPercent: 0.50,
      fatPercent: 0.25
    },
    flexivel: {
      proteinPerKg: goalType === 'ganho_massa' ? 2.0 : goalType === 'perda_peso' ? 2.2 : 1.8,
      carbPercent: 0.40,
      fatPercent: 0.30
    }
  }

  return distributions[dietStyle] || distributions.tradicional
}

/**
 * Calcula as metas nutricionais baseadas no perfil do usuário, objetivo E estilo de dieta
 */
export function calculateNutritionTargets(
  userProfile: UserProfile,
  dietGoal: DietGoal,
  dietStyle: string = 'tradicional'
): NutritionTargets {
  const { bodyComposition } = userProfile
  const tdee = bodyComposition.dailyMetabolism || bodyComposition.basalMetabolism || 2000

  let targetCalories: number

  // Se o usuário definiu calorias customizadas, usar elas
  if (dietGoal.useCustomCalories && dietGoal.customCalories && dietGoal.customCalories > 0) {
    targetCalories = dietGoal.customCalories
  } else {
    // Calcular déficit/superávit baseado na intensidade
    const intensityConfig = INTENSITY_OPTIONS[dietGoal.intensity]
    targetCalories = tdee

    if (dietGoal.type === 'perda_peso') {
      targetCalories = tdee - intensityConfig.deficit
    } else if (dietGoal.type === 'ganho_massa') {
      targetCalories = tdee + (intensityConfig.deficit * 0.7) // Superávit menor para ganho limpo
    } else if (dietGoal.type === 'recomposicao') {
      targetCalories = tdee - 100 // Leve déficit para recomposição
    }

    // Garantir mínimo saudável (apenas para cálculo automático)
    const minCalories = bodyComposition.gender === 'masculino' ? 1500 : 1200
    targetCalories = Math.max(targetCalories, minCalories)
  }

  // Obter distribuição de macros baseada no estilo de dieta
  const macroDistribution = getMacroDistributionByDietStyle(dietStyle, dietGoal.type)
  const weight = bodyComposition.currentWeight

  let protein: number
  let carbs: number
  let fat: number
  let proteinPercent: number
  let carbsPercent: number
  let fatPercent: number

  if (dietStyle === 'cetogenica') {
    // Cálculo específico para dieta cetogênica
    fat = Math.round((targetCalories * 0.75) / 9)
    protein = Math.round((targetCalories * 0.20) / 4)
    carbs = Math.min(25, Math.round((targetCalories * 0.05) / 4))  // Máximo 25g

    fatPercent = 75
    proteinPercent = 20
    carbsPercent = 5
  } else if (dietStyle === 'low_carb') {
    // Cálculo para low carb
    carbs = Math.min(macroDistribution.maxCarbs || 100, Math.round((targetCalories * 0.20) / 4))
    protein = Math.round(weight * macroDistribution.proteinPerKg)

    const carbCalories = carbs * 4
    const proteinCalories = protein * 4
    const remainingCalories = targetCalories - carbCalories - proteinCalories
    fat = Math.round(remainingCalories / 9)

    carbsPercent = Math.round((carbCalories / targetCalories) * 100)
    proteinPercent = Math.round((proteinCalories / targetCalories) * 100)
    fatPercent = 100 - carbsPercent - proteinPercent
  } else {
    // Cálculo padrão para outros estilos
    protein = Math.round(weight * macroDistribution.proteinPerKg)
    const proteinCalories = protein * 4
    proteinPercent = Math.round((proteinCalories / targetCalories) * 100)

    // Ajustar carbs e gordura para o restante das calorias
    const remainingPercent = 1 - (proteinCalories / targetCalories)
    const totalMacroPercent = macroDistribution.carbPercent + macroDistribution.fatPercent

    carbsPercent = Math.round((macroDistribution.carbPercent / totalMacroPercent) * remainingPercent * 100)
    fatPercent = 100 - proteinPercent - carbsPercent

    carbs = Math.round((targetCalories * carbsPercent / 100) / 4)
    fat = Math.round((targetCalories * fatPercent / 100) / 9)
  }

  // Fibras baseadas nas calorias e estilo
  let fiber = Math.round((targetCalories / 1000) * 14)
  if (dietStyle === 'cetogenica') {
    fiber = Math.min(fiber, 20)  // Menos fibra na keto para não ultrapassar carbs
  } else if (dietStyle === 'vegetariana' || dietStyle === 'vegana') {
    fiber = Math.round(fiber * 1.3)  // Mais fibra em dietas plant-based
  }

  // Água baseada no peso (35ml por kg)
  const water = Math.round((weight * 35) / 1000 * 10) / 10

  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fat,
    proteinPercent,
    carbsPercent,
    fatPercent,
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
  fridgeInventory?: {
    items: string[]
    useOnlyFridgeItems: boolean
  }
}

/**
 * Retorna instruções específicas para cada estilo de dieta
 */
function getDietStyleInstructions(dietStyle: string): string {
  const instructions: Record<string, string> = {
    tradicional: `
ESTILO: DIETA BRASILEIRA TRADICIONAL
- Base: arroz, feijão, proteína e salada
- Distribua os carboidratos ao longo do dia
- Priorize alimentos naturais e integrais`,
    low_carb: `
ESTILO: LOW CARB (OBRIGATÓRIO)
- MÁXIMO 100g de carboidratos por dia
- PROIBIDO: arroz, pão, macarrão, batata, açúcar, frutas doces
- PERMITIDO: vegetais folhosos, legumes com baixo carb (abobrinha, brócolis, couve-flor)
- Priorize: proteínas e gorduras boas (azeite, abacate, castanhas)
- Substitua arroz por: couve-flor ralada, abobrinha espaguete`,
    cetogenica: `
ESTILO: DIETA CETOGÊNICA (OBRIGATÓRIO - SIGA RIGOROSAMENTE)
- MÁXIMO 20-30g de carboidratos LÍQUIDOS por dia (total - fibras)
- PROIBIDO TOTALMENTE: arroz, feijão, pão, macarrão, batata, batata doce, frutas (exceto abacate e frutas vermelhas em pequena quantidade), açúcar, mel, grãos
- OBRIGATÓRIO: 70-75% das calorias de GORDURA, 20-25% de PROTEÍNA, máximo 5% de carboidratos
- PRIORIZE: carnes gordas, bacon, ovos, queijos, manteiga, azeite, abacate, castanhas, creme de leite, óleo de coco
- Vegetais permitidos: folhas verdes, brócolis, couve-flor, aspargos, abobrinha
- CADA REFEIÇÃO deve ter ALTO teor de gordura e MÍNIMO de carboidratos`,
    mediterranea: `
ESTILO: DIETA MEDITERRÂNEA
- Base: azeite de oliva extra virgem, peixes, vegetais frescos
- Inclua: leguminosas, grãos integrais, nozes
- Proteínas: priorize peixes (salmão, sardinha, atum) e frango
- Use ervas e especiarias para temperar`,
    vegetariana: `
ESTILO: DIETA VEGETARIANA (OBRIGATÓRIO)
- PROIBIDO: qualquer tipo de carne (bovina, frango, peixe, frutos do mar)
- PERMITIDO: ovos, leite e derivados
- Fontes de proteína: ovos, queijos, iogurte, tofu, leguminosas, grão de bico
- Combine cereais com leguminosas para proteína completa`,
    vegana: `
ESTILO: DIETA VEGANA (OBRIGATÓRIO)
- PROIBIDO: qualquer produto de origem animal (carnes, ovos, leite, queijo, mel)
- Fontes de proteína: tofu, tempeh, leguminosas, grão de bico, lentilha, quinoa, edamame
- Inclua: sementes de chia, linhaça, castanhas para ômega-3
- Suplementar vitamina B12 é recomendado`,
    flexivel: `
ESTILO: DIETA FLEXÍVEL (IIFYM)
- Foque em atingir os macros diários
- Varie os alimentos para nutrição completa
- 80% alimentos nutritivos, 20% pode ser mais flexível`
  }
  return instructions[dietStyle] || instructions.tradicional
}

/**
 * Gera o prompt para o GPT-4.1-mini criar a dieta
 */
function buildDietPrompt(request: GPTDietRequest): string {
  const { userProfile, foodPreferences, dietGoal, mealPlan, nutritionTargets, fridgeInventory } = request
  const { bodyComposition } = userProfile

  const goalLabels: Record<string, string> = {
    perda_peso: 'PERDA DE PESO - priorize déficit calórico e alta proteína para preservar massa magra',
    ganho_massa: 'GANHO DE MASSA MUSCULAR - priorize superávit calórico controlado e alta proteína',
    manutencao: 'MANUTENÇÃO DO PESO - equilibre calorias com gasto energético',
    recomposicao: 'RECOMPOSIÇÃO CORPORAL - alta proteína, déficit leve, priorize treino de força'
  }

  const dietStyleLabels: Record<string, string> = {
    tradicional: 'Brasileira tradicional',
    low_carb: 'Low Carb (máximo 100g carbs/dia)',
    cetogenica: 'CETOGÊNICA (máximo 20-30g carbs/dia, 70% gordura)',
    mediterranea: 'Mediterrânea',
    vegetariana: 'Vegetariana (sem carnes)',
    vegana: 'Vegana (sem produtos animais)',
    flexivel: 'Flexível (IIFYM)'
  }

  const dietStyle = foodPreferences.dietStyle || 'tradicional'
  const dietStyleInstruction = getDietStyleInstructions(dietStyle)

  // Ajustar macros para dieta cetogênica
  let macroInstructions = `
- Calorias alvo: ${nutritionTargets.calories}kcal
- Proteínas: ${nutritionTargets.protein}g
- Carboidratos: ${nutritionTargets.carbs}g
- Gorduras: ${nutritionTargets.fat}g`

  if (dietStyle === 'cetogenica') {
    const ketoFat = Math.round((nutritionTargets.calories * 0.75) / 9)
    const ketoProtein = Math.round((nutritionTargets.calories * 0.20) / 4)
    const ketoCarbs = 25 // máximo 25g para cetose
    macroInstructions = `
- Calorias alvo: ${nutritionTargets.calories}kcal
- GORDURAS: ${ketoFat}g (75% das calorias) - PRIORIDADE MÁXIMA
- PROTEÍNAS: ${ketoProtein}g (20% das calorias)
- CARBOIDRATOS: MÁXIMO ${ketoCarbs}g (5% das calorias) - NÃO ULTRAPASSAR`
  } else if (dietStyle === 'low_carb') {
    const lowCarbCarbs = Math.min(nutritionTargets.carbs, 100)
    macroInstructions = `
- Calorias alvo: ${nutritionTargets.calories}kcal
- Proteínas: ${nutritionTargets.protein}g
- Carboidratos: MÁXIMO ${lowCarbCarbs}g
- Gorduras: ${nutritionTargets.fat}g`
  }

  // Gerar nomes das refeições baseado no número escolhido
  const mealNames = generateMealNames(mealPlan.mealsPerDay, mealPlan.includeSnacks)

  // Verificar se deve usar apenas itens da geladeira
  const useOnlyFridge = fridgeInventory?.useOnlyFridgeItems && fridgeInventory.items.length > 0
  const fridgeItemsList = fridgeInventory?.items || []

  // Seção de alimentos disponíveis - muda completamente se usar apenas geladeira
  const foodsSection = useOnlyFridge ? `
## 🚨 RESTRIÇÃO CRÍTICA: USAR APENAS ITENS DA GELADEIRA 🚨
⛔ ESTA É A REGRA MAIS IMPORTANTE DE TODAS - NÃO PODE SER VIOLADA ⛔

O paciente SOMENTE possui os seguintes alimentos em casa.
Você NÃO PODE usar NENHUM alimento que não esteja nesta lista.
Se um alimento não está listado abaixo, ELE NÃO EXISTE para esta dieta.

### ALIMENTOS DISPONÍVEIS (USE APENAS ESTES):
${fridgeItemsList.map(item => `✓ ${item}`).join('\n')}

### REGRAS OBRIGATÓRIAS:
1. TODOS os alimentos da dieta DEVEM estar na lista acima
2. As ALTERNATIVAS também DEVEM estar na lista acima
3. NÃO invente, NÃO sugira, NÃO adicione NENHUM alimento fora da lista
4. Se faltar variedade, REPITA os mesmos alimentos em diferentes preparos
5. Nas dicas do dia, sugira o que o paciente deveria COMPRAR para melhorar a dieta

### ALIMENTOS PROIBIDOS (NÃO ESTÃO NA GELADEIRA):
- Qualquer fruta não listada acima
- Qualquer vegetal não listado acima
- Qualquer proteína não listada acima
- Qualquer laticínio não listado acima
- ABACATE, AVEIA, GRANOLA - a menos que estejam na lista acima` : `
## ALIMENTOS BRASILEIROS RECOMENDADOS
- Proteínas: frango, carne moída, ovos, peixe (tilápia, sardinha), carne de panela, patinho, acém
- Carboidratos: arroz, feijão, batata, batata doce, mandioca, pão francês, macarrão, cuscuz, tapioca
- Vegetais: alface, tomate, cenoura, chuchu, abobrinha, brócolis, couve, repolho, beterraba
- Frutas: banana, maçã, laranja, mamão, melancia, abacaxi, manga, goiaba
- Laticínios: leite, queijo minas, iogurte natural, requeijão
- Gorduras: azeite, óleo de coco, manteiga, castanha de caju`

  // Regra adicional para as regras absolutas
  const fridgeRule = useOnlyFridge ? `
4. 🚨 USAR APENAS ALIMENTOS DA GELADEIRA - Esta é a regra mais importante. PROIBIDO usar qualquer alimento que não esteja na lista de "ALIMENTOS DISPONÍVEIS"` : `
4. USE APENAS ALIMENTOS BRASILEIROS SIMPLES E ACESSÍVEIS`

  // Instrução para alternativas
  const alternativesInstruction = useOnlyFridge
    ? `7. **IMPORTANTE**: Para CADA alimento, forneça 2 ALTERNATIVAS que TAMBÉM estejam na lista de alimentos disponíveis. Se não houver alternativas possíveis na lista, repita o mesmo alimento ou deixe array vazio.`
    : `7. **IMPORTANTE**: Para CADA alimento, forneça 2 ALTERNATIVAS que podem substituí-lo (com valores nutricionais similares)`

  return `Você é um NUTRICIONISTA ESPORTIVO BRASILEIRO ESPECIALISTA focado no objetivo do paciente.
Sua missão é criar um plano alimentar que RESPEITE RIGOROSAMENTE todas as especificações.

## CONTEXTO
- LOCALIZAÇÃO: BRASIL
${useOnlyFridge ? '- ⚠️ O PACIENTE VAI USAR APENAS OS ALIMENTOS QUE TEM EM CASA - SIGA A LISTA RIGOROSAMENTE' : '- Use APENAS alimentos comuns e acessíveis em supermercados brasileiros'}
- Prefira alimentos SIMPLES e de fácil preparo
- Use medidas brasileiras (xícara, colher de sopa, gramas)

## REGRAS ABSOLUTAS (NÃO VIOLAR)
1. NÚMERO DE REFEIÇÕES: EXATAMENTE ${mealPlan.mealsPerDay} refeições por dia. NÃO MAIS, NÃO MENOS.
2. ESTILO DE DIETA: ${dietStyleLabels[dietStyle]} - SIGA RIGOROSAMENTE
3. Os macros de cada dia DEVEM estar próximos das metas${fridgeRule}

## DADOS DO PACIENTE
- Sexo: ${bodyComposition.gender === 'masculino' ? 'Masculino' : bodyComposition.gender === 'feminino' ? 'Feminino' : 'Outro'}
- Idade: ${bodyComposition.age} anos
- Peso atual: ${bodyComposition.currentWeight}kg
- Altura: ${bodyComposition.height}cm
- Peso meta: ${dietGoal.targetWeight}kg
- Objetivo: ${goalLabels[dietGoal.type]}

## METAS NUTRICIONAIS DIÁRIAS${macroInstructions}
- Fibras: ${nutritionTargets.fiber}g
- Água: ${nutritionTargets.water}L
${dietStyleInstruction}
${foodsSection}

## PREFERÊNCIAS DO PACIENTE
${foodPreferences.dislikedFoods.length > 0 ? `- PROIBIDO (não gosta): ${foodPreferences.dislikedFoods.join(', ')}` : ''}
${foodPreferences.mustHaveFoods.length > 0 ? `- INCLUIR (favoritos): ${foodPreferences.mustHaveFoods.join(', ')}` : ''}
${foodPreferences.restrictions.length > 0 ? `- RESTRIÇÕES/ALERGIAS: ${foodPreferences.restrictions.join(', ')}` : ''}

## REFEIÇÕES DO DIA (EXATAMENTE ${mealPlan.mealsPerDay})
${mealNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

## INSTRUÇÕES FINAIS
1. Crie cardápio para os 7 dias da semana (segunda a domingo)
2. CADA DIA deve ter EXATAMENTE ${mealPlan.mealsPerDay} refeições com os nomes especificados acima
3. Liste alimentos com quantidades em gramas ou medidas caseiras brasileiras
4. ${useOnlyFridge ? 'Use SOMENTE os alimentos da lista de ALIMENTOS DISPONÍVEIS - NÃO INVENTE OUTROS' : 'Varie os alimentos para não enjoar, mas mantenha simples'}
5. Priorize preparos rápidos e práticos do dia a dia brasileiro
6. ${useOnlyFridge ? 'Nas dicas do dia, sugira alimentos que o paciente deveria COMPRAR para complementar a dieta' : 'Dê 2 dicas práticas por dia relacionadas ao preparo ou benefícios dos alimentos'}
${alternativesInstruction}

## FORMATO JSON (RESPONDA APENAS O JSON)
{
  "days": [
    {
      "dayOfWeek": "segunda",
      "dayName": "Segunda-feira",
      "meals": [
${mealNames.map((name, i) => `        {
          "name": "${name}",
          "time": "${getMealTime(i, mealPlan.mealsPerDay)}",
          "foods": [
            {
              "name": "nome do alimento",
              "quantity": "quantidade",
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fat": 0,
              "alternatives": [
                {"name": "alternativa 1", "quantity": "quantidade", "calories": 0, "protein": 0, "carbs": 0, "fat": 0},
                {"name": "alternativa 2", "quantity": "quantidade", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}
              ]
            }
          ],
          "totalCalories": 0,
          "totalProtein": 0,
          "totalCarbs": 0,
          "totalFat": 0
        }`).join(',\n')}
      ],
      "totalCalories": 0,
      "totalProtein": 0,
      "totalCarbs": 0,
      "totalFat": 0,
      "tips": ["dica 1", "dica 2"]
    }
  ]
}`
}

/**
 * Gera os nomes das refeições baseado no número escolhido
 */
function generateMealNames(mealsPerDay: number, includeSnacks: boolean): string[] {
  if (mealsPerDay <= 3) {
    return ['Café da Manhã', 'Almoço', 'Jantar'].slice(0, mealsPerDay)
  }

  if (mealsPerDay === 4) {
    return includeSnacks
      ? ['Café da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar']
      : ['Café da Manhã', 'Almoço', 'Jantar', 'Ceia']
  }

  if (mealsPerDay === 5) {
    return ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar']
  }

  // 6 ou mais
  return ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'].slice(0, mealsPerDay)
}

/**
 * Retorna horário estimado para cada refeição
 */
function getMealTime(index: number, totalMeals: number): string {
  const times: Record<number, string[]> = {
    3: ['07:00', '12:30', '19:30'],
    4: ['07:00', '12:30', '16:00', '19:30'],
    5: ['07:00', '10:00', '12:30', '16:00', '19:30'],
    6: ['07:00', '10:00', '12:30', '16:00', '19:30', '21:30']
  }
  return times[totalMeals]?.[index] || '12:00'
}

/**
 * Chama a API do GPT-4.1-mini para gerar a dieta
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
    body: JSON.stringify({
      prompt,
      // Parâmetros para fallback/mock
      dietParams: {
        mealsPerDay: request.mealPlan.mealsPerDay,
        includeSnacks: request.mealPlan.includeSnacks,
        dietStyle: request.foodPreferences.dietStyle || 'tradicional',
        calories: request.nutritionTargets.calories
      }
    })
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
