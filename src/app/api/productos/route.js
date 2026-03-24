// Este archivo maneja las rutas de la API para productos (GET y POST)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Producto from '@/models/Producto';
import { requireAuth } from '@/lib/session';
import { sugerirCodigoProducto } from '@/lib/sugerirCodigoProducto';

// Manejador para obtener todos los productos del usuario
export async function GET() {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Buscamos los productos del usuario y los ordenamos por nombre
    const productos = await Producto.find({ usuario: userId }).sort({ nombre: 1 });
    
    // Devolvemos los productos encontrados
    return NextResponse.json(productos);
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
      { error: 'Error al obtener productos: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para crear un nuevo producto
export async function POST(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos los datos del producto del body
    const body = await request.json();

    // Validaciones estrictas para los datos del producto
    // Validar campos obligatorios
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
        { error: 'El precio es obligatorio y debe ser un número mayor o igual a 0.' },
        { status: 400 }
      );
    }
    if (typeof body.impuesto !== 'number' || isNaN(body.impuesto) || body.impuesto < 0 || body.impuesto > 100) {
      return NextResponse.json(
        { error: 'El impuesto es obligatorio y debe estar entre 0 y 100.' },
        { status: 400 }
      );
    }
    const nombreTrim = body.nombre.trim();
    const codigoGenerado = sugerirCodigoProducto(nombreTrim, body.impuesto);

    const producto = await Producto.create({
      nombre: nombreTrim,
      descripcion: descripcionTrim,
      precio: body.precio,
      impuesto: body.impuesto,
      codigo: codigoGenerado,
      usuario: userId,
    });
    
    // Devolvemos el producto creado
    return NextResponse.json(producto, { status: 201 });
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
      { error: 'Error al crear producto: ' + error.message },
      { status: 500 }
    );
  }
} 