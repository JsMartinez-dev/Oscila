// Solución paso a paso con el formato del PDF de ejercicios resueltos:
//   1. diagrama(s)  2. fórmulas  3. resolución (símbolos primero, números en SI, ecuaciones numeradas, respuestas en recuadro)
//   4. comprobación física  5. resumen.
// Cada número que se muestra se compara con el análisis nodal (MNA); si algo no coincide (1 %), no se muestra la solución.

import { resolverCircuito } from './mna.js';
import { clasificar } from './clasificacion.js';
import { regresar } from './reduccion.js';
import { plantearKirchhoff, ecuacionesLineales } from './kirchhoff.js';
import { resolverConPasos, latexEcuacion } from './sistemas.js';
import { n, q, qAmbas, nombreLatex } from './formato.js';
import { dibujarReduccion } from './layout.js';
import { SistemaSingular } from './lineal.js';
import { terminales, puntosDeUnion } from './geometria.js';

const TOL = 0.01;

class Verificador {
  constructor() {
    this.fallas = [];
  }
  igual(etiqueta, mostrado, referencia) {
    const escala = Math.max(Math.abs(referencia), 1e-9);
    const ok = Math.abs(mostrado - referencia) <= TOL * escala || Math.abs(mostrado - referencia) < 1e-9;
    if (!ok) this.fallas.push(`${etiqueta}: ${mostrado} ≠ ${referencia}`);
  }
}

const NOMBRE_TIPO = { serie: 'serie', paralelo: 'paralelo' };

/**
 * net: netlist; opciones: { doc, geo, metodo: 'reduccion'|'kirchhoff' }
 * Devuelve { ok, error, clasificacion, metodo, bloques, mna, fallas }.
 */
export function resolverPasoAPaso(net, { doc = null, geo = null, metodo = null } = {}) {
  const mna = resolverCircuito(net);
  if (!mna.ok) return { ok: false, error: mna.error, avisos: mna.avisos };
  const clas = clasificar(net);

  let usar = metodo ?? clas.metodo;
  const avisos = [...(mna.avisos ?? [])];
  if (usar === 'reduccion' && clas.metodo !== 'reduccion') {
    avisos.push('Este circuito no se puede reducir por serie/paralelo: se resuelve por Kirchhoff.');
    usar = 'kirchhoff';
  }
  if (usar === 'kirchhoff' && mna.modo === 'C') {
    if (clas.metodo === 'reduccion') usar = 'reduccion';
    else return { ok: false, error: 'Redes de solo condensadores con varias fuentes no están soportadas en el paso a paso.', clasificacion: clas, mna };
  }

  const v = new Verificador();
  let bloques;
  try {
    bloques = usar === 'reduccion' ? pasosReduccion(net, clas.red, mna, doc, v) : pasosKirchhoff(net, geo, mna, doc, v);
  } catch (e) {
    if (e instanceof SistemaSingular) return { ok: false, error: 'El sistema de ecuaciones de Kirchhoff no tiene solución única.', clasificacion: clas, mna };
    throw e;
  }
  if (v.fallas.length) {
    return {
      ok: false,
      error: 'La verificación con el análisis nodal no coincidió, así que no se muestra la solución. Revisa el circuito o repórtalo.',
      fallas: v.fallas,
      clasificacion: clas,
      mna,
    };
  }
  return { ok: true, clasificacion: clas, metodo: usar, bloques, mna, avisos };
}

// ─────────────────────────────── Reducción ───────────────────────────────

