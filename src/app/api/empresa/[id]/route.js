// Este archivo maneja la ruta de la API para actualizar una empresa específica (PUT)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Empresas from '@/models/Empresa';
import { requireAuth } from '@/lib/session';

// Manejador para actualizar una empresa específica
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la empresa y los datos a actualizar
    const { id } = await context.params;
    const body = await request.json();
    
    // Validar que exista el ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID de empresa no proporcionado' },
        { status: 400 }
      );
    }
    
    // Verificar que la empresa pertenece al usuario
    const empresaExistente = await Empresas.findOne({ _id: id, usuario: userId });
    if (!empresaExistente) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }
    
    // Actualizar el registro
    const empresa = await Empresas.findByIdAndUpdate(
      id,
      { ...body, usuario: userId }, // Asegurar que el usuario no cambia
      { new: true, runValidators: true }
    );
    
    // Devolver la empresa actualizada
    return NextResponse.json(empresa);
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    console.error('Error al actualizar empresa:', error);
    return NextResponse.json(
      { error: 'Error al actualizar datos de la empresa: ' + error.message },
      { status: 500 }
    );
  }
} 