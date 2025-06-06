import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import Usuario from '../models/Usuario';

// Opciones de configuración para next-auth
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      // Esta función se llama cuando un usuario intenta iniciar sesión
      async authorize(credentials) {
        try {
          // Conectar a la base de datos
          await dbConnect();

          // Verifica que haya email y password
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email y password son requeridos');
          }

          // Busca el usuario por email
          const usuario = await Usuario.findOne({ email: credentials.email });

          // Si no existe el usuario, lanza error
          if (!usuario) {
            throw new Error('Usuario no encontrado');
          }

          // Compara la contraseña
          const isValid = await usuario.compararPassword(credentials.password);

          // Si la contraseña no es válida, lanza error
          if (!isValid) {
            throw new Error('Contraseña incorrecta');
          }

          // Devuelve los datos del usuario para la sesión
          return {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    // Modifica el token JWT cuando el usuario inicia sesión
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nombre = user.nombre;
        token.rol = user.rol;
      }
      return token;
    },
    // Modifica la sesión para incluir los datos del usuario
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          nombre: token.nombre,
          email: token.email,
          rol: token.rol
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET || 'tabulae-secret',
}; 