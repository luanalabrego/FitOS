'use client'

import { Activity } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-xl' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 rounded-full" />
        <Activity
          size={sizes[size].icon}
          className="text-primary-400 relative z-10"
          strokeWidth={2.5}
        />
      </div>
      <span className={`${sizes[size].text} font-bold`}>
        Fit<span className="text-primary-400">OS</span>
      </span>
    </div>
  )
}
