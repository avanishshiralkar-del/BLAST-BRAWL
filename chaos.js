const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const toastEl = document.getElementById('toast');
const timerEl = document.getElementById('timer');
const healthValueEl = document.getElementById('healthValue');
const healthBarEl = document.getElementById('healthBar');
const koValueEl = document.getElementById('koValue');
const livesValueEl = document.getElementById('livesValue');

const world = {
  width: 2600,
  height: 1700,
  phase: 'menu',
  timer: 180,
  matchLives: 3,
  players: [],
  projectiles: [],
  walls: [],
  teamIds: ['red', 'blue'],
  localId: '',
  lastTime: 0,
};

const input = { left: false, right: false, up: false, down: false, shoot: false, pointerX: 0, pointerY: 0 };
const TEAMS = [{ id: 'red', name: 'Coral', color: '#ff8a67' }, { id: 'blue', name: 'Cyan', color: '#5fe7cf' }];

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('visible');
  setTimeout(() => toastEl.classList.remove('visible'), 1700);
}

function setScreen(screen) {
  document.getElementById('menuScreen').classList.toggle('hidden', screen !== 'menu');
  document.getElementById('hostScreen').classList.toggle('hidden', screen !== 'host');
  document.getElementById('joinScreen').classList.toggle('hidden', screen !== 'join');
  document.getElementById('hud').style.display = screen === 'match' ? 'block' : 'none';
}

function createPlayer(name, team, isBot = false) {
  return {
    id: isBot ? 'bot-' + Math.random() : 'player-' + Math.random(),
    name, team, x: 500 + Math.random() * 200, y: 500 + Math.random() * 200,
    vx: 0, vy: 0, radius: 16, speed: isBot ? 200 : 235, maxHp: 100, hp: 100,
    lives: 3, weaponLevel: 0, aim: 0, fireCooldown: 0, alive: true, bot: isBot, kills: 0,
  };
}

function resetMatch() {
  world.players = [];
  world.projectiles = [];
  world.walls = [
    { x: 0, y: 0, w: world.width, h: 18 }, { x: 0, y: world.height - 18, w: world.width, h: 18 },
    { x: 0, y: 0, w: 18, h: world.height }, { x: world.width - 18, y: 0, w: 18, h: world.height },
    { x: 440, y: 170, w: 240, h: 28 }, { x: 760, y: 260, w: 220, h: 28 },
  ];
  const p = createPlayer('Player 1', 'red', false);
  world.localId = p.id;
  world.players.push(p);
  world.players.push(createPlayer('Bot Alpha', 'blue', true));
  world.timer = 180;
}

