// Este archivo maneja las rutas de la API para facturas (GET y POST)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Factura from '@/models/Factura';
import { requireAuth } from '@/lib/session';

// Manejador para obtener todas las facturas del usuario
export async function GET(request) {
  try {
    // Conectamos a la base de datos
    await dbConnect();
    
    // Verificamos que el usuario esté autenticado
    const userId = await requireAuth();
    
    // Obtenemos los parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    
    // Preparamos la consulta base
    let query = { usuario: userId };
    
    // Si se especificó un estado, lo añadimos a la consulta
    if (estado) {
      if (estado === 'pendiente') {
        // Para estado 'pendiente' buscamos facturas en borrador o emitidas
        query.estado = { $in: ['borrador', 'emitida'] };
      } else {
        // Para otros estados, buscamos exactamente ese estado
        query.estado = estado;
      }
    }

    // Buscamos las facturas y las ordenamos por fecha de creación (más recientes primero)
    const facturas = await Factura.find(query)
      .populate('cliente') // Incluimos los datos del cliente
      .sort({ createdAt: -1 });
    
    // Devolvemos las facturas encontradas
    return NextResponse.json(facturas);
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
      { error: 'Error al obtener facturas: ' + error.message },
      { status: 500 }
    );
  }
}

// Manejador para crear una nueva factura
export async function POST(request) {
  try {
    await dbConnect();
    const userId = await requireAuth();
    
    const body = await request.json();

    // Validaciones estrictas para los datos de la factura
    // Validar campos obligatorios
    if (!body.numero || typeof body.numero !== 'string' || body.numero.trim().length < 3) {
      return NextResponse.json(
        { error: 'El número de factura es obligatorio y debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }
    if (!body.fecha || isNaN(Date.parse(body.fecha))) {
      return NextResponse.json(
        { error: 'La fecha de emisión es obligatoria y debe ser una fecha válida.' },
        { status: 400 }
      );
    }
    if (!body.fechaVencimiento || isNaN(Date.parse(body.fechaVencimiento))) {
      return NextResponse.json(
        { error: 'La fecha de vencimiento es obligatoria y debe ser una fecha válida.' },
        { status: 400 }
      );
    }
    if (!body.cliente || typeof body.cliente !== 'string' || body.cliente.trim().length < 1) {
      return NextResponse.json(
        { error: 'El cliente es obligatorio.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.lineas) || body.lineas.length === 0) {
      return NextResponse.json(
        { error: 'Debe haber al menos una línea en la factura.' },
        { status: 400 }
      );
    }
    // Validar cada línea de la factura
    for (const [i, linea] of body.lineas.entries()) {
      if (!linea.producto || typeof linea.producto !== 'string' || linea.producto.trim().length < 1) {
        return NextResponse.json(
          { error: `La línea ${i + 1} debe tener un producto válido.` },
          { status: 400 }
        );
      }
      if (typeof linea.cantidad !== 'number' || isNaN(linea.cantidad) || linea.cantidad < 1) {
        return NextResponse.json(
          { error: `La línea ${i + 1} debe tener una cantidad mayor o igual a 1.` },
          { status: 400 }
        );
      }
      if (typeof linea.precio !== 'number' || isNaN(linea.precio) || linea.precio < 0) {
        return NextResponse.json(
          { error: `La línea ${i + 1} debe tener un precio mayor o igual a 0.` },
          { status: 400 }
        );
      }
      if (typeof linea.impuesto !== 'number' || isNaN(linea.impuesto) || linea.impuesto < 0) {
        return NextResponse.json(
          { error: `La línea ${i + 1} debe tener un impuesto mayor o igual a 0.` },
          { status: 400 }
        );
      }
    }
    // Validar IRPF si existe
    if (body.irpf !== undefined && (typeof body.irpf !== 'number' || isNaN(body.irpf) || body.irpf < 0)) {
      return NextResponse.json(
        { error: 'El IRPF debe ser un número mayor o igual a 0.' },
        { status: 400 }
      );
    }
    // Validar estado si existe
    if (body.estado && !['borrador', 'emitida', 'pagada', 'cancelada'].includes(body.estado)) {
      return NextResponse.json(
        { error: 'El estado de la factura no es válido.' },
        { status: 400 }
      );
    }
    
    // Calcular totales
    let subtotal = 0;
    let impuestos = 0;
    
    // Calcular total de cada línea y totales generales
    body.lineas = body.lineas.map(linea => {
      // Asegurar que los valores son números
      const cantidad = parseFloat(linea.cantidad) || 0;
      const precio = parseFloat(linea.precio) || 0;
      const impuesto = parseFloat(linea.impuesto) || 0;
      
      const precioTotal = precio * cantidad;
      const impuestoLinea = (precioTotal * impuesto) / 100;
      
      subtotal += precioTotal;
      impuestos += impuestoLinea;
      
      return {
        ...linea,
        cantidad,
        precio,
        impuesto,
        total: parseFloat((precioTotal + impuestoLinea).toFixed(2))
      };
    });
    
    // Aplicar IRPF si existe y asegurar que es un número
    const irpfPorcentaje = parseFloat(body.irpf) || 0;
    const irpf = (subtotal * irpfPorcentaje) / 100;
    
    // Calcular total final y redondear a 2 decimales
    const total = parseFloat((subtotal + impuestos - irpf).toFixed(2));
    subtotal = parseFloat(subtotal.toFixed(2));
    impuestos = parseFloat(impuestos.toFixed(2));
    const irpfFinal = parseFloat(irpf.toFixed(2));
    
    // Crear la factura con los totales calculados
    const nuevaFactura = await Factura.create({
      ...body,
      subtotal,
      impuestos,
      irpf: irpfFinal,
      total,
      usuario: userId
    });
    
    // Poblar el cliente para la respuesta
    await nuevaFactura.populate('cliente');
    
    return NextResponse.json(nuevaFactura, { status: 201 });
  } catch (error) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.error("Error al crear factura:", error);
    return NextResponse.json(
      { error: 'Error al crear factura: ' + error.message },
      { status: 500 }
    );
  }
} 