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
    // Email del cliente (opcional)
    email: { type: String },
    // Teléfono del cliente (opcional)
    telefono: { type: String },
    // Referencia al usuario dueño del cliente
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

// En desarrollo, HMR reutiliza el modelo compilado y ignora cambios del esquema; volvemos a registrarlo.
if (process.env.NODE_ENV === 'development' && mongoose.models.Cliente) {
  mongoose.deleteModel('Cliente');
}

// Exportamos el modelo de cliente
export default mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema); 