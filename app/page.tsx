'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/login-form'
import { SignupForm } from '@/components/signup-form'
import { Sidebar } from '@/components/sidebar'
import { Dashboard } from '@/components/dashboard'
import { EmployeesModule } from '@/components/modules/employees-module'
import { DestinationsModule } from '@/components/modules/destinations-module'
import { PackagesModule } from '@/components/modules/packages-module'
import { VehiclesModule } from '@/components/modules/vehicles-module'
import { ReservationsModule } from '@/components/modules/reservations-module'
import { FinancesModule } from '@/components/modules/finances-module'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  const [user, setUser] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [activeModule, setActiveModule] = useState('dashboard')

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />
      case 'employees':
        return <EmployeesModule />
      case 'destinations':
        return <DestinationsModule />
      case 'packages':
        return <PackagesModule />
      case 'vehicles':
        return <VehiclesModule />
      case 'reservations':
        return <ReservationsModule />
      case 'finances':
        return <FinancesModule />
      default:
        return <Dashboard />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-background via-background to-primary/5">
        {/* Theme Toggle - Login */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {mode === 'login' ? (
          <LoginForm onSuccess={(email) => setUser(email)} />
        ) : (
          <SignupForm onSuccess={(email) => setUser(email)} />
        )}
        <div className="fixed bottom-4 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Registrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onLogout={() => setUser(null)}
        userEmail={user}
      />
      <main className="lg:ml-64 p-8">
        {/* Theme Toggle & Breadcrumb Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground capitalize">{activeModule === 'dashboard' ? 'Dashboard' : activeModule}</p>
          <ThemeToggle />
        </div>
        {renderModule()}
      </main>
    </div>
  )
}
