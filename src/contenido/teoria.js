// Teoría de la plataforma, tomada de la hoja maestra de fórmulas del curso (paquete_EyM/Hoja_maestra_de_formulas.pdf).

export const TEORIA = [
  {
    id: 'potencial',
    titulo: 'Potencial eléctrico',
    resumen: 'Diferencia de potencial, potencial de cargas puntuales y distribuciones, energía y campo a partir del potencial.',
    md: String.raw`
> **Notación estándar:** En los libros de texto de física se utiliza $V$ mayúscula para el potencial eléctrico y $\Delta V$ para la diferencia de potencial (voltaje), reservando la $v$ minúscula para la rapidez o velocidad de las partículas, evitando confusiones en problemas donde conviven ambas variables (como en conservación de la energía, $q\Delta V = \frac12 m v^2$).

**Definición.** La diferencia de potencial entre $a$ y $b$ es el trabajo por unidad de carga que hace falta contra el campo:

$$
\Delta V=-\int_a^b\vec E\cdot d\vec s
$$

**Campo homogéneo:**

$$
\Delta V=-E\,\Delta s\cos\theta=-Ed
$$

**Carga puntual:**

$$
\Delta V=-K_eq\int_{r_a}^{r_b}\frac{dr}{r^2}=K_eq\left(\frac1{r_b}-\frac1{r_a}\right)
$$

Con $V=0$ en el infinito:

$$
V=\frac{K_eq}{r},\qquad K_e=\frac1{4\pi\varepsilon_0}\approx9\times10^9\ \mathrm{N\,m^2/C^2}
$$

**Sistema de cargas puntuales y distribuciones continuas** (superposición):

$$
V(\vec r)=\sum_{i=1}^N\frac{K_eq_i}{r_i},\qquad V(\vec r)=\int\frac{K_e\,dq}{r},\qquad dq=\lambda\,dl=\sigma\,dA=\rho\,dV
$$

**Energía y trabajo.** El potencial es energía por unidad de carga:

$$
V=\frac{U}{q},\qquad U=qV,\qquad W_{a\to b}=-\Delta U=q(V_a-V_b)
$$

**Campo a partir del potencial:**

$$
dV=-\vec E\cdot d\vec s,\qquad E_x=-\frac{\partial V}{\partial x},\ \ E_y=-\frac{\partial V}{\partial y},\ \ E_z=-\frac{\partial V}{\partial z}\quad\Longleftrightarrow\quad \vec E=-\nabla V
$$

En coordenadas polares: $E_r=-\dfrac{\partial V}{\partial r}$ y $E_\theta=-\dfrac1r\dfrac{\partial V}{\partial\theta}$.

> El campo $\vec E$ siempre es perpendicular a las superficies equipotenciales: mover una carga sobre una de ellas no cuesta trabajo.

**Casos útiles.** Dipolo ($p=2qa$): $V=\dfrac{K_ep\cos\theta}{r^2}$, $E_r=\dfrac{2K_ep\cos\theta}{r^3}$, $E_\theta=\dfrac{K_ep\sin\theta}{r^3}$. Arco de radio $R$ con $\lambda$ uniforme, en su centro: $V=\dfrac{K_eQ}{R}$.
`,
  },
  {
    id: 'capacitancia',
    titulo: 'Capacitancia',
    resumen: 'Definición, energía almacenada, condensadores en serie y en paralelo, geometrías básicas.',
    md: String.raw`
**Definición.** Un condensador guarda carga $Q$ en sus placas cuando entre ellas hay una diferencia de potencial $\Delta V$:

$$
C=\frac{Q}{\Delta V}\qquad\Rightarrow\qquad Q=C\,\Delta V,\qquad \Delta V=\frac QC
$$

**Energía almacenada:**

$$
U=\tfrac12Q\,V=\tfrac12C\,V^2=\tfrac12\frac{Q^2}{C}
$$

**Serie** (misma carga $Q$ en todos):

$$
\frac1{C_{eq}}=\frac1{C_a}+\frac1{C_b}\qquad\Longleftrightarrow\qquad C_{ab}=\frac{C_aC_b}{C_a+C_b}
$$

**Paralelo** (mismo voltaje en todos):

$$
C_{eq}=C_a+C_b
$$

**Redes de condensadores** (6 pasos): se combina hasta un equivalente, $Q_t=C_{eq}V_{AB}$, $U_t=\tfrac12Q_tV_{AB}$ y se regresa por cada diagrama (serie: misma $Q$; paralelo: mismo $V$).

**Método de capacitancia** (4 pasos): dibujo; $\vec E$ con Gauss; $\Delta V=-\int\vec E\cdot d\vec s$; $C=Q/\Delta V$.

| Geometría | Capacitancia |
|---|---|
| Placas paralelas | $C=\dfrac{\varepsilon_0A}{d}$ |
| Cilíndrico (radios $a<b$, largo $L$) | $C=\dfrac{2\pi\varepsilon_0L}{\ln(b/a)}$ |
| Esférico (radios $a<b$) | $C=\dfrac{4\pi\varepsilon_0ab}{b-a}$ |

$\varepsilon_0=8.85\times10^{-12}\ \mathrm{C^2/(N\,m^2)}$.
`,
  },
  {
    id: 'circuitos',
    titulo: 'Resistencia y circuitos',
    resumen: 'Ley de Ohm, resistividad, resistencias en serie y paralelo, potencia y reducción de redes.',
    md: String.raw`
**Ley de Ohm:**

$$
V=IR,\qquad I=\frac{Q}{t},\qquad [I]=\mathrm{C/s}=\mathrm{A},\quad [R]=\Omega
$$

**Resistencia de un conductor** de largo $L$, sección $A$ y resistividad $\rho$:

$$
R=\rho\frac{L}{A}
$$

**Serie** (misma corriente):

$$
R_{ab}=R_a+R_b
$$

**Paralelo** (mismo voltaje):

$$
\frac1{R_{ab}}=\frac1{R_a}+\frac1{R_b}\qquad\Longleftrightarrow\qquad R_{ab}=\frac{R_aR_b}{R_a+R_b}
$$

**Potencia:**

$$
P=IV=I^2R=\frac{V^2}{R}
$$

En una fuente, $P=\varepsilon I$: **entrega** potencia si la corriente sale por su terminal $+$ y **absorbe** si entra por el $+$.

**Redes de resistencias** (6 pasos): se combina hasta $R_{eq}$, $I_t=\dfrac{V_{AB}}{R_{eq}}$, $P_t=I_tV_{AB}$ y se regresa por cada diagrama (serie: misma $I$; paralelo: mismo $V$).

**Clasificación** que usa el montaje virtual:

- **Serie:** todos los elementos llevan la misma corriente.
- **Paralelo:** todos están entre los mismos dos nodos.
- **Mixto:** se reduce con combinaciones serie/paralelo.
- **No reducible:** hay puentes o varias fuentes; se resuelve con Kirchhoff.
`,
  },
  {
    id: 'kirchhoff',
    titulo: 'Leyes de Kirchhoff',
    resumen: 'Ley de nodos, ley de mallas y la convención de signos del curso.',
    md: String.raw`
**Ley de nodos** (conservación de la carga):

$$
\sum I_{entrando}=\sum I_{saliendo}
$$

**Ley de espiras o mallas** (conservación de la energía):

$$
\sum_{espira}V=0
$$

**Convención de signos** al recorrer una malla:

| Elemento | Recorrido | Término |
|---|---|---|
| Resistencia | a favor de la corriente $I$ | $-IR$ |
| Resistencia | en contra de la corriente $I$ | $+IR$ |
| Fuente | de $-$ a $+$ (sale por el positivo) | $+\varepsilon$ |
| Fuente | de $+$ a $-$ (entra por el positivo) | $-\varepsilon$ |

**Cuántas ecuaciones.** Con $n$ nodos principales y $r$ ramas (una corriente desconocida por rama): $(n-1)$ ecuaciones de nodo y $(r-n+1)$ ecuaciones de malla.

**Pasos con Kirchhoff:**

1. Diagrama con todo numerado: nodos, ramas, sentidos supuestos de las corrientes y sentido de recorrido de cada malla.
2. Plantear las ecuaciones de nodo y de malla, marcando cada punto usado.
3. Resolver el sistema. Una corriente negativa significa que el sentido real es el contrario al supuesto.
4. Calcular corriente, voltaje y potencia en cada resistencia; corriente y potencia de cada fuente (¿entrega o absorbe?).
5. Comprobar: la carga se conserva en cada nodo y la potencia entregada es igual a la disipada más la absorbida.

**Unidades para comprobar:** $\mathrm{V}=\mathrm{J/C}$, $\mathrm{F}=\mathrm{C/V}$, $\Omega=\mathrm{V/A}$, $\mathrm{W}=\mathrm{J/s}=\mathrm{V\,A}$, $\mathrm{N/C}=\mathrm{V/m}$.
`,
  },
];
