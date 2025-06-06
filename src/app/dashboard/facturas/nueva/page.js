// Este archivo es para crear una factura nueva
'use client'

// Importo los hooks de React y utilidades de Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Componente principal para crear una factura nueva
export default function NuevaFactura() {
  // Hook para navegar entre páginas
  const router = useRouter()
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState([])
  // Estado para la lista de productos
  const [productos, setProductos] = useState([])
  // Estado para los datos del formulario de factura
  const [formData, setFormData] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cliente: '',
    lineas: [],
    irpf: 0,
    estado: 'borrador'
  })
  // Estado para mostrar loading mientras cargo los datos
  const [loading, setLoading] = useState(true)
  // Estado para mostrar loading cuando envío el formulario
  const [submitting, setSubmitting] = useState(false)
  // Estado para mostrar errores
  const [error, setError] = useState(null)
  // Estado para la línea temporal que se está agregando
  const [lineaTemp, setLineaTemp] = useState({
    producto: '',
    cantidad: 1,
    precio: 0,
    impuesto: 0
  })

  // Cuando se monta el componente, pido los clientes y productos a la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pido los clientes y productos al mismo tiempo
        const [clientesResponse, productosResponse] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/productos')
        ])

        if (!clientesResponse.ok || !productosResponse.ok) {
          throw new Error('Error al cargar datos')
        }

        const clientesData = await clientesResponse.json()
        const productosData = await productosResponse.json()

        setClientes(clientesData)
        setProductos(productosData)

        // Genero el número de factura automáticamente con la fecha de hoy
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        
        setFormData(prev => ({
          ...prev,
          numero: `F${year}${month}${day}-${random}`
        }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Esta función maneja los cambios en los inputs del formulario de factura
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Esta función maneja los cambios en los inputs de la línea temporal
  const handleLineaChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'producto') {
      const selectedProduct = productos.find(p => p._id === value)
      
      if (selectedProduct) {
        setLineaTemp(prev => ({
          ...prev,
          producto: value,
          precio: selectedProduct.precio || 0,
          impuesto: selectedProduct.impuesto || 0
        }))
      } else {
        setLineaTemp(prev => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setLineaTemp(prev => ({
        ...prev,
        [name]: name === 'cantidad' || name === 'precio' || name === 'impuesto'
          ? parseFloat(value) || 0
          : value
      }))
    }
  }

  // Esta función agrega una línea a la factura
  const addLinea = () => {
    if (!lineaTemp.producto || lineaTemp.cantidad <= 0 || lineaTemp.precio <= 0) {
      setError('Por favor complete todos los campos de la línea')
      return
    }

    setFormData(prev => ({
      ...prev,
      lineas: [...prev.lineas, lineaTemp]
    }))

    setLineaTemp({
      producto: '',
      cantidad: 1,
      precio: 0,
      impuesto: 0
    })

    setError(null)
  }

  // Esta función elimina una línea de la factura
  const removeLinea = (index) => {
    setFormData(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index)
    }))
  }

  // Esta función maneja el envío del formulario de factura
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.lineas.length === 0) {
      setError('La factura debe tener al menos una línea')
      return
    }

    if (!formData.cliente) {
      setError('Por favor seleccione un cliente')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear la factura')
      }

      const factura = await response.json()
      // Si se crea bien, voy a la página de detalle de la factura
      router.push(`/dashboard/facturas/${factura._id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // Esta función calcula los totales de la factura
  const calcularTotales = () => {
    const subtotal = formData.lineas.reduce((sum, linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precio) || 0;
      return sum + (cantidad * precio);
    }, 0);

    const impuestos = formData.lineas.reduce((sum, linea) => {
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precio) || 0;
      const impuesto = parseFloat(linea.impuesto) || 0;
      return sum + (cantidad * precio * impuesto / 100);
    }, 0);

    const irpfValue = subtotal * (parseFloat(formData.irpf) || 0) / 100;
    const total = subtotal + impuestos - irpfValue;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuestos: parseFloat(impuestos.toFixed(2)),
      irpf: parseFloat(irpfValue.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }

  // Calculo los totales para mostrarlos en la UI
  const totales = calcularTotales()

  // Si está cargando, muestro un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Render principal de la página de nueva factura
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>

      {/* Si hay error, lo muestro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Formulario para crear la factura */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="numero">
                Número de Factura
              </label>
              <input
                id="numero"
                name="numero"
                type="text"
                value={formData.numero}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="cliente">
                Cliente
              </label>
              <select
                id="cliente"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente._id} value={cliente._id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="fecha">
                Fecha de Emisión
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="fechaVencimiento">
                Fecha de Vencimiento
              </label>
              <input
                id="fechaVencimiento"
                name="fechaVencimiento"
                type="date"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="irpf">
                IRPF (%)
              </label>
              <input
                id="irpf"
                name="irpf"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.irpf}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Líneas de Factura</h2>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-gray-900 font-medium mb-2" htmlFor="producto">
                Producto
              </label>
              <select
                id="producto"
                name="producto"
                value={lineaTemp.producto}
                onChange={handleLineaChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="">Seleccionar producto</option>
                {productos.map(producto => (
                  <option key={producto._id} value={producto._id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="cantidad">
                Cantidad
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                step="1"
                value={lineaTemp.cantidad}
                onChange={handleLineaChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2" htmlFor="precio">
                Precio (€)
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="0.0001"
                value={lineaTemp.precio}
                onChange={handleLineaChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addLinea}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
              >
                Añadir Línea
              </button>
            </div>
          </div>

          {/* Tabla de líneas de factura */}
          {formData.lineas.length > 0 ? (
            <>
              {/* Vista de tabla para pantallas grandes */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">Producto</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">Cantidad</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">Precio (€)</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">IVA (%)</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">Total (€)</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lineas.map((linea, index) => {
                      const producto = productos.find(p => p._id === linea.producto)
                      const subtotal = linea.cantidad * linea.precio
                      const impuesto = subtotal * (linea.impuesto / 100)
                      const total = subtotal + impuesto
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{producto ? producto.nombre : 'Producto'}</td>
                          <td className="px-4 py-2">{linea.cantidad}</td>
                          <td className="px-4 py-2">{linea.precio.toFixed(2)} €</td>
                          <td className="px-4 py-2">{linea.impuesto}%</td>
                          <td className="px-4 py-2">{total.toFixed(2)} €</td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeLinea(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas para pantallas pequeñas y medianas */}
              <div className="lg:hidden space-y-3">
                {formData.lineas.map((linea, index) => {
                  const producto = productos.find(p => p._id === linea.producto)
                  const subtotal = linea.cantidad * linea.precio
                  const impuesto = subtotal * (linea.impuesto / 100)
                  const total = subtotal + impuesto
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{producto ? producto.nombre : 'Producto'}</h4>
                        <button
                          type="button"
                          onClick={() => removeLinea(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Cantidad:</span>
                          <p className="font-medium text-gray-900">{linea.cantidad}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Precio:</span>
                          <p className="font-medium text-gray-900">{linea.precio.toFixed(2)} €</p>
                        </div>
                        <div>
                          <span className="text-gray-600">IVA:</span>
                          <p className="font-medium text-gray-900">{linea.impuesto}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <p className="font-semibold text-green-600">{total.toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-gray-900 italic">No hay líneas en la factura</p>
          )}
        </div>

        {/* Totales de la factura */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Totales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-900 font-medium">Subtotal: {totales.subtotal.toFixed(2)} €</p>
              <p className="text-gray-900 font-medium">Impuestos: {totales.impuestos.toFixed(2)} €</p>
              {formData.irpf > 0 && (
                <p className="text-gray-900 font-medium">IRPF: -{totales.irpf.toFixed(2)} €</p>
              )}
              <p className="text-lg font-bold mt-2 text-gray-900">Total: {totales.total.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Link
            href="/dashboard/facturas"
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Guardando...' : 'Guardar Factura'}
          </button>
        </div>
      </form>
    </div>
  )
} 