import { NextRequest, NextResponse } from 'next/server'

interface DietParams {
  mealsPerDay: number
  includeSnacks: boolean
  dietStyle: string
  calories: number
}

interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface MealItem {
  name: string
  time: string
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, dietParams } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Se não tiver API key, retorna dieta mock para desenvolvimento
      console.warn('OPENAI_API_KEY não configurada, retornando dieta mock')
      return NextResponse.json({ diet: generateMockDiet(dietParams) })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista esportivo brasileiro experiente e rigoroso. Você SEMPRE segue EXATAMENTE as especificações do paciente, especialmente o estilo de dieta e número de refeições. Responda APENAS em JSON válido, sem markdown ou texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro OpenAI:', error)

      // Fallback para dieta mock se API falhar
      return NextResponse.json({ diet: generateMockDiet(dietParams) })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ diet: generateMockDiet(dietParams) })
    }

    // Tentar parsear JSON
    try {
      // Limpar possíveis caracteres extras
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const diet = JSON.parse(cleanContent)
      return NextResponse.json({ diet })
    } catch {
      console.error('Erro ao parsear resposta do GPT:', content)
      return NextResponse.json({ diet: generateMockDiet(dietParams) })
    }

  } catch (error) {
    console.error('Erro na API de nutrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Dieta mock para desenvolvimento/fallback
function generateMockDiet(params?: DietParams) {
  const mealsPerDay = params?.mealsPerDay || 4
  const dietStyle = params?.dietStyle || 'tradicional'
  const targetCalories = params?.calories || 2000

  const days = [
    { dayOfWeek: 'segunda', dayName: 'Segunda-feira' },
    { dayOfWeek: 'terca', dayName: 'Terça-feira' },
    { dayOfWeek: 'quarta', dayName: 'Quarta-feira' },
    { dayOfWeek: 'quinta', dayName: 'Quinta-feira' },
    { dayOfWeek: 'sexta', dayName: 'Sexta-feira' },
    { dayOfWeek: 'sabado', dayName: 'Sábado' },
    { dayOfWeek: 'domingo', dayName: 'Domingo' }
  ]

  // Gerar refeições baseadas no estilo de dieta
  const meals = generateMealsForStyle(dietStyle, mealsPerDay, targetCalories)

  return {
    days: days.map((day, index) => {
      const dayMeals = meals.map((meal: MealItem) => ({
        ...meal,
        foods: meal.foods.map((food: FoodItem, foodIndex: number) => ({
          ...food,
          // Pequena variação para cada dia
          name: variateFoodName(food.name, index, foodIndex)
        }))
      }))

      const totals = calculateDayTotals(dayMeals)

      return {
        ...day,
        meals: dayMeals,
        ...totals,
        tips: getTipsForDay(index, dietStyle)
      }
    })
  }
}

// Gera refeições baseadas no estilo de dieta
function generateMealsForStyle(dietStyle: string, mealsPerDay: number, _targetCalories: number): MealItem[] {

  // Refeições cetogênicas (alto fat, muito baixo carb)
  const ketoMeals = [
    {
      name: 'Café da Manhã',
      time: '07:00',
      foods: [
        { name: 'Ovos com bacon', quantity: '3 ovos + 50g bacon', calories: 380, protein: 25, carbs: 1, fat: 30 },
        { name: 'Abacate', quantity: '100g', calories: 160, protein: 2, carbs: 2, fat: 15 },
        { name: 'Café com óleo de coco', quantity: '200ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
      ],
      totalCalories: 630, totalProtein: 27, totalCarbs: 3, totalFat: 55
    },
    {
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Picanha grelhada', quantity: '200g', calories: 400, protein: 40, carbs: 0, fat: 26 },
        { name: 'Salada de folhas', quantity: '100g', calories: 15, protein: 1, carbs: 2, fat: 0 },
        { name: 'Azeite de oliva', quantity: '20ml', calories: 180, protein: 0, carbs: 0, fat: 20 },
        { name: 'Queijo coalho', quantity: '50g', calories: 150, protein: 12, carbs: 1, fat: 11 }
      ],
      totalCalories: 745, totalProtein: 53, totalCarbs: 3, totalFat: 57
    },
    {
      name: 'Lanche da Tarde',
      time: '16:00',
      foods: [
        { name: 'Castanhas mistas', quantity: '40g', calories: 260, protein: 6, carbs: 4, fat: 24 },
        { name: 'Queijo cheddar', quantity: '30g', calories: 120, protein: 8, carbs: 0, fat: 10 }
      ],
      totalCalories: 380, totalProtein: 14, totalCarbs: 4, totalFat: 34
    },
    {
      name: 'Jantar',
      time: '19:30',
      foods: [
        { name: 'Salmão grelhado', quantity: '180g', calories: 350, protein: 38, carbs: 0, fat: 22 },
        { name: 'Brócolis com manteiga', quantity: '150g', calories: 80, protein: 4, carbs: 6, fat: 5 },
        { name: 'Cream cheese', quantity: '30g', calories: 100, protein: 2, carbs: 1, fat: 10 }
      ],
      totalCalories: 530, totalProtein: 44, totalCarbs: 7, totalFat: 37
    }
  ]

  // Refeições low carb
  const lowCarbMeals = [
    {
      name: 'Café da Manhã',
      time: '07:00',
      foods: [
        { name: 'Omelete de queijo', quantity: '3 ovos + 30g queijo', calories: 320, protein: 22, carbs: 2, fat: 25 },
        { name: 'Tomate', quantity: '100g', calories: 18, protein: 1, carbs: 4, fat: 0 },
        { name: 'Café sem açúcar', quantity: '200ml', calories: 5, protein: 0, carbs: 1, fat: 0 }
      ],
      totalCalories: 343, totalProtein: 23, totalCarbs: 7, totalFat: 25
    },
    {
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Frango grelhado', quantity: '180g', calories: 280, protein: 45, carbs: 0, fat: 10 },
        { name: 'Couve-flor refogada', quantity: '150g', calories: 50, protein: 3, carbs: 8, fat: 2 },
        { name: 'Salada verde', quantity: '100g', calories: 20, protein: 2, carbs: 3, fat: 0 },
        { name: 'Azeite', quantity: '15ml', calories: 135, protein: 0, carbs: 0, fat: 15 }
      ],
      totalCalories: 485, totalProtein: 50, totalCarbs: 11, totalFat: 27
    },
    {
      name: 'Lanche da Tarde',
      time: '16:00',
      foods: [
        { name: 'Iogurte grego', quantity: '150g', calories: 130, protein: 15, carbs: 6, fat: 5 },
        { name: 'Amendoim', quantity: '20g', calories: 120, protein: 5, carbs: 3, fat: 10 }
      ],
      totalCalories: 250, totalProtein: 20, totalCarbs: 9, totalFat: 15
    },
    {
      name: 'Jantar',
      time: '19:30',
      foods: [
        { name: 'Peixe grelhado', quantity: '180g', calories: 220, protein: 40, carbs: 0, fat: 6 },
        { name: 'Abobrinha grelhada', quantity: '150g', calories: 30, protein: 2, carbs: 5, fat: 1 },
        { name: 'Aspargos', quantity: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 }
      ],
      totalCalories: 270, totalProtein: 44, totalCarbs: 9, totalFat: 7
    }
  ]

  // Refeições tradicionais
  const traditionalMeals = [
    {
      name: 'Café da Manhã',
      time: '07:00',
      foods: [
        { name: 'Pão integral', quantity: '2 fatias', calories: 140, protein: 6, carbs: 24, fat: 2 },
        { name: 'Ovos mexidos', quantity: '2 unidades', calories: 140, protein: 12, carbs: 1, fat: 10 },
        { name: 'Queijo branco', quantity: '30g', calories: 70, protein: 6, carbs: 1, fat: 5 },
        { name: 'Café com leite', quantity: '200ml', calories: 80, protein: 4, carbs: 8, fat: 4 }
      ],
      totalCalories: 430, totalProtein: 28, totalCarbs: 34, totalFat: 21
    },
    {
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Frango grelhado', quantity: '150g', calories: 250, protein: 40, carbs: 0, fat: 8 },
        { name: 'Arroz integral', quantity: '100g cozido', calories: 130, protein: 3, carbs: 28, fat: 1 },
        { name: 'Feijão', quantity: '80g cozido', calories: 100, protein: 6, carbs: 18, fat: 0 },
        { name: 'Salada verde', quantity: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 },
        { name: 'Azeite', quantity: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
      ],
      totalCalories: 590, totalProtein: 51, totalCarbs: 50, totalFat: 19
    },
    {
      name: 'Lanche da Tarde',
      time: '16:00',
      foods: [
        { name: 'Iogurte natural', quantity: '170g', calories: 100, protein: 10, carbs: 6, fat: 5 },
        { name: 'Banana', quantity: '1 média', calories: 105, protein: 1, carbs: 27, fat: 0 },
        { name: 'Aveia', quantity: '30g', calories: 115, protein: 4, carbs: 20, fat: 2 }
      ],
      totalCalories: 320, totalProtein: 15, totalCarbs: 53, totalFat: 7
    },
    {
      name: 'Jantar',
      time: '19:30',
      foods: [
        { name: 'Peixe grelhado', quantity: '150g', calories: 180, protein: 35, carbs: 0, fat: 4 },
        { name: 'Batata doce', quantity: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
        { name: 'Legumes refogados', quantity: '100g', calories: 50, protein: 2, carbs: 10, fat: 1 }
      ],
      totalCalories: 360, totalProtein: 39, totalCarbs: 40, totalFat: 5
    }
  ]

  // Selecionar o conjunto de refeições baseado no estilo
  let baseMeals
  switch (dietStyle) {
    case 'cetogenica':
      baseMeals = ketoMeals
      break
    case 'low_carb':
      baseMeals = lowCarbMeals
      break
    default:
      baseMeals = traditionalMeals
  }

  // Ajustar número de refeições
  return adjustMealsCount(baseMeals, mealsPerDay)
}

// Ajusta o número de refeições
function adjustMealsCount(baseMeals: MealItem[], targetCount: number): MealItem[] {
  if (targetCount <= baseMeals.length) {
    // Se precisamos de menos refeições, pegamos as principais
    const indices = getMainMealIndices(targetCount)
    return indices.map(i => baseMeals[i] || baseMeals[0])
  }

  // Se precisamos de mais, repetimos algumas
  return baseMeals.slice(0, targetCount)
}

// Retorna índices das refeições principais baseado na quantidade
function getMainMealIndices(count: number): number[] {
  switch (count) {
    case 1: return [1] // Almoço
    case 2: return [1, 3] // Almoço, Jantar
    case 3: return [0, 1, 3] // Café, Almoço, Jantar
    case 4: return [0, 1, 2, 3] // Todas as 4 base
    case 5: return [0, 1, 1, 2, 3] // Com lanche extra
    default: return [0, 1, 2, 3]
  }
}

// Variação de nome de alimento por dia
function variateFoodName(baseName: string, dayIndex: number, _foodIndex: number): string {
  const variations: Record<string, string[]> = {
    'Frango grelhado': ['Frango grelhado', 'Peito de frango', 'Sobrecoxa grelhada', 'Filé de frango'],
    'Peixe grelhado': ['Tilápia grelhada', 'Salmão', 'Pescada', 'Atum grelhado'],
    'Picanha grelhada': ['Picanha grelhada', 'Maminha', 'Contrafilé', 'Alcatra'],
    'Salmão grelhado': ['Salmão grelhado', 'Salmão ao forno', 'Truta', 'Robalo']
  }

  const options = variations[baseName]
  if (options) {
    return options[dayIndex % options.length]
  }
  return baseName
}

// Calcula totais do dia
function calculateDayTotals(meals: MealItem[]) {
  return {
    totalCalories: meals.reduce((sum, m) => sum + m.totalCalories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.totalProtein, 0),
    totalCarbs: meals.reduce((sum, m) => sum + m.totalCarbs, 0),
    totalFat: meals.reduce((sum, m) => sum + m.totalFat, 0)
  }
}

function getTipsForDay(dayIndex: number, dietStyle?: string): string[] {
  // Dicas específicas para dieta cetogênica
  if (dietStyle === 'cetogenica') {
    const ketoTips = [
      ['🥑 Aumente a ingestão de gorduras saudáveis', '💧 Beba bastante água - a cetose desidrata'],
      ['🧂 Reponha eletrólitos (sódio, potássio, magnésio)', '🥓 Bacon e ovos são seus aliados'],
      ['🥬 Foque em vegetais de baixo carb', '⚡ Se sentir fraqueza, aumente o sal'],
      ['🧀 Queijos são ótimas fontes de gordura', '🚫 Evite frutas (exceto abacate)'],
      ['🥜 Castanhas em moderação (cuidado com carbs)', '💪 Cetose preserva massa muscular'],
      ['🍳 Ovos são o alimento perfeito para keto', '📊 Monitore seus carbs líquidos'],
      ['🥩 Carnes gordas são preferíveis às magras', '🌿 Use ervas para dar sabor sem carbs']
    ]
    return ketoTips[dayIndex] || ketoTips[0]
  }

  // Dicas para low carb
  if (dietStyle === 'low_carb') {
    const lowCarbTips = [
      ['🥗 Substitua arroz por couve-flor', '💧 Mantenha a hidratação em dia'],
      ['🥚 Ovos são excelentes para saciedade', '🥑 Gorduras boas ajudam a controlar fome'],
      ['🥦 Vegetais verdes à vontade', '🚫 Evite açúcares e farinhas'],
      ['🍗 Proteínas em todas as refeições', '🥜 Castanhas são bons snacks'],
      ['🧀 Queijos com moderação', '🥬 Folhas verdes não contam carbs'],
      ['🍳 Café da manhã rico em proteína', '🥩 Carnes magras ou gordas, ambas ok'],
      ['📊 Conte os carbs, não as calorias', '💪 Proteína preserva músculos']
    ]
    return lowCarbTips[dayIndex] || lowCarbTips[0]
  }

  // Dicas tradicionais
  const allTips = [
    ['💧 Beba pelo menos 2.5L de água hoje!', '🥗 Capriche nas verduras do almoço'],
    ['💪 Dia de treino? Coma carboidratos 2h antes', '🍌 Potássio da banana ajuda na recuperação'],
    ['🥚 Ovos são ótima fonte de proteína e colina', '🥑 Gorduras boas ajudam na saciedade'],
    ['🍗 Varie as proteínas durante a semana', '🥦 Brócolis é rico em fibras e vitaminas'],
    ['🎉 Sexta! Se for ter um drink, modere nas calorias', '🍠 Batata doce é ótima para pré-treino'],
    ['😴 Fim de semana: mantenha a rotina alimentar', '🍳 Prepare suas marmitas para a semana'],
    ['📊 Domingo é dia de rever suas metas', '🥗 Cozinhe em batch para economizar tempo']
  ]
  return allTips[dayIndex] || allTips[0]
}
