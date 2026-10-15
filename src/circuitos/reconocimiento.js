// Reconocimiento de circuitos dibujados a mano: esquema del JSON que devuelve el modelo,
// instrucciones (prompt) y conversión del resultado a un documento del editor.
// Lo usan el navegador y la función serverless (api/), así que no depende de React.

import { z } from 'zod';
import { docANetlist } from './netlist.js';
import { LARGO } from './geometria.js';
import { formatearValor } from './unidades.js';

export const UMBRAL_CONFIANZA = 0.7;

const FACTOR_UNIDAD = {
  'Ω': 1, ohm: 1, 'kΩ': 1e3, 'MΩ': 1e6,
  F: 1, mF: 1e-3, 'µF': 1e-6, uF: 1e-6, nF: 1e-9, pF: 1e-12,
  V: 1, mV: 1e-3, kV: 1e3,
};
const UNIDADES = Object.keys(FACTOR_UNIDAD);

const conf = z.number().min(0).max(1);
const coord = z.number().min(-0.05).max(1.05);

export const esquemaReconocimiento = z.object({
  elementos: z
    .array(
      z.object({
        id: z.string().min(1).max(12),
        tipo: z.enum(['resistencia', 'condensador', 'fuente']),
        valor: z.number().positive(),
        unidad: z.enum(UNIDADES),
        nodo_a: z.string().min(1),
        nodo_b: z.string().min(1),
        positivo: z.string().nullable().optional(),
        x: coord,
        y: coord,
        orientacion: z.enum(['horizontal', 'vertical']),
        confianza: conf,
        confianza_valor: conf,
        confianza_polaridad: conf.nullable().optional(),
      }),
    )
    .min(1)
    .max(40),
  nodos: z
    .array(
      z.object({
        id: z.string().min(1),
        x: coord,
        y: coord,
        etiqueta: z.string().max(4).nullable().optional(),
      }),
    )
    .min(2)
    .max(40),
  notas: z.string().max(500).nullable().optional(),
})
  .superRefine((r, ctx) => {
    const ids = new Set(r.nodos.map((n) => n.id));
    r.elementos.forEach((e, i) => {
      for (const campo of ['nodo_a', 'nodo_b']) {
        if (!ids.has(e[campo])) ctx.addIssue({ code: 'custom', path: ['elementos', i, campo], message: `nodo "${e[campo]}" no está en la lista de nodos` });
      }
      if (e.tipo === 'fuente' && e.positivo !== e.nodo_a && e.positivo !== e.nodo_b) {
        ctx.addIssue({ code: 'custom', path: ['elementos', i, 'positivo'], message: 'la fuente debe indicar cuál de sus dos nodos es el +' });
      }
      const u = e.unidad;
      const esperado = { resistencia: ['Ω', 'ohm', 'kΩ', 'MΩ'], condensador: ['F', 'mF', 'µF', 'uF', 'nF', 'pF'], fuente: ['V', 'mV', 'kV'] }[e.tipo];
      if (!esperado.includes(u)) ctx.addIssue({ code: 'custom', path: ['elementos', i, 'unidad'], message: `unidad ${u} no corresponde a ${e.tipo}` });
    });
  });

/** Esquema para "response_schema" de Gemini (subconjunto OpenAPI, tipos en mayúscula). */
export const esquemaGemini = {
  type: 'OBJECT',
  properties: {
    elementos: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          tipo: { type: 'STRING', enum: ['resistencia', 'condensador', 'fuente'] },
          valor: { type: 'NUMBER' },
          unidad: { type: 'STRING', enum: UNIDADES },
          nodo_a: { type: 'STRING' },
          nodo_b: { type: 'STRING' },
          positivo: { type: 'STRING', nullable: true },
          x: { type: 'NUMBER' },
          y: { type: 'NUMBER' },
          orientacion: { type: 'STRING', enum: ['horizontal', 'vertical'] },
          confianza: { type: 'NUMBER' },
          confianza_valor: { type: 'NUMBER' },
          confianza_polaridad: { type: 'NUMBER', nullable: true },
        },
        required: ['id', 'tipo', 'valor', 'unidad', 'nodo_a', 'nodo_b', 'x', 'y', 'orientacion', 'confianza', 'confianza_valor'],
      },
    },
    nodos: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { id: { type: 'STRING' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' }, etiqueta: { type: 'STRING', nullable: true } },
        required: ['id', 'x', 'y'],
      },
    },
    notas: { type: 'STRING', nullable: true },
  },
  required: ['elementos', 'nodos'],
};

