import { useState } from "react";
import jsPDF from "jspdf";
import "../pages/TestInteractivo.css";

const QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál es la unidad del potencial eléctrico en el SI?",
    options: { A: "N/C", B: "J/C (voltio)", C: "C/V", D: "J·s" },
    correctAnswer: "B",
    feedback: "El potencial es energía por unidad de carga: v = U/q, así que 1 V = 1 J/C. N/C es la unidad del campo eléctrico y C/V la de la capacitancia.",
    topic: "Potencial eléctrico",
  },
  {
    id: 2,
    question: "El potencial de una carga puntual es v = Kₑq/r. Si te alejas al doble de la distancia, el potencial…",
    options: { A: "se duplica", B: "no cambia", C: "se reduce a la mitad", D: "se reduce a la cuarta parte" },
    correctAnswer: "C",
    feedback: "El potencial de una carga puntual es inversamente proporcional a r (no a r²): al doble de distancia queda la mitad. El que cae como 1/r² es el campo.",
    topic: "Potencial de cargas puntuales",
  },
  {
    id: 3,
    question: "Según E = −∇v, el campo eléctrico apunta…",
    options: { A: "hacia donde el potencial aumenta", B: "hacia donde el potencial disminuye", C: "siempre paralelo a las equipotenciales", D: "en cualquier dirección" },
    correctAnswer: "B",
    feedback: "El signo menos indica que el campo apunta en la dirección en que el potencial disminuye más rápido, y es perpendicular a las superficies equipotenciales.",
    topic: "Campo a partir del potencial",
  },
  {
    id: 4,
    question: "Si se duplica el voltaje aplicado a un condensador, ¿qué pasa con su capacitancia C = Q/Δv?",
    options: { A: "Se duplica", B: "Se reduce a la mitad", C: "No cambia: se duplica la carga", D: "Se cuadruplica" },
    correctAnswer: "C",
    feedback: "La capacitancia depende solo de la geometría y del material. Al duplicar el voltaje se duplica la carga Q = CΔv y C se mantiene.",
    topic: "Capacitancia",
  },
  {
    id: 5,
    question: "Dos condensadores conectados en serie tienen siempre…",
    options: { A: "el mismo voltaje", B: "la misma carga", C: "la misma energía", D: "la misma capacitancia" },
    correctAnswer: "B",
    feedback: "En serie la carga es la misma en todos (la que sale de una placa llega a la siguiente). En paralelo lo que se comparte es el voltaje.",
    topic: "Condensadores en serie y paralelo",
  },
  {
    id: 6,
    question: "La energía de un condensador es U = ½CV². Si el voltaje se duplica, la energía…",
    options: { A: "se duplica", B: "se cuadruplica", C: "no cambia", D: "se reduce a la mitad" },
    correctAnswer: "B",
    feedback: "La energía depende del cuadrado del voltaje: (2V)² = 4V². Por eso un desfibrilador carga su condensador a miles de voltios.",
    topic: "Energía en condensadores",
  },
  {
    id: 7,
    question: "Dos resistencias iguales R conectadas en paralelo equivalen a…",
    options: { A: "2R", B: "R", C: "R/2", D: "R²" },
    correctAnswer: "C",
    feedback: "En paralelo: 1/Req = 1/R + 1/R = 2/R, entonces Req = R/2. La resistencia equivalente en paralelo siempre es menor que la menor de ellas.",
    topic: "Resistencias en serie y paralelo",
  },
  {
    id: 8,
    question: "En un circuito en serie, ¿qué tienen en común todos los elementos?",
    options: { A: "El mismo voltaje", B: "La misma corriente", C: "La misma potencia", D: "La misma resistencia" },
    correctAnswer: "B",
    feedback: "En serie hay un solo camino: la misma corriente pasa por todos los elementos y los voltajes se suman.",
    topic: "Circuitos en serie",
  },
  {
    id: 9,
    question: "Según R = ρL/A, si se usa un cable del mismo material con el doble de longitud y la misma sección, su resistencia…",
    options: { A: "se duplica", B: "se reduce a la mitad", C: "no cambia", D: "se cuadruplica" },
    correctAnswer: "A",
    feedback: "La resistencia es proporcional a la longitud e inversamente proporcional al área de la sección.",
    topic: "Resistividad",
  },
  {
    id: 10,
    question: "Con la convención del curso, al recorrer una malla y pasar por una resistencia en el mismo sentido de la corriente, el término es…",
    options: { A: "+IR", B: "−IR", C: "+ε", D: "0" },
    correctAnswer: "B",
    feedback: "A favor de la corriente el potencial cae: −IR. En contra de la corriente: +IR. En una fuente: de − a + es +ε y de + a − es −ε.",
    topic: "Leyes de Kirchhoff (signos)",
  },
  {
    id: 11,
    question: "Si la corriente ENTRA por el terminal + de una fuente, la fuente…",
    options: { A: "entrega potencia", B: "absorbe potencia (se está cargando)", C: "no tiene potencia", D: "se convierte en resistencia" },
    correctAnswer: "B",
    feedback: "Una fuente entrega potencia cuando la corriente sale por su +, y absorbe cuando entra por el +, como una batería que se recarga.",
    topic: "Potencia en fuentes",
  },
  {
    id: 12,
    question: "Un circuito tiene dos fuentes en ramas distintas. ¿Cómo se clasifica y cómo se resuelve?",
    options: { A: "Serie; sumando resistencias", B: "Paralelo; con un divisor de corriente", C: "No reducible; con las leyes de Kirchhoff", D: "Mixto; solo con la ley de Ohm" },
    correctAnswer: "C",
    feedback: "Con más de una fuente no hay una única resistencia equivalente vista por la fuente: se plantean ecuaciones de nodos y de mallas (Kirchhoff).",
    topic: "Clasificación de circuitos",
  },
];

