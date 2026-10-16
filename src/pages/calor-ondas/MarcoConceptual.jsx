import { TexBloque } from '../../components/Tex.jsx';
import Figura from './Figura.jsx';
import PaginaTemas from './PaginaTemas.jsx';

const sections = [
  { id: "movimiento-oscilatorio", title: "Movimiento oscilatorio", desc: "Definición, posición de equilibrio y vaivén." },
  { id: "mas", title: "Movimiento Armónico Simple (M.A.S.)", desc: "Período, frecuencia, amplitud y elongación." },
  { id: "conceptos-fundamentales", title: "Conceptos Fundamentales", desc: "Oscilación, período, frecuencia, etc." },
  { id: "ley-hooke", title: "Ley de Hooke y Fuerza Elástica", desc: "Fuerza restauradora en resortes." },
  { id: "periodo-masa-resorte", title: "Período del Sistema Masa-Resorte", desc: "El período de oscilación de un sistema masa-resorte." },
  { id: "velocidad-aceleracion-mas", title: "Velocidad y Aceleración en el M.A.S.", desc: "Cómo varían la velocidad y la aceleración." },
  { id: "asociacion-resortes", title: "Asociación de Resortes", desc: "Combinaciones en serie y paralelo." },
  { id: "pendulo-simple", title: "Péndulo simple", desc: "Leyes del péndulo y período de oscilación." },
];

