<!-- Sección: Resistencia y circuitos -->
# Ejercicio 11

## Enunciado

Considere el circuito que se muestra en la figura ($\varepsilon=48.0\,\mathrm{V}$).

a) Determine la resistencia equivalente del circuito y la corriente y la potencia entregada por la fuente.
b) Para cada una de las resistencias, determine el voltaje aplicado, la corriente que circula y la potencia disipada. Analice los resultados en términos de la conservación de la energía y la carga eléctrica.

## Solución
**Circuito original**

![Ejercicio 11 – figura 1](figuras/ej11_fig1.svg)

**Circuito 2** (serie)

![Ejercicio 11 – figura 2](figuras/ej11_fig2.svg)

**Circuito 3** (paralelo)

![Ejercicio 11 – figura 3](figuras/ej11_fig3.svg)

> **Fórmulas:** serie: $R=R_a+R_b$ ;  paralelo: $R_{ab}=\dfrac{R_aR_b}{R_a+R_b}$ ;  $V=IR$ ;  $P=IV=I^2R$ ;  fuente: $P=\varepsilon I$

### a) Resistencia equivalente, corriente y potencia de la fuente

$$
R_{13}=1.00+3.00=4.00\,\Omega,\qquad R_{75}=7.00+5.00=12.0\,\Omega
$$

$$
R_{eq}=\frac{R_{13}R_{75}}{R_{13}+R_{75}}=\frac{(4.00)(12.0)}{16.0}\ \Rightarrow\ \boxed{R_{eq}=3.00\,\Omega}
$$

$$
I_t=\frac{\varepsilon}{R_{eq}}=\frac{48.0}{3.00}\ \Rightarrow\ \boxed{I_t=16.0\,\mathrm{A}}
\qquad\qquad
P=\varepsilon I_t=(48.0)(16.0)\ \Rightarrow\ \boxed{P=768\,\mathrm{W}}
$$

### b) Cada resistencia  (regreso: en paralelo las dos ramas tienen $V_{AB}=48.0\,\mathrm{V}$)

$$
I_1=\frac{V_{AB}}{R_{13}}=\frac{48.0}{4.00}=12.0\,\mathrm{A},\qquad I_2=\frac{V_{AB}}{R_{75}}=\frac{48.0}{12.0}=4.00\,\mathrm{A}
$$

| $R$ ($\Omega$) | $I$ (A) | $V=IR$ (V) | $P=I^2R$ (W) |
|---|---|---|---|
| $1.00$ | $12.0$ | $12.0$ | $144$ |
| $3.00$ | $12.0$ | $36.0$ | $432$ |
| $7.00$ | $4.00$ | $28.0$ | $112$ |
| $5.00$ | $4.00$ | $20.0$ | $80.0$ |
| **Suma** |  |  | $\mathbf{768}$ |

**Conservación de la carga:** $I_1+I_2=12.0+4.00=16.0\,\mathrm{A}=I_t$.  ✓  
**Conservación de la energía:** $\sum P_R=768\,\mathrm{W}=P_{fuente}$; además $12.0+36.0=28.0+20.0=48.0\,\mathrm{V}$ en cada rama.  ✓
