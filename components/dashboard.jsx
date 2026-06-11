'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LabelList, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react'
import { staff, packages, destinations, vehicles, reservations } from '@/lib/api'

const revenueTrendData = [
  { month: 'Ene', ingresos: 7600 },
  { month: 'Feb', ingresos: 6800 },
  { month: 'Mar', ingresos: 10100 },
  { month: 'Abr', ingresos: 9200 },
  { month: 'May', ingresos: 7600 },
  { month: 'Jun', ingresos: 12000 },
  { month: 'Jul', ingresos: 22000 },
  { month: 'Ago', ingresos: 18000 },
  { month: 'Sep', ingresos: 9800 },
  { month: 'Oct', ingresos: 11500 },
  { month: 'Nov', ingresos: 14800 },
  { month: 'Dic', ingresos: 25200 },
]

const destinationStateData = [
  { state: 'Mérida', count: 18 },
  { state: 'Táchira', count: 14 },
  { state: 'Trujillo', count: 12 },
]

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
        const totalRevenue = resList.reduce((sum, reservation) => {
          const amount = Number(reservation.totalPrice ?? reservation.total_price ?? reservation.amount ?? reservation.price ?? 0)
          return sum + (Number.isFinite(amount) ? amount : 0)
        }, 0)

        const pendingReservations = resList.filter(r =>
          r.status === 'pending' || r.paymentStatus === 'pending' || r.pay_state === 'pending' || r.payment_status === 'pending'
        ).length

        const vehicleOccupancyRate = vehData.data?.length
          ? Math.min(100, Math.round((resList.length / vehData.data.length) * 100))
          : 0

        const packageById = (pkgData.data || []).reduce((map, pkg) => {
          map[pkg.id] = pkg
          return map
        }, {})

        const destinationCounts = (resList || []).reduce((counts, reservation) => {
          const pkg = packageById[reservation.packageId || reservation.package_id]
          const destinationId = pkg?.destinationId || pkg?.destination_id
          if (destinationId) {
            counts[destinationId] = (counts[destinationId] || 0) + 1
          }
          return counts
        }, {})

        const sanitizeDestinationName = (name) => {
          if (!name) return 'Destino'
          return name
            .replace(/\s*\([^)]*reservas[^)]*\)/gi, '') // remove parenthesis parts that mention "reservas"
            .replace(/reservas\s*indefinidas/gi, '') // remove literal phrase anywhere
            .replace(/\s{2,}/g, ' ') // collapse extra spaces
            .trim() || 'Destino'
        }

        const topDestinationId = Object.entries(destinationCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
        const topDestination = (destData.data || []).find(dest => dest.id === topDestinationId)
        let popularDestinationLabel = 'Sin datos'
        if (topDestination) {
          const nameClean = sanitizeDestinationName(topDestination.name)
          const count = Number(destinationCounts[topDestination.id] ?? 0)
          popularDestinationLabel = count > 0 ? `${nameClean} — ${count} reservas` : `${nameClean}`
        }

        setStats({
          totalRevenue,
          pendingReservations,
          vehicleOccupancyRate,
          popularDestinationLabel,
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
    { label: 'Ingresos Totales', value: stats?.totalRevenue != null ? `$${stats.totalRevenue.toLocaleString()}` : '...', icon: DollarSign, iconColor: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30' },
    { label: 'Reservas Pendientes', value: stats?.pendingReservations ?? '...', icon: Calendar, iconColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Ocupación de Vehículos', value: stats?.vehicleOccupancyRate != null ? `${stats.vehicleOccupancyRate}%` : '...', icon: Truck, iconColor: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Destino Popular', value: stats?.popularDestinationLabel ?? '...', icon: MapPin, iconColor: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30', valueClassName: 'font-serif text-3xl font-bold leading-tight whitespace-normal break-words' },
    { label: 'Reservas Activas', value: stats?.activeReservations ?? '...', icon: Calendar, iconColor: 'text-slate-700 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-900/30' },
    { label: 'Total Reservas', value: stats?.totalReservations ?? '...', icon: Package, iconColor: 'text-teal-700 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/30' },
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
                    <p className={`${stat.valueClassName ?? 'font-serif text-3xl font-bold'} text-foreground`}>{stat.value}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Evolución de Ingresos Mensuales</CardTitle>
            <CardDescription>(Facturación en USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#0288D1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Cantidad de Destinos por Estado</CardTitle>
            <CardDescription>Solo Mérida, Táchira y Trujillo del Andino</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={destinationStateData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="state" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  cursor={{ fill: 'var(--muted)' }}
                />
                <Bar dataKey="count" fill="#10B981" name="Destinos" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" className="text-xs fill-foreground" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

