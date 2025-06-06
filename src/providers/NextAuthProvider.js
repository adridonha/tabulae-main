'use client'

import { SessionProvider } from 'next-auth/react'

// Este componente envuelve la app con el proveedor de sesión de next-auth
export default function NextAuthProvider({ children }) {
  // Aquí se provee el contexto de sesión a todos los componentes hijos
  return <SessionProvider>{children}</SessionProvider>
} 