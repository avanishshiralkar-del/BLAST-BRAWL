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
  mapSpinRemaining: 0,
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

const MAPS = {
  reef: { name: 'Bouncy Reef', description: 'Coral barriers and tides.', theme: 'reef' },
  neon: { name: 'Neon Skyline', description: 'Night-lit lanes with speed pads.', theme: 'neon' },
  ember: { name: 'Ember Foundry', description: 'Molten workshop with lava vents.', theme: 'ember' },
  frost: { name: 'Frostbite Circuit', description: 'Slippery ice maze.', theme: 'frost' },
  jungle: { name: 'Overgrown Temple', description: 'Living jungle vines.', theme: 'jungle' },
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

const SKINS = [
  { id: 'rookie', name: 'Rookie', price: 0, rarity: 'Common', color: '#edf7ff', ability: 'Balanced starting skin.', speedMultiplier: 1, damageMultiplier: 1, maxHp: 100, damageResistance: 0 },
  { id: 'neon', name: 'Neon', price: 100, rarity: 'Rare', color: '#76faff', ability: '10% faster movement.', speedMultiplier: 1.1, damageMultiplier: 1, maxHp: 100, damageResistance: 0 },
];

const GUNS = [
  { id: 'pulse', name: 'Pulse', price: 0, rarity: 'Common', damage: 24, description: 'Starter blaster.' },
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

// THROTTLING CONSTANTS TO REDUCE MULTIPLAYER LAG & BANDWIDTH
const NETWORK_INPUT_INTERVAL_MS = 60; // ~16 inputs per second for snappy response without spamming
const NETWORK_STATE_INTERVAL_MS = 120; // ~8 state broadcasts per second for ultra-smooth netcode

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

function showNetworkError(message) {
  accountStatusEl.textContent = message;
}

function describeFirebaseError(error) {
  return error?.message || 'Unknown Firebase error.';
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

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function getNetworkPlayerData(player, uid = networkUid) {
  return {
    uid,
    name: player.name,
    team: player.team,
    bot: Boolean(player.bot),
    skinId: player.skinId,
    weaponLevel: player.weaponLevel,
    speed: player.speed,
    maxHp: player.maxHp,
    damageMultiplier: player.damageMultiplier,
    damageResistance: player.damageResistance,
  };
}

function createNetworkPlayer(data) {
  const player = createPlayer(data.name, data.team || world.teamIds[0], Boolean(data.bot));
  player.id = data.bot ? data.uid : `player-${data.uid}`;
  player.networkUid = data.uid;
  player.name = String(data.name || 'Rookie').slice(0, 18);
  player.team = world.teamIds.includes(data.team) ? data.team : world.teamIds[0];
  return player;
}

function stopNetworkListeners() {
  for (const stop of networkStops) stop();
  networkStops = [];
  remoteInputs = {};
}

async function leaveNetworkRoom() {
  stopNetworkListeners();
  const roomCode = world.roomCode;
  const isHost = world.isHost;
  if (!isHost && networkInputExists && roomCode && firebaseApi && realtimeDb && networkUid) {
    await firebaseApi.remove(firebaseApi.ref(realtimeDb, `rooms/${roomCode}/inputs/${networkUid}`)).catch(() => {});
  }
  if (networkPlayerRef && firebaseApi) {
    await firebaseApi.remove(networkPlayerRef).catch(() => {});
  }
  if (isHost && networkRoomRef && firebaseApi) {
    await firebaseApi.remove(networkRoomRef).catch(() => {});
  }
  networkPlayerRef = null;
  networkInputExists = false;
  networkRoomRef = null;
  networkHostUid = '';
  world.roomCode = '';
  world.isHost = false;
}

function subscribeToRoom(roomData) {
  stopNetworkListeners();
  if (!networkRoomRef) return;
  const playersRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/players`);
  const inputsRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/inputs`);
  const matchRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/match`);
  const stateRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/state`);

  const playersStop = firebaseApi.onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    for (const [uid, data] of Object.entries(players)) {
      if (!world.players.some((p) => p.networkUid === uid)) {
        world.players.push(createNetworkPlayer({ ...data, uid }));
      }
    }
  });

  const inputsStop = firebaseApi.onValue(inputsRef, (snapshot) => {
    remoteInputs = snapshot.val() || {};
    if (world.isHost) {
      for (const player of world.players) {
        if (player.networkUid && player.networkUid !== networkUid) {
          player.networkInput = remoteInputs[player.networkUid] || {};
        }
      }
    }
  });

  const stateStop = firebaseApi.onValue(stateRef, (snapshot) => {
    const state = snapshot.val();
    if (!state || world.isHost) return;
    applyNetworkState(state);
  });

  networkStops.push(playersStop, inputsStop, stateStop);
}

