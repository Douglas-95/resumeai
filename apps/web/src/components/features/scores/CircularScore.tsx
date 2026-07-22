'use client'

import { motion } from 'framer-motion'
import { getScoreLabel } from '@/lib/utils'

interface CircularScoreProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function CircularScore({
  score,
  size = 120,
  strokeWidth = 10,
  label,
}: CircularScoreProps) {
  const { colorClass, bgClass, label: scoreLabel } = getScoreLabel(score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const scoreColor =
    score >= 85
      ? 'hsl(142, 76%, 36%)'
      : score >= 70
        ? 'hsl(174, 63%, 40%)'
        : score >= 55
          ? 'hsl(43, 96%, 56%)'
          : score >= 40
            ? 'hsl(25, 95%, 53%)'
            : 'hsl(0, 84%, 60%)'

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circle indicator */}
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Animated active score circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Score number inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold tracking-tight"
          >
            {score}
          </motion.span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
            {scoreLabel}
          </span>
        </div>
      </div>

      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    </div>
  )
}
