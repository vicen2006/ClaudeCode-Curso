# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responder siempre al usuario en español en este proyecto.

## Estado del proyecto

Juego Arkanoid en HTML, CSS y JavaScript puros. Cero dependencias, sin paso de build, sin gestor de paquetes, sin tests, sin linter, sin módulos ES (scripts clásicos).

El juego ya es jugable: `index.html`, `style.css` y `game.js` existen en la raíz de esta carpeta. El README (en español) está desactualizado y todavía dice que no está implementado.

Para correr el juego: abrir `index.html` en el navegador o servir la carpeta con cualquier servidor estático. Funciona desde `file://` porque los assets se cargan con `Image`/`Audio`; no usar `fetch` para cargar datos (rompe `file://`).

Esta carpeta es un subdirectorio de un repo git mayor (`ClaudeCode-Curso`, rama `master`) que contiene varios proyectos del curso. La raíz de git está un nivel arriba.

## Arquitectura

- `index.html`: canvas `#game` de 480x640 y dos scripts en este orden: `assets/spritesheet.js`, luego `game.js`.
- `style.css`: centra el canvas y lo escala con CSS (`image-rendering: pixelated`, `aspect-ratio: 480 / 640`).
- `game.js`: todo el juego. Resolución lógica fija `W = 480`, `H = 640`; bloques de `32x16`, `COLS = 15`, `BLOCK_TOP = 64`.
  - `state = { mode, level, score, lives }`. Modos: `ready`, `playing`, `levelcomplete`, `gameover`, `won`.
  - `LEVELS`: 5 matrices de strings (15 caracteres por fila, máximo 10 filas). `BLOCK_TYPES` mapea cada carácter a `{ color, hp, points }`; `.` es hueco.
  - `loadLevel(n)`: reconstruye `blocks`, recalcula `ball.speed` y `paddle.w` según el nivel y recentra el paddle. `restartGame()` y `nextLevel()` pasan por ella.
  - Bucle: `frame` → `update(dt)` (delta limitado a 1/30 s) → `draw()`. El paso a `levelcomplete` o `won` se decide en un solo punto, en `update`, al quedar 0 bloques.
- Al añadir niveles o tipos de bloque, mantener la convención de matrices de texto dentro de `game.js` (no archivo aparte ni JSON).

## Flujo guiado por specs

Este proyecto sigue un método spec-first. Cada funcionalidad nueva pasa por un spec en `specs/` antes de escribir código. Dos skills en `.agents/skills/` (instaladas desde `Klerith/fernando-skills`, fijadas en `skills-lock.json`) soportan el flujo:

- `/spec <descripción>`: entrevista al usuario en bloques de 3 a 5 preguntas (alcance, datos, integración, UX, riesgos) y luego escribe `specs/NN-slug.md` en estado `Borrador`/`Draft`. No escribe código y no propone implementarlo. Plantilla en `.agents/skills/spec/template.md`. Si `specs/.spec-config.yml` no existe, lo crea.
- `/spec-impl <NN-slug>`: solo corre si el estado del spec significa "Aprobado". Ese cambio lo hace el humano, nunca el agente. Con el árbol de trabajo limpio crea la rama `spec-NN-slug` (salvo `AutoCreateBranch: false`, que pide confirmación `[y/N]`), muestra objetivo, alcance, plan y criterios, e implementa un paso del plan a la vez, pausando para revisar el diff. Nunca hace commit si no se le pide.

### Specs existentes

| Spec | Estado | Contenido |
| --- | --- | --- |
| `specs/01-mvp-jugable.md` | Implementado | MVP: paddle, bola, bloques, vidas, puntuación, sonidos, pantallas de victoria y derrota |
| `specs/02-niveles.md` | Aprobado | 5 niveles fijos, escalado de velocidad y paddle, estado `levelcomplete`, HUD de nivel |

El código del SPEC 02 ya está en `game.js` (rama `spec-02-niveles`, commits en `master`), pero el spec sigue en `Aprobado`: pendiente verificar los criterios de aceptación y que el humano lo marque como `Implementado`.

### Convenciones de un spec

- Archivo `specs/NN-slug.md`, numeración correlativa de dos dígitos y slug en kebab-case.
- Cabecera en blockquote con `**Status:**`, `**Depends on:**`, `**Date:**` y `**Objective:**` (una sola frase; si no cabe, dividir el spec). La fecha viene de `date +%F`, nunca se inventa.
- Estados usados en este repo, en español: `Borrador`, `En revisión`, `Aprobado`, `Implementado`, `Obsoleto`. Las etiquetas de la cabecera quedan en inglés (`Status`, `Depends on`, `Date`, `Objective`) como en los specs existentes.
- Secciones, en este orden: `Por qué existe este spec` (opcional), `Alcance` (con **Dentro** y **Fuera de alcance**, ambos obligatorios), `Modelo de datos` (con nombres reales), `Plan de implementación` (pasos numerados, cada uno deja el sistema funcional y trae su prueba manual), `Criterios de aceptación` (checklist booleana y verificable), `Decisiones` (Sí/No con justificación breve), `Riesgos` (tabla Riesgo/Mitigación, solo si aplica) y un cierre `Lo que **no** entra en este spec`.
- Escribir los specs en español, igual que los existentes.

### Reglas al implementar un spec

- Implementar exactamente lo que dice el spec. Si algo parece mejorable, comentarlo como observación; los cambios van al spec, no al código por sorpresa.
- Ambigüedad no resuelta por el spec: parar, describirla, dar 2 o 3 opciones y esperar decisión.
- Petición fuera del alcance del spec: avisar y sugerir dejarla para un spec futuro; no implementarla en esa rama.
- Al terminar el último paso: verificar los criterios de aceptación uno a uno, luego el humano actualiza el estado a `Implementado` y hace el commit final antes de mergear la rama.
- Mensajes de commit en español, descriptivos, como los del historial.

## Assets y sistema de sprites

`assets/spritesheet.js` es un script global simple (sin módulos). Cargarlo con una etiqueta `<script>` antes del código del juego.

- `loadSpritesheet(cb)`: carga `assets/spritesheet-breakout.png` (ruta relativa a la página HTML), la copia a un canvas fuera de pantalla y dispara los callbacks en cola. Se puede llamar varias veces. `drawFrame`/`drawSprite` no hacen nada hasta que la imagen cargue; por eso `game.js` arranca el bucle dentro del callback.
- `SPRITES`: rectángulos de origen (`sx, sy, sw, sh`) para `paddle`, `ball` y `blocks.<color>`. `drawSprite(ctx, name, x, y, w, h)` recibe `'paddle'`, `'ball'` o `'block_<color>'`.
- `EXPLOSION_FRAMES[color]`: animación de rotura de 4 frames por color, se dibuja con `drawFrame`; `EXPLOSION_DURATION = 150` (ms).
- Colores de bloque: gray, red, yellow, cyan, magenta, hotpink, green. `EXPLOSION_FRAMES.gray` reutiliza los frames de red (el spritesheet no tiene frames grises).
- Sonidos: `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3`.