function updateMatch(dt) {
  world.timer = Math.max(0, world.timer - dt);
  const mins = Math.floor(world.timer / 60).toString().padStart(2, '0');
  const secs = Math.floor(world.timer % 60).toString().padStart(2, '0');
  timerEl.textContent = `${mins}:${secs}`;

  for (const pl of world.players) {
    if (!pl.alive) continue;
    if (pl.bot) {
      const target = world.players.find(o => o.id !== pl.id && o.team !== pl.team && o.alive);
      if (target) {
        const dx = target.x - pl.x; const dy = target.y - pl.y;
        const dist = Math.hypot(dx, dy) || 1;
        pl.vx += ((dx / dist) * pl.speed - pl.vx) * 0.1;
        pl.vy += ((dy / dist) * pl.speed - pl.vy) * 0.1;
        if (dist < 400 && pl.fireCooldown <= 0) {
          world.projectiles.push({ x: pl.x, y: pl.y, vx: (dx/dist)*600, vy: (dy/dist)*600, team: pl.team, ownerId: pl.id, ttl: 1 });
          pl.fireCooldown = 0.5;
        }
      }
    } else {
      const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const mag = Math.hypot(dx, dy) || 1;
      if (dx || dy) {
        pl.vx += ((dx / mag) * pl.speed - pl.vx) * 0.2;
        pl.vy += ((dy / mag) * pl.speed - pl.vy) * 0.2;
      } else {
        pl.vx *= 0.8; pl.vy *= 0.8;
      }
      pl.aim = Math.atan2(input.pointerY - pl.y, input.pointerX - pl.x);
      if (input.shoot && pl.fireCooldown <= 0) {
        world.projectiles.push({ x: pl.x, y: pl.y, vx: Math.cos(pl.aim)*600, vy: Math.sin(pl.aim)*600, team: pl.team, ownerId: pl.id, ttl: 1 });
        pl.fireCooldown = 0.2;
      }
    }
    pl.fireCooldown = Math.max(0, pl.fireCooldown - dt);
    pl.x += pl.vx * dt; pl.y += pl.vy * dt;
  }

  for (let i = world.projectiles.length - 1; i >= 0; i--) {
    const b = world.projectiles[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.ttl -= dt;
    if (b.ttl <= 0) { world.projectiles.splice(i, 1); continue; }
    for (const pl of world.players) {
      if (!pl.alive || pl.id === b.ownerId || pl.team === b.team) continue;
      if (Math.hypot(b.x - pl.x, b.y - pl.y) < pl.radius + 4) {
        pl.hp -= 25;
        if (pl.hp <= 0) pl.alive = false;
        world.projectiles.splice(i, 1);
        break;
      }
    }
  }

  const local = world.players.find(p => p.id === world.localId);
  if (local) {
    healthValueEl.textContent = Math.max(0, Math.ceil(local.hp));
    healthBarEl.style.width = `${Math.max(0, local.hp)}%`;
    koValueEl.textContent = local.kills;
    livesValueEl.textContent = local.lives;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const local = world.players.find(p => p.id === world.localId) || world.players[0];
  const cx = local ? local.x : world.width / 2;
  const cy = local ? local.y : world.height / 2;

  ctx.save();
  ctx.translate(canvas.width / 2 - cx, canvas.height / 2 - cy);
  ctx.fillStyle = '#1d5360';
  ctx.fillRect(0, 0, world.width, world.height);

  for (const w of world.walls) {
    ctx.fillStyle = '#287f83';
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }

  for (const pl of world.players) {
    if (!pl.alive) continue;
    ctx.fillStyle = TEAMS.find(t => t.id === pl.team)?.color || '#fff';
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(pl.name, pl.x, pl.y - 24);
  }

  for (const b of world.projectiles) {
    ctx.fillStyle = '#ffd76d';
    ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function loop(timestamp) {
  const dt = Math.min((timestamp - (world.lastTime || timestamp)) / 1000, 0.033);
  world.lastTime = timestamp;
  if (world.phase === 'match') updateMatch(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

window.addEventListener('keydown', e => {
  if (e.code === 'KeyW') input.up = true;
  if (e.code === 'KeyS') input.down = true;
  if (e.code === 'KeyA') input.left = true;
  if (e.code === 'KeyD') input.right = true;
  if (e.code === 'Space') input.shoot = true;
});
window.addEventListener('keyup', e => {
  if (e.code === 'KeyW') input.up = false;
  if (e.code === 'KeyS') input.down = false;
  if (e.code === 'KeyA') input.left = false;
  if (e.code === 'KeyD') input.right = false;
  if (e.code === 'Space') input.shoot = false;
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const local = world.players.find(p => p.id === world.localId);
  input.pointerX = e.clientX - rect.left - canvas.width / 2 + (local?.x || 0);
  input.pointerY = e.clientY - rect.top - canvas.height / 2 + (local?.y || 0);
});
canvas.addEventListener('mousedown', () => { input.shoot = true; });
canvas.addEventListener('mouseup', () => { input.shoot = false; });

document.getElementById('openHost').addEventListener('click', () => setScreen('host'));
document.getElementById('openJoin').addEventListener('click', () => setScreen('join'));
document.getElementById('createRoom').addEventListener('click', () => {
  resetMatch();
  world.phase = 'match';
  setScreen('match');
  showToast('Match started!');
});
document.querySelectorAll('.backHome').forEach(b => b.addEventListener('click', () => setScreen('menu')));

setScreen('menu');
requestAnimationFrame(loop);