function applyNetworkState(state) {
  world.phase = state.phase;
  world.timer = Number(state.timer) || 0;
  world.teamScores = state.teamScores || world.teamScores;
  
  if (Array.isArray(state.players)) {
    const existing = new Map(world.players.map((p) => [p.id, p]));
    world.players = state.players.map((snapshot) => {
      const playerId = !snapshot.bot && snapshot.networkUid ? `player-${snapshot.networkUid}` : snapshot.id;
      const previous = existing.get(playerId) || {};
      const player = { ...previous, ...snapshot, id: playerId };
      
      // SMOOTH LERP INTERPOLATION FOR GUESTS TO ELIMINATE STUTTER/LAG
      if (!world.isHost && previous.alive && Number.isFinite(previous.x)) {
        player.x = previous.x + (snapshot.x - previous.x) * 0.45;
        player.y = previous.y + (snapshot.y - previous.y) * 0.45;
      }
      return player;
    });
  }
  if (Array.isArray(state.projectiles)) world.projectiles = state.projectiles;
}

function createPlayer(name, team, isBot = false) {
  const spawn = { x: 500 + Math.random() * 200, y: 500 + Math.random() * 200 };
  return {
    id: isBot ? `bot-${randomId()}` : `player-${randomId()}`,
    name: name || 'Rookie',
    team,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    radius: 16,
    speed: isBot ? 200 : 235,
    maxHp: 100,
    hp: 100,
    skinId: 'rookie',
    damageMultiplier: 1,
    damageResistance: 0,
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
    botStrafePhase: Math.random() * Math.PI * 2,
  };
}

function overlapsWall(x, y, margin = 48) {
  return world.walls.some((wall) =>
    x + margin > wall.x && x - margin < wall.x + wall.w &&
    y + margin > wall.y && y - margin < wall.y + wall.h
  );
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

function getNearestEnemy(player) {
  let best = null; let bestDist = Infinity;
  for (const other of world.players) {
    if (other.id === player.id || other.team === player.team || !other.alive) continue;
    const dist = (other.x - player.x) ** 2 + (other.y - player.y) ** 2;
    if (dist < bestDist) { bestDist = dist; best = other; }
  }
  return best;
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
    const target = getNearestEnemy(player);
    if (target) {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      const moveX = dx / dist; const moveY = dy / dist;
      const speed = player.speed * skill.speed;

      player.vx += (moveX * speed - player.vx) * (1 - Math.exp(-8 * dt));
      player.vy += (moveY * speed - player.vy) * (1 - Math.exp(-8 * dt));

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

    if (controls.dash && player.dashCooldown <= 0) {
      player.vx += Math.cos(player.aim) * 420;
      player.vy += Math.sin(player.aim) * 420;
      player.dashCooldown = 1.25;
    }
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
    damage: 24,
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
        player.hp -= b.damage;
        if (player.hp <= 0) {
          player.alive = false; player.respawnTimer = 2;
          const shooter = world.players.find((p) => p.id === b.ownerId);
          if (shooter) shooter.kills += 1;
        }
        world.projectiles.splice(i, 1);
        break;
      }
    }
  }
}

// THROTTLED NETWORK INPUT SENDER (Reduces network lag & packet flood)
function publishNetworkInput(timestamp) {
  if (world.isHost || !networkPlayerRef || !firebaseApi || networkInputWritePending || timestamp - lastNetworkInputAt < NETWORK_INPUT_INTERVAL_MS) return;
  lastNetworkInputAt = timestamp;
  const local = world.players.find((p) => p.id === world.localId);
  if (!local) return;

  const controls = {
    left: input.left, right: input.right, up: input.up, down: input.down,
    shoot: input.shoot, dash: input.dash, aim: Math.atan2(input.pointerY - local.y, input.pointerX - local.x),
  };
  networkInputWritePending = true;
  void firebaseApi.set(firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/inputs/${networkUid}`), controls).then(() => {
    networkInputWritePending = false;
    networkInputExists = true;
  }).catch(() => { networkInputWritePending = false; });
}

// THROTTLED HOST STATE BROADCASTER (Reduces bandwidth and lag peaks)
function publishNetworkState(timestamp) {
  if (!world.isHost || !networkRoomRef || !firebaseApi || networkStateWritePending || timestamp - lastNetworkStateAt < NETWORK_STATE_INTERVAL_MS) return;
  lastNetworkStateAt = timestamp;

  const state = {
    sentAt: Date.now(),
    phase: world.phase,
    timer: world.timer,
    teamScores: world.teamScores,
    players: world.players.map((p) => ({
      id: p.id, networkUid: p.networkUid, name: p.name, team: p.team, bot: p.bot,
      x: p.x, y: p.y, vx: p.vx, vy: p.vy, hp: p.hp, maxHp: p.maxHp, alive: p.alive,
    })),
    projectiles: world.projectiles,
  };
  networkStateWritePending = true;
  void firebaseApi.set(firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/state`), state).then(() => {
    networkStateWritePending = false;
  }).catch(() => { networkStateWritePending = false; });
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
  updateHud();
}

function updateHud() {
  const mins = Math.floor(world.timer / 60).toString().padStart(2, '0');
  const secs = Math.floor(world.timer % 60).toString().padStart(2, '0');
  timerEl.textContent = `${mins}:${secs}`;
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
    else {
      publishNetworkInput(timestamp);
      updateMatch(dt);
    }
  }
  publishNetworkState(timestamp);

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
