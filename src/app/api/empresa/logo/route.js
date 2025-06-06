// Este archivo maneja la ruta de la API para subir el logo de la empresa (POST)
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from "@/lib/db";
import Empresas from "@/models/Empresa";
import { requireAuth } from "@/lib/session";

// Configurar Cloudinary usando la URL completa
if (!process.env.CLOUDINARY_URL) {
  console.error('CLOUDINARY_URL no está definida');
}

cloudinary.config();

// Manejador para subir el logo de la empresa
export async function POST(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();

    // Obtenemos el archivo del formulario
    const formData = await request.formData();
    const file = formData.get("logo");

    // Validar que se subió un archivo
    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ningún archivo" },
        { status: 400 },
      );
    }

    // Validar que es una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 },
      );
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        folder: 'tabulae/logos',
        public_id: `logo_${userId}_${Date.now()}`,
        overwrite: true
      }, (error, result) => {
        if (error) {
          console.error('Error de Cloudinary:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // URL pública para el logo
    const logoUrl = result.secure_url;

    // Actualizar el modelo de empresa con la URL del logo
    const empresa = await Empresas.findOne({ usuario: userId });

    if (empresa) {
      empresa.logo = logoUrl;
      await empresa.save();
    }

    // Devolver éxito y la URL del logo
    return NextResponse.json({
      success: true,
      logoUrl,
      message: "Logo subido correctamente",
    });
  } catch (error) {
    // Si el usuario no está autenticado
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Otros errores
    console.error("Error al subir logo:", error);
    return NextResponse.json(
      { error: "Error al subir el logo: " + error.message },
      { status: 500 },
    );
  }
}
