'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold
      rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-primary-600 to-primary-700
        hover:from-primary-500 hover:to-primary-600
        text-white
        shadow-lg shadow-primary-500/25
        focus:ring-primary-500
      `,
      secondary: `
        bg-gray-700
        hover:bg-gray-600
        text-white
        focus:ring-gray-500
      `,
      outline: `
        border-2 border-primary-500
        text-primary-500
        hover:bg-primary-500/10
        focus:ring-primary-500
      `,
      ghost: `
        text-gray-400
        hover:text-white
        hover:bg-gray-800
        focus:ring-gray-500
      `,
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <svg
            className={`animate-spin ${iconSizes[size]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && leftIcon}
            {Icon && iconPosition === 'left' && (
              <Icon className={iconSizes[size]} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={iconSizes[size]} />
            )}
            {rightIcon && rightIcon}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
