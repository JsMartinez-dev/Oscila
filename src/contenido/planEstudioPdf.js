// Plan de estudio en PDF con la estética de Oscila (neo-brutalista):
// bordes de tinta gruesos, sombras duras sin desenfoque, lila como acento y Lexend.
// Los colores salen de src/estilos/tokens.css; si cambias allá, actualiza PALETA aquí.
import { jsPDF } from "jspdf";

const PALETA = {
  fondo: "#ffffff",
  superficie2: "#f8f5fc",
  tinta: "#160b26",
  principal: "#2e1a47",
  acento: "#b989ed",
  acentoSuave: "#f1e8fd",
  textoSuave: "#5b4a73",
  lineaSuave: "#d9d0e4",
  ok: "#0f6b3f",
  okFondo: "#e3f6ea",
  aviso: "#7a4b00",
  avisoFondo: "#fff4d6",
  avisoBorde: "#9a6500",
  error: "#a3162b",
  errorFondo: "#fde8eb",
};

const SUGERENCIAS = [
  "Repasa la sección de Teoría: potencial, capacitancia, circuitos y Kirchhoff.",
  "Dibuja circuitos en el Montaje virtual y revisa la solución paso a paso.",
  "Resuelve los Ejercicios resueltos, abriendo cada inciso solo después de intentarlo.",
  "Mira las Aplicaciones en ingeniería para conectar las fórmulas con casos reales.",
  "Vuelve a hacer el test después de estudiar.",
];

// Lexend en TTF estático (jsPDF no lee fuentes variables ni woff2).
const FUENTES = [
  { id: "Lexend", archivo: "lexend-400.ttf" },
  { id: "Lexend-Semi", archivo: "lexend-600.ttf" },
  { id: "Lexend-Fuerte", archivo: "lexend-800.ttf" },
];

const PT = 0.3528; // 1 pt en mm

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const relleno = (doc, hex) => doc.setFillColor(...rgb(hex));
const trazo = (doc, hex) => doc.setDrawColor(...rgb(hex));
const color = (doc, hex) => doc.setTextColor(...rgb(hex));

// ---------- Fuentes ----------

function aBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

let cacheFuentes = null;

async function descargarFuentes(cargarBinario) {
  if (cacheFuentes) return cacheFuentes;
  const resultado = [];
  for (const f of FUENTES) {
    resultado.push({ ...f, base64: aBase64(await cargarBinario(f.archivo)) });
  }
  cacheFuentes = resultado;
  return resultado;
}

// En el navegador las fuentes viven en public/fuentes/ y se sirven como archivos estáticos.
function cargarDesdePublic(archivo) {
  const url = `${import.meta.env.BASE_URL}fuentes/${archivo}`;
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`No se pudo cargar ${url}`);
    return r.arrayBuffer();
  });
}

async function prepararFuentes(doc, cargarBinario) {
  try {
    const fuentes = await descargarFuentes(cargarBinario);
    for (const f of fuentes) {
      doc.addFileToVFS(f.archivo, f.base64);
      doc.addFont(f.archivo, f.id, "normal");
    }
    return { normal: "Lexend", medio: "Lexend-Semi", fuerte: "Lexend-Fuerte" };
  } catch (error) {
    console.warn("Lexend no se pudo cargar; se usa Helvetica.", error);
    return { normal: "helvetica", medio: "helvetica", fuerte: "helvetica" };
  }
}

// ---------- Dibujo ----------

// Tarjeta con borde de tinta y sombra dura desplazada, como las de la página.
function tarjeta(doc, x, y, w, h, { fondo = PALETA.fondo, borde = PALETA.tinta, grosor = 0.6, sombra = 1.2, radio = 3 } = {}) {
  if (sombra > 0) {
    relleno(doc, PALETA.tinta);
    doc.roundedRect(x + sombra, y + sombra, w, h, radio, radio, "F");
  }
  relleno(doc, fondo);
  trazo(doc, borde);
  doc.setLineWidth(grosor);
  doc.roundedRect(x, y, w, h, radio, radio, "FD");
}

