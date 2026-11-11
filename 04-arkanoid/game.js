const W = 480, H = 640;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const BLOCK_W = 32, BLOCK_H = 16;
const COLS = 15;
const ROW_COLORS = ['gray', 'red', 'yellow', 'cyan', 'magenta', 'green'];
const BLOCK_TOP = 64;

const state = { mode: 'ready', score: 0 };

let blocks = [];

function buildBlocks() {
  blocks = [];
  ROW_COLORS.forEach((color, row) => {
    for (let col = 0; col < COLS; col++) {
      blocks.push({
        x: col * BLOCK_W,
        y: BLOCK_TOP + row * BLOCK_H,
        color,
        hp: color === 'gray' ? 2 : 1,
        points: color === 'gray' ? 20 : 10,
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

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    launchBall();
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

canvas.addEventListener('click', launchBall);

function clampPaddle() {
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

function update(dt) {
  const now = performance.now();
  blocks = blocks.filter((b) => !b.exploding || now - b.explodeStart < EXPLOSION_DURATION);

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
  } else if (ball.x + ball.r > W) {
    ball.x = W - ball.r;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
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
  }

  if (ball.y - ball.r > H) {
    state.mode = 'ready';
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
  buildBlocks();
  stickBall();
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
});
