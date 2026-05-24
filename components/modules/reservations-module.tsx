'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockReservations, mockPackages } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Search, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'

export function ReservationsModule() {
  const [reservations] = useState(mockReservations)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReservations = reservations.filter(res =>
    res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPackageName = (pkgId: string) => {
    return mockPackages.find(p => p.id === pkgId)?.name || 'Paquete desconocido'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestión de reservaciones de clientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre de cliente o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReservations.map((res) => (
          <Card key={res.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{res.customerName}</CardTitle>
                  <CardDescription>{getPackageName(res.packageId)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {res.status === 'confirmed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Info */}
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{res.customerEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="text-foreground">{res.customerPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Personas:</span>
                  <span className="text-foreground font-medium">{res.numberOfPeople}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salida:</span>
                  <span className="text-foreground font-medium">
                    {new Date(res.departureDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retorno:</span>
                  <span className="text-foreground font-medium">
                    {new Date(res.returnDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-serif text-xl font-bold text-primary">${res.totalPrice}</p>
                </div>
                <div className="space-y-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    res.status === 'confirmed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {res.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    res.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : res.paymentStatus === 'pending'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {res.paymentStatus === 'paid' ? 'Pagado' : res.paymentStatus === 'pending' ? 'Pendiente' : 'No Pagado'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 border-border">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredReservations.length} de {reservations.length} reservas
      </div>
    </div>
  )
}
