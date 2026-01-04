'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, checked, ...props }, ref) => {
    const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className={`w-full ${className}`}>
        <label
          htmlFor={checkboxId}
          className={`
            flex items-start gap-3 p-3
            bg-gray-800/30
            border ${checked ? 'border-primary-500' : 'border-gray-700'}
            ${error ? 'border-red-500' : ''}
            rounded-xl
            cursor-pointer
            transition-all duration-200
            hover:bg-gray-800/50
            ${checked ? 'ring-1 ring-primary-500/50' : ''}
          `}
        >
          <div className="relative mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              className="sr-only"
              {...props}
            />
            <div
              className={`
                w-5 h-5
                rounded-md
                border-2
                ${checked ? 'bg-primary-500 border-primary-500' : 'bg-gray-800 border-gray-600'}
                transition-all duration-200
                flex items-center justify-center
              `}
            >
              {checked && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex-1">
            <span className="text-white font-medium">{label}</span>
            {description && (
              <p className="text-sm text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </label>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
