const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const toastEl = document.getElementById('toast');
const timerEl = document.getElementById('timer');
const timerLabelEl = document.getElementById('timerLabel');
const healthValueEl = document.getElementById('healthValue');
const healthBarEl = document.getElementById('healthBar');
const koValueEl = document.getElementById('koValue');
const livesValueEl = document.getElementById('livesValue');
const teamScoreLeftEl = document.getElementById('teamScoreLeft');
const teamScoreRightEl = document.getElementById('teamScoreRight');
const teamNameLeftEl = document.getElementById('teamNameLeft');
const teamNameRightEl = document.getElementById('teamNameRight');
const brawlerClassValueEl = document.getElementById('brawlerClassValue');

// Story Campaign Boss Configuration
const STORY_STAGES = [
  {
    stage: 1,
    title: 'Chapter I: Overcharge Nova',
    bossName: 'OVERCHARGE NOVA',
    bossHp: 600,
    bossSpeed: 180,
    bossColor: '#76faff',
    desc: 'An unstable energy entity firing rapid pulse waves.',
  },
  {
    stage: 2,
    title: 'Chapter II: Pyre Lord Vulcan',
    bossName: 'PYRE LORD VULCAN',
    bossHp: 1100,
    bossSpeed: 160,
    bossColor: '#ff8a67',
    desc: 'Colossal lava titan shooting triple explosive fireballs.',
  },
  {
    stage: 3,
    title: 'Chapter III: Glacier Titan Aegis',
    bossName: 'GLACIER TITAN AEGIS',
    bossHp: 1800,
    bossSpeed: 140,
    bossColor: '#ffd76d',
    desc: 'Heavy armored behemoth with damage resistance shields.',
  },
];

const BRAWLERS = {
  volt: {
    name: '⚡ VOLT',
    desc: 'High speed skirmisher with rapid-fire energy bolts.',
    speed: 260, hp: 100, damage: 24, speedStat: 90, hpStat: 60, damageStat: 65, color: '#76faff',
  },
  pyre: {
    name: '🔥 PYRE',
    desc: 'Heavy explosive artillery brawler dealing massive area damage.',
    speed: 220, hp: 110, damage: 38, speedStat: 65, hpStat: 70, damageStat: 95, color: '#ff8a67',
  },
  bastion: {
    name: '🛡️ BASTION',
    desc: 'Armored juggernaut with extra health and built-in damage mitigation.',
    speed: 180, hp: 160, damage: 28, speedStat: 45, hpStat: 100, damageStat: 75, color: '#ffd76d',
  },
};

let selectedBrawlerKey = 'volt';
let currentMode = 'arcade';
let currentStoryStageIndex = 0;

const world = {
  width: 2600,
  height: 1700,
  phase: 'menu',
  timer: 180,
  players: [],
  projectiles: [],
  walls: [],
  teamScores: { red: 0, blue: 0 },
  localId: '',
  lastTime: 0,
  bossEntity: null,
};

const input = { left: false, right: false, up: false, down: false, shoot: false, pointerX: 0, pointerY: 0 };

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('visible');
  setTimeout(() => toastEl.classList.remove('visible'), 1700);
}

function setScreen(screen) {
  document.getElementById('menuScreen').classList.toggle('hidden', screen !== 'menu');
  document.getElementById('hostScreen').classList.toggle('hidden', screen !== 'host');
  document.getElementById('joinScreen').classList.toggle('hidden', screen !== 'join');
  document.getElementById('helpScreen').classList.toggle('hidden', screen !== 'help');
  document.getElementById('aboutScreen').classList.toggle('hidden', screen !== 'about');
  document.getElementById('accountScreen').classList.toggle('hidden', screen !== 'account');
  document.getElementById('hud').style.display = screen === 'match' ? 'block' : 'none';
}

function drawBrawlerPreviews() {
  const renderPreview = (canvasId, color) => {
    const pCanvas = document.getElementById(canvasId);
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    pCtx.fillStyle = color;
    pCtx.beginPath(); pCtx.arc(40, 40, 22, 0, Math.PI * 2); pCtx.fill();
    pCtx.strokeStyle = '#fff'; pCtx.lineWidth = 3; pCtx.stroke();
    pCtx.fillStyle = '#fff'; pCtx.fillRect(40, 37, 24, 6);
  };
  renderPreview('previewVolt', BRAWLERS.volt.color);
  renderPreview('previewPyre', BRAWLERS.pyre.color);
  renderPreview('previewBastion', BRAWLERS.bastion.color);
}

