# Ejercicio 15

## Enunciado

Determine la corriente, el voltaje y la potencia disipada en cada una de las resistencias del circuito mostrado en la figura. Asimismo, determine la potencia entregada o absorbida por cada una de las fuentes. Analice los resultados con base en los principios de conservación de la energía y de la carga eléctrica.

## Solución
![Ejercicio 15 – figura 1](figuras/ej15_fig1.svg)

Nodos: superior ($a$–$b$–$c$–$d$) e inferior ($e$–$f$–$g$–$h$). Supuesto: $I_1$ baja por $200\,\Omega$; $I_2$, $I_3$, $I_4$ suben. Mallas en sentido horario. Se usa $360\,\mathrm{V}$ (valor impreso).

> **Fórmulas:** Nodos: $\sum I_{entra}=\sum I_{sale}$ ;  Mallas: $\sum V=0$ ;  $R$ con $I$: $-IR$, contra $I$: $+IR$ ; fuente $-\to+$: $+\varepsilon$,  $+\to-$: $-\varepsilon$ ;  $P=I^2R$ ;  $P=\varepsilon I$
>
> Ecuaciones: $(\text{nodos}-1)=1$ de nodo y $3$ de malla para las 4 corrientes.

### Sistema de ecuaciones

$$
\text{Nodo superior:} \quad I_2+I_3+I_4=I_1 \tag{1}
$$
$$
M_1\ (h\to a\to b\to g\to h): \quad +200I_1-40+80I_2=0 \tag{2}
$$
$$
M_2\ (g\to b\to c\to f\to g): \quad -80I_2+40+360+20I_3=0 \tag{3}
$$
$$
M_3\ (f\to c\to d\to e\to f): \quad -20I_3-360-80+70I_4=0 \tag{4}
$$

### Solución

De (2): $I_1=\dfrac{40-80I_2}{200}$;  de (3): $I_3=\dfrac{80I_2-400}{20}=4I_2-20$;  de (4): $I_4=\dfrac{440+20I_3}{70}=\dfrac{40+80I_2}{70}$.  
En (1), multiplicando por 1400:

$$
1400(I_2+4I_2-20)+20(40+80I_2)=7(40-80I_2)
$$

$$
7000I_2-28000+800+1600I_2=280-560I_2\ \Rightarrow\ 9160I_2=27480
$$

$$
\boxed{I_2=3.00\,\mathrm{A}}\ \boxed{I_1=\frac{40-240}{200}=-1.00\,\mathrm{A}}\ \boxed{I_3=12-20=-8.00\,\mathrm{A}}\ \boxed{I_4=\frac{40+240}{70}=4.00\,\mathrm{A}}
$$

Signos negativos: por $200\,\Omega$ la corriente realmente **sube** ($1.00\,\mathrm{A}$) y por la rama de $360\,\mathrm{V}$ realmente **baja** ($8.00\,\mathrm{A}$).

| Elemento | $I$ (A) | $V$ (V) | $P$ (W) |
|---|---|---|---|
| $200\,\Omega$ | $1.00$ | $200$ | $200$ |
| $80\,\Omega$ | $3.00$ | $240$ | $720$ |
| $20\,\Omega$ | $8.00$ | $160$ | $1280$ |
| $70\,\Omega$ | $4.00$ | $280$ | $1120$ |
| **Total disipado** |  |  | $\mathbf{3320}$ |
| $40\,\mathrm{V}$: sube, entra por $-$ y sale por $+$ $\Rightarrow$ **entrega** | $3.00$ | $40$ | $120$ |
| $360\,\mathrm{V}$: baja, entra por $-$ (arriba) y sale por $+$ $\Rightarrow$ **entrega** | $8.00$ | $360$ | $2880$ |
| $80\,\mathrm{V}$: sube, entra por $-$ y sale por $+$ $\Rightarrow$ **entrega** | $4.00$ | $80$ | $320$ |
| **Total entregado** |  |  | $\mathbf{3320}$ |

**Carga:** en el nodo superior entran $1.00+3.00+4.00=8.00\,\mathrm{A}$ y salen $8.00\,\mathrm{A}$ (rama de $360\,\mathrm{V}$). ✓  
**Energía:** entregada $3320\,\mathrm{W}$ $=$ disipada $3320\,\mathrm{W}$. ✓  Además, $V_{sup}-V_{inf}=-200\,\mathrm{V}$ en todas las ramas.
