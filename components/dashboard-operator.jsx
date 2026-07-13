'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { reservations, customers, packages, paymentHeaders, destinations } from '@/lib/api'
import { Calendar, DollarSign, Users, Package, MapPin, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PAY_STATE_LABELS = {
  pending: { label: 'Pendiente', class: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30' },
  partial: { label: 'Parcial', class: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  paid: { label: 'Pagado', class: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' },
  cancelled: { label: 'Cancelado', class: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30' },
  expired: { label: 'Expirado', class: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/30' },
  rejected: { label: 'Rechazado', class: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30' },
}

const ITEMS_PER_PAGE = 8

export function DashboardOperador({ onNavigate, userName }) {
  const [stats, setStats] = useState(null)
  const [allReservations, setAllReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [reservationsByMonth, setReservationsByMonth] = useState([])
  const [reservationsByState, setReservationsByState] = useState([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const results = await Promise.allSettled([
          reservations.getAll({ all: true }),
          customers.getAll({ all: true }),
          packages.getAll({ all: true }),
          paymentHeaders.getAll({ all: true }),
          destinations.getAll({ all: true }),
        ])

        const [resData, custData, pkgData, payData, destData] = results.map(
          (r) => (r.status === 'fulfilled' ? r.value : { data: [] })
        )

        const resList = resData.data || []
        const customersList = custData.data || []
        const packagesList = pkgData.data || []
        const paymentList = payData.data || []
        const destinationsList = destData.data || []

        const packageById = (packagesList).reduce((map, pkg) => {
          map[pkg.id_package] = pkg
          return map
        }, {})

        const customerById = (customersList).reduce((map, c) => {
          map[c.id_customer] = c
          return map
        }, {})

        const paymentByResId = (paymentList).reduce((map, p) => {
          map[p.id_reservation] = p.total_amount
          return map
        }, {})

        const pendingCount = resList.filter(r => r.pay_state === 'pending').length
        const paidCount = resList.filter(r => r.pay_state === 'paid').length
        const activeCount = resList.filter(r => r.pay_state !== 'cancelled' && r.pay_state !== 'expired').length

        setStats({
          totalReservations: resList.length,
          pendingReservations: pendingCount,
          paidReservations: paidCount,
          activeReservations: activeCount,
          totalCustomers: customersList.length,
          totalPackages: packagesList.length,
          totalDestinations: destinationsList.length,
        })

        const enriched = [...resList]
          .sort((a, b) => new Date(b.reservation_date || b.created_at) - new Date(a.reservation_date || a.created_at))
          .map(r => {
            const pkg = packageById[r.id_package]
            const customer = customerById[r.id_customer]
            return {
              ...r,
              customerName: customer?.name || 'Cliente no encontrado',
              customerEmail: customer?.email || '',
              packageName: pkg?.name || 'Paquete desconocido',
              packagePrice: pkg?.price != null ? Number(pkg.price) : null,
              paidAmount: paymentByResId[r.id_reservation] != null ? Number(paymentByResId[r.id_reservation]) : null,
            }
          })
        setAllReservations(enriched)

        const monthCounts = {}
        resList.forEach(r => {
          const date = new Date(r.reservation_date || r.created_at)
          const monthYear = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')
          monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1
        })

        setReservationsByMonth(
          Object.keys(monthCounts).map(month => ({
            month: month.charAt(0).toUpperCase() + month.slice(1),
            reservas: monthCounts[month]
          }))
        )

        const stateCounts = { pending: 0, partial: 0, paid: 0, cancelled: 0, expired: 0 }
        resList.forEach(r => {
          if (stateCounts[r.pay_state] !== undefined) stateCounts[r.pay_state]++
        })

        setReservationsByState([
          { name: 'Pendiente', value: stateCounts.pending, color: '#F59E0B' },
          { name: 'Parcial', value: stateCounts.partial, color: '#3B82F6' },
          { name: 'Pagado', value: stateCounts.paid, color: '#10B981' },
          { name: 'Cancelado', value: stateCounts.cancelled, color: '#EF4444' },
          { name: 'Expirado', value: stateCounts.expired, color: '#6B7280' },
        ].filter(item => item.value > 0))
      } catch (err) {
        console.error('Error loading operator dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalPages = Math.ceil(allReservations.length / ITEMS_PER_PAGE) || 1
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return allReservations.slice(start, start + ITEMS_PER_PAGE)
  }, [allReservations, page])

  useEffect(() => {
    setPage(1)
  }, [allReservations])

  const statCards = [
    { label: 'Reservas Activas', value: stats?.activeReservations ?? '...', icon: Calendar, iconColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30', module: 'reservations' },
    { label: 'Reservas Pendientes', value: stats?.pendingReservations ?? '...', icon: Clock, iconColor: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30', module: 'reservations' },
    { label: 'Reservas Pagadas', value: stats?.paidReservations ?? '...', icon: CheckCircle, iconColor: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', module: 'reservations' },
    { label: 'Total Reservas', value: stats?.totalReservations ?? '...', icon: Package, iconColor: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/30', module: 'reservations' },
    { label: 'Clientes', value: stats?.totalCustomers ?? '...', icon: Users, iconColor: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-900/30', module: 'users' },
    { label: 'Paquetes', value: stats?.totalPackages ?? '...', icon: DollarSign, iconColor: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/30', module: 'packages' },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-5 w-72 mt-2 rounded-md" />
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
          {Array.from({ length: 2 }).map((_, i) => (
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
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Panel del Operador</h1>
        <p className="text-muted-foreground">Bienvenido, {userName || 'Operador'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <button
              key={index}
              type="button"
              onClick={() => onNavigate?.(stat.module)}
              className="text-left rounded-xl border border-border hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Card className="h-full bg-transparent shadow-none border-none">
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
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Estado de las Reservas</CardTitle>
            <CardDescription>Distribución de estados de pago</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsByState.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={reservationsByState}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reservationsByState.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
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
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Reservas por Mes</CardTitle>
            <CardDescription>Cantidad de reservas creadas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reservationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    cursor={{ fill: 'var(--muted)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="reservas" fill="#C5A059" name="Reservas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reservas</CardTitle>
            <CardDescription>
              {stats?.totalReservations ?? 0} reservas en total — Página {page} de {totalPages}
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('reservations')}
            className="text-sm text-primary hover:underline"
          >
            Gestión completa
          </button>
        </CardHeader>
        <CardContent>
          {paginated.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reservas registradas
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Paquete</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Precio</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Pagado</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((res) => {
                      const stateInfo = PAY_STATE_LABELS[res.pay_state] || { label: res.pay_state, class: '' }
                      const diff = res.paidAmount != null && res.packagePrice != null
                        ? res.paidAmount - res.packagePrice
                        : null
                      return (
                        <tr key={res.id_reservation} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-medium text-foreground">{res.customerName}</div>
                            {res.customerEmail && (
                              <div className="text-xs text-muted-foreground">{res.customerEmail}</div>
                            )}
                          </td>
                          <td className="py-3 px-2 text-foreground">{res.packageName}</td>
                          <td className="py-3 px-2 text-right text-foreground">
                            {res.packagePrice != null ? `$${res.packagePrice.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {res.paidAmount != null ? (
                              <span className={`font-medium ${diff !== null && diff < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                ${res.paidAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${stateInfo.class}`}>
                              {stateInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-muted-foreground whitespace-nowrap">
                            {new Date(res.reservation_date || res.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, allReservations.length)} de {allReservations.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-[36px]"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      )
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Destinos</CardTitle>
            <CardDescription>{stats?.totalDestinations ?? 0} destinos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => onNavigate?.('destinations')}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" />
              Gestionar Destinos
            </button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Paquetes</CardTitle>
            <CardDescription>{stats?.totalPackages ?? 0} paquetes disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => onNavigate?.('packages')}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Package className="h-4 w-4" />
              Gestionar Paquetes
            </button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Clientes</CardTitle>
            <CardDescription>{stats?.totalCustomers ?? 0} clientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => onNavigate?.('reservations')}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Users className="h-4 w-4" />
              Ver Reservas
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
