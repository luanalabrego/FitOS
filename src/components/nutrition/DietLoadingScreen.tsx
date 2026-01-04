'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChefHat, Sparkles } from 'lucide-react'

// Frases divertidas que vão rotacionar
const loadingPhrases = [
  { text: "Preparando sua dieta personalizada...", emoji: "🍽️" },
  { text: "Nosso nutricionista virtual está calibrando os macros...", emoji: "🧑‍🔬" },
  { text: "Calculando a quantidade perfeita de proteínas...", emoji: "🥩" },
  { text: "Selecionando os melhores alimentos para você...", emoji: "🥗" },
  { text: "Equilibrando carboidratos com precisão...", emoji: "🍚" },
  { text: "Adicionando um toque de sabor e saúde...", emoji: "✨" },
  { text: "Consultando a tabela nutricional...", emoji: "📊" },
  { text: "Organizando suas refeições da semana...", emoji: "📅" },
  { text: "Garantindo variedade no seu cardápio...", emoji: "🌈" },
  { text: "Finalizando os últimos detalhes...", emoji: "🎯" },
  { text: "Verificando se tudo está perfeito...", emoji: "✅" },
  { text: "A magia da nutrição está acontecendo...", emoji: "🪄" },
  { text: "Seu plano alimentar está quase pronto...", emoji: "🚀" },
  { text: "Misturando ciência com sabor...", emoji: "🔬" },
  { text: "Calculando calorias com carinho...", emoji: "💚" },
]

// Emojis de comida para animar
const foodEmojis = [
  "🍎", "🥑", "🥦", "🍗", "🥚", "🍌", "🥕", "🍇",
  "🥩", "🐟", "🥛", "🧀", "🥜", "🍚", "🥗", "🍳"
]

interface FloatingFood {
  id: number
  emoji: string
  left: number
  animationDelay: number
  animationType: number
  size: number
}

export function DietLoadingScreen() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [floatingFoods, setFloatingFoods] = useState<FloatingFood[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Gerar comidas flutuantes aleatórias
  useEffect(() => {
    const foods: FloatingFood[] = []
    for (let i = 0; i < 12; i++) {
      foods.push({
        id: i,
        emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationType: (i % 3) + 1,
        size: 24 + Math.random() * 24,
      })
    }
    setFloatingFoods(foods)

    // Trigger animation
    setTimeout(() => setIsVisible(true), 50)
  }, [])

  // Rotacionar frases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % loadingPhrases.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Simular progresso
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Progresso mais lento perto do final para não chegar a 100%
        if (prev >= 90) return prev + 0.1
        if (prev >= 70) return prev + 0.3
        if (prev >= 50) return prev + 0.5
        return prev + 1
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const currentPhrase = loadingPhrases[currentPhraseIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop com blur */}
      <div
        className={`absolute inset-0 bg-gray-900/95 backdrop-blur-xl transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />

      {/* Floating food emojis */}
      {floatingFoods.map((food) => (
        <div
          key={food.id}
          className={`absolute pointer-events-none ${
            food.animationType === 1 ? 'animate-float-food-1' :
            food.animationType === 2 ? 'animate-float-food-2' : 'animate-float-food-3'
          }`}
          style={{
            left: `${food.left}%`,
            top: `${20 + (food.id % 4) * 20}%`,
            fontSize: `${food.size}px`,
            animationDelay: `${food.animationDelay}s`,
            opacity: 0.6,
          }}
        >
          {food.emoji}
        </div>
      ))}

      {/* Conteúdo principal */}
      <div
        className={`relative z-10 flex flex-col items-center px-6 max-w-md mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Ícone principal animado */}
        <div className="relative mb-8">
          {/* Círculos de fundo animados */}
          <div className="absolute inset-0 -m-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 animate-pulse" />
          </div>
          <div className="absolute inset-0 -m-8">
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 animate-pulse-slow" />
          </div>

          {/* Ícone do chef */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-bounce-slow shadow-2xl shadow-primary-500/30">
            <ChefHat className="w-12 h-12 text-white" />

            {/* Sparkles ao redor */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Criando Sua Dieta
        </h2>

        {/* Frase atual com animação */}
        <div className="h-16 flex items-center justify-center mb-8">
          <div
            key={currentPhraseIndex}
            className="text-center animate-fade-in"
          >
            <span className="text-3xl mb-2 block">{currentPhrase.emoji}</span>
            <p className="text-gray-300 text-sm sm:text-base px-4">
              {currentPhrase.text}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full max-w-xs mb-6">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full transition-all duration-300 animate-shimmer"
              style={{
                width: `${Math.min(progress, 95)}%`,
                backgroundSize: '200% 100%'
              }}
            />
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            {Math.min(Math.round(progress), 95)}%
          </p>
        </div>

        {/* Loader adicional */}
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          <span className="text-sm">Aguarde um momento...</span>
        </div>

        {/* Dica */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 max-w-sm">
          <p className="text-xs text-gray-400 text-center">
            <span className="text-primary-400 font-medium">Dica:</span> Nossa IA analisa
            suas preferências e objetivos para criar um plano alimentar único para você.
          </p>
        </div>
      </div>
    </div>
  )
}
