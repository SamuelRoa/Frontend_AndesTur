import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import '@/styles/globals.css'

export const metadata = {
  title: 'AndesTur - Panel Administrativo',
  description: 'Sistema Administrativo de Agencia Turística',
  icons: {
    icon: '/Logo_andestur.png',
    apple: '/Logo_andestur.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
