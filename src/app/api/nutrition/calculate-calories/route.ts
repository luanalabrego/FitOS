import { NextRequest, NextResponse } from 'next/server'

interface FoodRequest {
  name: string
  grams: number
}

interface NutritionInfo {
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Database aproximada de calorias por 100g (fallback)
const FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  // Proteínas
  'frango': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'peito de frango': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'carne': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'carne moida': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'ovo': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'ovos': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'peixe': { calories: 120, protein: 22, carbs: 0, fat: 3 },
  'tilapia': { calories: 96, protein: 20, carbs: 0, fat: 1.7 },
  'salmao': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'atum': { calories: 130, protein: 28, carbs: 0, fat: 0.5 },
  'bacon': { calories: 541, protein: 37, carbs: 1.4, fat: 42 },

  // Carboidratos
  'arroz': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'arroz integral': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  'feijao': { calories: 127, protein: 8.7, carbs: 22, fat: 0.5 },
  'macarrao': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'pao': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'pao frances': { calories: 300, protein: 8, carbs: 58, fat: 3.1 },
  'batata': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'batata doce': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'aveia': { calories: 389, protein: 17, carbs: 66, fat: 7 },
  'tapioca': { calories: 130, protein: 0.2, carbs: 32, fat: 0 },

  // Frutas
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'maca': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'laranja': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  'abacate': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  'mamao': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  'morango': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },

  // Laticínios
  'leite': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'queijo': { calories: 350, protein: 25, carbs: 1.3, fat: 27 },
  'queijo minas': { calories: 264, protein: 17, carbs: 3, fat: 20 },
  'iogurte': { calories: 59, protein: 3.5, carbs: 5, fat: 3.3 },
  'iogurte grego': { calories: 97, protein: 9, carbs: 4, fat: 5 },
  'requeijao': { calories: 257, protein: 11, carbs: 2.5, fat: 23 },
  'manteiga': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },

  // Vegetais
  'alface': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'brocolis': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'cenoura': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'abobrinha': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'couve': { calories: 27, protein: 2.5, carbs: 4.4, fat: 0.4 },

  // Gorduras e outros
  'azeite': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'oleo de coco': { calories: 862, protein: 0, carbs: 0, fat: 100 },
  'castanha': { calories: 570, protein: 18, carbs: 30, fat: 44 },
  'amendoim': { calories: 567, protein: 26, carbs: 16, fat: 49 },
  'amendoas': { calories: 579, protein: 21, carbs: 22, fat: 50 },
}

export async function POST(request: NextRequest) {
  try {
    const { name, grams }: FoodRequest = await request.json()

    if (!name || !grams) {
      return NextResponse.json(
        { error: 'Nome e quantidade em gramas são obrigatórios' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Fallback para database local
      console.warn('OPENAI_API_KEY não configurada, usando database local')
      const nutrition = calculateFromDatabase(name, grams)
      return NextResponse.json({ nutrition })
    }

    // Usar GPT para calcular calorias
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
            content: `Você é um nutricionista especialista em tabelas nutricionais brasileiras.
Sua função é fornecer informações nutricionais precisas para alimentos.
Sempre responda APENAS com um JSON válido, sem texto adicional.
Use valores aproximados baseados em tabelas nutricionais brasileiras (TACO, IBGE).
Considere alimentos preparados de forma comum no Brasil.`
          },
          {
            role: 'user',
            content: `Calcule as informações nutricionais para ${grams}g de "${name}".

Responda APENAS com este JSON:
{
  "name": "${name}",
  "grams": ${grams},
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}

Substitua os zeros pelos valores corretos arredondados para inteiros.`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    })

    if (!response.ok) {
      console.error('Erro OpenAI:', await response.text())
      const nutrition = calculateFromDatabase(name, grams)
      return NextResponse.json({ nutrition })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      const nutrition = calculateFromDatabase(name, grams)
      return NextResponse.json({ nutrition })
    }

    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const nutrition: NutritionInfo = JSON.parse(cleanContent)
      return NextResponse.json({ nutrition })
    } catch {
      console.error('Erro ao parsear resposta do GPT:', content)
      const nutrition = calculateFromDatabase(name, grams)
      return NextResponse.json({ nutrition })
    }

  } catch (error) {
    console.error('Erro na API de cálculo de calorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para calcular usando database local
function calculateFromDatabase(name: string, grams: number): NutritionInfo {
  const normalizedName = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '')     // Remove caracteres especiais
    .trim()

  // Tentar encontrar correspondência exata ou parcial
  let foodInfo = FOOD_DATABASE[normalizedName]

  if (!foodInfo) {
    // Tentar encontrar correspondência parcial
    for (const [key, value] of Object.entries(FOOD_DATABASE)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        foodInfo = value
        break
      }
    }
  }

  // Se não encontrar, estimar com base em médias
  if (!foodInfo) {
    // Estimativa genérica (média de alimentos)
    foodInfo = { calories: 150, protein: 10, carbs: 15, fat: 5 }
  }

  const multiplier = grams / 100

  return {
    name,
    grams,
    calories: Math.round(foodInfo.calories * multiplier),
    protein: Math.round(foodInfo.protein * multiplier * 10) / 10,
    carbs: Math.round(foodInfo.carbs * multiplier * 10) / 10,
    fat: Math.round(foodInfo.fat * multiplier * 10) / 10
  }
}
