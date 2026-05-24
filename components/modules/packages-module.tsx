'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockPackages, mockDestinations } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useState } from 'react'

export function PackagesModule() {
  const [packages] = useState(mockPackages)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDestinationName = (destId: string) => {
    return mockDestinations.find(d => d.id === destId)?.name || 'Destino desconocido'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Paquetes Turísticos</h1>
          <p className="text-muted-foreground mt-1">Gestión de ofertas y experiencias</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>{getDestinationName(pkg.destinationId)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Precio por Persona</p>
                  <p className="font-serif text-2xl font-bold text-primary">${pkg.price}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Duración</p>
                  <p className="font-serif text-2xl font-bold text-secondary">{pkg.durationDays} días</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Disponibilidad</span>
                  <span className="font-medium text-foreground">{pkg.availableSpots} de {pkg.maxCapacity}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(pkg.availableSpots / pkg.maxCapacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  pkg.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {pkg.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-border">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-border text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredPackages.length} de {packages.length} paquetes
      </div>
    </div>
  )
}
