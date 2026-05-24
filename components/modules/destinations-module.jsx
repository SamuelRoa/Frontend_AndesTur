'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockDestinations } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react'
import { useState } from 'react'

export function DestinationsModule() {
  const [destinations] = useState(mockDestinations)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Destinos Turísticos</h1>
          <p className="text-muted-foreground mt-1">Gestión de lugares y experiencias</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Destino
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, ubicación o país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDestinations.map((dest) => (
          <Card key={dest.id} className="hover:shadow-lg transition-shadow border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {dest.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{dest.country}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{dest.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="text-foreground font-medium">{dest.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Región:</span>
                  <span className="text-foreground font-medium">{dest.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coordenadas:</span>
                  <span className="text-foreground font-medium text-xs">
                    {dest.latitude.toFixed(2)}, {dest.longitude.toFixed(2)}
                  </span>
                </div>
              </div>

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
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDestinations.length} de {destinations.length} destinos
      </div>
    </div>
  )
}
