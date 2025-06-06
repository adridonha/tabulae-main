'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// Este es el componente de la barra lateral (sidebar)
export default function Sidebar() {
  // Esto obtiene la ruta actual para saber qué link está activo
  const pathname = usePathname()
  // Estado para saber si el sidebar está abierto en móvil
  const [isOpen, setIsOpen] = useState(false)

  // Aquí están los items de navegación con su nombre, ruta e icono
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Facturas', href: '/dashboard/facturas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Clientes', href: '/dashboard/clientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Productos', href: '/dashboard/productos', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { name: 'Empresa', href: '/dashboard/empresa', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
  ]

  // Toggle sidebar en móvil
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Botón de toggle para móviles */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-4 right-4 bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls="sidebar"
        aria-label="Toggle navigation menu"
      >
        {/* Icono de menú hamburguesa */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`bg-white shadow-md md:w-64 transition-all duration-300 ease-in-out fixed md:static inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40 overflow-y-auto`}
        aria-label="Navegación lateral"
      >
        <div className="p-6">
          {/* Título de la navegación */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6" id="navigation-heading">Navegación</h2>
          
          {/* Lista de links de navegación */}
          <nav aria-labelledby="navigation-heading">
            <ul className="space-y-2">
              {navItems.map((item) => {
                // Esto verifica si el link está activo
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isActive 
                          ? 'bg-blue-100 text-blue-800 font-medium' 
                          : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setIsOpen(false)}
                    >
                      {/* Icono del link */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Overlay para cerrar el sidebar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  )
} 