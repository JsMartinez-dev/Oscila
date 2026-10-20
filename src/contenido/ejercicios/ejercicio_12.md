# Ejercicio 12

## Enunciado

Considere el circuito que se muestra en la figura con un voltaje de $50\,\mathrm{V}$ aplicados. Los valores de las resistencias son $R_1=100\,\Omega$, $R_2=50\,\Omega$, $R_3=R_4=200\,\Omega$.

a) Determine la resistencia equivalente del circuito y la corriente y la potencia entregada por la fuente.
b) Para cada una de las resistencias, determine el voltaje aplicado, la corriente que circula y la potencia disipada. Analice los resultados en términos de la conservación de la energía y la carga eléctrica.

## Solución
**Circuito original**

![Ejercicio 12 – figura 1](figuras/ej12_fig1.svg)

**Circuito 2** ($R_3\parallel R_4$)

![Ejercicio 12 – figura 2](figuras/ej12_fig2.svg)

**Circuito 3** ($R_2\parallel R_{34}$)

![Ejercicio 12 – figura 3](figuras/ej12_fig3.svg)

**Circuito 4** (serie)

![Ejercicio 12 – figura 4](figuras/ej12_fig4.svg)

> **Fórmulas:** serie: $R=R_a+R_b$ ;  paralelo: $R_{ab}=\dfrac{R_aR_b}{R_a+R_b}$ ;  $V=IR$ ;  $P=IV=I^2R=\dfrac{V^2}{R}$ ;  fuente: $P=\varepsilon I$

**Lectura de la figura:** $R_2$, $R_3$ (diagonal) y $R_4$ van del nodo $T$ al nodo $B$ $\Rightarrow$ en paralelo.

### a) Resistencia equivalente, corriente y potencia de la fuente

$$
\text{C. 2: } R_{34}=\frac{R_3R_4}{R_3+R_4}=\frac{(200)(200)}{400}=100\,\Omega
$$

$$
\text{C. 3: } R_{234}=\frac{R_2R_{34}}{R_2+R_{34}}=\frac{(50)(100)}{150}=33.3\,\Omega
$$

$$
\text{C. 4: } R_{eq}=R_1+R_{234}=100+33.3\ \Rightarrow\ \boxed{R_{eq}=133\,\Omega}
$$

$$
I=\frac{\varepsilon}{R_{eq}}=\frac{50}{133.3}\Rightarrow\boxed{I=0.375\,\mathrm{A}}
\qquad
P=\varepsilon I\Rightarrow\boxed{P=18.8\,\mathrm{W}}
$$

### b) Cada resistencia  (regreso: $R_1$ lleva $I$; el paralelo tiene $V_{TB}=IR_{234}$)

$$
V_1=IR_1=(0.375)(100)=37.5\,\mathrm{V},\qquad V_{TB}=IR_{234}=(0.375)(33.3)=12.5\,\mathrm{V}
$$

| $R$ ($\Omega$) | $\Delta V$ (V) | $I=V/R$ (A) | $P=IV$ (W) |
|---|---|---|---|
| $R_1=100$ | $37.5$ | $0.375$ | $14.1$ |
| $R_2=50$ | $12.5$ | $0.250$ | $3.13$ |
| $R_3=200$ | $12.5$ | $0.0625$ | $0.781$ |
| $R_4=200$ | $12.5$ | $0.0625$ | $0.781$ |
| **Suma** |  |  | $\mathbf{18.8}$ |

**Carga:** en el nodo $T$ entra $0.375\,\mathrm{A}$ y salen $0.250+0.0625+0.0625=0.375\,\mathrm{A}$. ✓  
**Energía:** $\sum P_R=18.75\,\mathrm{W}=P_{fuente}$; además $V_1+V_{TB}=37.5+12.5=50\,\mathrm{V}=\varepsilon$. ✓
