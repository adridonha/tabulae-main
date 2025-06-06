import mongoose from 'mongoose';

// Definimos el esquema para los clientes
const ClienteSchema = new mongoose.Schema(
  {
    // Nombre del cliente
    nombre: { type: String, required: true },
    // Dirección del cliente
    direccion: { type: String, required: true },
    // Código postal (opcional)
    codigoPostal: { type: String },
    // Localidad (opcional)
    localidad: { type: String },
    // Provincia (opcional)
    provincia: { type: String },
    // NIF/CIF del cliente
    nif: { type: String, required: true },
    // Email del cliente
    email: { type: String, required: true },
    // Teléfono del cliente
    telefono: { type: String, required: true },
    // Referencia al usuario dueño del cliente
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

// Exportamos el modelo de cliente
export default mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema); 