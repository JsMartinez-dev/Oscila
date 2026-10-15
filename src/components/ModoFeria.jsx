// Modo feria: pantalla completa y letra grande para la mesa del foro. Tecla F o botón de la barra.
// En una esquina muestra las solicitudes de reconocimiento hechas hoy desde este equipo.

import { useCallback, useEffect, useState } from 'react';
import { EVENTO_SOLICITUDES, solicitudesHoy } from './foto/almacen.js';

const CLAVE = 'modo-feria';

export function useModoFeria() {
  const [activo, setActivo] = useState(() => {
    try {
      return localStorage.getItem(CLAVE) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('modo-feria', activo);
    try {
      localStorage.setItem(CLAVE, activo ? '1' : '0');
    } catch {
      /* sin almacenamiento */
    }
  }, [activo]);

  const alternar = useCallback(() => {
    setActivo((a) => {
      const nuevo = !a;
      try {
        if (nuevo && !document.fullscreenElement) document.documentElement.requestFullscreen?.();
        if (!nuevo && document.fullscreenElement) document.exitFullscreen?.();
      } catch {
        /* el navegador puede negar la pantalla completa */
      }
      return nuevo;
    });
  }, []);

  useEffect(() => {
    const tecla = (ev) => {
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if ((ev.key === 'f' || ev.key === 'F') && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        alternar();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alternar]);

  return { activo, alternar };
}

export function ContadorFeria() {
  const [n, setN] = useState(solicitudesHoy());
  useEffect(() => {
    const act = () => setN(solicitudesHoy());
    window.addEventListener(EVENTO_SOLICITUDES, act);
    const t = setInterval(act, 30000); // por si cambia el día
    return () => {
      window.removeEventListener(EVENTO_SOLICITUDES, act);
      clearInterval(t);
    };
  }, []);
  return (
    <div className="feria-contador" title="Solicitudes de reconocimiento de fotos hechas hoy desde este equipo (no es el saldo de la cuota de Google)">
      📷 Reconocimientos hoy: <strong>{n}</strong>
    </div>
  );
}
