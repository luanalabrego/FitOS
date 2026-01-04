'use client'

import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5
                 hover:border-primary-500/50 hover:bg-gray-800/70 transition-all duration-300
                 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-500/20 rounded-xl shrink-0">
          <Icon className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
