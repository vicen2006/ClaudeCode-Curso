# Juego de Arkanoid

Juego de Arkanoid hecho con HTML, CSS y JavaScript puros: cero dependencias, sin build y sin módulos. Se desarrolla con un flujo guiado por specs.

## Cómo jugar

Abrir `index.html` en el navegador, o servir la carpeta con cualquier servidor estático. Funciona desde `file://`.

### Controles

| Acción | Control |
| --- | --- |
| Mover el paddle | Flechas izquierda/derecha, `A`/`D` o mouse |
| Lanzar la bola | `Espacio` o clic |
| Continuar o reiniciar (pantallas de fin) | `Enter` o clic |

### Reglas

- 3 vidas. Si la bola cae, pierdes una y vuelve a salir pegada al paddle.
- El ángulo de rebote en el paddle depende del punto de impacto.
- 5 niveles de dificultad creciente: más bloques de varios golpes, bola más rápida y paddle más pequeño.
- Bloques de un golpe valen 10 puntos. El gris (`g`) necesita 2 golpes y vale 20; el metal (`m`) necesita 3 y vale 30.
- Puntos y vidas se conservan entre niveles.
- Completar el nivel 5 da la victoria. Perder todas las vidas da game over. En ambos casos se reinicia desde el nivel 1.

## Estructura

```
04-arkanoid/
├── index.html           canvas #game (480x640) y carga de scripts
├── style.css            centrado y escalado del canvas
├── game.js              lógica del juego, niveles, HUD y pantallas
├── assets/
│   ├── spritesheet.js   carga del spritesheet, SPRITES y EXPLOSION_FRAMES
│   ├── spritesheet-breakout.png
│   └── sounds/          ball-bounce.mp3, break-sound.mp3
├── specs/               specs del proyecto (método spec-first)
├── .agents/skills/      skills /spec y /spec-impl
└── CLAUDE.md            guía para Claude Code
```

## Desarrollo guiado por specs

Cada funcionalidad nueva se define primero en un spec dentro de `specs/` y después se implementa.

- `/spec <descripción>`: entrevista y escribe `specs/NN-slug.md` en estado `Borrador`. No escribe código.
- `/spec-impl <NN-slug>`: solo corre si el spec está `Aprobado`. Crea la rama `spec-NN-slug` e implementa un paso del plan a la vez, pausando para revisar el diff.

| Spec | Estado | Contenido |
| --- | --- | --- |
| `specs/01-mvp-jugable.md` | Implementado | Paddle, bola, bloques, vidas, puntuación, sonidos, pantallas de victoria y derrota |
| `specs/02-niveles.md` | Aprobado | 5 niveles fijos, escalado de velocidad y paddle, pantalla de nivel completado, HUD de nivel |

El código del SPEC 02 ya está implementado; falta verificar sus criterios de aceptación y marcarlo como `Implementado`.

## Fuera de alcance por ahora

Power-ups, persistencia de puntuación máxima, pausa y menú, control táctil, música de fondo, niveles aleatorios.