// Logo de Oscila (favicon.svg) dibujado como vector. `x, y` es la esquina; `lado` en mm.
function logo(doc, x, y, lado) {
  const k = lado / 32; // el SVG original mide 32 x 32
  relleno(doc, PALETA.acento);
  trazo(doc, PALETA.tinta);
  doc.setLineWidth(2 * k);
  doc.roundedRect(x + 1 * k, y + 1 * k, 30 * k, 30 * k, 7 * k, 7 * k, "FD");

  // La onda: M2 13 c2 0 3-5 5-5 s3 5 5 5 3 5 5 5 3-5 5-5 con translate(4 3)
  trazo(doc, PALETA.principal);
  doc.setLineWidth(2.4 * k);
  doc.setLineCap("round");
  doc.setLineJoin("round");
  const curva = (c1x, c1y, c2x, c2y, ex, ey) => [c1x, c1y, c2x, c2y, ex, ey];
  doc.lines(
    [curva(2, 0, 3, -5, 5, -5), curva(2, 0, 3, 5, 5, 5), curva(2, 0, 3, 5, 5, 5), curva(2, 0, 3, -5, 5, -5)],
    x + (4 + 2) * k,
    y + (3 + 13) * k,
    [k, k],
    "S",
    false
  );
  relleno(doc, PALETA.principal);
  doc.circle(x + (4 + 7) * k, y + (3 + 8) * k, 2 * k, "F");
  doc.setLineCap("butt");
  doc.setLineJoin("miter");
}

// ---------- Contenido ----------

function mensajeResultado(porcentaje) {
  if (porcentaje === 100) {
    return { texto: "¡Excelente! Has dominado completamente el tema.", tinta: PALETA.ok, fondo: PALETA.okFondo, borde: PALETA.ok };
  }
  if (porcentaje >= 80) {
    return { texto: "¡Muy bien! Tienes un excelente desempeño.", tinta: PALETA.ok, fondo: PALETA.okFondo, borde: PALETA.ok };
  }
  if (porcentaje >= 60) {
    return { texto: "Buen trabajo, pero hay algunos temas por repasar.", tinta: PALETA.aviso, fondo: PALETA.avisoFondo, borde: PALETA.avisoBorde };
  }
  return { texto: "Necesitas estudiar más estos temas.", tinta: PALETA.error, fondo: PALETA.errorFondo, borde: PALETA.error };
}

/**
 * Genera y descarga el plan de estudio.
 * @param {object} datos
 * @param {number} datos.puntaje        Respuestas correctas.
 * @param {number} datos.total          Total de preguntas.
 * @param {string[]} datos.temasFallados Temas de las preguntas falladas (se quitan los repetidos).
 * @param {string} datos.modulo         Ej.: "Electricidad y Magnetismo".
 * @param {string} datos.universidad
 * @param {string} datos.profesor
 * @param {string} datos.desarrolladores Texto ya unido, ej.: "Ana, Luis y Marta".
 * @param {string} datos.plataforma     Ej.: "Oscila".
 * Opcionales (para reutilizarlo en otros módulos):
 * @param {string[]} [datos.sugerencias] Lista propia de sugerencias. Por defecto, las de Electricidad.
 * @param {string} [datos.pie]           Texto del pie de página. Por defecto "<plataforma> - Test de <módulo>".
 * (universidad, profesor y desarrolladores también pueden omitirse: esa fila no se dibuja.)
 * @param {object} [opciones]
 * @param {Function} [opciones.cargarBinario] archivo => Promise<ArrayBuffer>. Solo para pruebas.
 * @param {boolean} [opciones.devolverDoc]    Devuelve el jsPDF en vez de descargarlo. Solo para pruebas.
 */
