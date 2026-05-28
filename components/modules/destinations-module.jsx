'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { destinations } from '@/lib/api'
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react'

export function DestinationsModule() {
  const [destinationsList, setDestinationsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newDestination, setNewDestination] = useState({
    id_municipality: '',
    name: '',
    description: '',
  })

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

    if (!newDestination.id_municipality || !newDestination.name.trim() || !newDestination.description.trim()) {
      return
    }

    setIsSaving(true)
    try {
      await destinations.create({
        id_municipality: Number(newDestination.id_municipality),
        name: newDestination.name.trim(),
        description: newDestination.description.trim(),
      })
      await loadDestinations()
      setIsCreateOpen(false)
      setNewDestination({ id_municipality: '', name: '', description: '' })
    } catch (err) {
      console.error('Error creating destination:', err, err?.message, err?.stack)
      alert(err?.message || JSON.stringify(err) || 'Error creando destino')
    } finally {
      setIsSaving(false)
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Crear destino'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          <Card key={dest.id_destination} className="hover:shadow-lg transition-shadow border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {dest.name}
                  </CardTitle>
                  <CardDescription className="mt-1">Municipio ID: {dest.id_municipality}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{dest.description}</p>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 border-border">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDestinations.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No se encontraron destinos
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDestinations.length} de {destinationsList.length} destinos
      </div>
    </div>
  )
}