export const PROMPT = `Eres un asistente que lee circuitos eléctricos de corriente continua dibujados a mano en papel o en tablero.
Analiza la imagen y devuelve SOLO un JSON con la netlist del circuito, con este formato:

{
  "elementos": [ { "id", "tipo", "valor", "unidad", "nodo_a", "nodo_b", "positivo", "x", "y", "orientacion", "confianza", "confianza_valor", "confianza_polaridad" } ],
  "nodos": [ { "id", "x", "y", "etiqueta" } ],
  "notas": "texto breve opcional"
}

Reglas:
- tipo: "resistencia" (zigzag o rectángulo), "condensador" (dos placas paralelas iguales) o "fuente" (fuente DC o batería: una placa larga y una corta; la placa LARGA es el terminal +).
- Un NODO es todo un tramo de cable conectado (todos los puntos unidos por cables sin componentes son el mismo nodo). Dale a cada nodo un id corto (n1, n2…).
- nodo_a y nodo_b: los dos nodos a los que se conecta cada elemento. En una fuente, "positivo" es el id del nodo de su terminal + (si hay signos + y − dibujados, úsalos; si no, la placa larga). Para resistencias y condensadores "positivo" es null.
- valor y unidad: el número escrito junto al elemento y su unidad, una de: Ω, kΩ, MΩ, F, mF, µF, nF, pF, V, mV, kV. Si no se ve unidad, usa Ω para resistencias, µF para condensadores y V para fuentes.
- id: el nombre escrito (R1, R2, C1, ε1…). Si no hay nombre, usa R1, R2… / C1, C2… / E1, E2… sin repetir.
- x, y: posición del CENTRO del elemento (o del nodo) en la imagen, como fracción del ancho y del alto (0 = izquierda/arriba, 1 = derecha/abajo). Para un nodo, usa un punto representativo de su cable (preferiblemente una esquina o una unión).
- orientacion: "horizontal" o "vertical", según cómo está dibujado el elemento.
- etiqueta: si junto a un punto del cable hay una letra (a, b, c, A, B…), ponla en el nodo correspondiente; si no, null.
- confianza (0 a 1): qué tan seguro estás de que el elemento existe, de su tipo y de sus conexiones. confianza_valor: qué tan seguro estás del número y la unidad. confianza_polaridad: solo en fuentes, qué tan seguro estás de cuál es el +; null en los demás.
- Sé honesto con las confianzas: si algo se ve borroso o ambiguo, usa valores bajos (por ejemplo 0.3–0.6).
- No inventes elementos que no estén dibujados. No incluyas cables como elementos.`;

/** Convierte el resultado del modelo en netlist (valores en SI). */
export function reconocimientoANetlist(r) {
  const elementos = r.elementos.map((e) => {
    const valor = e.valor * FACTOR_UNIDAD[e.unidad];
    if (e.tipo === 'fuente') {
      const pos = e.positivo;
      return { id: e.id, tipo: 'fuente', valor, pos, neg: pos === e.nodo_a ? e.nodo_b : e.nodo_a };
    }
    return { id: e.id, tipo: e.tipo, valor, a: e.nodo_a, b: e.nodo_b };
  });
  return { elementos };
}

