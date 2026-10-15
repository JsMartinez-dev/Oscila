import './Inicio.css';

const DESARROLLADORES = ['Juan Sebastian Martinez', 'Juan David Rivera'];

const ACCESOS = [
  { id: 'montaje', titulo: 'Montaje virtual', texto: 'Dibuja o fotografía un circuito y obtén su solución paso a paso.' },
  { id: 'teoria', titulo: 'Teoría', texto: 'Potencial, capacitancia, circuitos y leyes de Kirchhoff.' },
  { id: 'ejercicios', titulo: 'Ejercicios', texto: '15 ejercicios resueltos con incisos colapsables.' },
  { id: 'test', titulo: 'Test', texto: '12 preguntas con retroalimentación y plan de estudio en PDF.' },
];

export default function Inicio({ onNavigate }) {
  return (
    <div className="inicio-page">
      <div className="portada-container">
        <div className="universidad-logo">
          <div className="logo-placeholder">
            <img src={`${import.meta.env.BASE_URL}logo-unimagdalena.png`} alt="Escudo de la Universidad del Magdalena" />
          </div>
          <p className="logo-text">Universidad del Magdalena</p>
        </div>

        <div className="contenido-portada">
          <div className="titulo-section">
            <h1 className="titulo-principal">CIRCUITOS EN VIVO</h1>
            <div className="subtitulo-divider"></div>
            <h2 className="subtitulo">Electricidad y Magnetismo</h2>
            <p className="inicio-lema">Dibuja un circuito (o tómale una foto a uno hecho a mano): la plataforma lo clasifica y lo resuelve paso a paso, verificando cada número.</p>
          </div>

          <div className="inicio-accesos">
            {ACCESOS.map((a) => (
              <button key={a.id} type="button" className="inicio-acceso" onClick={() => onNavigate?.(a.id)}>
                <strong>{a.titulo}</strong>
                <span>{a.texto}</span>
              </button>
            ))}
          </div>

          <section className="section-integrantes">
            <h3 className="section-titulo">Desarrolladores</h3>
            <div className="integrantes-list">
              {DESARROLLADORES.map((d) => (
                <div key={d} className="integrante-item">
                  <span className="integrante-dot"></span>
                  <span className="integrante-nombre">{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="section-profesor">
            <h3 className="section-titulo">Profesor</h3>
            <div className="profesor-info">
              <span className="profesor-nombre">Jarvin Mestra Páez</span>
            </div>
          </section>
        </div>

        <div className="portada-footer">
          <p className="inicio-evento">II Foro Internacional de Física · Universidad del Magdalena</p>
          <div className="wave-decoration"></div>
        </div>
      </div>
    </div>
  );
}