export default function TestInteractivo() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [incorrectTopics, setIncorrectTopics] = useState([]);

  const handleSelectAnswer = (option) => {
    if (!isAnswered) {
      setSelectedAnswer(option);
    }
  };

  const handleVerify = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === QUESTIONS[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1);
    } else {
      // Agregar el tema a la lista de temas incorrectos
      setIncorrectTopics([...incorrectTopics, QUESTIONS[currentQuestion].topic]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      setTestFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setScore(0);
    setTestFinished(false);
    setIncorrectTopics([]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text("Plan de Estudio Personalizado", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const fecha = new Date().toLocaleDateString("es-ES");
    doc.text(`Fecha: ${fecha}`, margin, yPosition);
    yPosition += 6;
    doc.text("Electricidad y Magnetismo - Universidad del Magdalena", margin, yPosition);
    yPosition += 5;
    doc.text("Profesor: Jarvin Mestra Páez", margin, yPosition);
    yPosition += 5;
    doc.text("Desarrollado por: Juan Sebastian Martinez y Juan David Rivera", margin, yPosition);
    yPosition += 8;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Resultados
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Resultados del Test:", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    const percentage = Math.round((score / QUESTIONS.length) * 100);
    doc.text(
      `Puntuación: ${score}/${QUESTIONS.length} (${percentage}%)`,
      margin,
      yPosition
    );
    yPosition += 10;

    // Temas a estudiar
    if (incorrectTopics.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(210, 25, 25);
      doc.text("Temas que debes repasar:", margin, yPosition);
      yPosition += 8;

      // Temas únicos
      const uniqueTopics = [...new Set(incorrectTopics)];

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      uniqueTopics.forEach((topic, index) => {
        const text = `${index + 1}. ${topic}`;
        doc.text(text, margin + 5, yPosition);
        yPosition += 7;

        // Verificar si se necesita una nueva página
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
      });

      yPosition += 5;
    } else {
      doc.setFontSize(12);
      doc.setTextColor(25, 150, 25);
      doc.text(
        "¡Felicidades! No hay temas que repasar. ¡Excelente desempeño!",
        margin,
        yPosition
      );
      yPosition += 12;
    }

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Sugerencias
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Sugerencias de Estudio:", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    const suggestions = [
      "- Repasa la sección de Teoría: potencial, capacitancia, circuitos y Kirchhoff",
      "- Dibuja circuitos en el Montaje virtual y revisa la solución paso a paso",
      "- Resuelve los Ejercicios resueltos, abriendo cada inciso solo después de intentarlo",
      "- Mira las Aplicaciones en ingeniería para conectar las fórmulas con casos reales",
      "- Vuelve a hacer el test después de estudiar",
    ];

    suggestions.forEach((suggestion) => {
      const lines = doc.splitTextToSize(suggestion, maxWidth - 5);
      lines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
    });

    yPosition += 5;

    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Circuitos en Vivo - Test de Electricidad y Magnetismo",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Descargar PDF
    doc.save("Plan_de_Estudio.pdf");
  };

  if (testFinished) {
    return (
      <div className="test-container">
        <div className="test-results">
          <h2>¡Test Completado!</h2>
          <div className="results-card">
            <p className="score-text">Tu puntuación:</p>
            <p className="score-number">
              {score}/{QUESTIONS.length}
            </p>
            <p className="score-percentage">
              {Math.round((score / QUESTIONS.length) * 100)}%
            </p>
          </div>

          <div className="results-message">
            {score === QUESTIONS.length && (
              <p className="perfect">¡Excelente! Has dominado completamente el tema.</p>
            )}
            {score / QUESTIONS.length >= 0.8 && score < QUESTIONS.length && (
              <p className="good">¡Muy bien! Tienes un excelente desempeño.</p>
            )}
            {score / QUESTIONS.length >= 0.6 && score / QUESTIONS.length < 0.8 && (
              <p className="fair">Buen trabajo, pero hay algunos temas por repasar.</p>
            )}
            {score / QUESTIONS.length < 0.6 && (
              <p className="needs-improvement">Necesitas estudiar más estos temas.</p>
            )}
          </div>

          <div className="results-actions">
            {incorrectTopics.length > 0 && (
              <button className="btn-download" onClick={generatePDF}>
                 Descargar Plan de Estudio
              </button>
            )}
            <button className="btn-restart" onClick={handleRestart}>
              Reintentar Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="test-container">
      <div className="test-header">
        <h1>Test Interactivo: Electricidad y Magnetismo</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
            }}
          ></div>
        </div>
        <p className="progress-text">
          Pregunta {currentQuestion + 1} de {QUESTIONS.length}
        </p>
      </div>

      <div className="question-card">
        <h2 className="question-title">{question.question}</h2>

        <div className="options-container">
          {optionLetters.map((letter) => (
            <label
              key={letter}
              className={`option ${selectedAnswer === letter ? "selected" : ""} ${
                isAnswered && letter === question.correctAnswer ? "correct" : ""
              } ${
                isAnswered && selectedAnswer === letter && !isCorrect ? "incorrect" : ""
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={letter}
                checked={selectedAnswer === letter}
                onChange={() => handleSelectAnswer(letter)}
                disabled={isAnswered}
              />
              <span className="option-letter">{letter}</span>
              <span className="option-text">{question.options[letter]}</span>
            </label>
          ))}
        </div>

        {!isAnswered ? (
          <button
            className="btn-verify"
            onClick={handleVerify}
            disabled={selectedAnswer === null}
          >
            Verificar Respuesta
          </button>
        ) : (
          <div className={`feedback ${isCorrect ? "success" : "error"}`}>
            {isCorrect ? (
              <div className="feedback-correct">
                <p className="feedback-icon">✓</p>
                <p className="feedback-title">¡Correcto!</p>
                <p className="feedback-text">¡Felicidades! Has respondido correctamente.</p>
              </div>
            ) : (
              <div className="feedback-incorrect">
                <p className="feedback-icon">✗</p>
                <p className="feedback-title">Respuesta Incorrecta</p>
                <p className="feedback-topic">Tema a estudiar: {question.topic}</p>
                <p className="feedback-text">{question.feedback}</p>
              </div>
            )}
          </div>
        )}

        {isAnswered && (
          <button className="btn-next" onClick={handleNextQuestion}>
            {currentQuestion === QUESTIONS.length - 1 ? "Ver Resultados" : "Siguiente Pregunta"}
          </button>
        )}
      </div>
    </div>
  );
}
