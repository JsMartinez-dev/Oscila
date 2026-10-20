# Ejercicio 9

## Enunciado

Para el circuito con condensadores mostrado en la figura, suponga que los puntos $a$ y $b$ se conectan a una fuente de $10\,\mathrm{V}$.

a) Determine la capacitancia equivalente entre los puntos $a$ y $b$.
b) Calcule la carga total y la energía total almacenada en el circuito.
c) Para cada uno de los condensadores, determine el voltaje aplicado, así como la carga y la energía almacenada. Analice la coherencia de los resultados.

## Solución
**Circuito original**

![Ejercicio 9 – figura 1](figuras/ej09_fig1.svg)

**Circuito 2** (vértice superior $=b$, inferior $=a$)

![Ejercicio 9 – figura 2](figuras/ej09_fig2.svg)

**Circuito 3** (serie $7.0$–$5.0$)

![Ejercicio 9 – figura 3](figuras/ej09_fig3.svg)

**Circuito 4** (paralelo)

![Ejercicio 9 – figura 4](figuras/ej09_fig4.svg)

> **Fórmulas:** serie: $\dfrac1{C_{eq}}=\dfrac1{C_a}+\dfrac1{C_b}$ ;  paralelo: $C_{eq}=C_a+C_b$ ;  $Q=C\,\Delta V$ ;  $U=\tfrac12Q\,V$

**Datos SI:** $C_4=4.0\times10^{-6}\,\mathrm{F}$,  $C_7=7.0\times10^{-6}\,\mathrm{F}$,  $C_5=5.0\times10^{-6}\,\mathrm{F}$,  $C_6=6.0\times10^{-6}\,\mathrm{F}$,  $V_{ab}=10\,\mathrm{V}$.

### a) Capacitancia equivalente

$$
C_{75}=\frac{C_7C_5}{C_7+C_5}=\frac{(7.0\times10^{-6})(5.0\times10^{-6})}{12.0\times10^{-6}}=2.92\times10^{-6}\,\mathrm{F}
$$

$$
C_{eq}=C_4+C_{75}+C_6=(4.0+2.92+6.0)\times10^{-6}\ \Rightarrow\ \boxed{C_{eq}=1.29\times10^{-5}\,\mathrm{F}=12.9\,\mu\mathrm{F}}
$$

### b) Carga y energía totales

$$
Q_t=C_{eq}V_{ab}=(1.292\times10^{-5})(10)\ \Rightarrow\ \boxed{Q_t=1.29\times10^{-4}\,\mathrm{C}}
$$

$$
U_t=\tfrac12Q_tV_{ab}=\tfrac12(1.292\times10^{-4})(10)\ \Rightarrow\ \boxed{U_t=6.46\times10^{-4}\,\mathrm{J}}
$$

### c) Cada condensador  (se regresa por los circuitos: paralelo $\to$ mismo $V$; serie $\to$ misma $Q$)

$Q_{75}=C_{75}V_{ab}=(2.917\times10^{-6})(10)=2.917\times10^{-5}\,\mathrm{C}$  para $C_7$ y $C_5$;   $V_7=\dfrac{Q_{75}}{C_7}$,  $V_5=\dfrac{Q_{75}}{C_5}$.

|  | $V$ (V) | $Q=CV$ (C) | $U=\tfrac12QV$ (J) |
|---|---|---|---|
| $4.0\,\mu\mathrm{F}$ | $10.0$ | $4.00\times10^{-5}$ | $2.00\times10^{-4}$ |
| $7.0\,\mu\mathrm{F}$ | $4.17$ | $2.92\times10^{-5}$ | $6.08\times10^{-5}$ |
| $5.0\,\mu\mathrm{F}$ | $5.83$ | $2.92\times10^{-5}$ | $8.51\times10^{-5}$ |
| $6.0\,\mu\mathrm{F}$ | $10.0$ | $6.00\times10^{-5}$ | $3.00\times10^{-4}$ |
| **Suma** |  | $1.29\times10^{-4}$ | $6.46\times10^{-4}$ |

**Coherencia:** $V_7+V_5=4.17+5.83=10\,\mathrm{V}$; la suma de cargas de las tres ramas da $Q_t$ y la suma de energías da $U_t$. ✓
