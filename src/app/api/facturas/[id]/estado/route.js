// Este archivo maneja la ruta para cambiar el estado de una factura (PUT)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Factura from '@/models/Factura';
import { requireAuth } from '@/lib/session';

// Manejador para actualizar el estado de una factura
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la factura y el nuevo estado
    const { id } = await context.params;
    const { estado } = await request.json();
    
    // Validamos que el estado sea válido
    const estadosValidos = ['emitida', 'pagada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      );
    }
    
    // Verificamos que la factura existe y pertenece al usuario
    const factura = await Factura.findOne({ _id: id, usuario: userId });
    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    // Validamos que la factura no esté ya en el estado solicitado
    if (factura.estado === estado) {
      return NextResponse.json(
        { error: 'La factura ya está en ese estado' },
        { status: 400 }
      );
    }
    
    // Validamos las transiciones de estado permitidas
    if (factura.estado === 'cancelada') {
      return NextResponse.json(
        { error: 'No se puede cambiar el estado de una factura cancelada' },
        { status: 400 }
      );
    }
    
    if (factura.estado === 'pagada' && estado === 'emitida') {
      return NextResponse.json(
        { error: 'No se puede volver a emitir una factura pagada' },
        { status: 400 }
      );
    }
    
    // Actualizamos el estado de la factura
    const facturaActualizada = await Factura.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).populate('cliente');
    
    // Devolvemos la factura actualizada
    return NextResponse.json(facturaActualizada);
  } catch (error) {
    // Manejamos los errores de autenticación
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Manejamos otros errores
    return NextResponse.json(
      { error: 'Error al actualizar estado: ' + error.message },
      { status: 500 }
    );
  }
} 