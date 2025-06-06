// Este archivo maneja la autenticación con NextAuth (GET y POST)
import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// Creamos el handler de NextAuth usando las opciones de configuración
const handler = NextAuth(authOptions);

// Exportamos el handler para los métodos GET y POST
export { handler as GET, handler as POST }; 