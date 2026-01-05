'use client'

import { LucideIcon, ChevronRight } from 'lucide-react'

interface ActionButtonProps {
  label: string
  sublabel?: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  showArrow?: boolean
  badge?: string | number
  disabled?: boolean
  pulse?: boolean
}

const variants = {
  primary: {
    bg: 'from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400',
    shadow: 'shadow-primary-500/25 hover:shadow-primary-500/40',
    iconBg: 'bg-white/20',
    text: 'text-white'
  },
  secondary: {
    bg: 'from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500',
    shadow: 'shadow-black/25',
    iconBg: 'bg-white/10',
    text: 'text-white'
  },
  warning: {
    bg: 'from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400',
    shadow: 'shadow-orange-500/25 hover:shadow-orange-500/40',
    iconBg: 'bg-white/20',
    text: 'text-white'
  },
  success: {
    bg: 'from-green-600 to-green-500 hover:from-green-500 hover:to-green-400',
    shadow: 'shadow-green-500/25 hover:shadow-green-500/40',
    iconBg: 'bg-white/20',
    text: 'text-white'
  }
}

export function ActionButton({
  label,
  sublabel,
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'md',
  showArrow = true,
  badge,
  disabled = false,
  pulse = false
}: ActionButtonProps) {
  const style = variants[variant]

  const sizeClasses = {
    sm: {
      container: 'p-3 rounded-xl gap-3',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      text: 'text-sm',
      subtext: 'text-xs'
    },
    md: {
      container: 'p-4 rounded-2xl gap-4',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      text: 'text-base',
      subtext: 'text-sm'
    },
    lg: {
      container: 'p-5 rounded-2xl gap-4',
      icon: 'w-14 h-14',
      iconInner: 'w-7 h-7',
      text: 'text-lg',
      subtext: 'text-base'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full flex items-center bg-gradient-to-r ${style.bg}
        ${sizes.container} shadow-lg ${style.shadow}
        transition-all duration-300 active:scale-[0.98]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${pulse ? 'animate-pulse-subtle' : ''}
      `}
    >
      {/* Pulse ring for attention */}
      {pulse && (
        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping opacity-50" />
      )}

      {/* Icon */}
      <div className={`${sizes.icon} rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`${sizes.iconInner} ${style.text}`} />
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p className={`font-semibold ${sizes.text} ${style.text}`}>{label}</p>
        {sublabel && (
          <p className={`${sizes.subtext} ${style.text} opacity-80`}>{sublabel}</p>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold text-white">
          {badge}
        </span>
      )}

      {/* Arrow */}
      {showArrow && (
        <ChevronRight className={`w-5 h-5 ${style.text} opacity-60`} />
      )}
    </button>
  )
}
