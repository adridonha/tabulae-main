import mongoose from 'mongoose';

// Utilizar la variable de entorno para la conexión
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Si no hay URI, lanza error
  throw new Error(
    'Por favor defina la variable de entorno MONGODB_URI en el archivo .env.local'
  );
}

/**
 * Global es usado aquí para mantener la conexión
 * a la base de datos durante hot reloads en desarrollo
 */
let cached = global.mongoose;

if (!cached) {
  // Si no existe el objeto global, lo crea
  cached = global.mongoose = { conn: null, promise: null };
}

// Esta función conecta a la base de datos MongoDB
async function dbConnect() {
  // Si ya hay una conexión, la devuelve
  if (cached.conn) {
    return cached.conn;
  }

  // Si no hay promesa de conexión, la crea
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  // Espera a que la promesa se resuelva y guarda la conexión
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 