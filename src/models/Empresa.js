import mongoose from "mongoose";

// Definimos el esquema para las empresas
const EmpresaSchema = new mongoose.Schema(
  {
    // Nombre de la empresa
    nombre: { type: String, required: true },
    // Dirección de la empresa
    direccion: { type: String, required: true },
    // NIF/CIF de la empresa
    nif: { type: String, required: true },
    // Teléfono de la empresa
    telefono: { type: String, required: true },
    // Email de la empresa
    email: { type: String, required: true },
    // Ruta o URL del logo (opcional)
    logo: { type: String },
    // IBAN de la empresa (opcional)
    iban: { type: String },
    // Nombre del propietario (opcional)
    propietario: { type: String },
    // Código postal (opcional)
    codigoPostal: { type: String },
    // Localidad (opcional)
    localidad: { type: String },
    // Provincia (opcional)
    provincia: { type: String },
    // Color principal para las facturas
    colorFactura: { type: String, default: "#BF2954" },
    // Fuente para las facturas
    fuenteFactura: { type: String, default: "Helvetica" },
    // Referencia al usuario dueño de la empresa
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true, collection: "empresas" },
);

// Índice compuesto para asegurar que nif sea único para cada usuario
EmpresaSchema.index({ nif: 1, usuario: 1 }, { unique: true });

// Exportamos el modelo de empresa
export default mongoose.models.Empresas ||
  mongoose.model("Empresas", EmpresaSchema);
