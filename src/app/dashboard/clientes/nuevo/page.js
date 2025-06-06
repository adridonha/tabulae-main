'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Función para validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return emailRegex
}

// Componente para crear un nuevo cliente
export default function NuevoCliente() {
  const router = useRouter()
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    codigoPostal: '',
    localidad: '',
    provincia: '',
    nif: '',
    email: '',
    telefono: ''
  })
  // Estado para mostrar loading al enviar
  const [submitting, setSubmitting] = useState(false)
  // Estado para mostrar errores
  const [error, setError] = useState(null)

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Validar email
      if (formData.email && !isValidEmail(formData.email)) {
        throw new Error('El formato del correo electrónico no es válido')
      }
      
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear el cliente')
      }

      router.push('/dashboard/clientes')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
        <Link
          href="/dashboard/clientes"
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
        >
          Volver
        </Link>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Formulario para crear cliente */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              required
              placeholder="Nombre de la empresa o persona"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="nif">
              NIF/CIF
            </label>
            <input
              id="nif"
              name="nif"
              type="text"
              value={formData.nif}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              required
              placeholder="Número de identificación fiscal"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-900 font-medium mb-2" htmlFor="direccion">
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              required
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="codigoPostal">
              Código Postal
            </label>
            <input
              id="codigoPostal"
              name="codigoPostal"
              type="text"
              value={formData.codigoPostal}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              placeholder="Código postal"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="localidad">
              Localidad
            </label>
            <input
              id="localidad"
              name="localidad"
              type="text"
              value={formData.localidad}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              placeholder="Ciudad o localidad"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="provincia">
              Provincia
            </label>
            <input
              id="provincia"
              name="provincia"
              type="text"
              value={formData.provincia}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              placeholder="Provincia o estado"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              required
              placeholder="Número de teléfono"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Link
            href="/dashboard/clientes"
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
} 