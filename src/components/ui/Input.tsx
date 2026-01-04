'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  suffix?: string
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, required, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-200 mb-1.5"
        >
          {label}
          {required && <span className="text-primary-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3
              bg-gray-800/50
              border ${error ? 'border-red-500' : 'border-gray-700'}
              rounded-xl
              text-white
              placeholder-gray-500
              focus:outline-none focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-primary-500'}
              focus:border-transparent
              transition-all duration-200
              ${suffix ? 'pr-16' : ''}
              ${className}
            `}
            {...props}
          />

          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>

        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-400">{hint}</p>
        )}

        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
