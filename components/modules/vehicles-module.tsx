'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockVehicles } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Search, Wrench } from 'lucide-react'
import { useState } from 'react'

export function VehiclesModule() {
  const [vehicles] = useState(mockVehicles)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVehicles = vehicles.filter(veh =>
    veh.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veh.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Vehículos</h1>
          <p className="text-muted-foreground mt-1">Gestión de flota y mantenimiento</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      {/* Table */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Placa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Modelo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Año</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Capacidad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Consumo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVehicles.map((veh) => (
                <tr key={veh.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{veh.plate}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{veh.model}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{veh.year}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{veh.capacity} pax</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{veh.fuelConsumption} L/km</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        veh.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {veh.status === 'active' ? 'Activo' : 'En Mantenimiento'}
                      </span>
                      {veh.status === 'maintenance' && <Wrench className="h-4 w-4 text-orange-600" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredVehicles.length} de {vehicles.length} vehículos
      </div>
    </div>
  )
}
