// Reconocimiento de la foto de un circuito dibujado a mano.
// La foto se envía a /api/reconocer (función serverless con la API key de Gemini).
// El resultado se carga en el editor para que el usuario lo revise y corrija antes de calcular.

import { useEffect, useRef, useState } from 'react';
import { esquemaReconocimiento, reconocimientoADoc, UMBRAL_CONFIANZA } from '../../circuitos/reconocimiento.js';
import { Esquema } from '../../circuitos/Esquema.jsx';
import { formatearValor } from '../../circuitos/unidades.js';
import { FOTOS_GUARDADAS } from '../../contenido/fotos.js';
import { guardarCache, leerCache, sha256, solicitudesHoy, sumarSolicitud, EVENTO_SOLICITUDES } from './almacen.js';
import { prepararImagen } from './imagen.js';
import './Foto.css';

const FACTOR = { 'Ω': 1, ohm: 1, 'kΩ': 1e3, 'MΩ': 1e6, F: 1, mF: 1e-3, 'µF': 1e-6, uF: 1e-6, nF: 1e-9, pF: 1e-12, V: 1, mV: 1e-3, kV: 1e3 };

const MENSAJES = {
  cuota: 'Se agotó la cuota gratuita de reconocimiento por hoy. Usa los ejemplos guardados de abajo (funcionan sin internet) o dibuja el circuito en el editor.',
  'sin-clave': 'El reconocimiento no está configurado en este servidor (falta la API key). Usa los ejemplos guardados o el editor.',
  red: 'No hay conexión con el servicio de reconocimiento. Usa los ejemplos guardados (funcionan sin internet) o el editor.',
  offline: 'Este equipo no tiene internet. Los ejemplos guardados y el editor funcionan sin conexión.',
};

