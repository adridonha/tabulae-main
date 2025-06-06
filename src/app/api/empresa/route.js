// Este archivo maneja las rutas de la API para la empresa (GET, POST, PUT)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Empresas from '@/models/Empresa';
import { requireAuth } from '@/lib/session';

// Función para validar los datos de la empresa
function validateEmpresa(data) {
  // Aquí iría una validación más completa, pero por ahora solo verificamos campos requeridos
  const requiredFields = ['nombre', 'direccion', 'nif', 'telefono', 'email'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return { error: { details: [{ message: `El campo ${field} es requerido` }] } };
    }
  }
  return { error: null };
}

// Manejador para obtener la empresa del usuario
export async function GET() {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    console.log("GET /api/empresa - Buscando empresa para usuario:", userId);
    
    // Buscar la empresa del usuario actual
    const empresa = await Empresas.findOne({ usuario: userId });
    console.log("Empresa encontrada:", empresa ? empresa._id : 'No encontrada');
    
    // Si no hay empresa, devolvemos un objeto vacío
    if (!empresa) {
      console.log("No se encontró empresa para el usuario");
      return NextResponse.json({});
    }
    
    // Devolvemos la empresa encontrada
    return NextResponse.json(empresa);
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      console.error("Error de autenticación:", error.message);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    console.error("Error en GET /api/empresa:", error);
    return NextResponse.json(
      { error: 'Error al obtener datos de la empresa: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para crear o actualizar la empresa del usuario
export async function POST(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    const body = await request.json();
    console.log("POST /api/empresa - Datos recibidos:", body);
    
    // Eliminar el campo logoUrl si existe
    if ('logoUrl' in body) {
      delete body.logoUrl;
    }
    
    // Buscar si ya existe un registro de empresa para este usuario
    const empresaExistente = await Empresas.findOne({ usuario: userId });
    console.log("Empresa existente encontrada:", empresaExistente ? empresaExistente._id : 'No encontrada');
    
    let empresa;
    
    if (empresaExistente) {
      // Preparar datos para actualización
      const datosActualizados = {};
      Object.keys(body).forEach(key => {
        if (body[key] !== undefined) {
          datosActualizados[key] = body[key];
        }
      });
      datosActualizados.usuario = userId;
      
      console.log("Actualizando empresa existente con datos:", datosActualizados);
      
      // Actualizar el registro existente usando findOneAndUpdate
      empresa = await Empresas.findOneAndUpdate(
        { _id: empresaExistente._id },
        { $set: datosActualizados },
        { new: true }
      );
    } else {
      // Asegurarnos de que los datos tienen todos los campos requeridos
      const { error } = validateEmpresa(body);
      if (error) {
        return NextResponse.json({ error: error.details[0].message }, { status: 400 });
      }
      
      console.log("Creando nueva empresa con datos:", { ...body, usuario: userId });
      
      // Crear un nuevo registro
      empresa = await Empresas.create({
        ...body,
        usuario: userId
      });
    }
    
    console.log("Empresa guardada:", empresa);
    
    // Devolvemos la empresa guardada o actualizada
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
    console.error('Error al guardar datos de la empresa:', error);
    return NextResponse.json(
      { error: 'Error al guardar datos de la empresa: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para actualizar la empresa del usuario
export async function PUT(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    const body = await request.json();
    console.log("PUT /api/empresa - Datos recibidos:", body);
    
    // Eliminar el campo logoUrl si existe
    if ('logoUrl' in body) {
      delete body.logoUrl;
    }
    
    // Buscar si ya existe un registro de empresa para este usuario
    const empresaExistente = await Empresas.findOne({ usuario: userId });
    console.log("Empresa existente encontrada:", empresaExistente ? empresaExistente._id : 'No encontrada');
    
    // Si no existe empresa, devolvemos error
    if (!empresaExistente) {
      return NextResponse.json(
        { error: 'No existe un registro de empresa para actualizar' },
        { status: 404 }
      );
    }

    // Validar campos requeridos
    const { error } = validateEmpresa(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    // Asegurarse de que no hay propiedades con valor undefined
    const datosActualizados = {};
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        datosActualizados[key] = body[key];
      }
    });
    
    // Asegurar que el usuario no cambia
    datosActualizados.usuario = userId;
    
    console.log("Datos a actualizar:", datosActualizados);
    
    // Actualizar el registro existente usando findOneAndUpdate en lugar de findByIdAndUpdate
    const empresa = await Empresas.findOneAndUpdate(
      { _id: empresaExistente._id },
      { $set: datosActualizados },
      { new: true, runValidators: true }
    );
    
    console.log("Empresa actualizada:", empresa);
    
    // Devolvemos la empresa actualizada
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