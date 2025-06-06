'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'

// Componente de carga que se muestra mientras Suspense espera
function LoginLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center p-6 md:p-24">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Componente principal del formulario de login
function LoginForm() {
  // Estados para los campos y mensajes
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  // Hooks para navegación y parámetros de búsqueda
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar si viene de un registro exitoso
    if (searchParams.get('success') === 'true') {
      setSuccess('Registro completado correctamente. Ahora puedes iniciar sesión.')
    }
  }, [searchParams])

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Llama a next-auth para iniciar sesión
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (!result?.ok) {
        setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center p-6 md:p-24">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          {/* Título del formulario */}
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900" id="login-titulo">Iniciar Sesión</h1>
          
          {/* Mensaje de error si existe */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded border-l-4 border-red-500" role="alert" aria-live="assertive">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Mensaje de éxito si viene de registro */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded border-l-4 border-green-500" role="alert" aria-live="polite">
              <p className="font-medium">Éxito</p>
              <p>{success}</p>
            </div>
          )}
          
          {/* Formulario de login */}
          <form onSubmit={handleSubmit} aria-labelledby="login-titulo">
            <div className="mb-4">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                aria-required="true"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-800 mb-2 font-medium" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                aria-required="true"
              />
            </div>
            
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          {/* Enlace para usuarios sin cuenta */}
          <div className="text-center mt-6">
            <p className="text-gray-800">
              ¿No tienes una cuenta?{' '}
              <Link href="/registro" className="text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Export principal con Suspense para mostrar el loader mientras carga
export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
} 