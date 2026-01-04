'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  showValue?: boolean
  valueFormat?: (value: number) => string
  marks?: { value: number; label: string }[]
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      error,
      hint,
      required,
      showValue = true,
      valueFormat,
      marks,
      className = '',
      id,
      min = 0,
      max = 100,
      value,
      ...props
    },
    ref
  ) => {
    const sliderId = id || `slider-${label.toLowerCase().replace(/\s/g, '-')}`
    const numValue = typeof value === 'string' ? parseFloat(value) : (value as number) || 0
    const numMin = typeof min === 'string' ? parseFloat(min) : min
    const numMax = typeof max === 'string' ? parseFloat(max) : max

    const percentage = ((numValue - numMin) / (numMax - numMin)) * 100

    const displayValue = valueFormat
      ? valueFormat(numValue)
      : numValue.toString()

    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={sliderId}
            className="block text-sm font-medium text-gray-200"
          >
            {label}
            {required && <span className="text-primary-500 ml-1">*</span>}
          </label>

          {showValue && (
            <span className="text-primary-500 font-semibold">
              {displayValue}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            ref={ref}
            type="range"
            id={sliderId}
            min={min}
            max={max}
            value={value}
            className={`
              w-full h-2
              bg-gray-700
              rounded-full
              appearance-none
              cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary-500
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              ${className}
            `}
            style={{
              background: `linear-gradient(to right, #22c55e ${percentage}%, #374151 ${percentage}%)`,
            }}
            {...props}
          />

          {marks && (
            <div className="relative w-full mt-2">
              {marks.map((mark) => {
                const markPercentage = ((mark.value - numMin) / (numMax - numMin)) * 100
                return (
                  <span
                    key={mark.value}
                    className="absolute text-xs text-gray-400 -translate-x-1/2"
                    style={{ left: `${markPercentage}%` }}
                  >
                    {mark.label}
                  </span>
                )
              })}
            </div>
          )}
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

Slider.displayName = 'Slider'
