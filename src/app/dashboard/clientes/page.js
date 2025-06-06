'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Página principal de clientes
export default function ClientesPage() {
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState([])
  // Estado para mostrar loading
  const [loading, setLoading] = useState(true)
  // Estado para mostrar errores
  const [error, setError] = useState(null)
  // Estado para mostrar el modal de confirmación de borrado
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  // Estado para guardar el id del cliente a eliminar
  const [clienteToDelete, setClienteToDelete] = useState(null)
  // Estado para mostrar loading al eliminar
  const [eliminando, setEliminando] = useState(false)

  // Función para obtener los clientes de la API
  const fetchClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      
      if (!response.ok) {
        throw new Error('Error al cargar clientes')
      }
      
      const data = await response.json()
      setClientes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cargar los clientes al montar el componente
  useEffect(() => {
    fetchClientes()
  }, [])

  // Función para eliminar un cliente
  const handleEliminarCliente = async () => {
    if (!clienteToDelete) return
    
    try {
      setEliminando(true)
      const response = await fetch(`/api/clientes/${clienteToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el cliente')
      }

      // Actualizar la lista después de eliminar
      await fetchClientes()
      
      // Cerrar el modal
      setShowConfirmDelete(false)
      setClienteToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(false)
    }
  }

  // Mostrar el modal de confirmación
  const confirmDelete = (id) => {
    setClienteToDelete(id)
    setShowConfirmDelete(true)
  }

  // Loader mientras se cargan los clientes
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
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/dashboard/clientes/nuevo"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
        >
          Nuevo Cliente
        </Link>
      </div>

      {/* Si no hay clientes, muestra un mensaje */}
      {clientes.length === 0 ? (
        <div className="bg-gray-100 p-6 text-center rounded">
          <p className="text-gray-900">No hay clientes disponibles</p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    NIF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.nif}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/clientes/${cliente._id}/editar`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmDelete(cliente._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="lg:hidden space-y-4">
            {clientes.map((cliente) => (
              <div key={cliente._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{cliente.nombre}</h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/clientes/${cliente._id}/editar`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => confirmDelete(cliente._id)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">NIF:</span>
                    <span className="text-sm text-gray-900">{cliente.nif}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900 break-all">{cliente.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                    <span className="text-sm text-gray-900">{cliente.telefono}</span>
                  </div>
                  
                  {cliente.direccion && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Dirección:</span>
                      <p className="text-sm text-gray-900 mt-1">{cliente.direccion}</p>
                      {(cliente.codigoPostal || cliente.localidad || cliente.provincia) && (
                        <p className="text-sm text-gray-700 mt-1">
                          {[cliente.codigoPostal, cliente.localidad, cliente.provincia].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
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
            <p className="mb-6">¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowConfirmDelete(false)
                  setClienteToDelete(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEliminarCliente}
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