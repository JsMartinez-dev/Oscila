// Historial de deshacer/rehacer para el documento del editor.

import { useCallback, useReducer } from 'react';

const LIMITE = 150;

function reducir(estado, accion) {
  switch (accion.tipo) {
    case 'cambiar':
      if (accion.doc === estado.presente) return estado;
      return { pasado: [...estado.pasado, estado.presente].slice(-LIMITE), presente: accion.doc, futuro: [] };
    case 'temporal': // durante un arrastre: no se guarda en el historial
      return { ...estado, presente: accion.doc };
    case 'confirmar': // fin del arrastre: se guarda el estado de antes del arrastre
      if (accion.base === estado.presente) return estado;
      return { pasado: [...estado.pasado, accion.base].slice(-LIMITE), presente: estado.presente, futuro: [] };
    case 'deshacer':
      if (!estado.pasado.length) return estado;
      return { pasado: estado.pasado.slice(0, -1), presente: estado.pasado[estado.pasado.length - 1], futuro: [estado.presente, ...estado.futuro] };
    case 'rehacer':
      if (!estado.futuro.length) return estado;
      return { pasado: [...estado.pasado, estado.presente], presente: estado.futuro[0], futuro: estado.futuro.slice(1) };
    default:
      return estado;
  }
}

export function useHistorial(inicial) {
  const [estado, despachar] = useReducer(reducir, { pasado: [], presente: inicial, futuro: [] });
  return {
    doc: estado.presente,
    cambiar: useCallback((doc) => despachar({ tipo: 'cambiar', doc }), []),
    temporal: useCallback((doc) => despachar({ tipo: 'temporal', doc }), []),
    confirmar: useCallback((base) => despachar({ tipo: 'confirmar', base }), []),
    deshacer: useCallback(() => despachar({ tipo: 'deshacer' }), []),
    rehacer: useCallback(() => despachar({ tipo: 'rehacer' }), []),
    puedeDeshacer: estado.pasado.length > 0,
    puedeRehacer: estado.futuro.length > 0,
  };
}

export const DOC_VACIO = { componentes: [], cables: [], nodos: [], etiquetas: [] };
