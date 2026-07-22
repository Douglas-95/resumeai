'use client'

import { Moon, Sun, Bell, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-sm">
      {/* Breadcrumb / Page title slot */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">ResumeAI</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Alternar tema"
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notificações"
          id="notifications-btn"
        >
          <Bell className="h-4 w-4" />
        </motion.button>

        {/* User avatar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          aria-label="Perfil do usuário"
          id="user-profile-btn"
        >
          <User className="h-4 w-4" />
        </motion.button>
      </div>
    </header>
  )
}