export async function generarPlanPDF(datos, opciones = {}) {
  const { puntaje, total, temasFallados, modulo, universidad, profesor, desarrolladores, plataforma } = datos;
  const sugerencias = datos.sugerencias?.length ? datos.sugerencias : SUGERENCIAS;
  const pie = datos.pie || `${plataforma} - Test de ${modulo}`;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const F = await prepararFuentes(doc, opciones.cargarBinario || cargarDesdePublic);

  const anchoPag = doc.internal.pageSize.getWidth();
  const altoPag = doc.internal.pageSize.getHeight();
  const margen = 15;
  const ancho = anchoPag - 2 * margen;
  const limiteInferior = altoPag - 22; // deja sitio al pie de página
  const temas = [...new Set(temasFallados)];
  const porcentaje = Math.round((puntaje / total) * 100);

  const fuente = (id, pt) => {
    doc.setFont(id);
    doc.setFontSize(pt);
  };
  const altoLinea = (pt, factor = 1.4) => pt * PT * factor;

  // Escribe líneas ya partidas desde `yTope`, devuelve la y siguiente.
  const escribirLineas = (lineas, x, yTope, pt, factor = 1.4) => {
    const paso = altoLinea(pt, factor);
    lineas.forEach((linea, i) => {
      doc.text(linea, x, yTope + i * paso, { baseline: "top" });
    });
    return yTope + lineas.length * paso;
  };

  let y = margen;

  // Si el bloque no cabe, pasa a una página nueva con un encabezado pequeño.
  const asegurarEspacio = (alto) => {
    if (y + alto <= limiteInferior) return;
    doc.addPage();
    logo(doc, margen, margen - 2, 9);
    fuente(F.fuerte, 11);
    color(doc, PALETA.principal);
    doc.text("Plan de estudio", margen + 12, margen + 2.5, { baseline: "middle" });
    trazo(doc, PALETA.lineaSuave);
    doc.setLineWidth(0.3);
    doc.line(margen, margen + 9, anchoPag - margen, margen + 9);
    y = margen + 16;
  };

  // --- Encabezado ---
  const altoEnc = 36;
  tarjeta(doc, margen, y, ancho, altoEnc, { fondo: PALETA.acentoSuave, sombra: 1.6, grosor: 0.8, radio: 4 });
  logo(doc, margen + 6, y + 6, 24);
  fuente(F.fuerte, 24);
  color(doc, PALETA.principal);
  doc.text("Plan de estudio", margen + 36, y + 14, { baseline: "middle" });
  fuente(F.medio, 11);
  doc.text(modulo, margen + 36, y + 23, { baseline: "middle" });
  if (universidad) {
    fuente(F.normal, 9);
    color(doc, PALETA.textoSuave);
    doc.text(universidad, margen + 36, y + 29, { baseline: "middle" });
  }
  y += altoEnc + 6;

  // --- Datos del test ---
  const fecha = new Date().toLocaleDateString("es-ES");
  const filasMeta = [
    ["Fecha", fecha],
    ["Profesor", profesor],
    ["Desarrollado por", desarrolladores],
  ].filter(([, valor]) => valor);
  const xValor = margen + 38;
  filasMeta.forEach(([etiqueta, valor]) => {
    fuente(F.normal, 9.5);
    const lineas = doc.splitTextToSize(valor, ancho - 38);
    fuente(F.medio, 9.5);
    color(doc, PALETA.principal);
    doc.text(etiqueta, margen, y, { baseline: "top" });
    fuente(F.normal, 9.5);
    color(doc, PALETA.textoSuave);
    y = escribirLineas(lineas, xValor, y, 9.5, 1.35) + 1.2;
  });
  y += 2;

  // --- Tarjeta de puntuación ---
  const altoPunt = 47;
  asegurarEspacio(altoPunt + 4);
  tarjeta(doc, margen, y, ancho, altoPunt, { sombra: 1.6, grosor: 0.8, radio: 4 });

  fuente(F.medio, 10);
  color(doc, PALETA.principal);
  doc.text("Tu puntuación", margen + 8, y + 7, { baseline: "top" });
  fuente(F.fuerte, 40);
  color(doc, PALETA.principal);
  doc.text(`${puntaje}/${total}`, margen + 8, y + 15, { baseline: "top" });

  // Porcentaje y barra de progreso a la derecha
  const xDer = margen + 92;
  const anchoDer = ancho - 92 - 8;
  fuente(F.fuerte, 26);
  doc.text(`${porcentaje}%`, xDer, y + 8, { baseline: "top" });
  const yBarra = y + 22;
  const altoBarra = 6;
  relleno(doc, PALETA.fondo);
  trazo(doc, PALETA.tinta);
  doc.setLineWidth(0.6);
  doc.roundedRect(xDer, yBarra, anchoDer, altoBarra, 2, 2, "FD");
  if (porcentaje > 0) {
    const anchoRelleno = Math.max(altoBarra, (anchoDer * porcentaje) / 100);
    relleno(doc, PALETA.acento);
    doc.roundedRect(xDer, yBarra, anchoRelleno, altoBarra, 2, 2, "FD");
  }

  // Mensaje de resultado, como el de la pantalla de resultados (parte el texto si no cabe)
  const msg = mensajeResultado(porcentaje);
  fuente(F.medio, 9.5);
  const lineasMsg = doc.splitTextToSize(msg.texto, anchoDer - 8);
  const anchoMsg = Math.min(anchoDer, Math.max(...lineasMsg.map((l) => doc.getTextWidth(l))) + 8);
  const altoMsg = lineasMsg.length * altoLinea(9.5, 1.3) + 4;
  relleno(doc, msg.fondo);
  trazo(doc, msg.borde);
  doc.setLineWidth(0.4);
  doc.roundedRect(xDer, y + 32, anchoMsg, altoMsg, 3.5, 3.5, "FD");
  color(doc, msg.tinta);
  escribirLineas(lineasMsg, xDer + 4, y + 34, 9.5, 1.3);
  y += altoPunt + 8;

  // --- Temas a repasar ---
  if (temas.length > 0) {
    asegurarEspacio(30);
    fuente(F.fuerte, 14);
    color(doc, PALETA.principal);
    doc.text("Temas que debes repasar", margen, y, { baseline: "top" });
    const etiquetaChip = temas.length === 1 ? "1 tema" : `${temas.length} temas`;
    fuente(F.medio, 8.5);
    const anchoChip = doc.getTextWidth(etiquetaChip) + 7;
    relleno(doc, PALETA.acento);
    trazo(doc, PALETA.tinta);
    doc.setLineWidth(0.5);
    doc.roundedRect(anchoPag - margen - anchoChip, y - 0.4, anchoChip, 6.4, 3.2, 3.2, "FD");
    color(doc, PALETA.principal);
    doc.text(etiquetaChip, anchoPag - margen - anchoChip / 2, y + 2.8, { baseline: "middle", align: "center" });
    y += 9;

    const lado = 8;
    temas.forEach((tema, i) => {
      fuente(F.medio, 11);
      const lineas = doc.splitTextToSize(tema, ancho - lado - 20);
      const alto = Math.max(11, lineas.length * altoLinea(11, 1.3) + 6.5);
      asegurarEspacio(alto + 3);
      tarjeta(doc, margen, y, ancho - 1.2, alto, { sombra: 1, grosor: 0.5, radio: 2.5 });

      relleno(doc, PALETA.acento);
      trazo(doc, PALETA.tinta);
      doc.setLineWidth(0.5);
      doc.roundedRect(margen + 4, y + (alto - lado) / 2, lado, lado, 2, 2, "FD");
      fuente(F.fuerte, 10);
      color(doc, PALETA.principal);
      doc.text(String(i + 1), margen + 4 + lado / 2, y + alto / 2, { baseline: "middle", align: "center" });

      fuente(F.medio, 11);
      color(doc, PALETA.principal);
      const altoTexto = lineas.length * altoLinea(11, 1.3);
      escribirLineas(lineas, margen + 4 + lado + 5, y + (alto - altoTexto) / 2, 11, 1.3);
      y += alto + 3.2;
    });
    y += 4;
  } else {
    asegurarEspacio(24);
    tarjeta(doc, margen, y, ancho - 1.2, 18, { fondo: PALETA.okFondo, borde: PALETA.ok, sombra: 1, grosor: 0.5, radio: 2.5 });
    fuente(F.medio, 11);
    color(doc, PALETA.ok);
    doc.text("¡Felicidades! No hay temas que repasar.", margen + 6, y + 9, { baseline: "middle" });
    y += 26;
  }

  // --- Sugerencias de estudio ---
  fuente(F.normal, 10);
  const anchoTexto = ancho - 6 - 5 - 6 - 3; // padding + casilla + separación
  const bloques = sugerencias.map((s) => doc.splitTextToSize(s, anchoTexto));
  const altoItems = bloques.reduce((suma, l) => suma + l.length * altoLinea(10, 1.4) + 3, 0);
  const altoSug = 16 + altoItems + 2;
  asegurarEspacio(altoSug + 4);
  tarjeta(doc, margen, y, ancho - 1.2, altoSug, { fondo: PALETA.superficie2, sombra: 1, grosor: 0.5, radio: 3 });
  fuente(F.fuerte, 12);
  color(doc, PALETA.principal);
  doc.text("Sugerencias de estudio", margen + 6, y + 6, { baseline: "top" });
  let yItem = y + 16;
  bloques.forEach((lineas) => {
    // casilla vacía: sirve para ir marcando lo que ya se hizo
    relleno(doc, PALETA.fondo);
    trazo(doc, PALETA.tinta);
    doc.setLineWidth(0.4);
    doc.roundedRect(margen + 6, yItem + 0.3, 3.8, 3.8, 0.8, 0.8, "FD");
    fuente(F.normal, 10);
    color(doc, PALETA.principal);
    yItem = escribirLineas(lineas, margen + 6 + 3.8 + 3, yItem, 10, 1.4) + 3;
  });
  y += altoSug;

  // --- Pie de página en todas las páginas ---
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    trazo(doc, PALETA.lineaSuave);
    doc.setLineWidth(0.3);
    doc.line(margen, altoPag - 15, anchoPag - margen, altoPag - 15);
    fuente(F.normal, 8.5);
    color(doc, PALETA.textoSuave);
    doc.text(pie, margen, altoPag - 10, { baseline: "middle" });
    doc.text(`Página ${p} de ${paginas}`, anchoPag - margen, altoPag - 10, { baseline: "middle", align: "right" });
  }

  doc.setProperties({ title: "Plan de estudio", subject: `${plataforma} - ${modulo}`, author: plataforma });

  if (opciones.devolverDoc) return doc;
  doc.save("Plan_de_Estudio.pdf");
}
