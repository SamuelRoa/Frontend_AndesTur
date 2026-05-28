'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react'
import { staff, packages, destinations, vehicles, reservations } from '@/lib/api'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [reservationsByMonth, setReservationsByMonth] = useState([])
  const [reservationsByState, setReservationsByState] = useState([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [staffData, destData, pkgData, vehData, resData] = await Promise.all([
          staff.getAll(),
          destinations.getAll(),
          packages.getAll(),
          vehicles.getAll(),
          reservations.getAll(),
        ])
        
        const resList = resData.data || []
        
        setStats({
          totalEmployees: staffData.data?.length || 0,
          totalDestinations: destData.data?.length || 0,
          totalPackages: pkgData.data?.length || 0,
          totalVehicles: vehData.data?.length || 0,
          totalReservations: resList.length,
          activeReservations: resList.filter(r => r.pay_state !== 'cancelled' && r.pay_state !== 'expired').length,
        })

        // Procesamiento para Gráfica de Estados (Pie Chart)
        const stateCounts = { pending: 0, partial: 0, paid: 0, cancelled: 0, expired: 0 }
        resList.forEach(r => {
          if (stateCounts[r.pay_state] !== undefined) stateCounts[r.pay_state]++
        })
        
        setReservationsByState([
          { name: 'Pendiente', value: stateCounts.pending, color: '#F59E0B' }, // amber
          { name: 'Parcial', value: stateCounts.partial, color: '#3B82F6' }, // blue
          { name: 'Pagado', value: stateCounts.paid, color: '#10B981' }, // emerald
          { name: 'Cancelado', value: stateCounts.cancelled, color: '#EF4444' }, // red
          { name: 'Expirado', value: stateCounts.expired, color: '#6B7280' }, // gray
        ].filter(item => item.value > 0))

        // Procesamiento para Gráfica de Reservas por Mes (Bar Chart)
        const monthCounts = {}
        resList.forEach(r => {
          const date = new Date(r.reservation_date || r.created_at)
          // Formato: "Ene 2024"
          const monthYear = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')
          monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1
        })
        
        // Convertir a array y ordenar por fecha (simplificado asumiendo el orden natural)
        const chartData = Object.keys(monthCounts).map(month => ({
          month: month.charAt(0).toUpperCase() + month.slice(1), // Capitalizar
          reservas: monthCounts[month]
        }))
        setReservationsByMonth(chartData)

      } catch (err) {
        console.error('Error loading dashboard stats:', err)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Empleados en Nómina', value: stats?.totalEmployees ?? '...', icon: Users, iconColor: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Destinos Registrados', value: stats?.totalDestinations ?? '...', icon: MapPin, iconColor: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Paquetes Disponibles', value: stats?.totalPackages ?? '...', icon: Package, iconColor: 'text-teal-700 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/30' },
    { label: 'Vehículos en Flota', value: stats?.totalVehicles ?? '...', icon: Truck, iconColor: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Reservas Activas', value: stats?.activeReservations ?? '...', icon: Calendar, iconColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Total Reservas', value: stats?.totalReservations ?? '...', icon: DollarSign, iconColor: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel administrativo de AndesTur</p>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="font-serif text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sección de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Estado de las Reservas</CardTitle>
            <CardDescription>Distribución porcentual de los estados de pago</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsByState.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reservationsByState}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reservationsByState.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de reservas suficientes
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Evolución de Reservas</CardTitle>
            <CardDescription>Cantidad de reservas creadas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reservationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    cursor={{ fill: 'var(--muted)' }}
                  />
                  <Bar dataKey="reservas" fill="#0288D1" name="Reservas Nuevas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de reservas suficientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
