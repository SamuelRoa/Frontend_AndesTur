'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { customers, packages, reservations, paymentHeaders } from '@/lib/api'
import { ExportButton } from '@/components/export-button'
import { Plus, Edit2, Trash2, Search, CheckCircle, Clock } from 'lucide-react'

export function ReservationsModule() {
  const [reservationList, setReservationList] = useState([])
  const [customersList, setCustomersList] = useState([])
  const [packagesList, setPackagesList] = useState([])
  const [paymentHeaderList, setPaymentHeaderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newReservation, setNewReservation] = useState({
    id_package: '',
    id_customer: '',
    reservation_date: new Date().toISOString().slice(0, 10),
    pay_state: 'pending',
  })

  const loadReservations = async () => {
    setLoading(true)
    try {
      const [reservationRes, customerRes, packageRes, paymentHeaderRes] = await Promise.all([
        reservations.getAll(),
        customers.getAll(),
        packages.getAll(),
        paymentHeaders.getAll(),
      ])
      setReservationList(reservationRes.data)
      setCustomersList(customerRes.data)
      setPackagesList(packageRes.data)
      setPaymentHeaderList(paymentHeaderRes.data)
    } catch (err) {
      console.error('Error loading reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const customersById = Object.fromEntries(customersList.map((customer) => [customer.id_customer, customer]))
  const packagesById = Object.fromEntries(packagesList.map((pkg) => [pkg.id_package, pkg]))
  const paymentByReservationId = Object.fromEntries(
    paymentHeaderList.map((payment) => [payment.id_reservation, payment.total_amount]),
  )

  const normalizedReservations = reservationList.map((reservation) => {
    const customer = customersById[reservation.id_customer]
    const pkg = packagesById[reservation.id_package]
    return {
      ...reservation,
      customerName: customer?.name || 'Cliente no encontrado',
      customerEmail: customer?.email || 'Sin email',
      customerPhone: customer?.phone_number || 'Sin teléfono',
      packageName: pkg?.name || 'Paquete desconocido',
      departureDate: pkg?.departure_date || null,
      returnDate: pkg?.return_date || null,
      totalAmount: paymentByReservationId[reservation.id_reservation] ?? null,
    }
  })

  const filteredReservations = normalizedReservations.filter((reservation) => {
    const haystack = `${reservation.customerName} ${reservation.customerEmail} ${reservation.packageName}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const handleCreateReservation = async (event) => {
    event.preventDefault()
    if (!newReservation.id_package || !newReservation.id_customer) return
    setIsSaving(true)
    try {
      await reservations.create({
        id_package: Number(newReservation.id_package),
        id_customer: Number(newReservation.id_customer),
        reservation_date: newReservation.reservation_date,
        pay_state: newReservation.pay_state,
      })
      await loadReservations()
      setIsCreateOpen(false)
      setNewReservation({ id_package: '', id_customer: '', reservation_date: new Date().toISOString().slice(0, 10), pay_state: 'pending' })
    } catch (err) {
      console.error('Error creating reservation:', err)
      alert(err?.message || 'Error creando reserva')
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (res) => {
    setEditingReservation({ ...res })
    setIsEditOpen(true)
  }

  const handleEditReservation = async (event) => {
    event.preventDefault()
    if (!editingReservation.id_package || !editingReservation.id_customer) return
    setIsSaving(true)
    try {
      await reservations.update(editingReservation.id_reservation, {
        id_package: Number(editingReservation.id_package),
        id_customer: Number(editingReservation.id_customer),
        reservation_date: editingReservation.reservation_date,
        pay_state: editingReservation.pay_state,
      })
      await loadReservations()
      setIsEditOpen(false)
      setEditingReservation(null)
    } catch (err) {
      console.error('Error updating reservation:', err)
      alert(err?.message || 'Error actualizando reserva')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteReservation = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return
    try {
      await reservations.delete(id)
      await loadReservations()
    } catch (err) {
      console.error('Error deleting reservation:', err)
      alert(err?.message || 'Error eliminando reserva')
    }
  }

  const handleApproveReservation = async (id) => {
    if (!confirm('¿Estás seguro de aprobar y validar esta reserva? Se enviará un correo de confirmación al cliente.')) return
    setIsSaving(true)
    try {
      await reservations.update(id, { pay_state: 'paid' })
      await loadReservations()
    } catch (err) {
      console.error('Error approving reservation:', err)
      alert(err?.message || 'Error al aprobar la reserva')
    } finally {
      setIsSaving(false)
    }
  }

  const getPayStateLabel = (state) => {
    switch (state) {
      case 'paid': return 'Pagado'
      case 'partial': return 'Parcial'
      case 'cancelled': return 'Cancelado'
      case 'expired': return 'Expirado'
      default: return 'Pendiente'
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando reservas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestión de reservaciones de clientes</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportButton moduleName="reservas" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva reserva</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reservation-customer">Cliente</Label>
                  <Select value={newReservation.id_customer} onValueChange={(value) => setNewReservation((c) => ({ ...c, id_customer: value }))}>
                    <SelectTrigger id="reservation-customer" className="w-full">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customersList.map((customer) => (
                        <SelectItem key={customer.id_customer} value={String(customer.id_customer)}>
                          {customer.name} {customer.lastname || ''} ({customer.email || customer.dni})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservation-package">Paquete</Label>
                  <Select value={newReservation.id_package} onValueChange={(value) => setNewReservation((c) => ({ ...c, id_package: value }))}>
                    <SelectTrigger id="reservation-package" className="w-full">
                      <SelectValue placeholder="Selecciona un paquete" />
                    </SelectTrigger>
                    <SelectContent>
                      {packagesList.map((pkg) => (
                        <SelectItem key={pkg.id_package} value={String(pkg.id_package)}>{pkg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservation-date">Fecha de reserva</Label>
                    <Input id="reservation-date" type="date" value={newReservation.reservation_date} onChange={(e) => setNewReservation((c) => ({ ...c, reservation_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reservation-state">Estado de pago</Label>
                    <Select value={newReservation.pay_state} onValueChange={(value) => setNewReservation((c) => ({ ...c, pay_state: value }))}>
                      <SelectTrigger id="reservation-state" className="w-full">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Crear reserva'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por cliente, email o paquete..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id_reservation} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{reservation.customerName}</CardTitle>
                  <CardDescription>{reservation.packageName}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {reservation.pay_state === 'paid' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{reservation.customerEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="text-foreground">{reservation.customerPhone}</span>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserva:</span>
                  <span className="text-foreground font-medium">{new Date(reservation.reservation_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salida:</span>
                  <span className="text-foreground font-medium">{reservation.departureDate ? new Date(reservation.departureDate).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retorno:</span>
                  <span className="text-foreground font-medium">{reservation.returnDate ? new Date(reservation.returnDate).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-serif text-xl font-bold text-primary">{reservation.totalAmount ? `$${Number(reservation.totalAmount).toLocaleString()}` : 'Sin pagos'}</p>
                </div>
                <div className="space-y-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    reservation.pay_state === 'paid'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : reservation.pay_state === 'partial'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {getPayStateLabel(reservation.pay_state)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                {reservation.pay_state !== 'paid' && (
                  <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveReservation(reservation.id_reservation)} disabled={isSaving}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 border-border" onClick={() => openEditDialog(reservation)}>
                  <Edit2 className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10" onClick={() => handleDeleteReservation(reservation.id_reservation)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredReservations.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">No se encontraron reservas</div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">Mostrando {filteredReservations.length} de {reservationList.length} reservas</div>

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingReservation(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar reserva</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <form onSubmit={handleEditReservation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reservation-customer">Cliente</Label>
                <Select value={String(editingReservation.id_customer)} onValueChange={(value) => setEditingReservation((c) => ({ ...c, id_customer: value }))}>
                  <SelectTrigger id="edit-reservation-customer" className="w-full">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersList.map((customer) => (
                      <SelectItem key={customer.id_customer} value={String(customer.id_customer)}>
                        {customer.name} {customer.lastname || ''} ({customer.email || customer.dni})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reservation-package">Paquete</Label>
                <Select value={String(editingReservation.id_package)} onValueChange={(value) => setEditingReservation((c) => ({ ...c, id_package: value }))}>
                  <SelectTrigger id="edit-reservation-package" className="w-full">
                    <SelectValue placeholder="Selecciona un paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {packagesList.map((pkg) => (
                      <SelectItem key={pkg.id_package} value={String(pkg.id_package)}>{pkg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-reservation-date">Fecha de reserva</Label>
                  <Input id="edit-reservation-date" type="date" value={editingReservation.reservation_date ? editingReservation.reservation_date.slice(0, 10) : ''} onChange={(e) => setEditingReservation((c) => ({ ...c, reservation_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reservation-state">Estado de pago</Label>
                  <Select value={editingReservation.pay_state} onValueChange={(value) => setEditingReservation((c) => ({ ...c, pay_state: value }))}>
                    <SelectTrigger id="edit-reservation-state" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditingReservation(null); }}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
