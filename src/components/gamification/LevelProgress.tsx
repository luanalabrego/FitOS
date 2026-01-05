'use client'

import { Trophy } from 'lucide-react'

interface LevelProgressProps {
  level: number
  currentXP: number
  requiredXP: number
  title?: string
}

const LEVEL_TITLES = [
  'Iniciante',
  'Dedicado',
  'Comprometido',
  'Guerreiro',
  'Disciplinado',
  'Expert',
  'Mestre',
  'Lenda'
]

export function LevelProgress({ level, currentXP, requiredXP, title }: LevelProgressProps) {
  const progress = (currentXP / requiredXP) * 100
  const levelTitle = title || LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">{level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 border-2 border-yellow-500 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-sm text-gray-400">Nivel</p>
            <p className="font-bold text-white">{levelTitle}</p>
          </div>
        </div>

        {/* XP */}
        <div className="text-right">
          <p className="text-sm text-gray-400">Proximo nivel</p>
          <p className="text-sm font-semibold text-primary-400">
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(100, progress)}%`,
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
          }}
        />
      </div>
    </div>
  )
}
