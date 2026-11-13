# SPEC 02 — Sistema de niveles

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-11-13
> **Objective:** Reemplazar el nivel único por 5 niveles fijos de dificultad creciente (diseño, bloques de varios golpes, velocidad de la bola y ancho del paddle), con pantalla de nivel completado y victoria tras el último.

## Por qué existe este spec

El MVP (SPEC 01) tiene un solo nivel fijo y se vuelve repetitivo. Este spec añade progresión sin tocar las reglas base de colisión, vidas ni sonido.

## Alcance

**Dentro:**

- 5 niveles fijos definidos en `game.js` como matrices de texto (un carácter por celda, 15 columnas).
- Leyenda de caracteres: `.` hueco, `g` gris (hp 2), `m` metal (hp 3, sprite gris), `r` red, `y` yellow, `c` cyan, `p` magenta, `h` hotpink, `n` green. Todos los bloques de hp 1 valen 10 puntos.
- Escalado por nivel: velocidad de la bola `300 + 25 * (nivel - 1)` px/s y ancho del paddle `96 - 8 * (nivel - 1)` px.
- Más bloques de varios golpes (`g` y `m`) en los niveles altos.
- Estado nuevo `levelcomplete` con pantalla "Nivel completado". Enter o clic carga el siguiente nivel en estado `ready`.
- Puntos y vidas se conservan al pasar de nivel.
- `won` solo aparece al completar el nivel 5.
- HUD con "Nivel N/5" junto a puntuación y vidas.
- Reiniciar tras `gameover` o `won` vuelve al nivel 1, con 3 vidas y puntuación 0.

**Fuera de alcance (para specs futuros):**

- Niveles generados aleatoriamente o infinitos.
- Niveles en archivo aparte o JSON con `fetch`.
- Sprite propio para el bloque metal o tinte según hp restante.
- Power-ups.
- Persistencia de puntuación máxima o del nivel alcanzado.
- Selector de nivel, pausa y menú.
- Bonus por nivel completado o por vidas restantes.
- Música de fondo y nuevos sonidos.

## Modelo de datos

```js
const MAX_LEVEL = 5;
const BASE_BALL_SPEED = 300, BALL_SPEED_STEP = 25;   // px/s
const BASE_PADDLE_W = 96, PADDLE_W_STEP = 8;         // px

// Carácter -> bloque
const BLOCK_TYPES = {
  g: { color: 'gray',    hp: 2, points: 20 },
  m: { color: 'gray',    hp: 3, points: 30 },
  r: { color: 'red',     hp: 1, points: 10 },
  y: { color: 'yellow',  hp: 1, points: 10 },
  c: { color: 'cyan',    hp: 1, points: 10 },
  p: { color: 'magenta', hp: 1, points: 10 },
  h: { color: 'hotpink', hp: 1, points: 10 },
  n: { color: 'green',   hp: 1, points: 10 },
};

// 5 matrices; cada fila es un string de exactamente COLS (15) caracteres
const LEVELS = [
  [ '...............', /* ... hasta MAX_ROWS filas ... */ ],
  // ... niveles 2 a 5
];

const state = {
  mode: 'ready',   // 'ready' | 'playing' | 'levelcomplete' | 'gameover' | 'won'
  level: 1,        // nuevo, 1..MAX_LEVEL
  score: 0,
  lives: 3,
};
```

Convenciones:

- `SPEC 01` mantiene `W`, `H`, `BLOCK_W`, `BLOCK_H`, `COLS`, `BLOCK_TOP` y el modelo de `block`, `paddle` y `ball`. `ROW_COLORS` deja de usarse y se elimina.
- Cada matriz tiene como máximo `MAX_ROWS = 10` filas (160 px desde `BLOCK_TOP`, la zona de bloques termina en y = 224) para dejar espacio a la bola y el paddle.
- `paddle.w` y `ball.speed` se recalculan al cargar cada nivel con las constantes de arriba. Nivel 5: 400 px/s y 64 px.
- `paddle.x` se recentra al cargar un nivel para que el cambio de ancho no deje el paddle fuera del canvas.
- El bloque `m` no cambia de aspecto al recibir golpes y usa los frames de explosión de `red`, igual que el gris en SPEC 01.
- Un nivel está completo cuando no quedan bloques ni explosiones activas.
- Diseños: nivel 1 reproduce el nivel de SPEC 01 (6 filas, fila gris arriba). Los niveles 2 a 5 aumentan la proporción de `g` y `m` y usan formas con huecos. Las matrices exactas se escriben en el paso 3 del plan.

## Plan de implementación

1. Extraer el nivel actual a `LEVELS[0]` y `BLOCK_TYPES`, y construir los bloques desde la matriz con una función `loadLevel(n)`. `ROW_COLORS` se elimina. Prueba manual: el juego se ve y se comporta igual que en SPEC 01.
2. Añadir `state.level`, aplicar velocidad de bola y ancho de paddle por nivel dentro de `loadLevel`, y recentrar el paddle. Prueba: forzar `loadLevel(5)` desde la consola muestra paddle de 64 px y bola a 400 px/s.
3. Escribir las matrices de los niveles 2 a 5 (con `g` y `m` crecientes). Prueba: cada nivel cargado desde la consola tiene 15 columnas, como máximo 10 filas y se dibuja sin errores.
4. Estado `levelcomplete`: al romper el último bloque en niveles 1 a 4 mostrar "Nivel completado", y Enter o clic llama a `loadLevel(level + 1)` en estado `ready`, conservando puntos y vidas. Prueba: romper todos los bloques del nivel 1 lleva al nivel 2.
5. Victoria y reinicio: completar el nivel 5 pasa a `won`; reiniciar tras `won` o `gameover` llama a `loadLevel(1)` con 3 vidas y puntuación 0. Prueba: se puede recorrer los 5 niveles y reiniciar.
6. HUD con "Nivel N/5". Prueba: el número cambia al pasar de nivel y vuelve a 1 al reiniciar.

