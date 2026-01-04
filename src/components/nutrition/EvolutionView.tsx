'use client'

import { useState, useEffect } from 'react'
import { DailyConsumption } from '@/types/nutrition'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  Award,
  BarChart3
} from 'lucide-react'

interface EvolutionViewProps {
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

// Obter todas as chaves de consumo do localStorage
const getConsumptionHistory = (): DailyConsumption[] => {
  const history: DailyConsumption[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('consumption_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.date) {
          history.push(data)
        }
      } catch {
        // Ignore invalid entries
      }
    }
  }
  return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Obter dias da semana atual
const getWeekDates = (weekOffset: number = 0): string[] => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)) // Segunda

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

// Obter dias do mês atual
const getMonthDates = (monthOffset: number = 0): string[] => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0)

  const dates: string[] = []
  for (let d = startOfMonth; d <= endOfMonth; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }
  return dates
}

export function EvolutionView({ calorieGoal, proteinGoal, carbsGoal, fatGoal }: EvolutionViewProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [offset, setOffset] = useState(0)
  const [history, setHistory] = useState<DailyConsumption[]>([])

  useEffect(() => {
    setHistory(getConsumptionHistory())
  }, [])

  const dates = viewMode === 'week' ? getWeekDates(offset) : getMonthDates(offset)

  // Mapear consumo por data
  const consumptionByDate = new Map<string, DailyConsumption>()
  history.forEach(c => consumptionByDate.set(c.date, c))

  // Calcular estatísticas do período
  const periodConsumptions = dates
    .map(d => consumptionByDate.get(d))
    .filter((c): c is DailyConsumption => c !== undefined)

  const totalCalories = periodConsumptions.reduce((sum, c) => sum + c.totalCalories, 0)
  const avgCalories = periodConsumptions.length > 0 ? Math.round(totalCalories / periodConsumptions.length) : 0
  const totalProtein = periodConsumptions.reduce((sum, c) => sum + c.totalProtein, 0)
  const avgProtein = periodConsumptions.length > 0 ? Math.round(totalProtein / periodConsumptions.length) : 0

  // Dias dentro da meta (±10%)
  const daysOnTarget = periodConsumptions.filter(c => {
    const percentage = (c.totalCalories / calorieGoal) * 100
    return percentage >= 90 && percentage <= 110
  }).length

  // Calcular tendência
  const trend = periodConsumptions.length >= 2
    ? periodConsumptions[periodConsumptions.length - 1].totalCalories - periodConsumptions[0].totalCalories
    : 0

  // Formatar título do período
  const getPeriodTitle = () => {
    if (viewMode === 'week') {
      const start = new Date(dates[0])
      const end = new Date(dates[6])
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`
    } else {
      const date = new Date(dates[0])
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
  }

  // Calcular altura da barra (max 100%)
  const getBarHeight = (calories: number) => {
    const percentage = (calories / calorieGoal) * 100
    return Math.min(percentage, 120) // Cap at 120% for visual
  }

  // Cor da barra baseada no consumo
  const getBarColor = (calories: number) => {
    const percentage = (calories / calorieGoal) * 100
    if (percentage < 70) return 'bg-yellow-500'
    if (percentage > 110) return 'bg-red-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          Evolução
        </h3>

        {/* Toggle semana/mês */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => { setViewMode('week'); setOffset(0) }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'week' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => { setViewMode('month'); setOffset(0) }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'month' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Navegação do período */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setOffset(offset - 1)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <span className="text-white font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {getPeriodTitle()}
        </span>
        <button
          onClick={() => setOffset(offset + 1)}
          disabled={offset >= 0}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Estatísticas do período */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{avgCalories}</p>
          <p className="text-xs text-gray-400">kcal/dia</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{daysOnTarget}</p>
          <p className="text-xs text-gray-400">na meta</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <span className="text-xl">🥩</span>
          <p className="text-lg font-bold text-white">{avgProtein}g</p>
          <p className="text-xs text-gray-400">prot/dia</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          {trend <= 0 ? (
            <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
          ) : (
            <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-1" />
          )}
          <p className={`text-lg font-bold ${trend <= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}
          </p>
          <p className="text-xs text-gray-400">tendência</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        {periodConsumptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum registro encontrado neste período</p>
            <p className="text-sm">Registre suas refeições para ver a evolução</p>
          </div>
        ) : (
          <>
            {/* Linha de meta */}
            <div className="relative h-40">
              <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-gray-500 z-10">
                <span className="absolute -top-2.5 right-0 text-xs text-gray-400 bg-gray-700 px-1">
                  Meta {calorieGoal}
                </span>
              </div>

              {/* Barras */}
              <div className="flex items-end justify-between h-full gap-1">
                {dates.map((date, index) => {
                  const consumption = consumptionByDate.get(date)
                  const dayOfWeek = new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)
                  const dayNum = new Date(date).getDate()
                  const isToday = date === new Date().toISOString().split('T')[0]

                  return (
                    <div
                      key={date}
                      className={`flex-1 flex flex-col items-center ${viewMode === 'month' && index > 6 ? 'hidden sm:flex' : ''}`}
                    >
                      <div className="w-full h-32 flex items-end justify-center">
                        {consumption ? (
                          <div
                            className={`w-full max-w-6 rounded-t transition-all ${getBarColor(consumption.totalCalories)}`}
                            style={{ height: `${getBarHeight(consumption.totalCalories) * 0.8}%` }}
                            title={`${consumption.totalCalories} kcal`}
                          />
                        ) : (
                          <div className="w-full max-w-6 h-1 bg-gray-600 rounded" />
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${isToday ? 'text-primary-400 font-bold' : 'text-gray-500'}`}>
                        {viewMode === 'week' ? dayOfWeek : dayNum}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legenda */}
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-400">Na meta</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-gray-400">Abaixo</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-400">Acima</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Conquistas */}
      {daysOnTarget >= 3 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">
              Parabéns! {daysOnTarget} dias na meta este período!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