const content = {
  "movimiento-oscilatorio": (
    <>
      <h2>Movimiento Oscilatorio</h2>
      <p>El movimiento oscilatorio es un movimiento periódico en el que un cuerpo se mueve de un lado a otro en torno a una posición de equilibrio. Es un fenómeno fundamental en la física, presente en sistemas que van desde el péndulo de un reloj hasta las vibraciones de los átomos en un sólido.</p>
      <h3>Condición de restauración</h3>
      <p>Para que ocurra un movimiento oscilatorio, debe existir una <strong>fuerza restauradora</strong> que siempre apunte hacia la posición de equilibrio. Esta fuerza es la responsable de que el cuerpo regrese a su posición central después de haber sido desplazado.</p>
      <Figura id="federpendel" />
    </>
  ),
  "mas": (
    <>
      <h2>Movimiento Armónico Simple (M.A.S.)</h2>
      <p>El Movimiento Armónico Simple es el tipo más sencillo de movimiento oscilatorio. Ocurre cuando la fuerza restauradora es directamente proporcional al desplazamiento respecto a la posición de equilibrio.</p>
      <TexBloque latex={"x(t) = A \\cos(\\omega t + \\phi_0)"} />
      <ul>
        <li><strong>x(t)</strong>: Posición en función del tiempo.</li>
        <li><strong>A</strong>: Amplitud (máximo desplazamiento).</li>
        <li><strong>&omega;</strong>: Frecuencia angular.</li>
        <li><strong>t</strong>: Tiempo.</li>
        <li><strong>&phi;<sub>0</sub></strong>: Fase inicial.</li>
      </ul>
      <Figura id="mas-seno-coseno" />
    </>
  ),
  "conceptos-fundamentales": (
    <>
      <h2>Conceptos Fundamentales</h2>
      <div className="co-conceptos">
        <div className="co-concepto">
          <h4>Oscilación simple</h4>
          <p>Movimiento completo de ida y vuelta.</p>
          <TexBloque latex={"x(t) = A \\cos(\\omega t + \\phi_0)"} />
          <Figura id="oscilacion-pendulo" />
        </div>
        <div className="co-concepto">
          <h4>Posición de equilibrio</h4>
          <p>Punto donde la fuerza neta es cero.</p>
          <TexBloque latex={"x = 0, \\quad F_{neta} = 0"} />
          <Figura id="orbita-mas" />
        </div>
        <div className="co-concepto">
          <h4>Elongación (x)</h4>
          <p>Distancia desde la posición de equilibrio.</p>
          <TexBloque latex={"x = A \\sin(\\omega t + \\phi_0)"} />
          <Figura id="elongacion-resorte" />
        </div>
        <div className="co-concepto">
          <h4>Amplitud (A)</h4>
          <p>Máxima elongación.</p>
          <TexBloque latex={"|x|_{max} = A"} />
          <Figura id="amplitud" />
        </div>
        <div className="co-concepto">
          <h4>Período (T)</h4>
          <p>Tiempo de una oscilación completa.</p>
          <TexBloque latex={"T = \\frac{1}{f} = \\frac{2\\pi}{\\omega}"} />
          <Figura id="periodo-onda" />
        </div>
        <div className="co-concepto">
          <h4>Frecuencia (f)</h4>
          <p>Número de oscilaciones por segundo (f=1/T).</p>
          <TexBloque latex={"f = \\frac{1}{T} = \\frac{\\omega}{2\\pi}"} />
          <Figura id="cambio-frecuencia" />
        </div>
      </div>
    </>
  ),
  "ley-hooke": (
    <>
      <h2>Ley de Hooke y Fuerza Elástica</h2>
      <p>La Ley de Hooke describe la fuerza ejercida por un resorte. Esta fuerza es proporcional al desplazamiento 'x' desde su posición de equilibrio.</p>
      <TexBloque latex={"F = -kx"} />
      <ul>
        <li><strong>F</strong>: Fuerza elástica.</li>
        <li><strong>k</strong>: Constante elástica del resorte.</li>
        <li><strong>x</strong>: Desplazamiento desde la posición de equilibrio.</li>
      </ul>
      <p>El signo negativo indica que la fuerza siempre se opone al desplazamiento, es decir, es una fuerza restauradora.</p>
      <Figura id="masa-resorte" />
    </>
  ),
  "periodo-masa-resorte": (
    <>
      <h2>Período del Sistema Masa-Resorte</h2>
      <p>El período de oscilación de un sistema masa-resorte ideal depende de la masa y de la constante del resorte.</p>
      <TexBloque latex={"T = 2\\pi\\sqrt{\\frac{m}{k}}"} />
      <ul>
        <li><strong>T</strong>: Período.</li>
        <li><strong>m</strong>: Masa del cuerpo.</li>
        <li><strong>k</strong>: Constante elástica del resorte.</li>
      </ul>
      <p><strong>Isocronismo:</strong> El período no depende de la amplitud de la oscilación (para oscilaciones pequeñas).</p>
    </>
  ),
  "velocidad-aceleracion-mas": (
    <>
      <h2>Velocidad y Aceleración en el M.A.S.</h2>
      <h4>Velocidad</h4>
      <TexBloque latex={"v = \\frac{2\\pi}{T}\\sqrt{A^2 - x^2}"} />
      <p>La velocidad es máxima en la posición de equilibrio (x=0) y nula en los extremos (x=A).</p>
      <h4>Aceleración</h4>
      <TexBloque latex={"a = -\\frac{4\\pi^2}{T^2}x"} />
      <p>La aceleración es máxima en los extremos y nula en la posición de equilibrio. Siempre apunta en dirección opuesta a la elongación.</p>
      <Figura id="velocidad-aceleracion" />
    </>
  ),
  "asociacion-resortes": (
    <>
      <h2>Asociación de Resortes</h2>
      <h4>Serie</h4>
      <p>Un sistema de resortes está en serie cuando la deformación del resorte equivalente es igual a la suma de las deformaciones de cada resorte. En este caso, la 
        fuerza en cada resorte será la misma.</p>
      <TexBloque latex={"\\frac{1}{K_{eq}} = \\frac{1}{k_1} + \\frac{1}{k_2} + \\frac{1}{k_3} + ..."} />
      <h4>Paralelo</h4>
      <p>Un sistema de resortes está en paralelo cuando ellos tienen la
misma deformación.</p>
      <TexBloque latex={"K_{eq} = k_1 + k_2 + k_3 + ..."} />
      <Figura id="asociacion-resortes" />
    </>
  ),
  "pendulo-simple": (
    <>
      <h2>Péndulo Simple</h2>
      <p>Un péndulo simple es un modelo idealizado que consiste en una masa puntual suspendida de un hilo de longitud fija e inextensible.</p>
      <Figura id="pendulo-simple" />
      <h3>Período del Péndulo Simple</h3>
      <p>Para oscilaciones pequeñas, el período de un péndulo simple es:</p>
      <TexBloque latex={"T = 2\\pi\\sqrt{\\frac{L}{g}}"} />
      <ul>
        <li><strong>T</strong>: Período.</li>
        <li><strong>L</strong>: Longitud del hilo.</li>
        <li><strong>g</strong>: Aceleración de la gravedad.</li>
      </ul>
      <h3>Leyes del Péndulo</h3>
      <ol>
        <li><strong>Independencia de la masa:</strong> El período no depende de la masa del péndulo.</li>
        <li><strong>Dependencia de la longitud:</strong> El período es directamente proporcional a la raíz cuadrada de la longitud.</li>
        <li><strong>Dependencia de la gravedad:</strong> El período es inversamente proporcional a la raíz cuadrada de la gravedad.</li>
      </ol>
    </>
  ),
};

export default function MarcoConceptual() {
  return (
    <PaginaTemas
      titulo="Marco Conceptual"
      subtitulo="Fundamentos teóricos de oscilaciones y ondas mecánicas con fórmulas interactivas."
      secciones={sections}
      render={(s) => content[s.id]}
    />
  );
}
