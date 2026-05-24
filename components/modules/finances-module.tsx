'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockFinancialData } from '@/lib/mock-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function FinancesModule() {
  const totalRevenue = mockFinancialData.reduce((sum, month) => sum + month.revenue, 0)
  const totalExpenses = mockFinancialData.reduce((sum, month) => sum + month.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  const expensesBreakdown = [
    { name: 'Salarios', value: 35, color: '#1B5E20' },
    { name: 'Combustible', value: 25, color: '#0277BD' },
    { name: 'Mantenimiento', value: 20, color: '#FFA726' },
    { name: 'Otros', value: 20, color: '#AB47BC' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Finanzas</h1>
        <p className="text-muted-foreground mt-1">Gestión financiera y análisis de rentabilidad</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400">${(totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl font-bold text-red-600 dark:text-red-400">${(totalExpenses / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia Neta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl font-bold text-cyan-700 dark:text-cyan-400">${(totalProfit / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Margen: {profitMargin}%</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Promedio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl font-bold text-teal-700 dark:text-teal-400">${(totalProfit / 6 / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Ganancia por mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
            <CardDescription>Comparativa por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFinancialData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#2E7D32" name="Ingresos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#06b6d4" name="Gastos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Desglose de Gastos</CardTitle>
            <CardDescription>Distribución porcentual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Tendencia de Ganancias</CardTitle>
          <CardDescription>Evolución mensual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockFinancialData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
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

      {/* Monthly Details */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Detalles Mensuales</CardTitle>
          <CardDescription>Estado detallado de ingresos y gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Mes</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Ingresos</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Gastos</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Ganancia</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockFinancialData.map((month) => {
                  const margin = ((month.profit / month.revenue) * 100).toFixed(1)
                  return (
                    <tr key={month.month} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{month.month}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        ${month.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-red-600 dark:text-red-400">
                        ${month.expenses.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-cyan-700 dark:text-cyan-400">
                        ${month.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400">
                          <ArrowUpRight className="h-4 w-4" />
                          {margin}%
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
