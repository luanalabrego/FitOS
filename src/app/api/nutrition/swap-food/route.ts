import { NextRequest, NextResponse } from 'next/server'

interface SwapRequest {
  currentFood: {
    name: string
    quantity: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  userRequest: string  // O que o usuário quer no lugar
  mealName: string     // "Café da Manhã", "Almoço", etc.
  dietStyle: string    // "tradicional", "cetogenica", etc.
  goalType: string     // "perda_peso", "ganho_massa", etc.
  targetCalories: number // Calorias aproximadas que o alimento deveria ter
}

export async function POST(request: NextRequest) {
  try {
    const body: SwapRequest = await request.json()
    const { currentFood, userRequest, mealName, dietStyle, goalType, targetCalories } = body

    if (!currentFood || !userRequest) {
      return NextResponse.json(
        { error: 'Alimento atual e solicitação são obrigatórios' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Fallback: sugestão simples baseada no request
      console.warn('OPENAI_API_KEY não configurada, retornando sugestão mock')
      return NextResponse.json({
        suggestion: generateMockSuggestion(currentFood, userRequest, targetCalories)
      })
    }

    // Usar GPT para sugerir substituição
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
            content: `Você é um nutricionista brasileiro especialista em substituições alimentares.
Sua função é sugerir uma substituição para um alimento da dieta do paciente.
A substituição deve:
1. Respeitar o estilo de dieta (${dietStyle})
2. Ter valor calórico similar (~${targetCalories} kcal)
3. Ser um alimento comum no Brasil
4. Atender ao pedido do usuário

Responda APENAS com um JSON válido no formato especificado.`
          },
          {
            role: 'user',
            content: `O paciente quer trocar "${currentFood.name}" (${currentFood.quantity}, ${currentFood.calories} kcal) na refeição "${mealName}".

Pedido do paciente: "${userRequest}"

Contexto:
- Estilo de dieta: ${dietStyle}
- Objetivo: ${goalType}
- Calorias alvo para este alimento: ~${targetCalories} kcal

Sugira UMA substituição adequada. Responda APENAS com este JSON:
{
  "name": "nome do alimento sugerido",
  "quantity": "quantidade recomendada",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "explanation": "breve explicação de por que esta é uma boa troca"
}`
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      console.error('Erro OpenAI:', await response.text())
      return NextResponse.json({
        suggestion: generateMockSuggestion(currentFood, userRequest, targetCalories)
      })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({
        suggestion: generateMockSuggestion(currentFood, userRequest, targetCalories)
      })
    }

    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const suggestion = JSON.parse(cleanContent)
      return NextResponse.json({ suggestion })
    } catch {
      console.error('Erro ao parsear resposta do GPT:', content)
      return NextResponse.json({
        suggestion: generateMockSuggestion(currentFood, userRequest, targetCalories)
      })
    }

  } catch (error) {
    console.error('Erro na API de troca de alimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para gerar sugestão mock
function generateMockSuggestion(
  currentFood: SwapRequest['currentFood'],
  userRequest: string,
  targetCalories: number
) {
  // Banco de sugestões simples
  const suggestions: Record<string, { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }> = {
    // Se pedir algo específico
    'frango': { name: 'Frango grelhado', quantity: '150g', calories: 250, protein: 40, carbs: 0, fat: 8 },
    'peixe': { name: 'Tilápia grelhada', quantity: '150g', calories: 180, protein: 35, carbs: 0, fat: 4 },
    'carne': { name: 'Patinho grelhado', quantity: '150g', calories: 240, protein: 38, carbs: 0, fat: 9 },
    'ovo': { name: 'Ovos mexidos', quantity: '3 unidades', calories: 210, protein: 18, carbs: 2, fat: 15 },
    'arroz': { name: 'Arroz integral', quantity: '100g cozido', calories: 130, protein: 3, carbs: 28, fat: 1 },
    'batata': { name: 'Batata doce', quantity: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
    'salada': { name: 'Salada verde com tomate', quantity: '150g', calories: 30, protein: 2, carbs: 5, fat: 0 },
    'iogurte': { name: 'Iogurte natural', quantity: '170g', calories: 100, protein: 10, carbs: 6, fat: 5 },
    'queijo': { name: 'Queijo minas', quantity: '40g', calories: 100, protein: 8, carbs: 1, fat: 7 },
    'pão': { name: 'Pão integral', quantity: '2 fatias', calories: 140, protein: 6, carbs: 24, fat: 2 },
    'tapioca': { name: 'Tapioca com queijo', quantity: '1 unidade média', calories: 180, protein: 7, carbs: 25, fat: 6 },
    'banana': { name: 'Banana', quantity: '1 média', calories: 105, protein: 1, carbs: 27, fat: 0 },
    'maçã': { name: 'Maçã', quantity: '1 média', calories: 80, protein: 0, carbs: 20, fat: 0 },
  }

  const lowerRequest = userRequest.toLowerCase()

  // Tentar encontrar correspondência no pedido
  for (const [key, value] of Object.entries(suggestions)) {
    if (lowerRequest.includes(key)) {
      return {
        ...value,
        explanation: `Sugestão baseada no seu pedido por ${key}`
      }
    }
  }

  // Sugestão padrão baseada nas calorias
  const isProtein = currentFood.protein > 15
  const isCarb = currentFood.carbs > 15

  if (isProtein) {
    return {
      name: 'Frango grelhado',
      quantity: `${Math.round(targetCalories / 1.7)}g`,
      calories: targetCalories,
      protein: Math.round(targetCalories * 0.6 / 4),
      carbs: 0,
      fat: Math.round(targetCalories * 0.4 / 9),
      explanation: 'Proteína magra de fácil preparo, sugerida como alternativa'
    }
  }

  if (isCarb) {
    return {
      name: 'Batata doce',
      quantity: `${Math.round(targetCalories / 0.86)}g`,
      calories: targetCalories,
      protein: 2,
      carbs: Math.round(targetCalories * 0.9 / 4),
      fat: 0,
      explanation: 'Carboidrato de baixo índice glicêmico, ótima opção para energia'
    }
  }

  // Padrão genérico
  return {
    name: userRequest || 'Opção alternativa',
    quantity: '100g',
    calories: targetCalories,
    protein: Math.round(targetCalories * 0.3 / 4),
    carbs: Math.round(targetCalories * 0.4 / 4),
    fat: Math.round(targetCalories * 0.3 / 9),
    explanation: 'Sugestão baseada nas calorias do alimento original'
  }
}
