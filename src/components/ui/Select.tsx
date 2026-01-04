'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, required, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-200 mb-1.5"
        >
          {label}
          {required && <span className="text-primary-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3
              bg-gray-800/50
              border ${error ? 'border-red-500' : 'border-gray-700'}
              rounded-xl
              text-white
              focus:outline-none focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-primary-500'}
              focus:border-transparent
              transition-all duration-200
              appearance-none
              cursor-pointer
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

Select.displayName = 'Select'
