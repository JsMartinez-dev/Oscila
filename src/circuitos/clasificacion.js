// Clasificación del circuito: serie, paralelo, mixto o no reducible, con la explicación.

import { reducir } from './reduccion.js';

const NUMERO = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

export function clasificar(net) {
  const fuentes = net.elementos.filter((e) => e.tipo === 'fuente');
  const hayR = net.elementos.some((e) => e.tipo === 'resistencia');
  const hayC = net.elementos.some((e) => e.tipo === 'condensador');
  const notaRC =
    hayR && hayC
      ? ' En corriente continua y estado estacionario los condensadores se comportan como circuito abierto: se clasifica la red de resistencias.'
      : '';

  if (fuentes.length === 0) {
    return { clasificacion: 'sin fuente', metodo: null, explicacion: 'Agrega una fuente para poder resolver el circuito.' };
  }
  if (fuentes.length > 1) {
    const cuantas = NUMERO[fuentes.length] ?? String(fuentes.length);
    return {
      clasificacion: `no reducible (${cuantas} fuentes)`,
      metodo: 'kirchhoff',
      explicacion: `Hay ${cuantas} fuentes. Con más de una fuente no existe una única "resistencia equivalente vista por la fuente", así que el circuito no se reduce por serie/paralelo: se resuelve con las leyes de Kirchhoff (nodos y mallas).${notaRC}`,
    };
  }

  const red = reducir(net);
  if (!red.ok) {
    const explicacion =
      red.motivo === 'puente'
        ? 'Hay elementos que no están ni en serie (misma corriente) ni en paralelo (mismos dos nodos) con ningún otro, como en un puente. No se puede reducir por combinaciones: se resuelve con las leyes de Kirchhoff.'
        : 'No hay un camino cerrado entre los bornes de la fuente: no circula corriente.';
    return { clasificacion: red.motivo === 'puente' ? 'no reducible (puente)' : 'sin camino', metodo: red.motivo === 'puente' ? 'kirchhoff' : null, explicacion: explicacion + notaRC, red };
  }

  const raiz = red.raiz;
  const magnitud = red.tipoRed === 'R' ? 'corriente' : 'carga';
  const hojas = raiz.hijos.every((h) => h.tipo === 'hoja');
  if (raiz.tipo === 'hoja' || (raiz.tipo === 'serie' && hojas && red.pasos.length === 1)) {
    return {
      clasificacion: 'serie',
      metodo: 'reduccion',
      explicacion: `Todos los elementos forman un solo camino con la fuente: por todos pasa la misma ${magnitud}.${notaRC}`,
      red,
    };
  }
  if (raiz.tipo === 'paralelo' && hojas && red.pasos.length === 1) {
    return {
      clasificacion: 'paralelo',
      metodo: 'reduccion',
      explicacion: `Todos los elementos están conectados entre los mismos dos nodos que la fuente: todos tienen el mismo voltaje.${notaRC}`,
      red,
    };
  }
  return {
    clasificacion: 'mixto',
    metodo: 'reduccion',
    explicacion: `Hay partes en serie y partes en paralelo. Se reduce paso a paso combinando serie (misma ${magnitud}) y paralelo (mismo voltaje) hasta un solo elemento equivalente.${notaRC}`,
    red,
  };
}
