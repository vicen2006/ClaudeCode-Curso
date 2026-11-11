# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Implementado
> **Depends on:** Ninguna
> **Date:** 2026-11-11
> **Objective:** Construir un Arkanoid jugable de un solo nivel, con paddle, bola, bloques, vidas, puntuación, sonidos y pantallas de victoria y derrota.

## Alcance

**Dentro:**

- `index.html`, `style.css` y `game.js` en la raíz de `04-arkanoid/`, con scripts clásicos (sin módulos) que cargan `assets/spritesheet.js` antes de `game.js`.
- Canvas de resolución lógica fija 480x640, centrado en la página y escalado con CSS (`image-rendering: pixelated`).
- Paddle controlado con teclado (flechas o A/D) y mouse.
- Bola que sale pegada al paddle y se lanza con espacio o clic.
- Rebote en paredes, techo, paddle y bloques. El ángulo en el paddle depende del punto de impacto y la velocidad es constante.
- Un nivel fijo definido en código: 15 columnas x 6 filas de bloques de 32x16.
- Bloques de varios golpes: la fila superior es gris y necesita 2 golpes. Las demás filas necesitan 1.
- Animación de explosión (`EXPLOSION_FRAMES`, `EXPLOSION_DURATION`) al romper un bloque.
- Sonidos: `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3`.
- 3 vidas, puntuación visible (HUD) y estados `ready`, `playing`, `gameover` y `won`.
- Pantallas de victoria y derrota con reinicio por tecla o clic.

**Fuera de alcance (para specs futuros):**

- Más de un nivel o generación aleatoria de niveles.
- Power-ups (disparo triple, escudo, bola lenta, etc.).
- Persistencia de puntuación máxima (localStorage u otra).
- Pausa, menú principal y pantalla de ajustes.
- Control táctil y versión móvil.
- Aceleración progresiva de la bola.
- Música de fondo y control de volumen.

## Modelo de datos

```js
const W = 480, H = 640;           // resolución lógica del canvas
const BLOCK_W = 32, BLOCK_H = 16;
const COLS = 15;
const ROW_COLORS = ['gray', 'red', 'yellow', 'cyan', 'magenta', 'green'];
const BLOCK_TOP = 64;             // y de la primera fila; arriba queda el HUD

const state = {
  mode: 'ready',                  // 'ready' | 'playing' | 'gameover' | 'won'
  score: 0,
  lives: 3,
};

const paddle = { x, y, w: 96, h: 14, speed: 420 };        // px/s
const ball   = { x, y, r: 6, vx, vy, speed: 300 };        // px/s, velocidad constante

// Bloque: hp restante, puntos y estado de explosión
const block = { x, y, color, hp: 1, points: 10, exploding: false, explodeStart: 0 };
```

Convenciones:

- Origen arriba a la izquierda, coordenadas en píxeles lógicos.
- Movimiento con delta de tiempo (`requestAnimationFrame`), no por frame.
- Bloque gris: `hp: 2`, `points: 20`. El resto: `hp: 1`, `points: 10`.
- Un bloque en explosión (`exploding: true`) no colisiona y se elimina al terminar `EXPLOSION_DURATION`.
- Ángulo de salida en el paddle: `offset = (ball.x - paddleCenter) / (paddle.w / 2)`, limitado a [-1, 1], ángulo máximo 60° respecto a la vertical.
- El sprite del paddle (162x14) se dibuja escalado a 96x14. El sprite de la bola (16x16) se dibuja a 12x12.
- El bloque gris solo tiene un sprite: el primer golpe no cambia su aspecto. Su explosión usa los frames de `red`.

## Plan de implementación

1. Crear `index.html`, `style.css` y `game.js` mínimos: canvas 480x640 centrado, carga de `assets/spritesheet.js` y `loadSpritesheet`, fondo oscuro. Prueba manual: abrir `index.html`, ver el canvas sin errores en consola.
2. Bucle de juego con `requestAnimationFrame` y delta de tiempo, más dibujo del paddle controlado con teclado y mouse, limitado a los bordes. Prueba: el paddle se mueve con flechas, A/D y mouse.
3. Bola en estado `ready` pegada al paddle; lanzar con espacio o clic; rebote en paredes y techo. Prueba: la bola sale y rebota en tres bordes.
4. Rebote en el paddle con ángulo según el punto de impacto; bola que cae por abajo. Prueba: impactos en los extremos desvían más que en el centro.
5. Cuadrícula de bloques (15x6), dibujo con `drawSprite` y colisión bola-bloque con rebote correcto por lado. Prueba: la bola rebota y el bloque desaparece al primer golpe.
6. Bloques grises de 2 golpes y puntuación (10 por bloque, 20 por gris) en un HUD. Prueba: el gris resiste un golpe y la puntuación sube lo esperado.
7. Animación de explosión al romper un bloque con `drawFrame`. Prueba: se ven los 4 frames durante 150 ms y no hay colisión durante ellos.
8. Vidas y estados: perder la bola resta una vida y vuelve a `ready`; con 0 vidas pasa a `gameover`; sin bloques pasa a `won`. Pantallas con mensaje y reinicio por Enter o clic. Prueba: se puede perder, ganar y reiniciar.
9. Sonidos: `ball-bounce.mp3` en rebotes (paredes, techo, paddle, golpe a bloque que no se rompe) y `break-sound.mp3` al romper un bloque. Los errores de `play()` se ignoran. Prueba: suenan en cada caso.

