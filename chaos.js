import { firebaseConfig } from './firebase-config.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const menuScreen = document.getElementById('menuScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const resultScreen = document.getElementById('resultScreen');
const pauseScreen = document.getElementById('pauseScreen');
const hud = document.getElementById('hud');
const timerEl = document.getElementById('timer');
const phaseBanner = document.getElementById('phaseBanner');
const roomCodeEl = document.getElementById('roomCode');
const teamGroupLeftEl = document.getElementById('teamGroupLeft');
const teamGroupRightEl = document.getElementById('teamGroupRight');
const toastEl = document.getElementById('toast');
const playerListEl = document.getElementById('playerList');
const resultListEl = document.getElementById('resultList');
const roomInput = document.getElementById('joinRoomCode');
const playerNameInput = document.getElementById('playerName');
const botCountInput = document.getElementById('botCount');
const teamCountInput = document.getElementById('teamCount');
const matchDurationInput = document.getElementById('matchDuration');
const matchLivesInput = document.getElementById('matchLives');
const scoreMessageEl = document.getElementById('scoreMessage');
const healthValueEl = document.getElementById('healthValue');
const healthBarEl = document.getElementById('healthBar');
const koValueEl = document.getElementById('koValue');
const livesValueEl = document.getElementById('livesValue');
const weaponValueEl = document.getElementById('weaponValue');
const matchTokenValueEl = document.getElementById('matchTokenValue');
const spawnShieldStatusEl = document.getElementById('spawnShieldStatus');
const settingsVolume = document.getElementById('volume');
const settingsSensitivity = document.getElementById('sensitivity');
const lobbyCodeText = document.getElementById('lobbyCodeText');
const enemyDirectionEl = document.getElementById('enemyDirection');
const matchCountdownEl = document.getElementById('matchCountdown');
const countdownNumberEl = document.getElementById('countdownNumber');
const deathOverlayEl = document.getElementById('deathOverlay');
const deathMessageEl = document.getElementById('deathMessage');
const mapSelectInput = document.getElementById('mapSelect');
const botDifficultyInput = document.getElementById('botDifficulty');
const mapDescriptionEl = document.getElementById('mapDescription');
const selectedMapFeatureEl = document.getElementById('selectedMapFeature');
const countdownMapEl = document.getElementById('countdownMap');
const winnerIntroEl = document.getElementById('winnerIntro');
const winnerIntroTitleEl = document.getElementById('winnerIntroTitle');
const winnerIntroCaptionEl = document.getElementById('winnerIntroCaption');
const winnerIntroProgressEl = document.getElementById('winnerIntroProgress');
const winnerReplayCanvas = document.getElementById('winnerReplayCanvas');
const winnerReplayCtx = winnerReplayCanvas.getContext('2d');
const mapEditorCanvas = document.getElementById('mapEditorCanvas');
const editorCtx = mapEditorCanvas.getContext('2d');
const customMapThemeInput = document.getElementById('customMapTheme');
const customMapNameInput = document.getElementById('customMapName');
const mapBrushInput = document.getElementById('mapBrush');
const moveJoystickEl = document.getElementById('moveJoystick');
const joystickKnobEl = document.getElementById('joystickKnob');
const matchLeaderboardEl = document.getElementById('matchLeaderboard');
const xpRewardMessageEl = document.getElementById('xpRewardMessage');
const accountStatusEl = document.getElementById('accountStatus');
const accountDetailsEl = document.getElementById('accountDetails');
const globalLeaderboardEl = document.getElementById('globalLeaderboard');

const world = {
  width: 2600,
  height: 1700,
  phase: 'menu',
  pausedPhase: 'match',
  roomCode: '',
  timer: 180,
  matchLives: 3,
  cameraZoom: 1,
  countdownRemaining: 0,
  networkStateAge: 0,
  deathPopupUntil: 0,
  deathMessage: 'Respawning soon...',
  players: [],
  projectiles: [],
  pickups: [],
  hazards: [],
  particles: [],
  walls: [],
  spawnPoints: [],
  nextSpawnIndex: 0,
  teamIds: ['red', 'blue'],
  grandToken: null,
  localId: '',
  matchStart: 0,
  isHost: false,
  matchId: 0,
  matchRewardHandled: false,
  networkKillCount: 0,
  matchTokensEarned: 0,
  matchRewardState: { id: 0, tokensEarned: 0, tokenError: '' },
  tokenAwardPromises: new Set(),
  matchTokenError: '',
  replayBuffer: [],
  matchHighlights: [],
  activeHighlight: null,
  replayCaptureTimer: 0,
  winnerIntroClipIndex: 0,
  winnerIntroClipStartedAt: 0,
  lastTime: 0,
  settings: { volume: 0.8, sensitivity: 1 },
  mapId: 'reef',
  customTiles: [],
  mapName: 'Bouncy Reef',
  botDifficulty: 'medium',
};

