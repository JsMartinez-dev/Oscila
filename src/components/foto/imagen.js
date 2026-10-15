// Reducción de la foto antes de enviarla: lado mayor ≤ 1600 px, JPEG. Ahorra datos y tokens.

const LADO_MAX = 1600;

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    img.src = url;
  });
}

/** blob → { base64, mime, aspecto, url } */
export async function prepararImagen(blob) {
  const url = URL.createObjectURL(blob);
  const img = await cargarImagen(url);
  const escala = Math.min(1, LADO_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * escala);
  const h = Math.round(img.naturalHeight * escala);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { base64: dataUrl.split(',')[1], mime: 'image/jpeg', aspecto: w / h, url };
}
