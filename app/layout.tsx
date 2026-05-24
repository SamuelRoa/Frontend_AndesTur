import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'AndesTur - Panel Administrativo',
  description: 'Sistema Administrativo de Agencia Turística',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
