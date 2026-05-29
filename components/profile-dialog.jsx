import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfileDialog({ open, onClose, user, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // Agrega más campos según tu modelo de usuario
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          {/* Agrega más campos aquí si es necesario */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
