'use client'

import {
  Dumbbell,
  Apple,
  TrendingUp,
  Target,
  Flame,
  Heart,
  ChevronRight,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react'
import { Header, Logo, FeatureCard, GoalButton } from '@/components'

export default function Home() {
  return (
    <main className="min-h-screen pb-8">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 px-4 max-w-lg mx-auto">
        <div className="text-center py-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full scale-150" />
              <Logo size="lg" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
            Seu Sistema Operacional
            <br />
            <span className="text-primary-400">Fitness</span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
            Centralize treinos, alimentacao e resultados.
            Tudo mastigado para voce focar no que importa.
          </p>
        </div>

        {/* Goals Quick Selection */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-gray-500 text-xs uppercase tracking-wider text-center mb-4 font-medium">
            Qual seu objetivo?
          </p>
          <div className="flex justify-center gap-3">
            <GoalButton icon={Dumbbell} label="Ganhar Massa" color="green" />
            <GoalButton icon={Flame} label="Perder Peso" color="orange" />
            <GoalButton icon={Heart} label="Condicio-namento" color="blue" />
          </div>
        </div>

        {/* Stats Preview */}
        <div
          className="mt-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80
                     border border-gray-700/50 rounded-2xl p-5 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Visao Geral</h2>
            <span className="text-xs text-gray-500">Comece agora</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-primary-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">Treinos</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Apple className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">Refeicoes</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-gray-500">Progresso</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <h2 className="font-semibold text-lg mb-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
            O que o FitOS faz por voce
          </h2>

          <FeatureCard
            icon={Target}
            title="Plano Personalizado"
            description="Treinos e dietas adaptados ao seu objetivo, nivel e rotina."
            delay={600}
          />

          <FeatureCard
            icon={BarChart3}
            title="Acompanhamento Inteligente"
            description="Metricas claras para entender seu progresso real."
            delay={700}
          />

          <FeatureCard
            icon={Calendar}
            title="Rotina Simplificada"
            description="Saiba exatamente o que fazer cada dia, sem complicacao."
            delay={800}
          />
        </div>

        {/* CTA Button */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '900ms' }}>
          <button
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500
                       hover:from-primary-500 hover:to-primary-400
                       text-white font-semibold py-4 px-6 rounded-2xl
                       flex items-center justify-center gap-2
                       shadow-lg shadow-primary-500/25
                       hover:shadow-xl hover:shadow-primary-500/30
                       transition-all duration-300 active:scale-[0.98]"
          >
            Comecar Minha Jornada
            <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Gratis para comecar. Sem cartao de credito.
          </p>
        </div>
      </section>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </main>
  )
}
