'use client'

import { Users, MapPin, Package, Truck, Calendar, DollarSign, LogOut, Menu, X, LayoutDashboard, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileDialog } from '@/components/profile-dialog'
import { useState } from 'react'
import { Logo } from '@/components/logo'

export function Sidebar({ activeModule, onModuleChange, onLogout, userEmail, userName, onProfileUpdate, userRole }) {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'destinations', label: 'Destinos', icon: MapPin },
    { id: 'packages', label: 'Paquetes', icon: Package },
    { id: 'vehicles', label: 'Vehículos', icon: Truck },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    ...(userRole === 'admin' ? [{ id: 'users', label: 'Usuarios', icon: Shield }] : []),
  ]

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card border-border"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
            <Logo size={42} className="flex-shrink-0" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-sidebar-foreground leading-none">AndesTur</h1>
              <p className="text-xs text-sidebar-foreground/60 mt-1">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {modules.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onModuleChange(id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  activeModule === id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-sidebar-border p-4 space-y-3">
            <div className="flex items-center gap-3 px-2 py-2 bg-sidebar-accent rounded-lg">
              <button
                type="button"
                aria-label="Perfil de usuario"
                onClick={() => setProfileOpen(true)}
                className="focus:outline-none"
              >
                <Avatar>
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-sidebar-foreground/60">Conectado como</span>
                <span className="text-sm font-medium text-sidebar-foreground truncate">{userName || userEmail}</span>
              </div>
            </div>
            <ProfileDialog
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              user={{ username: userName, email: userEmail }}
              onSave={(data) => { setProfileOpen(false); if (onProfileUpdate) onProfileUpdate(data) }}
            />
            <Button
              onClick={() => {
                onLogout()
                setIsOpen(false)
              }}
              variant="outline"
              className="w-full justify-start border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
