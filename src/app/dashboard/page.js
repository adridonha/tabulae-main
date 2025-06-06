'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Componente principal del dashboard
export default function Dashboard() {
  // Estado para las estadísticas
  const [stats, setStats] = useState({
    facturas: 0,
    clientes: 0,
    productos: 0,
    pendientes: 0
  })
  // Estado para mostrar loading
  const [loading, setLoading] = useState(true)

  // Efecto para cargar las estadísticas al montar el componente
  useEffect(() => {
    async function fetchStats() {
      try {
        // Pedimos los datos de facturas, clientes y productos en paralelo
        const [facturas, clientes, productos] = await Promise.all([
          fetch('/api/facturas').then(res => res.json()),
          fetch('/api/clientes').then(res => res.json()),
          fetch('/api/productos').then(res => res.json())
        ])

        // Contamos las facturas pendientes (borrador o emitida)
        const pendientes = facturas.filter(f => f.estado === 'borrador' || f.estado === 'emitida').length

        setStats({
          facturas: facturas.length,
          clientes: clientes.length,
          productos: productos.length,
          pendientes
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Tarjetas para mostrar las estadísticas
  const cards = [
    {
      title: 'Facturas Totales',
      value: stats.facturas,
      href: '/dashboard/facturas',
      color: 'bg-blue-500'
    },
    {
      title: 'Facturas Pendientes',
      value: stats.pendientes,
      href: '/dashboard/facturas?estado=pendiente',
      color: 'bg-yellow-500'
    },
    {
      title: 'Clientes',
      value: stats.clientes,
      href: '/dashboard/clientes',
      color: 'bg-green-500'
    },
    {
      title: 'Productos',
      value: stats.productos,
      href: '/dashboard/productos',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Título del dashboard */}
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Loader mientras se cargan los datos */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjetas de estadísticas */}
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`${card.color} text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`}
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                <p className="text-3xl font-bold mt-2 text-white">{card.value}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/facturas/nueva"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <p className="font-semibold text-blue-600">Crear Nueva Factura</p>
          </Link>
          <Link
            href="/dashboard/clientes/nuevo"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <p className="font-semibold text-green-600">Añadir Cliente</p>
          </Link>
          <Link
            href="/dashboard/productos/nuevo"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <p className="font-semibold text-purple-600">Añadir Producto</p>
          </Link>
        </div>
      </div>
    </div>
  )
} //prueba