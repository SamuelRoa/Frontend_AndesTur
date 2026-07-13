'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, LabelList, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react'
import { staff, packages, destinations, vehicles, reservations, states, municipalities, packagesDestinations, paymentHeaders } from '@/lib/api'

export function Dashboard({ onNavigate, userName }) {
  const [stats, setStats] = useState(null)
  const [reservationsByMonth, setReservationsByMonth] = useState([])
  const [reservationsByState, setReservationsByState] = useState([])
  const [revenueTrendData, setRevenueTrendData] = useState([])
  const [destinationStateData, setDestinationStateData] = useState([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [staffData, destData, pkgData, vehData, resData, statesData, munData, pkgDestData, payData] = await Promise.all([
          staff.getAll({ all: true }),
          destinations.getAll({ all: true }),
          packages.getAll({ all: true }),
          vehicles.getAll({ all: true }),
          reservations.getAll({ all: true }),
          states.getAll(),
          municipalities.getAll(),
          packagesDestinations.getAll(),
          paymentHeaders.getAll({ all: true }),
        ])
        
        const resList = resData.data || []
        
        // Map packages by ID
        const packageById = (pkgData.data || []).reduce((map, pkg) => {
          const id = pkg.id_package || pkg.id
          if (id) {
            map[id] = pkg
          }
          return map
        }, {})

        // Map payment amounts by reservation ID
        const paymentByResId = (payData.data || []).reduce((map, p) => {
          if (p.id_reservation) {
            const amount = Number(p.total_amount) || 0
            map[p.id_reservation] = (map[p.id_reservation] || 0) + amount
          }
          return map
        }, {})

        // Calculate total revenue from paid reservations using real payment amounts
        const totalRevenue = resList
          .filter(r => r.pay_state === 'paid')
          .reduce((sum, r) => {
            const paidAmount = paymentByResId[r.id_reservation]
            if (paidAmount) return sum + paidAmount
            const pkgId = r.id_package || r.package_id
            const pkg = packageById[pkgId]
            const price = pkg ? Number(pkg.price) : 0
            return sum + (Number.isFinite(price) ? price : 0)
          }, 0)

        const pendingReservations = resList.filter(r =>
          r.pay_state === 'pending'
        ).length

        const vehicleOccupancyRate = vehData.data?.length
          ? Math.min(100, Math.round((resList.length / vehData.data.length) * 100))
          : 0

        // Map packages to destination IDs
        const pkgDestList = pkgDestData.data || []
        const destIdsByPkgId = pkgDestList.reduce((map, pd) => {
          const pkgId = pd.id_package
          const destId = pd.id_destination
          if (pkgId && destId) {
            if (!map[pkgId]) map[pkgId] = []
            map[pkgId].push(destId)
          }
          return map
        }, {})

        // Calculate reservation counts per destination
        const destinationCounts = (resList || []).reduce((counts, reservation) => {
          const pkgId = reservation.id_package || reservation.package_id
          const destIds = destIdsByPkgId[pkgId] || []
          destIds.forEach(destId => {
            counts[destId] = (counts[destId] || 0) + 1
          })
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
        const topDestination = (destData.data || []).find(dest => (dest.id_destination ?? dest.id)?.toString() === topDestinationId?.toString())
        let popularDestinationLabel = 'Sin datos'
        if (topDestination) {
          const nameClean = sanitizeDestinationName(topDestination.name)
          const count = Number(destinationCounts[topDestination.id_destination ?? topDestination.id] ?? 0)
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
        
        const chartData = Object.keys(monthCounts).map(month => ({
          month: month.charAt(0).toUpperCase() + month.slice(1),
          reservas: monthCounts[month]
        }))
        setReservationsByMonth(chartData)

        // Compute revenue per month for line chart (Evolución de Ingresos Mensuales)
        // Solo se cuentan reservas pagadas (pay_state === 'paid'), usando el monto real de payment_headers o el precio del paquete
        const monthRevenue = {}
        resList
          .filter(r => r.pay_state === 'paid')
          .forEach(r => {
            const date = new Date(r.reservation_date || r.created_at)
            const monthYear = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')
            const paidAmount = paymentByResId[r.id_reservation]
            if (paidAmount) {
              monthRevenue[monthYear] = (monthRevenue[monthYear] || 0) + paidAmount
            } else {
              const pkgId = r.id_package || r.package_id
              const pkg = packageById[pkgId]
              const price = pkg ? Number(pkg.price) : 0
              if (Number.isFinite(price)) {
                monthRevenue[monthYear] = (monthRevenue[monthYear] || 0) + price
              }
            }
          })
        const revenueData = Object.keys(monthRevenue).map(month => ({
          month: month.charAt(0).toUpperCase() + month.slice(1),
          ingresos: monthRevenue[month]
        }))
        setRevenueTrendData(revenueData)

        // Compute destination counts per state for bar chart (Cantidad de Destinos por Estado)
        const stateNameById = (statesData.data || []).reduce((map, s) => {
          map[s.id_state] = s.name
          return map
        }, {})

        const stateIdByMunicipalityId = (munData.data || []).reduce((map, m) => {
          map[m.id_municipality] = m.id_state
          return map
        }, {})

        const destStateCounts = {}

        const destList = destData.data || []
        destList.forEach(dest => {
          const munId = dest.id_municipality
          const stateId = stateIdByMunicipalityId[munId]
          const stateName = stateNameById[stateId] || 'Sin datos'
          destStateCounts[stateName] = (destStateCounts[stateName] || 0) + 1
        })
        const destStateArray = Object.entries(destStateCounts)
          .map(([state, count]) => ({ state, count }))
          .sort((a, b) => b.count - a.count)
        setDestinationStateData(destStateArray)

      } catch (err) {
        console.error('Error loading dashboard stats:', err)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Ingresos Totales', value: stats?.totalRevenue != null ? `$${stats.totalRevenue.toLocaleString()}` : '...', icon: DollarSign, iconColor: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30', module: 'packages' },
    { label: 'Reservas Pendientes', value: stats?.pendingReservations ?? '...', icon: Calendar, iconColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30', module: 'reservations' },
    { label: 'Ocupación de Vehículos', value: stats?.vehicleOccupancyRate != null ? `${stats.vehicleOccupancyRate}%` : '...', icon: Truck, iconColor: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30', module: 'vehicles' },
    { label: 'Destino Popular', value: stats?.popularDestinationLabel ?? '...', icon: MapPin, iconColor: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30', valueClassName: 'font-serif text-3xl font-bold leading-tight whitespace-normal break-words', module: 'destinations' },
    { label: 'Reservas Activas', value: stats?.activeReservations ?? '...', icon: Calendar, iconColor: 'text-slate-700 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-900/30', module: 'reservations' },
    { label: 'Total Reservas', value: stats?.totalReservations ?? '...', icon: Package, iconColor: 'text-teal-700 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/30', module: 'reservations' },
  ]

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-5 w-80 mt-2 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-md p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
                <Skeleton className="size-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-4 w-56 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-1 tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground/80">Bienvenido al panel administrativo de AndesTur</p>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <button
              key={index}
              type="button"
              onClick={() => onNavigate?.(stat.module)}
              className="text-left rounded-xl border border-border/50 hover:shadow-float-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary bg-card/70 backdrop-blur-md glass-surface-soft"
            >
              <Card className="h-full bg-transparent shadow-none border-none">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`${stat.valueClassName ?? 'font-serif text-3xl font-bold tracking-tight'} text-foreground`}>{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-xl shadow-float-sm transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Sección de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-float-md hover:shadow-float-lg transition-all duration-300">
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
                    itemStyle={{ color: 'var(--foreground)' }}
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

        <Card className="border-border/50 shadow-float-md hover:shadow-float-lg transition-all duration-300">
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
                    itemStyle={{ color: 'var(--foreground)' }}
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
        <Card className="border-border/50 shadow-float-md hover:shadow-float-lg transition-all duration-300">
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
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#0288D1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-float-md hover:shadow-float-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Cantidad de Destinos por Estado</CardTitle>
            <CardDescription>Cantidad de destinos turísticos por estado</CardDescription>
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
                  itemStyle={{ color: 'var(--foreground)' }}
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

