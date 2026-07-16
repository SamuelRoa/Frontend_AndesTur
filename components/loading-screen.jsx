'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const messages = [
  "Cargando...",
  "Trayendo registros de la base de datos...",
  "Preparando todo para ti...",
  "Casi listo...",
  "Trabajando en ello...",
  "Conectando con el servidor...",
  "Ya casi...",
]

export function LoadingScreen() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-premium" />

      <button
        onClick={toggle}
        className="fixed top-6 right-6 z-50 inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-2.5 text-foreground hover:bg-card hover:border-border transition-all duration-200 shadow-float-sm"
        aria-label="Cambiar tema"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <div className="relative animate-float">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-primary" />
          <img
            src="/Logo_andestur.png"
            alt="AndesTur"
            className="relative w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-foreground">
          AndesTur
        </h1>

        <div className="w-64 md:w-80">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ animation: 'panelLoadingBar 2s ease-in-out infinite' }}
            />
          </div>
        </div>

        <p className="text-sm md:text-base text-muted-foreground animate-pulse tracking-wide">
          {messages[messageIndex]}
        </p>
      </div>

      <style>{`@keyframes panelLoadingBar{0%{transform:translateX(-100%);width:30%}50%{transform:translateX(200%);width:60%}100%{transform:translateX(500%);width:30%}}`}</style>
    </div>
  )
}
