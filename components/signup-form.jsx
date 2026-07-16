'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p) => /\d/.test(p) },
  { label: 'Al menos un carácter especial (!@#$%^&*)', test: (p) => /[!@#$%^&*]/.test(p) },
]

function validateName(value, label) {
  if (!value.trim()) return `${label} es requerido`
  if (value.trim().length < 2) return `${label} debe tener al menos 2 caracteres`
  return ''
}

function validateEmail(email) {
  if (!email.trim()) return 'El email es requerido'
  if (!email.includes('@')) return 'Ingresa un email válido (ej: usuario@correo.com)'
  return ''
}

function validatePassword(password) {
  if (!password) return 'La contraseña es requerida'
  const failed = PASSWORD_REQUIREMENTS.filter((r) => !r.test(password))
  if (failed.length > 0) return 'La contraseña no cumple los requisitos'
  return ''
}

function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Confirma tu contraseña'
  if (password !== confirm) return 'Las contraseñas no coinciden'
  return ''
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

export function SignupForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
    if (touched[name]) {
      let err = ''
      if (name === 'firstName' || name === 'lastName') err = validateName(value, name === 'firstName' ? 'El nombre' : 'El apellido')
      if (name === 'email') err = validateEmail(value)
      if (name === 'password') err = validatePassword(value)
      if (name === 'confirmPassword') err = validateConfirmPassword(formData.password, value)
      setFieldErrors((prev) => ({ ...prev, [name]: err }))
    }
    if (name === 'password' && touched.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.confirmPassword),
      }))
    }
  }

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    let err = ''
    if (name === 'firstName' || name === 'lastName') err = validateName(formData[name], name === 'firstName' ? 'El nombre' : 'El apellido')
    if (name === 'email') err = validateEmail(formData[name])
    if (name === 'password') err = validatePassword(formData[name])
    if (name === 'confirmPassword') err = validateConfirmPassword(formData.password, formData.confirmPassword)
    setFieldErrors((prev) => ({ ...prev, [name]: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const allTouched = { firstName: true, lastName: true, email: true, password: true, confirmPassword: true }
    setTouched(allTouched)

    const errors = {
      firstName: validateName(formData.firstName, 'El nombre'),
      lastName: validateName(formData.lastName, 'El apellido'),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    }
    setFieldErrors(errors)

    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors) return

    try {
      setLoading(true)
      setError('')
      await onSuccess({
        username: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
      })
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    cn('border-border focus:ring-primary', touched[field] && fieldErrors[field] && 'border-destructive focus-visible:ring-destructive')

  return (
    <Card className="w-full max-w-sm md:max-w-md border-border/40 shadow-float-xl backdrop-blur-2xl bg-card/75 glass-surface animate-float">
      <CardHeader className="space-y-2 flex flex-col items-center text-center">
        <Logo size={48} className="mb-2 drop-shadow-sm md:size-16" />
        <CardTitle className="font-serif text-2xl md:text-3xl text-primary">AndesTur</CardTitle>
        <CardDescription className="text-muted-foreground">Crear nueva cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Carlos"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={inputClass('firstName')}
              />
              <FieldError message={touched.firstName ? fieldErrors.firstName : ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">Apellido</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="García"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={inputClass('lastName')}
              />
              <FieldError message={touched.lastName ? fieldErrors.lastName : ''} />
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
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={inputClass('email')}
            />
            <FieldError message={touched.email ? fieldErrors.email : ''} />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={cn(inputClass('password'), 'pr-10')}
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
            <FieldError message={touched.password ? fieldErrors.password : ''} />
            {formData.password && (
              <div className="space-y-1 mt-2">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const ok = req.test(formData.password)
                  return (
                    <div key={req.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />} {req.label}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={cn(inputClass('confirmPassword'), 'pr-10')}
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
            <FieldError message={touched.confirmPassword ? fieldErrors.confirmPassword : ''} />
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
