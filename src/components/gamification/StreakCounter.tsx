'use client'

import { Flame } from 'lucide-react'

interface StreakCounterProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function StreakCounter({ days, size = 'md', showLabel = true }: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-1',
      icon: 'w-5 h-5',
      text: 'text-lg font-bold',
      label: 'text-[10px]'
    },
    md: {
      container: 'gap-2',
      icon: 'w-8 h-8',
      text: 'text-2xl font-bold',
      label: 'text-xs'
    },
    lg: {
      container: 'gap-3',
      icon: 'w-12 h-12',
      text: 'text-4xl font-bold',
      label: 'text-sm'
    }
  }

  const styles = sizeClasses[size]
  const isActive = days > 0

  return (
    <div className={`flex flex-col items-center ${styles.container}`}>
      <div className="relative">
        {/* Glow effect when active */}
        {isActive && (
          <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full scale-150 animate-pulse" />
        )}

        {/* Fire icon */}
        <div className={`relative flex items-center justify-center ${isActive ? 'animate-bounce-subtle' : ''}`}>
          <Flame
            className={`${styles.icon} ${isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-gray-600'}`}
            fill={isActive ? 'currentColor' : 'none'}
          />
        </div>
      </div>

      {/* Counter */}
      <span className={`${styles.text} ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
        {days}
      </span>

      {/* Label */}
      {showLabel && (
        <span className={`${styles.label} ${isActive ? 'text-orange-400' : 'text-gray-500'} uppercase tracking-wider`}>
          {days === 1 ? 'dia' : 'dias'}
        </span>
      )}
    </div>
  )
}
