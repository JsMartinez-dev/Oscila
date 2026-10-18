import { useState } from "react";
import { PREGUNTAS as QUESTIONS } from "../../contenido/calor-ondas/test.js";
import { CREDITOS_CALOR_ONDAS as CREDITOS } from "../../contenido/calor-ondas/creditos.js";
import { PLATAFORMA } from "../../contenido/creditos.js";
import BannerRevision from "./BannerRevision.jsx";
import "../TestInteractivo.css";
import "./CalorOndas.css";

export default function Test() {
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

  // "A, B y C": une los nombres como se lee en español.
  const unirNombres = (lista) =>
    lista.length > 1 ? `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}` : lista[0] || "";

  // El PDF se carga solo al descargarlo: así jsPDF no pesa en la carga inicial.
  const generatePDF = async () => {
    const { generarPlanPDF } = await import("../../contenido/planEstudioPdf.js");
    await generarPlanPDF({
      puntaje: score,
      total: QUESTIONS.length,
      temasFallados: incorrectTopics,
      modulo: "Calor y Ondas",
      universidad: CREDITOS.universidad,
      profesor: CREDITOS.profesor,
      desarrolladores: unirNombres(CREDITOS.integrantes),
      plataforma: PLATAFORMA.nombre,
      pie: `${PLATAFORMA.nombre} - Test de Oscilaciones y Movimiento Armónico Simple`,
      sugerencias: [
        "Revisa los conceptos fundamentales en el Marco Conceptual.",
        "Utiliza los Ejemplos de Ingeniería para ver aplicaciones prácticas.",
        "Practica con los Simuladores de Péndulo y Resorte.",
        "Completa los Ejercicios prácticos del tema.",
        "Realiza el test nuevamente después de estudiar.",
      ],
    });
  };

  if (testFinished) {
    return (
      <div className="test-container">
        <BannerRevision />
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
            {score >= 8 && score < QUESTIONS.length && (
              <p className="good">¡Muy bien! Tienes un excelente desempeño.</p>
            )}
            {score >= 6 && score < 8 && (
              <p className="fair">Buen trabajo, pero hay algunos temas por repasar.</p>
            )}
            {score < 6 && (
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
      <BannerRevision />
      <div className="test-header">
        <h1 >Test Interactivo: Oscilaciones y Movimiento Armónico Simple</h1>
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
