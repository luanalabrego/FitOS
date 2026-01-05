'use client'

import { useEffect, useState } from 'react'

interface BMIScaleProps {
  bmi: number
  showValue?: boolean
  compact?: boolean
  animated?: boolean
}

const BMI_RANGES = [
  { min: 0, max: 18.5, label: 'Abaixo', color: '#60a5fa', shortLabel: 'BP' },
  { min: 18.5, max: 25, label: 'Normal', color: '#22c55e', shortLabel: 'OK' },
  { min: 25, max: 30, label: 'Sobrepeso', color: '#fbbf24', shortLabel: 'SP' },
  { min: 30, max: 35, label: 'Obesidade I', color: '#f97316', shortLabel: 'OB1' },
  { min: 35, max: 40, label: 'Obesidade II', color: '#ef4444', shortLabel: 'OB2' },
  { min: 40, max: 100, label: 'Obesidade III', color: '#dc2626', shortLabel: 'OB3' }
]

function getBMICategory(bmi: number) {
  return BMI_RANGES.find(range => bmi >= range.min && bmi < range.max) || BMI_RANGES[BMI_RANGES.length - 1]
}

function getPositionPercentage(bmi: number): number {
  // Mapeamos o BMI de 15-45 para 0-100%
  const minBMI = 15
  const maxBMI = 45
  const clamped = Math.min(maxBMI, Math.max(minBMI, bmi))
  return ((clamped - minBMI) / (maxBMI - minBMI)) * 100
}

export function BMIScale({ bmi, showValue = true, compact = false, animated = true }: BMIScaleProps) {
  const [position, setPosition] = useState(0)
  const category = getBMICategory(bmi)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setPosition(getPositionPercentage(bmi))
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setPosition(getPositionPercentage(bmi))
    }
  }, [bmi, animated])

  if (compact) {
    return (
      <div className="w-full">
        {/* Compact bar */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-800">
          <div className="absolute inset-0 flex">
            {BMI_RANGES.map((range, index) => (
              <div
                key={range.label}
                className="h-full"
                style={{
                  backgroundColor: range.color,
                  width: `${100 / BMI_RANGES.length}%`,
                  opacity: range.label === category.label ? 1 : 0.4
                }}
              />
            ))}
          </div>

          {/* Indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 shadow-lg z-10 ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
            style={{
              left: `${position}%`,
              transform: `translate(-50%, -50%)`,
              borderColor: category.color
            }}
          />
        </div>

        {/* Value and category */}
        {showValue && (
          <div className="flex items-center justify-between mt-2">
            <span
              className="text-lg font-bold"
              style={{ color: category.color }}
            >
              {bmi.toFixed(1)}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: category.color }}
            >
              {category.label}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Scale labels */}
      <div className="flex justify-between mb-1 px-1">
        {BMI_RANGES.map((range) => (
          <span
            key={range.label}
            className={`text-[10px] font-medium transition-all duration-300 ${
              range.label === category.label
                ? 'opacity-100 scale-110'
                : 'opacity-40'
            }`}
            style={{ color: range.color }}
          >
            {range.shortLabel}
          </span>
        ))}
      </div>

      {/* Scale bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-gray-800 shadow-inner">
        <div className="absolute inset-0 flex">
          {BMI_RANGES.map((range, index) => (
            <div
              key={range.label}
              className={`h-full transition-opacity duration-500 ${
                range.label === category.label ? 'opacity-100' : 'opacity-50'
              }`}
              style={{
                backgroundColor: range.color,
                width: `${100 / BMI_RANGES.length}%`
              }}
            />
          ))}
        </div>

        {/* Indicator with glow */}
        <div
          className={`absolute top-1/2 w-5 h-5 bg-white rounded-full border-2 shadow-lg z-10 ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{
            left: `${position}%`,
            transform: `translate(-50%, -50%)`,
            borderColor: category.color,
            boxShadow: `0 0 12px ${category.color}80, 0 2px 4px rgba(0,0,0,0.3)`
          }}
        />
      </div>

      {/* Current value display */}
      {showValue && (
        <div className="mt-3 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: category.color }}
            >
              {bmi.toFixed(1)}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: category.color }}
            >
              {category.label}
            </span>
          </div>
        </div>
      )}

      {/* Scale numbers */}
      <div className="flex justify-between mt-2 px-1 text-[10px] text-gray-500">
        <span>15</span>
        <span>20</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40+</span>
      </div>
    </div>
  )
}
