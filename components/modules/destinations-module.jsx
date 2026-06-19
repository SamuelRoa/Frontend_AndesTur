'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { destinations } from '@/lib/api'
import { ExportButton } from '@/components/export-button'
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react'

export function DestinationsModule() {
  const [destinationsList, setDestinationsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newDestination, setNewDestination] = useState({
    id_municipality: '',
    name: '',
    description: '',
    image_url: '',
  })
  const [togglingActiveId, setTogglingActiveId] = useState(null)

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const res = await destinations.getAll()
      setDestinationsList(res.data)
    } catch (err) {
      console.error('Error loading destinations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  const filteredDestinations = destinationsList.filter((dest) => {
    const haystack = `${dest.name || ''} ${dest.description || ''} ${dest.id_municipality || ''}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const handleCreateDestination = async (event) => {
    event.preventDefault()
    if (!newDestination.id_municipality || !newDestination.name.trim() || !newDestination.description.trim()) return
    setIsSaving(true)
    try {
      await destinations.create({
        id_municipality: Number(newDestination.id_municipality),
        name: newDestination.name.trim(),
        description: newDestination.description.trim(),
        image_url: newDestination.image_url.trim() || null,
      })
      await loadDestinations()
      setIsCreateOpen(false)
      setNewDestination({ id_municipality: '', name: '', description: '', image_url: '' })
    } catch (err) {
      console.error('Error creating destination:', err)
      alert(err?.message || 'Error creando destino')
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (dest) => {
    setEditingDestination({ ...dest })
    setIsEditOpen(true)
  }

  const handleEditDestination = async (event) => {
    event.preventDefault()
    if (!editingDestination.id_municipality || !editingDestination.name.trim() || !editingDestination.description.trim()) return
    setIsSaving(true)
    try {
      await destinations.update(editingDestination.id_destination, {
        id_municipality: Number(editingDestination.id_municipality),
        name: editingDestination.name.trim(),
        description: editingDestination.description.trim(),
        image_url: editingDestination.image_url?.trim() || null,
      })
      await loadDestinations()
      setIsEditOpen(false)
      setEditingDestination(null)
    } catch (err) {
      console.error('Error updating destination:', err)
      alert(err?.message || 'Error actualizando destino')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDestination = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este destino?')) return
    try {
      await destinations.delete(id)
      await loadDestinations()
    } catch (err) {
      console.error('Error deleting destination:', err)
      alert(err?.message || 'Error eliminando destino')
    }
  }

  const handleToggleActive = async (dest) => {
    const nextActive = !Boolean(dest.activo)
    setTogglingActiveId(dest.id_destination)

    try {
      await destinations.update(dest.id_destination, { activo: nextActive })
      setDestinationsList((current) =>
        current.map((item) =>
          item.id_destination === dest.id_destination
            ? { ...item, activo: nextActive }
            : item,
        ),
      )
    } catch (err) {
      console.error('Error actualizando activo del destino:', err)
      alert(err?.message || 'Error actualizando estado del destino')
    } finally {
      setTogglingActiveId(null)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando destinos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Destinos Turísticos</h1>
          <p className="text-muted-foreground mt-1">Gestión de lugares y experiencias</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="destinos" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Destino
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo destino</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDestination} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination-name">Nombre del destino</Label>
                  <Input
                    id="destination-name"
                    value={newDestination.name}
                    onChange={(event) => setNewDestination((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Ej: Páramo la Culata"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-municipality">ID de municipio</Label>
                  <Input
                    id="destination-municipality"
                    type="number"
                    min="1"
                    value={newDestination.id_municipality}
                    onChange={(event) => setNewDestination((current) => ({ ...current, id_municipality: event.target.value }))}
                    placeholder="Ej: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-description">Descripción</Label>
                  <Textarea
                    id="destination-description"
                    value={newDestination.description}
                    onChange={(event) => setNewDestination((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe el destino"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-image-url">URL de imagen</Label>
                  <Input
                    id="destination-image-url"
                    value={newDestination.image_url}
                    onChange={(event) => setNewDestination((current) => ({ ...current, image_url: event.target.value }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-image-preview">Vista previa de imagen</Label>
                  <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-border flex items-center justify-center text-sm text-slate-500">
                    {newDestination.image_url ? (
                      <img src={newDestination.image_url} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      'Pega la URL de la imagen aquí para ver una vista previa'
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Crear destino'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDestinations.map((dest) => (
          <Card key={dest.id_destination} className="hover:shadow-lg transition-shadow border-border overflow-hidden">
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              {dest.image_url ? (
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
                  Sin imagen de fondo
                </div>
              )}
              <div
                className={
                  `absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    dest.activo ? 'bg-emerald-600' : 'bg-slate-600'
                  }`
                }
              >
                {dest.activo ? 'PUBLICADO' : 'BORRADOR'}
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {dest.name}
                  </CardTitle>
                  <CardDescription className="mt-1">Municipio ID: {dest.id_municipality}</CardDescription>
                </div>
                <Switch
                  checked={Boolean(dest.activo)}
                  onCheckedChange={() => handleToggleActive(dest)}
                  disabled={togglingActiveId === dest.id_destination}
                  className="border-border"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{dest.description}</p>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">Ruta de imagen:</span>{' '}
                {dest.image_url ? dest.image_url : 'No definida'}
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 border-border" onClick={() => openEditDialog(dest)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDestination(dest.id_destination)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDestinations.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">No se encontraron destinos</div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDestinations.length} de {destinationsList.length} destinos
      </div>

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingDestination(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar destino</DialogTitle>
          </DialogHeader>
          {editingDestination && (
            <form onSubmit={handleEditDestination} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-destination-name">Nombre del destino</Label>
                <Input
                  id="edit-destination-name"
                  value={editingDestination.name}
                  onChange={(event) => setEditingDestination((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination-municipality">ID de municipio</Label>
                <Input
                  id="edit-destination-municipality"
                  type="number"
                  min="1"
                  value={editingDestination.id_municipality}
                  onChange={(event) => setEditingDestination((current) => ({ ...current, id_municipality: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination-description">Descripción</Label>
                <Textarea
                  id="edit-destination-description"
                  value={editingDestination.description}
                  onChange={(event) => setEditingDestination((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination-image-url">URL de imagen</Label>
                <Input
                  id="edit-destination-image-url"
                  value={editingDestination.image_url || ''}
                  onChange={(event) => setEditingDestination((current) => ({ ...current, image_url: event.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label>Vista previa de imagen</Label>
                <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-border flex items-center justify-center text-sm text-slate-500">
                  {editingDestination.image_url ? (
                    <img src={editingDestination.image_url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    'Pega la URL de la imagen aquí para ver una vista previa'
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingDestination(null); }}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
