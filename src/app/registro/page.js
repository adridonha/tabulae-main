'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'

// Componente de registro de usuario
export default function Registro() {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  // Estado para mostrar errores
  const [error, setError] = useState('')
  // Estado para mostrar loading
  const [loading, setLoading] = useState(false)
  // Hook para redireccionar
  const router = useRouter()

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
    setLoading(true)
    setError('')

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      // Llama a la API para registrar el usuario
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario')
      }

      // Redirigir al login después de un registro exitoso
      router.push('/login?success=true')
    } catch (err) {
      setError(err.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center p-6 md:p-24">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          {/* Título del formulario */}
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900" id="registro-titulo">Crear Cuenta</h1>
          
          {/* Mensaje de error si existe */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded border-l-4 border-red-500" role="alert" aria-live="assertive">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Formulario de registro */}
          <form onSubmit={handleSubmit} aria-labelledby="registro-titulo">
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                aria-required="true"
                aria-describedby="nombre-hint"
              />
              <p id="nombre-hint" className="mt-1 text-sm text-gray-700">
                Introduce tu nombre completo
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                aria-required="true"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                minLength="8"
                required
                aria-required="true"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="mt-1 text-sm text-gray-700">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                minLength="8"
                required
                aria-required="true"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading}
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
              
              <Link
                href="/login"
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-800 font-medium rounded-md text-center hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Volver al Login
              </Link>
            </div>
          </form>
          
          {/* Enlace para usuarios que ya tienen cuenta */}
          <div className="text-center mt-6">
            <p className="text-gray-800">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 