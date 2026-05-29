import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/lib/api'
import { User, Lock, Globe } from 'lucide-react'

export function ProfileDialog({ open, onClose, user, onSave }) {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await auth.updateProfile({
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      })
      if (onSave) onSave(profileForm)
      alert('Perfil actualizado correctamente')
      onClose()
    } catch (err) {
      alert(err?.message || 'Error actualizando perfil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Las contraseñas no coinciden')
      return
    }
    if (passwordForm.new_password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSaving(true)
    try {
      await auth.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      alert('Contraseña actualizada correctamente')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      alert(err?.message || 'Error cambiando contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de cuenta</DialogTitle>
          <DialogDescription>Administra tu perfil, contraseña y redes sociales</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Contraseña
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Redes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-username">Nombre de usuario</Label>
                <Input id="profile-username" name="username" value={profileForm.username} onChange={handleProfileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Correo electrónico</Label>
                <Input id="profile-email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" name="current_password" type="password" value={passwordForm.current_password} onChange={handlePasswordChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" name="new_password" type="password" value={passwordForm.new_password} onChange={handlePasswordChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input id="confirm-password" name="confirm_password" type="password" value={passwordForm.confirm_password} onChange={handlePasswordChange} required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Síguenos en nuestras redes sociales:</p>
              <div className="space-y-3">
                <a href="https://www.instagram.com/andestur_21/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">IG</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Instagram</p>
                    <p className="text-xs text-muted-foreground">@andestur_21</p>
                  </div>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61560503802533" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">FB</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Facebook</p>
                    <p className="text-xs text-muted-foreground">AndesTur</p>
                  </div>
                </a>
                <a href="https://x.com/AndesTur_21" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-sm">X</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">X (Twitter)</p>
                    <p className="text-xs text-muted-foreground">@AndesTur_21</p>
                  </div>
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
