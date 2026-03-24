// Este archivo es para crear un producto nuevo
'use client'

// Importo los hooks de React y utilidades de Next.js
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Componente principal para crear un producto nuevo
export default function NuevoProducto() {
  // Hook para navegar entre páginas
  const router = useRouter()
  // Estado para los datos del formulario del producto
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0, // Este será siempre el precio base (sin IVA)
    impuesto: 21,  // IVA por defecto en España
  })
  // Estado para el tipo de precio introducido: 'base' o 'conIVA'
  const [tipoPrecio, setTipoPrecio] = useState('base')
  // Texto libre para evitar un 0 inicial que al escribir "1" pase a "01"
  const [precioInput, setPrecioInput] = useState('')
  // Estado para mostrar loading cuando envío el formulario
  const [submitting, setSubmitting] = useState(false)
  // Estado para mostrar errores
  const [error, setError] = useState(null)

  // Función para calcular el precio base y el precio con IVA según el tipo seleccionado (memoizada)
  const calcularPrecios = useCallback(() => {
    const iva = formData.impuesto
    let base = 0
    let conIVA = 0
    const n = precioInput === '' ? 0 : parseFloat(String(precioInput).replace(',', '.')) || 0
    if (tipoPrecio === 'base') {
      base = n
      conIVA = base * (1 + iva / 100)
    } else {
      conIVA = n
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

  // Maneja los cambios en los inputs del formulario de producto
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'precio') {
      setPrecioInput(value)
    } else if (name === 'impuesto') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
      
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear el producto')
      }

      // Si se crea bien, vuelvo a la lista de productos
      router.push('/dashboard/productos')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // Render principal de la página de nuevo producto
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
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

      {/* Formulario para crear el producto */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 rounded-md border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-gray-800">
            <p className="font-medium text-gray-900">Código / referencia del producto</p>
            <p className="mt-1">
              Se asignará automáticamente al guardar el producto (nombre, IVA y sufijo único). No se puede elegir a mano.
            </p>
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <label className="block text-gray-900 font-medium mb-2" htmlFor="descripcion">
              Descripción <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Detalle adicional del producto o servicio"
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
              type="text"
              inputMode="decimal"
              value={precioInput}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="0.00"
              autoComplete="off"
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
            {submitting ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  )
} 