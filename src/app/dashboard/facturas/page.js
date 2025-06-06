'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Página principal de facturas
export default function FacturasPage() {
  // Estado para la lista de facturas
  const [facturas, setFacturas] = useState([])
  // Estado para mostrar loading
  const [loading, setLoading] = useState(true)
  // Estado para mostrar errores
  const [error, setError] = useState(null)
  // Hook para obtener los parámetros de búsqueda (filtro de estado)
  const searchParams = useSearchParams()
  const estadoFilter = searchParams.get('estado')
  // Estado para mostrar el modal de confirmación de borrado
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  // Estado para guardar el id de la factura a eliminar
  const [facturaToDelete, setFacturaToDelete] = useState(null)
  // Estado para mostrar loading al eliminar
  const [eliminando, setEliminando] = useState(false)

  // Función para obtener las facturas de la API (memoizada con useCallback)
  const fetchFacturas = useCallback(async () => {
    try {
      setLoading(true)
      const url = estadoFilter
        ? `/api/facturas?estado=${estadoFilter}`
        : '/api/facturas'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al cargar facturas')
      }
      
      const data = await response.json()
      setFacturas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter]) // fetchFacturas se recrea solo cuando estadoFilter cambia

  // Cargar las facturas al montar el componente o cuando cambia fetchFacturas
  useEffect(() => {
    fetchFacturas()
  }, [fetchFacturas])

  // Función para eliminar una factura
  const handleEliminarFactura = async () => {
    if (!facturaToDelete) return
    
    try {
      setEliminando(true)
      const response = await fetch(`/api/facturas/${facturaToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la factura')
      }

      // Actualizar la lista después de eliminar
      await fetchFacturas()
      
      // Cerrar el modal
      setShowConfirmDelete(false)
      setFacturaToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(false)
    }
  }

  // Mostrar el modal de confirmación
  const confirmDelete = (id) => {
    setFacturaToDelete(id)
    setShowConfirmDelete(true)
  }

  // Devuelve el badge de estado de la factura
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'borrador':
        return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">Borrador</span>
      case 'emitida':
        return <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">Emitida</span>
      case 'pagada':
        return <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">Pagada</span>
      case 'cancelada':
        return <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">Cancelada</span>
      default:
        return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">{estado}</span>
    }
  }

  // Loader mientras se cargan las facturas
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Mensaje de error si ocurre algún problema
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
        <Link
          href="/dashboard/facturas/nueva"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
        >
          Nueva Factura
        </Link>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/dashboard/facturas"
          className={`px-3 py-1 rounded font-medium text-sm ${!estadoFilter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900'}`}
        >
          Todas
        </Link>
        <Link
          href="/dashboard/facturas?estado=borrador"
          className={`px-3 py-1 rounded font-medium text-sm ${estadoFilter === 'borrador' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900'}`}
        >
          Borradores
        </Link>
        <Link
          href="/dashboard/facturas?estado=emitida"
          className={`px-3 py-1 rounded font-medium text-sm ${estadoFilter === 'emitida' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900'}`}
        >
          Emitidas
        </Link>
        <Link
          href="/dashboard/facturas?estado=pagada"
          className={`px-3 py-1 rounded font-medium text-sm ${estadoFilter === 'pagada' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900'}`}
        >
          Pagadas
        </Link>
        <Link
          href="/dashboard/facturas?estado=cancelada"
          className={`px-3 py-1 rounded font-medium text-sm ${estadoFilter === 'cancelada' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900'}`}
        >
          Canceladas
        </Link>
      </div>

      {/* Si no hay facturas, muestra un mensaje */}
      {facturas.length === 0 ? (
        <div className="bg-gray-100 p-6 text-center rounded">
          <p className="text-gray-900">No hay facturas disponibles</p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facturas.map((factura) => (
                  <tr key={factura._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{factura.numero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {factura.cliente?.nombre || 'Cliente desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(factura.fecha).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {factura.total != null ? `${Number(factura.total).toFixed(2)} €` : '0,00 €'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(factura.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/facturas/${factura._id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Ver
                        </Link>
                        {factura.estado === 'borrador' && (
                          <>
                            <Link
                              href={`/dashboard/facturas/${factura._id}/editar`}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => confirmDelete(factura._id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="lg:hidden space-y-4">
            {facturas.map((factura) => (
              <div key={factura._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{factura.numero}</h3>
                    <p className="text-sm text-gray-600">{factura.cliente?.nombre || 'Cliente desconocido'}</p>
                  </div>
                  <div className="text-right">
                    {getEstadoBadge(factura.estado)}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Fecha:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(factura.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Total:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {factura.total != null ? `${Number(factura.total).toFixed(2)} €` : '0,00 €'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/dashboard/facturas/${factura._id}`}
                    className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                  >
                    Ver
                  </Link>
                  {factura.estado === 'borrador' && (
                    <>
                      <Link
                        href={`/dashboard/facturas/${factura._id}/editar`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => confirmDelete(factura._id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowConfirmDelete(false)
                  setFacturaToDelete(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEliminarFactura}
                disabled={eliminando}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 