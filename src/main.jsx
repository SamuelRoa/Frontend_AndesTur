const _origRemoveChild = Node.prototype.removeChild
Node.prototype.removeChild = function (child) {
  try {
    return _origRemoveChild.call(this, child)
  } catch {
    return child
  }
}

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import { LoadingScreen } from '@/components/loading-screen'
import '@/styles/globals.css'

function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  return 'http://localhost:3000'
}

function Root() {
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const checkBackend = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`${getApiBase()}/api/`)
          if (res.ok) {
            if (!cancelled) setBackendReady(true)
            return
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 3000))
      }
    }
    checkBackend()
    return () => { cancelled = true }
  }, [])

  if (!backendReady) {
    return <LoadingScreen />
  }

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <App />
            <Toaster richColors closeButton position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