function pasosReduccion(net, red, mna, doc, v) {
  const R = red.tipoRed === 'R';
  const U = R ? 'Ω' : 'F';
  const fuente = red.fuente;
  const eps = fuente.valor;
  const B = [];
  let tag = 0;
  const T = () => ++tag;

  const val = (x) => (R ? q(x, 'Ω') : qAmbas(x, 'F'));
  const numero = (x) => n(x);

  // Nombre final
  const raiz = red.raiz;
  if (raiz.tipo !== 'hoja') raiz.nombre = R ? 'R_{eq}' : 'C_{eq}';

  // 1. Diagramas
  B.push({ tipo: 'diagrama', titulo: 'Circuito original', doc: doc ?? dibujarReduccion(red, null) });
  red.pasos.forEach((p, i) => {
    const desc =
      p.combinaciones.length === 1
        ? `${p.combinaciones[0].hijos.map((h) => '$' + h.nombre + '$').join(', ')} en ${NOMBRE_TIPO[p.tipo]}`
        : `${p.combinaciones.length} combinaciones en ${NOMBRE_TIPO[p.tipo]}`;
    B.push({ tipo: 'diagrama', titulo: `Circuito ${i + 2}`, subtitulo: desc, doc: dibujarReduccion(red, new Set(p.circuito.map((x) => x.id))) });
  });

  // 2. Fórmulas
  B.push({
    tipo: 'formulas',
    latex: R
      ? ['\\text{serie: } R=R_a+R_b', '\\text{paralelo: } \\dfrac1{R_{ab}}=\\dfrac1{R_a}+\\dfrac1{R_b}', 'V=IR', 'P=IV=I^2R', '\\text{fuente: } P=\\varepsilon I']
      : ['\\text{serie: } \\dfrac1{C_{eq}}=\\dfrac1{C_a}+\\dfrac1{C_b}', '\\text{paralelo: } C_{eq}=C_a+C_b', 'Q=C\\,\\Delta v', 'U=\\tfrac12Q\\,v'],
  });
  if (!R) {
    B.push({
      tipo: 'texto',
      texto: `**Datos SI:** ${red.original.map((h) => `$${h.nombre}=${qAmbas(h.valor, 'F')}$`).join(', ')}, $V=${q(eps, 'V')}$.`,
    });
  }
  if (red.sinCorriente.length) {
    B.push({
      tipo: 'texto',
      texto: `${red.sinCorriente.map((x) => '$' + x.nombre + '$').join(', ')} no forma${red.sinCorriente.length > 1 ? 'n' : ''} parte de ningún camino cerrado: no circula ${R ? 'corriente' : 'carga'} y su voltaje es $0$.`,
    });
  }
  if (net.elementos.some((e) => e.tipo === 'condensador') && R) {
    B.push({ tipo: 'texto', texto: 'En corriente continua, en estado estacionario, los condensadores se comportan como **circuito abierto**: no pasa corriente por ellos.' });
  }

  // 3a. Equivalente
  B.push({ tipo: 'titulo', texto: R ? 'a) Resistencia equivalente, corriente y potencia de la fuente' : 'a) Capacitancia equivalente, carga y energía total' });
  for (const p of red.pasos) {
    for (const { resultado: r, hijos } of p.combinaciones) {
      const esFinal = r === raiz;
      const valorTxt = esFinal ? `\\boxed{${r.nombre}=${val(r.valor)}}` : `${r.nombre}=${val(r.valor)}`;
      const sumaDirecta = (p.tipo === 'serie') === R; // R en serie o C en paralelo: se suman
      let latex;
      if (sumaDirecta) {
        latex = `${r.nombre}=${hijos.map((h) => h.nombre).join('+')}=${hijos.map((h) => numero(h.valor)).join('+')}\\ \\Rightarrow\\ ${valorTxt}`;
      } else if (hijos.length === 2) {
        const [a, b] = hijos;
        latex = `${r.nombre}=\\frac{${a.nombre}${b.nombre}}{${a.nombre}+${b.nombre}}=\\frac{(${numero(a.valor)})(${numero(b.valor)})}{${numero(a.valor)}+${numero(b.valor)}}\\ \\Rightarrow\\ ${valorTxt}`;
      } else {
        const invSuma = hijos.reduce((s, h) => s + 1 / h.valor, 0);
        latex = `\\frac1{${r.nombre}}=${hijos.map((h) => `\\frac1{${h.nombre}}`).join('+')}=${hijos.map((h) => `\\frac1{${numero(h.valor)}}`).join('+')}=${n(invSuma)}\\,${R ? '\\Omega^{-1}' : '\\mathrm{F}^{-1}'}\\ \\Rightarrow\\ ${valorTxt}`;
      }
      B.push({ tipo: 'ecuacion', latex, tag: T() });
    }
  }
  if (raiz.tipo === 'hoja') {
    B.push({ tipo: 'ecuacion', latex: `\\boxed{${R ? 'R_{eq}' : 'C_{eq}'}=${raiz.nombre}=${val(raiz.valor)}}`, tag: T() });
  }

  const nombreEq = raiz.tipo === 'hoja' ? (R ? 'R_{eq}' : 'C_{eq}') : raiz.nombre;
  const fuenteMna = mna.porElemento[fuente.id];
  if (R) {
    const It = eps / raiz.valor;
    const P = eps * It;
    v.igual('R_eq', raiz.valor, mna.equivalente.Req);
    v.igual('I_t', It, fuenteMna.I);
    v.igual('P_fuente', P, fuenteMna.P);
    B.push({ tipo: 'ecuacion', latex: `I_t=\\frac{\\varepsilon}{${nombreEq}}=\\frac{${n(eps)}}{${n(raiz.valor)}}\\ \\Rightarrow\\ \\boxed{I_t=${q(It, 'A')}}`, tag: T() });
    B.push({ tipo: 'ecuacion', latex: `P=\\varepsilon I_t=(${n(eps)})(${n(It)})\\ \\Rightarrow\\ \\boxed{P=${q(P, 'W')}}`, tag: T() });
  } else {
    const Qt = raiz.valor * eps;
    const Ut = 0.5 * Qt * eps;
    v.igual('C_eq', raiz.valor, mna.equivalente.Ceq);
    v.igual('Q_t', Qt, fuenteMna.Q);
    B.push({ tipo: 'ecuacion', latex: `Q_t=${nombreEq}\\,V_{ab}=(${n(raiz.valor)})(${n(eps)})\\ \\Rightarrow\\ \\boxed{Q_t=${q(Qt, 'C')}}`, tag: T() });
    B.push({ tipo: 'ecuacion', latex: `U_t=\\tfrac12Q_tV_{ab}=\\tfrac12(${n(Qt)})(${n(eps)})\\ \\Rightarrow\\ \\boxed{U_t=${q(Ut, 'J')}}`, tag: T() });
  }

  // 3b. Regreso por cada circuito
  const valores = regresar(red);
  B.push({ tipo: 'titulo', texto: R ? 'b) Cada resistencia (regreso por los circuitos)' : 'b) Cada condensador (regreso por los circuitos)' });
  for (let k = red.pasos.length - 1; k >= 0; k--) {
    const p = red.pasos[k];
    B.push({ tipo: 'texto', texto: `De **Circuito ${k + 2}** a **${k === 0 ? 'Circuito original' : `Circuito ${k + 1}`}** (${p.tipo === 'serie' ? (R ? 'serie: misma corriente' : 'serie: misma carga') : 'paralelo: mismo voltaje'}):` });
    for (const { resultado: r, hijos } of p.combinaciones) {
      const pv = valores.get(r.id);
      const partes = hijos.map((h) => {
        const hv = valores.get(h.id);
        if (R) {
          return p.tipo === 'serie'
            ? `V_{${sub(h)}}=I\\,${h.nombre}=(${n(pv.I)})(${n(h.valor)})=${q(hv.V, 'V')}`
            : `I_{${sub(h)}}=\\frac{V}{${h.nombre}}=\\frac{${n(pv.V)}}{${n(h.valor)}}=${q(hv.I, 'A')}`;
        }
        return p.tipo === 'serie'
          ? `V_{${sub(h)}}=\\frac{Q}{${h.nombre}}=\\frac{${n(pv.Q)}}{${n(h.valor)}}=${q(hv.V, 'V')}`
          : `Q_{${sub(h)}}=${h.nombre}\\,V=(${n(h.valor)})(${n(pv.V)})=${q(hv.Q, 'C')}`;
      });
      const comun = R
        ? p.tipo === 'serie'
          ? `\\text{por }${r.nombre}:\\ I=${q(pv.I, 'A')}`
          : `\\text{en }${r.nombre}:\\ V=${q(pv.V, 'V')}`
        : p.tipo === 'serie'
          ? `\\text{en }${r.nombre}:\\ Q=${q(pv.Q, 'C')}`
          : `\\text{en }${r.nombre}:\\ V=${q(pv.V, 'V')}`;
      B.push({ tipo: 'ecuacion', latex: `${comun}\\qquad ${partes.join(',\\qquad ')}` });
    }
  }

  // Tabla por elemento original
  const hojas = red.original;
  if (R) {
    const filas = hojas.map((h) => {
      const hv = valores.get(h.id);
      const m = mna.porElemento[h.id];
      v.igual(`I(${h.id})`, hv.I, Math.abs(m.I));
      v.igual(`V(${h.id})`, hv.V, m.V);
      return [`$${h.nombre}=${q(h.valor, 'Ω')}$`, `$${n(hv.I)}$`, `$${n(hv.V)}$`, `$${n(hv.I * hv.I * h.valor)}$`];
    });
    const sumaP = hojas.reduce((s, h) => s + valores.get(h.id).I ** 2 * h.valor, 0);
    v.igual('ΣP', sumaP, fuenteMna.P);
    filas.push(['**Suma**', '', '', `$\\mathbf{${n(sumaP)}}$`]);
    B.push({ tipo: 'tabla', encabezados: ['$R$', '$I$ (A)', '$V=IR$ (V)', '$P=I^2R$ (W)'], filas });

    // Comprobaciones
    const checks = [];
    const nodoParalelo = encontrarPrimero(raiz, 'paralelo');
    if (nodoParalelo) {
      const pv = valores.get(nodoParalelo.id);
      const sumaI = nodoParalelo.hijos.reduce((s, h) => s + valores.get(h.id).I, 0);
      checks.push(`**Conservación de la carga:** en ${nodoParalelo === raiz ? 'el nodo de la fuente' : `el paralelo $${nodoParalelo.nombre}$`}, $${nodoParalelo.hijos.map((h) => n(valores.get(h.id).I)).join('+')}=${q(sumaI, 'A')}=${q(pv.I, 'A')}$. ✓`);
    } else {
      checks.push(`**Conservación de la carga:** todos los elementos están en serie con la fuente y llevan la misma corriente $I_t=${q(eps / raiz.valor, 'A')}$. ✓`);
    }
    const nodoSerie = encontrarPrimero(raiz, 'serie');
    let voltajes = '';
    if (nodoSerie) {
      const pv = valores.get(nodoSerie.id);
      voltajes = `; además, en $${nodoSerie.nombre}$: $${nodoSerie.hijos.map((h) => n(valores.get(h.id).V)).join('+')}=${q(pv.V, 'V')}$`;
    }
    checks.push(`**Conservación de la energía:** $\\sum P_R=${q(sumaP, 'W')}=P_{fuente}$${voltajes}. ✓`);
    for (const c of checks) B.push({ tipo: 'check', texto: c });
  } else {
    const filas = hojas.map((h) => {
      const hv = valores.get(h.id);
      const m = mna.porElemento[h.id];
      v.igual(`V(${h.id})`, hv.V, m.V);
      v.igual(`Q(${h.id})`, hv.Q, m.Q);
      return [`$${h.nombre}=${n(h.valor / 1e-6)}\\,\\mu\\mathrm{F}$`, `$${n(hv.V)}$`, `$${n(hv.Q)}$`, `$${n(0.5 * hv.Q * hv.V)}$`];
    });
    const sumaU = hojas.reduce((s, h) => s + 0.5 * valores.get(h.id).Q * valores.get(h.id).V, 0);
    const Ut = 0.5 * raiz.valor * eps * eps;
    v.igual('ΣU', sumaU, Ut);
    filas.push(['**Suma**', '', '', `$\\mathbf{${n(sumaU)}}$`]);
    B.push({ tipo: 'tabla', encabezados: ['$C$', '$V$ (V)', '$Q=CV$ (C)', '$U=\\tfrac12QV$ (J)'], filas });
    const nodoParalelo = encontrarPrimero(raiz, 'paralelo');
    if (nodoParalelo) {
      const pv = valores.get(nodoParalelo.id);
      B.push({ tipo: 'check', texto: `**Conservación de la carga:** en $${nodoParalelo.nombre}$, $${nodoParalelo.hijos.map((h) => n(valores.get(h.id).Q)).join('+')}=${q(pv.Q, 'C')}$. ✓` });
    }
    B.push({ tipo: 'check', texto: `**Conservación de la energía:** $\\sum U_i=${q(sumaU, 'J')}=U_t$. ✓` });
  }

  // Condensadores en un circuito con resistencias
  const caps = net.elementos.filter((e) => e.tipo === 'condensador');
  if (R && caps.length) {
    B.push({ tipo: 'titulo', texto: 'Condensadores (estado estacionario)' });
    for (const c of caps) {
      const m = mna.porElemento[c.id];
      B.push({
        tipo: 'ecuacion',
        latex: `${nombreLatex(c.id, 'condensador')}:\\ V=|V_{${c.a}}-V_{${c.b}}|=${q(m.V, 'V')},\\quad Q=CV=${q(m.Q, 'C')},\\quad U=\\tfrac12CV^2=${q(m.U, 'J')}`,
      });
    }
  }

  // Resumen
  const resumen = R
    ? [`R_{eq}=${q(raiz.valor, 'Ω')}`, `I_t=${q(eps / raiz.valor, 'A')}`, `P_{fuente}=${q(eps * eps / raiz.valor, 'W')}`]
    : [`C_{eq}=${qAmbas(raiz.valor, 'F')}`, `Q_t=${q(raiz.valor * eps, 'C')}`, `U_t=${q(0.5 * raiz.valor * eps * eps, 'J')}`];
  B.push({ tipo: 'resumen', items: resumen });
  return B;
}

