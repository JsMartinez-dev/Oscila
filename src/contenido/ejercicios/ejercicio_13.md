# Ejercicio 13

## Enunciado

Considere el circuito que se muestra en la figura.

a) Determine la resistencia equivalente del circuito y la corriente y la potencia entregadas por la fuente.
b) Para cada una de las resistencias, determine el voltaje aplicado, la corriente que circula y la potencia disipada. Analice los resultados en términos de la conservación de la energía y la carga eléctrica.
c) Determine la diferencia de potencial entre los puntos $a$ y $b$, así como la corriente que circula por cada uno de estos puntos.

## Solución
**Circuito original**

![Ejercicio 13 – figura 1](figuras/ej13_fig1.svg)

**Circuito 2** ($5.00+20.0$ en serie)

![Ejercicio 13 – figura 2](figuras/ej13_fig2.svg)

**Circuito 3** (tres ramas en paralelo)

![Ejercicio 13 – figura 3](figuras/ej13_fig3.svg)

**Circuito 4** (serie)

![Ejercicio 13 – figura 4](figuras/ej13_fig4.svg)

> **Fórmulas:** serie: $R=R_a+R_b$ ;  paralelo: $\dfrac1{R_{ab}}=\dfrac1{R_a}+\dfrac1{R_b}$ ;  $V=IR$ ;  $P=I^2R=\dfrac{V^2}{R}$ ;  fuente: $P=\varepsilon I$

### a) Resistencia equivalente, corriente y potencia de la fuente

$$
R_{ext}=5.00+20.0=25.0\,\Omega,\qquad \frac1{R_p}=\frac1{10.0}+\frac1{5.00}+\frac1{25.0}=0.340\ \Omega^{-1}\Rightarrow R_p=2.94\,\Omega
$$

$$
R_{eq}=10.0+2.94\Rightarrow\boxed{R_{eq}=12.9\,\Omega}\qquad
I=\frac{\varepsilon}{R_{eq}}=\frac{25.0}{12.94}\Rightarrow\boxed{I=1.93\,\mathrm{A}}
$$

$$
P=\varepsilon I=(25.0)(1.932)\Rightarrow\boxed{P=48.3\,\mathrm{W}}
$$

### b) Cada resistencia  (regreso: $V_p=IR_p=(1.932)(2.941)=5.68\,\mathrm{V}$ en las tres ramas)

| Resistencia | $I$ (A) | $\Delta V$ (V) | $P$ (W) |
|---|---|---|---|
| $10.0\,\Omega$ (con la fuente) | $1.93$ | $19.3$ | $37.3$ |
| $10.0\,\Omega$ (centro) | $5.68/10.0=0.568$ | $5.68$ | $3.23$ |
| $5.00\,\Omega$ (interna) | $5.68/5.00=1.14$ | $5.68$ | $6.46$ |
| $5.00\,\Omega$ (externa) | $5.68/25.0=0.227$ | $1.14$ | $0.258$ |
| $20.0\,\Omega$ (externa) | $0.227$ | $4.55$ | $1.03$ |
| **Suma** |  |  | $\mathbf{48.3}$ |

**Carga:** $0.568+1.14+0.227=1.93\,\mathrm{A}=I$. ✓  
**Energía:** $\sum P_R=48.3\,\mathrm{W}=P_{fuente}$,  $19.3+5.68=25.0\,\mathrm{V}$. ✓

### c) $V_{ab}$ y corriente en los puntos $a$ y $b$

$a$ y $b$ están en el cable del camino externo ($5.00+20.0\,\Omega$), así que por ellos pasa $I_{ext}=0.227\,\mathrm{A}$. Como el $+$ de la fuente está hacia el lado de $b$, la corriente va del nodo derecho al izquierdo por las tres ramas: por el camino externo pasa por $b$, baja por $20.0\,\Omega$, sube por $5.00\,\Omega$ y pasa por $a$. Por eso $V_b>V_a$:

$$
\boxed{|V_{ab}|=5.68\,\mathrm{V}\ \ (V_b>V_a,\ \text{es decir } V_a-V_b=-5.68\,\mathrm{V})}\qquad \boxed{I_a=I_b=0.227\,\mathrm{A}}
$$
