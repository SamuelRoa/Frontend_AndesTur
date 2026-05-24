'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { packages, destinations } from '@/lib/api'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

export function PackagesModule() {
  const [packagesList, setPackagesList] = useState([])
  const [destinationsList, setDestinationsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [pkgRes, destRes] = await Promise.all([
          packages.getAll(),
          destinations.getAll(),
        ])
        setPackagesList(pkgRes.data)
        setDestinationsList(destRes.data)
      } catch (err) {
        console.error('Error loading packages:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredPackages = packagesList.filter(pkg =>
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando paquetes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Paquetes Turísticos</h1>
          <p className="text-muted-foreground mt-1">Gestión de ofertas desde la base de datos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id_package} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.departure_date && new Date(pkg.departure_date).toLocaleDateString('es-ES')}
                {pkg.return_date && ` - ${new Date(pkg.return_date).toLocaleDateString('es-ES')}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Precio por Persona</p>
                  <p className="font-serif text-2xl font-bold text-primary">${parseFloat(pkg.price).toLocaleString()}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Lugares Disponibles</p>
                  <p className="font-serif text-2xl font-bold text-secondary">{pkg.available_places ?? 'N/A'}</p>
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
        {filteredPackages.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No se encontraron paquetes
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredPackages.length} de {packagesList.length} paquetes
      </div>
    </div>
  )
}
