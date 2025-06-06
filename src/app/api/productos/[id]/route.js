// Este archivo maneja las rutas de la API para un producto específico (GET, PUT, DELETE)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Producto from '@/models/Producto';
import { requireAuth } from '@/lib/session';

// Manejador para obtener un producto específico
export async function GET(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del producto de los parámetros de la URL
    const { id } = await context.params;
    // Buscamos el producto y verificamos que sea del usuario
    const producto = await Producto.findOne({ _id: id, usuario: userId });
    
    // Si no existe el producto, devolvemos error
    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Devolvemos el producto encontrado
    return NextResponse.json(producto);
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
      { error: 'Error al obtener producto: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para actualizar un producto
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del producto y los datos a actualizar
    const { id } = await context.params;
    const body = await request.json();
    
    // Verificar que el producto pertenece al usuario actual
    const productoExistente = await Producto.findOne({ _id: id, usuario: userId });
    if (!productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Validar código/referencia si se proporciona
    if (body.codigo && (typeof body.codigo !== 'string' || body.codigo.length > 50)) {
      return NextResponse.json(
        { error: 'El código debe ser un texto de máximo 50 caracteres.' },
        { status: 400 }
      );
    }
    
    // Actualizamos el producto con los nuevos datos
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { ...body, usuario: userId }, // Asegurar que usuario no cambia
      { new: true }
    );
    
    // Devolvemos el producto actualizado
    return NextResponse.json(productoActualizado);
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
      { error: 'Error al actualizar producto: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para eliminar un producto
export async function DELETE(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID del producto
    const { id } = await context.params;
    
    // Verificar que el producto pertenece al usuario actual
    const productoExistente = await Producto.findOne({ _id: id, usuario: userId });
    if (!productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminamos el producto
    await Producto.findByIdAndDelete(id);
    
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
      { error: 'Error al eliminar producto: ' + error.message },
      { status: 500 }
    );
  }
} 