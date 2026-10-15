// Exportar un <svg> del esquema como archivo SVG o PNG.

function svgComoTexto(svg) {
  const copia = svg.cloneNode(true);
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  let texto = new XMLSerializer().serializeToString(copia);
  // Las variables CSS no existen fuera de la página: usar el color de respaldo
  texto = texto.replace(/var\(--[\w-]+,\s*([^)]+)\)/g, '$1');
  return texto;
}

function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportarSVG(svg, nombre = 'circuito.svg') {
  descargar(new Blob([svgComoTexto(svg)], { type: 'image/svg+xml' }), nombre);
}

export function exportarPNG(svg, nombre = 'circuito.png', escala = 2) {
  return new Promise((resolve, reject) => {
    const texto = svgComoTexto(svg);
    const vb = svg.viewBox.baseVal;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vb.width * escala);
      canvas.height = Math.ceil(vb.height * escala);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          descargar(blob, nombre);
          resolve();
        } else reject(new Error('No se pudo generar el PNG.'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('No se pudo dibujar el SVG.'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(texto)}`;
  });
}
