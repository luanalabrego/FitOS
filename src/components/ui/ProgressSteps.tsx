'use client'

import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: string
  completedSteps: string[]
  onStepClick?: (stepId: string) => void
}

export function ProgressSteps({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full">
      {/* Mobile - Compact view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Passo {currentIndex + 1} de {steps.length}
          </span>
          <span className="text-sm font-medium text-white">
            {steps[currentIndex]?.label}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop - Full steps view */}
      <div className="hidden md:block">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isClickable =
              onStepClick && (isCompleted || index <= currentIndex)

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step indicator */}
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-full
                    font-semibold text-sm
                    transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-primary-500 text-white'
                        : isCurrent
                        ? 'bg-primary-500/20 text-primary-500 ring-2 ring-primary-500'
                        : 'bg-gray-700 text-gray-400'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Step label */}
                <span
                  className={`
                    ml-3 text-sm font-medium
                    ${isCurrent || isCompleted ? 'text-white' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-4
                      ${isCompleted ? 'bg-primary-500' : 'bg-gray-700'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