export default function ReconocerFoto({ onCargar }) {
  const [estado, setEstado] = useState('inicio'); // inicio | procesando | listo | error
  const [vista, setVista] = useState(null); // url de la foto
  const [resultado, setResultado] = useState(null); // { reconocimiento, doc, ok, origen }
  const [error, setError] = useState(null); // { codigo, mensaje, detalles }
  const [camara, setCamara] = useState(false);
  const [vistaGaleria, setVistaGaleria] = useState(null);
  const [usadas, setUsadas] = useState(solicitudesHoy());
  const galeriaRef = useRef(null);

  useEffect(() => {
    const act = () => setUsadas(solicitudesHoy());
    window.addEventListener(EVENTO_SOLICITUDES, act);
    return () => window.removeEventListener(EVENTO_SOLICITUDES, act);
  }, []);

  const mostrar = (reconocimiento, aspecto, origen) => {
    const { doc, ok } = reconocimientoADoc(reconocimiento, aspecto);
    setResultado({ reconocimiento, doc, ok, origen });
    setEstado('listo');
  };

  const procesar = async (blob) => {
    setError(null);
    setResultado(null);
    setEstado('procesando');
    setVistaGaleria(null);
    setVista(URL.createObjectURL(blob));
    try {
      const hash = await sha256(await blob.arrayBuffer());
      const guardado = await leerCache(hash);
      if (guardado) {
        mostrar(guardado.reconocimiento, guardado.aspecto, 'cache');
        return;
      }
      if (!navigator.onLine) throw Object.assign(new Error(MENSAJES.offline), { codigo: 'offline' });
      const img = await prepararImagen(blob);
      sumarSolicitud();
      let r;
      try {
        r = await fetch('/api/reconocer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagen: img.base64, mime: img.mime }),
        });
      } catch {
        throw Object.assign(new Error(MENSAJES.red), { codigo: 'red' });
      }
      let cuerpo = null;
      try {
        cuerpo = await r.json();
      } catch {
        /* sin cuerpo JSON */
      }
      if (!r.ok) {
        const codigo = cuerpo?.codigo ?? (r.status === 429 ? 'cuota' : r.status === 404 ? 'sin-clave' : 'servicio');
        throw Object.assign(new Error(MENSAJES[codigo] ?? cuerpo?.error ?? `Error ${r.status} del servidor.`), { codigo, detalles: cuerpo?.detalles });
      }
      const v = esquemaReconocimiento.safeParse(cuerpo?.reconocimiento);
      if (!v.success) throw Object.assign(new Error('El resultado del reconocimiento no tiene el formato esperado.'), { codigo: 'esquema' });
      await guardarCache(hash, { reconocimiento: v.data, aspecto: img.aspecto });
      mostrar(v.data, img.aspecto, 'servicio');
    } catch (e) {
      setError({ codigo: e.codigo ?? 'otro', mensaje: e.message, detalles: e.detalles });
      setEstado('error');
    }
  };

  const usarGuardado = (f) => {
    setError(null);
    setVista(null);
    mostrar(esquemaReconocimiento.parse(f.reconocimiento), 4 / 3, 'guardado');
    setVistaGaleria(f);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const descargarJSON = () => {
    const blob = new Blob([JSON.stringify(resultado.reconocimiento, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'reconocimiento.json';
    a.click();
  };

  return (
    <div className="foto">
      <section className="foto-entrada">
        <div className="foto-botones">
          <label className="foto-boton principal">
            📷 Tomar o subir foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) procesar(f);
                e.target.value = '';
              }}
            />
          </label>
          <label className="foto-boton">
            🖼 Elegir de la galería
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) procesar(f);
                e.target.value = '';
              }}
            />
          </label>
          {navigator.mediaDevices?.getUserMedia && (
            <button type="button" className="foto-boton" onClick={() => setCamara(true)}>
              🎥 Cámara del portátil
            </button>
          )}
          <button type="button" className="foto-boton" onClick={() => galeriaRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            ⬇ Ejemplos guardados (sin internet)
          </button>
        </div>
        <p className="foto-ayuda">
          Consejos: dibuja con trazo oscuro sobre papel claro, escribe el valor junto a cada elemento (por ejemplo «4.7 kΩ», «10 µF», «12 V») y marca el + de las fuentes. La foto
          se envía al servicio de reconocimiento; nada se calcula hasta que revises el resultado en el editor.
        </p>
        <p className="foto-mini">Solicitudes de reconocimiento hechas hoy en este equipo: {usadas}. Una foto repetida se toma de la caché y no gasta otra.</p>
      </section>

      {camara && (
        <Camara
          onCaptura={(blob) => {
            setCamara(false);
            procesar(blob);
          }}
          onCerrar={() => setCamara(false)}
        />
      )}

      {estado === 'procesando' && (
        <div className="foto-procesando">
          {vista && <img src={vista} alt="Foto enviada" />}
          <p>Reconociendo el circuito… (unos segundos)</p>
        </div>
      )}

      {estado === 'error' && error && (
        <div className="foto-error" role="alert">
          {vista && <img src={vista} alt="Foto enviada" />}
          <div>
            <strong>No se pudo reconocer la foto.</strong>
            <p>{error.mensaje}</p>
            {error.detalles?.length > 0 && (
              <details>
                <summary>Detalle</summary>
                <ul>
                  {error.detalles.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </details>
            )}
            <button type="button" onClick={() => galeriaRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Ver ejemplos guardados
            </button>
          </div>
        </div>
      )}

      {estado === 'listo' && resultado && (
        <section className="foto-resultado">
          <div className="foto-comparar">
            <figure>
              <figcaption>{resultado.origen === 'guardado' ? `Ejemplo guardado — ${vistaGaleria?.titulo ?? ''}` : 'Foto'}</figcaption>
              {vista ? <img src={vista} alt="Foto del circuito" /> : vistaGaleria && <FotoGuardada f={vistaGaleria} />}
            </figure>
            <figure>
              <figcaption>Lo que se reconoció</figcaption>
              <div className="foto-esquema">
                <Esquema doc={resultado.doc} resaltados={new Set(resultado.doc.componentes.filter((c) => c.revisar).map((c) => c.id))} maxAncho={560} />
              </div>
            </figure>
          </div>
          <p className="foto-mini">
            {resultado.origen === 'cache' && 'Resultado tomado de la caché (esta foto ya se había reconocido): no gastó otra solicitud. '}
            {resultado.origen === 'guardado' && 'Ejemplo guardado: funciona sin internet. '}
            Lo resaltado en amarillo tiene confianza menor a {Math.round(UMBRAL_CONFIANZA * 100)} %.
          </p>
          {!resultado.ok && (
            <p className="foto-aviso">
              No fue posible dibujar todos los cables sin cruces que cambien las conexiones. Revisa las conexiones en el editor antes de calcular.
            </p>
          )}
          {resultado.reconocimiento.notas && <p className="foto-mini">Nota del reconocimiento: {resultado.reconocimiento.notas}</p>}
          <table className="foto-tabla">
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Valor</th>
                <th>Conexión</th>
                <th>Confianza</th>
              </tr>
            </thead>
            <tbody>
              {resultado.reconocimiento.elementos.map((e) => {
                const min = Math.min(e.confianza, e.confianza_valor, e.tipo === 'fuente' ? e.confianza_polaridad ?? 1 : 1);
                return (
                  <tr key={e.id} className={min < UMBRAL_CONFIANZA ? 'baja' : ''}>
                    <td>
                      {e.id} <span className="foto-tipo">({e.tipo})</span>
                    </td>
                    <td>{formatearValor(e.valor * FACTOR[e.unidad], e.tipo)}</td>
                    <td>{e.tipo === 'fuente' ? `+ en ${e.positivo}, − en ${e.positivo === e.nodo_a ? e.nodo_b : e.nodo_a}` : `${e.nodo_a} – ${e.nodo_b}`}</td>
                    <td>
                      {Math.round(e.confianza * 100)} % · valor {Math.round(e.confianza_valor * 100)} %
                      {e.tipo === 'fuente' && e.confianza_polaridad != null ? ` · polaridad ${Math.round(e.confianza_polaridad * 100)} %` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="foto-acciones">
            <button type="button" className="foto-boton principal" onClick={() => onCargar(resultado.doc)}>
              Revisar en el editor →
            </button>
            {resultado.origen !== 'guardado' && (
              <button type="button" className="foto-boton" onClick={descargarJSON}>
                Descargar JSON
              </button>
            )}
          </div>
        </section>
      )}

      <section className="foto-galeria" ref={galeriaRef}>
        <h3>Ejemplos guardados (funcionan sin internet)</h3>
        <p className="foto-mini">Fotos de circuitos dibujados a mano con su reconocimiento ya hecho, para la demostración aunque no haya red.</p>
        <div className="foto-galeria-grid">
          {FOTOS_GUARDADAS.map((f) => (
            <button key={f.id} type="button" className="foto-tarjeta" onClick={() => usarGuardado(f)}>
              <FotoGuardada f={f} />
              <span>{f.titulo}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Foto real si existe en public/ejemplos_foto; si no, una imagen de reemplazo con el esquema. */
function FotoGuardada({ f }) {
  const [falla, setFalla] = useState(false);
  if (!falla) return <img src={`${import.meta.env.BASE_URL}${f.foto}`} alt={`Foto del ${f.titulo}`} onError={() => setFalla(true)} />;
  return (
    <div className="foto-reemplazo">
      <Esquema doc={f.referencia} maxAncho={300} />
      <small>Imagen de reemplazo: falta la foto {f.foto}</small>
    </div>
  );
}

function Camara({ onCaptura, onCerrar }) {
  const video = useRef(null);
  const [falla, setFalla] = useState('');
  useEffect(() => {
    let flujo;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false })
      .then((s) => {
        flujo = s;
        if (video.current) video.current.srcObject = s;
      })
      .catch(() => setFalla('No se pudo abrir la cámara (permiso denegado o no hay cámara).'));
    return () => flujo?.getTracks().forEach((t) => t.stop());
  }, []);
  const capturar = () => {
    const v = video.current;
    if (!v?.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((b) => b && onCaptura(b), 'image/jpeg', 0.92);
  };
  return (
    <div className="foto-camara" role="dialog" aria-label="Cámara">
      <div className="foto-camara-caja">
        {falla ? <p>{falla}</p> : <video ref={video} autoPlay playsInline muted />}
        <div className="foto-acciones">
          {!falla && (
            <button type="button" className="foto-boton principal" onClick={capturar}>
              Capturar
            </button>
          )}
          <button type="button" className="foto-boton" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
