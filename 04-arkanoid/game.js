const W = 480, H = 640;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const paddle = { x: (W - 96) / 2, y: H - 40, w: 96, h: 14, speed: 420 };

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
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

function clampPaddle() {
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

function update(dt) {
  let dir = 0;
  if (keys.ArrowLeft || keys.KeyA) dir -= 1;
  if (keys.ArrowRight || keys.KeyD) dir += 1;
  paddle.x += dir * paddle.speed * dt;
  clampPaddle();
}

function draw() {
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(0, 0, W, H);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
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
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
});
