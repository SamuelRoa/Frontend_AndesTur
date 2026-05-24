'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { staff } from '@/lib/api'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

export function EmployeesModule() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    staff.getAll()
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Error loading staff:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Cargando empleados...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Empleados</h1>
          <p className="text-muted-foreground mt-1">Gestión de personal desde la base de datos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Apellido</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">DNI</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id_staff} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{emp.last_name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{emp.dni}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {emp.type === 'guide' ? 'Guía' : emp.type === 'driver' ? 'Conductor' : emp.type}
                    </span>
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
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredEmployees.length} de {employees.length} empleados
      </div>
    </div>
  )
}
