'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

// Este es el componente de la barra de navegación principal
export default function Navbar() {
  // Aquí obtenemos la sesión del usuario
  const { data: session } = useSession()
  // Este estado es para saber si el menú móvil está abierto o cerrado
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    // Este es el contenedor principal de la navbar
    <nav className="bg-white shadow-md" aria-label="Navegación principal">
      {/* Skip to content link - ayuda de accesibilidad */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-blue-700 focus:text-white">
        Saltar al contenido principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Este es el logo o nombre de la app que lleva al dashboard */}
            <Link href="/dashboard" className="text-xl font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Tabulae
            </Link>
          </div>

          {/* Versión móvil - botón de menú */}
          <div className="md:hidden">
            {/* Este botón abre o cierra el menú en móvil */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-blue-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {/* Cambia el icono dependiendo si el menú está abierto o no */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Versión escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Aquí están los links principales de la app */}
            <nav className="flex space-x-4 mr-4" aria-label="Navegación principal">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/clientes" 
                className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clientes
              </Link>
              <Link 
                href="/dashboard/facturas" 
                className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Facturas
              </Link>
            </nav>

            {/* Si el usuario está logueado, muestra su nombre y el botón de cerrar sesión */}
            {session?.user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-800 font-medium">
                  Hola, {session.user.nombre}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Cerrar sesión"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Links del menú móvil */}
            <Link 
              href="/dashboard" 
              className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/clientes" 
              className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Clientes
            </Link>
            <Link 
              href="/dashboard/facturas" 
              className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-blue-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Facturas
            </Link>
          </div>
          
          {/* Si el usuario está logueado, muestra su nombre y el botón de cerrar sesión en móvil */}
          {session?.user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-3 py-2 text-base font-medium text-gray-800">
                Hola, {session.user.nombre}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="block w-full text-left px-3 py-2 text-base font-medium text-red-700 hover:bg-red-100 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 