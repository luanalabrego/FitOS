'use client'

import { LucideIcon } from 'lucide-react'

interface GoalButtonProps {
  icon: LucideIcon
  label: string
  color: 'green' | 'blue' | 'orange'
  onClick?: () => void
}

const colorClasses = {
  green: 'from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-primary-500/25',
  blue: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25',
  orange: 'from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 shadow-orange-500/25',
}

export function GoalButton({ icon: Icon, label, color, onClick }: GoalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                 bg-gradient-to-br ${colorClasses[color]}
                 shadow-lg hover:shadow-xl hover:scale-105
                 transition-all duration-300 active:scale-95 min-w-[100px]`}
    >
      <Icon className="w-7 h-7" />
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </button>
  )
}
