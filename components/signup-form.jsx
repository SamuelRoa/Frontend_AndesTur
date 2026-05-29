'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/logo'

export function SignupForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onSuccess({
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      })
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-2 flex flex-col items-center text-center">
        <Logo size={64} className="mb-2" />
        <CardTitle className="font-serif text-3xl text-primary">AndesTur</CardTitle>
        <CardDescription className="text-muted-foreground">Crear nueva cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Carlos"
                value={formData.firstName}
                onChange={handleChange}
                className="border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">Apellido</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="García"
                value={formData.lastName}
                onChange={handleChange}
                className="border-border focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@andetur.com"
              value={formData.email}
              onChange={handleChange}
              className="border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="border-border focus:ring-primary pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-9 text-muted-foreground hover:text-foreground focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border-border focus:ring-primary pr-10"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2 top-9 text-muted-foreground hover:text-foreground focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <a href="?mode=login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
