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
const settingsPanel = document.getElementById('settingsPanel');
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
const matchChatEl = document.getElementById('matchChat');
const chatMessagesEl = document.getElementById('chatMessages');
const chatInputEl = document.getElementById('chatInput');
const matchRewardModalEl = document.getElementById('matchRewardModal');
const rewardTokensEl = document.getElementById('rewardTokens');
const rewardXpEl = document.getElementById('rewardXp');
const rewardStatusEl = document.getElementById('rewardStatus');
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
const friendRequestsEl = document.getElementById('friendRequests');

const world = {
  width: 2600,
  height: 1700,
  phase: 'menu',
  pausedPhase: 'match',
  roomCode: '',
  timer: 180,
  matchLives: 3,
  mapSpinRemaining: 0,
  mapRevealRemaining: 0,
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
  chatMessages: [],
  lastTime: 0,
  settings: {
    volume: 0.8,
    sensitivity: 1,
  },
  mapId: 'reef',
  customTiles: [],
  mapName: 'Bouncy Reef',
  botDifficulty: 'medium',
};
let previousScreen = 'menu';
let minigameScore = 0;
const PICKUP_RESPAWN = {
  token: [24, 40],
  health: [36, 58],
  weapon: [55, 85],
  life: [75, 110],
  invincibility: [90, 135],
};

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  shoot: false,
  dash: false,
  use: false,
  pointerX: 0,
  pointerY: 0,
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
  reef: {
    name: 'Bouncy Reef',
    description: 'Coral barriers, a roaming saw, and a pulsing tide pool.',
    theme: 'reef',
    special: 'TIDAL POOL',
  },
  neon: {
    name: 'Neon Skyline',
    description: 'Night-lit lanes with electric pads that fling you forward.',
    theme: 'neon',
    special: 'BOOST PADS',
  },
  ember: {
    name: 'Ember Foundry',
    description: 'A molten workshop where glowing lava vents punish campers.',
    theme: 'ember',
    special: 'LAVA VENTS',
  },
  frost: {
    name: 'Frostbite Circuit',
    description: 'A slippery ice maze with freezing patches and tight turns.',
    theme: 'frost',
    special: 'BLACK ICE',
  },
  jungle: {
    name: 'Overgrown Temple',
    description: 'Ancient stone lanes wrapped in a dangerous living jungle.',
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
  easy: { label: 'Easy', description: 'Slow, inaccurate bots that give you room to learn.', speed: 0.65, distance: 330, jitter: 0.48, fireDelay: 0.72 },
  medium: { label: 'Medium', description: 'Balanced bots with steady aim and pressure.', speed: 0.84, distance: 450, jitter: 0.24, fireDelay: 0.43 },
  hard: { label: 'Hard', description: 'Fast pursuers that shoot accurately from farther away.', speed: 1.04, distance: 570, jitter: 0.11, fireDelay: 0.29 },
  nightmare: { label: 'Nightmare', description: 'Relentless, very accurate bots with quick shots and long reach.', speed: 1.2, distance: 690, jitter: 0.035, fireDelay: 0.2 },
};
const SKINS = [
  {
    id: 'rookie', name: 'Rookie', price: 0, rarity: 'Common', color: '#edf7ff',
    ability: 'No bonus. A balanced starting skin.',
    speedMultiplier: 1, damageMultiplier: 1, maxHp: 100, damageResistance: 0,
  },
  {
    id: 'neon', name: 'Neon', price: 100, rarity: 'Rare', color: '#76faff',
    ability: 'Quickstep: 10% faster movement.',
    speedMultiplier: 1.1, damageMultiplier: 1, maxHp: 100, damageResistance: 0,
  },
  {
    id: 'ember', name: 'Ember', price: 250, rarity: 'Epic', color: '#ff8657',
    ability: 'Hotshot: 12% more weapon damage and 10 extra health.',
    speedMultiplier: 1, damageMultiplier: 1.12, maxHp: 110, damageResistance: 0,
  },
  {
    id: 'frost', name: 'Frost', price: 500, rarity: 'Legendary', color: '#d7fbff',
    ability: 'Glacier: 8% faster, 18% more weapon damage, 20 extra health, and 10% damage resistance.',
    speedMultiplier: 1.08, damageMultiplier: 1.18, maxHp: 120, damageResistance: 0.1,
  },
];
const GUNS = [
  { id: 'pulse', name: 'Pulse', price: 0, rarity: 'Common', damage: 24, description: 'Reliable starter blaster.' },
  { id: 'burst', name: 'Burst', price: 100, rarity: 'Rare', damage: 30, description: 'Faster, punchier shots.' },
  { id: 'scatter', name: 'Scatter', price: 250, rarity: 'Epic', damage: 40, description: 'Heavy shots with a wider hitbox.' },
  { id: 'rail', name: 'Rail', price: 500, rarity: 'Legendary', damage: 58, description: 'The hardest-hitting arena gun.' },
];
const TOKENS_PER_KILL = 10;
const DAILY_TOKEN_CAP = 100;
let customMaps = [];
let editorTiles = [];
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
const NETWORK_INPUT_INTERVAL_MS = 80;
const NETWORK_STATE_INTERVAL_MS = 200;
let networkInputWritePending = false;
let networkStateWritePending = false;
let lastAppliedMatchId = '';
let lastPublishedRoomPhase = '';
let lastNetworkErrorAt = 0;
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
  if (Date.now() - lastNetworkErrorAt < 3000) return;
  lastNetworkErrorAt = Date.now();
  showToast(message);
}

function describeFirebaseError(error) {
  const messages = {
    'auth/configuration-not-found': 'Firebase Authentication is not set up for this project. Enable the sign-in provider you are using in Firebase Console → Authentication → Sign-in method.',
    'auth/operation-not-allowed': 'This sign-in method is disabled. In Firebase Console → Authentication → Sign-in method, enable Google for Google login or Email/Password for email login.',
    'auth/unauthorized-domain': `This domain (${location.hostname || 'file://'}) is not authorized for Firebase Authentication. Add the deployed domain in Firebase Console → Authentication → Settings → Authorized domains. For local testing, use localhost rather than a file:// page.`,
    'auth/popup-blocked': 'The browser blocked the Google sign-in popup. Allow popups for this site, or use the email sign-in form below.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before sign-in finished. Reopen it and complete the Google flow.',
    'auth/cancelled-popup-request': 'Another Google sign-in popup is already open. Finish or close it, then try again.',
    'auth/network-request-failed': 'Firebase could not reach its authentication service. Check your internet connection and try again.',
    'auth/email-already-in-use': 'An account already uses this email. Choose “Sign in with email” instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/invalid-credential': 'Email or password is incorrect, or this account uses a different sign-in method.',
    'auth/invalid-login-credentials': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account was found for that email. Choose “Create account” first.',
    'auth/wrong-password': 'The password is incorrect.',
    'auth/too-many-requests': 'Too many sign-in attempts. Wait a little while, then try again.',
    'auth/invalid-api-key': 'The Firebase API key is invalid. Copy the web app configuration from the same Firebase project.',
    'auth/invalid-project-id': 'The Firebase project ID is invalid. Check firebase-config.js against the web app settings in Firebase Console.',
    'auth/admin-restricted-operation': 'Anonymous sign-in is disabled. Enable the Anonymous provider in Firebase Authentication.',
    'auth/operation-not-allowed': 'This sign-in provider is disabled in Firebase Authentication.',
    'PERMISSION_DENIED': 'Firebase Realtime Database denied access. Publish database.rules.json in the Realtime Database Rules tab and confirm you are signed in.',
    'NETWORK_ERROR': 'Could not reach Firebase Realtime Database. Check your connection and the databaseURL in firebase-config.js.',
  };
  const code = error?.code || '';
  return messages[code] || (code.includes('PERMISSION_DENIED')
    ? messages.PERMISSION_DENIED
    : error?.message || 'Unknown Firebase error.');
}

function addConfiguredBots() {
  const names = ['Nova', 'Kite', 'Blitz', 'Sable', 'Riot', 'Mira', 'Quill', 'Vex', 'Jinx', 'Rook', 'Echo'];
  const count = clamp(Number(botCountInput.value) || 0, 0, 11);
  for (let i = 0; i < count; i += 1) addBot(names[i]);
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
  if (screen !== 'lobby' && screen !== 'match') document.getElementById('gameMenu').classList.add('hidden');
  if (screen === 'match') {
    phaseBanner.textContent = 'Chaos in motion';
    document.getElementById('hostPause').classList.toggle('hidden', !world.isHost);
    document.getElementById('menuLeave').textContent = 'Leave game';
  } else if (screen === 'lobby') {
    document.getElementById('hostPause').classList.add('hidden');
    document.getElementById('menuLeave').textContent = 'Leave lobby';
    const startButton = document.getElementById('startMatch');
    startButton.disabled = !world.isHost;
    startButton.textContent = world.isHost ? 'Start match' : 'Waiting for host';
  } else if (screen === 'pause') {
    document.getElementById('resumeMatch').disabled = !world.isHost;
  }
}

function openHelp() {
  const inMatch = ['match', 'countdown', 'mapSpin'].includes(world.phase);
  previousScreen = inMatch ? 'match' : world.phase === 'lobby' ? 'lobby' : 'menu';
  if (inMatch) {
    world.pausedPhase = world.phase;
    world.phase = 'pause';
  }
  setScreen('help');
}

