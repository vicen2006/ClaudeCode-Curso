const W = 480, H = 640;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const BLOCK_W = 32, BLOCK_H = 16;
const COLS = 15;
const BLOCK_TOP = 64;
const MAX_LEVEL = 5;
const BASE_BALL_SPEED = 300, BALL_SPEED_STEP = 25;  // px/s
const BASE_PADDLE_W = 96, PADDLE_W_STEP = 8;        // px

// carácter de la matriz -> bloque
const BLOCK_TYPES = {
  g: { color: 'gray', hp: 2, points: 20 },
  m: { color: 'gray', hp: 3, points: 30 },
  r: { color: 'red', hp: 1, points: 10 },
  y: { color: 'yellow', hp: 1, points: 10 },
  c: { color: 'cyan', hp: 1, points: 10 },
  p: { color: 'magenta', hp: 1, points: 10 },
  h: { color: 'hotpink', hp: 1, points: 10 },
  n: { color: 'green', hp: 1, points: 10 },
};

// cada fila tiene exactamente COLS caracteres; '.' es hueco
const LEVELS = [
  [
    'ggggggggggggggg',
    'rrrrrrrrrrrrrrr',
    'yyyyyyyyyyyyyyy',
    'ccccccccccccccc',
    'ppppppppppppppp',
    'nnnnnnnnnnnnnnn',
  ],
  [
    'g.g.g.g.g.g.g.g',
    'rrrrrrrrrrrrrrr',
    '.yyyyyyyyyyyyy.',
    '..ccccccccccc..',
    '...ppppppppp...',
    '....nnnnnnn....',
  ],
  [
    'ggggggggggggggg',
    'hhhhhhhhhhhhhhh',
    'r.r.r.r.r.r.r.r',
    '.y.y.y.y.y.y.y.',
    'c.c.c.c.c.c.c.c',
    '.p.p.p.p.p.p.p.',
    'nnnnnnnnnnnnnnn',
  ],
  [
    'mmmmmmmmmmmmmmm',
    'ggggggggggggggg',
    'r.rr.rr.rr.rr.r',
    'y.yy.yy.yy.yy.y',
    'c.cc.cc.cc.cc.c',
    'p.pp.pp.pp.pp.p',
    'hhhhhhhhhhhhhhh',
    'nnnnnnnnnnnnnnn',
  ],
  [
    'mmmmmmmmmmmmmmm',
    'mgggggggggggggm',
    'mgrrrrrrrrrrrgm',
    'mgryyyyyyyyyrgm',
    'mgrycccccccyrgm',
    'mgrycpppppcyrgm',
    'mgrycphhhpcyrgm',
    'mgrycpnnnpcyrgm',
  ],
];

const sounds = {
  bounce: new Audio('assets/sounds/ball-bounce.mp3'),
  break: new Audio('assets/sounds/break-sound.mp3'),
};

function playSound(name) {
  const s = sounds[name];
  s.currentTime = 0;
  const p = s.play();
  if (p) p.catch(() => {});
}

const state = { mode: 'ready', level: 1, score: 0, lives: 3 };

let blocks = [];

function loadLevel(n) {
  state.level = n;
  ball.speed = BASE_BALL_SPEED + BALL_SPEED_STEP * (n - 1);
  paddle.w = BASE_PADDLE_W - PADDLE_W_STEP * (n - 1);
  paddle.x = (W - paddle.w) / 2;
  blocks = [];
  LEVELS[n - 1].forEach((rowStr, row) => {
    for (let col = 0; col < COLS; col++) {
      const type = BLOCK_TYPES[rowStr[col]];
      if (!type) continue;
      blocks.push({
        x: col * BLOCK_W,
        y: BLOCK_TOP + row * BLOCK_H,
        color: type.color,
        hp: type.hp,
        points: type.points,
        exploding: false,
        explodeStart: 0,
      });
    }
  });
}

function collideBlocks() {
  for (const block of blocks) {
    if (block.exploding) continue;
    const cx = Math.max(block.x, Math.min(ball.x, block.x + BLOCK_W));
    const cy = Math.max(block.y, Math.min(ball.y, block.y + BLOCK_H));
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    if (dx * dx + dy * dy >= ball.r * ball.r) continue;

    // eje de menor penetración: un solo bloque por paso
    const overlapX = dx === 0 && dy === 0
      ? Math.min(ball.x - block.x, block.x + BLOCK_W - ball.x) + ball.r
      : ball.r - Math.abs(dx);
    const overlapY = dx === 0 && dy === 0
      ? Math.min(ball.y - block.y, block.y + BLOCK_H - ball.y) + ball.r
      : ball.r - Math.abs(dy);
    const hitSide = Math.abs(dx) > Math.abs(dy) || (dx === 0 && dy === 0 && overlapX < overlapY);

    if (hitSide) {
      const dir = ball.x < block.x + BLOCK_W / 2 ? -1 : 1;
      ball.x += dir * overlapX;
      ball.vx = dir * Math.abs(ball.vx);
    } else {
      const dir = ball.y < block.y + BLOCK_H / 2 ? -1 : 1;
      ball.y += dir * overlapY;
      ball.vy = dir * Math.abs(ball.vy);
    }

    block.hp -= 1;
    if (block.hp <= 0) {
      state.score += block.points;
      block.exploding = true;
      block.explodeStart = performance.now();
      playSound('break');
    } else {
      playSound('bounce');
    }
    return;
  }
}

