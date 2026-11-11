const W = 480, H = 640;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const state = { mode: 'ready' };

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
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x - 6, ball.y - 6, 12, 12);
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
  stickBall();
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
});
