// Este archivo maneja las rutas de la API para una factura específica (GET, PUT, DELETE)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Factura from '@/models/Factura';
import { requireAuth } from '@/lib/session';

// Manejador para obtener una factura específica
export async function GET(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la factura de los parámetros de la URL
    const { id } = await context.params;
    
    // Buscamos la factura y poblamos los datos del cliente y productos
    const factura = await Factura.findOne({ _id: id, usuario: userId })
      .populate('cliente')
      .populate('lineas.producto');
    
    // Si no encontramos la factura, devolvemos error 404
    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    // Devolvemos la factura encontrada
    return NextResponse.json(factura);
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
      { error: 'Error al obtener factura: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para actualizar una factura
export async function PUT(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la factura y los datos a actualizar
    const { id } = await context.params;
    const body = await request.json();
    
    // Verificamos que la factura existe y pertenece al usuario
    const facturaExistente = await Factura.findOne({ _id: id, usuario: userId });
    if (!facturaExistente) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    // Calculamos los totales
    let subtotal = 0;
    let impuestos = 0;
    
    // Calculamos el total de cada línea y los totales generales
    body.lineas = body.lineas.map(linea => {
      // Aseguramos que los valores son números
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precio) || 0;
      const impuesto = parseFloat(linea.impuesto) || 0;
      
      // Calculamos el precio total y el impuesto de la línea
      const precioTotal = precio * cantidad;
      const impuestoLinea = (precioTotal * impuesto) / 100;
      
      // Sumamos al total y a los impuestos
      subtotal += precioTotal;
      impuestos += impuestoLinea;
      
      // Devolvemos la línea con los totales calculados
      return {
        ...linea,
        cantidad,
        precio,
        impuesto,
        total: parseFloat((precioTotal + impuestoLinea).toFixed(2))
      };
    });
    
    // Aplicamos IRPF si existe
    const irpfPorcentaje = parseFloat(body.irpf) || 0;
    const irpf = (subtotal * irpfPorcentaje) / 100;
    
    // Calculamos el total final y redondeamos a 2 decimales
    const total = parseFloat((subtotal + impuestos - irpf).toFixed(2));
    subtotal = parseFloat(subtotal.toFixed(2));
    impuestos = parseFloat(impuestos.toFixed(2));
    const irpfFinal = parseFloat(irpf.toFixed(2));
    
    // Actualizamos la factura con los nuevos datos
    const facturaActualizada = await Factura.findByIdAndUpdate(
      id,
      {
        ...body,
        subtotal,
        impuestos,
        irpf: irpfFinal,
        total,
        usuario: userId // Aseguramos que el usuario no cambia
      },
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
      { error: 'Error al actualizar factura: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para eliminar una factura
export async function DELETE(request, context) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos el ID de la factura
    const { id } = await context.params;
    
    // Verificamos que la factura existe y pertenece al usuario
    const factura = await Factura.findOne({ _id: id, usuario: userId });
    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminamos la factura
    await Factura.findByIdAndDelete(id);
    
    // Devolvemos éxito
    return NextResponse.json({ message: 'Factura eliminada correctamente' });
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
      { error: 'Error al eliminar factura: ' + error.message },
      { status: 500 }
    );
  }
} 