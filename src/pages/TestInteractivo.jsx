import { useState } from "react";
import jsPDF from "jspdf";
import "../pages/TestInteractivo.css";
import { PREGUNTAS as QUESTIONS } from "../contenido/test.js";
import { EYM, PLATAFORMA, listaNombres } from "../contenido/creditos.js";

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
    doc.text(`${EYM.modulo} - ${EYM.universidad}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Profesor: ${EYM.profesor}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Desarrollado por: ${listaNombres(EYM.desarrolladores)}`, margin, yPosition);
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
      `${PLATAFORMA.nombre} - Test de ${EYM.modulo}`,
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
