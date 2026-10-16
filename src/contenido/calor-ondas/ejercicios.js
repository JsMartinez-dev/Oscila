// Ejercicios de Calor y Ondas

export const EJERCICIOS = [
  {
    id: 1,
    titulo: "Movimiento Armónico Simple (M.A.S.)",
    icono: "∿",
    boceto: "ejercicio-1",
    contexto: "Un bloque oscila sobre una superficie sin fricción unido a un resorte. Se utiliza una lámpara estroboscópica para observar el movimiento y determinar los parámetros característicos del MAS, incluyendo posición, velocidad, aceleración y energía.",
    problema: "Un bloque de masa m = 0.50 kg está unido a un resorte de k = 200 N/m y oscila sobre una superficie sin fricción. Una lámpara estroboscópica produce 6000 destellos por minuto. Se observa que el bloque pasa por su elongación máxima positiva en los destellos 1 y 6, sin otros máximos entre ellos. La amplitud es A = 8.0 cm. Calcule: (a) período y frecuencia; (b) ecuación de posición con t=0 en elongación máxima; (c) velocidad y aceleración máximas; (d) posición, velocidad y aceleración en T/4; (e) energía mecánica total.",
    formulas: [
      {
        nombre: "Frecuencia angular",
        formula: "\\omega = \\sqrt{\\frac{k}{m}}",
        variables: [
          { symbol: "ω", desc: "Frecuencia angular (rad/s)" },
          { symbol: "k", desc: "Constante del resorte (N/m)" },
          { symbol: "m", desc: "Masa (kg)" },
        ]
      },
      {
        nombre: "Período desde observación estroboscópica",
        formula: "T = n \\cdot \\Delta t",
        variables: [
          { symbol: "T", desc: "Período (s)" },
          { symbol: "n", desc: "Número de intervalos entre máximos" },
          { symbol: "Δt", desc: "Intervalo de tiempo entre destellos (s)" },
        ]
      },
      {
        nombre: "Ecuación de posición (MAS)",
        formula: "x(t) = A \\cos(\\omega t + \\varphi)",
        variables: [
          { symbol: "x(t)", desc: "Posición en función del tiempo (m)" },
          { symbol: "A", desc: "Amplitud (m)" },
          { symbol: "φ", desc: "Fase inicial (rad)" },
        ]
      },
      {
        nombre: "Velocidad en MAS",
        formula: "v(t) = -A\\omega \\sin(\\omega t + \\varphi)",
        variables: [
          { symbol: "v(t)", desc: "Velocidad (m/s)" },
          { symbol: "v_{max}", desc: "Velocidad máxima = Aω (m/s)" },
        ]
      },
      {
        nombre: "Aceleración en MAS",
        formula: "a(t) = -A\\omega^2 \\cos(\\omega t + \\varphi)",
        variables: [
          { symbol: "a(t)", desc: "Aceleración (m/s²)" },
          { symbol: "a_{max}", desc: "Aceleración máxima = Aω² (m/s²)" },
        ]
      },
      {
        nombre: "Energía mecánica total",
        formula: "E = \\frac{1}{2}kA^2",
        variables: [
          { symbol: "E", desc: "Energía mecánica (J)" },
          { symbol: "k", desc: "Constante del resorte (N/m)" },
          { symbol: "A", desc: "Amplitud (m)" },
        ]
      },
    ],
    procedimiento: [
      "Paso 1: Datos - m = 0.50 kg, k = 200 N/m, A = 8.0 cm = 0.08 m, 6000 destellos/min, máximos en destellos 1 y 6",
      "Paso 2: Frecuencia de destellos = 6000/60 = 100 destellos/s; Δt = 1/100 = 0.01 s entre destellos",
      "Paso 3: Período - Entre destellos 1 y 6 hay 5 intervalos, entonces T = 5 × 0.01 = 0.05 s",
      "Paso 4: Frecuencia - f = 1/T = 1/0.05 = 20 Hz",
      "Paso 5: Frecuencia angular - ω = √(k/m) = √(200/0.50) = √400 = 20 rad/s",
      "Paso 6: Ecuación de posición - Como comienza en elongación máxima positiva, φ = 0: x(t) = 0.08 cos(20t) m",
      "Paso 7: Velocidad máxima - v_max = ωA = 20 × 0.08 = 1.6 m/s",
      "Paso 8: Aceleración máxima - a_max = ω²A = 400 × 0.08 = 32 m/s²",
      "Paso 9: En t = T/4 = π/40 s ≈ 0.0785 s: x(T/4) = 0.08 cos(π/2) = 0 m; v(T/4) = -1.6 sin(π/2) = -1.6 m/s; a(T/4) = -32 cos(π/2) = 0 m/s²",
      "Paso 10: Energía mecánica - E = (1/2)kA² = (1/2)(200)(0.08)² = 0.64 J (constante sin fricción)",
    ],
    resultados: {
      periodo: "T = 0.05 s",
      frecuencia: "f = 20 Hz",
      frecuenciaAngular: "ω = 20 rad/s",
      ecuacionPosicion: "x(t) = 0.08 cos(20t) m",
      velocidadMaxima: "v_max = 1.6 m/s",
      aceleracionMaxima: "a_max = 32 m/s²",
      posicionEnT4: "x(T/4) = 0 m",
      velocidadEnT4: "v(T/4) = -1.6 m/s",
      aceleracionEnT4: "a(T/4) = 0 m/s²",
      energiaMecanica: "E = 0.64 J"
    },
    interpretacion: "El bloque realiza 20 oscilaciones por segundo con período de 0.05 s. La técnica estroboscópica permite observar que los máximos de amplitud ocurren cada 5 destellos, confirmando el período calculado. En un cuarto de período, el bloque pasa por el equilibrio con velocidad máxima negativa (−1.6 m/s) y aceleración nula. La energía mecánica de 0.64 J se mantiene constante, distribuyéndose entre energía cinética y potencial elástica a lo largo del movimiento."
  },
  {
    id: 2,
    titulo: "Ley de Hooke",
    icono: "⚙",
    boceto: "ejercicio-2",
    contexto: "Un resorte se deforma bajo la aplicación de una fuerza. Usamos la Ley de Hooke para relacionar la deformación con la fuerza aplicada.",
    problema: "Un resorte se estira 0.15 m cuando se cuelga de él una masa de 2 kg. ¿Cuál es la constante de elasticidad del resorte? ¿Cuánto se estiraría si se cuelga una masa de 5 kg?",
    formulas: [
      {
        nombre: "Ley de Hooke",
        formula: "F = k \\cdot x",
        variables: [
          { symbol: "F", desc: "Fuerza elástica (N)" },
          { symbol: "k", desc: "Constante de elasticidad (N/m)" },
          { symbol: "x", desc: "Deformación (m)" },
        ]
      },
      {
        nombre: "Equilibrio vertical",
        formula: "mg = kx \\Rightarrow k = \\frac{mg}{x}",
        variables: [
          { symbol: "m", desc: "Masa (kg)" },
          { symbol: "g", desc: "Aceleración gravitatoria (9.8 m/s²)" },
        ]
      },
    ],
    procedimiento: [
      "1. Datos iniciales: m₁ = 2 kg, x₁ = 0.15 m, g = 9.8 m/s²",
      "2. En equilibrio, la fuerza del peso iguala la fuerza elástica: mg = kx",
      "3. Despejamos k: k = mg/x = (2 × 9.8)/0.15 = 19.6/0.15 = 130.67 N/m",
      "4. Para la segunda masa (m₂ = 5 kg): x₂ = m₂g/k = (5 × 9.8)/130.67 = 49/130.67 = 0.375 m",
    ],
    resultados: {
      constanteK: "130.67 N/m",
      estiramiento5kg: "0.375 m",
    },
    interpretacion: "La constante del resorte es de 130.67 N/m, lo que significa que se requiere una fuerza de 130.67 N para estirarlo 1 metro. Con una masa de 5 kg, el resorte se estiraría 37.5 cm, el doble que con 2 kg, debido a la proporcionalidad directa."
  },
  {
    id: 3,
    titulo: "Período del Sistema Masa-Resorte",
    icono: "⏱",
    boceto: "ejercicio-3",
    contexto: "Determinamos el período de oscilación de una masa acoplada a un resorte, un parámetro crucial para entender el movimiento oscilatorio.",
    problema: "Un sistema masa-resorte tiene una masa de 0.8 kg acoplada a un resorte con constante k = 320 N/m. ¿Cuál es el período de oscilación? ¿Cuántas oscilaciones completa en 10 segundos?",
    formulas: [
      {
        nombre: "Período del sistema masa-resorte",
        formula: "T = 2\\pi\\sqrt{\\frac{m}{k}}",
        variables: [
          { symbol: "T", desc: "Período (s)" },
          { symbol: "m", desc: "Masa (kg)" },
          { symbol: "k", desc: "Constante del resorte (N/m)" },
          { symbol: "π", desc: "Pi ≈ 3.14159" },
        ]
      },
      {
        nombre: "Número de oscilaciones",
        formula: "N = \\frac{t_{total}}{T}",
        variables: [
          { symbol: "N", desc: "Número de oscilaciones" },
          { symbol: "t_total", desc: "Tiempo total (s)" },
        ]
      },
    ],
    procedimiento: [
      "1. Datos: m = 0.8 kg, k = 320 N/m, t_total = 10 s",
      "2. Calculamos el período: T = 2π√(m/k) = 2π√(0.8/320)",
      "3. T = 2π√(0.0025) = 2π × 0.05 = 0.314 s",
      "4. Número de oscilaciones en 10 s: N = 10/0.314 = 31.83 oscilaciones",
    ],
    resultados: {
      periodo: "0.314 s",
      oscilacionesEn10s: "31.83 oscilaciones"
    },
    interpretacion: "El sistema completa 31.83 oscilaciones en 10 segundos. Esto significa que cada segundo el sistema oscila alrededor de 3.18 veces, con un período individual de 0.314 segundos."
  },
  {
    id: 4,
    titulo: "Péndulo Simple",
    icono: "⛓",
    boceto: "ejercicio-4",
    contexto: "Analizamos el movimiento de un péndulo simple, donde una masa oscila bajo la influencia de la gravedad, suspendida de un hilo inextensible.",
    problema: "Un péndulo simple tiene una cuerda de 1 metro de largo y oscila en un lugar donde g = 9.8 m/s². Calcula el período de oscilación. ¿Cuánto tiempo tarda en realizar 20 oscilaciones completas?",
    formulas: [
      {
        nombre: "Período del péndulo simple",
        formula: "T = 2\\pi\\sqrt{\\frac{L}{g}}",
        variables: [
          { symbol: "T", desc: "Período (s)" },
          { symbol: "L", desc: "Longitud de la cuerda (m)" },
          { symbol: "g", desc: "Aceleración gravitatoria (9.8 m/s²)" },
        ]
      },
      {
        nombre: "Tiempo para N oscilaciones",
        formula: "t = N \\cdot T",
        variables: [
          { symbol: "t", desc: "Tiempo total (s)" },
          { symbol: "N", desc: "Número de oscilaciones" },
        ]
      },
    ],
    procedimiento: [
      "1. Datos: L = 1 m, g = 9.8 m/s², N = 20 oscilaciones",
      "2. Calculamos el período: T = 2π√(L/g) = 2π√(1/9.8)",
      "3. T = 2π√(0.102) = 2π × 0.319 = 2.006 s ≈ 2 s",
      "4. Tiempo para 20 oscilaciones: t = 20 × 2 = 40 segundos",
    ],
    resultados: {
      periodo: "2 s",
      tiempoOscilaciones: "40 s"
    },
    interpretacion: "El péndulo realiza una oscilación completa cada 2 segundos, por lo que 20 oscilaciones toman 40 segundos. Este resultado es independiente de la masa del péndulo y solo depende de su longitud y la gravedad local."
  },
  {
    id: 5,
    titulo: "Análisis de Resonancia",
    icono: "📡",
    boceto: "ejercicio-5",
    contexto: "En una planta de manufactura se instala una prensa de estampado sobre un sistema de soportes elásticos. El sistema es excitado por una máquina cercana que genera vibración. Este problema es crítico para la ingeniería, ya que la resonancia puede amplificar significativamente las vibraciones.",
    problema: "Una prensa de estampado de masa 600 kg está sobre soportes elásticos con rigidez de 240000 N/m y amortiguamiento de 2000 N·s/m. Una máquina cercana genera una fuerza vibratoria de amplitud 1500 N con frecuencia de 3.2 Hz. Determine la frecuencia natural, factor de amortiguamiento, frecuencia de resonancia, si trabaja cerca de resonancia, y la amplitud de vibración.",
    formulas: [
      {
        nombre: "Frecuencia natural",
        formula: "\\omega_n = \\sqrt{\\frac{k}{m}}",
        variables: [
          { symbol: "ω_n", desc: "Frecuencia natural (rad/s)" },
          { symbol: "k", desc: "Rigidez equivalente (N/m)" },
          { symbol: "m", desc: "Masa (kg)" },
        ]
      },
      {
        nombre: "Factor de amortiguamiento",
        formula: "\\zeta = \\frac{c}{2m\\omega_n}",
        variables: [
          { symbol: "ζ", desc: "Factor de amortiguamiento (adimensional)" },
          { symbol: "c", desc: "Coeficiente de amortiguamiento (N·s/m)" },
        ]
      },
      {
        nombre: "Frecuencia de resonancia",
        formula: "\\omega_r = \\omega_n\\sqrt{1 - 2\\zeta^2}",
        variables: [
          { symbol: "ω_r", desc: "Frecuencia de resonancia (rad/s)" },
        ]
      },
      {
        nombre: "Frecuencia angular de excitación",
        formula: "\\omega = 2\\pi f",
        variables: [
          { symbol: "ω", desc: "Frecuencia angular (rad/s)" },
          { symbol: "f", desc: "Frecuencia (Hz)" },
        ]
      },
      {
        nombre: "Amplitud de vibración",
        formula: "X = \\frac{F_0}{\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}}",
        variables: [
          { symbol: "X", desc: "Amplitud (m)" },
          { symbol: "F_0", desc: "Amplitud de la fuerza (N)" },
        ]
      },
    ],
    procedimiento: [
      "Paso 1: Datos iniciales - m = 600 kg, k = 240000 N/m, c = 2000 N·s/m, F₀ = 1500 N, f = 3.2 Hz",
      "Paso 2: Frecuencia natural ωₙ = √(240000/600) = √400 = 20 rad/s → fₙ = 20/6.2832 = 3.18 Hz",
      "Paso 3: Factor de amortiguamiento ζ = 2000/[2(600)(20)] = 2000/24000 = 0.083",
      "Paso 4: Frecuencia de resonancia ωᵣ = 20√(1-2(0.083)²) = 20√(0.9862) = 19.86 rad/s → fᵣ = 3.16 Hz",
      "Paso 5: Verificación de resonancia: |3.20 - 3.16| = 0.04 Hz → El sistema trabaja CERCA DE RESONANCIA",
      "Paso 6: Frecuencia angular de excitación ω = 2π(3.2) = 20.11 rad/s",
      "Paso 7: Cálculo de amplitud - (k - mω²)² = (240000 - 242646)² = 7001316; (cω)² = 1617648400; X = 1500/40306.9 = 0.0372 m",
      "Paso 8: Amplitud en centímetros = 3.72 cm",
    ],
    resultados: {
      frecuenciaNatural: "3.18 Hz (20 rad/s)",
      factorAmortiguamiento: "0.083",
      frecuenciaResonancia: "3.16 Hz (19.86 rad/s)",
      frecuenciaExcitacion: "3.20 Hz (20.11 rad/s)",
      amplitudVibracion: "0.0372 m (3.72 cm)",
      condicionDelSistema: "Cerca de resonancia"
    },
    interpretacion: "El sistema trabaja muy cerca de su frecuencia de resonancia (3.20 Hz vs 3.16 Hz). Esto causa una amplificación importante de la vibración, alcanzando 3.72 cm de amplitud. En ingeniería, esta situación es crítica y requiere acción: rediseñar la rigidez de los soportes, aumentar el amortiguamiento, o aislar la fuente de vibración para evitar daños estructurales y fatiga del material."
  },
];
