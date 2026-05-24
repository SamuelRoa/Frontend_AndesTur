'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react'
import { staff, packages, destinations, vehicles, reservations } from '@/lib/api'

export function Dashboard() {
  const [stats, setStats] = useState(null)

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
        setStats({
          totalEmployees: staffData.data.length,
          totalDestinations: destData.data.length,
          totalPackages: pkgData.data.length,
          totalVehicles: vehData.data.length,
          totalReservations: resData.data.length,
          activeReservations: resData.data.filter(r => r.pay_state !== 'cancelled').length,
        })
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
    </div>
  )
}