const sub = (h) => (h.nombre.match(/_\{(.*)\}$/)?.[1] ?? h.nombre);

function encontrarPrimero(x, tipo) {
  if (x.tipo === tipo) return x;
  for (const h of x.hijos ?? []) {
    const r = encontrarPrimero(h, tipo);
    if (r) return r;
  }
  return null;
}

// ─────────────────────────────── Kirchhoff ───────────────────────────────

function pasosKirchhoff(net, geo, mna, doc, v) {
  const pl = plantearKirchhoff(net, geo);
  if (!pl.ok) throw new SistemaSingular(pl.error);
  const B = [];
  let tag = 0;
  const T = () => ++tag;
  const { ramas, ecNodos, mallas } = pl;
  const vars = ramas.map((r) => r.variable);

  const nombreElem = (e) =>
    e.tipo === 'fuente' ? `${q(e.valor, 'V')}` : `${q(e.valor, 'Ω')}`;
  const alias = aliasNodos(geo);
  const nombreNodo = (x) => `$${nombreNodoLatex(x)}$`;

  // Elemento de la rama donde se dibuja la flecha y su sentido respecto a los terminales del dibujo
  const flechaDe = (r) => {
    const e = r.elems.find((x) => x.elem.tipo === 'resistencia') ?? r.elems[0];
    const nodoA = e.elem.tipo === 'fuente' ? e.elem.neg : e.elem.a; // nodo del terminal "a" en el dibujo
    return { e, sentido: e.desde === nodoA ? 'ab' : 'ba' };
  };
  // Sentido supuesto en el dibujo: de un nodo principal al otro; en un solo lazo, el de la flecha
  const sentidoRama = (r) => {
    const pos = geo?.posNodo ?? {};
    if (r.desde !== r.hacia && pos[r.desde] && pos[r.hacia]) {
      const d = direccion(pos[r.desde], pos[r.hacia]);
      if (d) return d;
    }
    const { e, sentido } = flechaDe(r);
    const c = doc?.componentes?.find((x) => x.id === e.elem.id);
    if (!c) return null;
    const t = terminales(c);
    return sentido === 'ab' ? direccion(t.a, t.b) : direccion(t.b, t.a);
  };
  const fuenteDe = (r) => r.elems.find((x) => x.elem.tipo === 'fuente')?.elem;
  const nombreRama = (r) => `la rama de $${nombreElem(fuenteDe(r) ?? r.elems.find((x) => x.elem.tipo === 'resistencia')?.elem ?? r.elems[0].elem)}$`;
  const sentidos = new Map(ramas.map((r) => [r, sentidoRama(r)]));
  const conDibujo = ramas.every((r) => sentidos.get(r));

  // Diagrama con corrientes y mallas
  const mallasDibujadas = pl.origenMallas === 'dibujo';
  const nodosAnotados = geo ? nodosParaDiagrama(net, doc, geo) : [];
  B.push({
    tipo: 'diagrama',
    titulo: 'Circuito original',
    doc,
    anotaciones: doc
      ? {
          corrientes: ramas.map((r) => {
            const { e, sentido } = flechaDe(r);
            return { id: e.elem.id, sentido, etiqueta: `I${r.k}` };
          }),
          mallas: mallasDibujadas ? mallas.map((m, i) => ({ centro: m.centro, etiqueta: `M${i + 1}` })) : [],
          nodos: nodosAnotados,
        }
      : null,
    leyenda: doc
      ? 'Flechas verdes: sentido supuesto de cada corriente' +
        (mallasDibujadas
          ? ` · ${mallas.map((_, i) => `$M_{${i + 1}}$`).join(', ')}: ${mallas.length === 1 ? 'malla recorrida' : 'mallas recorridas'} en sentido horario`
          : '') +
        (nodosAnotados.length
          ? ` · Puntos azules: nodos (${nodosAnotados.map((n) => `$${nombreNodoLatex(n.etiqueta)}$`).join(', ')})`
          : '')
      : null,
  });

  // Nodos y sentidos
  const P = pl.principales.length;
  if (P) {
    const txtNodos = pl.principales
      .map((x) => (alias[x] && alias[x].length > 1 ? `$${nombreNodoLatex(x)}$ (une ${alias[x].map((a) => '$' + a + '$').join('–')})` : `$${nombreNodoLatex(x)}$`))
      .join(P === 2 ? ' y ' : ', ');
    B.push({ tipo: 'texto', texto: `**Nodos principales:** ${txtNodos}.` });
  } else {
    B.push({ tipo: 'texto', texto: 'El circuito es **un solo lazo**: no hay nodos principales y circula una sola corriente.' });
  }
  const variasFuentes = ramas.some((r) => r.elems.filter((x) => x.elem.tipo === 'fuente').length > 1);
  B.push({
    tipo: 'texto',
    texto:
      `**Regla del sentido supuesto:** cada corriente sale por el $+$ de la fuente de su rama${variasFuentes ? ' (si hay varias, la primera)' : ''}; ` +
      (conDibujo
        ? 'en las ramas sin fuente, se supone que baja en el dibujo (o que va hacia la derecha si la rama es horizontal).'
        : 'en las ramas sin fuente el sentido se elige libremente: si resulta al revés, la corriente da negativa.'),
  });
  const supuesto = (r) => {
    const d = sentidos.get(r);
    const donde = d ? `hacia ${d} por ${nombreRama(r)}` : `de ${nombreNodo(r.desde)} a ${nombreNodo(r.hacia)} por ${nombreRama(r)}`;
    return `$${r.variable}$: ${donde}${fuenteDe(r) ? ' (sale por el $+$ de la fuente)' : ''}`;
  };
  B.push({ tipo: 'texto', texto: `**Sentidos supuestos:** ${ramas.map(supuesto).join('; ')}.` });
  B.push({
    tipo: 'texto',
    texto: mallasDibujadas
      ? 'Las mallas son las ventanas del dibujo, recorridas en **sentido horario**.'
      : 'El dibujo no permite tomar ventanas (tiene cruces o no hay dibujo): se usan lazos independientes, recorridos en sentido horario cuando hay posiciones.',
  });
  if (pl.sinCorriente.length) {
    B.push({ tipo: 'texto', texto: `Sin corriente (condensadores en DC o ramas abiertas): ${pl.sinCorriente.map((id) => '$' + nombreLatex(id, net.elementos.find((e) => e.id === id).tipo) + '$').join(', ')}.` });
  }

  B.push({
    tipo: 'formulas',
    latex: [
      '\\text{Nodos: }\\sum I_{entra}=\\sum I_{sale}',
      '\\text{Mallas: }\\sum V=0',
      'R\\text{ con }I:\\ -IR,\\ \\text{contra }I:\\ +IR',
      '\\text{fuente }-\\to+:\\ +\\varepsilon,\\ \\ +\\to-:\\ -\\varepsilon',
      'P=I^2R',
      'P=\\varepsilon I',
    ],
  });
  const nM = mallas.length;
  B.push({
    tipo: 'texto',
    texto: `Ecuaciones: $(\\text{nodos}-1)=${Math.max(0, P - 1)}$ de nodo y $${nM}$ de malla para ${ramas.length === 1 ? 'la corriente' : `las ${ramas.length} corrientes`}.`,
  });

  // Sistema de ecuaciones
  B.push({ tipo: 'titulo', texto: 'Sistema de ecuaciones' });
  const lineales = ecuacionesLineales(pl);
  const conTag = [];
  ecNodos.forEach((e, i) => {
    const izq = e.entran.map((r) => r.variable).join('+') || '0';
    const der = e.salen.map((r) => r.variable).join('+') || '0';
    const t = T();
    conTag.push({ ...lineales[i], tag: t });
    B.push({ tipo: 'ecuacion', latex: `\\text{Nodo } ${nombreNodoLatex(e.nodo)}:\\quad ${izq}=${der}`, tag: t });
  });
  mallas.forEach((m, i) => {
    const crudo =
      m.terminos
        .map((t) => (t.tipo === 'fuente' ? `${t.valor < 0 ? '-' : '+'}${n(Math.abs(t.valor))}` : `${t.coef < 0 ? '-' : '+'}${n(Math.abs(t.coef))}${t.rama.variable}`))
        .join('') + '=0';
    const lin = lineales[ecNodos.length + i];
    const t = T();
    conTag.push({ ...lin, tag: t });
    const ruta = m.ruta?.length ? ` (${m.ruta.map(nombreNodoLatex).join('\\to ')})` : '';
    B.push({
      tipo: 'ecuacion',
      latex: `\\text{Malla ${i + 1}${ruta ? '' : ''}}${ruta ? `\\ ${ruta}` : ''}:\\quad ${crudo}\\ \\Rightarrow\\ ${latexEcuacion(lin, vars)}`,
      tag: t,
    });
  });

  // Solución
  B.push({ tipo: 'titulo', texto: 'Solución' });
  const { solucion, bloques } = resolverConPasos(conTag, vars, T);
  B.push(...bloques);

  // Verificación con MNA: corriente de cada rama en su sentido supuesto
  for (const r of ramas) {
    const x = r.elems[0];
    const m = mna.porElemento[x.elem.id];
    let ref;
    if (x.elem.tipo === 'fuente') ref = x.desde === x.elem.neg ? m.I : -m.I;
    else ref = x.desde === x.elem.a ? m.I : -m.I;
    v.igual(r.variable, solucion[r.variable], ref);
  }

  // Tabla
  const filas = [];
  let disipada = 0;
  let entregada = 0;
  let absorbida = 0;
  const corrienteDe = (id) => {
    const r = ramas.find((x) => x.elems.some((y) => y.elem.id === id));
    return r ? { r, I: solucion[r.variable] } : { r: null, I: 0 };
  };
  for (const e of net.elementos.filter((x) => x.tipo === 'resistencia')) {
    const { I } = corrienteDe(e.id);
    const Ia = Math.abs(I);
    const P = Ia * Ia * e.valor;
    disipada += P;
    v.igual(`|I|(${e.id})`, Ia, Math.abs(mna.porElemento[e.id].I));
    filas.push([`$${nombreLatex(e.id, 'resistencia')}=${q(e.valor, 'Ω')}$`, `$${n(Ia)}$`, `$${n(Ia * e.valor)}$`, `$${n(P)}$`]);
  }
  filas.push(['**Total disipado**', '', '', `$\\mathbf{${n(disipada)}}$`]);
  const fuentesTxt = [];
  for (const e of net.elementos.filter((x) => x.tipo === 'fuente')) {
    const { r, I } = corrienteDe(e.id);
    const x = r?.elems.find((y) => y.elem.id === e.id);
    // corriente que sale por el +
    const sale = x ? (x.desde === e.neg ? I : -I) : 0;
    const P = e.valor * Math.abs(sale);
    const rol = sale >= 0 ? 'entrega' : 'absorbe';
    v.igual(`I+(${e.id})`, sale, mna.porElemento[e.id].I);
    if (rol === 'entrega') entregada += P;
    else absorbida += P;
    fuentesTxt.push({ e, P, rol });
    filas.push([
      `Fuente $${q(e.valor, 'V')}$: $I$ ${rol === 'entrega' ? 'sale' : 'entra'} por $+$ $\\Rightarrow$ **${rol}**`,
      `$${n(Math.abs(sale))}$`,
      `$${n(e.valor)}$`,
      `$${n(P)}$`,
    ]);
  }
  B.push({ tipo: 'tabla', encabezados: ['Elemento', '$I$ (A)', '$V$ (V)', '$P$ (W)'], filas });

  // Sentido real de cada corriente
  B.push({ tipo: 'titulo', texto: 'Sentido real de cada corriente' });
  for (const r of ramas) {
    const I = solucion[r.variable];
    const Ia = Math.abs(I);
    if (Ia < 1e-9) {
      B.push({ tipo: 'texto', texto: `$${r.variable}=0$: no circula corriente por ${nombreRama(r)}.` });
      continue;
    }
    const d = sentidos.get(r);
    const real = d ? `hacia ${I > 0 ? d : CONTRARIO[d]}` : I > 0 ? `de ${nombreNodo(r.desde)} a ${nombreNodo(r.hacia)}` : `de ${nombreNodo(r.hacia)} a ${nombreNodo(r.desde)}`;
    const circula = `${n(Ia) === '1.00' ? 'circula' : 'circulan'} $${q(Ia, 'A')}$ ${real}`;
    B.push({
      tipo: 'texto',
      texto:
        I > 0
          ? `$${r.variable}=${q(I, 'A')}>0$: el supuesto era correcto; por ${nombreRama(r)} ${circula}.`
          : `$${r.variable}=${q(I, 'A')}<0$: el sentido real es el contrario al supuesto; por ${nombreRama(r)} ${circula}.`,
    });
  }
  if (coincideConCurso(doc?.curso, net, corrienteDe)) {
    B.push({ tipo: 'check', texto: `Cada corriente, en valor y sentido real, es igual que en la solución del curso (Ejercicio ${doc.curso.ejercicio}). ✓` });
  }

  // Comprobaciones
  for (const e of ecNodos) {
    const ent = e.entran.map((r) => solucion[r.variable]);
    const sal = e.salen.map((r) => solucion[r.variable]);
    const sEnt = ent.reduce((s, x) => s + x, 0);
    const sSal = sal.reduce((s, x) => s + x, 0);
    B.push({
      tipo: 'check',
      texto: `**Carga** (nodo $${e.nodo}$): entra $${suma(ent, sEnt)}$ y sale $${suma(sal, sSal)}$ (en A). ✓`,
    });
  }
  v.igual('balance', entregada, disipada + absorbida);
  B.push({
    tipo: 'check',
    texto: `**Energía:** entregada $${q(entregada, 'W')}$ $=$ disipada $${q(disipada, 'W')}$${absorbida > 1e-12 ? ` $+$ absorbida $${q(absorbida, 'W')}$` : ''}. ✓`,
  });

  B.push({
    tipo: 'resumen',
    items: [
      ...ramas.map((r) => `${r.variable}=${q(solucion[r.variable], 'A')}`),
      ...fuentesTxt.map(({ e, P, rol }) => `${nombreLatex(e.id, 'fuente')}\\ (${q(e.valor, 'V')})\\ \\text{${rol}}\\ ${q(P, 'W')}`),
    ],
  });
  return B;
}

