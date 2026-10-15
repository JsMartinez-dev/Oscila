// Conversión de valores con unidades y prefijos SI ("4,7 kΩ", "10 µF", "500 mV") a números en SI.

export const UNIDAD = { resistencia: 'Ω', condensador: 'F', fuente: 'V' };

const PREFIJOS = {
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  'µ': 1e-6, // U+00B5 (signo micro)
  'μ': 1e-6, // U+03BC (mu griega)
  m: 1e-3,
  k: 1e3,
  K: 1e3,
  M: 1e6,
  G: 1e9,
};

// Formas aceptadas de escribir cada unidad.
const ALIAS_UNIDAD = {
  resistencia: ['Ω', 'Ω', 'ω', 'ohm', 'ohms', 'ohmio', 'ohmios', 'r'],
  condensador: ['f', 'faradio', 'faradios'],
  fuente: ['v', 'voltio', 'voltios'],
};

const NOMBRE = { resistencia: 'resistencia', condensador: 'capacitancia', fuente: 'voltaje' };

/**
 * Convierte un texto como "4.7k", "4,7 kΩ", "10uF", "100 nF" o "12 V" a SI.
 * Devuelve { valor } o { error } con un mensaje en español.
 */
export function parsearValor(texto, tipo) {
  if (typeof texto === 'number') {
    return Number.isFinite(texto) && texto > 0 ? { valor: texto } : { error: 'El valor debe ser mayor que cero.' };
  }
  const limpio = String(texto ?? '').trim().replace(/\s+/g, '');
  if (!limpio) return { error: `Escribe un valor de ${NOMBRE[tipo] ?? 'componente'}.` };

  const m = limpio.match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?)(.*)$/);
  if (!m) return { error: `"${texto}" no es un número válido.` };

  const numero = parseFloat(m[1].replace(',', '.'));
  let resto = m[2];
  let factor = 1;

  // ¿Lo que sigue es solo la unidad (p. ej. "F", "V", "Ω")?
  const esUnidad = (s) => (ALIAS_UNIDAD[tipo] ?? []).includes(s.toLowerCase()) || s === UNIDAD[tipo];

  if (resto && !esUnidad(resto)) {
    const p = resto[0];
    if (p in PREFIJOS) {
      factor = PREFIJOS[p];
      resto = resto.slice(1);
    }
  }

  if (resto && !esUnidad(resto)) {
    const otra = Object.entries(ALIAS_UNIDAD).find(([, lista]) => lista.includes(resto.toLowerCase()));
    if (otra) {
      return { error: `La unidad "${resto}" no corresponde a un${tipo === 'fuente' ? 'a fuente' : tipo === 'condensador' ? ' condensador' : 'a resistencia'} (se espera ${UNIDAD[tipo]}).` };
    }
    return { error: `No reconozco la unidad "${resto}". Usa ${UNIDAD[tipo]} con prefijos p, n, µ (u), m, k, M.` };
  }

  const valor = numero * factor;
  if (!Number.isFinite(valor) || valor <= 0) return { error: 'El valor debe ser mayor que cero.' };
  return { valor };
}

const ESCALAS = [
  [1e9, 'G'],
  [1e6, 'M'],
  [1e3, 'k'],
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
  [1e-12, 'p'],
];

/** Elige el prefijo SI para mostrar un valor: devuelve { mantisa, prefijo }. */
export function conPrefijo(valor) {
  const abs = Math.abs(valor);
  if (abs === 0) return { mantisa: 0, prefijo: '' };
  for (const [escala, prefijo] of ESCALAS) {
    if (abs >= escala * 0.9995) return { mantisa: valor / escala, prefijo };
  }
  return { mantisa: valor / 1e-12, prefijo: 'p' };
}

/** Número con `cifras` cifras significativas, sin notación científica y sin ceros finales innecesarios. */
export function redondear(x, cifras = 3) {
  if (x === 0 || !Number.isFinite(x)) return String(x);
  const s = Number(x.toPrecision(cifras));
  return String(s);
}

/** Texto legible: formatearValor(4700, 'resistencia') → "4.7 kΩ". */
export function formatearValor(valor, tipo, cifras = 3) {
  const { mantisa, prefijo } = conPrefijo(valor);
  return `${redondear(mantisa, cifras)} ${prefijo}${UNIDAD[tipo] ?? ''}`;
}
