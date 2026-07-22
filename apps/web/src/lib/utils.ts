import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Standard shadcn/ui utility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a human-readable score label and color class based on score value.
 */
export function getScoreLabel(score: number): {
  label: string
  colorClass: string
  bgClass: string
} {
  if (score >= 85) return { label: 'Excelente', colorClass: 'text-score-excellent', bgClass: 'bg-score-excellent/10' }
  if (score >= 70) return { label: 'Bom', colorClass: 'text-score-good', bgClass: 'bg-score-good/10' }
  if (score >= 55) return { label: 'Regular', colorClass: 'text-score-average', bgClass: 'bg-score-average/10' }
  if (score >= 40) return { label: 'Fraco', colorClass: 'text-score-poor', bgClass: 'bg-score-poor/10' }
  return { label: 'Crítico', colorClass: 'text-score-bad', bgClass: 'bg-score-bad/10' }
}

/**
 * Format a date in Brazilian Portuguese.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
