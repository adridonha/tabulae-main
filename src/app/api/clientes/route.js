// Este archivo maneja las rutas de la API para clientes (GET y POST)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cliente from '@/models/Cliente';
import { requireAuth } from '@/lib/session';

// Manejador para obtener todos los clientes del usuario
export async function GET() {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Buscamos los clientes del usuario y los ordenamos por nombre
    const clientes = await Cliente.find({ usuario: userId }).sort({ nombre: 1 });
    
    // Devolvemos los clientes encontrados
    return NextResponse.json(clientes);
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
      { error: 'Error al obtener clientes: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para crear un nuevo cliente
export async function POST(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos los datos del cliente del body
    const body = await request.json();

    // Validaciones estrictas para los datos del cliente
    // Validar campos obligatorios
    if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.' },
        { status: 400 }
      );
    }
    if (!body.direccion || typeof body.direccion !== 'string' || body.direccion.trim().length < 5) {
      return NextResponse.json(
        { error: 'La dirección es obligatoria y debe tener al menos 5 caracteres.' },
        { status: 400 }
      );
    }
    if (!body.nif || typeof body.nif !== 'string' || body.nif.trim().length < 6) {
      return NextResponse.json(
        { error: 'El NIF/CIF es obligatorio y debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }
    const emailTrim = typeof body.email === 'string' ? body.email.trim() : '';
    if (emailTrim && !/^\S+@\S+\.\S+$/.test(emailTrim)) {
      return NextResponse.json(
        { error: 'El email debe tener un formato válido.' },
        { status: 400 }
      );
    }
    const telefonoTrim = typeof body.telefono === 'string' ? body.telefono.trim() : '';
    if (telefonoTrim && telefonoTrim.length < 6) {
      return NextResponse.json(
        { error: 'Si indica teléfono, debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }
    // Validar opcionales si existen
    if (body.codigoPostal && typeof body.codigoPostal !== 'string') {
      return NextResponse.json(
        { error: 'El código postal debe ser texto.' },
        { status: 400 }
      );
    }
    if (body.localidad && typeof body.localidad !== 'string') {
      return NextResponse.json(
        { error: 'La localidad debe ser texto.' },
        { status: 400 }
      );
    }
    if (body.provincia && typeof body.provincia !== 'string') {
      return NextResponse.json(
        { error: 'La provincia debe ser texto.' },
        { status: 400 }
      );
    }
    const codigoPostalTrim =
      typeof body.codigoPostal === 'string' ? body.codigoPostal.trim() : '';
    const localidadTrim =
      typeof body.localidad === 'string' ? body.localidad.trim() : '';
    const provinciaTrim =
      typeof body.provincia === 'string' ? body.provincia.trim() : '';

    // Creamos el cliente y lo asociamos al usuario (solo campos permitidos)
    const cliente = await Cliente.create({
      nombre: body.nombre.trim(),
      direccion: body.direccion.trim(),
      nif: body.nif.trim(),
      codigoPostal: codigoPostalTrim || undefined,
      localidad: localidadTrim || undefined,
      provincia: provinciaTrim || undefined,
      email: emailTrim || undefined,
      telefono: telefonoTrim || undefined,
      usuario: userId,
    });
    // Devolvemos el cliente creado
    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.error('POST /api/clientes:', error);

    // Otros errores
    return NextResponse.json(
      { error: 'Error al crear cliente: ' + error.message },
      { status: 500 }
    );
  }
} 