const paddle = { x: (W - 96) / 2, y: H - 40, w: 96, h: 14, speed: 420 };
const ball = { x: 0, y: 0, r: 6, vx: 0, vy: 0, speed: 300 };

function stickBall() {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r;
}

function launchBall() {
  if (state.mode !== 'ready') return;
  const angle = (Math.random() * 30 - 15) * Math.PI / 180;
  ball.vx = ball.speed * Math.sin(angle);
  ball.vy = -ball.speed * Math.cos(angle);
  state.mode = 'playing';
}

function restartGame() {
  state.score = 0;
  state.lives = 3;
  state.mode = 'ready';
  loadLevel(1);
  stickBall();
}

function nextLevel() {
  loadLevel(state.level + 1);
  state.mode = 'ready';
  stickBall();
}

function isEnded() {
  return state.mode === 'gameover' || state.mode === 'won';
}

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    launchBall();
  }
  if (e.code === 'Enter') {
    if (isEnded()) restartGame();
    else if (state.mode === 'levelcomplete') nextLevel();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  paddle.x = mx - paddle.w / 2;
  clampPaddle();
});

canvas.addEventListener('click', () => {
  if (isEnded()) restartGame();
  else if (state.mode === 'levelcomplete') nextLevel();
  else launchBall();
});

function clampPaddle() {
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

function update(dt) {
  const now = performance.now();
  blocks = blocks.filter((b) => !b.exploding || now - b.explodeStart < EXPLOSION_DURATION);

  if (state.mode === 'playing' && blocks.length === 0) {
    state.mode = state.level < MAX_LEVEL ? 'levelcomplete' : 'won';
  }
  if (isEnded() || state.mode === 'levelcomplete') return;

  let dir = 0;
  if (keys.ArrowLeft || keys.KeyA) dir -= 1;
  if (keys.ArrowRight || keys.KeyD) dir += 1;
  paddle.x += dir * paddle.speed * dt;
  clampPaddle();

  if (state.mode === 'ready') {
    stickBall();
    return;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx);
    playSound('bounce');
  } else if (ball.x + ball.r > W) {
    ball.x = W - ball.r;
    ball.vx = -Math.abs(ball.vx);
    playSound('bounce');
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
    playSound('bounce');
  }

  collideBlocks();

  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y - ball.r <= paddle.y + paddle.h &&
    ball.x >= paddle.x - ball.r &&
    ball.x <= paddle.x + paddle.w + ball.r
  ) {
    const center = paddle.x + paddle.w / 2;
    const offset = Math.max(-1, Math.min(1, (ball.x - center) / (paddle.w / 2)));
    const angle = offset * 60 * Math.PI / 180;
    ball.y = paddle.y - ball.r;
    ball.vx = ball.speed * Math.sin(angle);
    ball.vy = -ball.speed * Math.cos(angle);
    playSound('bounce');
  }

  if (ball.y - ball.r > H) {
    state.lives -= 1;
    state.mode = state.lives > 0 ? 'ready' : 'gameover';
    stickBall();
  }
}

function draw() {
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(0, 0, W, H);
  const now = performance.now();
  for (const block of blocks) {
    if (block.exploding) {
      const frames = EXPLOSION_FRAMES[block.color];
      const i = Math.min(
        frames.length - 1,
        Math.floor((now - block.explodeStart) / (EXPLOSION_DURATION / frames.length))
      );
      drawFrame(ctx, frames[i], block.x, block.y, BLOCK_W, BLOCK_H);
    } else {
      drawSprite(ctx, 'block_' + block.color, block.x, block.y, BLOCK_W, BLOCK_H);
    }
  }
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x - 6, ball.y - 6, 12, 12);

  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('PUNTOS: ' + state.score, 12, 12);
  ctx.textAlign = 'right';
  const LIFE_SIZE = 12, LIFE_GAP = 4;
  let lx = W - 12 - LIFE_SIZE;
  for (let i = 0; i < state.lives; i++) {
    drawSprite(ctx, 'ball', lx, 12, LIFE_SIZE, LIFE_SIZE);
    lx -= LIFE_SIZE + LIFE_GAP;
  }
  ctx.fillText('VIDAS:', lx + LIFE_SIZE, 12);

  if (isEnded() || state.mode === 'levelcomplete') {
    const titles = { won: '¡VICTORIA!', gameover: 'GAME OVER', levelcomplete: 'NIVEL COMPLETADO' };
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '32px monospace';
    ctx.fillText(titles[state.mode], W / 2, H / 2 - 24);
    ctx.font = '16px monospace';
    ctx.fillText('PUNTOS: ' + state.score, W / 2, H / 2 + 12);
    ctx.fillText(
      state.mode === 'levelcomplete' ? 'Enter o clic para continuar' : 'Enter o clic para reiniciar',
      W / 2, H / 2 + 40
    );
  }
}

let last = 0;

function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

loadSpritesheet(() => {
  loadLevel(1);
  stickBall();
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
});
