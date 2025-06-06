// Este archivo es para mostrar la lista de productos
'use client'

// Importo los hooks de React y utilidades de Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Componente principal de la página de productos
export default function ProductosPage() {
  // Estado para guardar la lista de productos que vienen de la API
  const [productos, setProductos] = useState([])
  // Estado para saber si está cargando la info
  const [loading, setLoading] = useState(true)
  // Estado para mostrar si hay algún error
  const [error, setError] = useState(null)
  // Estado para mostrar el modal de confirmación de borrado
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  // Estado para guardar el id del producto que quiero eliminar
  const [productoToDelete, setProductoToDelete] = useState(null)
  // Estado para mostrar loading cuando se elimina un producto
  const [eliminando, setEliminando] = useState(false)

  // Esta función pide los productos a la API
  const fetchProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/productos')
      
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      
      const data = await response.json()
      setProductos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cuando se monta el componente, pido los productos
  useEffect(() => {
    fetchProductos()
  }, [])

  // Esta función elimina un producto usando la API
  const handleEliminarProducto = async () => {
    if (!productoToDelete) return
    
    try {
      setEliminando(true)
      const response = await fetch(`/api/productos/${productoToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      // Vuelvo a pedir los productos para actualizar la lista
      await fetchProductos()
      
      // Cierro el modal de confirmación
      setShowConfirmDelete(false)
      setProductoToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(false)
    }
  }

  // Esta función solo muestra el modal de confirmación y guarda el id del producto a borrar
  const confirmDelete = (id) => {
    setProductoToDelete(id)
    setShowConfirmDelete(true)
  }

  // Si está cargando, muestro un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    )
  }

  // Si hay error, muestro el mensaje de error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  // Render principal de la página de productos
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/dashboard/productos/nuevo"
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
        >
          Nuevo Producto
        </Link>
      </div>

      {/* Si no hay productos, muestro un mensaje */}
      {productos.length === 0 ? (
        <div className="bg-gray-100 p-6 text-center rounded">
          <p className="text-gray-900">No hay productos disponibles</p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Precio base (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Precio con IVA (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    IVA (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map((producto) => {
                  // Calculo el precio con IVA para mostrarlo en la tabla
                  const precioConIVA = producto.precio != null && producto.impuesto != null
                    ? Number(producto.precio) * (1 + Number(producto.impuesto) / 100)
                    : 0
                  return (
                  <tr key={producto._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{producto.codigo || '-'}</div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{producto.descripcion || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {producto.precio != null ? Number(producto.precio).toFixed(2) : '0.00'} €
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {precioConIVA.toFixed(2)} €
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{producto.impuesto || 0}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/productos/${producto._id}/editar`}
                          className="text-blue-700 hover:text-blue-900 font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmDelete(producto._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="lg:hidden space-y-4">
            {productos.map((producto) => {
              // Calculo el precio con IVA para mostrarlo en la tarjeta
              const precioConIVA = producto.precio != null && producto.impuesto != null
                ? Number(producto.precio) * (1 + Number(producto.impuesto) / 100)
                : 0
              return (
                <div key={producto._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/productos/${producto._id}/editar`}
                        className="text-blue-700 hover:text-blue-900 font-medium text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => confirmDelete(producto._id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {producto.codigo && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Código:</span>
                        <span className="text-sm text-gray-900">{producto.codigo}</span>
                      </div>
                    )}
                    
                    {producto.descripcion && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Descripción:</span>
                        <p className="text-sm text-gray-900 mt-1">{producto.descripcion}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Precio base:</span>
                        <p className="text-sm font-semibold text-gray-900">
                          {producto.precio != null ? Number(producto.precio).toFixed(2) : '0.00'} €
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Precio con IVA:</span>
                        <p className="text-sm font-semibold text-green-600">
                          {precioConIVA.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600">IVA:</span>
                      <span className="text-sm font-semibold text-gray-900">{producto.impuesto || 0}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Modal de confirmación para eliminar un producto */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowConfirmDelete(false)
                  setProductoToDelete(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEliminarProducto}
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