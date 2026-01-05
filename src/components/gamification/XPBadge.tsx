'use client'

import { Zap } from 'lucide-react'

interface XPBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
}

export function XPBadge({ xp, size = 'md', showIcon = true, animated = true }: XPBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  }

  const styles = sizeClasses[size]

  return (
    <div
      className={`
        inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20
        border border-yellow-500/30 ${styles.container}
        ${animated ? 'hover:scale-105 transition-transform duration-200' : ''}
      `}
    >
      {showIcon && (
        <Zap className={`${styles.icon} text-yellow-400 fill-yellow-400`} />
      )}
      <span className={`${styles.text} font-bold text-yellow-400`}>
        {xp.toLocaleString()} XP
      </span>
    </div>
  )
}
