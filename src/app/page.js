'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Footer from '@/components/Footer'

// Componente principal de la página de inicio
export default function Home() {
  // Obtenemos el estado de la sesión (autenticado, no autenticado, cargando)
  const { status } = useSession()
  // Hook para redireccionar
  const router = useRouter()

  // Efecto para redirigir según el estado de autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login') // Si no está autenticado, va a login
    } else if (status === 'authenticated') {
      router.push('/dashboard') // Si está autenticado, va al dashboard
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-24">
        <div className="flex flex-col items-center justify-center">
          {/* Título de la app */}
          <h1 className="text-4xl font-bold mb-8">Tabulae</h1>
          <p className="text-xl mb-4">Sistema de Facturación</p>
          {/* Loader mientras se verifica la sesión */}
          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 