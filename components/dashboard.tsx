'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react'
import { dashboardStats, mockFinancialData } from '@/lib/mock-data'

export function Dashboard() {
  const stats = [
    {
      label: 'Empleados en Nómina',
      value: dashboardStats.totalEmployees,
      icon: Users,
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      label: 'Destinos Registrados',
      value: dashboardStats.totalDestinations,
      icon: MapPin,
      iconColor: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'Paquetes Disponibles',
      value: dashboardStats.totalPackages,
      icon: Package,
      iconColor: 'text-teal-700 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    },
    {
      label: 'Vehículos en Flota',
      value: dashboardStats.totalVehicles,
      icon: Truck,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    },
    {
      label: 'Ingresos Generales',
      value: `$${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    },
    {
      label: 'Reservas Activas',
      value: dashboardStats.activeReservations,
      icon: Calendar,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel administrativo de AndesTur</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-primary font-bold">Ingresos por Mes</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFinancialData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" name="Ingresos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#06b6d4" name="Gastos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-primary font-bold">Ganancia Neta</CardTitle>
            <CardDescription>Tendencia de ganancias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockFinancialData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#0288D1" 
                  name="Ganancia"
                  strokeWidth={2}
                  dot={{ fill: '#0288D1', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-4xl font-bold text-emerald-700 dark:text-emerald-400">{dashboardStats.occupancyRate}%</p>
            <p className="text-xs text-muted-foreground mt-2">De capacidad total</p>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-4xl font-bold text-cyan-700 dark:text-cyan-400">{dashboardStats.totalReservations}</p>
            <p className="text-xs text-muted-foreground mt-2">Este período</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Destinos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-4xl font-bold text-teal-700 dark:text-teal-400">{dashboardStats.totalDestinations}</p>
            <p className="text-xs text-muted-foreground mt-2">Disponibles para reservar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