let previousScreen = 'menu';
let minigameScore = 0;

const input = {
  left: false, right: false, up: false, down: false,
  shoot: false, dash: false, use: false,
  pointerX: 0, pointerY: 0,
};

const toastTimer = { id: null };
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const randomId = () => Math.random().toString(36).slice(2, 10);

const TEAMS = [
  { id: 'red', name: 'Coral', color: '#ff8a67' },
  { id: 'blue', name: 'Cyan', color: '#5fe7cf' },
  { id: 'purple', name: 'Violet', color: '#b58cff' },
  { id: 'gold', name: 'Gold', color: '#ffd76d' },
];

// --- UNIQUE STRATEGIC MAPS ---
const MAPS = {
  reef: {
    name: 'Bouncy Reef',
    description: 'Features a central Tidal Pool that slows movement, forcing tactical flanking and positioning around coral chokepoints.',
    theme: 'reef',
    special: 'TIDAL POOL',
  },
  neon: {
    name: 'Neon Skyline',
    description: 'High-speed lanes crisscrossed by Boost Pads. Rewards fast reflexes, aggressive dashes, and long-range sniper control.',
    theme: 'neon',
    special: 'BOOST PADS',
  },
  ember: {
    name: 'Ember Foundry',
    description: 'A tight workshop where periodic Lava Vents erupt, punishing campers and forcing constant, mobile skirmishes.',
    theme: 'ember',
    special: 'LAVA VENTS',
  },
  frost: {
    name: 'Frostbite Circuit',
    description: 'Slippery Black Ice patches cause momentum drift. Precision steering and corner-banking determine who wins engagements.',
    theme: 'frost',
    special: 'BLACK ICE',
  },
  jungle: {
    name: 'Overgrown Temple',
    description: 'Venom Groves restrict vision and deal continuous damage. Controlling open courtyards is vital for survival.',
    theme: 'jungle',
    special: 'VENOM GROVE',
  },
};

const MAP_THEMES = {
  reef: { top: '#61bdd1', bottom: '#163a54', floor: '#1d5360', grid: 'rgba(139,245,227,0.1)', wall: '#287f83', trim: '#8af3cf', hazard: '#ffd76d' },
  neon: { top: '#37256f', bottom: '#080d29', floor: '#15163b', grid: 'rgba(105,249,255,0.14)', wall: '#34318e', trim: '#76faff', hazard: '#ff5ed2' },
  ember: { top: '#9b3e26', bottom: '#210e19', floor: '#47241f', grid: 'rgba(255,143,66,0.13)', wall: '#753c2e', trim: '#ffbd62', hazard: '#ff593e' },
  frost: { top: '#a5e8fa', bottom: '#284c7e', floor: '#345e83', grid: 'rgba(226,251,255,0.2)', wall: '#638eae', trim: '#d7fbff', hazard: '#76edff' },
  jungle: { top: '#59a86b', bottom: '#102e2b', floor: '#234b3b', grid: 'rgba(190,255,114,0.12)', wall: '#386345', trim: '#bded79', hazard: '#da5d72' },
};

const BOT_SKILLS = {
  easy: { label: 'Easy', speed: 0.65, distance: 330, jitter: 0.48, fireDelay: 0.72 },
  medium: { label: 'Medium', speed: 0.84, distance: 450, jitter: 0.24, fireDelay: 0.43 },
  hard: { label: 'Hard', speed: 1.04, distance: 570, jitter: 0.11, fireDelay: 0.29 },
  nightmare: { label: 'Nightmare', speed: 1.2, distance: 690, jitter: 0.035, fireDelay: 0.2 },
};

