'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

// Layout principal del dashboard, protege la ruta y muestra navbar y sidebar
export default function DashboardLayout({ children }) {
  // Obtenemos el estado de la sesión
  const { status } = useSession()
  // Hook para redireccionar
  const router = useRouter()

  // Si el usuario no está autenticado, lo redirige al login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Mientras se carga la sesión, muestra un loader
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar superior */}
      <Navbar />
      <div className="flex flex-col md:flex-row">
        {/* Sidebar lateral */}
        <Sidebar />
        {/* Contenido principal del dashboard */}
        <main id="main-content" className="flex-1 p-6 focus:outline-none" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  )
} 