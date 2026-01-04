'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  options: RadioOption[]
  error?: string
  hint?: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  direction?: 'horizontal' | 'vertical'
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      error,
      hint,
      required,
      value,
      onChange,
      direction = 'vertical',
      name,
      className = '',
      ...props
    },
    ref
  ) => {
    const groupName = name || `radio-${label.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className={`w-full ${className}`}>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          {label}
          {required && <span className="text-primary-500 ml-1">*</span>}
        </label>

        <div
          className={`
            ${direction === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}
          `}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-start gap-3 p-3
                bg-gray-800/30
                border ${value === option.value ? 'border-primary-500' : 'border-gray-700'}
                rounded-xl
                cursor-pointer
                transition-all duration-200
                hover:bg-gray-800/50
                ${value === option.value ? 'ring-1 ring-primary-500/50' : ''}
              `}
            >
              <input
                ref={ref}
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="
                  mt-0.5 w-5 h-5
                  text-primary-500
                  bg-gray-800
                  border-gray-600
                  focus:ring-primary-500
                  focus:ring-offset-0
                "
                {...props}
              />
              <div className="flex-1">
                <span className="text-white font-medium">{option.label}</span>
                {option.description && (
                  <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        {hint && !error && (
          <p className="mt-2 text-sm text-gray-400">{hint}</p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
