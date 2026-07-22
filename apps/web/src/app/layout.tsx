import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ResumeAI — Análise Inteligente de Currículos',
    template: '%s | ResumeAI',
  },
  description:
    'Plataforma SaaS que analisa seu currículo com IA, gerando scores ATS, insights detalhados e sugestões de melhoria profissional.',
  keywords: ['currículo', 'ATS', 'análise de currículo', 'IA', 'inteligência artificial', 'carreira'],
  authors: [{ name: 'ResumeAI' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ResumeAI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
