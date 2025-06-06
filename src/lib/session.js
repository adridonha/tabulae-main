import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { Types } from 'mongoose';

// Función para obtener la sesión actual del usuario
export async function getSession() {
  // Llama a next-auth para obtener la sesión
  return await getServerSession(authOptions);
}

// Función para obtener el ID del usuario actual
export async function getCurrentUserId() {
  // Obtiene la sesión
  const session = await getSession();
  
  // Si no hay usuario, lanza error
  if (!session?.user?.id) {
    throw new Error('No autenticado');
  }
  
  // Devuelve el id del usuario
  return session.user.id;
}

// Middleware para verificar autenticación
export async function requireAuth() {
  // Obtiene el id del usuario como string
  const userIdString = await getCurrentUserId();
  
  // Si no hay id, lanza error
  if (!userIdString) {
    throw new Error('No autenticado');
  }
  
  // Convertir el ID string a ObjectId para consultas en MongoDB
  try {
    return new Types.ObjectId(userIdString);
  } catch (error) {
    console.error('Error al convertir ID a ObjectId:', error);
    throw new Error('ID de usuario inválido');
  }
} 