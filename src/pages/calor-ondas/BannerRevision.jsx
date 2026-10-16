import { ETIQUETA_ESTADO } from '../../contenido/modulos.js';

export default function BannerRevision() {
  return (
    <div className="co-banner" role="note">
      <span className="pildora pildora--revision">{ETIQUETA_ESTADO.revision}</span>
      <span>Módulo Calor y Ondas restaurado de la versión anterior de la plataforma. Su contenido está en revisión.</span>
    </div>
  );
}