function returnFromHelp() {
  if (previousScreen === 'match') {
    world.phase = world.pausedPhase;
    setScreen('match');
  } else {
    setScreen(previousScreen);
  }
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
    maxWeaponLevel: player.maxWeaponLevel,
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
  if (!player.bot) {
    player.skinId = SKINS.some((skin) => skin.id === data.skinId) ? data.skinId : 'rookie';
    const skin = SKINS.find((entry) => entry.id === player.skinId) || SKINS[0];
    player.speed = skin.speedMultiplier * 235;
    player.maxHp = skin.maxHp;
    player.hp = player.maxHp;
    player.damageMultiplier = skin.damageMultiplier;
    player.damageResistance = skin.damageResistance;
  }
  player.maxWeaponLevel = clamp(Number(data.maxWeaponLevel) || 0, 0, 3);
  player.weaponLevel = clamp(Number(data.weaponLevel) || 0, 0, player.maxWeaponLevel);
  player.lives = world.matchLives;
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
  const operations = [];
  if (!isHost && networkInputExists && roomCode && firebaseApi && realtimeDb && networkUid) {
    operations.push([
      `rooms/${roomCode}/inputs/${networkUid}`,
      firebaseApi.remove(firebaseApi.ref(realtimeDb, `rooms/${roomCode}/inputs/${networkUid}`)),
    ]);
  }
  if (networkPlayerRef && firebaseApi) {
    operations.push([`rooms/${roomCode}/players/${networkUid}`, firebaseApi.remove(networkPlayerRef)]);
  }
  if (isHost && networkRoomRef && firebaseApi) {
    operations.push([`rooms/${roomCode}`, firebaseApi.remove(networkRoomRef)]);
  }
  networkPlayerRef = null;
  networkInputExists = false;
  networkRoomRef = null;
  networkHostUid = '';
  lastPublishedRoomPhase = '';
  world.roomCode = '';
  world.isHost = false;
  const failures = [];
  for (const [path, operation] of operations) {
    try {
      await operation;
    } catch (error) {
      failures.push(`${path}: ${describeFirebaseError(error)}`);
    }
  }
  if (failures.length) {
    throw new Error(`Could not fully clean up the room: ${failures.join('; ')}`);
  }
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
    if (!world.isHost && networkHostUid && !players[networkHostUid]) {
      showToast('The host left. This room has ended.');
      void leaveNetworkRoom().then(() => {
        world.phase = 'menu';
        setScreen('menu');
      }).catch((error) => {
        showToast(`The host left, but local cleanup failed: ${describeFirebaseError(error)}`);
      });
      return;
    }
    for (const player of [...world.players]) {
      if (player.networkUid && player.networkUid !== networkUid && !players[player.networkUid]) {
        world.players.splice(world.players.indexOf(player), 1);
      }
    }
    for (const [uid, data] of Object.entries(players)) {
      let player = world.players.find((entry) => entry.networkUid === uid);
      if (!player) {
        if (world.isHost) {
          const counts = Object.fromEntries(world.teamIds.map((id) => [
            id, world.players.filter((entry) => entry.team === id).length,
          ]));
          const team = world.teamIds.reduce((least, id) => counts[id] < counts[least] ? id : least);
          player = createNetworkPlayer({ ...data, uid, team });
          world.players.push(player);
          void firebaseApi.update(firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/players/${uid}`), { team });
        } else {
          player = createNetworkPlayer({ ...data, uid });
          world.players.push(player);
        }
      } else if (!world.isHost || uid === networkUid) {
        player.name = String(data.name || player.name).slice(0, 18);
        if (world.teamIds.includes(data.team)) player.team = data.team;
      }
    }
    updateLobbyPlayers();
  }, (error) => {
    showNetworkError(`Could not read room players: ${describeFirebaseError(error)}`);
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
  }, (error) => {
    showNetworkError(`Could not receive player controls: ${describeFirebaseError(error)}`);
  });
  const matchStop = firebaseApi.onValue(matchRef, (snapshot) => {
    const match = snapshot.val();
    if (!match || world.isHost || match.id === lastAppliedMatchId) return;
    lastAppliedMatchId = match.id;
    beginNetworkMatch(match);
  }, (error) => {
    const message = error?.code === 'PERMISSION_DENIED'
      ? `Guest access denied reading rooms/${world.roomCode}/match. Publish the current database.rules.json to the Realtime Database used by firebase-config.js.`
      : `Could not receive match start: ${describeFirebaseError(error)}`;
    showNetworkError(message);
  });
  const stateStop = firebaseApi.onValue(stateRef, (snapshot) => {
    const state = snapshot.val();
    if (!state || world.isHost) return;
    applyNetworkState(state);
  }, (error) => {
    const message = error?.code === 'PERMISSION_DENIED'
      ? `Guest access denied reading rooms/${world.roomCode}/state. Publish the current database.rules.json to the Realtime Database used by firebase-config.js.`
      : `Could not receive the match: ${describeFirebaseError(error)}`;
    showNetworkError(message);
  });
  networkStops.push(playersStop, inputsStop, matchStop, stateStop);
  if (roomData?.players) {
    for (const [uid, data] of Object.entries(roomData.players)) {
      if (!world.players.some((player) => player.networkUid === uid)) {
        const player = createNetworkPlayer({ ...data, uid });
        world.players.push(player);
      }
    }
    updateLobbyPlayers();
  }
}

function beginNetworkMatch(match) {
  if (match.customMap && !customMaps.some((map) => map.id === match.customMap.id)) {
    customMaps.push(match.customMap);
  }
  world.teamIds = TEAMS.slice(0, clamp(Number(match.teamCount) || 2, 2, 4)).map((team) => team.id);
  refreshMapOptions(match.mapId);
  teamCountInput.value = String(match.teamCount);
  matchDurationInput.value = String(match.duration);
  matchLivesInput.value = String(match.lives);
  botDifficultyInput.value = match.botDifficulty;
  world.matchLives = Number(match.lives) || 3;
  setupArena();
  world.players.forEach((player, index) => {
    const spawn = world.spawnPoints[index % world.spawnPoints.length];
    if (!spawn) return;
    player.x = spawn.x;
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.lives = world.matchLives;
  });
  world.matchId += 1;
  world.matchRewardHandled = false;
  world.networkKillCount = 0;
  world.matchRewardState = { id: world.matchId, tokensEarned: 0, tokenError: '' };
  world.matchTokensEarned = 0;
  world.matchTokenError = '';
  world.tokenAwardPromises.clear();
  world.projectiles = [];
  world.teamScores = Object.fromEntries(world.teamIds.map((teamId) => [teamId, 0]));
  world.phase = 'countdown';
  world.mapSpinRemaining = 2;
  world.countdownRemaining = 5;
  world.timer = Number(match.duration) || 180;
  world.cameraZoom = 1;
  renderMapCarousel();
  world.roomCode = match.roomCode || world.roomCode;
  renderMapCarousel();
  renderTeamScores();
  setScreen('match');
  updateHud();
}

function applyNetworkState(state) {
  const snapshotAge = Number.isFinite(state.sentAt)
    ? clamp((Date.now() - state.sentAt) / 1000, 0, 0.5)
    : 0;
  world.networkStateAge = snapshotAge;
  world.phase = state.phase;
  world.timer = Number(state.timer) || 0;
  world.mapId = state.mapId || world.mapId;
  world.mapName = state.mapName || world.mapName;
  world.mapSpinRemaining = Number(state.mapSpinRemaining) || 0;
  world.countdownRemaining = Number(state.countdownRemaining) || 0;
  world.matchEndReason = state.matchEndReason || '';
  world.teamScores = state.teamScores || world.teamScores;
  if (Array.isArray(state.players)) {
    const existing = new Map(world.players.map((player) => [player.id, player]));
    world.players = state.players.map((snapshot) => {
      const playerId = !snapshot.bot && snapshot.networkUid
        ? `player-${snapshot.networkUid}`
        : snapshot.id;
      const previous = existing.get(playerId) || {};
      const player = { ...previous, ...snapshot, id: playerId };
      if (!world.isHost && player.alive && Number.isFinite(player.x) && Number.isFinite(player.y)) {
        const predicted = collideWithWalls(
          player,
          player.x + (player.vx || 0) * snapshotAge,
          player.y + (player.vy || 0) * snapshotAge
        );
        if (previous.alive && Number.isFinite(previous.x) && Number.isFinite(previous.y)) {
          player.x = previous.x + (predicted.x - previous.x) * 0.65;
          player.y = previous.y + (predicted.y - previous.y) * 0.65;
        } else {
          player.x = predicted.x;
          player.y = predicted.y;
        }
      }
      return player;
    });
    const updatedLocal = getLocalPlayer();
    const reportedKills = Math.max(0, Number(updatedLocal?.kills) || 0);
    const newKills = Math.max(0, reportedKills - world.networkKillCount);
    world.networkKillCount = Math.max(world.networkKillCount, reportedKills);
    for (let index = 0; index < newKills; index += 1) {
      awardLocalKillReward();
    }
  }
  if (Array.isArray(state.projectiles)) {
    world.projectiles = state.projectiles
      .map((projectile) => ({
        ...projectile,
        x: projectile.x + projectile.vx * snapshotAge,
        y: projectile.y + projectile.vy * snapshotAge,
        ttl: projectile.ttl - snapshotAge,
      }))
      .filter((projectile) => projectile.ttl > 0);
  }
  if (Array.isArray(state.pickups)) world.pickups = state.pickups;
  if (Array.isArray(state.hazards)) world.hazards = state.hazards;
  if (state.grandToken) world.grandToken = state.grandToken;
  if (state.phase === 'result' && !world.matchRewardHandled) {
    endMatch(state.matchEndReason || 'time');
  } else if (state.phase === 'match' || state.phase === 'countdown') {
    setScreen('match');
    updateHud();
  } else if (state.phase === 'pause') {
    world.pausedPhase = 'match';
    setScreen('pause');
  }
}

function createPlayer(name, team, isBot = false) {
  const spawn = getSpawnPoint();
  const skin = !isBot
    ? SKINS.find((entry) => entry.id === signedInUser?.equippedSkin) || SKINS[0]
    : SKINS[0];
  const ownedGuns = isBot ? GUNS.map((gun) => gun.id) : signedInUser?.guns?.length ? signedInUser.guns : ['pulse'];
  const ownedWeaponLevel = Math.max(0, ...ownedGuns.map((gunId) => GUNS.findIndex((gun) => gun.id === gunId)));
  const equippedWeaponLevel = Math.max(0, GUNS.findIndex((gun) => gun.id === signedInUser?.equippedGun));
  const maxHp = isBot ? 100 : skin.maxHp;
  return {
    id: isBot ? `bot-${randomId()}` : `player-${randomId()}`,
    name: name || 'Rookie',
    team,
    x: spawn.x,
    y: spawn.y,
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
    weaponLevel: isBot ? 0 : Math.min(equippedWeaponLevel, ownedWeaponLevel),
    maxWeaponLevel: isBot ? 3 : ownedWeaponLevel,
    ownedWeaponLevel,
    navigationTimer: 0,
    navigationWaypoint: null,
    navigationTargetId: null,
    botStrafePhase: Math.random() * Math.PI * 2,
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

function overlapsWall(x, y, margin = 48) {
  return world.walls.some((wall) =>
    x + margin > wall.x && x - margin < wall.x + wall.w &&
    y + margin > wall.y && y - margin < wall.y + wall.h
  );
}

function createSpawnPoints() {
  const candidates = [];
  const columns = 6;
  const rows = 4;
  const cellWidth = world.width / columns;
  const cellHeight = world.height / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = (column + 0.5) * cellWidth + (Math.random() - 0.5) * 100;
      const y = (row + 0.5) * cellHeight + (Math.random() - 0.5) * 90;
      if (!overlapsWall(x, y)) candidates.push({ x, y });
    }
  }

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  world.spawnPoints = [];
  for (const candidate of candidates) {
    const spacedOut = world.spawnPoints.every((point) =>
      Math.hypot(point.x - candidate.x, point.y - candidate.y) >= 220
    );
    if (spacedOut) world.spawnPoints.push(candidate);
  }

  for (let attempt = 0; world.spawnPoints.length < 12 && attempt < 1000; attempt += 1) {
    const candidate = {
      x: 100 + Math.random() * (world.width - 200),
      y: 100 + Math.random() * (world.height - 200),
    };
    const spacedOut = !overlapsWall(candidate.x, candidate.y) &&
      world.spawnPoints.every((point) =>
        Math.hypot(point.x - candidate.x, point.y - candidate.y) >= 180
      );
    if (spacedOut) world.spawnPoints.push(candidate);
  }
}

function getSpawnPoint() {
  if (world.spawnPoints.length === 0) {
    return { x: world.width / 2, y: world.height / 2 };
  }
  const point = world.spawnPoints[world.nextSpawnIndex % world.spawnPoints.length];
  world.nextSpawnIndex += 1;
  return { x: point.x, y: point.y };
}

function getSelectedMap() {
  const selected = mapSelectInput.value || world.mapId;
  if (selected.startsWith('custom:')) {
    return customMaps.find((map) => `custom:${map.id}` === selected) || MAPS.reef;
  }
  return MAPS[selected] || MAPS.reef;
}

function makeWalls() {
  const layouts = {
    reef: [
      { x: 440, y: 170, w: 240, h: 28 }, { x: 760, y: 260, w: 220, h: 28 },
      { x: 440, y: 560, w: 230, h: 28 }, { x: 1010, y: 570, w: 220, h: 28 },
      { x: 1060, y: 300, w: 34, h: 260 }, { x: 700, y: 430, w: 280, h: 30 },
    ],
    neon: [
      { x: 360, y: 260, w: 400, h: 28 }, { x: 840, y: 140, w: 28, h: 350 },
      { x: 1060, y: 400, w: 450, h: 28 }, { x: 1780, y: 210, w: 28, h: 380 },
      { x: 360, y: 1100, w: 440, h: 28 }, { x: 1040, y: 900, w: 28, h: 420 },
      { x: 1420, y: 1200, w: 420, h: 28 }, { x: 2060, y: 840, w: 28, h: 400 },
    ],
    ember: [
      { x: 300, y: 350, w: 500, h: 34 }, { x: 980, y: 180, w: 34, h: 420 },
      { x: 1220, y: 330, w: 520, h: 34 }, { x: 1850, y: 200, w: 34, h: 440 },
      { x: 460, y: 1120, w: 34, h: 360 }, { x: 760, y: 970, w: 480, h: 34 },
      { x: 1560, y: 1060, w: 34, h: 400 }, { x: 1750, y: 1250, w: 500, h: 34 },
    ],
    frost: [
      { x: 420, y: 180, w: 28, h: 470 }, { x: 420, y: 180, w: 480, h: 28 },
      { x: 870, y: 430, w: 480, h: 28 }, { x: 1320, y: 170, w: 28, h: 470 },
      { x: 1680, y: 820, w: 28, h: 470 }, { x: 1250, y: 1250, w: 460, h: 28 },
      { x: 740, y: 1030, w: 28, h: 400 }, { x: 2000, y: 330, w: 380, h: 28 },
    ],
    jungle: [
      { x: 300, y: 200, w: 350, h: 34 }, { x: 720, y: 300, w: 34, h: 420 },
      { x: 960, y: 250, w: 400, h: 34 }, { x: 1450, y: 220, w: 34, h: 450 },
      { x: 1730, y: 410, w: 520, h: 34 }, { x: 420, y: 1080, w: 520, h: 34 },
      { x: 1080, y: 980, w: 34, h: 430 }, { x: 1460, y: 1200, w: 520, h: 34 },
    ],
  };
  const map = getSelectedMap();
  world.mapId = map.theme || map.id || 'reef';
  world.mapName = map.name;
  world.botDifficulty = botDifficultyInput.value || 'medium';
  const boundaryWalls = [
    { x: 0, y: 0, w: world.width, h: 18 },
    { x: 0, y: world.height - 18, w: world.width, h: 18 },
    { x: 0, y: 0, w: 18, h: world.height },
    { x: world.width - 18, y: 0, w: 18, h: world.height },
  ];
  if (map.cells) {
    world.walls = boundaryWalls.concat(map.cells.filter((cell) => cell.type === 'wall').map((cell) => ({
      x: 100 + cell.col * 100,
      y: 100 + cell.row * 100,
      w: 82,
      h: 82,
    })));
    world.customTiles = map.cells;
    return;
  }
  world.customTiles = [];
  world.walls = [
    ...boundaryWalls,
    ...(layouts[map.theme || map.id] || layouts.reef),
  ];
}

function makePickups() {
  const points = [
    { x: 260, y: 240, type: 'token' }, { x: 1220, y: 240, type: 'token' },
    { x: 2150, y: 280, type: 'token' }, { x: 1940, y: 1250, type: 'token' },
    { x: 840, y: 1380, type: 'token' }, { x: 1200, y: 880, type: 'token' },
    { x: 470, y: 790, type: 'life' }, { x: 1340, y: 390, type: 'health' },
    { x: 2210, y: 1450, type: 'health' }, { x: 960, y: 1110, type: 'weapon' },
    { x: 1870, y: 510, type: 'weapon' }, { x: 1450, y: 840, type: 'invincibility' }
  ];
  world.pickups = points.map((point, index) => ({
    id: `token-${index}`,
    x: point.x,
    y: point.y,
    type: point.type,
    value: 8,
    pulse: Math.random() * Math.PI * 2,
    active: true,
    respawnAt: 0,
  }));
  world.grandToken = {
    x: world.width / 2,
    y: world.height / 2,
    holderId: null,
    active: true,
    pulse: 0,
  };
}

function makeHazards() {
  const basicSaw = { kind: 'saw', x: world.width / 2, y: 340, radius: 54, angle: 0, speed: 1.3, active: true };
  const presets = {
    reef: [basicSaw, { kind: 'storm', x: 900, y: 760, radius: 180, tick: 0, active: false }],
    neon: [{ kind: 'boost', x: 500, y: 760, radius: 74, active: true }, { kind: 'boost', x: 2100, y: 900, radius: 74, active: true }, { ...basicSaw, y: 830 }],
    ember: [{ kind: 'lava', x: 720, y: 720, radius: 100, active: true }, { kind: 'lava', x: 1880, y: 900, radius: 112, active: true }, { ...basicSaw, y: 1120 }],
    frost: [{ kind: 'ice', x: 760, y: 710, radius: 138, active: true }, { kind: 'ice', x: 1920, y: 920, radius: 138, active: true }, { ...basicSaw, y: 850 }],
    jungle: [{ kind: 'venom', x: 670, y: 800, radius: 96, active: true }, { kind: 'storm', x: 1840, y: 850, radius: 160, tick: 1, active: false }, { ...basicSaw, y: 1040 }],
  };
  const theme = getSelectedMap().theme || getSelectedMap().id;
  world.hazards = (presets[theme] || presets.reef).map((hazard) => ({ ...hazard }));
}

function setupArena() {
  makeWalls();
  createSpawnPoints();
  world.nextSpawnIndex = 0;
  makePickups();
  makeHazards();
  const map = getSelectedMap();
  const themeHazards = { reef: 'storm', neon: 'boost', ember: 'lava', frost: 'ice', jungle: 'venom' };
  if (map.cells) {
    for (const [index, cell] of map.cells.entries()) {
      if (cell.type === 'hazard' || cell.type === 'boost') {
        world.hazards.push({
          kind: cell.type === 'boost' ? 'boost' : themeHazards[map.theme] || 'storm',
          x: 150 + cell.col * 100,
          y: 150 + cell.row * 100,
          radius: cell.type === 'boost' ? 44 : 48,
          active: true,
          tick: index,
        });
      }
    }
  }
}

function addLocalPlayer(name) {
  const player = createPlayer(name, world.teamIds[0], false);
  world.localId = player.id;
  world.players.push(player);
  input.pointerX = player.x + 100;
  input.pointerY = player.y;
  return player;
}

function addBot(name) {
  const counts = Object.fromEntries(world.teamIds.map((teamId) => [
    teamId,
    world.players.filter((player) => player.team === teamId).length,
  ]));
  const team = world.teamIds.reduce((least, teamId) => counts[teamId] < counts[least] ? teamId : least);
  world.players.push(createPlayer(name, team, true));
}

function resetMatchState() {
  world.matchId += 1;
  world.matchRewardHandled = false;
  world.networkKillCount = 0;
  world.matchTokensEarned = 0;
  world.matchRewardState = { id: world.matchId, tokensEarned: 0, tokenError: '' };
  world.matchTokenError = '';
  world.tokenAwardPromises.clear();
  world.replayBuffer = [];
  world.matchHighlights = [];
  world.activeHighlight = null;
  world.replayCaptureTimer = 0;
  world.winnerIntroHighlights = [];
  finishWinnerIntro();
  world.players = [];
  world.projectiles = [];
  world.particles = [];
  world.spawnPoints = [];
  world.nextSpawnIndex = 0;
  const teamCount = clamp(Number(teamCountInput.value) || 2, 2, 4);
  world.teamIds = TEAMS.slice(0, teamCount).map((team) => team.id);
  setupArena();
  world.teamScores = Object.fromEntries(world.teamIds.map((teamId) => [teamId, 0]));
  world.timer = Number(matchDurationInput.value) || 180;
  world.matchLives = Number(matchLivesInput.value) || 3;
  world.cameraZoom = 1;
  world.matchStart = performance.now();
  world.matchEndReason = '';
}

async function generateRoom() {
  if (!networkReady || !firebaseApi || !realtimeDb) {
    showToast('Online play is not connected. Check Firebase anonymous sign-in and Realtime Database rules.');
    return false;
  }
  try {
    await leaveNetworkRoom();
    const localName = getPlayerName();
    resetMatchState();
    world.isHost = true;
    world.roomCode = randomCode();
    networkHostUid = networkUid;
    addLocalPlayer(localName);
    const localPlayer = getLocalPlayer();
    localPlayer.id = `player-${networkUid}`;
    world.localId = localPlayer.id;
    localPlayer.networkUid = networkUid;
    addConfiguredBots();
    const roomPlayers = {};
    for (const player of world.players) {
      if (player.bot) player.networkUid = player.id;
      roomPlayers[player.networkUid] = getNetworkPlayerData(player, player.networkUid);
    }
    world.phase = 'lobby';
    networkRoomRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}`);
    networkPlayerRef = firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/players/${networkUid}`);
    await firebaseApi.set(networkRoomRef, {
      hostUid: networkUid,
      phase: 'lobby',
      settings: {
        teamCount: Number(teamCountInput.value) || 2,
        botCount: Number(botCountInput.value) || 0,
        botDifficulty: botDifficultyInput.value || 'medium',
        duration: Number(matchDurationInput.value) || 180,
        lives: Number(matchLivesInput.value) || 3,
      },
      players: roomPlayers,
      inputs: {},
    });
    lastPublishedRoomPhase = 'lobby';
    await firebaseApi.onDisconnect(networkPlayerRef).remove();
    await firebaseApi.onDisconnect(networkRoomRef).remove();
    const roomSnapshot = await firebaseApi.get(networkRoomRef);
    subscribeToRoom(roomSnapshot.val());
    roomCodeEl.textContent = world.roomCode;
    lobbyCodeText.textContent = world.roomCode;
    minigameScore = 0;
    document.getElementById('minigameScore').textContent = '0';
    updateLobbyPlayers();
    setScreen('lobby');
    showToast('Online room made. Share the code with your friends.');
    return true;
  } catch (error) {
    let message = `Could not create online room: ${describeFirebaseError(error)}`;
    try {
      await leaveNetworkRoom();
    } catch (cleanupError) {
      message += ` Cleanup also failed: ${describeFirebaseError(cleanupError)}`;
    }
    world.isHost = false;
    showToast(message);
    return false;
  }
}

async function joinRoom() {
  const code = roomInput.value.trim().toUpperCase();
  if (!code || code.length !== 5) {
    showToast('Use a valid 5-character code');
    return;
  }
  if (!networkReady || !firebaseApi || !realtimeDb) {
    showToast('Online play is not connected. Check Firebase anonymous sign-in and Realtime Database rules.');
    return;
  }
  try {
    await leaveNetworkRoom();
    const roomRef = firebaseApi.ref(realtimeDb, `rooms/${code}`);
    const roomSnapshot = await firebaseApi.get(roomRef);
    const room = roomSnapshot.val();
    if (!room || room.phase !== 'lobby') {
      showToast('That room does not exist or has already started.');
      return;
    }
    const connectedPlayers = Object.values(room.players || {}).filter((player) => !player.bot).length;
    const maxPlayers = Math.max(1, 12 - clamp(Number(room.settings?.botCount) || 0, 0, 11));
    if (connectedPlayers >= maxPlayers) {
      showToast('That room is full.');
      return;
    }
    world.isHost = false;
    world.roomCode = code;
    networkHostUid = room.hostUid;
    resetMatchState();
    world.isHost = false;
    world.roomCode = code;
    const localName = getPlayerName(document.getElementById('joinPlayerName'));
    const localPlayer = addLocalPlayer(localName);
    localPlayer.id = `player-${networkUid}`;
    world.localId = localPlayer.id;
    localPlayer.networkUid = networkUid;
    world.teamIds = TEAMS.slice(0, clamp(Number(room.settings?.teamCount) || 2, 2, 4)).map((team) => team.id);
    world.phase = 'lobby';
    networkRoomRef = roomRef;
    networkPlayerRef = firebaseApi.ref(realtimeDb, `rooms/${code}/players/${networkUid}`);
    await firebaseApi.set(networkPlayerRef, getNetworkPlayerData(localPlayer));
    await firebaseApi.onDisconnect(networkPlayerRef).remove();
    subscribeToRoom(room);
    roomCodeEl.textContent = code;
    lobbyCodeText.textContent = code;
    minigameScore = 0;
    document.getElementById('minigameScore').textContent = '0';
    updateLobbyPlayers();
    setScreen('lobby');
    showToast('Joined the host lobby.');
  } catch (error) {
    let message = `Could not join room: ${describeFirebaseError(error)}`;
    try {
      await leaveNetworkRoom();
    } catch (cleanupError) {
      message += ` Cleanup also failed: ${describeFirebaseError(cleanupError)}`;
    }
    showToast(message);
  }
}

function getPlayerName(source = playerNameInput) {
  const name = (source?.value || localStorage.getItem('chaosPlayerName') || 'Rookie').trim().slice(0, 18) || 'Rookie';
  localStorage.setItem('chaosPlayerName', name);
  return name;
}

function updateLobbyPlayers() {
  playerListEl.replaceChildren();
  if (!world.players.length) {
    const empty = document.createElement('div');
    empty.className = 'player-slot';
    empty.textContent = 'No players';
    playerListEl.append(empty);
    return;
  }
  for (const player of world.players) {
    const slot = document.createElement('div');
    slot.className = 'player-slot';
    const name = document.createElement('div');
    name.className = 'player-name';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = player.name.slice(0, 1).toUpperCase();
    name.append(avatar, document.createTextNode(` ${player.name}`));
    const tag = document.createElement('div');
    tag.className = 'player-tag';
    tag.style.color = getTeam(player.team).color;
    tag.textContent = `${getTeam(player.team).name} · ${player.bot ? 'Bot' : 'Player'}`;
    slot.append(name, tag);
    playerListEl.append(slot);
  }
}

async function startArenaFromLobby() {
  if (!world.isHost) {
    showToast('Only the host can start this match.');
    return;
  }
  if (!networkRoomRef || !firebaseApi) {
    showToast('The Firebase room connection is missing. Recreate the room before starting.');
    return;
  }
  const maps = [...Array.from(mapSelectInput.options).map((option) => option.value)];
  const selectedMap = maps[Math.floor(Math.random() * maps.length)] || 'reef';
  mapSelectInput.value = selectedMap;
  updateMapDescription();
  const selected = getSelectedMap();
  const match = {
    id: `${Date.now()}-${randomId()}`,
    roomCode: world.roomCode,
    mapId: selected.cells ? `custom:${selected.id}` : selectedMap,
    customMap: selected.cells ? selected : null,
    teamCount: world.teamIds.length,
    botDifficulty: botDifficultyInput.value || 'medium',
    duration: Number(matchDurationInput.value) || 180,
    lives: Number(matchLivesInput.value) || 3,
  };
  const startButton = document.getElementById('startMatch');
  startButton.disabled = true;
  try {
    await firebaseApi.update(networkRoomRef, { phase: 'countdown', match });
  } catch (error) {
    startButton.disabled = false;
    showToast(`Could not start the match for everyone: ${describeFirebaseError(error)}`);
    return;
  }
  lastAppliedMatchId = match.id;
  lastPublishedRoomPhase = 'countdown';
  setupArena();
  world.spawnPoints.forEach((spawn, index) => {
    if (world.players[index]) {
      world.players[index].x = spawn.x;
      world.players[index].y = spawn.y;
      world.players[index].vx = 0;
      world.players[index].vy = 0;
    }
  });
  world.phase = 'countdown';
  world.mapSpinRemaining = 2;
  world.countdownRemaining = 5;
  world.timer = Number(matchDurationInput.value) || 180;
  world.mapSpinIndex = 0;
  renderMapCarousel();
  document.getElementById('mapSnapshot').style.backgroundColor =
    (MAP_THEMES[getSelectedMap().theme || getSelectedMap().id] || MAP_THEMES.reef).floor;
  renderTeamScores();
  setScreen('match');
  updateHud();
}

function renderMapCarousel() {
  const carousel = document.getElementById('mapCarousel');
  const cards = [...Object.entries(MAP_THEMES).map(([id, theme]) => ({
    id,
    name: MAPS[id].name,
    color: theme.floor,
  })), ...customMaps.map((map) => ({
    id: `custom:${map.id}`,
    name: map.name,
    color: (MAP_THEMES[map.theme] || MAP_THEMES.reef).floor,
  }))];
  carousel.replaceChildren(...cards.map((map) => {
    const card = document.createElement('span');
    card.className = 'map-carousel-card';
    card.dataset.map = map.id;
    card.style.backgroundColor = map.color;
    card.setAttribute('aria-label', map.name);
    return card;
  }));
}

function renderMatchLeaderboard(ranked) {
  matchLeaderboardEl.replaceChildren();
  ranked.forEach((player, index) => {
    const row = document.createElement('tr');
    [String(index + 1), player.name, getTeam(player.team).name, String(player.kills), `${player.score} pts`]
      .forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    matchLeaderboardEl.append(row);
  });
}

function endMatch(reason = 'time') {
  if (world.matchRewardHandled) return;
  world.matchRewardHandled = true;
  world.matchEndReason = reason;
  world.phase = 'result';
  const ranked = [...world.players].sort((a, b) => b.score - a.score);
  const activeTeams = world.teamIds.filter((teamId) => world.players.some((player) => player.team === teamId));
  const remainingTeams = activeTeams.filter((teamId) =>
    world.players.some((player) => player.team === teamId && (player.alive || player.lives !== 0))
  );
  const winningTeam = remainingTeams.length === 1
    ? remainingTeams[0]
    : world.teamIds.reduce((best, teamId) =>
    (world.teamScores[teamId] || 0) > (world.teamScores[best] || 0) ? teamId : best, world.teamIds[0]);
  const winner = reason === 'elimination' && remainingTeams.length === 1
    ? ranked.find((player) => player.team === winningTeam) || ranked[0]
    : ranked[0];
  scoreMessageEl.textContent = winner
    ? reason === 'left'
      ? `Match left early · ${winner.name} was leading with ${winner.score} points`
      : reason === 'elimination' && remainingTeams.length === 1
        ? `${getTeam(winningTeam).name} wins!`
        : `${winner.name} wins with ${winner.score} points`
    : 'Match over';
  document.getElementById('mvpMessage').textContent = winner
    ? `${reason === 'left' ? 'Current MVP' : 'MVP'}: ${winner.name} · ${remainingTeams.length === 1 ? 'Winning team' : 'Top team'}: ${getTeam(winningTeam).name} (${world.teamScores[winningTeam] || 0} points)`
    : 'No winner this round.';
  resultListEl.replaceChildren();
  ranked.slice(0, 4).forEach((player, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    for (const [className, value] of [
      ['rank', `${index + 1}${['st', 'nd', 'rd'][index] || 'th'}`],
      ['name', player.name],
      ['score', `${player.score} pts`],
    ]) {
      const item = document.createElement('div');
      item.className = className;
      item.textContent = value;
      card.append(item);
    }
    resultListEl.append(card);
  });
  renderMatchLeaderboard(ranked);
  const localPlayer = getLocalPlayer();
  const rewardState = world.matchRewardState;
  xpRewardMessageEl.textContent = signedInUser
    ? `Match rewards: ${localPlayer?.kills || 0} KOs · ${world.matchTokensEarned} shop tokens · saving XP…${world.matchTokenError ? ` ${world.matchTokenError}` : ''}`
    : `Match rewards: ${localPlayer?.kills || 0} KOs · no shop tokens earned while signed out. Pulse is free; sign in to earn tokens and buy better guns.`;
  setScreen('result');
  startWinnerIntro(winningTeam, reason);
  const accountButton = document.getElementById('postMatchAccount');
  accountButton.classList.add('hidden');
  window.setTimeout(() => {
    if (world.phase === 'result') accountButton.classList.remove('hidden');
  }, 2800);
  void finishMatchRewards(localPlayer, rewardState, [...world.tokenAwardPromises]);
}

async function finishMatchRewards(player, rewardState, pendingAwards) {
  await Promise.all(pendingAwards);
  const tokensEarned = rewardState.tokensEarned;
  if (signedInUser && player) {
    await saveMatchProgress(player, tokensEarned, rewardState.tokenError);
    return;
  }
  if (player && world.matchRewardState === rewardState) {
    xpRewardMessageEl.textContent =
      `Match rewards: ${player.kills} KOs · no shop tokens earned while signed out. Pulse is free; sign in to earn tokens and buy better guns.`;
  }
}

function checkForEliminatedTeams() {
  const activeTeams = world.teamIds.filter((teamId) => world.players.some((player) => player.team === teamId));
  if (activeTeams.length < 2) return false;
  const remainingTeams = activeTeams.filter((teamId) =>
    world.players.some((player) => player.team === teamId && (player.alive || player.lives !== 0))
  );
  if (remainingTeams.length > 1) return false;
  endMatch('elimination');
  return true;
}

function leaveCurrentMatch() {
  document.getElementById('gameMenu').classList.add('hidden');
  if (world.roomCode && !world.isHost) {
    void leaveNetworkRoom().then(() => {
      world.phase = 'menu';
      setScreen('menu');
    }).catch((error) => showToast(`Could not leave room: ${describeFirebaseError(error)}`));
    return;
  }
  const matchInProgress = world.phase === 'match' ||
    (world.phase === 'pause' && world.pausedPhase === 'match');
  if (matchInProgress) {
    endMatch('left');
    return;
  }
  world.phase = 'menu';
  setScreen('menu');
}

function updateHud() {
  const mins = Math.floor(world.timer / 60).toString().padStart(2, '0');
  const secs = Math.floor(world.timer % 60).toString().padStart(2, '0');
  timerEl.textContent = `${mins}:${secs}`;
  timerEl.classList.toggle('warning', world.timer < 30 && world.phase === 'match');
  renderTeamScores();
  roomCodeEl.textContent = world.roomCode || '--';
  phaseBanner.classList.toggle('countdown', world.phase === 'countdown');
  matchCountdownEl.hidden = world.phase !== 'countdown';
  if (world.phase === 'countdown' && world.mapSpinRemaining > 0) {
    phaseBanner.textContent = 'MAP ROULETTE';
    countdownNumberEl.textContent = '✦';
    countdownMapEl.textContent = 'Choosing arena...';
    const cards = [...document.querySelectorAll('.map-carousel-card')];
    if (cards.length) {
      cards.forEach((card) => card.classList.remove('active'));
      const index = Math.floor(performance.now() / 75) % cards.length;
      cards[index].classList.add('active');
      const theme = MAP_THEMES[cards[index].dataset.map] || MAP_THEMES.reef;
      document.getElementById('mapSnapshot').style.backgroundColor = theme.floor;
    }
  } else if (world.phase === 'countdown') {
    const count = Math.max(1, Math.ceil(world.countdownRemaining));
    phaseBanner.textContent = `GET READY · ${count}`;
    countdownNumberEl.textContent = String(count);
    countdownMapEl.textContent = world.mapName;
  } else if (world.phase === 'match') {
    phaseBanner.textContent = world.timer < 30 ? 'Final rush' : 'Chaos in motion';
  }
  deathOverlayEl.hidden = world.deathPopupUntil <= performance.now();
  deathMessageEl.textContent = world.deathMessage;
  const local = getLocalPlayer();
  if (local) {
    healthValueEl.textContent = String(Math.ceil(local.hp));
    healthBarEl.style.width = `${clamp(local.hp / local.maxHp, 0, 1) * 100}%`;
    koValueEl.textContent = String(Math.max(0, Number(local.kills) || 0));
    livesValueEl.textContent = local.lives < 0 ? '∞' : String(local.lives);
    weaponValueEl.textContent = `${['Pulse', 'Burst', 'Scatter', 'Rail'][local.weaponLevel] || 'Pulse'} (${local.weaponLevel + 1})`;
    matchTokenValueEl.textContent = String(world.matchTokensEarned);
    const protectedSeconds = Math.ceil(local.spawnShield);
    spawnShieldStatusEl.hidden = protectedSeconds <= 0;
    spawnShieldStatusEl.textContent = protectedSeconds > 0 ? `PROTECTED ${protectedSeconds}s` : '';
  }
  updateEnemyDirection();
}

function renderTeamScores() {
  const midpoint = Math.ceil(world.teamIds.length / 2);
  const renderGroup = (container, teamIds) => {
    const teamKey = teamIds.join(',');
    if (container.dataset.teams !== teamKey) {
      container.replaceChildren();
      teamIds.forEach((teamId) => {
        const team = getTeam(teamId);
        const panel = document.createElement('div');
        panel.className = 'team-panel';
        panel.dataset.team = teamId;
        panel.style.borderColor = `${team.color}55`;
        const name = document.createElement('span');
        name.className = 'team-name';
        name.style.color = team.color;
        name.textContent = team.name;
        const score = document.createElement('span');
        score.className = 'team-score';
        panel.append(name, score);
        container.append(panel);
      });
      container.dataset.teams = teamKey;
    }
    teamIds.forEach((teamId) => {
      const score = container.querySelector(`[data-team="${teamId}"] .team-score`);
      if (score) score.textContent = String(world.teamScores[teamId] || 0);
    });
  };
  renderGroup(teamGroupLeftEl, world.teamIds.slice(0, midpoint));
  renderGroup(teamGroupRightEl, world.teamIds.slice(midpoint));
}

function updateEnemyDirection() {
  const local = getLocalPlayer();
  const enemies = local ? world.players.filter((player) => player.alive && player.team !== local.team) : [];
  if (!enemies.length) {
    enemyDirectionEl.textContent = 'NO ENEMIES';
    return;
  }
  const nearest = enemies.reduce((best, player) =>
    Math.hypot(player.x - local.x, player.y - local.y) < Math.hypot(best.x - local.x, best.y - local.y) ? player : best
  );
  const dx = nearest.x - local.x;
  const dy = nearest.y - local.y;
  const directions = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
  const direction = directions[Math.round((Math.atan2(dy, dx) / (Math.PI / 4) + 8) % 8) % 8];
  const status = `NEAREST ENEMY ${direction} · ${Math.round(Math.hypot(dx, dy))}M`;
  if (enemyDirectionEl.textContent !== status) enemyDirectionEl.textContent = status;
}

function getLocalPlayer() {
  if (!world.localId) return null;
  return world.players.find((player) => player.id === world.localId)
    || (networkUid
      ? world.players.find((player) => !player.bot && player.networkUid === networkUid)
      : null)
    || null;
}

function collideWithWalls(player, nextX, nextY) {
  const radius = player.radius;
  for (const wall of world.walls) {
    const nearestX = clamp(nextX, wall.x + 1, wall.x + wall.w - 1);
    const nearestY = clamp(nextY, wall.y + 1, wall.y + wall.h - 1);
    const dx = nextX - nearestX;
    const dy = nextY - nearestY;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < radius * radius) {
      const angle = Math.atan2(dy, dx) || 0;
      const overlap = radius - Math.sqrt(distanceSq || 0.0001);
      nextX += Math.cos(angle) * overlap;
      nextY += Math.sin(angle) * overlap;
    }
  }
  return { x: clamp(nextX, radius + 20, world.width - radius - 20), y: clamp(nextY, radius + 20, world.height - radius - 20) };
}

function movePlayer(player, dt) {
  if (!player.alive) {
    if (player.lives === 0) return;
    player.respawnTimer -= dt;
    if (player.respawnTimer <= 0) {
      const availableSpawns = world.spawnPoints.length > 1
        ? world.spawnPoints.filter((point) =>
          world.players.every((other) =>
            other.id === player.id || !other.alive ||
            Math.hypot(other.x - point.x, other.y - point.y) >= 180
          )
        )
        : world.spawnPoints;
      const choices = availableSpawns.length ? availableSpawns : world.spawnPoints;
      const spawn = choices[Math.floor(Math.random() * choices.length)] || getSpawnPoint();
      player.x = spawn.x;
      player.y = spawn.y;
      player.hp = player.maxHp;
      player.alive = true;
      player.shield = 0;
      player.spawnShield = 5;
      if (player.id === world.localId) showToast('5 seconds of spawn protection!');
    }
    return;
  }

  const controls = player.bot
    ? input
    : player.networkUid && player.networkUid !== networkUid
      ? player.networkInput || {}
      : input;
  if (Number.isInteger(controls.weaponLevel)) {
    player.weaponLevel = clamp(controls.weaponLevel, 0, player.maxWeaponLevel);
  }

  if (player.bot) {
    const skill = BOT_SKILLS[world.botDifficulty] || BOT_SKILLS.medium;
    const target = getNearestEnemy(player);
    if (target) {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      const hasLineOfSight = !projectileHitsWall(player.x, player.y, target.x, target.y, 2);
      player.navigationTimer -= dt;
      if (player.navigationTimer <= 0 || player.navigationTargetId !== target.id) {
        player.navigationWaypoint = findBotWaypoint(player, target);
        player.navigationTargetId = target.id;
        player.navigationTimer = 0.35;
      }
      let moveX;
      let moveY;
      if (hasLineOfSight) {
        const targetX = dx / dist;
        const targetY = dy / dist;
        const rangeCorrection = dist > 260 ? 1 : dist < 180 ? -1 : 0;
        const strafe = Math.sin(performance.now() / 1100 + player.botStrafePhase) * 0.8;
        moveX = targetX * rangeCorrection - targetY * strafe;
        moveY = targetY * rangeCorrection + targetX * strafe;
      } else {
        const waypoint = player.navigationWaypoint || target;
        const moveDx = waypoint.x - player.x;
        const moveDy = waypoint.y - player.y;
        const moveDistance = Math.hypot(moveDx, moveDy) || 1;
        moveX = moveDx / moveDistance;
        moveY = moveDy / moveDistance;
      }
      const moveDistance = Math.hypot(moveX, moveY) || 1;
      const desiredSpeed = player.speed * skill.speed;
      const response = 1 - Math.exp(-8 * dt);
      player.vx += (moveX / moveDistance * desiredSpeed - player.vx) * response;
      player.vy += (moveY / moveDistance * desiredSpeed - player.vy) * response;
      const shootDistance = hasLineOfSight && dist < skill.distance &&
        dist > player.radius + target.radius + 25;
      if (shootDistance && player.fireCooldown <= 0) {
        const projectileSpeed = 690 + player.weaponLevel * 35;
        const flightTime = Math.min(dist / projectileSpeed, 0.65);
        const leadX = dx + target.vx * flightTime;
        const leadY = dy + target.vy * flightTime;
        shootProjectile(player, Math.atan2(leadY, leadX) + (Math.random() - 0.5) * skill.jitter);
        player.fireCooldown = skill.fireDelay;
      }
      player.aim = hasLineOfSight ? Math.atan2(dy, dx) : Math.atan2(moveY, moveX);
    } else {
      player.vx *= 0.9;
      player.vy *= 0.9;
    }
  } else {
    const dx = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const dy = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
    const mag = Math.hypot(dx, dy) || 1;
    const dirX = dx / mag;
    const dirY = dy / mag;
    const speed = player.speed * (player.shield > 0 ? 1.08 : 1);
    player.vx += (dirX * speed - player.vx) * 0.2;
    player.vy += (dirY * speed - player.vy) * 0.2;
    player.aim = Number.isFinite(controls.aim)
      ? controls.aim
      : Math.atan2(input.pointerY - player.y, input.pointerX - player.x);
    if (controls.dash && player.dashCooldown <= 0) {
      player.vx += Math.cos(player.aim) * 420;
      player.vy += Math.sin(player.aim) * 420;
      player.dashCooldown = 1.25;
      spawnBurst(player.x, player.y, '#ffd76d', 12);
    }
    if (controls.use && player.shield <= 0) {
      player.shield = 2.2;
      spawnBurst(player.x, player.y, '#8fe7ff', 18);
      if (controls === input) input.use = false;
    }
    if (controls.shoot && player.fireCooldown <= 0) {
      shootProjectile(player, player.aim);
      player.fireCooldown = 0.17;
    }
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.shield = Math.max(0, player.shield - dt);
  player.spawnShield = Math.max(0, player.spawnShield - dt);

  const nextX = player.x + player.vx * dt;
  const nextY = player.y + player.vy * dt;
  const resolved = collideWithWalls(player, nextX, nextY);
  player.x = resolved.x;
  player.y = resolved.y;
  player.vx *= 0.82;
  player.vy *= 0.82;

  if (player.x < 0 || player.y < 0 || player.x > world.width || player.y > world.height) {
    player.x = clamp(player.x, 20, world.width - 20);
    player.y = clamp(player.y, 20, world.height - 20);
  }

}

function shootProjectile(player, angle) {
  if (!player.alive || world.projectiles.length >= 220) return;
  const speed = 690 + player.weaponLevel * 35;
  const damages = [24, 30, 40, 58];
  world.projectiles.push({
    x: player.x + Math.cos(angle) * (player.radius + 10),
    y: player.y + Math.sin(angle) * (player.radius + 10),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    team: player.team,
    ownerId: player.id,
    damage: (damages[player.weaponLevel] || damages[0]) * (player.damageMultiplier || 1),
    ttl: 1.15,
    radius: 5 + (player.weaponLevel > 1 ? 1 : 0),
  });
  spawnBurst(player.x, player.y, getTeam(player.team).color, 2);
}

function getNearestEnemy(player) {
  let best = null;
  let bestDist = Infinity;
  for (const other of world.players) {
    if (other.id === player.id || other.team === player.team || !other.alive) continue;
    const dx = other.x - player.x;
    const dy = other.y - player.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = other;
    }
  }
  return best;
}

function projectileHitsWall(startX, startY, endX, endY, radius) {
  for (const wall of world.walls) {
    const left = wall.x - radius;
    const right = wall.x + wall.w + radius;
    const top = wall.y - radius;
    const bottom = wall.y + wall.h + radius;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    let entry = 0;
    let exit = 1;

    for (const [start, delta, min, max] of [
      [startX, deltaX, left, right],
      [startY, deltaY, top, bottom],
    ]) {
      if (delta === 0) {
        if (start < min || start > max) {
          entry = 2;
          break;
        }
        continue;
      }
      let near = (min - start) / delta;
      let far = (max - start) / delta;
      if (near > far) [near, far] = [far, near];
      entry = Math.max(entry, near);
      exit = Math.min(exit, far);
      if (entry > exit) break;
    }

    if (entry <= exit && entry <= 1 && exit >= 0) return true;
  }
  return false;
}

function findBotWaypoint(player, target) {
  if (!projectileHitsWall(player.x, player.y, target.x, target.y, player.radius + 2)) return target;

  const clearance = player.radius + 14;
  const nodes = [{ x: player.x, y: player.y }, { x: target.x, y: target.y }];
  for (const wall of world.walls) {
    if (wall.x <= 0 || wall.y <= 0 || wall.x + wall.w >= world.width || wall.y + wall.h >= world.height) continue;
    const corners = [
      { x: wall.x - clearance, y: wall.y - clearance },
      { x: wall.x + wall.w + clearance, y: wall.y - clearance },
      { x: wall.x - clearance, y: wall.y + wall.h + clearance },
      { x: wall.x + wall.w + clearance, y: wall.y + wall.h + clearance },
    ];
    for (const point of corners) {
      point.x = clamp(point.x, 40, world.width - 40);
      point.y = clamp(point.y, 40, world.height - 40);
      if (!overlapsWall(point.x, point.y, player.radius + 2)) nodes.push(point);
    }
  }

  const costs = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const visited = nodes.map(() => false);
  costs[0] = 0;
  for (let step = 0; step < nodes.length; step += 1) {
    let current = -1;
    for (let index = 0; index < nodes.length; index += 1) {
      if (!visited[index] && (current < 0 || costs[index] < costs[current])) current = index;
    }
    if (current < 0 || !Number.isFinite(costs[current]) || current === 1) break;
    visited[current] = true;
    for (let next = 1; next < nodes.length; next += 1) {
      if (visited[next] || next === current ||
        projectileHitsWall(nodes[current].x, nodes[current].y, nodes[next].x, nodes[next].y, player.radius + 2)) continue;
      const length = Math.hypot(nodes[next].x - nodes[current].x, nodes[next].y - nodes[current].y);
      if (costs[current] + length < costs[next]) {
        costs[next] = costs[current] + length;
        previous[next] = current;
      }
    }
  }

  if (previous[1] < 0) return target;
  let firstStep = 1;
  while (previous[firstStep] > 0) firstStep = previous[firstStep];
  return nodes[firstStep];
}

function updateProjectiles(dt) {
  for (let i = world.projectiles.length - 1; i >= 0; i -= 1) {
    const bullet = world.projectiles[i];
    const previousX = bullet.x;
    const previousY = bullet.y;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.ttl -= dt;

    if (bullet.x < 0 || bullet.x > world.width || bullet.y < 0 || bullet.y > world.height ||
      bullet.ttl <= 0 || projectileHitsWall(previousX, previousY, bullet.x, bullet.y, bullet.radius)) {
      world.projectiles.splice(i, 1);
      continue;
    }

    for (const player of world.players) {
      if (!player.alive || player.id === bullet.ownerId || player.team === bullet.team) continue;
      const dx = bullet.x - player.x;
      const dy = bullet.y - player.y;
      const collisionDistance = player.radius + bullet.radius;
      if (dx * dx + dy * dy < collisionDistance * collisionDistance) {
        applyDamage(player, bullet);
        world.projectiles.splice(i, 1);
        break;
      }
    }
  }
}

function applyDamage(player, bullet) {
  const shooter = world.players.find((entry) => entry.id === bullet.ownerId);
  if (player.spawnShield > 0) return;
  if (player.shield > 0) {
    player.shield = 0;
    spawnBurst(player.x, player.y, '#d9f3ff', 18);
    return;
  }

  const damage = (bullet.damage || 24) * (1 - (player.damageResistance || 0));
  player.hp -= damage;
  spawnBurst(player.x, player.y, '#ff5f7d', 4);

  if (player.hp <= 0) {
    eliminatePlayer(player, 1.8, `${player.name} got popped`);
    if (shooter) awardElimination(shooter, player);
  }
}

function awardElimination(shooter, victim) {
  shooter.score += 12;
  shooter.kills += 1;
  world.teamScores[shooter.team] += 12;
  beginMatchHighlight(shooter, victim);
  if (shooter.id === world.localId) awardLocalKillReward();
}

function awardLocalKillReward() {
  if (!signedInUser) {
    showToast('Sign in to earn shop tokens for KOs.');
    return;
  }
  if (!firebaseApi || !realtimeDb) {
    world.matchTokenError = 'Firebase is not ready. Shop tokens could not be saved.';
    showToast(world.matchTokenError);
    return;
  }
  const rewardState = world.matchRewardState;
  const awardPromise = awardKillTokens(rewardState.id);
  world.tokenAwardPromises.add(awardPromise);
  void awardPromise.then(
    (awardedTokens) => {
      if (awardedTokens > 0) rewardState.tokensEarned += awardedTokens;
      if (world.matchRewardState === rewardState && awardedTokens > 0) {
        world.matchTokensEarned = rewardState.tokensEarned;
        if (world.phase === 'result') {
          xpRewardMessageEl.textContent =
            `Match rewards: ${getLocalPlayer()?.kills || 0} KOs · ${world.matchTokensEarned} shop tokens · saving XP…`;
        }
      }
      world.tokenAwardPromises.delete(awardPromise);
    },
    () => world.tokenAwardPromises.delete(awardPromise)
  );
}

function captureReplayFrame(dt) {
  world.replayCaptureTimer -= dt;
  if (world.replayCaptureTimer > 0) return;
  world.replayCaptureTimer = 0.14;
  const frame = {
    players: world.players.map((player) => ({
      x: player.x,
      y: player.y,
      aim: player.aim,
      alive: player.alive,
      team: player.team,
      name: player.name,
      radius: player.radius,
    })),
    projectiles: world.projectiles.map((projectile) => ({ x: projectile.x, y: projectile.y })),
  };
  world.replayBuffer.push(frame);
  if (world.replayBuffer.length > 36) world.replayBuffer.shift();
  if (world.activeHighlight) {
    world.activeHighlight.frames.push(frame);
    if (performance.now() >= world.activeHighlight.captureUntil) {
      world.matchHighlights.push(world.activeHighlight);
      world.activeHighlight = null;
      if (world.matchHighlights.length > 4) world.matchHighlights.shift();
    }
  }
}

function beginMatchHighlight(shooter, victim) {
  if (world.activeHighlight) {
    world.matchHighlights.push(world.activeHighlight);
    world.activeHighlight = null;
  }
  world.activeHighlight = {
    caption: `${shooter.name} takes down ${victim?.name || 'an opponent'}`,
    frames: world.replayBuffer.slice(-18),
    captureUntil: performance.now() + 1250,
  };
}

function prepareMatchHighlights() {
  if (world.activeHighlight) {
    world.matchHighlights.push(world.activeHighlight);
    world.activeHighlight = null;
  }
  const highlights = world.matchHighlights.slice(-3).filter((clip) => clip.frames.length);
  if (!highlights.length && world.replayBuffer.length) {
    highlights.push({ caption: 'Final moments in the arena', frames: world.replayBuffer.slice(-30) });
  }
  return highlights;
}

function drawReplayFrame(frame) {
  const width = winnerReplayCanvas.width;
  const height = winnerReplayCanvas.height;
  const palette = MAP_THEMES[world.mapId] || MAP_THEMES.reef;
  const scale = Math.min((width - 40) / world.width, (height - 40) / world.height);
  const offsetX = (width - world.width * scale) / 2;
  const offsetY = (height - world.height * scale) / 2;
  winnerReplayCtx.clearRect(0, 0, width, height);
  winnerReplayCtx.fillStyle = palette.floor;
  winnerReplayCtx.fillRect(0, 0, width, height);
  winnerReplayCtx.save();
  winnerReplayCtx.translate(offsetX, offsetY);
  winnerReplayCtx.scale(scale, scale);
  winnerReplayCtx.strokeStyle = palette.grid;
  winnerReplayCtx.lineWidth = 2 / scale;
  for (let x = 0; x <= world.width; x += 160) {
    winnerReplayCtx.beginPath();
    winnerReplayCtx.moveTo(x, 0);
    winnerReplayCtx.lineTo(x, world.height);
    winnerReplayCtx.stroke();
  }
  for (let y = 0; y <= world.height; y += 160) {
    winnerReplayCtx.beginPath();
    winnerReplayCtx.moveTo(0, y);
    winnerReplayCtx.lineTo(world.width, y);
    winnerReplayCtx.stroke();
  }
  for (const wall of world.walls) {
    winnerReplayCtx.fillStyle = palette.wall;
    winnerReplayCtx.fillRect(wall.x, wall.y, wall.w, wall.h);
    winnerReplayCtx.fillStyle = palette.trim;
    winnerReplayCtx.fillRect(wall.x + 6, wall.y + 6, Math.max(0, wall.w - 12), 6);
  }
  for (const projectile of frame.projectiles) {
    winnerReplayCtx.fillStyle = '#fff2a8';
    winnerReplayCtx.beginPath();
    winnerReplayCtx.arc(projectile.x, projectile.y, 7, 0, Math.PI * 2);
    winnerReplayCtx.fill();
  }
  for (const player of frame.players) {
    if (!player.alive) continue;
    const color = getTeam(player.team).color;
    winnerReplayCtx.save();
    winnerReplayCtx.translate(player.x, player.y);
    winnerReplayCtx.rotate(player.aim || 0);
    winnerReplayCtx.shadowColor = color;
    winnerReplayCtx.shadowBlur = 20;
    winnerReplayCtx.fillStyle = color;
    winnerReplayCtx.beginPath();
    winnerReplayCtx.arc(0, 0, player.radius + 2, 0, Math.PI * 2);
    winnerReplayCtx.fill();
    winnerReplayCtx.shadowBlur = 0;
    winnerReplayCtx.fillStyle = '#fff';
    winnerReplayCtx.fillRect(7, -3, 27, 6);
    winnerReplayCtx.restore();
  }
  winnerReplayCtx.restore();
}

function startWinnerIntro(teamId, reason) {
  const team = getTeam(teamId);
  const highlights = prepareMatchHighlights();
  winnerIntroTitleEl.textContent = reason === 'left'
    ? `${team.name.toUpperCase()} IN THE LEAD`
    : `${team.name.toUpperCase()} WINS!`;
  winnerIntroTitleEl.style.color = team.color;
  winnerIntroEl.classList.remove('hidden');
  world.winnerIntroHighlights = highlights;
  world.winnerIntroClipIndex = 0;
  world.winnerIntroClipStartedAt = performance.now();
  if (highlights.length) {
    winnerIntroCaptionEl.textContent = highlights[0].caption;
    winnerIntroProgressEl.textContent = `Highlight 1 of ${highlights.length}`;
    drawReplayFrame(highlights[0].frames[0]);
  } else {
    winnerIntroCaptionEl.textContent = 'No highlights were captured this match.';
    winnerIntroProgressEl.textContent = 'Match complete';
    winnerReplayCtx.clearRect(0, 0, winnerReplayCanvas.width, winnerReplayCanvas.height);
  }
}

function updateWinnerIntro(timestamp) {
  if (winnerIntroEl.classList.contains('hidden')) return;
  const highlights = world.winnerIntroHighlights || [];
  const clip = highlights[world.winnerIntroClipIndex];
  if (!clip) {
    finishWinnerIntro();
    return;
  }
  const frameDuration = 130;
  const elapsed = timestamp - world.winnerIntroClipStartedAt;
  const frameIndex = Math.min(clip.frames.length - 1, Math.floor(elapsed / frameDuration));
  if (clip.frames[frameIndex]) drawReplayFrame(clip.frames[frameIndex]);
  if (elapsed >= clip.frames.length * frameDuration) {
    world.winnerIntroClipIndex += 1;
    world.winnerIntroClipStartedAt = timestamp;
    const nextClip = highlights[world.winnerIntroClipIndex];
    if (nextClip) {
      winnerIntroCaptionEl.textContent = nextClip.caption;
      winnerIntroProgressEl.textContent =
        `Highlight ${world.winnerIntroClipIndex + 1} of ${highlights.length}`;
    } else {
      finishWinnerIntro();
    }
  }
}

function finishWinnerIntro() {
  winnerIntroEl.classList.add('hidden');
  world.winnerIntroHighlights = [];
}

async function awardKillTokens(matchId) {
  if (!signedInUser || !firebaseApi || !realtimeDb) return 0;
  const profileRef = firebaseApi.ref(realtimeDb, `profiles/${signedInUser.uid}`);
  const today = new Date().toISOString().slice(0, 10);
  let awardedTokens = 0;
  try {
    const result = await firebaseApi.runTransaction(profileRef, (current) => {
      const existingProfile = current && typeof current === 'object' ? current : {};
      const profile = normalizeProfile(existingProfile, signedInUser);
      const earnedToday = profile.tokenDay === today ? profile.dailyTokensEarned : 0;
      const award = Math.min(TOKENS_PER_KILL, DAILY_TOKEN_CAP - earnedToday);
      awardedTokens = award;
      if (award <= 0) return existingProfile;
      return {
        uid: profile.uid,
        displayName: profile.displayName,
        xp: profile.xp,
        skins: serializeOwned(profile.skins),
        guns: serializeOwned(profile.guns),
        equippedSkin: profile.equippedSkin,
        equippedGun: profile.equippedGun,
        tokens: profile.tokens + award,
        tokenDay: today,
        dailyTokensEarned: earnedToday + award,
        updatedAt: Date.now(),
      };
    });
    if (!result.committed) {
      if (awardedTokens <= 0) {
        const message = 'Daily shop-token limit reached.';
        if (world.matchId === matchId) {
          world.matchTokenError = message;
          world.matchRewardState.tokenError = message;
          if (world.phase === 'result') {
            xpRewardMessageEl.textContent =
              `Match rewards: ${getLocalPlayer()?.kills || 0} KOs · ${world.matchTokensEarned} shop tokens. ${message}`;
          }
        }
        accountStatusEl.textContent = message;
        showToast(message);
        return 0;
      }
      const message = 'Shop-token transaction was not committed. Check your Firebase Realtime Database profile rules.';
      if (world.matchId === matchId) {
        world.matchTokenError = message;
        world.matchRewardState.tokenError = message;
        if (world.phase === 'result') {
          xpRewardMessageEl.textContent =
            `Match rewards: ${getLocalPlayer()?.kills || 0} KOs · ${world.matchTokensEarned} shop tokens. ${message}`;
        }
      }
      accountStatusEl.textContent = message;
      showToast('Shop-token update did not save.');
      return 0;
    }
    const nextProfile = normalizeProfile(result.snapshot.val(), signedInUser);
    drawAccountProfile(nextProfile);
    if (awardedTokens > 0) {
      if (world.matchId === matchId) {
        world.matchTokenError = '';
        world.matchRewardState.tokenError = '';
      }
      showToast(`+${awardedTokens} shop tokens for that KO!`);
    } else {
      if (world.matchId === matchId) {
        world.matchTokenError = 'Daily shop-token limit reached.';
        world.matchRewardState.tokenError = world.matchTokenError;
      }
      showToast('Daily shop-token limit reached.');
    }
    return awardedTokens;
  } catch (error) {
    const message = `Shop tokens could not be saved: ${describeFirebaseError(error)}`;
    if (world.matchId === matchId) {
      world.matchTokenError = message;
      world.matchRewardState.tokenError = message;
    }
    accountStatusEl.textContent = message;
    if (world.matchId === matchId && world.phase === 'result') {
      xpRewardMessageEl.textContent =
        `Match rewards: ${getLocalPlayer()?.kills || 0} KOs · ${world.matchTokensEarned} shop tokens. ${message}`;
    }
    showToast('Could not save shop tokens. Check the match results for details.');
    return 0;
  }
}

function eliminatePlayer(player, respawnDelay, message) {
  if (!player.alive) return;
  if (world.grandToken?.holderId === player.id) {
    world.grandToken.holderId = null;
    world.grandToken.active = true;
    world.grandToken.x = player.x;
    world.grandToken.y = player.y;
    showToast('The Grand Token dropped!');
  }
  player.hp = 0;
  player.alive = false;
  if (player.lives > 0) player.lives -= 1;
  player.respawnTimer = respawnDelay;
  player.score = Math.max(0, player.score - 6);
  if (player.id === world.localId) {
    world.deathMessage = player.lives > 0 ? 'Respawning soon...' : 'Out of lives';
    world.deathPopupUntil = performance.now() + 1500;
    deathOverlayEl.hidden = false;
    deathOverlayEl.classList.remove('death-animation');
    void deathOverlayEl.offsetWidth;
    deathOverlayEl.classList.add('death-animation');
  }
  showToast(player.lives > 0 ? message : `${player.name} is out of lives!`);
}

function collectPickup(player, pickup) {
  if (pickup.type === 'token') {
    player.score += pickup.value;
    world.teamScores[player.team] += pickup.value;
    return `${player.name} grabbed a token`;
  }
  if (pickup.type === 'life') {
    if (player.lives < 0 || player.lives >= 5) return null;
    player.lives = Math.min(5, player.lives + 1);
    return `${player.name} found an extra life`;
  }
  if (pickup.type === 'health') {
    if (player.hp >= player.maxHp) return null;
    player.hp = Math.min(player.maxHp, player.hp + 50);
    return `${player.name} got a health refill`;
  }
  if (pickup.type === 'weapon') {
    if (player.maxWeaponLevel >= 3) return null;
    player.maxWeaponLevel += 1;
    player.weaponLevel = player.maxWeaponLevel;
    return `${player.name} found ${['Pulse', 'Burst', 'Scatter', 'Rail'][player.weaponLevel]}`;
  }
  if (pickup.type === 'invincibility') {
    player.spawnShield = Math.max(player.spawnShield, 4);
    return `${player.name} is invincible for 4 seconds`;
  }
  return null;
}

function updatePickups() {
  const now = performance.now() / 1000;
  const grandToken = world.grandToken;
  if (grandToken) {
    const holder = world.players.find((player) => player.id === grandToken.holderId && player.alive);
    if (grandToken.holderId && !holder) {
      grandToken.holderId = null;
      grandToken.active = true;
    }
    if (holder) {
      grandToken.x = holder.x;
      grandToken.y = holder.y - 42;
    } else if (grandToken.active) {
      grandToken.pulse += 0.045;
      for (const player of world.players) {
        if (!player.alive || Math.hypot(grandToken.x - player.x, grandToken.y - player.y) >= player.radius + 28) continue;
        grandToken.active = false;
        grandToken.holderId = player.id;
        player.score += 50;
        world.teamScores[player.team] += 50;
        spawnBurst(grandToken.x, grandToken.y, '#ffd76d', 38);
        showToast(`${player.name} claimed the GRAND TOKEN +50!`);
        break;
      }
    }
  }
  for (const pickup of world.pickups) {
    if (!pickup.active) {
      if (pickup.respawnAt > 0 && now >= pickup.respawnAt) {
        pickup.active = true;
        pickup.respawnAt = 0;
      } else {
        continue;
      }
    }
    pickup.pulse += 0.05;
    for (const player of world.players) {
      if (!player.alive) continue;
      const dx = pickup.x - player.x;
      const dy = pickup.y - player.y;
      if (Math.hypot(dx, dy) < player.radius + 12) {
        const message = collectPickup(player, pickup);
        if (!message) continue;
        pickup.active = false;
        pickup.respawnAt = now + (pickup.type === 'token' ? 32 : 40);
        const colors = { token: '#ffd76d', life: '#ff77b9', health: '#79e7ae', weapon: '#ff8a67', invincibility: '#81dcff' };
        spawnBurst(pickup.x, pickup.y, colors[pickup.type] || '#ffd76d', 18);
        if (player.id === world.localId) showToast(message);
        break;
      }
    }
  }
}

function updateHazards(dt) {
  for (const [index, hazard] of world.hazards.entries()) {
    if (hazard.kind === 'saw') {
      hazard.angle += hazard.speed * dt;
      hazard.x = world.width / 2 + Math.sin(world.timer * 0.8 + hazard.angle + index) * 240;
      hazard.y = 380 + Math.cos(world.timer * 1.2 + index) * 110;
    } else if (hazard.kind === 'storm') {
      hazard.tick += dt;
      hazard.active = Math.sin(hazard.tick * 1.4) > 0.35;
    }

    for (const player of world.players) {
      if (!player.alive || !hazard.active) continue;
      const distance = Math.hypot(player.x - hazard.x, player.y - hazard.y);
      if (distance > hazard.radius + player.radius) continue;
      if (hazard.kind === 'boost') {
        const multiplier = Math.min(1.08, 1 + dt * 1.8);
        player.vx *= multiplier;
        player.vy *= multiplier;
      } else if (hazard.kind === 'ice') {
        const multiplier = Math.pow(0.91, dt);
        player.vx *= multiplier;
        player.vy *= multiplier;
      } else if (hazard.kind === 'saw' && player.spawnShield <= 0) {
        player.hp -= 30 * (1 - (player.damageResistance || 0));
        player.x += Math.sign(player.x - hazard.x || 1) * 28;
        player.y += Math.sign(player.y - hazard.y || 1) * 28;
        if (player.hp <= 0) eliminatePlayer(player, 1.2, `${player.name} got wrecked by a hazard`);
      } else if ((hazard.kind === 'storm' || hazard.kind === 'lava' || hazard.kind === 'venom') && player.spawnShield <= 0) {
        player.hp -= (hazard.kind === 'lava' ? 18 : hazard.kind === 'venom' ? 14 : 12) *
          (1 - (player.damageResistance || 0)) * dt;
        if (player.hp <= 0) eliminatePlayer(player, 1.3, `${player.name} got caught in a hazard`);
      }
    }
  }
}

function spawnBurst(x, y, color, count) {
  const allowed = Math.min(count, Math.max(0, 140 - world.particles.length));
  for (let i = 0; i < allowed; i += 1) {
    world.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160,
      life: 0.55 + Math.random() * 0.45,
      color,
      radius: 2 + Math.random() * 4,
    });
  }
}

function updateParticles(dt) {
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const particle = world.particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    if (particle.life <= 0) world.particles.splice(i, 1);
  }
}

function publishNetworkInput(timestamp) {
  if (world.isHost || !networkPlayerRef || !firebaseApi ||
      networkInputWritePending || timestamp - lastNetworkInputAt < NETWORK_INPUT_INTERVAL_MS) return;
  lastNetworkInputAt = timestamp;
  const local = getLocalPlayer();
  if (!local) return;
  const aim = Math.atan2(input.pointerY - local.y, input.pointerX - local.x);
  const controls = {
    left: input.left,
    right: input.right,
    up: input.up,
    down: input.down,
    shoot: input.shoot,
    dash: input.dash,
    use: input.use,
    aim,
    weaponLevel: local.weaponLevel,
  };
  input.use = false;
  networkInputWritePending = true;
  void firebaseApi.set(
    firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/inputs/${networkUid}`),
    controls
  ).then(
    () => {
      networkInputWritePending = false;
      if (world.roomCode) networkInputExists = true;
    },
    (error) => {
      networkInputWritePending = false;
      showNetworkError(`Game input could not sync: ${describeFirebaseError(error)}`);
    }
  );
}

function publishNetworkState(timestamp) {
  if (!world.isHost || !networkRoomRef || !firebaseApi ||
      !['countdown', 'match', 'pause', 'result'].includes(world.phase) ||
      networkStateWritePending || timestamp - lastNetworkStateAt < NETWORK_STATE_INTERVAL_MS) return;
  lastNetworkStateAt = timestamp;
  if (lastPublishedRoomPhase !== world.phase) {
    lastPublishedRoomPhase = world.phase;
    void firebaseApi.set(firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/phase`), world.phase)
      .catch((error) => showNetworkError(`Room status could not sync: ${describeFirebaseError(error)}`));
  }
  const state = {
    sentAt: Date.now(),
    phase: world.phase,
    timer: world.timer,
    mapId: world.mapId,
    mapName: world.mapName,
    teamScores: world.teamScores,
    mapSpinRemaining: world.mapSpinRemaining,
    countdownRemaining: world.countdownRemaining,
    matchEndReason: world.matchEndReason,
    players: world.players.map((player) => ({
      id: player.id,
      networkUid: player.networkUid,
      name: player.name,
      team: player.team,
      bot: player.bot,
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      radius: player.radius,
      speed: player.speed,
      maxHp: player.maxHp,
      hp: player.hp,
      skinId: player.skinId,
      damageMultiplier: player.damageMultiplier,
      damageResistance: player.damageResistance,
      lives: player.lives,
      weaponLevel: player.weaponLevel,
      maxWeaponLevel: player.maxWeaponLevel,
      ownedWeaponLevel: player.ownedWeaponLevel,
      spawnShield: player.spawnShield,
      aim: player.aim,
      fireCooldown: player.fireCooldown,
      dashCooldown: player.dashCooldown,
      shield: player.shield,
      alive: player.alive,
      respawnTimer: player.respawnTimer,
      score: player.score,
      kills: player.kills,
    })),
    projectiles: world.projectiles,
    pickups: world.pickups,
    hazards: world.hazards,
    grandToken: world.grandToken,
  };
  networkStateWritePending = true;
  void firebaseApi.set(firebaseApi.ref(realtimeDb, `rooms/${world.roomCode}/state`), state).then(
    () => { networkStateWritePending = false; },
    (error) => {
      networkStateWritePending = false;
      const permissionDenied = error?.code === 'PERMISSION_DENIED' ||
        String(error?.message || '').toLowerCase().includes('permission_denied');
      const detail = permissionDenied
        ? `Firebase rejected the host's write to rooms/${world.roomCode}/state. Publish the current database.rules.json and ensure this signed-in account created the room.`
        : describeFirebaseError(error);
      showNetworkError(`Game state could not sync: ${detail}`);
    }
  );
}

function updateMatch(dt) {
  if (world.phase === 'countdown') {
    const wasSpinning = world.mapSpinRemaining > 0;
    world.mapSpinRemaining = Math.max(0, world.mapSpinRemaining - dt);
    if (wasSpinning && world.mapSpinRemaining === 0) {
      world.countdownRemaining = 3;
      countdownMapEl.textContent = world.mapName;
      const chosenCard = [...document.querySelectorAll('.map-carousel-card')]
        .find((card) => card.dataset.map === mapSelectInput.value);
      document.querySelectorAll('.map-carousel-card').forEach((card) => card.classList.toggle('active', card === chosenCard));
      document.getElementById('mapSnapshot').style.backgroundColor =
        (MAP_THEMES[getSelectedMap().theme || getSelectedMap().id] || MAP_THEMES.reef).floor;
    }
    world.countdownRemaining = Math.max(0, world.countdownRemaining - dt);
    if (world.countdownRemaining === 0) {
      world.phase = 'match';
      showToast('GO!');
    }
    updateHud();
    return;
  }

  world.timer = Math.max(0, world.timer - dt);
  updateHud();
  if (world.timer <= 0) {
    endMatch();
    return;
  }

  for (const player of world.players) {
    if (player.bot || (world.isHost && player.networkUid && player.networkUid !== networkUid)) {
      movePlayer(player, dt);
    }
  }
  const local = getLocalPlayer();
  if (local && !local.bot) movePlayer(local, dt);

  updateHazards(dt);
  updateProjectiles(dt);
  updatePickups();
  updateParticles(dt);
  captureReplayFrame(dt);
  checkForEliminatedTeams();
}

function advanceGuestVisuals(dt) {
  updateParticles(dt);
  for (const [index, hazard] of world.hazards.entries()) {
    if (hazard.kind === 'saw') {
      hazard.angle += (hazard.speed || 0) * dt;
      hazard.x = world.width / 2 + Math.sin(world.timer * 0.8 + hazard.angle + index) * 240;
      hazard.y = 380 + Math.cos(world.timer * 1.2 + index) * 110;
    } else if (hazard.kind === 'storm') {
      hazard.tick += dt;
      hazard.active = Math.sin(hazard.tick * 1.4) > 0.35;
    }
  }
  for (const pickup of world.pickups) pickup.pulse += dt * 3;
  if (world.grandToken) {
    world.grandToken.pulse += dt * 2.7;
    const holder = world.players.find((player) =>
      player.id === world.grandToken.holderId && player.alive
    );
    if (holder) {
      world.grandToken.x = holder.x;
      world.grandToken.y = holder.y - 42;
    }
  }
  if (world.networkStateAge >= 0.5) return;
  const visualDt = Math.min(dt, 0.5 - world.networkStateAge);
  for (const player of world.players) {
    if (!player.alive || player.id === world.localId) continue;
    const position = collideWithWalls(
      player,
      player.x + (player.vx || 0) * visualDt,
      player.y + (player.vy || 0) * visualDt
    );
    player.x = position.x;
    player.y = position.y;
  }
  for (let index = world.projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = world.projectiles[index];
    const previousX = projectile.x;
    const previousY = projectile.y;
    projectile.x += projectile.vx * visualDt;
    projectile.y += projectile.vy * visualDt;
    projectile.ttl -= visualDt;
    if (projectile.ttl <= 0 || projectile.x < 0 || projectile.x > world.width ||
        projectile.y < 0 || projectile.y > world.height ||
        projectileHitsWall(previousX, previousY, projectile.x, projectile.y, projectile.radius)) {
      world.projectiles.splice(index, 1);
    }
  }
  world.networkStateAge += visualDt;
}

function updateFrame(timestamp) {
  const dt = Math.min((timestamp - (world.lastTime || timestamp)) / 1000, 0.033);
  world.lastTime = timestamp;

  if (world.phase === 'match' || world.phase === 'countdown') {
    if (!world.roomCode || world.isHost) updateMatch(dt);
    else {
      publishNetworkInput(timestamp);
      if (world.phase === 'match') {
        world.timer = Math.max(0, world.timer - dt);
        const mins = Math.floor(world.timer / 60).toString().padStart(2, '0');
        const secs = Math.floor(world.timer % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
        timerEl.classList.toggle('warning', world.timer < 30);
        const local = getLocalPlayer();
        if (local?.alive) movePlayer(local, dt);
        advanceGuestVisuals(dt);
      }
    }
  }
  publishNetworkState(timestamp);
  render();
  updateWinnerIntro(timestamp);
  requestAnimationFrame(updateFrame);
}

function drawBackground() {
  const palette = MAP_THEMES[world.mapId] || MAP_THEMES.reef;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, palette.top);
  gradient.addColorStop(1, palette.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  for (let i = 0; i < 24; i += 1) {
    const x = (i * 113) % canvas.width;
    const y = (i * 53) % (canvas.height * 0.7);
    ctx.beginPath();
    ctx.arc(x, y, 22 + (i % 3) * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPickupIcon(type) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(23,45,70,0.85)';
  ctx.lineWidth = 2.5;

  if (type === 'weapon') {
    ctx.rotate(-0.28);
    ctx.fillStyle = '#ffedb5';
    ctx.beginPath();
    ctx.moveTo(-13, -5);
    ctx.lineTo(6, -5);
    ctx.lineTo(12, -2);
    ctx.lineTo(12, 3);
    ctx.lineTo(5, 4);
    ctx.lineTo(2, 8);
    ctx.lineTo(-3, 8);
    ctx.lineTo(-4, 3);
    ctx.lineTo(-11, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, -3, 8, 2);
    ctx.fillStyle = '#ff8a67';
    ctx.fillRect(-10, -3, 12, 3);
    ctx.fillStyle = '#754d5b';
    ctx.fillRect(-3, 3, 3, 4);
  } else if (type === 'health' || type === 'life') {
    ctx.fillStyle = type === 'health' ? '#fff0ed' : '#fff3fa';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-3, 9, -13, 2, -13, -4);
    ctx.bezierCurveTo(-13, -12, -3, -13, 0, -6);
    ctx.bezierCurveTo(4, -13, 13, -12, 13, -4);
    ctx.bezierCurveTo(13, 2, 4, 9, 0, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = type === 'health' ? '#42bd83' : '#f45f9c';
    ctx.beginPath();
    ctx.moveTo(-6, -1);
    ctx.lineTo(6, -1);
    if (type === 'health') {
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 5);
    }
    ctx.stroke();
    if (type === 'life') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(11, -10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f45f9c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = '#f45f9c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(11, -12);
      ctx.lineTo(11, -8);
      ctx.moveTo(9, -10);
      ctx.lineTo(13, -10);
      ctx.stroke();
    }
  } else if (type === 'invincibility') {
    ctx.fillStyle = '#fff8d6';
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 14 : 6;
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#fff7bf';
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 14 : 7;
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e6a92c';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawArena() {
  const local = getLocalPlayer();
  const palette = MAP_THEMES[world.mapId] || MAP_THEMES.reef;
  const spectator = local && !local.alive
    ? world.players.find((player) => player.id === world.spectateTargetId && player.alive) ||
      world.players.filter((player) => player.alive).sort((a, b) =>
        Math.hypot(a.x - local.x, a.y - local.y) - Math.hypot(b.x - local.x, b.y - local.y))[0]
    : null;
  const cameraTarget = spectator || local;
  const cameraX = cameraTarget ? cameraTarget.x : world.width / 2;
  const cameraY = cameraTarget ? cameraTarget.y : world.height / 2;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(world.cameraZoom, world.cameraZoom);
  ctx.translate(-cameraX, -cameraY);

  ctx.fillStyle = palette.floor;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 2;
  for (let x = 0; x <= world.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y <= world.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  for (const wall of world.walls) {
    ctx.fillStyle = palette.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = palette.trim;
    ctx.fillRect(wall.x + 6, wall.y + 6, Math.max(0, wall.w - 12), 6);
  }

  for (const pickup of world.pickups) {
    if (!pickup.active) continue;
    const bob = Math.sin(pickup.pulse) * 6;
    const pickupStyles = {
      token: { color: '#ffd76d', name: 'TOKEN' },
      life: { color: '#ff77b9', name: 'EXTRA LIFE' },
      health: { color: '#79e7ae', name: 'HEALTH' },
      weapon: { color: '#ff8a67', name: 'GUN UPGRADE' },
      invincibility: { color: '#81dcff', name: 'INVINCIBLE' },
    };
    const style = pickupStyles[pickup.type] || pickupStyles.token;
    ctx.save();
    ctx.translate(pickup.x, pickup.y + bob);
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(0, 0, pickup.type === 'token' ? 15 : 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    drawPickupIcon(pickup.type);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(style.name, 0, 31);
    ctx.restore();
  }

  if (world.grandToken) {
    const holder = world.players.find((player) => player.id === world.grandToken.holderId && player.alive);
    const tokenX = holder ? holder.x : world.grandToken.x;
    const tokenY = holder ? holder.y - 43 : world.grandToken.y + Math.sin(world.grandToken.pulse) * 8;
    if (holder || world.grandToken.active) {
      ctx.save();
      ctx.translate(tokenX, tokenY);
      ctx.rotate(holder ? 0 : world.grandToken.pulse * 0.22);
      ctx.shadowColor = '#ffd76d';
      ctx.shadowBlur = 28;
      ctx.fillStyle = '#ffd76d';
      ctx.beginPath();
      ctx.arc(0, 0, 28 + Math.sin(world.grandToken.pulse) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff4ba';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#513b12';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('50', 0, 1);
      ctx.restore();
    }
  }

  for (const hazard of world.hazards) {
    if (hazard.kind === 'saw') {
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.angle);
      ctx.strokeStyle = palette.hazard;
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 / 8) * i;
        const x = Math.cos(angle) * hazard.radius;
        const y = Math.sin(angle) * hazard.radius;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      const hazardColors = {
        storm: '117,220,255',
        lava: '255,83,46',
        boost: '117,250,255',
        ice: '213,250,255',
        venom: '218,93,152',
      };
      const rgb = hazardColors[hazard.kind] || '255,205,87';
      ctx.fillStyle = hazard.active ? `rgba(${rgb},0.38)` : `rgba(${rgb},0.18)`;
      ctx.strokeStyle = `rgba(${rgb},0.9)`;
      ctx.lineWidth = hazard.kind === 'boost' ? 5 : 2;
      ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText({ storm: 'TIDE', lava: 'LAVA', boost: 'BOOST', ice: 'ICE', venom: 'VENOM' }[hazard.kind] || '', hazard.x, hazard.y);
    }
  }

  for (const player of world.players) {
    if (!player.alive) continue;
    const color = getTeam(player.team).color;
    const protectedPlayer = player.spawnShield > 0 || player.shield > 0;
    if (protectedPlayer) {
      const isSpawnProtection = player.spawnShield > 0;
      const shieldColor = isSpawnProtection ? '#ffd76d' : '#8fe7ff';
      const pulse = Math.sin(performance.now() * 0.008) * 3;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = isSpawnProtection ? 26 : 18;
      ctx.fillStyle = isSpawnProtection ? 'rgba(255,215,109,0.2)' : 'rgba(143,231,255,0.16)';
      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 13 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 20 + pulse, -Math.PI * 0.8, Math.PI * 0.15);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(player.x, player.y + player.radius + 8, player.radius + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.aim || 0);
    const skin = SKINS.find((entry) => entry.id === player.skinId)?.color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    if (skin) {
      ctx.strokeStyle = skin;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#f9d9b8';
    ctx.beginPath();
    ctx.arc(0, -8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(10, -2, 25, 4);
    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(player.x - 20, player.y - 30, 40, 6);
    ctx.fillStyle = '#79e7ae';
    ctx.fillRect(player.x - 20, player.y - 30, 40 * (player.hp / player.maxHp), 6);

    ctx.fillStyle = '#eef7ff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - 38);
  }

  for (const bullet of world.projectiles) {
    ctx.beginPath();
    ctx.fillStyle = getTeam(bullet.team).color;
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const particle of world.particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life * 2);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  drawEnemyIndicators(local);
}

function drawEnemyIndicators(local) {
  if (!local) return;
  const marginX = Math.min(42, canvas.width * 0.12);
  const marginTop = 255;
  const marginBottom = Math.max(marginTop + 40, canvas.height - 92);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  world.players.forEach((enemy) => {
    if (!enemy.alive || enemy.team === local.team) return;
    const dx = enemy.x - local.x;
    const dy = enemy.y - local.y;
    const screenX = centerX + dx;
    const screenY = centerY + dy;
    if (screenX >= marginX && screenX <= canvas.width - marginX &&
        screenY >= marginTop && screenY <= marginBottom) return;
    const angle = Math.atan2(dy, dx);
    const halfW = Math.max(1, centerX - marginX);
    const halfH = Math.max(1, Math.min(centerY - marginTop, marginBottom - centerY));
    const scale = Math.min(
      halfW / Math.max(Math.abs(dx), 0.001),
      halfH / Math.max(Math.abs(dy), 0.001)
    );
    const x = centerX + dx * scale;
    const y = centerY + dy * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = getTeam(enemy.team).color;
    ctx.shadowColor = '#07111d';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function drawShieldHalo(x, y, radius, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function render() {
  drawBackground();
  drawArena();
}

function handlePointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  const local = getLocalPlayer();
  const screenX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const screenY = (event.clientY - rect.top) * (canvas.height / rect.height);
  input.pointerX = (screenX - canvas.width / 2) / world.cameraZoom + (local?.x || world.width / 2);
  input.pointerY = (screenY - canvas.height / 2) / world.cameraZoom + (local?.y || world.height / 2);
}

function bindInput() {
  const keyMap = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'dash',
    ShiftRight: 'dash',
    Space: 'shoot',
    Tab: 'spectate',
    NumpadAdd: 'zoomIn',
    Equal: 'zoomIn',
    NumpadSubtract: 'zoomOut',
    Minus: 'zoomOut',
    KeyE: 'use',
    KeyJ: 'shoot',
    Escape: 'pause',
  };

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    const action = keyMap[event.code];
    if (action === 'pause') {
      if (world.phase === 'match') {
        world.pausedPhase = 'match';
        world.phase = 'pause';
        setScreen('pause');
      } else if (world.phase === 'countdown') {
        world.pausedPhase = 'countdown';
        world.phase = 'pause';
        setScreen('pause');
      } else if (world.phase === 'pause') {
        world.phase = world.pausedPhase;
        setScreen('match');
        updateHud();
      }
      return;
    }
    if (world.phase === 'match' && ['zoomIn', 'zoomOut', 'spectate'].includes(action)) {
      event.preventDefault();
      if (action === 'zoomIn') world.cameraZoom = clamp(world.cameraZoom + 0.1, 0.65, 1.7);
      if (action === 'zoomOut') world.cameraZoom = clamp(world.cameraZoom - 0.1, 0.65, 1.7);
      if (action === 'spectate') {
        const alivePlayers = world.players.filter((player) => player.alive && player.id !== world.localId);
        if (alivePlayers.length) {
          const currentIndex = alivePlayers.findIndex((player) => player.id === world.spectateTargetId);
          world.spectateTargetId = alivePlayers[(currentIndex + 1) % alivePlayers.length].id;
        }
      }
      return;
    }
    if (world.phase === 'match' && /^Digit[1-4]$/.test(event.code)) {
      const local = getLocalPlayer();
      const selected = Number(event.code.slice(-1)) - 1;
      if (local && selected <= local.maxWeaponLevel) {
        local.weaponLevel = selected;
        updateHud();
      }
      return;
    }
    if (action) {
      if (world.phase !== 'match' && world.phase !== 'countdown' && world.phase !== 'mapSpin') return;
      event.preventDefault();
      if (action === 'shoot') input.shoot = true;
      if (action === 'dash') input.dash = true;
      if (action === 'use') input.use = true;
      if (action === 'up') input.up = true;
      if (action === 'down') input.down = true;
      if (action === 'left') input.left = true;
      if (action === 'right') input.right = true;
    }
  });

  document.addEventListener('keyup', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    const action = keyMap[event.code];
    if (action === 'shoot') input.shoot = false;
    if (action === 'dash') input.dash = false;
    if (action === 'up') input.up = false;
    if (action === 'down') input.down = false;
    if (action === 'left') input.left = false;
    if (action === 'right') input.right = false;
  });

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerdown', () => { input.shoot = true; });
  canvas.addEventListener('pointerup', () => { input.shoot = false; });
  canvas.addEventListener('pointerleave', () => { input.shoot = false; });
  moveJoystickEl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    moveJoystickEl.setPointerCapture(event.pointerId);
    updateMovementJoystick(event);
  });
  moveJoystickEl.addEventListener('pointermove', (event) => {
    if (moveJoystickEl.hasPointerCapture(event.pointerId)) updateMovementJoystick(event);
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    moveJoystickEl.addEventListener(eventName, resetMovementJoystick);
  }
  document.querySelectorAll('[data-touch]').forEach((button) => {
    const action = button.dataset.touch;
    const setPressed = (pressed) => {
      input[action] = pressed;
    };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setPressed(true);
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(eventName, () => setPressed(false));
    }
  });
}

function updateMovementJoystick(event) {
  const bounds = moveJoystickEl.getBoundingClientRect();
  const maxTravel = Math.max(1, bounds.width * 0.34);
  const rawX = event.clientX - (bounds.left + bounds.width / 2);
  const rawY = event.clientY - (bounds.top + bounds.height / 2);
  const distance = Math.hypot(rawX, rawY);
  const scale = distance > maxTravel ? maxTravel / distance : 1;
  const x = rawX * scale;
  const y = rawY * scale;
  const normalizedX = x / maxTravel;
  const normalizedY = y / maxTravel;
  input.left = normalizedX < -0.24;
  input.right = normalizedX > 0.24;
  input.up = normalizedY < -0.24;
  input.down = normalizedY > 0.24;
  joystickKnobEl.style.transform =
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function resetMovementJoystick() {
  input.left = false;
  input.right = false;
  input.up = false;
  input.down = false;
  joystickKnobEl.style.transform = 'translate(-50%, -50%)';
}

function refreshMapOptions(selectedValue = mapSelectInput.value || 'reef') {
  mapSelectInput.replaceChildren();
  for (const [id, map] of Object.entries(MAPS)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = map.name;
    mapSelectInput.append(option);
  }
  for (const map of customMaps) {
    const option = document.createElement('option');
    option.value = `custom:${map.id}`;
    option.textContent = `✦ ${map.name}`;
    mapSelectInput.append(option);
  }
  mapSelectInput.value = Array.from(mapSelectInput.options).some((option) => option.value === selectedValue)
    ? selectedValue
    : 'reef';
  updateMapDescription();
}

function updateMapDescription() {
  const map = getSelectedMap();
  mapDescriptionEl.textContent = map.description || `Custom ${map.theme} arena · ${map.cells.length} placed pieces`;
  selectedMapFeatureEl.textContent = 'Random arena';
  countdownMapEl.textContent = map.name;
}

function updateBotDifficultyDescription() {
  document.getElementById('botDifficultyDescription').textContent =
    BOT_SKILLS[botDifficultyInput.value]?.description || BOT_SKILLS.medium.description;
}

function drawMapEditor() {
  const columns = 26;
  const rows = 17;
  const originX = 22;
  const originY = 8;
  const tileW = 26;
  const tileH = 25;
  const theme = MAP_THEMES[customMapThemeInput.value] || MAP_THEMES.reef;
  editorCtx.clearRect(0, 0, mapEditorCanvas.width, mapEditorCanvas.height);
  editorCtx.fillStyle = theme.floor;
  editorCtx.fillRect(0, 0, mapEditorCanvas.width, mapEditorCanvas.height);
  editorCtx.strokeStyle = theme.grid;
  editorCtx.lineWidth = 1;
  for (let col = 0; col <= columns; col += 1) {
    editorCtx.beginPath();
    editorCtx.moveTo(originX + col * tileW, originY);
    editorCtx.lineTo(originX + col * tileW, originY + rows * tileH);
    editorCtx.stroke();
  }
  for (let row = 0; row <= rows; row += 1) {
    editorCtx.beginPath();
    editorCtx.moveTo(originX, originY + row * tileH);
    editorCtx.lineTo(originX + columns * tileW, originY + row * tileH);
    editorCtx.stroke();
  }
  for (const cell of editorTiles) {
    const colors = { wall: theme.trim, hazard: theme.hazard, boost: '#69faff' };
    editorCtx.fillStyle = colors[cell.type] || theme.trim;
    editorCtx.globalAlpha = 0.86;
    editorCtx.fillRect(originX + cell.col * tileW + 3, originY + cell.row * tileH + 3, tileW - 6, tileH - 6);
    editorCtx.globalAlpha = 1;
    editorCtx.fillStyle = '#101729';
    editorCtx.font = 'bold 11px sans-serif';
    editorCtx.textAlign = 'center';
    editorCtx.textBaseline = 'middle';
    editorCtx.fillText({ wall: '◆', hazard: '!', boost: '»' }[cell.type], originX + cell.col * tileW + tileW / 2, originY + cell.row * tileH + tileH / 2);
  }
  editorCtx.fillStyle = 'rgba(255,255,255,0.16)';
  editorCtx.fillRect(originX + 12 * tileW, originY + 7 * tileH, 3 * tileW, 3 * tileH);
  editorCtx.fillStyle = '#fff';
  editorCtx.font = 'bold 12px sans-serif';
  editorCtx.textAlign = 'center';
  editorCtx.fillText('KEEP SPAWNS OPEN', originX + 13.5 * tileW, originY + 8.5 * tileH);
}

function loadCustomMaps() {
  try {
    const saved = localStorage.getItem('chaos-arena-custom-maps');
    if (!saved) {
      customMaps = [];
      return;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Saved map data must be a list.');
    customMaps = parsed.filter((map) =>
      map && typeof map.id === 'string' && typeof map.name === 'string' && map.name.length <= 24 &&
      Object.hasOwn(MAP_THEMES, map.theme) && Array.isArray(map.cells) &&
      map.cells.length <= 130 && map.cells.every((cell) =>
        Number.isInteger(cell.col) && cell.col >= 0 && cell.col < 26 &&
        Number.isInteger(cell.row) && cell.row >= 0 && cell.row < 17 &&
        ['wall', 'hazard', 'boost'].includes(cell.type)
      )
    );
  } catch (error) {
    customMaps = [];
    showToast(`Could not load saved maps: ${error.message}`);
  }
}

function saveCustomMap() {
  const name = customMapNameInput.value.trim().slice(0, 24);
  if (!name) {
    showToast('Give your map a name first');
    return;
  }
  const map = {
    id: `${Date.now()}-${randomId()}`,
    name,
    theme: customMapThemeInput.value,
    cells: editorTiles.map((cell) => ({ ...cell })),
  };
  customMaps.unshift(map);
  try {
    localStorage.setItem('chaos-arena-custom-maps', JSON.stringify(customMaps));
  } catch (error) {
    customMaps.shift();
    showToast(`Could not save map: ${error.message}`);
    return;
  }
  refreshMapOptions(`custom:${map.id}`);
  setScreen('menu');
  showToast(`${name} saved to this browser`);
}

function drawAccountProfile(profile) {
  signedInUser = profile;
  document.getElementById('accountTitle').textContent = `Welcome, ${profile.displayName}`;
  accountDetailsEl.classList.remove('hidden');
  document.getElementById('googleSignIn').classList.add('hidden');
  document.getElementById('accountUid').textContent = profile.uid;
  document.getElementById('accountXp').textContent = String(profile.xp);
  document.getElementById('accountTokens').textContent = String(profile.tokens);
  document.getElementById('shopTokenBalance').textContent = String(profile.tokens);
  const today = new Date().toISOString().slice(0, 10);
  const earnedToday = profile.tokenDay === today ? profile.dailyTokensEarned : 0;
  document.getElementById('tokenAllowance').textContent =
    `${TOKENS_PER_KILL} tokens per kill · ${Math.max(0, DAILY_TOKEN_CAP - earnedToday)} of ${DAILY_TOKEN_CAP} daily tokens remaining.`;
  document.getElementById('accountSkins').textContent = profile.skins.map((id) => SKINS.find((skin) => skin.id === id)?.name || id).join(', ');
  renderShopItems('skinShop', SKINS, 'skin');
  renderShopItems('gunShop', GUNS, 'gun');
  const skinSelect = document.getElementById('equippedSkin');
  skinSelect.replaceChildren();
  for (const skin of SKINS.filter((entry) => profile.skins.includes(entry.id))) {
    const option = document.createElement('option');
    option.value = skin.id;
    option.textContent = skin.name;
    skinSelect.append(option);
  }
  skinSelect.value = profile.equippedSkin;
  const gunSelect = document.getElementById('equippedGun');
  gunSelect.replaceChildren();
  for (const gun of GUNS.filter((entry) => profile.guns.includes(entry.id))) {
    const option = document.createElement('option');
    option.value = gun.id;
    option.textContent = gun.name;
    gunSelect.append(option);
  }
  gunSelect.value = profile.equippedGun;
}

function renderShopItems(containerId, items, kind) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  const ownedItems = kind === 'skin' ? signedInUser.skins : signedInUser.guns;
  const equippedItem = kind === 'skin' ? signedInUser.equippedSkin : signedInUser.equippedGun;
  for (const item of items) {
    const owned = ownedItems.includes(item.id);
    const card = document.createElement('article');
    card.className = 'shop-item';
    const title = document.createElement('strong');
    title.textContent = item.name;
    const rarity = document.createElement('span');
    rarity.className = `rarity rarity-${item.rarity.toLowerCase()}`;
    rarity.textContent = item.rarity;
    const description = document.createElement('p');
    description.textContent = kind === 'skin'
      ? item.ability
      : `${item.description} Damage: ${item.damage}.`;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = owned ? 'secondary' : 'primary';
    action.disabled = owned && equippedItem === item.id || !owned && signedInUser.tokens < item.price;
    action.textContent = owned
      ? equippedItem === item.id ? 'Equipped' : 'Equip'
      : item.price ? `Buy · ${item.price} ✦` : 'Free';
    action.addEventListener('click', () => {
      if (owned) void equipShopItem(kind, item.id);
      else void purchaseShopItem(kind, item.id);
    });
    card.append(title, rarity, description, action);
    container.append(card);
  }
}

function normalizeProfile(data, user) {
  const normalizeIds = (value, validIds, fallback) => {
    const ids = Array.isArray(value)
      ? value
      : Object.keys(value || {}).filter((id) => value[id]);
    const valid = ids.filter((id) => validIds.includes(id));
    return valid.length ? valid : fallback;
  };
  const skinIds = SKINS.map((skin) => skin.id);
  const gunIds = GUNS.map((gun) => gun.id);
  const skins = normalizeIds(data.skins, skinIds, ['rookie']);
  const guns = normalizeIds(data.guns, gunIds, ['pulse']);
  const equippedSkin = skins.includes(data.equippedSkin) ? data.equippedSkin : 'rookie';
  const equippedGun = guns.includes(data.equippedGun) ? data.equippedGun : 'pulse';
  return {
    uid: user.uid,
    displayName: (user.displayName || data.displayName || 'Arena pilot').slice(0, 18),
    xp: Number.isSafeInteger(data.xp) && data.xp >= 0 ? data.xp : 0,
    skins,
    guns,
    equippedSkin,
    equippedGun,
    tokens: Number.isSafeInteger(data.tokens) && data.tokens >= 0 ? data.tokens : 0,
    tokenDay: typeof data.tokenDay === 'string' ? data.tokenDay : '',
    dailyTokensEarned: Number.isSafeInteger(data.dailyTokensEarned) && data.dailyTokensEarned >= 0
      ? Math.min(DAILY_TOKEN_CAP, data.dailyTokensEarned)
      : 0,
  };
}

function serializeOwned(items) {
  return Object.fromEntries(items.map((id) => [id, true]));
}

async function persistProfile(profile) {
  const { ref, set } = firebaseApi;
  await set(ref(realtimeDb, `profiles/${profile.uid}`), {
    ...profile,
    skins: serializeOwned(profile.skins),
    guns: serializeOwned(profile.guns),
    updatedAt: Date.now(),
  });
}

async function equipShopItem(kind, itemId) {
  if (!signedInUser || !firebaseApi) return;
  const items = kind === 'skin' ? signedInUser.skins : signedInUser.guns;
  if (!items.includes(itemId)) {
    accountStatusEl.textContent = `Buy this ${kind} before equipping it.`;
    return;
  }
  const nextProfile = { ...signedInUser, [kind === 'skin' ? 'equippedSkin' : 'equippedGun']: itemId };
  try {
    await persistProfile(nextProfile);
    drawAccountProfile(nextProfile);
    accountStatusEl.textContent = `${(kind === 'skin' ? SKINS : GUNS).find((item) => item.id === itemId).name} equipped.`;
  } catch (error) {
    accountStatusEl.textContent = `Could not equip ${kind}: ${describeFirebaseError(error)}`;
  }
}

async function purchaseShopItem(kind, itemId) {
  if (!signedInUser || !firebaseApi) return;
  const catalog = kind === 'skin' ? SKINS : GUNS;
  const item = catalog.find((entry) => entry.id === itemId);
  if (!item) return;
  const ownedKey = kind === 'skin' ? 'skins' : 'guns';
  const profileRef = firebaseApi.ref(realtimeDb, `profiles/${signedInUser.uid}`);
  let purchaseMessage = '';
  try {
    const result = await firebaseApi.runTransaction(profileRef, (current) => {
      if (!current) return;
      const normalized = normalizeProfile(current, signedInUser);
      if (normalized[ownedKey].includes(item.id)) {
        purchaseMessage = 'You already own this item.';
        return;
      }
      if (normalized.tokens < item.price) {
        purchaseMessage = 'You do not have enough tokens for that item.';
        return;
      }
      return {
        ...current,
        [ownedKey]: serializeOwned([...normalized[ownedKey], item.id]),
        tokens: normalized.tokens - item.price,
        updatedAt: Date.now(),
      };
    });
    if (!result.committed) {
      accountStatusEl.textContent = purchaseMessage || 'Purchase could not be completed.';
      return;
    }
    const nextProfile = normalizeProfile(result.snapshot.val(), signedInUser);
    signedInUser = nextProfile;
    await equipShopItem(kind, item.id);
    accountStatusEl.textContent = `${item.name} purchased and equipped!`;
  } catch (error) {
    accountStatusEl.textContent = `Could not purchase ${kind}: ${describeFirebaseError(error)}`;
  }
}

async function refreshAccountData() {
  if (!signedInUser || !firebaseApi) return;
  const { ref, get, query, orderByChild, limitToLast } = firebaseApi;
  const leaderboardSnapshot = await get(query(ref(realtimeDb, 'profiles'), orderByChild('xp'), limitToLast(10)));
  const leaderboard = Object.entries(leaderboardSnapshot.val() || {})
    .map(([uid, profile]) => ({ uid, ...profile }))
    .sort((left, right) => (right.xp || 0) - (left.xp || 0))
    .slice(0, 10);
  globalLeaderboardEl.replaceChildren();
  if (!leaderboard.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No players have earned XP yet. Finish a match to claim the first spot!';
    globalLeaderboardEl.append(empty);
  }
  leaderboard.forEach((data, index) => {
    const row = document.createElement('li');
    row.textContent = `${index + 1}. ${data.displayName || 'Arena pilot'} — ${Number.isSafeInteger(data.xp) ? data.xp : 0} XP`;
    globalLeaderboardEl.append(row);
  });
  const requestSnapshot = await get(ref(realtimeDb, `friendRequests/${signedInUser.uid}`));
  const requests = Object.entries(requestSnapshot.val() || {})
    .filter(([, request]) => request.status === 'pending');
  friendRequestsEl.replaceChildren();
  requests.forEach(([senderUid, data]) => {
    const row = document.createElement('div');
    row.className = 'friend-row';
    const name = document.createElement('span');
    name.textContent = `${data.fromName || 'Arena pilot'} wants to be friends`;
    const accept = document.createElement('button');
    accept.className = 'secondary';
    accept.type = 'button';
    accept.textContent = 'Accept';
    accept.addEventListener('click', () => { void acceptFriendRequest(senderUid); });
    row.append(name, accept);
    friendRequestsEl.append(row);
  });
  const friendsSnapshot = await get(ref(realtimeDb, `friends/${signedInUser.uid}`));
  const friends = Object.entries(friendsSnapshot.val() || {});
  friends.forEach(([friendUid, friend]) => {
    const row = document.createElement('div');
    row.className = 'friend-row';
    row.textContent = `Friends with ${friend.displayName || friendUid}`;
    friendRequestsEl.append(row);
  });
  if (!requests.length && !friends.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No friends or incoming requests yet.';
    friendRequestsEl.append(empty);
  }
}

async function loadSignedInProfile(user) {
  const { ref, get } = firebaseApi;
  const profileRef = ref(realtimeDb, `profiles/${user.uid}`);
  const snapshot = await get(profileRef);
  const profile = normalizeProfile(snapshot.val() || {}, user);
  await persistProfile(profile);
  playerNameInput.value = profile.displayName.slice(0, playerNameInput.maxLength);
  drawAccountProfile(profile);
  accountStatusEl.textContent = 'Progress, shop purchases, and friends sync to your Google-linked Firebase account.';
  try {
    await refreshAccountData();
  } catch (error) {
    accountStatusEl.textContent = `Profile loaded, but online rankings/friends could not refresh: ${describeFirebaseError(error)}`;
  }
}

async function acceptFriendRequest(senderUid) {
  if (!signedInUser || !firebaseApi) return;
  const { ref, get, update } = firebaseApi;
  try {
    const recipientUid = signedInUser.uid;
    const requestSnapshot = await get(ref(realtimeDb, `friendRequests/${recipientUid}/${senderUid}`));
    const request = requestSnapshot.val();
    if (!request || request.status !== 'pending') {
      accountStatusEl.textContent = 'That friend request is no longer pending.';
      await refreshAccountData();
      return;
    }
    const senderSnapshot = await get(ref(realtimeDb, `profiles/${senderUid}`));
    const senderName = senderSnapshot.val()?.displayName || request.fromName || 'Arena friend';
    const now = Date.now();
    await update(ref(realtimeDb, `friendRequests/${recipientUid}/${senderUid}`), { status: 'accepted' });
    await update(ref(realtimeDb), {
      [`friends/${recipientUid}/${senderUid}`]: {
        uid: senderUid, displayName: senderName, createdAt: now,
      },
      [`friends/${senderUid}/${recipientUid}`]: {
        uid: recipientUid, displayName: signedInUser.displayName, createdAt: now,
      },
    });
    accountStatusEl.textContent = 'Friend request accepted.';
    try {
      await refreshAccountData();
    } catch (error) {
      accountStatusEl.textContent = `Friend request accepted, but lists could not refresh: ${error.message}`;
    }
  } catch (error) {
    accountStatusEl.textContent = `Could not accept request: ${describeFirebaseError(error)}`;
  }
}

async function initializeFirebase() {
  const ready = ['apiKey', 'authDomain', 'projectId', 'appId', 'databaseURL'].every((key) =>
    typeof firebaseConfig[key] === 'string' &&
    firebaseConfig[key].trim() &&
    !firebaseConfig[key].includes('YOUR_') &&
    !firebaseConfig[key].includes('PASTE_')
  );
  if (!ready) {
    accountStatusEl.textContent = 'Add your Firebase web-app settings and Realtime Database URL to firebase-config.js, enable Google sign-in, and publish database.rules.json.';
    globalLeaderboardEl.replaceChildren();
    const note = document.createElement('li');
    note.textContent = 'Leaderboard unavailable: this copy is not connected to a Firebase project yet.';
    globalLeaderboardEl.append(note);
    return;
  }
  try {
    const [appSdk, authSdk, databaseSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js'),
    ]);
    firebaseApi = { ...authSdk, ...databaseSdk };
    firebaseApp = appSdk.initializeApp(firebaseConfig);
    firebaseAuth = authSdk.getAuth(firebaseApp);
    realtimeDb = databaseSdk.getDatabase(firebaseApp, firebaseConfig.databaseURL);
    try {
      await authSdk.getRedirectResult(firebaseAuth);
    } catch (error) {
      accountStatusEl.textContent = `Google sign-in failed: ${describeFirebaseError(error)}`;
    }
    authSdk.onAuthStateChanged(firebaseAuth, (user) => {
      signedInUser = null;
      networkUid = user?.uid || '';
      networkReady = Boolean(user);
      accountDetailsEl.classList.add('hidden');
      document.getElementById('googleSignIn').classList.toggle('hidden', Boolean(user && !user.isAnonymous));
      document.getElementById('emailAuthForm').classList.toggle('hidden', Boolean(user && !user.isAnonymous));
      if (!user) {
        document.getElementById('accountTitle').textContent = 'Save your progress';
        accountStatusEl.textContent = 'Connecting secure guest access for multiplayer...';
        globalLeaderboardEl.replaceChildren();
        const note = document.createElement('li');
        note.textContent = 'Sign in to load the global XP leaderboard.';
        globalLeaderboardEl.append(note);
        void authSdk.signInAnonymously(firebaseAuth).catch((error) => {
          networkReady = false;
          accountStatusEl.textContent = `Multiplayer guest connection failed: ${describeFirebaseError(error)}`;
        });
        return;
      }
      if (user.isAnonymous) {
        document.getElementById('accountTitle').textContent = 'Save your progress';
        accountStatusEl.textContent = 'Connected as a guest for online multiplayer. Sign in to save XP, earn shop tokens, and use the shop.';
        globalLeaderboardEl.replaceChildren();
        const note = document.createElement('li');
        note.textContent = 'Sign in to load the global XP leaderboard.';
        globalLeaderboardEl.append(note);
        return;
      }
      void loadSignedInProfile(user).catch((error) => {
        accountStatusEl.textContent = `Could not load your profile: ${describeFirebaseError(error)}`;
      });
    }, (error) => {
      accountStatusEl.textContent = `Firebase sign-in error: ${describeFirebaseError(error)}`;
    });
  } catch (error) {
    accountStatusEl.textContent = `Firebase could not be initialized: ${describeFirebaseError(error)}`;
  }
}

async function saveMatchProgress(
  player,
  tokensEarned = world.matchTokensEarned,
  tokenError = world.matchTokenError
) {
  if (!signedInUser || !player || !firebaseApi) return;
  const earned = Math.max(10, Math.round(player.score / 3) + player.kills * 5);
  const profileRef = firebaseApi.ref(realtimeDb, `profiles/${signedInUser.uid}`);
  try {
    const result = await firebaseApi.runTransaction(profileRef, (profile) => {
      profile = profile || {};
      const xp = (Number.isSafeInteger(profile.xp) ? profile.xp : 0) + earned;
      const oldSkins = Array.isArray(profile.skins)
        ? profile.skins
        : Object.keys(profile.skins || {}).filter((id) => profile.skins[id]);
      return {
        uid: signedInUser.uid,
        displayName: signedInUser.displayName,
        xp,
        skins: serializeOwned(oldSkins.length ? oldSkins : ['rookie']),
        guns: serializeOwned(Object.keys(profile.guns || {}).filter((gunId) => profile.guns[gunId]).length
          ? Object.keys(profile.guns || {}).filter((gunId) => profile.guns[gunId])
          : ['pulse']),
        equippedSkin: profile.equippedSkin || 'rookie',
        equippedGun: profile.equippedGun || 'pulse',
        tokens: Number.isSafeInteger(profile.tokens) ? profile.tokens : 0,
        tokenDay: profile.tokenDay || '',
        dailyTokensEarned: Number.isSafeInteger(profile.dailyTokensEarned) ? profile.dailyTokensEarned : 0,
        updatedAt: Date.now(),
      };
    });
    if (!result.committed) throw new Error('The XP update was not committed.');
    const newXp = result.snapshot.val().xp;
    signedInUser = normalizeProfile(result.snapshot.val(), signedInUser);
    drawAccountProfile(signedInUser);
    xpRewardMessageEl.textContent =
      `Match rewards: +${earned} XP saved · +${tokensEarned} shop tokens · ${player.kills} KOs. Career total: ${newXp} XP.${tokenError ? ` ${tokenError}` : ''}`;
    try {
      await refreshAccountData();
    } catch (error) {
      accountStatusEl.textContent = `XP was saved, but online rankings/friends could not refresh: ${describeFirebaseError(error)}`;
    }
  } catch (error) {
    xpRewardMessageEl.textContent =
      `Match rewards: ${player.kills} KOs · +${tokensEarned} shop tokens${tokenError ? `; ${tokenError}` : ''}. XP could not be saved: ${error.message}`;
  }
}

function bindUi() {
  loadCustomMaps();
  refreshMapOptions('reef');
  for (let count = 0; count <= 11; count += 1) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = `${count} ${count === 1 ? 'bot' : 'bots'}`;
    botCountInput.append(option);
  }
  botCountInput.value = '4';
  for (let count = 2; count <= 4; count += 1) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = `${count} teams`;
    teamCountInput.append(option);
  }
  teamCountInput.value = '2';
  Object.entries(BOT_SKILLS).forEach(([value, skill]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = skill.label;
    botDifficultyInput.append(option);
  });
  botDifficultyInput.value = 'medium';
  updateBotDifficultyDescription();
  botDifficultyInput.addEventListener('change', updateBotDifficultyDescription);
  for (const [themeId, theme] of Object.entries(MAP_THEMES)) {
    const option = document.createElement('option');
    option.value = themeId;
    option.textContent = MAPS[themeId].name;
    customMapThemeInput.append(option);
  }
  customMapThemeInput.value = 'reef';
  drawMapEditor();
  mapSelectInput.addEventListener('change', updateMapDescription);
  customMapThemeInput.addEventListener('change', drawMapEditor);
  document.getElementById('customizeMapButton').addEventListener('click', () => {
    previousScreen = 'host';
    const selected = getSelectedMap();
    editorTiles = selected.cells ? selected.cells.map((cell) => ({ ...cell })) : [];
    customMapNameInput.value = selected.cells ? selected.name : 'My wild map';
    customMapThemeInput.value = selected.theme || 'reef';
    drawMapEditor();
    setScreen('editor');
  });
  document.getElementById('cancelMapEditor').addEventListener('click', () => setScreen(previousScreen));
  document.getElementById('clearCustomMap').addEventListener('click', () => {
    editorTiles = [];
    drawMapEditor();
  });
  document.getElementById('saveCustomMap').addEventListener('click', saveCustomMap);
  mapEditorCanvas.addEventListener('pointerdown', (event) => {
    const rect = mapEditorCanvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (mapEditorCanvas.width / rect.width);
    const y = (event.clientY - rect.top) * (mapEditorCanvas.height / rect.height);
    const col = Math.floor((x - 22) / 26);
    const row = Math.floor((y - 8) / 25);
    if (col < 1 || col > 24 || row < 1 || row > 15 || (col >= 11 && col <= 14 && row >= 6 && row <= 9)) {
      showToast('Keep the center and outer lanes clear');
      return;
    }
    const index = editorTiles.findIndex((cell) => cell.col === col && cell.row === row);
    const brush = mapBrushInput.value;
    if (brush === 'clear') {
      if (index >= 0) editorTiles.splice(index, 1);
    } else if (index >= 0) {
      if (editorTiles[index].type === brush) editorTiles.splice(index, 1);
      else editorTiles[index].type = brush;
    } else if (editorTiles.length < 130) {
      editorTiles.push({ col, row, type: brush });
    } else {
      showToast('Map piece limit reached');
    }
    drawMapEditor();
  });
  document.getElementById('openHost').addEventListener('click', () => setScreen('host'));
  document.getElementById('openJoin').addEventListener('click', () => {
    const savedName = localStorage.getItem('chaosPlayerName');
    if (savedName) document.getElementById('joinPlayerName').value = savedName;
    setScreen('join');
  });
  document.getElementById('homeHelp').addEventListener('click', openHelp);
  document.getElementById('homeAbout').addEventListener('click', () => setScreen('about'));
  document.getElementById('accountButton').addEventListener('click', () => {
    previousScreen = world.phase === 'result' ? 'result' : 'menu';
    setScreen('account');
  });
  document.getElementById('postMatchAccount').addEventListener('click', () => {
    previousScreen = 'result';
    setScreen('account');
  });
  document.getElementById('closeAccount').addEventListener('click', () => setScreen(previousScreen));
  document.querySelectorAll('.backHome').forEach((button) => button.addEventListener('click', () => {
    if (button.closest('#helpScreen')) returnFromHelp();
    else setScreen('menu');
  }));
  playerNameInput.value = localStorage.getItem('chaosPlayerName') || playerNameInput.value;
  document.getElementById('joinPlayerName').value = playerNameInput.value;
  playerNameInput.addEventListener('change', () => localStorage.setItem('chaosPlayerName', playerNameInput.value.trim()));
  document.getElementById('joinPlayerName').addEventListener('change', (event) => {
    localStorage.setItem('chaosPlayerName', event.target.value.trim());
  });
  document.getElementById('googleSignIn').addEventListener('click', async () => {
    if (!firebaseAuth || !firebaseApi) {
      accountStatusEl.textContent = 'Firebase is not configured yet. See firebase-config.js and README.md.';
      return;
    }
    if (location.protocol === 'file:') {
      accountStatusEl.textContent = 'Sign-in cannot run from a file:// page. Open the deployed HTTPS site or serve this folder from http://localhost:8000.';
      return;
    }
    try {
      await firebaseApi.signInWithPopup(firebaseAuth, new firebaseApi.GoogleAuthProvider());
    } catch (error) {
      if (error.code === 'auth/popup-blocked' && location.protocol !== 'file:') {
        try {
          await firebaseApi.signInWithRedirect(firebaseAuth, new firebaseApi.GoogleAuthProvider());
          return;
        } catch (redirectError) {
          accountStatusEl.textContent = `Google sign-in failed: ${describeFirebaseError(redirectError)}`;
          return;
        }
      }
      accountStatusEl.textContent = `Google sign-in failed: ${describeFirebaseError(error)}`;
    }
  });
  const submitEmailAuth = async (createAccount) => {
    if (!firebaseAuth || !firebaseApi) {
      accountStatusEl.textContent = 'Firebase is not configured yet. See firebase-config.js and README.md.';
      return;
    }
    if (location.protocol === 'file:') {
      accountStatusEl.textContent = 'Sign-in cannot run from a file:// page. Open the deployed HTTPS site or serve this folder from http://localhost:8000.';
      return;
    }
    const email = document.getElementById('emailAddress').value.trim();
    const password = document.getElementById('emailPassword').value;
    if (!email || !password) {
      accountStatusEl.textContent = 'Enter your email address and password.';
      return;
    }
    try {
      if (createAccount) {
        await firebaseApi.createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await firebaseApi.signInWithEmailAndPassword(firebaseAuth, email, password);
      }
    } catch (error) {
      accountStatusEl.textContent = `Email ${createAccount ? 'account creation' : 'sign-in'} failed: ${describeFirebaseError(error)}`;
    }
  };
  document.getElementById('emailSignIn').addEventListener('click', () => {
    void submitEmailAuth(false);
  });
  document.getElementById('emailSignUp').addEventListener('click', () => {
    void submitEmailAuth(true);
  });
  document.getElementById('googleSignOut').addEventListener('click', async () => {
    if (!firebaseAuth || !firebaseApi) return;
    try {
      await firebaseApi.signOut(firebaseAuth);
      accountStatusEl.textContent = 'You are signed out.';
    } catch (error) {
      accountStatusEl.textContent = `Could not sign out: ${describeFirebaseError(error)}`;
    }
  });
  document.getElementById('sendFriendRequest').addEventListener('click', async () => {
    if (!signedInUser || !firebaseApi) {
      accountStatusEl.textContent = 'Sign in before sending friend requests.';
      return;
    }
    const targetUid = document.getElementById('friendUid').value.trim();
    if (!targetUid || targetUid === signedInUser.uid) {
      accountStatusEl.textContent = 'Enter another player’s ID to send a request.';
      return;
    }
    try {
      const { ref, get, set } = firebaseApi;
      const target = await get(ref(realtimeDb, `profiles/${targetUid}`));
      if (!target.exists()) {
        accountStatusEl.textContent = 'No player account was found for that ID.';
        return;
      }
      const friendRef = ref(realtimeDb, `friends/${signedInUser.uid}/${targetUid}`);
      if ((await get(friendRef)).exists()) {
        accountStatusEl.textContent = 'You are already friends.';
        return;
      }
      const requestRef = ref(realtimeDb, `friendRequests/${targetUid}/${signedInUser.uid}`);
      const previousRequest = await get(requestRef);
      if (previousRequest.exists()) {
        accountStatusEl.textContent = previousRequest.val().status === 'accepted'
          ? 'You are already friends.'
          : 'A friend request has already been sent to that player.';
        return;
      }
      await set(requestRef, {
        fromUid: signedInUser.uid,
        fromName: signedInUser.displayName,
        status: 'pending',
        createdAt: Date.now(),
      });
      document.getElementById('friendUid').value = '';
      accountStatusEl.textContent = 'Friend request sent.';
    } catch (error) {
      accountStatusEl.textContent = `Could not send friend request: ${describeFirebaseError(error)}`;
    }
  });
  document.getElementById('equippedSkin').addEventListener('change', async (event) => {
    if (!signedInUser || !firebaseApi) return;
    const skin = SKINS.find((entry) => entry.id === event.target.value && signedInUser.skins.includes(entry.id));
    if (!skin) {
      accountStatusEl.textContent = 'That skin is not unlocked on your account.';
      return;
    }
    await equipShopItem('skin', skin.id);
  });
  document.getElementById('equippedGun').addEventListener('change', async (event) => {
    if (!signedInUser || !firebaseApi) return;
    await equipShopItem('gun', event.target.value);
  });
  document.getElementById('createRoom').addEventListener('click', generateRoom);
  document.getElementById('joinButton').addEventListener('click', joinRoom);
  roomInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') joinRoom();
  });
  document.getElementById('startMatch').addEventListener('click', () => {
    void startArenaFromLobby();
  });
  document.getElementById('playAgain').addEventListener('click', () => {
    void (async () => {
      if (await generateRoom()) await startArenaFromLobby();
    })();
  });
  document.getElementById('backToMenu').addEventListener('click', () => setScreen('menu'));
  document.getElementById('skipWinnerIntro').addEventListener('click', finishWinnerIntro);
  document.getElementById('leaveLobby').addEventListener('click', () => {
    void leaveNetworkRoom().then(() => {
      world.phase = 'menu';
      setScreen('menu');
    }).catch((error) => showToast(`Could not leave room: ${describeFirebaseError(error)}`));
  });
  document.getElementById('lobbyHamburger').addEventListener('click', () => {
    document.getElementById('hostPause').classList.add('hidden');
    document.getElementById('gameMenu').classList.toggle('hidden');
  });
  document.getElementById('minigameTarget').addEventListener('click', (event) => {
    minigameScore += 1;
    document.getElementById('minigameScore').textContent = String(minigameScore);
    event.currentTarget.style.left = `${8 + Math.random() * 82}%`;
    event.currentTarget.style.top = `${35 + Math.random() * 45}%`;
  });
  document.getElementById('gameMenuButton').addEventListener('click', () => {
    document.getElementById('gameMenu').classList.toggle('hidden');
  });
  document.getElementById('menuClose').addEventListener('click', () => {
    document.getElementById('gameMenu').classList.add('hidden');
  });
  document.getElementById('matchHelp').addEventListener('click', openHelp);
  document.getElementById('menuLeave').addEventListener('click', () => {
    leaveCurrentMatch();
  });
  document.getElementById('hostPause').addEventListener('click', () => {
    if (!world.isHost) return;
    if (world.phase !== 'match' && world.phase !== 'countdown') return;
    world.pausedPhase = world.phase;
    world.phase = 'pause';
    setScreen('pause');
  });
  document.getElementById('copyRoom').addEventListener('click', async () => {
    const text = `Chaos Arena room: ${world.roomCode}`;
    try { await navigator.clipboard.writeText(text); showToast('Room copied'); } catch { showToast(`Room code: ${world.roomCode}`); }
  });
  document.getElementById('resumeMatch').addEventListener('click', () => {
    if (!world.isHost) return;
    if (world.phase === 'pause') {
      world.phase = world.pausedPhase;
      setScreen('match');
      updateHud();
    }
  });
  document.getElementById('leaveGame').addEventListener('click', () => {
    leaveCurrentMatch();
  });
  settingsVolume.addEventListener('input', (event) => {
    world.settings.volume = Number(event.target.value);
  });
  settingsSensitivity.addEventListener('input', (event) => {
    world.settings.sensitivity = Number(event.target.value);
  });
  void initializeFirebase();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
resetMatchState();
setupArena();
updateLobbyPlayers();
setScreen('menu');
bindInput();
bindUi();
updateHud();
requestAnimationFrame(updateFrame);
