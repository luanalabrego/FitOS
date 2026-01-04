import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

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
      return NextResponse.json({ diet: generateMockDiet() })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista esportivo brasileiro experiente. Responda apenas em JSON válido, sem markdown ou texto adicional.'
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
      return NextResponse.json({ diet: generateMockDiet() })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ diet: generateMockDiet() })
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
      return NextResponse.json({ diet: generateMockDiet() })
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
function generateMockDiet() {
  const days = [
    { dayOfWeek: 'segunda', dayName: 'Segunda-feira' },
    { dayOfWeek: 'terca', dayName: 'Terça-feira' },
    { dayOfWeek: 'quarta', dayName: 'Quarta-feira' },
    { dayOfWeek: 'quinta', dayName: 'Quinta-feira' },
    { dayOfWeek: 'sexta', dayName: 'Sexta-feira' },
    { dayOfWeek: 'sabado', dayName: 'Sábado' },
    { dayOfWeek: 'domingo', dayName: 'Domingo' }
  ]

  return {
    days: days.map((day, index) => ({
      ...day,
      meals: [
        {
          name: 'Café da Manhã',
          time: '07:00',
          foods: [
            { name: 'Ovos mexidos', quantity: '3 unidades', calories: 210, protein: 18, carbs: 2, fat: 15 },
            { name: 'Pão integral', quantity: '2 fatias', calories: 140, protein: 6, carbs: 24, fat: 2 },
            { name: 'Queijo cottage', quantity: '50g', calories: 50, protein: 6, carbs: 2, fat: 2 },
            { name: 'Café com leite', quantity: '200ml', calories: 80, protein: 4, carbs: 8, fat: 4 }
          ],
          totalCalories: 480,
          totalProtein: 34,
          totalCarbs: 36,
          totalFat: 23
        },
        {
          name: 'Lanche da Manhã',
          time: '10:00',
          foods: [
            { name: 'Banana', quantity: '1 média', calories: 105, protein: 1, carbs: 27, fat: 0 },
            { name: 'Pasta de amendoim', quantity: '20g', calories: 120, protein: 5, carbs: 4, fat: 10 }
          ],
          totalCalories: 225,
          totalProtein: 6,
          totalCarbs: 31,
          totalFat: 10
        },
        {
          name: 'Almoço',
          time: '12:30',
          foods: [
            { name: index % 2 === 0 ? 'Frango grelhado' : 'Patinho grelhado', quantity: '150g', calories: 250, protein: 40, carbs: 0, fat: 8 },
            { name: 'Arroz integral', quantity: '100g cozido', calories: 130, protein: 3, carbs: 28, fat: 1 },
            { name: 'Feijão', quantity: '80g cozido', calories: 100, protein: 6, carbs: 18, fat: 0 },
            { name: 'Salada verde', quantity: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 },
            { name: 'Azeite de oliva', quantity: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
          ],
          totalCalories: 590,
          totalProtein: 51,
          totalCarbs: 50,
          totalFat: 19
        },
        {
          name: 'Lanche da Tarde',
          time: '16:00',
          foods: [
            { name: 'Iogurte natural', quantity: '170g', calories: 100, protein: 10, carbs: 6, fat: 5 },
            { name: 'Granola', quantity: '30g', calories: 130, protein: 3, carbs: 22, fat: 4 },
            { name: 'Morango', quantity: '100g', calories: 32, protein: 1, carbs: 8, fat: 0 }
          ],
          totalCalories: 262,
          totalProtein: 14,
          totalCarbs: 36,
          totalFat: 9
        },
        {
          name: 'Jantar',
          time: '19:30',
          foods: [
            { name: index % 3 === 0 ? 'Salmão' : index % 3 === 1 ? 'Tilápia' : 'Omelete', quantity: '150g', calories: 220, protein: 35, carbs: 0, fat: 8 },
            { name: 'Batata doce', quantity: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
            { name: 'Brócolis', quantity: '100g', calories: 35, protein: 3, carbs: 7, fat: 0 },
            { name: 'Azeite', quantity: '5ml', calories: 45, protein: 0, carbs: 0, fat: 5 }
          ],
          totalCalories: 430,
          totalProtein: 40,
          totalCarbs: 37,
          totalFat: 13
        },
        {
          name: 'Ceia',
          time: '21:30',
          foods: [
            { name: 'Queijo cottage', quantity: '100g', calories: 100, protein: 12, carbs: 3, fat: 4 },
            { name: 'Castanha do Pará', quantity: '15g (3 unidades)', calories: 100, protein: 2, carbs: 2, fat: 10 }
          ],
          totalCalories: 200,
          totalProtein: 14,
          totalCarbs: 5,
          totalFat: 14
        }
      ],
      totalCalories: 2187,
      totalProtein: 159,
      totalCarbs: 195,
      totalFat: 88,
      tips: getTipsForDay(index)
    }))
  }
}

function getTipsForDay(dayIndex: number): string[] {
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