const CONTRARIO = { abajo: 'arriba', arriba: 'abajo', 'la derecha': 'la izquierda', 'la izquierda': 'la derecha' };

/** Dirección en el dibujo de p a q, según el eje dominante (en el SVG, y crece hacia abajo). */
function direccion(p, q) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  if (Math.hypot(dx, dy) < 1e-9) return null;
  if (Math.abs(dy) >= Math.abs(dx)) return dy > 0 ? 'abajo' : 'arriba';
  return dx > 0 ? 'la derecha' : 'la izquierda';
}

/**
 * ¿Las corrientes calculadas son las de la solución del curso? curso.corrientes: { id: I } con
 * I de a hacia b (resistencias) o I que sale por el + (fuentes). Exige los mismos elementos y 1 %.
 */
function coincideConCurso(curso, net, corrienteDe) {
  if (!curso?.corrientes) return false;
  const elems = net.elementos.filter((e) => e.tipo === 'resistencia' || e.tipo === 'fuente');
  const ref = curso.corrientes;
  if (elems.length !== Object.keys(ref).length || !elems.every((e) => e.id in ref)) return false;
  return elems.every((e) => {
    const { r, I } = corrienteDe(e.id);
    const x = r?.elems.find((y) => y.elem.id === e.id);
    if (!x) return Math.abs(ref[e.id]) < 1e-9;
    const inicio = e.tipo === 'fuente' ? e.neg : e.a; // I de a hacia b, o la que sale por el +
    const calc = x.desde === inicio ? I : -I;
    return Math.abs(calc - ref[e.id]) <= Math.max(TOL * Math.abs(ref[e.id]), 1e-6);
  });
}

