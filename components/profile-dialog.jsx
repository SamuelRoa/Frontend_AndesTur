import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { auth } from '@/lib/api'
import { User, Lock, Camera, Trash2, Eye, EyeOff } from 'lucide-react'

export function ProfileDialog({ open, onClose, user, onSave }) {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const fileInputRef = useRef(null)
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    if (open) {
      setProfileForm({ username: user?.username || '', email: user?.email || '' })
      setAvatar(user?.avatar || null)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setTab('profile')
    }
  }, [open, user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => setAvatar(event.target.result)
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      }
      const originalAvatar = user?.avatar || null
      if (avatar !== originalAvatar) payload.avatar = avatar

      await auth.updateProfile(payload)
      if (onSave) onSave({ ...profileForm, avatar })
      toast.success('Perfil actualizado correctamente')
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Error actualizando perfil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSaving(true)
    try {
      await auth.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      toast.success('Contraseña actualizada correctamente')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err?.message || 'Error cambiando contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/40">
        <DialogHeader>
          <DialogTitle>Configuración de cuenta</DialogTitle>
          <DialogDescription>Administra tu perfil y contraseña</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Contraseña
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <Avatar className="size-24">
                    {avatar ? (
                      <AvatarImage src={avatar} alt="Foto de perfil" />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-muted">
                      <User className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Cambiar foto de perfil"
                  >
                    <Camera className="size-6 text-white" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-4 w-4 mr-1" /> Cargar foto
                  </Button>
                  {avatar && (
                    <Button type="button" variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setAvatar(null)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  )}
                </div>
              </div>
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
                <div className="relative">
                  <Input id="current-password" name="current_password" type={showPasswords.current ? 'text' : 'password'} value={passwordForm.current_password} onChange={handlePasswordChange} required className="pr-10" />
                  <button type="button" aria-label={showPasswords.current ? 'Ocultar' : 'Mostrar'} onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex={-1}>
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <div className="relative">
                  <Input id="new-password" name="new_password" type={showPasswords.new ? 'text' : 'password'} value={passwordForm.new_password} onChange={handlePasswordChange} required className="pr-10" />
                  <button type="button" aria-label={showPasswords.new ? 'Ocultar' : 'Mostrar'} onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex={-1}>
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input id="confirm-password" name="confirm_password" type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirm_password} onChange={handlePasswordChange} required className="pr-10" />
                  <button type="button" aria-label={showPasswords.confirm ? 'Ocultar' : 'Mostrar'} onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex={-1}>
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
