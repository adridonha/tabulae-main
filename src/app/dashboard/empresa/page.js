"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Componente para editar los datos de la empresa
export default function EmpresaPage() {
  // Referencia para el input de archivo del logo
  const fileInputRef = useRef(null);
  // Estado para los datos del formulario de empresa
  const [formData, setFormData] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    email: "",
    telefono: "",
    iban: "",
    logo: "",
    propietario: "",
    codigoPostal: "",
    localidad: "",
    provincia: "",
    colorFactura: "#BF2954",
    fuenteFactura: "Helvetica",
  });
  // Estado para mostrar loading al cargar
  const [loading, setLoading] = useState(true);
  // Estado para mostrar loading al enviar
  const [submitting, setSubmitting] = useState(false);
  // Estado para mostrar loading al subir logo
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // Estado para mostrar errores generales
  const [error, setError] = useState(null);
  // Estado para mostrar errores de logo
  const [logoError, setLogoError] = useState(null);
  // Estado para mostrar mensaje de éxito
  const [success, setSuccess] = useState(false);
  // Estado para la vista previa del logo
  const [preview, setPreview] = useState(null);

  // Cargar los datos de la empresa al montar el componente
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true);
        console.log('Fetching empresa data...');
        
        const response = await fetch("/api/empresa");
        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Empresa data received:', data);

          // Si no hay datos (objeto vacío) no actualizar el formulario
          if (Object.keys(data).length === 0) {
            console.log('No empresa data found');
            setLoading(false);
            return;
          }

          // Actualizar formData con los datos existentes, manteniendo los valores por defecto para campos que falten
          setFormData((prevState) => ({
            ...prevState,
            ...data,
            logo: data.logo || prevState.logo || "",
            colorFactura: data.colorFactura || prevState.colorFactura,
            fuenteFactura: data.fuenteFactura || prevState.fuenteFactura,
          }));

          // Establecer vista previa del logo
          if (data.logo) {
            setPreview(data.logo);
          }
        } else {
          console.error('Error fetching empresa data:', response.status);
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener datos de la empresa');
        }
      } catch (error) {
        console.error('Error in fetchEmpresa:', error);
        setError(
          `Error al cargar información de la empresa: ${error.message || "Error desconocido"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Maneja el cambio de archivo del logo
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    // Crear una URL para la vista previa
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLogoError(null);

    // Subir el logo
    handleLogoUpload(file);
  };

  // Sube el logo al servidor
  const handleLogoUpload = async (file) => {
    try {
      setUploadingLogo(true);
      setLogoError(null);

      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/empresa/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al subir el logo");
      }

      const data = await response.json();
      console.log('Logo subido:', data.logoUrl);

      // Actualizar el formulario con la nueva URL del logo
      setFormData((prev) => ({
        ...prev,
        logo: data.logoUrl,
      }));

      // Actualizar la vista previa con la nueva URL
      setPreview(data.logoUrl);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLogoError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Abre el input de archivo para seleccionar logo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Maneja el envío del formulario de empresa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validar campos requeridos
    const requiredFields = ["nombre", "nif", "direccion", "telefono", "email"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Faltan campos requeridos: ${missingFields.join(", ")}`);
      setSubmitting(false);
      return;
    }

    try {
      // Usar el método correcto basado en si tenemos un ID
      const method = formData._id ? "PUT" : "POST";
      console.log(`Enviando datos de empresa usando método ${method}:`, formData);

      const response = await fetch("/api/empresa", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', response.status, errorData);
        throw new Error(errorData.error || `Error al guardar datos de la empresa (${response.status})`);
      }

      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);
      
      // Importante: actualizar el estado con los datos recibidos del servidor
      setFormData(prevData => ({
        ...prevData,
        ...data
      }));
      
      setSuccess(true);

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loader mientras se cargan los datos de la empresa
  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        role="status"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Datos de la Empresa
        </h1>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative"
          role="alert"
          aria-live="assertive"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Mensaje de éxito si se guardó correctamente */}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative"
          role="alert"
          aria-live="polite"
        >
          <strong className="font-bold">Éxito:</strong>
          <span className="block sm:inline">
            {" "}
            Datos guardados correctamente.
          </span>
        </div>
      )}

      {/* Formulario de empresa */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Logo de la Empresa
          </h2>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
              {/* Vista previa del logo o placeholder */}
              {preview ? (
                <Image
                  src={preview}
                  alt="Logo de la empresa"
                  className="max-h-full max-w-full object-contain"
                  width={128}
                  height={128}
                  unoptimized={true}
                  onError={(e) => {
                    console.error('Error al cargar la imagen:', e);
                    e.target.onerror = null;
                    e.target.src = "/placeholder-logo.png";
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs mt-1">Sin logo</p>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {uploadingLogo ? "Subiendo..." : "Seleccionar logo"}
                </button>
                <p className="text-sm text-gray-600">
                  Sube un archivo PNG, JPG o SVG (máx. 2MB)
                </p>
                {logoError && (
                  <p className="text-sm text-red-600">{logoError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos del formulario de empresa */}
          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="nombre"
            >
              Nombre de la Empresa
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="propietario"
            >
              Propietario / Responsable
            </label>
            <input
              id="propietario"
              name="propietario"
              type="text"
              value={formData.propietario || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Nombre del propietario"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="nif"
            >
              CIF/NIF
            </label>
            <input
              id="nif"
              name="nif"
              type="text"
              value={formData.nif || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
              placeholder="CIF/NIF"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="direccion"
            >
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={formData.direccion || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="codigoPostal"
            >
              Código Postal
            </label>
            <input
              id="codigoPostal"
              name="codigoPostal"
              type="text"
              value={formData.codigoPostal || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Código postal"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="localidad"
            >
              Localidad
            </label>
            <input
              id="localidad"
              name="localidad"
              type="text"
              value={formData.localidad || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Localidad"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="provincia"
            >
              Provincia
            </label>
            <input
              id="provincia"
              name="provincia"
              type="text"
              value={formData.provincia || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Provincia"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="telefono"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              value={formData.telefono || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Teléfono de contacto"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Email de contacto"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="iban"
            >
              IBAN
            </label>
            <input
              id="iban"
              name="iban"
              type="text"
              value={formData.iban || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="Número de cuenta (IBAN)"
            />
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="colorFactura"
            >
              Color de la Factura
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="colorFactura"
                name="colorFactura"
                type="color"
                value={formData.colorFactura || "#BF2954"}
                onChange={handleChange}
                className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                Este color se utilizará en el encabezado de la factura
              </span>
            </div>
          </div>

          <div>
            <label
              className="block text-gray-900 mb-2 font-medium"
              htmlFor="fuenteFactura"
            >
              Fuente de la Factura
            </label>
            <select
              id="fuenteFactura"
              name="fuenteFactura"
              value={formData.fuenteFactura || "Helvetica"}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="Helvetica">Helvetica</option>
              <option value="Times-Roman">Times Roman</option>
              <option value="Courier">Courier</option>
            </select>
          </div>
        </div>

        {/* Botón para guardar los cambios */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
