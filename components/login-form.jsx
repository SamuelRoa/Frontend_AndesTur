'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { auth } from '@/lib/api'
import { cn } from '@/lib/utils'

function validateEmail(email) {
  if (!email.trim()) return 'El email es requerido'
  if (!email.includes('@')) return 'Ingresa un email válido (ej: usuario@correo.com)'
  return ''
}

function validatePassword(password) {
  if (!password) return 'La contraseña es requerida'
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

export function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  const [recoveryFieldError, setRecoveryFieldError] = useState('')

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
    }
    if (field === 'password') {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    setFieldErrors({ email: emailErr, password: passErr })
    if (emailErr || passErr) return

    try {
      setLoading(true)
      setError('')
      await onSuccess(email, password)
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesión'
      if (msg.includes('desactivada')) {
        setError('Cuenta desactivada. Contacta al administrador para restablecer el acceso.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e) => {
    e.preventDefault()
    const err = validateEmail(recoveryEmail)
    setRecoveryFieldError(err)
    if (err) return

    try {
      setRecoveryLoading(true)
      setRecoveryError('')
      setRecoveryMessage('')
      const result = await auth.forgotPassword(recoveryEmail)
      setRecoveryMessage(result.message || 'Se han enviado las instrucciones a tu correo electrónico.')
    } catch (err) {
      setRecoveryError(err.message || 'Error al enviar la solicitud de recuperación')
    } finally {
      setRecoveryLoading(false)
    }
  }

  if (showRecovery) {
    return (
      <Card className="w-full max-w-sm md:max-w-md border-border/40 shadow-float-xl backdrop-blur-2xl bg-card/75 glass-surface">
        <CardHeader className="space-y-2 flex flex-col items-center text-center">
          <Logo size={48} className="mb-2 drop-shadow-sm md:size-16" />
          <CardTitle className="font-serif text-2xl md:text-3xl text-primary">AndesTur</CardTitle>
          <CardDescription className="text-muted-foreground">Recuperar contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecovery} noValidate className="space-y-4">
            {recoveryError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                {recoveryError}
              </div>
            )}

            {recoveryMessage && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                {recoveryMessage}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Ingresa tu correo electrónico y te enviaremos una nueva contraseña.
            </p>

            <div className="space-y-2">
              <Label htmlFor="recovery-email" className="text-foreground font-medium">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="tu@email.com"
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryEmail(e.target.value)
                  setRecoveryError('')
                  setRecoveryMessage('')
                  setRecoveryFieldError('')
                }}
                onBlur={() => setRecoveryFieldError(validateEmail(recoveryEmail))}
                className={cn('border-border focus:ring-primary', recoveryFieldError && 'border-destructive focus-visible:ring-destructive')}
              />
              <FieldError message={recoveryFieldError} />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" disabled={recoveryLoading}>
              {recoveryLoading ? 'Enviando...' : 'Enviar recuperación'}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowRecovery(false)
                  setRecoveryError('')
                  setRecoveryMessage('')
                  setRecoveryEmail('')
                  setRecoveryFieldError('')
                }}
                className="text-primary hover:underline font-medium"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm md:max-w-md border-border/40 shadow-float-xl backdrop-blur-2xl bg-card/75 glass-surface animate-float">
      <CardHeader className="space-y-2 flex flex-col items-center text-center">
        <Logo size={48} className="mb-2 drop-shadow-sm md:size-16" />
        <CardTitle className="font-serif text-2xl md:text-3xl text-primary">AndesTur</CardTitle>
        <CardDescription className="text-muted-foreground">Sistema Administrativo de Agencia Turística</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@andetur.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
                if (touched.email) setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))
              }}
              onBlur={() => handleBlur('email')}
              className={cn('border-border focus:ring-primary', touched.email && fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
            />
            <FieldError message={touched.email ? fieldErrors.email : ''} />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
                if (touched.password) setFieldErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }))
              }}
              onBlur={() => handleBlur('password')}
              className={cn('border-border focus:ring-primary pr-10', touched.password && fieldErrors.password && 'border-destructive focus-visible:ring-destructive')}
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
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              className="text-primary hover:underline font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
