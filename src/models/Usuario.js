import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Definimos el esquema para los usuarios
const UsuarioSchema = new mongoose.Schema(
  {
    // Nombre del usuario
    nombre: { type: String, required: true, trim: true },
    // Email único y en minúsculas
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      index: true
    },
    // Contraseña encriptada
    password: { type: String, required: true },
    // Rol del usuario (admin o usuario normal)
    rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' }
  },
  { 
    timestamps: true,
    methods: {
      // Método para comparar contraseñas
      async compararPassword(password) {
        return await bcrypt.compare(password, this.password);
      }
    }
  }
);

// Middleware para encriptar la contraseña antes de guardar
UsuarioSchema.pre('save', async function (next) {
  // Solo encripta si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Utilizar try-catch para evitar errores al compilar el modelo múltiples veces
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

export default Usuario; 