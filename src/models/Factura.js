import mongoose from 'mongoose';

// Esquema para las líneas individuales de una factura
// Cada línea representa un producto o servicio en la factura
const LineaFacturaSchema = new mongoose.Schema({
  // Referencia al producto - campo obligatorio
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  
  // Cantidad del producto - debe ser al menos 1
  cantidad: { type: Number, required: true, min: 1 },
  
  // Precio unitario con 4 decimales de precisión
  precio: { 
    type: Number, 
    required: true, 
    min: 0, // No permitimos precios negativos
    get: v => Number(v.toFixed(4)), // Al obtener el valor, lo redondeamos a 4 decimales
    set: v => Number(v.toFixed(4))  // Al guardar el valor, lo redondeamos a 4 decimales
  },
  
  // Porcentaje de impuesto aplicado a esta línea
  impuesto: { type: Number, required: true, min: 0 },
  
  // Total de la línea (precio * cantidad + impuestos)
  total: { 
    type: Number, 
    required: true, 
    min: 0,
    get: v => Number(v.toFixed(4)),
    set: v => Number(v.toFixed(4))
  }
}, { 
  // Habilitamos los getters en las conversiones a JSON y Object
  toJSON: { getters: true }, 
  toObject: { getters: true } 
});

// Esquema principal de la factura
const FacturaSchema = new mongoose.Schema(
  {
    // Número único de factura para cada usuario
    numero: { type: String, required: true },
    
    // Fecha de emisión de la factura
    fecha: { type: Date, required: true, default: Date.now },
    
    // Fecha límite para el pago
    fechaVencimiento: { type: Date, required: true },
    
    // Referencia al cliente al que se emite la factura
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    
    // Array de líneas de factura
    lineas: [LineaFacturaSchema],
    
    // Subtotal antes de impuestos
    subtotal: { 
      type: Number, 
      required: true, 
      min: 0,
      get: v => Number(v.toFixed(4)),
      set: v => Number(v.toFixed(4))
    },
    
    // Total de impuestos
    impuestos: { 
      type: Number, 
      required: true, 
      min: 0,
      get: v => Number(v.toFixed(4)),
      set: v => Number(v.toFixed(4))
    },
    
    // Porcentaje de IRPF (si aplica)
    irpf: { 
      type: Number, 
      default: 0, 
      min: 0,
      get: v => Number(v.toFixed(4)),
      set: v => Number(v.toFixed(4))
    },
    
    // Total final de la factura
    total: { 
      type: Number, 
      required: true, 
      min: 0,
      get: v => Number(v.toFixed(4)),
      set: v => Number(v.toFixed(4))
    },
    
    // Estado de la factura
    estado: { 
      type: String, 
      enum: ['borrador', 'emitida', 'pagada', 'cancelada'], 
      default: 'borrador' 
    },
    
    // Referencia al usuario que creó la factura
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { 
    // Habilitamos los timestamps para createdAt y updatedAt
    timestamps: true,
    
    // Habilitamos los getters en las conversiones
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Índice compuesto para asegurar que el número de factura sea único por usuario
// Esto evita que dos usuarios tengan facturas con el mismo número
FacturaSchema.index({ numero: 1, usuario: 1 }, { unique: true });

// Índice para mejorar las búsquedas por usuario
FacturaSchema.index({ usuario: 1 });

// Exportamos el modelo de factura
export default mongoose.models.Factura || mongoose.model('Factura', FacturaSchema); 