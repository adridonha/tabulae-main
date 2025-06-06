// Este archivo es para editar un producto existente
'use client'

// Importo los hooks de React y utilidades de Next.js
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

// Componente principal para editar un producto
export default function EditarProducto({ params }) {
  // Uso el hook use para obtener los parámetros de la ruta
  const resolvedParams = use(params)
  // Saco el id del producto de los parámetros
  const { id } = resolvedParams
  // Hook para navegar entre páginas
  const router = useRouter()
  // Estado para los datos del formulario del producto
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    impuesto: 21,
    codigo: ''
  })
  // Estado para el tipo de precio introducido: 'base' o 'conIVA'
  const [tipoPrecio, setTipoPrecio] = useState('base')
  // Estado para el valor introducido por el usuario (puede ser base o con IVA)
  const [precioInput, setPrecioInput] = useState(0)
  // Estado para mostrar loading cuando envío el formulario
  const [submitting, setSubmitting] = useState(false)
  // Estado para mostrar loading mientras cargo los datos
  const [loading, setLoading] = useState(true)
  // Estado para mostrar errores
  const [error, setError] = useState(null)

  // Función para calcular el precio base y el precio con IVA según el tipo seleccionado (memoizada)
  const calcularPrecios = useCallback(() => {
    const iva = formData.impuesto
    let base = 0
    let conIVA = 0
    if (tipoPrecio === 'base') {
      base = parseFloat(precioInput) || 0
      conIVA = base * (1 + iva / 100)
    } else {
      conIVA = parseFloat(precioInput) || 0
      base = conIVA / (1 + iva / 100)
    }
    return {
      base: parseFloat(base.toFixed(4)),
      conIVA: parseFloat(conIVA.toFixed(4))
    }
  }, [formData.impuesto, tipoPrecio, precioInput])

  // Actualiza el precio base en formData cada vez que cambia calcularPrecios
  useEffect(() => {
    const precios = calcularPrecios()
    setFormData(prev => ({
      ...prev,
      precio: precios.base
    }))
  }, [calcularPrecios])

  // Cuando se monta el componente, pido el producto a la API
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch(`/api/productos/${id}`)
        
        if (!response.ok) {
          throw new Error('Error al cargar el producto')
        }
        
        const data = await response.json()
        setFormData({
          ...data,
          codigo: data.codigo || '',
          precio: data.precio || 0,
          impuesto: data.impuesto || 21
        })
        // Inicializar el precio input con el precio base del producto
        setPrecioInput(data.precio || 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducto()
  }, [id])

  // Esta función maneja los cambios en los inputs del formulario de producto
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'precio') {
      setPrecioInput(value)
    } else if (name === 'impuesto') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Maneja el cambio de tipo de precio (base/conIVA)
  const handleTipoPrecioChange = (e) => {
    setTipoPrecio(e.target.value)
  }

  // Esta función maneja el envío del formulario de producto
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      const response = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar el producto')
      }

      // Si se actualiza bien, vuelvo a la lista de productos
      router.push('/dashboard/productos')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
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

  // Render principal de la página de editar producto
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Editar Producto</h1>
        <Link
          href="/dashboard/productos"
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
        >
          Volver
        </Link>
      </div>

      {/* Si hay error, lo muestro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Formulario para editar el producto */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="nombre">
              Nombre del Producto
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              required
              placeholder="Nombre del producto o servicio"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="codigo">
              Código/Referencia
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Código interno (opcional)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-900 font-medium mb-2" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Descripción detallada del producto o servicio"
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="tipoPrecio">
              Tipo de precio
            </label>
            <select
              id="tipoPrecio"
              name="tipoPrecio"
              value={tipoPrecio}
              onChange={handleTipoPrecioChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="base">Precio sin IVA</option>
              <option value="conIVA">Precio con IVA incluido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="precio">
              {tipoPrecio === 'base' ? 'Precio sin IVA (€)' : 'Precio con IVA incluido (€)'}
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.0001"
              min="0"
              value={precioInput}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              required
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-gray-900 font-medium mb-2">
              Precio base (sin IVA)
            </label>
            <div className="p-2 border rounded bg-gray-100 text-gray-900">
              {calcularPrecios().base.toFixed(4)} €
            </div>
          </div>
          
          <div>
            <label className="block text-gray-900 font-medium mb-2">
              Precio con IVA incluido
            </label>
            <div className="p-2 border rounded bg-gray-100 text-gray-900">
              {calcularPrecios().conIVA.toFixed(4)} €
            </div>
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="impuesto">
              IVA (%)
            </label>
            <select
              id="impuesto"
              name="impuesto"
              value={formData.impuesto}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              required
            >
              <option value={0}>0% - Exento</option>
              <option value={4}>4% - Superreducido</option>
              <option value={10}>10% - Reducido</option>
              <option value={21}>21% - General</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Link
            href="/dashboard/productos"
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
} 