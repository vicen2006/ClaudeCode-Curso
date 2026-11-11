# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responder siempre al usuario en español en este proyecto.

## Estado del proyecto

Juego Arkanoid en HTML, CSS y JavaScript puros. Cero dependencias, sin paso de build, sin gestor de paquetes, sin tests, sin linter. El README (en español) indica que el juego **todavía no está implementado**: solo existen los assets. No hay `index.html` ni código del juego aún.

Para correr el juego (cuando exista): abrir `index.html` en el navegador o servir la carpeta con cualquier servidor estático. Se necesita servidor si el código carga assets con `fetch`; la carga con `Image` funciona desde `file://`.

Esta carpeta es un subdirectorio de un repo git mayor (`ClaudeCode-Curso`, rama `master`) que contiene varios proyectos del curso. La raíz de git está un nivel arriba.

## Flujo guiado por specs

Las funcionalidades siguen un método spec-first con dos skills en `.agents/skills/` (instaladas desde `Klerith/fernando-skills`, fijadas en `skills-lock.json`):

- `/spec <descripción>`: entrevista al usuario y luego escribe `specs/NN-slug.md` (estado `Draft`, plantilla en `.agents/skills/spec/template.md`). No escribe código. También crea `specs/.spec-config.yml`.
- `/spec-impl <NN-slug>`: solo corre si el estado del spec significa "Aprobado" (lo cambia el humano). Crea la rama `spec-NN-slug` (salvo `AutoCreateBranch: false`) e implementa un paso del plan a la vez, pausando para revisar el diff. Nunca hace commit si no se le pide.

Usar el idioma de los specs existentes y del prompt del usuario (español hasta ahora). La carpeta `specs/` todavía no existe.

## Assets y sistema de sprites

`assets/spritesheet.js` es un script global simple (sin módulos). Cargarlo con una etiqueta `<script>` antes del código del juego.

- `loadSpritesheet(cb)`: carga `assets/spritesheet-breakout.png` (ruta relativa a la página HTML), la copia a un canvas fuera de pantalla y dispara los callbacks en cola. Se puede llamar varias veces. `drawFrame`/`drawSprite` no hacen nada hasta que la imagen cargue.
- `SPRITES`: rectángulos de origen (`sx, sy, sw, sh`) para `paddle`, `ball` y `blocks.<color>`. `drawSprite(ctx, name, x, y, w, h)` recibe `'paddle'`, `'ball'` o `'block_<color>'`.
- `EXPLOSION_FRAMES[color]`: animación de rotura de 4 frames por color, se dibuja con `drawFrame`; `EXPLOSION_DURATION = 150` (ms).
- Colores de bloque: gray, red, yellow, cyan, magenta, hotpink, green. `EXPLOSION_FRAMES.gray` reutiliza los frames de red (el spritesheet no tiene frames grises).
- Sonidos: `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3`.
