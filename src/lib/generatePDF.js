import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import fetch from "node-fetch";

// Función auxiliar para convertir código HEX a RGB
const hexToRgb = (hex) => {
  // Eliminar el # si existe
  hex = hex.replace(/^#/, "");

  // Parsear los componentes
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Asegurar valores válidos
  r = isNaN(r) ? 0 : r;
  g = isNaN(g) ? 0 : g;
  b = isNaN(b) ? 0 : b;

  return { r, g, b };
};

// Función para truncar y ajustar texto largo
const truncateText = (text, maxWidth, font, fontSize) => {
  if (!text) return "";
  
  const avgCharWidth = font.widthOfTextAtSize("m", fontSize);
  const maxChars = Math.floor(maxWidth / avgCharWidth);
  
  if (text.length <= maxChars) return text;
  
  return text.substring(0, maxChars - 3) + "...";
};

// Esta función genera un PDF de una factura usando los datos de la factura y la empresa
export const generateInvoicePDF = async (factura, empresa) => {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();

  // Agregar una página al documento
  let page = pdfDoc.addPage([595.28, 841.89]); // A4

  // Determinar qué fuente usar basado en la configuración de la empresa
  const fontName = empresa?.fuenteFactura || "Helvetica";

  // Mapeo de nombres de fuentes personalizadas a fuentes estándar de PDF
  const fontMap = {
    Helvetica: StandardFonts.Helvetica,
    "Helvetica-Bold": StandardFonts.HelveticaBold,
    "Times-Roman": StandardFonts.TimesRoman,
    "Times-Bold": StandardFonts.TimesBold,
    Courier: StandardFonts.Courier,
    "Courier-Bold": StandardFonts.CourierBold,
  };

  // Obtener las fuentes regulares y bold correspondientes
  const regularFontName = fontMap[fontName] || StandardFonts.Helvetica;
  const boldFontName =
    fontMap[`${fontName}-Bold`] ||
    fontMap[fontName === "Times-Roman" ? "Times-Bold" : "HelveticaBold"] ||
    StandardFonts.HelveticaBold;

  // Cargar fuentes seleccionadas
  const regularFont = await pdfDoc.embedFont(regularFontName);
  const boldFont = await pdfDoc.embedFont(boldFontName);

  // Definir constantes para posiciones y tamaños
  const margin = 50;
  const width = page.getWidth() - 2 * margin;
  const pageHeight = page.getHeight();

  // Definir colores principales usando el color seleccionado por el usuario
  const colorHex = empresa?.colorFactura || "#BF2954"; // Color por defecto
  const rgbColor = hexToRgb(colorHex);
  const primaryColor = rgb(rgbColor.r, rgbColor.g, rgbColor.b);

  // --------- SECCIÓN DE CABECERA ---------
  // Dibujar un rectángulo de color para la cabecera
  page.drawRectangle({
    x: margin,
    y: pageHeight - margin - 100,
    width: width,
    height: 100,
    color: rgb(0.97, 0.97, 0.97), // Gris muy claro
    borderColor: primaryColor,
    borderWidth: 1,
  });

  // Intentar cargar el logo si existe
  try {
    if (empresa?.logo) {
      const logoPath = empresa.logo;
      const logoUrl = logoPath.startsWith("/")
        ? `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}${logoPath}`
        : logoPath;

      try {
        // Intentar obtener la imagen del logo
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer();

          // Determinar tipo de imagen y cargarla correctamente
          let logoImage;
          if (logoPath.toLowerCase().endsWith(".png")) {
            logoImage = await pdfDoc.embedPng(logoBuffer);
          } else if (
            logoPath.toLowerCase().endsWith(".jpg") ||
            logoPath.toLowerCase().endsWith(".jpeg")
          ) {
            logoImage = await pdfDoc.embedJpg(logoBuffer);
          } else {
            throw new Error("Formato de imagen no soportado");
          }

          if (logoImage) {
            // Calcular dimensiones proporcionalmente
            const logoDims = logoImage.scale(1);
            const maxHeight = 80; // Altura máxima del logo
            const maxWidth = 120; // Ancho máximo del logo reducido para mejor alineación
            
            // Escalar respetando proporciones
            let scaleFactor = 1;
            if (logoDims.width > maxWidth || logoDims.height > maxHeight) {
              const scaleWidth = maxWidth / logoDims.width;
              const scaleHeight = maxHeight / logoDims.height;
              scaleFactor = Math.min(scaleWidth, scaleHeight);
            }

            // Posición del logo centrado verticalmente en el rectángulo
            const logoWidth = logoDims.width * scaleFactor;
            const logoHeight = logoDims.height * scaleFactor;
            const logoY = pageHeight - margin - 50 - (logoHeight / 2);
            
            // Dibujar logo
            page.drawImage(logoImage, {
              x: margin + 15,
              y: logoY,
              width: logoWidth,
              height: logoHeight,
            });
          }
        } else {
          console.log("No se pudo cargar el logo");
        }
      } catch (logoError) {
        console.log("Error al cargar el logo:", logoError.message);
      }
    }
  } catch (e) {
    console.log("Error al procesar el logo:", e.message);
  }

  // --------- INFORMACIÓN DE LA EMPRESA ---------
  // Detalles de la empresa en la cabecera a la derecha - más cerca del logo
  const empresaInfoX = margin + 150; // Reducido para acercar al logo
  let headerY = pageHeight - margin - 25;

  if (empresa) {
    // Nombre de la empresa en negrita
    const nombreEmpresa = empresa.nombre || "Empresa";
    page.drawText(nombreEmpresa, {
      x: empresaInfoX,
      y: headerY,
      size: 14,
      font: boldFont,
      color: primaryColor,
    });

    headerY -= 18;

    // Dirección completa
    const direccion = empresa.direccion || "";
    if (direccion) {
      page.drawText(direccion, {
        x: empresaInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }

    // Código postal y localidad
    const codigoPostal = empresa.codigoPostal || "";
    const localidad = empresa.localidad || "";
    if (codigoPostal || localidad) {
      page.drawText(`${codigoPostal} ${localidad}`, {
        x: empresaInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }

    // Provincia
    const provincia = empresa.provincia || "";
    if (provincia) {
      page.drawText(provincia, {
        x: empresaInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }
  }

  // --------- DATOS FISCALES ---------
  // Datos fiscales a la derecha, ajustados para evitar desbordamiento
  const fiscalInfoX = margin + 350; // Reducido para dar más espacio al texto
  headerY = pageHeight - margin - 25;

  if (empresa) {
    const propietario = (empresa.propietario || "").trim();
    if (propietario) {
      const propietarioText =
        propietario.length > 35
          ? truncateText(propietario, 195, regularFont, 10)
          : propietario;
      page.drawText(propietarioText, {
        x: fiscalInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }

    // NIF/CIF
    const nif = empresa.nif || "";
    if (nif) {
      page.drawText(`${nif}`, {
        x: fiscalInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }

    // Teléfono
    const telefono = empresa.telefono || "";
    if (telefono) {
      page.drawText(`${telefono}`, {
        x: fiscalInfoX,
        y: headerY,
        size: 10,
        font: regularFont,
      });
      headerY -= 14;
    }

    // Email - asegurar que no se salga
    const email = empresa.email || "";
    if (email) {
      // Usar tamaño de letra más pequeño para emails largos
      const emailSize = 10;
      // Truncar solo si es extremadamente largo
      const emailText = email.length > 35 
        ? truncateText(email, 195, regularFont, emailSize)
        : email;
        
      page.drawText(emailText, {
        x: fiscalInfoX,
        y: headerY,
        size: emailSize,
        font: regularFont,
      });
      headerY -= 14;
    }

    // IBAN si existe - utilizar tamaño de letra más pequeño para IBANs largos
    const iban = empresa.iban || "";
    if (iban) {
      const ibanSize = 10;
      
      if (iban.length > 30) {
        // Si es muy largo, mostrar en dos líneas
        const ibanParts = iban.match(/.{1,25}/g) || [iban];
        
        page.drawText(ibanParts[0], {
          x: fiscalInfoX,
          y: headerY,
          size: ibanSize,
          font: regularFont,
        });
        
        if (ibanParts.length > 1) {
          headerY -= 12;
          page.drawText(ibanParts[1], {
            x: fiscalInfoX,
            y: headerY,
            size: ibanSize,
            font: regularFont,
          });
        }
      } else {
        // Si cabe en una línea
        page.drawText(iban, {
          x: fiscalInfoX,
          y: headerY,
          size: ibanSize,
          font: regularFont,
        });
      }
    }
  }

  // --------- TÍTULO FACTURA Y DATOS BÁSICOS ---------
  // Crear separación clara entre la cabecera y la barra de factura
  let currentY = pageHeight - margin - 160; // Aumentar separación entre cabecera y factura

  // Título FACTURA con un rectángulo para acomodar las fechas
  page.drawRectangle({
    x: margin,
    y: currentY - 10,
    width: width,
    height: 55, // Altura para incluir las fechas
    color: primaryColor,
  });

  page.drawText("FACTURA", {
    x: margin + 20,
    y: currentY + 25, // Ajustado hacia arriba
    size: 16,
    font: boldFont,
    color: rgb(1, 1, 1), // Texto blanco
  });

  // Datos de la factura (número)
  const facturaInfoX = margin + 300;
  
  page.drawText(`Nº: ${factura.numero || ""}`, {
    x: facturaInfoX,
    y: currentY + 25, // Ajustado hacia arriba
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1), // Texto blanco
  });

  // Fechas dentro del rectángulo con texto blanco
  page.drawText(`Fecha de emisión: ${factura.fecha ? new Date(factura.fecha).toLocaleDateString() : "N/A"}`, {
    x: margin + 20,
    y: currentY + 5, // Posición en la parte inferior del rectángulo
    size: 11,
    font: regularFont,
    color: rgb(1, 1, 1), // Texto blanco
  });

  page.drawText(`Fecha de vencimiento: ${factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString() : "N/A"}`, {
    x: facturaInfoX,
    y: currentY + 5, // Posición en la parte inferior del rectángulo
    size: 11,
    font: regularFont,
    color: rgb(1, 1, 1), // Texto blanco
  });

  // Reducir significativamente el espacio entre la barra de factura y los datos del cliente
  currentY -= 25; // Espacio reducido para acercar la sección del cliente

  // --------- INFORMACIÓN DEL CLIENTE ---------
  // Caja para datos del cliente sin espacio excesivo entre elementos
  page.drawRectangle({
    x: margin,
    y: currentY - 70, 
    width: width,
    height: 70,
    color: rgb(0.97, 0.97, 0.97), 
    borderColor: primaryColor,
    borderWidth: 1,
  });

  // Título sección cliente
  page.drawText("DATOS DEL CLIENTE", {
    x: margin + 20,
    y: currentY - 15,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  // Columna izquierda
  let clienteY = currentY - 35;
  const cliente = factura.cliente;

  if (cliente) {
    // Nombre del cliente
    const nombreCliente = cliente.nombre || "Cliente";
    page.drawText(nombreCliente, {
      x: margin + 20,
      y: clienteY,
      size: 11,
      font: boldFont,
    });
    clienteY -= 15;

    // NIF/CIF
    if (cliente.nif) {
      page.drawText(`CIF/NIF: ${cliente.nif}`, {
        x: margin + 20,
        y: clienteY,
        size: 10,
        font: regularFont,
      });
    }

    // Columna derecha - Dirección
    clienteY = currentY - 35;
    let direccionX = margin + 300;

    // Dirección
    if (cliente.direccion) {
      page.drawText(cliente.direccion, {
        x: direccionX,
        y: clienteY,
        size: 10,
        font: regularFont,
      });
      clienteY -= 15;
    }

    // Código postal, localidad y provincia en una línea
    let ubicacionText = "";
    if (cliente.codigoPostal) ubicacionText += cliente.codigoPostal + " ";
    if (cliente.localidad) ubicacionText += cliente.localidad;
    if (cliente.provincia) ubicacionText += cliente.localidad ? ", " + cliente.provincia : cliente.provincia;

    if (ubicacionText) {
      page.drawText(ubicacionText, {
        x: direccionX,
        y: clienteY,
        size: 10,
        font: regularFont,
      });
    }
  }

  // --------- TABLA DE LÍNEAS DE FACTURA ---------
  currentY -= 85; 

  // Encabezado de tabla con fondo de color
  page.drawRectangle({
    x: margin,
    y: currentY - 20,
    width: width,
    height: 25,
    color: primaryColor,
  });

  // Columnas de la tabla
  const columnas = ["Descripción", "Precio", "Cantidad", "IVA", "Total"];
  const columnWidths = [width * 0.40, width * 0.15, width * 0.15, width * 0.15, width * 0.15];
  
  // Dibujar cabeceras de columnas - alineadas verticalmente en el centro
  let colX = margin + 10;
  columnas.forEach((titulo, i) => {
    page.drawText(titulo, {
      x: colX,
      y: currentY - 12.5, // Centrado vertical exacto (25/2)
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1), // Texto blanco
    });
    colX += columnWidths[i];
  });

  currentY -= 30;
  const rowHeight = 25;
  let lineaY = currentY;

  // Dibujar líneas de la tabla
  if (factura.lineas && factura.lineas.length > 0) {
    // Verificar si necesitamos una nueva página para las líneas
    let currentPage = page;
    let needsNewPage = false;
    
    // Para cada línea de factura
    factura.lineas.forEach((linea, index) => {
      // Si queda poco espacio, crear una nueva página
      if (lineaY < margin + 150) { // Espacio para totales
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        currentPage = newPage;
        lineaY = pageHeight - margin - 50;
        
        // Dibujar encabezado en la nueva página
        currentPage.drawRectangle({
          x: margin,
          y: lineaY + 5,
          width: width,
          height: 25,
          color: primaryColor,
        });
        
        colX = margin + 10;
        columnas.forEach((titulo, i) => {
          currentPage.drawText(titulo, {
            x: colX,
            y: lineaY - 8, // Centrado vertical
            size: 10,
            font: boldFont,
            color: rgb(1, 1, 1), // Texto blanco
          });
          colX += columnWidths[i];
        });
        
        lineaY -= 30;
        needsNewPage = true;
      }

      // Alternar colores de fila para mejor legibilidad
      if (index % 2 === 0) {
        currentPage.drawRectangle({
          x: margin,
          y: lineaY - rowHeight,
          width: width,
          height: rowHeight,
          color: rgb(0.95, 0.95, 0.95), // Gris muy claro
        });
      }

      const productoNombre = linea.producto?.nombre || "Producto";
      // Manejo de texto largo para descripción
      const descripcionX = margin + 10;
      let descripcionText = productoNombre;
      
      // Si el nombre es muy largo, truncarlo
      if (regularFont.widthOfTextAtSize(descripcionText, 10) > columnWidths[0] - 20) {
        descripcionText = truncateText(descripcionText, columnWidths[0] - 20, regularFont, 10);
      }
      
      // Centrar verticalmente el texto en la fila - exactamente en el centro
      const textY = lineaY - rowHeight/2;
      
      currentPage.drawText(descripcionText, {
        x: descripcionX,
        y: textY,
        size: 10,
        font: regularFont,
      });

      // Precio unitario - alineado a la izquierda de la columna
      const precioX = margin + 10 + columnWidths[0];
      currentPage.drawText(
        `${linea.precio != null ? Number(linea.precio).toFixed(2) : "0.00"} €`,
        {
          x: precioX,
          y: textY,
          size: 10,
          font: regularFont,
        }
      );

      // Cantidad - alineado a la izquierda de la columna
      const cantidadX = margin + 10 + columnWidths[0] + columnWidths[1];
      currentPage.drawText(`${linea.cantidad || "0"}`, {
        x: cantidadX,
        y: textY,
        size: 10,
        font: regularFont,
      });
      
      // IVA - alineado a la izquierda de la columna
      const ivaX = margin + 10 + columnWidths[0] + columnWidths[1] + columnWidths[2];
      currentPage.drawText(`${linea.impuesto || "0"}%`, {
        x: ivaX,
        y: textY,
        size: 10,
        font: regularFont,
      });

      // Total de línea - alineado a la izquierda de la columna
      const totalX = margin + 10 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3];
      const totalLinea =
        linea.total != null
          ? Number(linea.total).toFixed(2)
          : (
              linea.cantidad *
              linea.precio *
              (1 + linea.impuesto / 100)
            ).toFixed(2);

      currentPage.drawText(`${totalLinea} €`, {
        x: totalX,
        y: textY,
        size: 10,
        font: regularFont,
      });

      lineaY -= rowHeight;
    });
    
    // Utilizar la página correcta para los totales
    page = needsNewPage ? currentPage : page;
    currentY = needsNewPage ? lineaY : lineaY;
  }

  // --------- SECCIÓN DE TOTALES ---------
  // Asegurar espacio para totales
  if (currentY < margin + 120) {
    const newPage = pdfDoc.addPage([595.28, 841.89]);
    page = newPage;
    currentY = pageHeight - margin - 50;
  }

  // Añadir espacio entre la última línea y los totales
  currentY -= 10; // Ajuste fino

  // Fondo para la sección de totales - asegurar que es lo suficientemente grande
  const totalesHeight = factura.irpf > 0 ? 110 : 90;
  
  page.drawRectangle({
    x: margin + width - 200,
    y: currentY - totalesHeight,
    width: 200,
    height: totalesHeight,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: primaryColor,
    borderWidth: 1,
  });

  const totalesX = margin + width - 190;
  const valoresX = margin + width - 50; // Más espacio para valores
  let totalesY = currentY - 20;

  // Subtotal
  page.drawText("Subtotal:", {
    x: totalesX,
    y: totalesY,
    size: 10,
    font: regularFont,
  });

  page.drawText(
    `${factura.subtotal != null ? Number(factura.subtotal).toFixed(2) : "0.00"} €`,
    {
      x: valoresX,
      y: totalesY,
      size: 10,
      font: regularFont,
    }
  );

  totalesY -= 20;

  // IVA
  const ivaLabel = `IVA ${(factura.lineas && factura.lineas[0]?.impuesto) || 21}%:`;
  page.drawText(ivaLabel, {
    x: totalesX,
    y: totalesY,
    size: 10,
    font: regularFont,
  });

  page.drawText(
    `${factura.impuestos != null ? Number(factura.impuestos).toFixed(2) : "0.00"} €`,
    {
      x: valoresX,
      y: totalesY,
      size: 10,
      font: regularFont,
    }
  );

  // IRPF si existe
  if (factura.irpf > 0) {
    totalesY -= 20;

    page.drawText(`IRPF ${factura.irpf}%:`, {
      x: totalesX,
      y: totalesY,
      size: 10,
      font: regularFont,
    });

    page.drawText(
      `-${factura.irpf != null ? Number(factura.irpf).toFixed(2) : "0.00"} €`,
      {
        x: valoresX,
        y: totalesY,
        size: 10,
        font: regularFont,
      }
    );
  }

  totalesY -= 20;

  // Línea separadora
  page.drawLine({
    start: { x: totalesX, y: totalesY + 10 },
    end: { x: totalesX + 180, y: totalesY + 10 },
    thickness: 1,
    color: primaryColor,
  });

  // TOTAL en negrita - garantizar que está dentro del recuadro
  page.drawText("TOTAL", {
    x: totalesX,
    y: totalesY - 5,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  page.drawText(
    `${factura.total != null ? Number(factura.total).toFixed(2) : "0.00"} €`,
    {
      x: valoresX,
      y: totalesY - 5,
      size: 12,
      font: boldFont,
      color: primaryColor,
    }
  );

  // --------- PIE DE PÁGINA ---------
  // Añadir un pie de página en todas las páginas
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const pdfPage = pdfDoc.getPage(i);
    
    // Línea separadora para el pie de página
    pdfPage.drawLine({
      start: { x: margin, y: margin + 30 },
      end: { x: margin + width, y: margin + 30 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Texto del pie de página
    pdfPage.drawText(`${empresa?.nombre || 'Empresa'} - Página ${i + 1} de ${pageCount}`, {
      x: margin,
      y: margin + 15,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Estado de la factura
    const estadoText = `Estado: ${factura.estado?.toUpperCase() || 'BORRADOR'}`;
    const estadoWidth = regularFont.widthOfTextAtSize(estadoText, 8);
    
    pdfPage.drawText(estadoText, {
      x: margin + width - estadoWidth,
      y: margin + 15,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Generar el PDF
  const pdfBytes = await pdfDoc.save();

  // Crear un Blob con los bytes del PDF
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

  // Descargar el PDF
  saveAs(pdfBlob, `Factura_${factura.numero}.pdf`);
};
