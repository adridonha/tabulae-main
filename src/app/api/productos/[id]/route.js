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

    if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' },
        { status: 400 }
      );
    }
    const descripcionTrim =
      typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
    if (descripcionTrim.length > 4000) {
      return NextResponse.json(
        { error: 'La descripción no puede superar los 4000 caracteres.' },
        { status: 400 }
      );
    }
    if (typeof body.precio !== 'number' || isNaN(body.precio) || body.precio < 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número mayor o igual a 0.' },
        { status: 400 }
      );
    }
    if (typeof body.impuesto !== 'number' || isNaN(body.impuesto) || body.impuesto < 0 || body.impuesto > 100) {
      return NextResponse.json(
        { error: 'El impuesto debe estar entre 0 y 100.' },
        { status: 400 }
      );
    }

    // No se actualiza `codigo`: se mantiene el generado al crear el producto.
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      {
        nombre: body.nombre.trim(),
        descripcion: descripcionTrim,
        precio: body.precio,
        impuesto: body.impuesto,
        usuario: userId,
      },
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