function updateBrawlerStatBox(key) {
  const b = BRAWLERS[key];
  document.getElementById('statBrawlerName').textContent = b.name;
  document.getElementById('statBrawlerDesc').textContent = b.desc;
  document.getElementById('barSpeed').style.width = `${b.speedStat}%`;
  document.getElementById('barHp').style.width = `${b.hpStat}%`;
  document.getElementById('barDamage').style.width = `${b.damageStat}%`;
}

function createPlayer(name, team, isBot = false, brawlerKey = 'volt', isBoss = false) {
  const b = BRAWLERS[brawlerKey] || BRAWLERS.volt;
  return {
    id: isBoss ? 'boss' : isBot ? 'bot-' + Math.random() : 'player-' + Math.random(),
    name, team,
    x: isBoss ? 1300 : 600 + Math.random() * 400,
    y: isBoss ? 850 : 600 + Math.random() * 400,
    vx: 0, vy: 0,
    radius: isBoss ? 38 : 16,
    speed: isBoss ? 160 : isBot ? 200 : b.speed,
    maxHp: isBoss ? 800 : b.hp,
    hp: isBoss ? 800 : b.hp,
    lives: 3,
    fireCooldown: 0,
    alive: true,
    bot: isBot || isBoss,
    isBoss,
    kills: 0,
    brawlerKey,
    color: isBoss ? '#ff5f7d' : b.color,
    damage: b.damage,
  };
}

function resetMatch() {
  world.players = [];
  world.projectiles = [];
  world.teamScores = { red: 0, blue: 0 };
  world.walls = [
    { x: 0, y: 0, w: world.width, h: 18 }, { x: 0, y: world.height - 18, w: world.width, h: 18 },
    { x: 0, y: 0, w: 18, h: world.height }, { x: world.width - 18, y: 0, w: 18, h: world.height },
    { x: 440, y: 170, w: 240, h: 28 }, { x: 760, y: 260, w: 220, h: 28 },
    { x: 440, y: 860, w: 28, h: 420 }, { x: 1200, y: 400, w: 300, h: 28 },
  ];

  const playerName = document.getElementById('playerName').value || 'Hero';
  const p = createPlayer(playerName, 'red', false, selectedBrawlerKey);
  world.localId = p.id;
  world.players.push(p);

  if (currentMode === 'story') {
    const stage = STORY_STAGES[currentStoryStageIndex];
    teamNameLeftEl.textContent = 'HERO';
    teamNameRightEl.textContent = 'BOSS HP';
    timerLabelEl.textContent = 'STAGE';
    timerEl.textContent = `${stage.stage}/3`;

    const boss = createPlayer(stage.bossName, 'blue', true, 'pyre', true);
    boss.maxHp = stage.bossHp; boss.hp = stage.bossHp; boss.speed = stage.bossSpeed;
    world.bossEntity = boss;
    world.players.push(boss);
    showToast(`STORY MODE: Defeat ${stage.bossName}!`);
  } else {
    teamNameLeftEl.textContent = 'CORAL';
    teamNameRightEl.textContent = 'CYAN';
    timerLabelEl.textContent = 'CHAOS POINTS';
    const botCount = Number(document.getElementById('botCount').value) || 3;
    for (let i = 0; i < botCount; i++) {
      world.players.push(createPlayer(`Bot ${i + 1}`, 'blue', true, 'volt'));
    }
  }
}

