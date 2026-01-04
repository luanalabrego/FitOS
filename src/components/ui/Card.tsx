'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        bg-gray-800/30
        backdrop-blur-sm
        border border-gray-700
        rounded-2xl
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-primary-500/20 rounded-xl text-primary-500">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`mt-4 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  )
}
