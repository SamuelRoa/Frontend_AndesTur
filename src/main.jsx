const _origRemoveChild = Node.prototype.removeChild
Node.prototype.removeChild = function (child) {
  try {
    return _origRemoveChild.call(this, child)
  } catch {
    return child
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
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
  </React.StrictMode>,
)
