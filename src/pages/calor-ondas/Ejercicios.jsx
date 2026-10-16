import { TexBloque, TexLinea } from '../../components/Tex.jsx';
import { EJERCICIOS } from '../../contenido/calor-ondas/ejercicios.js';
import Figura from './Figura.jsx';
import PaginaTemas from './PaginaTemas.jsx';

const SECCIONES = EJERCICIOS.map((e) => ({ id: String(e.id), title: e.titulo, desc: e.contexto, ejercicio: e }));

function Ejercicio({ ejercicio }) {
  return (
    <div className="co-ejercicio">
      <h2>
        <span className="co-ejercicio-icono" aria-hidden="true">
          {ejercicio.icono}
        </span>{' '}
        {ejercicio.titulo}
      </h2>

      {ejercicio.boceto && (
        <section>
          <h3>Boceto del Problema</h3>
          <Figura id={ejercicio.boceto} />
        </section>
      )}

      <section>
        <h3>Contexto del Ejercicio</h3>
        <p>{ejercicio.contexto}</p>
        <div className="co-problema">
          <strong>Problema:</strong> {ejercicio.problema}
        </div>
      </section>

      <section>
        <h3>Fórmulas a Utilizar</h3>
        <div className="co-formulas">
          {ejercicio.formulas.map((formula, idx) => (
            <div key={idx} className="co-formula">
              <h4>{formula.nombre}</h4>
              <TexBloque latex={formula.formula} />
              {formula.variables && (
                <div className="co-variables">
                  {formula.variables.map((v, i) => (
                    <div key={i} className="co-variable">
                      <span className="co-variable-simbolo">
                        <TexLinea latex={v.symbol} />
                      </span>
                      <span>{v.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Procedimiento Paso a Paso</h3>
        <ol className="co-pasos">
          {ejercicio.procedimiento.map((paso, idx) => (
            <li key={idx}>
              <span className="co-paso-num">{idx + 1}</span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Resultado Final</h3>
        <dl className="co-resultados">
          {Object.entries(ejercicio.resultados).map(([key, value], idx) => (
            <div key={idx} className="co-resultado">
              <dt>{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="co-interpretacion">
          <strong>Interpretación:</strong> {ejercicio.interpretacion}
        </div>
      </section>
    </div>
  );
}

export default function Ejercicios() {
  return (
    <PaginaTemas
      titulo="Ejercicios Prácticos"
      subtitulo="Problemas paso a paso con soluciones detalladas y explicaciones didácticas"
      secciones={SECCIONES}
      render={(s) => <Ejercicio ejercicio={s.ejercicio} />}
      clase="co-ejercicios"
    />
  );
}
