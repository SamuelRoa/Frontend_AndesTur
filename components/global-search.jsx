'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { customers, destinations, packages, reservations, staff, vehicles } from '@/lib/api'
import { Search, Users, MapPin, Package, Truck, Calendar, User } from 'lucide-react'

const MODULE_ICONS = {
  employees: Users,
  destinations: MapPin,
  packages: Package,
  vehicles: Truck,
  reservations: Calendar,
  customers: User,
}

const MODULE_LABELS = {
  employees: 'Empleados',
  destinations: 'Destinos',
  packages: 'Paquetes',
  vehicles: 'Vehículos',
  reservations: 'Reservas',
  customers: 'Clientes',
}

const MODULE_KEY_MAP = {
  employees: 'employees',
  destinations: 'destinations',
  packages: 'packages',
  vehicles: 'vehicles',
  reservations: 'reservations',
  customers: null,
}

export function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      try {
        const [empRes, destRes, pkgRes, vehRes, resRes, custRes] = await Promise.all([
          staff.getAll(),
          destinations.getAll(),
          packages.getAll(),
          vehicles.getAll(),
          reservations.getAll(),
          customers.getAll(),
        ])
        if (!cancelled) {
          setAllData({
            employees: empRes.data || [],
            destinations: destRes.data || [],
            packages: pkgRes.data || [],
            vehicles: vehRes.data || [],
            reservations: resRes.data || [],
            customers: custRes.data || [],
          })
        }
      } catch (err) {
        console.error('GlobalSearch: error loading data', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!allData || !query.trim()) {
      setResults([])
      setSelectedIdx(-1)
      return
    }
    const q = query.toLowerCase()
    const found = []

    for (const [moduleKey, items] of Object.entries(allData)) {
      if (!Array.isArray(items)) continue
      for (const item of items) {
        const searchable = Object.values(item).filter(v => typeof v === 'string').join(' ').toLowerCase()
        if (searchable.includes(q)) {
          found.push({ module: moduleKey, item, score: searchable.indexOf(q) })
        }
      }
    }

    found.sort((a, b) => a.score - b.score)
    setResults(found.slice(0, 20))
    setSelectedIdx(-1)
  }, [query, allData])

  const handleSelect = (result) => {
    const targetModule = MODULE_KEY_MAP[result.module]
    if (targetModule) onNavigate(targetModule)
    setQuery('')
    setResults([])
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) {
      handleSelect(results[selectedIdx])
    } else if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getItemLabel = (module, item) => {
    switch (module) {
      case 'employees': return `${item.name || ''} ${item.lastname || ''} - ${item.email || item.dni || ''}`
      case 'destinations': return item.name || item.destination_name || 'Sin nombre'
      case 'packages': return item.name || 'Sin nombre'
      case 'vehicles': return `${item.plate || ''} ${item.brand || ''} ${item.model || ''}`.trim() || 'Sin placa'
      case 'reservations': {
        const customer = allData?.customers?.find(c => c.id_customer === item.id_customer)
        return `Reserva #${item.id_reservation} - ${customer?.name || 'Cliente #' + item.id_customer}`
      }
      case 'customers': return `${item.name || ''} ${item.lastname || ''} - ${item.email || item.dni || ''}`
      default: return JSON.stringify(item).slice(0, 60)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar en todos los módulos..."
          className="pl-10 border-border bg-background"
        />
      </div>
      {focused && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Cargando datos...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Sin resultados</div>
          ) : (
            results.map((result, idx) => {
              const Icon = MODULE_ICONS[result.module] || Search
              return (
                <button
                  key={`${result.module}-${result.item.id || result.item.id_reservation || result.item.id_customer || result.item.id_vehicle || idx}`}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                    idx === selectedIdx ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{getItemLabel(result.module, result.item)}</span>
                    <span className="block text-xs text-muted-foreground truncate">{MODULE_LABELS[result.module] || result.module}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