/** Ids únicos y válidos para el editor (R1, C2, E1…). */
function normalizarIds(elementos) {
  const usados = new Set();
  const prefijo = { resistencia: 'R', condensador: 'C', fuente: 'E' };
  return elementos.map((e) => {
    let id = String(e.id).replace(/^ε/, 'E').replace(/[^A-Za-z0-9]/g, '');
    if (!/^[A-Za-z]/.test(id) || usados.has(id)) {
      let k = 1;
      while (usados.has(`${prefijo[e.tipo]}${k}`)) k++;
      id = `${prefijo[e.tipo]}${k}`;
    }
    usados.add(id);
    return { ...e, id };
  });
}

/**
 * Construye un documento del editor que respeta más o menos la distribución de la foto:
 * cada elemento en su posición (ajustada a la cuadrícula) y cables ortogonales hasta el punto de su nodo.
 * Se comprueba que la conectividad del dibujo sea la del JSON; si no, se prueban otras rutas.
 * aspecto = ancho/alto de la foto.
 */
export function reconocimientoADoc(r, aspecto = 4 / 3) {
  const elementos = normalizarIds(r.elementos);
  const nodos = new Map(r.nodos.map((n) => [n.id, n]));

  // Escala: que los elementos queden separados al menos ~7 unidades
  let dmin = Infinity;
  for (let i = 0; i < elementos.length; i++)
    for (let j = i + 1; j < elementos.length; j++) {
      const d = Math.hypot((elementos[i].x - elementos[j].x) * aspecto, elementos[i].y - elementos[j].y);
      if (d > 1e-6) dmin = Math.min(dmin, d);
    }
  const escalaBase = Math.min(60, Math.max(24, Number.isFinite(dmin) ? 7 / dmin : 30));

  const intentos = [];
  for (let intento = 0; intento < 12; intento++) {
    const escala = escalaBase * (1 + 0.12 * Math.floor(intento / 3));
    const doc = construir(elementos, nodos, escala, aspecto, intento % 3);
    const ok = mismaConectividad(doc, elementos);
    intentos.push({ doc, ok });
    if (ok) return { doc, ok: true };
  }
  return { doc: intentos[0].doc, ok: false };
}

