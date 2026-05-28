'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { auth } from '@/lib/api'

export function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [recoveryError, setRecoveryError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onSuccess(email, password)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e) => {
    e.preventDefault()

    if (!recoveryEmail) {
      setRecoveryError('Por favor ingresa tu email')
      return
    }

    if (!recoveryEmail.includes('@')) {
      setRecoveryError('Por favor ingresa un email válido')
      return
    }

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
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-2 flex flex-col items-center text-center">
          <Logo size={64} className="mb-2" />
          <CardTitle className="font-serif text-3xl text-primary">AndesTur</CardTitle>
          <CardDescription className="text-muted-foreground">Recuperar contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecovery} className="space-y-4">
            {recoveryError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                }}
                className="border-border focus:ring-primary"
              />
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
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-2 flex flex-col items-center text-center">
        <Logo size={64} className="mb-2" />
        <CardTitle className="font-serif text-3xl text-primary">AndesTur</CardTitle>
        <CardDescription className="text-muted-foreground">Sistema Administrativo de Agencia Turística</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
              }}
              className="border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="border-border focus:ring-primary"
            />
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