// --- BRAWLER / SKIN TIERS & STAT SCALING ---
const SKINS = [
  { id: 'rookie', name: 'Rookie (Default)', price: 0, rarity: 'Common', color: '#edf7ff', ability: 'Standard base stats for guests.', speedMultiplier: 1, damageMultiplier: 1, maxHp: 100, damageResistance: 0 },
  { id: 'neon', name: 'Neon Scout', price: 100, rarity: 'Rare', color: '#76faff', ability: 'Quickstep: +10% movement speed.', speedMultiplier: 1.1, damageMultiplier: 1, maxHp: 100, damageResistance: 0 },
  { id: 'ember', name: 'Ember Berserker', price: 250, rarity: 'Epic', color: '#ff8657', ability: 'Hotshot: +12% damage & 110 HP.', speedMultiplier: 1, damageMultiplier: 1.12, maxHp: 110, damageResistance: 0 },
  { id: 'frost', name: 'Glacier Guardian', price: 500, rarity: 'Legendary', color: '#d7fbff', ability: 'Titan: +8% speed, +18% damage, 120 HP, 10% resistance.', speedMultiplier: 1.08, damageMultiplier: 1.18, maxHp: 120, damageResistance: 0.1 },
];

const GUNS = [
  { id: 'pulse', name: 'Pulse Blaster', price: 0, rarity: 'Common', damage: 24, description: 'Reliable starter weapon.' },
  { id: 'burst', name: 'Burst Rifle', price: 100, rarity: 'Rare', damage: 30, description: 'Faster punchier fire.' },
  { id: 'scatter', name: 'Scatter Shot', price: 250, rarity: 'Epic', damage: 40, description: 'Wide heavy spread.' },
  { id: 'rail', name: 'Railgun', price: 500, rarity: 'Legendary', damage: 58, description: 'Devastating sniper blast.' },
];

let firebaseApp = null;
let firebaseAuth = null;
let realtimeDb = null;
let signedInUser = null;
let firebaseApi = null;
let networkUid = '';
let networkHostUid = '';
let networkRoomRef = null;
let networkPlayerRef = null;
let networkInputExists = false;
let networkStops = [];
let remoteInputs = {};
let lastNetworkInputAt = 0;
let lastNetworkStateAt = 0;
const NETWORK_INPUT_INTERVAL_MS = 60;
const NETWORK_STATE_INTERVAL_MS = 120;
let networkInputWritePending = false;
let networkStateWritePending = false;
let lastAppliedMatchId = '';
let lastPublishedRoomPhase = '';
let networkReady = false;

function getTeam(teamId) {
  return TEAMS.find((team) => team.id === teamId) || TEAMS[0];
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer.id);
  toastTimer.id = setTimeout(() => toastEl.classList.remove('visible'), 1700);
}

function setScreen(screen) {
  menuScreen.classList.toggle('hidden', screen !== 'menu');
  document.getElementById('hostScreen').classList.toggle('hidden', screen !== 'host');
  document.getElementById('joinScreen').classList.toggle('hidden', screen !== 'join');
  document.getElementById('helpScreen').classList.toggle('hidden', screen !== 'help');
  document.getElementById('aboutScreen').classList.toggle('hidden', screen !== 'about');
  lobbyScreen.classList.toggle('hidden', screen !== 'lobby');
  resultScreen.classList.toggle('hidden', screen !== 'result');
  pauseScreen.classList.toggle('hidden', screen !== 'pause');
  document.getElementById('mapEditorScreen').classList.toggle('hidden', screen !== 'editor');
  document.getElementById('accountScreen').classList.toggle('hidden', screen !== 'account');
  hud.style.display = screen === 'match' ? 'block' : 'none';
}

function createPlayer(name, team, isBot = false) {
  // GUESTS ARE FORCED TO USE DEFAULT 'ROOKIE'. SIGNED-IN USERS USE EQUIPPED UNLOCKS.
  const skin = (!isBot && signedInUser)
    ? SKINS.find((e) => e.id === signedInUser.equippedSkin) || SKINS[0]
    : SKINS[0];
    
  const maxHp = isBot ? 100 : skin.maxHp;
  return {
    id: isBot ? `bot-${randomId()}` : `player-${randomId()}`,
    name: name || 'Rookie',
    team,
    x: 500 + Math.random() * 200,
    y: 500 + Math.random() * 200,
    vx: 0,
    vy: 0,
    radius: 16,
    speed: isBot ? 200 : 235 * skin.speedMultiplier,
    maxHp,
    hp: maxHp,
    skinId: isBot ? 'rookie' : skin.id,
    damageMultiplier: isBot ? 1 : skin.damageMultiplier,
    damageResistance: isBot ? 0 : skin.damageResistance,
    lives: world.matchLives,
    weaponLevel: 0,
    maxWeaponLevel: 3,
    spawnShield: 0,
    aim: 0,
    fireCooldown: 0,
    dashCooldown: 0,
    shield: 0,
    alive: true,
    respawnTimer: 0,
    bot: isBot,
    score: 0,
    kills: 0,
  };
}