function suma(lista, total) {
  if (!lista.length) return '0';
  if (lista.length === 1) return n(total);
  return `${lista.map((x) => n(x)).join('+').replace(/\+-/g, '-')}=${n(total)}`;
}

function aliasNodos(geo) {
  return geo?.etiquetasPorNodo ?? {};
}

export function nombreNodoLatex(x) {
  const m = String(x).match(/^([A-Za-z]+)(\d+)$/);
  return m ? `${m[1]}_{${m[2]}}` : String(x);
}

export function nodosParaDiagrama(net, doc, geo) {
  if (!doc || !geo) return [];
  const uniones = puntosDeUnion(doc);
  const etiquetasExistentes = new Set((doc.etiquetas ?? []).map((e) => geo.nodoDe(e)).filter(Boolean));
  const res = [];
  for (const n of net.nodos ?? []) {
    if (etiquetasExistentes.has(n)) continue;

    const unionesNodo = uniones.filter((p) => geo.nodoDe({ x: p[0], y: p[1] }) === n);
    if (unionesNodo.length) {
      const cx = unionesNodo.reduce((s, p) => s + p[0], 0) / unionesNodo.length;
      const cy = unionesNodo.reduce((s, p) => s + p[1], 0) / unionesNodo.length;
      let mejor = unionesNodo[0];
      let menorD = Infinity;
      for (const p of unionesNodo) {
        const d = (p[0] - cx) ** 2 + (p[1] - cy) ** 2;
        if (d < menorD) {
          menorD = d;
          mejor = p;
        }
      }
      res.push({ etiqueta: n, x: mejor[0], y: mejor[1] });
      continue;
    }

    const segsCable = (geo.segmentos ?? []).filter(
      (s) => s.tipo === 'cable' && geo.nodoDe(s.p) === n && geo.nodoDe(s.q) === n
    );
    if (segsCable.length) {
      let mejorSeg = segsCable[0];
      let maxL = -1;
      for (const s of segsCable) {
        const l = Math.hypot(s.q.x - s.p.x, s.q.y - s.p.y);
        if (l > maxL) {
          maxL = l;
          mejorSeg = s;
        }
      }
      res.push({
        etiqueta: n,
        x: (mejorSeg.p.x + mejorSeg.q.x) / 2,
        y: (mejorSeg.p.y + mejorSeg.q.y) / 2,
      });
      continue;
    }

    const segs = (geo.segmentos ?? []).filter(
      (s) => geo.nodoDe(s.p) === n || geo.nodoDe(s.q) === n
    );
    if (segs.length) {
      const p = geo.nodoDe(segs[0].p) === n ? segs[0].p : segs[0].q;
      res.push({ etiqueta: n, x: p.x, y: p.y });
      continue;
    }

    if (geo?.posNodo?.[n]) {
      res.push({ etiqueta: n, x: geo.posNodo[n].x, y: geo.posNodo[n].y });
    }
  }
  return res;
}