function construir(elementos, nodos, escala, aspecto, variante) {
  const sx = (x) => Math.round(x * aspecto * escala);
  const sy = (y) => Math.round(y * escala);
  const par = (v) => Math.round(v / 2) * 2;
  const componentes = [];
  const extremo = new Map(); // `${id}:${nodo}` → punto del terminal
  const ocupado = new Set();

  for (const e of elementos) {
    let cx = par(sx(e.x));
    let cy = par(sy(e.y));
    // evitar que dos elementos caigan en el mismo sitio
    while (ocupado.has(`${cx},${cy}`)) {
      if (e.orientacion === 'horizontal') cy += 2;
      else cx += 2;
    }
    ocupado.add(`${cx},${cy}`);
    const nA = nodos.get(e.nodo_a);
    const nB = nodos.get(e.nodo_b);
    const horizontal = e.orientacion === 'horizontal';
    // ¿qué nodo queda al lado "inicial" (izquierda o arriba)?
    const aPrimero = horizontal ? nA.x <= nB.x : nA.y <= nB.y;
    const [primero, segundo] = aPrimero ? [e.nodo_a, e.nodo_b] : [e.nodo_b, e.nodo_a];
    const ini = horizontal ? { x: cx - LARGO / 2, y: cy } : { x: cx, y: cy - LARGO / 2 };
    const fin = horizontal ? { x: cx + LARGO / 2, y: cy } : { x: cx, y: cy + LARGO / 2 };
    let comp;
    const base = {
      id: e.id,
      tipo: e.tipo,
      valor: e.valor * FACTOR_UNIDAD[e.unidad],
      confianza: e.confianza,
      confianza_valor: e.confianza_valor,
      confianza_polaridad: e.tipo === 'fuente' ? e.confianza_polaridad ?? null : null,
    };
    base.texto = formatearValor(base.valor, e.tipo);
    base.revisar = Math.min(e.confianza, e.confianza_valor, e.tipo === 'fuente' ? e.confianza_polaridad ?? 1 : 1) < UMBRAL_CONFIANZA;

    if (e.tipo === 'fuente') {
      // terminal "a" del editor = −, "b" = +
      const posPrimero = e.positivo === primero;
      const a = posPrimero ? fin : ini;
      comp = { ...base, x: a.x, y: a.y, rot: horizontal ? (posPrimero ? 180 : 0) : posPrimero ? 270 : 90 };
      extremo.set(`${e.id}:${primero}`, ini);
      extremo.set(`${e.id}:${segundo}`, fin);
    } else {
      // terminal "a" del editor conectado a nodo_a
      const a = aPrimero ? ini : fin;
      comp = { ...base, x: a.x, y: a.y, rot: horizontal ? (aPrimero ? 0 : 180) : aPrimero ? 90 : 270 };
      extremo.set(`${e.id}:${primero}`, ini);
      extremo.set(`${e.id}:${segundo}`, fin);
    }
    componentes.push(comp);
  }

  // Cables: de cada terminal al punto del nodo, en L
  const cables = [];
  const nodosDoc = [];
  const etiquetas = [];
  let k = 0;
  const cable = (x1, y1, x2, y2) => {
    if (x1 !== x2 || y1 !== y2) cables.push({ id: `wf${++k}`, x1, y1, x2, y2 });
  };
  for (const [id, n] of nodos) {
    const terms = elementos.flatMap((e) => (e.nodo_a === id || e.nodo_b === id ? [{ e, p: extremo.get(`${e.id}:${id}`) }] : []));
    if (!terms.length) continue;
    let hx = par(sx(n.x));
    let hy = par(sy(n.y));
    if (variante === 2) {
      hx += 1;
      hy += 1;
    }
    for (const { e, p } of terms) {
      const horizontal = e.orientacion === 'horizontal';
      const primeroEje = variante === 1 ? !horizontal : horizontal;
      if (primeroEje) {
        cable(p.x, p.y, hx, p.y);
        cable(hx, p.y, hx, hy);
      } else {
        cable(p.x, p.y, p.x, hy);
        cable(p.x, hy, hx, hy);
      }
    }
    if (terms.length >= 3) nodosDoc.push({ id: `nf_${id}`, x: hx, y: hy });
    if (n.etiqueta) etiquetas.push({ id: `ef_${id}`, x: hx, y: hy, texto: n.etiqueta });
  }
  return { componentes, cables, nodos: nodosDoc, etiquetas };
}

/** ¿El dibujo une exactamente los mismos terminales que el JSON? */
function mismaConectividad(doc, elementos) {
  const { netlist } = docANetlist(doc);
  const nodoDibujo = new Map();
  for (const e of netlist.elementos) {
    const [p, q] = e.tipo === 'fuente' ? [e.neg, e.pos] : [e.a, e.b];
    nodoDibujo.set(e.id, { p, q, e });
  }
  // Para cada par de terminales: mismo nodo en el JSON ⇔ mismo nodo en el dibujo
  const terminalesJson = [];
  const terminalesDib = [];
  for (const e of elementos) {
    const d = nodoDibujo.get(e.id);
    if (!d) return false;
    let a;
    let b;
    if (e.tipo === 'fuente') {
      a = e.positivo === e.nodo_a ? e.nodo_b : e.nodo_a; // −
      b = e.positivo; // +
      terminalesDib.push(d.p, d.q);
    } else {
      a = e.nodo_a;
      b = e.nodo_b;
      terminalesDib.push(d.e.a, d.e.b);
    }
    terminalesJson.push(a, b);
  }
  for (let i = 0; i < terminalesJson.length; i++)
    for (let j = i + 1; j < terminalesJson.length; j++) {
      if ((terminalesJson[i] === terminalesJson[j]) !== (terminalesDib[i] === terminalesDib[j])) return false;
    }
  return true;
}