## Criterios de aceptación

- [X] Abrir `index.html` desde `file://` carga el juego sin errores en la consola.
- [X] El canvas tiene resolución interna 480x640 y se ve centrado con los píxeles nítidos.
- [X] El paddle se mueve con flechas izquierda/derecha, con A/D y con el mouse, y no sale del canvas.
- [X] Al iniciar, la bola está sobre el paddle y lo sigue hasta que se pulsa espacio o se hace clic.
- [X] La bola rebota en paredes izquierda, derecha y techo.
- [X] Un impacto en el borde del paddle desvía la bola más que uno en el centro, y la velocidad total no cambia.
- [X] El nivel muestra 6 filas x 15 columnas: gris, red, yellow, cyan, magenta, green de arriba abajo.
- [X] Un bloque no gris se rompe con 1 golpe y suma exactamente 10 puntos.
- [X] Un bloque gris se rompe con 2 golpes y suma exactamente 20 puntos.
- [X] Al romperse un bloque se reproduce la animación de 4 frames durante 150 ms y luego desaparece.
- [X] Cada rebote reproduce `ball-bounce.mp3` y cada bloque roto reproduce `break-sound.mp3`.
- [X] El HUD muestra puntuación y vidas, y se actualizan en tiempo real.
- [X] Perder la bola resta 1 vida y devuelve a `ready`; la partida empieza con 3 vidas.
- [X] Con 0 vidas aparece la pantalla de derrota; Enter o clic reinicia con 3 vidas, puntuación 0 y todos los bloques.
- [X] Al romper todos los bloques aparece la pantalla de victoria; Enter o clic reinicia.
- [X] El proyecto no usa dependencias, build ni módulos ES.

## Decisiones

- **Sí:** `index.html` + `style.css` + `game.js` con scripts clásicos. `assets/spritesheet.js` es global y funciona desde `file://`.
- **No:** módulos ES y varios archivos JS. Con `file://` los módulos fallan por CORS y añaden pasos sin beneficio en un MVP.
- **Sí:** canvas lógico 480x640 escalado con CSS. 15 bloques de 32 px llenan el ancho exacto y las colisiones usan coordenadas fijas.
- **No:** canvas responsivo a pantalla completa. Complica layout y colisiones.
- **Sí:** teclado y mouse a la vez. Cubre ambos estilos con poco costo.
- **Sí:** un nivel fijo. Los niveles múltiples van en otro spec.
- **Sí:** ángulo de rebote según el punto de impacto en el paddle. Da control al jugador.
- **Sí:** velocidad constante de la bola. Evita tuning de dificultad en el MVP.
- **Sí:** movimiento con delta de tiempo. Hace el juego independiente de la tasa de refresco del monitor.
- **Sí:** solo la fila gris es de varios golpes (2). Reutiliza el único sprite gris y limita las reglas.
- **Sí:** reiniciar con Enter o clic. Funciona en teclado y mouse.
- **Sí:** puntuación solo en memoria. La persistencia va en otro spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La bola atraviesa bloques o el paddle a velocidad alta (tunneling) | Velocidad de 300 px/s con delta limitado (máx. ~1/30 s) y bola de radio 6. Si aparece, subdividir el paso de movimiento. |
| Colisión ambigua en esquinas de bloques | Resolver por el eje de menor penetración y procesar un solo bloque por paso. |
| El navegador bloquea audio hasta un gesto del usuario | El primer sonido ocurre tras espacio o clic. Errores de `play()` se capturan y se ignoran. |
| `spritesheet.js` dibuja solo tras cargar la imagen | Arrancar el bucle dentro del callback de `loadSpritesheet`. |

## Lo que **no** entra en este spec

- Niveles adicionales o aleatorios.
- Power-ups.
- Guardado de puntuación máxima.
- Pausa, menú y ajustes.
- Control táctil o versión móvil.
- Aceleración de la bola, música y control de volumen.

Cada punto, si se hace, va en su propio spec.
