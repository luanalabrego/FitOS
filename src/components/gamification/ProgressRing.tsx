'use client'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
  showPercentage?: boolean
  animated?: boolean
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#22c55e',
  bgColor = '#374151',
  children,
  showPercentage = false,
  animated = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          className="opacity-30"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
          style={{
            filter: progress > 0 ? `drop-shadow(0 0 6px ${color}50)` : 'none'
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-2xl font-bold text-white">
            {Math.round(clampedProgress)}%
          </span>
        ))}
      </div>
    </div>
  )
}