function setupArena() {
  world.walls = [
    { x: 0, y: 0, w: world.width, h: 18 },
    { x: 0, y: world.height - 18, w: world.width, h: 18 },
    { x: 0, y: 0, w: 18, h: world.height },
    { x: world.width - 18, y: 0, w: 18, h: world.height },
    { x: 440, y: 170, w: 240, h: 28 }, { x: 760, y: 260, w: 220, h: 28 },
  ];
}

function addLocalPlayer(name) {
  const player = createPlayer(name, world.teamIds[0], false);
  world.localId = player.id;
  world.players.push(player);
  return player;
}

function addBot(name) {
  const team = world.teamIds[world.players.length % world.teamIds.length];
  world.players.push(createPlayer(name, team, true));
}

function resetMatchState() {
  world.matchId += 1;
  world.players = [];
  world.projectiles = [];
  world.particles = [];
  world.teamIds = TEAMS.slice(0, 2).map((t) => t.id);
  setupArena();
  world.teamScores = { red: 0, blue: 0 };
  world.timer = 180;
  world.matchLives = 3;
}

function collideWithWalls(player, nextX, nextY) {
  const radius = player.radius;
  for (const wall of world.walls) {
    const nearestX = clamp(nextX, wall.x + 1, wall.x + wall.w - 1);
    const nearestY = clamp(nextY, wall.y + 1, wall.y + wall.h - 1);
    const dx = nextX - nearestX;
    const dy = nextY - nearestY;
    if (dx * dx + dy * dy < radius * radius) {
      const angle = Math.atan2(dy, dx) || 0;
      const overlap = radius - Math.sqrt(dx * dx + dy * dy || 0.001);
      nextX += Math.cos(angle) * overlap;
      nextY += Math.sin(angle) * overlap;
    }
  }
  return { x: clamp(nextX, radius + 20, world.width - radius - 20), y: clamp(nextY, radius + 20, world.height - radius - 20) };
}

function movePlayer(player, dt) {
  if (!player.alive) {
    player.respawnTimer -= dt;
    if (player.respawnTimer <= 0 && player.lives !== 0) {
      player.x = 500; player.y = 500;
      player.hp = player.maxHp; player.alive = true; player.spawnShield = 4;
    }
    return;
  }

  const controls = player.bot ? input : player.networkUid && player.networkUid !== networkUid ? player.networkInput || {} : input;

  if (player.bot) {
    const skill = BOT_SKILLS[world.botDifficulty] || BOT_SKILLS.medium;
    const target = world.players.find((p) => p.id !== player.id && p.team !== player.team && p.alive);
    if (target) {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = player.speed * skill.speed;

      player.vx += ((dx / dist) * speed - player.vx) * (1 - Math.exp(-8 * dt));
      player.vy += ((dy / dist) * speed - player.vy) * (1 - Math.exp(-8 * dt));

      if (dist < skill.distance && player.fireCooldown <= 0) {
        shootProjectile(player, Math.atan2(dy, dx));
        player.fireCooldown = skill.fireDelay;
      }
      player.aim = Math.atan2(dy, dx);
    }
  } else {
    const dx = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const dy = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
    const mag = Math.hypot(dx, dy) || 1;
    
    if (dx || dy) {
      player.vx += ((dx / mag) * player.speed - player.vx) * 0.2;
      player.vy += ((dy / mag) * player.speed - player.vy) * 0.2;
    } else {
      player.vx *= 0.82;
      player.vy *= 0.82;
    }

    player.aim = Number.isFinite(controls.aim) ? controls.aim : Math.atan2(input.pointerY - player.y, input.pointerX - player.x);

    if (controls.shoot && player.fireCooldown <= 0) {
      shootProjectile(player, player.aim);
      player.fireCooldown = 0.17;
    }
  }

  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  const resolved = collideWithWalls(player, player.x + player.vx * dt, player.y + player.vy * dt);
  player.x = resolved.x;
  player.y = resolved.y;
}