function updateMatch(dt) {
  if (currentMode === 'arcade') {
    world.timer = Math.max(0, world.timer - dt);
    const mins = Math.floor(world.timer / 60).toString().padStart(2, '0');
    const secs = Math.floor(world.timer % 60).toString().padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
    teamScoreLeftEl.textContent = world.teamScores.red;
    teamScoreRightEl.textContent = world.teamScores.blue;
  } else if (world.bossEntity) {
    teamScoreLeftEl.textContent = Math.ceil(world.players.find(p => p.id === world.localId)?.hp || 0);
    teamScoreRightEl.textContent = Math.ceil(world.bossEntity.hp);
  }

  for (const pl of world.players) {
    if (!pl.alive) {
      pl.respawnTimer = (pl.respawnTimer || 2.5) - dt;
      if (pl.respawnTimer <= 0) {
        pl.x = 600 + Math.random() * 400; pl.y = 600 + Math.random() * 400;
        pl.hp = pl.maxHp; pl.alive = true; pl.respawnTimer = 0;
      }
      continue;
    }

    if (pl.bot) {
      const target = world.players.find(o => o.id !== pl.id && o.team !== pl.team && o.alive);
      if (target) {
        const dx = target.x - pl.x; const dy = target.y - pl.y;
        const dist = Math.hypot(dx, dy) || 1;
        pl.vx += ((dx / dist) * pl.speed - pl.vx) * 0.1;
        pl.vy += ((dy / dist) * pl.speed - pl.vy) * 0.1;

        if (dist < 500 && pl.fireCooldown <= 0) {
          if (pl.isBoss) {
            for (let a = -0.3; a <= 0.3; a += 0.3) {
              const angle = Math.atan2(dy, dx) + a;
              world.projectiles.push({ x: pl.x, y: pl.y, vx: Math.cos(angle)*600, vy: Math.sin(angle)*600, team: pl.team, ownerId: pl.id, ttl: 1.4, radius: 8, damage: 28 });
            }
          } else {
            world.projectiles.push({ x: pl.x, y: pl.y, vx: (dx/dist)*650, vy: (dy/dist)*650, team: pl.team, ownerId: pl.id, ttl: 1.2, radius: 6, damage: 24 });
          }
          pl.fireCooldown = pl.isBoss ? 0.6 : 0.45;
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
        world.projectiles.push({ x: pl.x, y: pl.y, vx: Math.cos(pl.aim)*650, vy: Math.sin(pl.aim)*650, team: pl.team, ownerId: pl.id, ttl: 1.2, radius: 6, damage: pl.damage });
        pl.fireCooldown = pl.brawlerKey === 'volt' ? 0.14 : 0.22;
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
      if (Math.hypot(b.x - pl.x, b.y - pl.y) < pl.radius + b.radius) {
        pl.hp -= b.damage;
        if (pl.hp <= 0) {
          pl.alive = false;
          if (pl.isBoss) {
            showToast('BOSS DEFEATED!');
            if (currentStoryStageIndex < STORY_STAGES.length - 1) {
              currentStoryStageIndex++;
              setTimeout(resetMatch, 2000);
            } else {
              showToast('STORY CAMPAIGN COMPLETE!');
            }
          }
        }
        world.projectiles.splice(i, 1);
        break;
      }
    }
  }

  const local = world.players.find(p => p.id === world.localId);
  if (local) {
    healthValueEl.textContent = Math.max(0, Math.ceil(local.hp));
    healthBarEl.style.width = `${Math.max(0, (local.hp / local.maxHp) * 100)}%`;
    koValueEl.textContent = local.kills;
    livesValueEl.textContent = local.lives;
  }
}

function drawGridAndArena() {
  ctx.fillStyle = '#1d5360';
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = 'rgba(139,245,227,0.1)'; ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 100) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, world.height); ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 100) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(world.width, y); ctx.stroke();
  }

  for (const w of world.walls) {
    ctx.fillStyle = '#287f83'; ctx.fillRect(w.x, w.y, w.w, w.h);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const local = world.players.find(p => p.id === world.localId) || world.players[0];
  const cx = local ? local.x : world.width / 2;
  const cy = local ? local.y : world.height / 2;

  ctx.save();
  ctx.translate(canvas.width / 2 - cx, canvas.height / 2 - cy);
  drawGridAndArena();

  for (const pl of world.players) {
    if (!pl.alive) continue;
    ctx.fillStyle = pl.color || '#fff';
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(pl.name, pl.x, pl.y - (pl.radius + 10));
  }

  for (const b of world.projectiles) {
    ctx.fillStyle = '#ffd76d';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
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

document.querySelectorAll('.brawler-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.brawler-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedBrawlerKey = card.dataset.brawler;
    brawlerClassValueEl.textContent = selectedBrawlerKey.toUpperCase();
    updateBrawlerStatBox(selectedBrawlerKey);
  });
});

document.getElementById('openStory').addEventListener('click', () => {
  currentMode = 'story';
  currentStoryStageIndex = 0;
  document.getElementById('setupTitle').textContent = 'Story Mode Campaign';
  setScreen('host');
});

document.getElementById('openHost').addEventListener('click', () => {
  currentMode = 'arcade';
  document.getElementById('setupTitle').textContent = 'Host Arcade Game';
  setScreen('host');
});

document.getElementById('openJoin').addEventListener('click', () => setScreen('join'));
document.getElementById('accountButton').addEventListener('click', () => setScreen('account'));
document.getElementById('homeHelp').addEventListener('click', () => setScreen('help'));
document.getElementById('homeAbout').addEventListener('click', () => setScreen('about'));
document.getElementById('closeAccount').addEventListener('click', () => setScreen('menu'));

document.getElementById('createRoom').addEventListener('click', () => {
  resetMatch();
  world.phase = 'match';
  setScreen('match');
});
document.querySelectorAll('.backHome').forEach(b => b.addEventListener('click', () => setScreen('menu')));

drawBrawlerPreviews();
updateBrawlerStatBox('volt');
setScreen('menu');
requestAnimationFrame(loop);
