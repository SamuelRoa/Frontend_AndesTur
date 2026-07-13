'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { trash } from '@/lib/api'
import { ModuleSkeleton } from '@/components/module-skeleton'
import { Trash2, RotateCcw, AlertTriangle, Search, ChevronLeft, ChevronRight, Users, MapPin, Package, Truck, Calendar, Shield, Building2 } from 'lucide-react'

const TABLE_ICONS = {
  customers: Users,
  destinations: MapPin,
  packages: Package,
  reservations: Calendar,
  staff: Users,
  users: Shield,
  vehicles: Truck,
}

const TABLE_LABELS = {
  all: 'Todos los tipos',
  customers: 'Clientes',
  destinations: 'Destinos',
  packages: 'Paquetes',
  reservations: 'Reservas',
  staff: 'Empleados',
  users: 'Usuarios',
  vehicles: 'Vehículos',
}

export function TrashModule() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [tableFilter, setTableFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  const loadTrash = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p }
      if (tableFilter && tableFilter !== 'all') params.table = tableFilter

      const res = await trash.getAll(params)
      setItems(res.data || [])
      if (res.pagination) {
        setPage(res.pagination.page)
        setTotalPages(res.pagination.totalPages)
        setTotal(res.pagination.total)
      }
    } catch (err) {
      toast.error(err.message || 'Error cargando papelera')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrash()
  }, [])

  useEffect(() => {
    loadTrash(1)
  }, [tableFilter])

  const handleRestore = async (id) => {
    try {
      const res = await trash.restore(id)
      toast.success(res.message || 'Elemento restaurado correctamente')
      loadTrash(page)
    } catch (err) {
      toast.error(err.message || 'Error restaurando elemento')
    }
  }

  const handlePermanentDelete = async () => {
    if (!confirmAction) return
    try {
      const res = await trash.permanentDelete(confirmAction.id)
      toast.success(res.message || 'Elemento eliminado permanentemente')
      setConfirmAction(null)
      loadTrash(page)
    } catch (err) {
      toast.error(err.message || 'Error eliminando elemento')
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      (item.summary || '').toLowerCase().includes(q) ||
      (item.typeLabel || '').toLowerCase().includes(q) ||
      String(item.record_id).includes(q)
    )
  })

  const daysUntilExpiration = (expiresAt) => {
    const now = new Date()
    const exp = new Date(expiresAt)
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return <ModuleSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Papelera</h1>
          <p className="text-muted-foreground mt-1">Elementos eliminados — expiran automáticamente después de 30 días</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en la papelera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border"
          />
        </div>
        <Select value={tableFilter} onValueChange={(v) => setTableFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 border-border">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TABLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">La papelera está vacía</p>
            <p className="text-sm text-muted-foreground">Los elementos eliminados aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Elemento</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Expira</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const Icon = TABLE_ICONS[item.table_name] || Trash2
                  const daysLeft = daysUntilExpiration(item.expires_at)
                  const data = item.data || {}

                  const details = []
                  if (data.email) details.push(data.email)
                  if (data.phone_number) details.push(data.phone_number)
                  if (data.plate) details.push(data.plate)

                  return (
                    <tr key={item.id_trash} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{item.typeLabel || item.table_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-foreground">{item.summary || `ID ${item.record_id}`}</div>
                        {details.length > 0 && (
                          <div className="text-xs text-muted-foreground">{details.join(' · ')}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Eliminado {new Date(item.deleted_at).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {daysLeft <= 0 ? (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">Expirado</span>
                        ) : daysLeft <= 3 ? (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {daysLeft}d restantes
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {daysLeft}d restantes
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleRestore(item.id_trash)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" /> Restaurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setConfirmAction({ type: 'permanentDelete', id: item.id_trash, name: item.summary })}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredItems.length} de {total} elementos
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => loadTrash(page - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="min-w-9" onClick={() => loadTrash(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => loadTrash(page + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmAction?.type === 'permanentDelete'}
        onConfirm={handlePermanentDelete}
        onCancel={() => setConfirmAction(null)}
        title="Eliminar permanentemente"
        message={`¿Estás seguro de eliminar permanentemente "${confirmAction?.name || 'este elemento'}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar permanentemente"
        cancelLabel="Cancelar"
        destructive
      />
    </div>
  )
}
