'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { AnalysisScores } from '@resumeai/shared-types'
import { useTheme } from 'next-themes'

interface ScoreRadarChartProps {
  scores: AnalysisScores
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const data = [
    { subject: 'ATS Score', value: scores.ats.value },
    { subject: 'Recrutador', value: scores.recruiter.value },
    { subject: 'Impacto', value: scores.impact.value },
    { subject: 'Clareza', value: scores.clarity.value },
    { subject: 'Formatação', value: scores.formatting.value },
    { subject: 'Keywords', value: scores.keyword.value },
    { subject: 'Profissional', value: scores.professionalism.value },
    { subject: 'Liderança', value: scores.leadership.value },
    { subject: 'Técnico', value: scores.technical.value },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid
            stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: isDark ? 'hsl(210, 20%, 80%)' : 'hsl(220, 8%, 35%)',
              fontSize: 10,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{
              fill: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontSize: 9,
            }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="hsl(252, 75%, 65%)"
            fill="hsl(252, 75%, 65%)"
            fillOpacity={isDark ? 0.25 : 0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
