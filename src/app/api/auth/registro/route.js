// Este archivo maneja la ruta de registro de usuario (POST)
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Usuario from '../../../../models/Usuario';

// Manejador para registrar un nuevo usuario
export async function POST(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Obtenemos los datos del usuario del body
    const { nombre, email, password } = await request.json();
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    // Comprobar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    
    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }
    
    // Crear el usuario (la encriptación se maneja en el middleware pre-save del modelo)
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: 'usuario' // Por defecto, asignamos rol de usuario
    });
    
    // Eliminamos la contraseña del objeto de respuesta
    const usuarioSinPassword = {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
    
    // Devolvemos mensaje de éxito y el usuario creado (sin password)
    return NextResponse.json(
      { message: 'Usuario creado correctamente', usuario: usuarioSinPassword },
      { status: 201 }
    );
  } catch (error) {
    // Otros errores
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 