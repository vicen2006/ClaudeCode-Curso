const W = 480, H = 640;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function draw() {
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(0, 0, W, H);
}

loadSpritesheet(() => {
  draw();
});
