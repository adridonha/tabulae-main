// Este archivo maneja las rutas de la API para un cliente específico (GET, PUT, DELETE)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cliente from '@/models/Cliente';
import { requireAuth } from '@/lib/session';

// Manejador para obtener un cliente específico
export async function GET(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del cliente de los parámetros de la URL
    const { id } = await context.params;
    // Buscamos el cliente y verificamos que sea del usuario
    const cliente = await Cliente.findOne({ _id: id, usuario: userId });
    
    // Si no existe el cliente, devolvemos error
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }
    
    // Devolvemos el cliente encontrado
    return NextResponse.json(cliente);
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    return NextResponse.json(
      { error: 'Error al obtener cliente: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para actualizar un cliente
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del cliente y los datos a actualizar
    const { id } = await context.params;
    const body = await request.json();
    
    // Verificar que el cliente pertenece al usuario actual
    const clienteExistente = await Cliente.findOne({ _id: id, usuario: userId });
    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizamos el cliente con los nuevos datos
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id,
      { ...body, usuario: userId }, // Asegurar que usuario no cambia
      { new: true }
    );
    
    // Devolvemos el cliente actualizado
    return NextResponse.json(clienteActualizado);
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    return NextResponse.json(
      { error: 'Error al actualizar cliente: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para eliminar un cliente
export async function DELETE(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del cliente
    const { id } = await context.params;
    
    // Verificar que el cliente pertenece al usuario actual
    const clienteExistente = await Cliente.findOne({ _id: id, usuario: userId });
    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminamos el cliente
    await Cliente.findByIdAndDelete(id);
    
    // Devolvemos éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    return NextResponse.json(
      { error: 'Error al eliminar cliente: ' + error.message },
      { status: 500 }
    );
  }
} 