import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cliente from '../src/models/Cliente.js';
import Usuario from '../src/models/Usuario.js';
import Producto from '../src/models/Producto.js';
import Factura from '../src/models/Factura.js';
import Empresa from '../src/models/Empresa.js';

dotenv.config({ path: '.env.local' });

// Pruebas de integración del sistema usando Jest
describe('Pruebas del Sistema', () => {
  let testUsuario;
  let testEmpresa;

  // Antes de todas las pruebas, conectar a la base de datos y crear datos de prueba
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Crear usuario de prueba
    testUsuario = await Usuario.create({
      nombre: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      rol: 'admin'
    });

    // Crear empresa de prueba
    testEmpresa = await Empresa.create({
      nombre: 'Empresa Test',
      direccion: 'Dirección Test',
      nif: 'B12345678',
      telefono: '123456789',
      email: 'empresa@test.com',
      usuario: testUsuario._id
    });
  });

  // Después de todas las pruebas, limpiar la base de datos y desconectar
  afterAll(async () => {
    // Limpiar datos de prueba
    await Cliente.deleteMany({ usuario: testUsuario._id });
    await Producto.deleteMany({ usuario: testUsuario._id });
    await Factura.deleteMany({ usuario: testUsuario._id });
    await Empresa.deleteOne({ _id: testEmpresa._id });
    await Usuario.deleteOne({ _id: testUsuario._id });
    await mongoose.disconnect();
  });

  // Antes de cada prueba, limpiar los datos relacionados
  beforeEach(async () => {
    // Limpiar datos antes de cada prueba
    await Cliente.deleteMany({ usuario: testUsuario._id });
    await Producto.deleteMany({ usuario: testUsuario._id });
    await Factura.deleteMany({ usuario: testUsuario._id });
  });

  // 1. Prueba de creación de cliente con datos completos
  test('Debería crear un cliente con todos los campos opcionales', async () => {
    // Creamos un cliente con todos los campos
    const clienteData = {
      nombre: 'Cliente Completo',
      direccion: 'Dirección Principal',
      codigoPostal: '41001',
      localidad: 'Sevilla',
      provincia: 'Sevilla',
      nif: 'A12345678',
      email: 'cliente@test.com',
      telefono: '123456789',
      usuario: testUsuario._id
    };

    const cliente = await Cliente.create(clienteData);
    expect(cliente.codigoPostal).toBe('41001');
    expect(cliente.localidad).toBe('Sevilla');
    expect(cliente.provincia).toBe('Sevilla');
  });

  // 2. Prueba de validación de email
  test('Debería rechazar un email inválido', async () => {
    // Intentamos crear un cliente con email inválido
    const clienteData = {
      nombre: 'Cliente Email',
      direccion: 'Dirección Test',
      nif: 'B12345678',
      email: 'emailinvalido',
      telefono: '123456789',
      usuario: testUsuario._id
    };

    await expect(Cliente.create(clienteData))
      .rejects
      .toThrow();
  });

  // 3. Prueba de creación de producto con decimales
  test('Debería manejar correctamente precios con decimales', async () => {
    // Creamos un producto con precio decimal
    const productoData = {
      nombre: 'Producto Test',
      descripcion: 'Descripción Test',
      precio: 19.9999,
      impuesto: 21,
      usuario: testUsuario._id
    };

    const producto = await Producto.create(productoData);
    expect(producto.precio).toBe(19.9999);
  });

  // 4. Prueba de actualización de empresa
  test('Debería actualizar los datos de la empresa', async () => {
    // Actualizamos el nombre y teléfono de la empresa
    const nuevosDatos = {
      nombre: 'Empresa Actualizada',
      telefono: '987654321'
    };

    const empresaActualizada = await Empresa.findByIdAndUpdate(
      testEmpresa._id,
      nuevosDatos,
      { new: true }
    );

    expect(empresaActualizada.nombre).toBe('Empresa Actualizada');
    expect(empresaActualizada.telefono).toBe('987654321');
  });

  // 5. Prueba de creación de factura
  test('Debería crear una factura con líneas de producto', async () => {
    // Crear producto de prueba
    const producto = await Producto.create({
      nombre: 'Producto Factura',
      descripcion: 'Descripción Test',
      precio: 100,
      impuesto: 21,
      usuario: testUsuario._id
    });

    // Crear cliente de prueba
    const cliente = await Cliente.create({
      nombre: 'Cliente Factura',
      direccion: 'Dirección Test',
      nif: 'C12345678',
      email: 'cliente@test.com',
      telefono: '123456789',
      usuario: testUsuario._id
    });

    // Creamos la factura con una línea
    const facturaData = {
      numero: 'F2024-001',
      fecha: new Date(),
      cliente: cliente._id,
      lineas: [{
        producto: producto._id,
        cantidad: 2,
        precio: 100,
        impuesto: 21
      }],
      subtotal: 200,
      impuestos: 42,
      total: 242,
      estado: 'pendiente',
      usuario: testUsuario._id
    };

    const factura = await Factura.create(facturaData);
    expect(factura.lineas).toHaveLength(1);
    expect(factura.total).toBe(242);
  });

  // 6. Prueba de búsqueda de productos por rango de precio
  test('Debería encontrar productos en un rango de precio', async () => {
    // Creamos varios productos
    await Producto.create([
      {
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 10,
        impuesto: 21,
        usuario: testUsuario._id
      },
      {
        nombre: 'Producto 2',
        descripcion: 'Descripción 2',
        precio: 20,
        impuesto: 21,
        usuario: testUsuario._id
      },
      {
        nombre: 'Producto 3',
        descripcion: 'Descripción 3',
        precio: 30,
        impuesto: 21,
        usuario: testUsuario._id
      }
    ]);

    // Buscamos productos entre 15 y 25 euros
    const productos = await Producto.find({
      usuario: testUsuario._id,
      precio: { $gte: 15, $lte: 25 }
    });

    expect(productos).toHaveLength(1);
    expect(productos[0].precio).toBe(20);
  });

  // 7. Prueba de actualización de estado de factura
  test('Debería actualizar el estado de una factura', async () => {
    // Creamos una factura y luego actualizamos su estado
    const factura = await Factura.create({
      numero: 'F2024-002',
      fecha: new Date(),
      cliente: (await Cliente.create({
        nombre: 'Cliente Test',
        direccion: 'Dirección Test',
        nif: 'D12345678',
        email: 'cliente@test.com',
        telefono: '123456789',
        usuario: testUsuario._id
      }))._id,
      lineas: [],
      subtotal: 0,
      impuestos: 0,
      total: 0,
      estado: 'pendiente',
      usuario: testUsuario._id
    });

    // Actualizamos el estado a 'pagada'
    const facturaActualizada = await Factura.findByIdAndUpdate(
      factura._id,
      { estado: 'pagada' },
      { new: true }
    );

    expect(facturaActualizada.estado).toBe('pagada');
  });

  // 8. Prueba de eliminación de producto
  test('Debería eliminar un producto correctamente', async () => {
    // Creamos un producto y luego lo eliminamos
    const producto = await Producto.create({
      nombre: 'Producto a Eliminar',
      descripcion: 'Descripción Test',
      precio: 100,
      impuesto: 21,
      usuario: testUsuario._id
    });

    await Producto.findByIdAndDelete(producto._id);
    const productoEliminado = await Producto.findById(producto._id);
    expect(productoEliminado).toBeNull();
  });

  // 9. Prueba de búsqueda de clientes por localidad
  test('Debería encontrar clientes por localidad', async () => {
    // Creamos dos clientes en distintas localidades
    await Cliente.create([
      {
        nombre: 'Cliente 1',
        direccion: 'Dirección 1',
        localidad: 'Sevilla',
        nif: 'E12345678',
        email: 'cliente1@test.com',
        telefono: '123456789',
        usuario: testUsuario._id
      },
      {
        nombre: 'Cliente 2',
        direccion: 'Dirección 2',
        localidad: 'Málaga',
        nif: 'F12345678',
        email: 'cliente2@test.com',
        telefono: '987654321',
        usuario: testUsuario._id
      }
    ]);

    // Buscamos clientes de Sevilla
    const clientesSevilla = await Cliente.find({
      usuario: testUsuario._id,
      localidad: 'Sevilla'
    });

    expect(clientesSevilla).toHaveLength(1);
    expect(clientesSevilla[0].nombre).toBe('Cliente 1');
  });

  // 10. Prueba de cálculo de totales en factura
  test('Debería calcular correctamente los totales de una factura', async () => {
    // Creamos un producto y una factura con varias cantidades
    const producto = await Producto.create({
      nombre: 'Producto Test',
      descripcion: 'Descripción Test',
      precio: 100,
      impuesto: 21,
      usuario: testUsuario._id
    });

    const facturaData = {
      numero: 'F2024-003',
      fecha: new Date(),
      cliente: (await Cliente.create({
        nombre: 'Cliente Test',
        direccion: 'Dirección Test',
        nif: 'G12345678',
        email: 'cliente@test.com',
        telefono: '123456789',
        usuario: testUsuario._id
      }))._id,
      lineas: [{
        producto: producto._id,
        cantidad: 3,
        precio: 100,
        impuesto: 21
      }],
      subtotal: 300,
      impuestos: 63,
      total: 363,
      estado: 'pendiente',
      usuario: testUsuario._id
    };

    const factura = await Factura.create(facturaData);
    expect(factura.subtotal).toBe(300);
    expect(factura.impuestos).toBe(63);
    expect(factura.total).toBe(363);
  });
}); 