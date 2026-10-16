import { IMAGENES } from '../../contenido/calor-ondas/imagenes.js';

export function Credito({ credito }) {
  if (credito.tipo === 'commons') {
    return (
      <>
        Imagen: <a href={credito.pagina} target="_blank" rel="noopener noreferrer">{credito.archivo}</a>, de {credito.autor} (Wikimedia Commons),{' '}
        {credito.licenciaUrl ? (
          <a href={credito.licenciaUrl} target="_blank" rel="noopener noreferrer">
            {credito.licencia}
          </a>
        ) : (
          credito.licencia
        )}
        , sin modificaciones.
      </>
    );
  }
  if (credito.tipo === 'propia') {
    return (
      <>
        Imagen: dibujo propio (SVG) de {credito.autor}
        {credito.nota ? `, ${credito.nota}` : ''}.
      </>
    );
  }
  return (
    <>
      Imagen: {credito.autor}
      {credito.nota ? `, ${credito.nota}` : ''}.
    </>
  );
}

export default function Figura({ id, pie, ancho }) {
  const im = IMAGENES[id];
  return (
    <figure className="co-figura" style={{ maxWidth: `${ancho ?? im.ancho}px` }}>
      <img src={`${import.meta.env.BASE_URL}${im.src}`} alt={im.alt} loading="lazy" />
      <figcaption>
        {pie && <span className="co-figura-pie">{pie}</span>}
        <span className="co-figura-credito">
          <Credito credito={im.credito} />
        </span>
      </figcaption>
    </figure>
  );
}
