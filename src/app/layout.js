import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from '../providers/NextAuthProvider'

// Cargamos la fuente Inter desde Google Fonts
const inter = Inter({ subsets: ['latin'] })

// Metadatos de la aplicación (título y descripción)
export const metadata = {
  title: 'Tabulae - Sistema de Facturación',
  description: 'Aplicación de facturación básica conectada a MongoDB',
}

// Componente principal de layout que envuelve toda la app
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Proveedor de sesión para toda la app */}
        <NextAuthProvider>
          {/* Contenedor principal con mínimo alto de pantalla */}
          <div className="min-h-screen">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  )
}