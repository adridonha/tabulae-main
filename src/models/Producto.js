import mongoose from 'mongoose';

// Definimos el esquema para los productos
// Un esquema es como una plantilla que define la estructura de los documentos en MongoDB
const ProductoSchema = new mongoose.Schema(
  {
    // Nombre del producto - campo obligatorio de tipo texto
    nombre: { type: String, required: true },
    
    // Descripción detallada del producto - campo obligatorio de tipo texto
    descripcion: { type: String, required: true },
    
    // Código o referencia del producto - campo opcional de tipo texto
    // Permite identificar el producto con un código personalizado
    codigo: { type: String, required: false, default: '', maxlength: 50 },
    
    // Precio del producto con 4 decimales de precisión
    // Usamos getters y setters para asegurar que siempre se guarde con 4 decimales
    precio: { 
      type: Number, 
      required: true, 
      min: 0, // No permitimos precios negativos
      get: v => Number(v.toFixed(4)), // Al obtener el valor, lo redondeamos a 4 decimales
      set: v => Number(v.toFixed(4))  // Al guardar el valor, lo redondeamos a 4 decimales
    },
    
    // Porcentaje de impuesto (IVA) - debe estar entre 0 y 100
    impuesto: { type: Number, required: true, min: 0, max: 100 },
    
    // Referencia al usuario que creó el producto
    // Esto nos permite saber quién es el dueño de cada producto
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { 
    // Habilitamos los timestamps para que mongoose añada automáticamente
    // createdAt y updatedAt a cada documento
    timestamps: true,
    
    // Habilitamos los getters en las conversiones a JSON y Object
    // Esto asegura que los precios siempre se muestren con 4 decimales
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Creamos un índice para mejorar el rendimiento de las búsquedas por usuario
// Esto es importante porque filtraremos productos por usuario frecuentemente
ProductoSchema.index({ usuario: 1 });

// Exportamos el modelo
// Si ya existe un modelo llamado 'Producto', lo usamos
// Si no existe, creamos uno nuevo con el esquema definido
export default mongoose.models.Producto || mongoose.model('Producto', ProductoSchema); 