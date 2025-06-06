// Este archivo maneja la ruta para emitir una factura (PUT)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Factura from '@/models/Factura';
import { requireAuth } from '@/lib/session';

// Manejador para emitir una factura (cambiar de borrador a emitida)
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la factura
    const { id } = await context.params;
    
    // Buscamos la factura y verificamos que sea del usuario
    const factura = await Factura.findOne({ _id: id, usuario: userId });
    
    // Si no existe la factura, devolvemos error
    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    // Solo se pueden emitir facturas en estado borrador
    if (factura.estado !== 'borrador') {
      return NextResponse.json(
        { error: 'Solo se pueden emitir facturas en estado borrador' },
        { status: 400 }
      );
    }
    
    // Cambiamos el estado a emitida
    const facturaEmitida = await Factura.findByIdAndUpdate(
      id,
      { estado: 'emitida' },
      { new: true }
    ).populate('cliente');
    
    // Devolvemos la factura emitida
    return NextResponse.json(facturaEmitida);
  } catch (error) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al emitir factura: ' + error.message },
      { status: 500 }
    );
  }
} 