## Criterios de aceptación

- [ ] El juego carga desde `file://` sin errores en la consola.
- [ ] Existen exactamente 5 niveles en `LEVELS` y cada fila de cada matriz tiene 15 caracteres.
- [ ] Ninguna matriz tiene más de 10 filas.
- [ ] El nivel 1 muestra el mismo diseño que SPEC 01: 6 filas, gris, red, yellow, cyan, magenta, green de arriba abajo.
- [ ] En el nivel N la velocidad de la bola es `300 + 25 * (N - 1)` px/s y el paddle mide `96 - 8 * (N - 1)` px.
- [ ] El paddle no sale del canvas tras cambiar de ancho al cargar un nivel.
- [ ] Un bloque `g` se rompe con 2 golpes y suma 20 puntos; un bloque `m` se rompe con 3 golpes y suma 30.
- [ ] Un bloque de hp 1 suma exactamente 10 puntos.
- [ ] Los niveles 4 y 5 tienen más bloques `g` y `m` en total que el nivel 2.
- [ ] Al romper el último bloque de los niveles 1 a 4 aparece "Nivel completado".
- [ ] Enter o clic en "Nivel completado" carga el siguiente nivel en estado `ready`, con la bola pegada al paddle.
- [ ] Puntos y vidas son los mismos antes y después de pasar de nivel.
- [ ] Al completar el nivel 5 aparece la pantalla de victoria, no la de "Nivel completado".
- [ ] Reiniciar tras victoria o derrota deja nivel 1, 3 vidas, puntuación 0 y los bloques del nivel 1.
- [ ] Perder una vida no cambia de nivel ni reconstruye los bloques.
- [ ] El HUD muestra "Nivel N/5" y se actualiza al cambiar de nivel.
- [ ] El proyecto sigue sin dependencias, build ni módulos ES.

## Decisiones

- **Sí:** 5 niveles fijos. Se verifican a mano y se pueden balancear sin algoritmo.
- **No:** generación aleatoria. Difícil de verificar y de balancear; va en otro spec si se pide.
- **Sí:** matrices de texto dentro de `game.js`. Legibles, sin archivos nuevos y compatibles con `file://`.
- **No:** `levels.js` aparte ni JSON con `fetch`. El JSON rompe `file://`; el archivo aparte añade un script sin beneficio por ahora.
- **Sí:** dificultad por tres ejes: más bloques de varios golpes, velocidad de bola y paddle más pequeño. Variedad más allá del diseño.
- **Sí:** velocidad +25 px/s por nivel con tope natural de 400 px/s en el nivel 5. Mantiene bajo el riesgo de tunneling definido en SPEC 01.
- **No:** subida de +50 px/s por nivel. Llega a 500 px/s y obligaría a subdividir el paso de física.
- **Sí:** bloque `m` de hp 3 reutilizando el sprite gris. No hay más sprites; el golpe no cambia el aspecto, igual que el gris de SPEC 01.
- **No:** tintar el sprite según hp. Añade lógica de dibujo fuera de alcance.
- **Sí:** estado `levelcomplete` con pantalla propia. Da feedback claro antes de cambiar de diseño y de velocidad.
- **Sí:** puntos y vidas se conservan entre niveles. Las vidas son un recurso global de toda la partida.
- **Sí:** tras `gameover` o `won` se vuelve al nivel 1 con estado limpio. Mantiene la regla de reinicio de SPEC 01.
- **Sí:** HUD con "Nivel N/5". Da contexto de progreso durante toda la partida.
- **No:** bonus por nivel o por vidas. Cambia el balance de puntuación; va en otro spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Tunneling a 400 px/s en el nivel 5 | El delta ya está limitado a ~1/30 s (13 px por paso, mayor que el radio 6). Si aparece, subdividir el paso de movimiento en la colisión bola-bloque y bola-paddle. |
| Paddle de 64 px demasiado difícil con ángulo máximo de 60° | Ajustar `PADDLE_W_STEP` (solo una constante). No se toca el cálculo del ángulo. |
| Bloques `m` y `g` indistinguibles a la vista | Aceptado en SPEC 01 y en este spec. Si resulta confuso en juego, abrir un spec de feedback visual. |
| Estados que mezclan `levelcomplete` con la lógica de `won` y `gameover` | La transición se decide en un solo punto: al quedar 0 bloques, si `level < MAX_LEVEL` pasa a `levelcomplete`; si no, a `won`. |

## Lo que **no** entra en este spec

- Niveles aleatorios o infinitos.
- Archivo de niveles aparte o carga con `fetch`.
- Sprites nuevos o tinte por hp.
- Power-ups.
- Persistencia de puntuación o progreso.
- Selector de nivel, pausa y menú.
- Bonus de puntuación por nivel o vidas.
- Música y sonidos nuevos.

Cada punto, si se hace, va en su propio spec.