function shootProjectile(player, angle) {
  if (!player.alive || world.projectiles.length >= 100) return;
  world.projectiles.push({
    x: player.x + Math.cos(angle) * 20,
    y: player.y + Math.sin(angle) * 20,
    vx: Math.cos(angle) * 690,
    vy: Math.sin(angle) * 690,
    team: player.team,
    ownerId: player.id,
    damage: 24 * player.damageMultiplier,
    ttl: 1.15,
    radius: 6,
  });
}

function updateProjectiles(dt) {
  for (let i = world.projectiles.length - 1; i >= 0; i -= 1) {
    const b = world.projectiles[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.ttl -= dt;
    if (b.ttl <= 0) { world.projectiles.splice(i, 1); continue; }

    for (const player of world.players) {
      if (!player.alive || player.id === b.ownerId || player.team === b.team) continue;
      if ((b.x - player.x) ** 2 + (b.y - player.y) ** 2 < (player.radius + b.radius) ** 2) {
        player.hp -= b.damage * (1 - player.damageResistance);
        if (player.hp <= 0) {
          player.alive = false; player.respawnTimer = 2;
          const shooter = world.players.find((p) => p.id === b.ownerId);
          if (shooter) {
            shooter.kills += 1;
            shooter.score += 10;
          }
        }
        world.projectiles.splice(i, 1);
        break;
      }
    }
  }
}

function updateMatch(dt) {
  world.timer = Math.max(0, world.timer - dt);
  if (world.timer <= 0) { world.phase = 'result'; setScreen('result'); return; }
  
  for (const player of world.players) {
    if (player.bot || (world.isHost && player.networkUid !== networkUid)) movePlayer(player, dt);
  }
  const local = world.players.find((p) => p.id === world.localId);
  if (local) movePlayer(local, dt);

  if (world.isHost) updateProjectiles(dt);
}

function drawArena() {
  const local = world.players.find((p) => p.id === world.localId) || world.players[0];
  const cameraX = local ? local.x : world.width / 2;
  const cameraY = local ? local.y : world.height / 2;

  ctx.save();
  ctx.translate(canvas.width / 2 - cameraX, canvas.height / 2 - cameraY);
  ctx.fillStyle = MAP_THEMES.reef.floor;
  ctx.fillRect(0, 0, world.width, world.height);

  for (const wall of world.walls) {
    ctx.fillStyle = MAP_THEMES.reef.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  }

  for (const player of world.players) {
    if (!player.alive) continue;
    ctx.fillStyle = getTeam(player.team).color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - 24);
  }

  for (const b of world.projectiles) {
    ctx.fillStyle = getTeam(b.team).color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function updateFrame(timestamp) {
  const dt = Math.min((timestamp - (world.lastTime || timestamp)) / 1000, 0.033);
  world.lastTime = timestamp;

  if (world.phase === 'match') {
    if (!world.roomCode || world.isHost) updateMatch(dt);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArena();
  requestAnimationFrame(updateFrame);
}

function bindInput() {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') input.up = true;
    if (e.code === 'KeyS') input.down = true;
    if (e.code === 'KeyA') input.left = true;
    if (e.code === 'KeyD') input.right = true;
    if (e.code === 'Space') input.shoot = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') input.up = false;
    if (e.code === 'KeyS') input.down = false;
    if (e.code === 'KeyA') input.left = false;
    if (e.code === 'KeyD') input.right = false;
    if (e.code === 'Space') input.shoot = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const local = world.players.find((p) => p.id === world.localId);
    input.pointerX = e.clientX - rect.left - canvas.width / 2 + (local?.x || 0);
    input.pointerY = e.clientY - rect.top - canvas.height / 2 + (local?.y || 0);
  });
}

function bindUi() {
  document.getElementById('openHost').addEventListener('click', () => setScreen('host'));
  document.getElementById('openJoin').addEventListener('click', () => setScreen('join'));
  document.getElementById('createRoom').addEventListener('click', () => {
    resetMatchState();
    addLocalPlayer('Player 1');
    addBot('Bot Alpha');
    world.phase = 'match';
    setScreen('match');
  });
  document.querySelectorAll('.backHome').forEach((b) => b.addEventListener('click', () => setScreen('menu')));
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
resetMatchState();
bindInput();
bindUi();
requestAnimationFrame(updateFrame);
