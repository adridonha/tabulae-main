// Este archivo es para ver el detalle de una factura específica
'use client'

// Importo los hooks de React y utilidades de Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { generateInvoicePDF } from '@/lib/generatePDF'
import { use } from 'react'

// Componente principal para ver el detalle de una factura
export default function FacturaDetalle({ params }) {
  // Uso el hook use para obtener los parámetros de la ruta
  const resolvedParams = use(params)
  // Saco el id de la factura de los parámetros
  const { id } = resolvedParams
  // Hook para navegar entre páginas
  const router = useRouter()
  // Estado para guardar la factura que viene de la API
  const [factura, setFactura] = useState(null)
  // Estado para guardar los datos de la empresa
  const [empresa, setEmpresa] = useState(null)
  // Estado para saber si está cargando la info
  const [loading, setLoading] = useState(true)
  // Estado para mostrar si hay algún error
  const [error, setError] = useState(null)
  // Estado para saber si se está emitiendo la factura
  const [emitiendo, setEmitiendo] = useState(false)
  // Estado para saber si se está eliminando la factura
  const [eliminando, setEliminando] = useState(false)
  // Estado para mostrar el modal de confirmación de borrado
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  // Estado para saber si se está cambiando el estado de la factura
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  // Cuando se monta el componente, pido la factura y la empresa a la API
  useEffect(() => {
    const fetchFactura = async () => {
      try {
        // Pido la factura y la empresa al mismo tiempo
        const [facturaResponse, empresaResponse] = await Promise.all([
          fetch(`/api/facturas/${id}`),
          fetch('/api/empresa')
        ])

        if (!facturaResponse.ok) {
          throw new Error('Error al cargar la factura')
        }

        const facturaData = await facturaResponse.json()
        const empresaData = await empresaResponse.json()

        setFactura(facturaData)
        setEmpresa(empresaData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFactura()
  }, [id])

  // Esta función emite la factura (la pasa de borrador a emitida)
  const handleEmitirFactura = async () => {
    try {
      setEmitiendo(true)
      const response = await fetch(`/api/facturas/${id}/emitir`, {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Error al emitir la factura')
      }

      const facturaActualizada = await response.json()
      setFactura(facturaActualizada)
    } catch (err) {
      setError(err.message)
    } finally {
      setEmitiendo(false)
    }
  }

  // Esta función cambia el estado de la factura (por ejemplo, a pagada o cancelada)
  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      setCambiandoEstado(true)
      const response = await fetch(`/api/facturas/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cambiar el estado')
      }

      const facturaActualizada = await response.json()
      setFactura(facturaActualizada)
    } catch (err) {
      setError(err.message)
    } finally {
      setCambiandoEstado(false)
    }
  }

  // Esta función genera el PDF de la factura usando la función de la librería
  const handleGenerarPDF = async () => {
    if (factura && empresa) {
      try {
        await generateInvoicePDF(factura, empresa)
      } catch (err) {
        setError('Error al generar el PDF: ' + err.message)
      }
    }
  }

  // Esta función elimina la factura usando la API
  const handleEliminarFactura = async () => {
    try {
      setEliminando(true)
      const response = await fetch(`/api/facturas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la factura')
      }

      // Si se elimina, vuelvo a la lista de facturas
      router.push('/dashboard/facturas')
    } catch (err) {
      setError(err.message)
      setEliminando(false)
      setShowConfirmDelete(false)
    }
  }

  // Si está cargando, muestro un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si hay error, muestro el mensaje de error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  // Si no hay factura, muestro un aviso
  if (!factura) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Aviso:</strong>
        <span className="block sm:inline"> Factura no encontrada.</span>
      </div>
    )
  }

  // Esta función devuelve un badge de color según el estado de la factura
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'borrador':
        return <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full">Borrador</span>
      case 'emitida':
        return <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full">Emitida</span>
      case 'pagada':
        return <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full">Pagada</span>
      case 'cancelada':
        return <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full">Cancelada</span>
      default:
        return <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full">{estado}</span>
    }
  }

  // Render principal de la página de detalle
  return (
    <div className="space-y-6">
      {/* Título y botones de acciones según el estado de la factura */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Factura: {factura.numero}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 w-full sm:w-auto">
          {factura.estado === 'borrador' && (
            <>
              <button
                onClick={handleEmitirFactura}
                disabled={emitiendo}
                className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 font-medium text-center"
              >
                {emitiendo ? 'Procesando...' : 'Emitir Factura'}
              </button>
              <Link
                href={`/dashboard/facturas/${id}/editar`}
                className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-center"
              >
                Editar
              </Link>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-center"
              >
                Eliminar
              </button>
            </>
          )}
          {factura.estado === 'emitida' && (
            <>
              <button
                onClick={() => handleCambiarEstado('pagada')}
                disabled={cambiandoEstado}
                className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 font-medium text-center"
              >
                {cambiandoEstado ? 'Procesando...' : 'Marcar como Pagada'}
              </button>
              <button
                onClick={() => handleCambiarEstado('cancelada')}
                disabled={cambiandoEstado}
                className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 font-medium text-center"
              >
                {cambiandoEstado ? 'Procesando...' : 'Cancelar Factura'}
              </button>
            </>
          )}
          <button
            onClick={handleGenerarPDF}
            className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-center"
          >
            Descargar PDF
          </button>
          <Link
            href="/dashboard/facturas"
            className="flex items-center justify-center min-h-[44px] min-w-[120px] px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium text-center"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Modal de confirmación para eliminar la factura */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarFactura}
                disabled={eliminando}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 font-medium"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Información General</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-900 font-medium">Estado:</span>
              <div>{getEstadoBadge(factura.estado)}</div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900 font-medium">Fecha:</span>
              <span className="text-gray-900">{factura.fecha ? new Date(factura.fecha).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900 font-medium">Vencimiento:</span>
              <span className="text-gray-900">{factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Cliente</h2>
          {factura.cliente ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Nombre:</span>
                <span>{factura.cliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">NIF:</span>
                <span>{factura.cliente.nif}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Dirección:</span>
                <span>{factura.cliente.direccion}</span>
              </div>
              {factura.cliente.codigoPostal && (
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Código Postal:</span>
                  <span>{factura.cliente.codigoPostal}</span>
                </div>
              )}
              {factura.cliente.localidad && (
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Localidad:</span>
                  <span>{factura.cliente.localidad}</span>
                </div>
              )}
              {factura.cliente.provincia && (
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Provincia:</span>
                  <span>{factura.cliente.provincia}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Email:</span>
                <span>{factura.cliente.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Teléfono:</span>
                <span>{factura.cliente.telefono}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-900">No hay información del cliente</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Líneas de Factura</h2>
        {factura.lineas && factura.lineas.length > 0 ? (
          <>
            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      IVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {factura.lineas.map((linea, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {linea.producto?.nombre || 'Producto'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {linea.cantidad || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {linea.precio != null ? Number(linea.precio).toFixed(2) : '0.00'} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {linea.impuesto || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {linea.total != null ? Number(linea.total).toFixed(2) : '0.00'} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de tarjetas para pantallas pequeñas y medianas */}
            <div className="lg:hidden space-y-3">
              {factura.lineas.map((linea, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">{linea.producto?.nombre || 'Producto'}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Cantidad:</span>
                      <p className="font-medium text-gray-900">{linea.cantidad || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio:</span>
                      <p className="font-medium text-gray-900">
                        {linea.precio != null ? Number(linea.precio).toFixed(2) : '0.00'} €
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">IVA:</span>
                      <p className="font-medium text-gray-900">{linea.impuesto || 0}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-semibold text-green-600">
                        {linea.total != null ? Number(linea.total).toFixed(2) : '0.00'} €
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-900">No hay líneas en la factura</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Totales</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-900 font-medium">Subtotal:</span>
            <span className="text-gray-900">{factura.subtotal != null ? Number(factura.subtotal).toFixed(2) : '0.00'} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-900 font-medium">Impuestos:</span>
            <span className="text-gray-900">{factura.impuestos != null ? Number(factura.impuestos).toFixed(2) : '0.00'} €</span>
          </div>
          {factura.irpf > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-900 font-medium">IRPF:</span>
              <span className="text-gray-900">{factura.irpf != null ? Number(factura.irpf).toFixed(2) : '0.00'} €</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">{factura.total != null ? Number(factura.total).toFixed(2) : '0.00'} €</span>
          </div>
        </div>
      </div>
    </div>
  )
} 