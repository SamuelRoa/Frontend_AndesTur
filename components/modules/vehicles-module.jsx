'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { vehicles } from '@/lib/api'
import { ExportButton } from '@/components/export-button'
import { Plus, Edit2, Trash2, Search, Wrench, ChevronLeft, ChevronRight } from 'lucide-react'

export function VehiclesModule() {
  const [vehicleList, setVehicleList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    capacity: '',
    status: 'active',
  })

  const loadVehicles = async (p = 1) => {
    setLoading(true)
    try {
      const res = await vehicles.getAll({ page: p })
      setVehicleList(res.data)
      if (res.pagination) {
        setPage(res.pagination.page)
        setTotalPages(res.pagination.totalPages)
        setTotal(res.pagination.total)
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const filteredVehicles = vehicleList.filter((veh) => {
    const haystack = `${veh.plate || ''} ${veh.brand || ''} ${veh.model || ''}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    loadVehicles(p)
  }

  const handleCreateVehicle = async (event) => {
    event.preventDefault()
    if (!newVehicle.plate || !newVehicle.capacity) return
    setIsSaving(true)
    try {
      await vehicles.create({
        plate: newVehicle.plate.toUpperCase().trim(),
        brand: newVehicle.brand.trim() || undefined,
        model: newVehicle.model.trim() || undefined,
        capacity: Number(newVehicle.capacity),
        status: newVehicle.status.trim() || 'active',
      })
      await loadVehicles()
      setIsCreateOpen(false)
      setNewVehicle({ plate: '', brand: '', model: '', capacity: '', status: 'active' })
      toast.success('Vehículo creado correctamente')
    } catch (err) {
      console.error('Error creating vehicle:', err)
      toast.error(err?.message || 'Error creando vehículo')
    } finally {
      setIsSaving(false)
    }
  }

  const normalizeStatus = (status) => {
    if (status === 'true' || status === true) return 'active'
    if (status === 'false' || status === false) return 'maintenance'
    return status || 'active'
  }

  const openEditDialog = (veh) => {
    setEditingVehicle({ ...veh, status: normalizeStatus(veh.status) })
    setIsEditOpen(true)
  }

  const handleEditVehicle = async (event) => {
    event.preventDefault()
    if (!editingVehicle.plate || !editingVehicle.capacity) return
    setIsSaving(true)
    try {
      await vehicles.update(editingVehicle.id_vehicle, {
        plate: editingVehicle.plate.toUpperCase().trim(),
        brand: editingVehicle.brand?.trim() || undefined,
        model: editingVehicle.model?.trim() || undefined,
        capacity: Number(editingVehicle.capacity),
        status: editingVehicle.status?.trim() || 'active',
      })
      await loadVehicles()
      setIsEditOpen(false)
      setEditingVehicle(null)
      toast.success('Vehículo actualizado correctamente')
    } catch (err) {
      console.error('Error updating vehicle:', err)
      toast.error(err?.message || 'Error actualizando vehículo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteVehicle = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return
    try {
      await vehicles.delete(id)
      await loadVehicles()
      toast.success('Vehículo eliminado correctamente')
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      toast.error(err?.message || 'Error eliminando vehículo')
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando vehículos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Vehículos</h1>
          <p className="text-muted-foreground mt-1">Gestión de flota y mantenimiento</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="vehiculos" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Nuevo Vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo vehículo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVehicle} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-plate">Placa</Label>
                  <Input id="vehicle-plate" value={newVehicle.plate} onChange={(e) => setNewVehicle((c) => ({ ...c, plate: e.target.value }))} placeholder="Ej: ANDES-001" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-brand">Marca</Label>
                    <Input id="vehicle-brand" value={newVehicle.brand} onChange={(e) => setNewVehicle((c) => ({ ...c, brand: e.target.value }))} placeholder="Toyota" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Modelo</Label>
                    <Input id="vehicle-model" value={newVehicle.model} onChange={(e) => setNewVehicle((c) => ({ ...c, model: e.target.value }))} placeholder="Coaster" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-capacity">Capacidad</Label>
                    <Input id="vehicle-capacity" type="number" min="1" value={newVehicle.capacity} onChange={(e) => setNewVehicle((c) => ({ ...c, capacity: e.target.value }))} placeholder="22" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-status">Estado</Label>
                    <select
                      id="vehicle-status"
                      value={newVehicle.status}
                      onChange={(e) => setNewVehicle((c) => ({ ...c, status: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Activo</option>
                      <option value="maintenance">En Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Crear vehículo'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por placa o modelo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Placa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Marca</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Modelo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Capacidad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVehicles.map((veh) => {
                const isActive = veh.status === 'true' || veh.status === 'active'
                return (
                  <tr key={veh.id_vehicle} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{veh.plate}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{veh.brand || '—'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{veh.model || '—'}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{veh.capacity} pax</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {isActive ? 'Activo' : 'En Mantenimiento'}
                        </span>
                        {!isActive && <Wrench className="h-4 w-4 text-orange-600" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => openEditDialog(veh)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVehicle(veh.id_vehicle)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No se encontraron vehículos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Mostrando {filteredVehicles.length} de {total} vehículos</div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="min-w-9" onClick={() => goToPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingVehicle(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar vehículo</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <form onSubmit={handleEditVehicle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle-plate">Placa</Label>
                <Input id="edit-vehicle-plate" value={editingVehicle.plate} onChange={(e) => setEditingVehicle((c) => ({ ...c, plate: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle-brand">Marca</Label>
                  <Input id="edit-vehicle-brand" value={editingVehicle.brand || ''} onChange={(e) => setEditingVehicle((c) => ({ ...c, brand: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle-model">Modelo</Label>
                  <Input id="edit-vehicle-model" value={editingVehicle.model || ''} onChange={(e) => setEditingVehicle((c) => ({ ...c, model: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle-capacity">Capacidad</Label>
                  <Input id="edit-vehicle-capacity" type="number" min="1" value={editingVehicle.capacity} onChange={(e) => setEditingVehicle((c) => ({ ...c, capacity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle-status">Estado</Label>
                  <select
                    id="edit-vehicle-status"
                    value={editingVehicle.status || 'active'}
                    onChange={(e) => setEditingVehicle((c) => ({ ...c, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Activo</option>
                    <option value="maintenance">En Mantenimiento</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingVehicle(null); }}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
