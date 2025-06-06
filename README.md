# Tabulae

**Tabulae** es una aplicación web desarrollada con **Next.js** y **MongoDB** que permite la generación de facturas personalizadas en PDF, incluyendo logotipos empresariales mediante el uso de **Cloudinary** para el almacenamiento de imágenes. Las empresas que usen esta herramienta cuentan con una base de datos donde almacenar clientes, productos y facturas.

## Requisitos Previos

Antes de instalar y ejecutar este proyecto, asegúrate de que los siguientes componentes estén correctamente configurados:

### 1. Node.js y npm

Tabulae utiliza **Next.js**, que requiere Node.js (v18 o superior). Recomendamos instalarlo con **Node Version Manager (nvm)**.

#### Instalación de Node.js con NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm --version
nvm install node
node -v
npm -v
```

---

### 2. Base de Datos: MongoDB Atlas

Usamos **MongoDB Atlas**, una solución NoSQL en la nube, para el almacenamiento de datos.

#### Configuración:

1. Regístrate en: https://www.mongodb.com/es/atlas  
2. Crea un **cluster gratuito** seleccionando AWS y una región cercana.
3. Crea un usuario de base de datos con permisos de lectura/escritura.
4. Permite el acceso desde cualquier IP (`0.0.0.0/0`) en **Network Access**.
5. Obtén tu URI de conexión, con este formato:

```
mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

### 3. Almacenamiento de Imágenes: Cloudinary

Tabulae almacena imágenes (como logotipos) en **Cloudinary** para su inclusión en los PDFs.

#### Configuración:

1. Crea una cuenta gratuita en: https://cloudinary.com  
2. Accede al **Dashboard** y localiza tus **API Keys**.
3. Guarda la URL de conexión con este formato:

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

---

## Instalación del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/adridonha/tabulae
cd tabulae2
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias especificadas en `package.json`.

---

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

```env
MONGODB_URI=your_mongodb_connection_uri
CLOUDINARY_URL=your_cloudinary_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
```

> No incluyas este archivo en el repositorio (`.gitignore` lo excluye automáticamente).

Para generar un `NEXTAUTH_SECRET` seguro:

```bash
openssl rand -base64 32
```

---

### 4. Ejecutar el proyecto

```bash
npm run dev
```

Esto iniciará el servidor local en `http://localhost:3000`.

---

## Despliegue

Para el entorno de producción, recomendamos desplegar el proyecto en **[Vercel](https://vercel.com)**, plataforma optimizada para aplicaciones Next.js. Asegúrate de configurar correctamente las variables de entorno en el panel de Vercel.

---

## Tecnologías Usadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Cloudinary](https://cloudinary.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Mongoose](https://mongoosejs.com/)

---

## Licencia

Este proyecto está bajo la licencia MIT.
