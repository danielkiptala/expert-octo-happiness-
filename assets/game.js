(() => {
  const board = document.getElementById('board');
  if (!board) {
    return;
  }

  const ctx = board.getContext('2d');
  if (!ctx) {
    return;
  }

  const statusTitle = document.querySelector('[data-status-title]');
  const statusHint = document.querySelector('[data-status-hint]');
  const boardStatus = document.querySelector('[data-board-status]');
  const scoreEl = document.querySelector('[data-score]');
  const bestEl = document.querySelector('[data-best]');
  const lengthEl = document.querySelector('[data-length]');
  const speedValueEl = document.querySelector('[data-speed-value]');
  const fruitsEl = document.querySelector('[data-fruits]');
  const streakEl = document.querySelector('[data-streak]');
  const bonusInEl = document.querySelector('[data-bonus-in]');
  const startBtn = document.querySelector('[data-action="start"]');
  const resetBtn = document.querySelector('[data-action="reset"]');
  const autoBtn = document.querySelector('[data-action="auto"]');
  const shareButtons = document.querySelectorAll('[data-action="share"]');
  const speedSelect = document.querySelector('[data-speed]');
  const gameShell = document.querySelector('.game-shell');
  const boardWrap = document.querySelector('.board-wrap');
  const toast = document.querySelector('[data-toast]');
  const padButtons = document.querySelectorAll('[data-dir]');
  const dailyBtn = document.querySelector('[data-action="daily"]');
  const dailyDateEl = document.querySelector('[data-daily-date]');
  const dailyTargetEl = document.querySelector('[data-daily-target]');
  const dailyBestEl = document.querySelector('[data-daily-best]');
  const dailyProgressEl = document.querySelector('[data-daily-progress]');
  const shardsEl = document.querySelector('[data-shards]');
  const upgradesEl = document.querySelector('[data-upgrades]');
  const keybindsEl = document.querySelector('[data-keybinds]');
  const achievementsEl = document.querySelector('[data-achievements]');
  const leaderboardEl = document.querySelector('[data-leaderboard]');
  const themeSelect = document.querySelector('[data-theme]');
  const colorblindToggle = document.querySelector('[data-colorblind]');
  const sfxToggle = document.querySelector('[data-sfx]');
  const musicToggle = document.querySelector('[data-music]');
  const wrapToggle = document.querySelector('[data-wrap]');
  const enemiesSelect = document.querySelector('[data-enemies]');
  const poisonSelect = document.querySelector('[data-poison]');
  const blocksSelect = document.querySelector('[data-blocks]');
  const blocksCountEl = document.querySelector('[data-blocks-count]');
  const modePill = document.querySelector('[data-mode]');
  const streakMeterFill = document.querySelector('[data-meter-fill="streak"]');
  const streakMeterMeta = document.querySelector('[data-meter-meta="streak"]');
  const boostMeterFill = document.querySelector('[data-meter-fill="boost"]');
  const boostMeterMeta = document.querySelector('[data-meter-meta="boost"]');

  const gridSize = 22;
  const speedPresets = {
    cruise: 6,
    turbo: 9,
    warp: 12
  };

  const settings = {
    wrapWalls: true,
    poisonChance: 0.2,
    poisonDuration: 6500,
    poisonPoints: 15,
    poisonShrink: 2,
    minLength: 3,
    enemyCount: 2,
    enemyMoveEvery: 2,
    blockCount: 4,
    streakWindow: 2400,
    bonusEvery: 5,
    bonusDuration: 7000,
    bonusPoints: 40,
    bonusGrowth: 3,
    basePoints: 10,
    streakBonus: 2,
    boostDuration: 3200,
    boostSpeed: 2
  };

  const baseSettings = { ...settings };
  const poisonPresets = {
    off: { chance: 0, points: 0, shrink: 0 },
    low: { chance: 0.12, points: 10, shrink: 1 },
    med: { chance: 0.2, points: 15, shrink: 2 },
    high: { chance: 0.3, points: 20, shrink: 2 }
  };

  const storageKey = 'snake.bestScore.v1';
  const prefsKey = 'snake.prefs.v1';
  const leaderboardKey = 'snake.leaderboard.v1';
  const shardsKey = 'snake.shards.v1';
  const upgradesKey = 'snake.upgrades.v1';
  const achievementsKey = 'snake.achievements.v1';

  const state = {
    snake: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    poison: null,
    bonus: null,
    enemies: [],
    blocks: [],
    score: 0,
    best: 0,
    fruits: 0,
    streak: 0,
    maxStreak: 0,
    streakExpiresAt: 0,
    nextBonusAt: settings.bonusEvery,
    growth: 0,
    boostUntil: 0,
    boostActive: false,
    autoplay: false,
    dailyActive: false,
    dailyTarget: 0,
    dailyDateKey: '',
    dailyBest: 0,
    dailyReached: false,
    lastRunDaily: false,
    lastRunDailyReached: false,
    poisonEaten: 0,
    status: 'ready',
    baseSpeed: speedPresets.cruise,
    speed: speedPresets.cruise,
    cellSize: 20,
    boardSize: 440,
    lastTime: 0,
    accumulator: 0,
    toastTimer: 0,
    enemyStep: 0,
    pauseStartedAt: 0
  };

  const colors = {
    board: '#111827',
    grid: 'rgba(255, 255, 255, 0.08)',
    snake: '#22c55e',
    snakeGlow: 'rgba(34, 197, 94, 0.35)',
    head: '#a3e635',
    food: '#f97316',
    foodGlow: 'rgba(249, 115, 22, 0.4)',
    poison: '#8b5cf6',
    poisonGlow: 'rgba(139, 92, 246, 0.55)',
    enemy: '#ef4444',
    enemyGlow: 'rgba(239, 68, 68, 0.6)',
    bonus: '#ff5c77',
    bonusGlow: 'rgba(255, 92, 119, 0.65)',
    block: '#334155',
    blockGlow: 'rgba(148, 163, 184, 0.25)'
  };

  const directionMap = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const touchState = {
    active: false,
    startX: 0,
    startY: 0,
    moved: false
  };
  const tapState = {
    lastTouchTime: 0
  };

  const defaultPrefs = {
    theme: 'neon',
    colorblind: false,
    sfx: true,
    music: true,
    speed: 'cruise',
    wrap: true,
    enemies: 2,
    poison: 'med',
    blocks: 4
  };

  let prefs = { ...defaultPrefs };
  let shards = 0;
  let leaderboard = [];
  let upgrades = {};
  const unlockedAchievements = new Set();

  const upgradeCatalog = [
    {
      id: 'streak',
      title: 'Streak Stabilizer',
      desc: 'Extends the streak window to keep combos alive.',
      max: 3,
      costs: [6, 10, 14],
      apply: level => {
        settings.streakWindow = baseSettings.streakWindow + level * 400;
      }
    },
    {
      id: 'bonus',
      title: 'Bonus Beacon',
      desc: 'Bonus drops arrive more frequently.',
      max: 2,
      costs: [8, 12],
      apply: level => {
        const reduction = level * 1;
        settings.bonusEvery = Math.max(3, baseSettings.bonusEvery - reduction);
      }
    },
    {
      id: 'boost',
      title: 'Boost Battery',
      desc: 'Extends boost duration after bonus pickups.',
      max: 3,
      costs: [5, 9, 13],
      apply: level => {
        settings.boostDuration = baseSettings.boostDuration + level * 800;
      }
    }
  ];

  const achievementCatalog = [
    {
      id: 'first-bite',
      title: 'First Bite',
      desc: 'Eat your first fruit.',
      check: state => state.fruits >= 1
    },
    {
      id: 'streak-5',
      title: 'Combo Craze',
      desc: 'Reach a streak of 5.',
      check: state => state.maxStreak >= 5
    },
    {
      id: 'score-200',
      title: 'Glow Runner',
      desc: 'Score 200 points in a single run.',
      check: state => state.score >= 200
    },
    {
      id: 'daily-clear',
      title: 'Daily Hero',
      desc: 'Hit the daily fruit target.',
      check: state => state.lastRunDailyReached
    },
    {
      id: 'clean-run',
      title: 'Clean Circuit',
      desc: 'Finish a run with no poison bites.',
      check: state => state.status === 'over' && state.poisonEaten === 0 && state.fruits >= 8
    },
    {
      id: 'enemy-dodge',
      title: 'Enemy Dodger',
      desc: 'Score 150+ with enemies on the grid.',
      check: state => settings.enemyCount >= 1 && state.score >= 150
    }
  ];

  const audioState = {
    ctx: null,
    sfxGain: null,
    musicEl: null,
    unlocked: false
  };

  function randomDirection() {
    const dirs = Object.values(directionMap);
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function getDirectionOptions(current) {
    const dirs = Object.values(directionMap);
    const others = dirs.filter(dir => dir !== current);
    shuffle(others);
    return [current, ...others];
  }

  function getNextCell(x, y, direction) {
    let nextX = x + direction.x;
    let nextY = y + direction.y;

    if (settings.wrapWalls) {
      if (nextX < 0) {
        nextX = gridSize - 1;
      } else if (nextX >= gridSize) {
        nextX = 0;
      }

      if (nextY < 0) {
        nextY = gridSize - 1;
      } else if (nextY >= gridSize) {
        nextY = 0;
      }

      return { x: nextX, y: nextY, valid: true };
    }

    const valid =
      nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize;
    return { x: nextX, y: nextY, valid };
  }

  function getDirectionKey(direction) {
    if (direction.x === 0 && direction.y === -1) {
      return 'up';
    }
    if (direction.x === 0 && direction.y === 1) {
      return 'down';
    }
    if (direction.x === -1 && direction.y === 0) {
      return 'left';
    }
    return 'right';
  }

  function getOrderedDirections() {
    const order = ['up', 'right', 'down', 'left'];
    const currentKey = getDirectionKey(state.direction);
    const ordered = [currentKey, ...order.filter(key => key !== currentKey)];
    return ordered.map(key => directionMap[key]);
  }

  function isReverseDirection(next) {
    if (state.snake.length <= 1) {
      return false;
    }
    return next.x === -state.direction.x && next.y === -state.direction.y;
  }

  function getBlockedCells() {
    const blocked = new Set();
    state.snake.forEach(segment => {
      blocked.add(`${segment.x},${segment.y}`);
    });
    state.blocks.forEach(block => {
      blocked.add(`${block.x},${block.y}`);
    });
    state.enemies.forEach(enemy => {
      blocked.add(`${enemy.x},${enemy.y}`);
    });
    if (state.poison) {
      blocked.add(`${state.poison.x},${state.poison.y}`);
    }
    return blocked;
  }

  function findPathDirection(target) {
    if (!target || !state.snake.length) {
      return null;
    }
    const blocked = getBlockedCells();
    const targetKey = `${target.x},${target.y}`;
    const start = state.snake[0];
    const visited = new Array(gridSize * gridSize).fill(false);
    const firstDir = new Array(gridSize * gridSize).fill(null);
    const queue = [];

    const startIndex = start.y * gridSize + start.x;
    visited[startIndex] = true;
    queue.push(start);

    while (queue.length) {
      const current = queue.shift();
      const currentIndex = current.y * gridSize + current.x;
      const directions = getOrderedDirections();

      for (const dir of directions) {
        const nextCell = getNextCell(current.x, current.y, dir);
        if (!nextCell.valid) {
          continue;
        }
        const key = `${nextCell.x},${nextCell.y}`;
        if (blocked.has(key) && key !== targetKey) {
          continue;
        }
        const index = nextCell.y * gridSize + nextCell.x;
        if (visited[index]) {
          continue;
        }
        visited[index] = true;
        firstDir[index] = currentIndex === startIndex ? dir : firstDir[currentIndex];
        if (key === targetKey) {
          return firstDir[index];
        }
        queue.push({ x: nextCell.x, y: nextCell.y });
      }
    }
    return null;
  }

  function findSafeDirection() {
    const blocked = getBlockedCells();
    const head = state.snake[0];
    const directions = getOrderedDirections();
    for (const dir of directions) {
      if (isReverseDirection(dir)) {
        continue;
      }
      const nextCell = getNextCell(head.x, head.y, dir);
      if (!nextCell.valid) {
        continue;
      }
      const key = `${nextCell.x},${nextCell.y}`;
      if (!blocked.has(key)) {
        return dir;
      }
    }
    return null;
  }

  function computeAutoplayDirection() {
    const foodDir = findPathDirection(state.food);
    if (foodDir && !isReverseDirection(foodDir)) {
      return foodDir;
    }
    const bonusDir = findPathDirection(state.bonus);
    if (bonusDir && !isReverseDirection(bonusDir)) {
      return bonusDir;
    }
    return findSafeDirection();
  }

  function readColorVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function syncColors() {
    colors.board = readColorVar('--board', colors.board);
    colors.grid = readColorVar('--grid', colors.grid);
    colors.snake = readColorVar('--snake', colors.snake);
    colors.snakeGlow = readColorVar('--snake-glow', colors.snakeGlow);
    colors.head = readColorVar('--head', colors.head);
    colors.food = readColorVar('--food', colors.food);
    colors.foodGlow = readColorVar('--food-glow', colors.foodGlow);
    colors.poison = readColorVar('--poison', colors.poison);
    colors.poisonGlow = readColorVar('--poison-glow', colors.poisonGlow);
    colors.enemy = readColorVar('--enemy', colors.enemy);
    colors.enemyGlow = readColorVar('--enemy-glow', colors.enemyGlow);
    colors.bonus = readColorVar('--bonus', colors.bonus);
    colors.bonusGlow = readColorVar('--bonus-glow', colors.bonusGlow);
    colors.block = readColorVar('--block', colors.block);
    colors.blockGlow = readColorVar('--block-glow', colors.blockGlow);
  }

  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(prefsKey) || '{}');
      prefs = { ...defaultPrefs, ...saved };
    } catch (error) {
      prefs = { ...defaultPrefs };
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function applyPrefsToUI() {
    if (themeSelect) {
      themeSelect.value = prefs.theme || defaultPrefs.theme;
    }
    if (colorblindToggle) {
      colorblindToggle.checked = Boolean(prefs.colorblind);
    }
    if (sfxToggle) {
      sfxToggle.checked = prefs.sfx !== false;
    }
    if (musicToggle) {
      musicToggle.checked = Boolean(prefs.music);
    }
    if (speedSelect) {
      speedSelect.value = prefs.speed || defaultPrefs.speed;
    }
    if (wrapToggle) {
      wrapToggle.checked = prefs.wrap !== false;
    }
    if (enemiesSelect) {
      enemiesSelect.value = String(
        Number.isFinite(prefs.enemies) ? prefs.enemies : defaultPrefs.enemies
      );
    }
    if (poisonSelect) {
      poisonSelect.value = prefs.poison || defaultPrefs.poison;
    }
    if (blocksSelect) {
      blocksSelect.value = String(
        Number.isFinite(prefs.blocks) ? prefs.blocks : defaultPrefs.blocks
      );
    }
  }

  function applyPrefsToDocument() {
    if (prefs.theme) {
      document.documentElement.dataset.theme = prefs.theme;
    }
    document.documentElement.dataset.colorblind = prefs.colorblind ? 'true' : 'false';
    syncColors();
    draw();
  }

  function syncPrefsFromControls() {
    if (themeSelect) {
      prefs.theme = themeSelect.value;
    }
    if (colorblindToggle) {
      prefs.colorblind = colorblindToggle.checked;
    }
    if (sfxToggle) {
      prefs.sfx = sfxToggle.checked;
    }
    if (musicToggle) {
      prefs.music = musicToggle.checked;
    }
    if (speedSelect) {
      prefs.speed = speedSelect.value;
    }
    if (wrapToggle) {
      prefs.wrap = wrapToggle.checked;
    }
    if (enemiesSelect) {
      prefs.enemies = Number.parseInt(enemiesSelect.value, 10) || 0;
    }
    if (poisonSelect) {
      prefs.poison = poisonSelect.value;
    }
    if (blocksSelect) {
      prefs.blocks = Number.parseInt(blocksSelect.value, 10) || 0;
    }
  }

  function applyPoisonPreset(value) {
    const preset = poisonPresets[value] || poisonPresets.med;
    settings.poisonChance = preset.chance;
    settings.poisonPoints = preset.points;
    settings.poisonShrink = preset.shrink;
  }

  function applySetupFromControls() {
    if (wrapToggle) {
      settings.wrapWalls = wrapToggle.checked;
    }
    if (enemiesSelect) {
      settings.enemyCount = Number.parseInt(enemiesSelect.value, 10) || 0;
    }
    if (blocksSelect) {
      settings.blockCount = Number.parseInt(blocksSelect.value, 10) || 0;
    }
    if (poisonSelect) {
      applyPoisonPreset(poisonSelect.value);
    }
  }

  function applySpeedFromControl() {
    if (!speedSelect) {
      return;
    }
    const preset = speedPresets[speedSelect.value] || speedPresets.cruise;
    state.baseSpeed = preset;
  }

  function handleSetupChange() {
    applySetupFromControls();
    syncPrefsFromControls();
    savePrefs();
    if (state.status === 'running' || state.status === 'paused') {
      showToast('Settings update next run', '');
    } else {
      resetState();
      setReady();
    }
    updateScoreboard();
  }

  function ensureAudio() {
    if (!audioState.musicEl && typeof Audio === 'function') {
      audioState.musicEl = new Audio('assets/sound-fx/music.mp3');
      audioState.musicEl.loop = true;
      audioState.musicEl.preload = 'auto';
      audioState.musicEl.volume = 0.25;
    }
    if (audioState.ctx) {
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }
    audioState.ctx = new AudioContext();
    audioState.sfxGain = audioState.ctx.createGain();
    audioState.sfxGain.gain.value = 0.2;
    audioState.sfxGain.connect(audioState.ctx.destination);
  }

  function unlockAudio() {
    ensureAudio();
    if (audioState.ctx && audioState.ctx.state === 'suspended') {
      audioState.ctx.resume();
    }
    audioState.unlocked = true;
    updateMusic();
  }

  function playTone(freq, durationMs, type = 'sine', volume = 0.18) {
    if (!prefs.sfx) {
      return;
    }
    if (!audioState.unlocked) {
      return;
    }
    ensureAudio();
    if (!audioState.ctx || !audioState.sfxGain) {
      return;
    }
    const osc = audioState.ctx.createOscillator();
    const gain = audioState.ctx.createGain();
    const now = audioState.ctx.currentTime;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.connect(gain);
    gain.connect(audioState.sfxGain);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  }

  function updateMusic() {
    ensureAudio();
    if (!audioState.musicEl) {
      return;
    }
    if (!prefs.music || !audioState.unlocked) {
      audioState.musicEl.pause();
      return;
    }
    const playPromise = audioState.musicEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  function formatDateLabel(date) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return date.toISOString().slice(0, 10);
    }
  }

  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function computeDailyTarget(dateKey) {
    const seed = hashString(dateKey);
    return 14 + (seed % 12);
  }

  function loadDailyBest(dateKey) {
    try {
      const value = Number.parseInt(
        localStorage.getItem(`snake.daily.${dateKey}.best`),
        10
      );
      return Number.isFinite(value) ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function saveDailyBest(dateKey, value) {
    try {
      localStorage.setItem(`snake.daily.${dateKey}.best`, String(value));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function updateDailyUI() {
    if (dailyDateEl) {
      const date = new Date(state.dailyDateKey || getDateKey());
      dailyDateEl.textContent = formatDateLabel(date);
    }
    if (dailyTargetEl) {
      dailyTargetEl.textContent = String(state.dailyTarget);
    }
    if (dailyBestEl) {
      dailyBestEl.textContent = String(state.dailyBest);
    }
    updateDailyProgress();
  }

  function updateDailyProgress() {
    if (!dailyProgressEl) {
      return;
    }
    if (state.dailyTarget <= 0) {
      dailyProgressEl.textContent = '0';
      return;
    }
    if (state.dailyActive) {
      dailyProgressEl.textContent = `${state.fruits} / ${state.dailyTarget}`;
    } else {
      dailyProgressEl.textContent = `0 / ${state.dailyTarget}`;
    }
  }

  function checkDailyTarget() {
    if (!state.dailyActive || state.dailyReached) {
      return;
    }
    if (state.fruits >= state.dailyTarget) {
      state.dailyReached = true;
      state.lastRunDailyReached = true;
      showToast('Daily target hit!', 'streak');
    }
  }

  function loadDailyInfo() {
    state.dailyDateKey = getDateKey();
    state.dailyTarget = computeDailyTarget(state.dailyDateKey);
    state.dailyBest = loadDailyBest(state.dailyDateKey);
    updateDailyUI();
  }

  function setModePill() {
    if (!modePill) {
      return;
    }
    modePill.textContent = state.dailyActive ? 'Daily' : 'Classic';
  }

  function startDailyRun() {
    state.dailyActive = true;
    state.dailyReached = false;
    state.lastRunDailyReached = false;
    applySetupFromControls();
    setModePill();
    newGame();
  }

  function loadShards() {
    try {
      const value = Number.parseInt(localStorage.getItem(shardsKey), 10);
      shards = Number.isFinite(value) ? value : 0;
    } catch (error) {
      shards = 0;
    }
  }

  function saveShards() {
    try {
      localStorage.setItem(shardsKey, String(shards));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function updateShardsUI() {
    if (shardsEl) {
      shardsEl.textContent = String(shards);
    }
  }

  function awardShards() {
    const baseGain = Math.floor(state.score / 120);
    const dailyBonus = state.lastRunDailyReached ? 2 : 0;
    const total = baseGain + dailyBonus;
    if (total <= 0) {
      return;
    }
    shards += total;
    saveShards();
    updateShardsUI();
    showToast(`+${total} shards`, 'streak');
  }

  function loadUpgrades() {
    try {
      const saved = JSON.parse(localStorage.getItem(upgradesKey) || '{}');
      upgrades = saved && typeof saved === 'object' ? saved : {};
    } catch (error) {
      upgrades = {};
    }
  }

  function saveUpgrades() {
    try {
      localStorage.setItem(upgradesKey, JSON.stringify(upgrades));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function getUpgradeLevel(id) {
    return upgrades[id] || 0;
  }

  function applyUpgrades() {
    settings.streakWindow = baseSettings.streakWindow;
    settings.bonusEvery = baseSettings.bonusEvery;
    settings.boostDuration = baseSettings.boostDuration;
    upgradeCatalog.forEach(upgrade => {
      const level = Math.min(getUpgradeLevel(upgrade.id), upgrade.max);
      upgrade.apply(level);
    });
  }

  function renderUpgrades() {
    if (!upgradesEl) {
      return;
    }
    const markup = upgradeCatalog
      .map(upgrade => {
        const level = getUpgradeLevel(upgrade.id);
        const maxed = level >= upgrade.max;
        const cost = upgrade.costs[level] || 0;
        const canBuy = !maxed && shards >= cost;
        const label = maxed ? 'Maxed' : `Buy ${cost} shards`;
        return `
          <div class="upgrade-card">
            <div class="upgrade-title">${upgrade.title}</div>
            <div class="upgrade-desc">${upgrade.desc}</div>
            <div class="upgrade-meta">Level ${level} / ${upgrade.max}</div>
            <div class="upgrade-actions">
              <span class="upgrade-meta">${maxed ? 'Complete' : 'Upgrade'}</span>
              <button class="btn btn--ghost" type="button" data-upgrade="${upgrade.id}" ${
                canBuy ? '' : 'disabled'
              }>${label}</button>
            </div>
          </div>
        `;
      })
      .join('');
    upgradesEl.innerHTML = markup;
  }

  function handleUpgradePurchase(id) {
    const upgrade = upgradeCatalog.find(item => item.id === id);
    if (!upgrade) {
      return;
    }
    const level = getUpgradeLevel(upgrade.id);
    if (level >= upgrade.max) {
      return;
    }
    const cost = upgrade.costs[level] || 0;
    if (shards < cost) {
      showToast('Not enough shards', 'poison');
      return;
    }
    shards -= cost;
    upgrades[upgrade.id] = level + 1;
    saveUpgrades();
    applyUpgrades();
    updateShardsUI();
    renderUpgrades();
    showToast('Upgrade unlocked!', 'streak');
  }

  function loadAchievements() {
    try {
      const saved = JSON.parse(localStorage.getItem(achievementsKey) || '[]');
      if (Array.isArray(saved)) {
        saved.forEach(id => unlockedAchievements.add(id));
      }
    } catch (error) {
      unlockedAchievements.clear();
    }
  }

  function saveAchievements() {
    try {
      localStorage.setItem(
        achievementsKey,
        JSON.stringify(Array.from(unlockedAchievements))
      );
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function renderAchievements() {
    if (!achievementsEl) {
      return;
    }
    const markup = achievementCatalog
      .map(achievement => {
        const unlocked = unlockedAchievements.has(achievement.id);
        return `
          <div class="achievement ${unlocked ? 'is-unlocked' : 'is-locked'}">
            <div class="achievement__title">${achievement.title}</div>
            <div class="achievement__desc">${achievement.desc}</div>
            <div class="achievement__badge">${unlocked ? 'Unlocked' : 'Locked'}</div>
          </div>
        `;
      })
      .join('');
    achievementsEl.innerHTML = markup;
  }

  function unlockAchievement(id) {
    if (unlockedAchievements.has(id)) {
      return;
    }
    unlockedAchievements.add(id);
    saveAchievements();
    renderAchievements();
    showToast('Achievement unlocked!', 'streak');
  }

  function checkAchievements() {
    achievementCatalog.forEach(achievement => {
      if (unlockedAchievements.has(achievement.id)) {
        return;
      }
      if (achievement.check(state)) {
        unlockAchievement(achievement.id);
      }
    });
  }

  function loadLeaderboard() {
    try {
      const saved = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
      leaderboard = Array.isArray(saved) ? saved : [];
    } catch (error) {
      leaderboard = [];
    }
  }

  function saveLeaderboard() {
    try {
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function renderLeaderboard() {
    if (!leaderboardEl) {
      return;
    }
    if (!leaderboard.length) {
      leaderboardEl.innerHTML = '<div class="leader-row">No runs yet. Start a sprint!</div>';
      return;
    }
    const markup = leaderboard
      .map((entry, index) => {
        return `
          <div class="leader-row">
            <div class="leader-score">#${index + 1} | ${entry.score} pts</div>
            <div class="leader-meta">Fruits ${entry.fruits} | Streak ${entry.streak} | ${entry.date}${
              entry.daily ? ' | Daily' : ''
            }</div>
          </div>
        `;
      })
      .join('');
    leaderboardEl.innerHTML = markup;
  }

  function recordRun() {
    const entry = {
      score: state.score,
      fruits: state.fruits,
      streak: state.maxStreak,
      date: formatDateLabel(new Date()),
      daily: state.dailyActive
    };
    leaderboard = [entry, ...leaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    saveLeaderboard();
    renderLeaderboard();
  }

  function renderKeybinds() {
    if (!keybindsEl) {
      return;
    }
    const binds = [
      { label: 'Move', keys: 'Arrows / WASD' },
      { label: 'Start', keys: 'Start button / Tap' },
      { label: 'Pause', keys: 'Space' },
      { label: 'Reset', keys: 'R' },
      { label: 'Share', keys: 'Share button' }
    ];
    keybindsEl.innerHTML = binds
      .map(
        bind => `
        <div class="keybind">
          <span class="keybind__label">${bind.label}</span>
          <span class="keybind__keys">${bind.keys}</span>
        </div>
      `
      )
      .join('');
  }

  function resizeCanvas() {
    const wrap = board.parentElement;
    let available = 440;
    if (wrap) {
      const styles = getComputedStyle(wrap);
      const padding =
        Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      available = wrap.clientWidth - (Number.isFinite(padding) ? padding : 0);
    }
    const size = Math.max(240, Math.min(560, available));
    const cellSize = Math.floor(size / gridSize);
    const boardSize = cellSize * gridSize;
    const dpr = window.devicePixelRatio || 1;

    board.width = boardSize * dpr;
    board.height = boardSize * dpr;
    board.style.width = `${boardSize}px`;
    board.style.height = `${boardSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    state.cellSize = cellSize;
    state.boardSize = boardSize;

    draw();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatSeconds(ms) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function updateStreakMeter(now) {
    if (!streakMeterFill || !streakMeterMeta) {
      return;
    }
    if (state.streak <= 0) {
      streakMeterFill.style.width = '0%';
      streakMeterMeta.textContent = 'No streak yet';
      return;
    }
    const effectiveNow =
      state.status === 'paused' && state.pauseStartedAt ? state.pauseStartedAt : now;
    const remaining = Math.max(0, state.streakExpiresAt - effectiveNow);
    const ratio = settings.streakWindow ? remaining / settings.streakWindow : 0;
    const percent = clamp(ratio, 0, 1) * 100;
    streakMeterFill.style.width = `${percent.toFixed(1)}%`;
    if (state.status === 'paused') {
      streakMeterMeta.textContent = `x${state.streak} | Paused`;
      return;
    }
    streakMeterMeta.textContent = `x${state.streak} | ${formatSeconds(remaining)} left`;
  }

  function updateBoostMeter(now) {
    if (!boostMeterFill || !boostMeterMeta) {
      return;
    }
    const effectiveNow =
      state.status === 'paused' && state.pauseStartedAt ? state.pauseStartedAt : now;
    const remaining = Math.max(0, state.boostUntil - effectiveNow);
    if (remaining <= 0) {
      boostMeterFill.style.width = '0%';
      boostMeterMeta.textContent = 'No boost active';
      return;
    }
    const ratio = settings.boostDuration ? remaining / settings.boostDuration : 0;
    const percent = clamp(ratio, 0, 1) * 100;
    boostMeterFill.style.width = `${percent.toFixed(1)}%`;
    if (state.status === 'paused') {
      boostMeterMeta.textContent = `Boost +${settings.boostSpeed} | Paused`;
      return;
    }
    boostMeterMeta.textContent = `Boost +${settings.boostSpeed} | ${formatSeconds(remaining)} left`;
  }

  function updateMeters(now = performance.now()) {
    updateStreakMeter(now);
    updateBoostMeter(now);
  }

  function updateScoreboard() {
    if (scoreEl) {
      scoreEl.textContent = String(state.score);
    }
    if (bestEl) {
      bestEl.textContent = String(state.best);
    }
    if (lengthEl) {
      lengthEl.textContent = String(state.snake.length || 0);
    }
    if (speedValueEl) {
      speedValueEl.textContent = `${state.speed.toFixed(1)}x`;
    }
    if (fruitsEl) {
      fruitsEl.textContent = String(state.fruits);
    }
    if (streakEl) {
      streakEl.textContent = String(state.streak);
    }
    if (bonusInEl) {
      if (state.bonus) {
        bonusInEl.textContent = 'Live';
      } else {
        const remaining = Math.max(0, state.nextBonusAt - state.fruits);
        bonusInEl.textContent = String(remaining);
      }
    }
    if (blocksCountEl) {
      const count = state.blocks.length || settings.blockCount || 0;
      blocksCountEl.textContent = String(count);
    }
    if (blocksCountEl && state.status !== 'running' && state.status !== 'paused') {
      blocksCountEl.textContent = String(settings.blockCount || 0);
    }
    updateDailyProgress();
    updateMeters();
  }

  function updateControls() {
    if (!startBtn) {
      return;
    }
    if (state.status === 'running') {
      startBtn.textContent = 'Pause';
    } else if (state.status === 'paused') {
      startBtn.textContent = 'Resume';
    } else {
      startBtn.textContent = 'Start';
    }
    startBtn.setAttribute('aria-pressed', state.status === 'running' ? 'true' : 'false');
    updateAutoButton();
  }

  function updateAutoButton() {
    if (!autoBtn) {
      return;
    }
    autoBtn.textContent = state.autoplay ? 'Auto: On' : 'Auto: Off';
    autoBtn.setAttribute('aria-pressed', state.autoplay ? 'true' : 'false');
    autoBtn.classList.toggle('is-active', state.autoplay);
  }

  function showToast(message, tone) {
    if (!toast || !message) {
      return;
    }
    toast.textContent = message;
    toast.dataset.tone = tone || '';
    toast.classList.add('is-show');
    if (state.toastTimer) {
      window.clearTimeout(state.toastTimer);
    }
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-show');
    }, 900);
  }

  function getShareUrl() {
    if (typeof window === 'undefined' || !window.location) {
      return '';
    }
    const { origin, pathname, href } = window.location;
    if (origin && origin !== 'null' && pathname) {
      return `${origin}${pathname}`;
    }
    return href || '';
  }

  async function handleShareClick() {
    const url = getShareUrl();

    if (navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Snake Sprint',
          text: 'Play Snake Sprint',
          url
        });
        showToast('Shared!', '');
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Copied link', '');
        return;
      } catch (error) {
        // Fall through to manual copy.
      }
    }

    window.prompt('Copy the game link:', url);
  }


  function setStatus(status, title, hint) {
    state.status = status;
    if (gameShell) {
      gameShell.dataset.status = status;
    }
    if (statusTitle) {
      statusTitle.textContent = title;
    }
    if (statusHint) {
      statusHint.textContent = hint || '';
    }
    if (boardStatus) {
      const labelMap = {
        ready: 'Ready',
        running: 'Running',
        paused: 'Paused',
        over: 'Crashed'
      };
      boardStatus.textContent = labelMap[status] || 'Ready';
    }
    setModePill();
    updateControls();
  }

  function setReady() {
    setStatus('ready', 'Press Start to begin', 'Use arrow keys, WASD, swipe, or the pad.');
  }

  function applyPauseOffset(offset) {
    if (!Number.isFinite(offset) || offset <= 0) {
      return;
    }
    if (state.streakExpiresAt) {
      state.streakExpiresAt += offset;
    }
    if (state.boostUntil) {
      state.boostUntil += offset;
    }
    if (state.bonus && state.bonus.expiresAt) {
      state.bonus.expiresAt += offset;
    }
    if (state.poison && state.poison.expiresAt) {
      state.poison.expiresAt += offset;
    }
  }

  function setRunning() {
    if (state.status === 'paused' && state.pauseStartedAt) {
      applyPauseOffset(performance.now() - state.pauseStartedAt);
      state.pauseStartedAt = 0;
    }
    setStatus('running', 'Stay sharp', 'Chain streaks and grab the bonus drop.');
  }

  function setPaused() {
    if (state.status === 'paused') {
      return;
    }
    state.pauseStartedAt = performance.now();
    setStatus('paused', 'Paused', 'Press Space or Resume to continue.');
  }

  function setOver(message) {
    setStatus('over', message || 'Crashed', 'Press Start or R to try again.');
    if (boardWrap) {
      boardWrap.classList.add('is-hit');
      window.setTimeout(() => boardWrap.classList.remove('is-hit'), 380);
    }
  }

  function vibrateCrash() {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }
    try {
      navigator.vibrate([200]);
    } catch (error) {
      // Ignore vibration failures (e.g. unsupported browsers).
    }
  }

  function loadBest() {
    try {
      const value = Number.parseInt(localStorage.getItem(storageKey), 10);
      if (Number.isFinite(value)) {
        state.best = value;
      }
    } catch (error) {
      state.best = 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(storageKey, String(state.best));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function computeSpeed(now) {
    const ramp = Math.min(6, Math.floor(state.fruits / 3));
    const boost = now < state.boostUntil ? settings.boostSpeed : 0;
    return state.baseSpeed + ramp + boost;
  }

  function createSnake() {
    const mid = Math.floor(gridSize / 2);
    return [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid }
    ];
  }

  function placeBlocks() {
    const blocks = [];
    if (settings.blockCount <= 0) {
      return blocks;
    }
    const blocked = new Set(state.snake.map(segment => `${segment.x},${segment.y}`));
    for (let i = 0; i < settings.blockCount; i += 1) {
      const spot = pickEmptyCell(blocked);
      if (!spot) {
        break;
      }
      blocks.push(spot);
      blocked.add(`${spot.x},${spot.y}`);
    }
    return blocks;
  }

  function pickEmptyCell(blocked) {
    const empties = [];
    for (let y = 0; y < gridSize; y += 1) {
      for (let x = 0; x < gridSize; x += 1) {
        if (!blocked.has(`${x},${y}`)) {
          empties.push({ x, y });
        }
      }
    }
    if (!empties.length) {
      return null;
    }
    return empties[Math.floor(Math.random() * empties.length)];
  }

  function placeFood() {
    const blocked = new Set();
    state.snake.forEach((segment, index) => {
      if (index === 0) {
        return;
      }
      blocked.add(`${segment.x},${segment.y}`);
    });
    if (state.bonus) {
      blocked.add(`${state.bonus.x},${state.bonus.y}`);
    }
    if (state.poison) {
      blocked.add(`${state.poison.x},${state.poison.y}`);
    }
    if (state.blocks.length) {
      state.blocks.forEach(block => blocked.add(`${block.x},${block.y}`));
    }
    if (state.blocks.length) {
      state.blocks.forEach(block => blocked.add(`${block.x},${block.y}`));
    }
    if (state.enemies.length) {
      state.enemies.forEach(enemy => blocked.add(`${enemy.x},${enemy.y}`));
    }
    if (state.blocks.length) {
      state.blocks.forEach(block => blocked.add(`${block.x},${block.y}`));
    }
    return pickEmptyCell(blocked);
  }

  function spawnBonus(now) {
    const blocked = new Set(state.snake.map(segment => `${segment.x},${segment.y}`));
    if (state.food) {
      blocked.add(`${state.food.x},${state.food.y}`);
    }
    if (state.poison) {
      blocked.add(`${state.poison.x},${state.poison.y}`);
    }
    if (state.enemies.length) {
      state.enemies.forEach(enemy => blocked.add(`${enemy.x},${enemy.y}`));
    }
    if (state.blocks.length) {
      state.blocks.forEach(block => blocked.add(`${block.x},${block.y}`));
    }
    const spot = pickEmptyCell(blocked);
    if (!spot) {
      return;
    }
    state.bonus = {
      x: spot.x,
      y: spot.y,
      expiresAt: now + settings.bonusDuration
    };
    showToast('Bonus drop!', 'bonus');
  }

  function spawnPoison(now) {
    const blocked = new Set(state.snake.map(segment => `${segment.x},${segment.y}`));
    if (state.food) {
      blocked.add(`${state.food.x},${state.food.y}`);
    }
    if (state.bonus) {
      blocked.add(`${state.bonus.x},${state.bonus.y}`);
    }
    if (state.enemies.length) {
      state.enemies.forEach(enemy => blocked.add(`${enemy.x},${enemy.y}`));
    }
    if (state.blocks.length) {
      state.blocks.forEach(block => blocked.add(`${block.x},${block.y}`));
    }
    const spot = pickEmptyCell(blocked);
    if (!spot) {
      return;
    }
    state.poison = {
      x: spot.x,
      y: spot.y,
      expiresAt: now + settings.poisonDuration
    };
    showToast('Poison fruit!', 'poison');
  }

  function placeEnemies() {
    state.enemies = [];
    state.enemyStep = 0;
    if (settings.enemyCount <= 0) {
      return;
    }

    const blocked = new Set(state.snake.map(segment => `${segment.x},${segment.y}`));
    if (state.food) {
      blocked.add(`${state.food.x},${state.food.y}`);
    }
    if (state.bonus) {
      blocked.add(`${state.bonus.x},${state.bonus.y}`);
    }
    if (state.poison) {
      blocked.add(`${state.poison.x},${state.poison.y}`);
    }

    for (let i = 0; i < settings.enemyCount; i += 1) {
      const spot = pickEmptyCell(blocked);
      if (!spot) {
        break;
      }
      state.enemies.push({
        x: spot.x,
        y: spot.y,
        dir: randomDirection()
      });
      blocked.add(`${spot.x},${spot.y}`);
    }
  }

  function resetState() {
    state.score = 0;
    state.fruits = 0;
    state.streak = 0;
    state.maxStreak = 0;
    state.streakExpiresAt = 0;
    state.nextBonusAt = settings.bonusEvery;
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.snake = createSnake();
    state.blocks = placeBlocks();
    state.enemies = [];
    state.enemyStep = 0;
    state.food = placeFood();
    state.bonus = null;
    state.poison = null;
    state.dailyReached = false;
    state.lastRunDailyReached = false;
    state.poisonEaten = 0;
    placeEnemies();
    state.growth = 0;
    state.boostUntil = 0;
    state.boostActive = false;
    state.pauseStartedAt = 0;
    state.speed = computeSpeed(performance.now());
    state.accumulator = 0;
    if (boardWrap) {
      boardWrap.classList.remove('is-boost');
      boardWrap.classList.remove('is-hit');
    }
    if (toast) {
      toast.classList.remove('is-show');
      toast.textContent = '';
      toast.dataset.tone = '';
    }
    updateScoreboard();
    draw();
  }

  function newGame() {
    resetState();
    setRunning();
    state.lastTime = performance.now();
  }

  function queueDirection(next) {
    if (!next) {
      return;
    }

    if (state.snake.length > 1) {
      const { x, y } = state.direction;
      if (next.x === -x && next.y === -y) {
        return;
      }
    }

    state.nextDirection = { x: next.x, y: next.y };
  }

  function updateStreak(now) {
    if (state.streak > 0 && now > state.streakExpiresAt) {
      state.streak = 0;
      updateScoreboard();
    }
  }

  function applyStreak(now) {
    if (now <= state.streakExpiresAt) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.streakExpiresAt = now + settings.streakWindow;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    return state.streak;
  }

  function handleFoodEat(now) {
    state.fruits += 1;
    playTone(420, 120, 'triangle', 0.22);
    const streak = applyStreak(now);
    const points = settings.basePoints + (streak - 1) * settings.streakBonus;
    state.score += points;

    if (streak > 1) {
      showToast(`Streak x${streak} +${points}`, 'streak');
    } else {
      showToast(`+${points}`);
    }

    if (state.fruits >= state.nextBonusAt) {
      state.nextBonusAt += settings.bonusEvery;
      spawnBonus(now);
    }

    if (!state.poison && Math.random() < settings.poisonChance) {
      spawnPoison(now);
    }

    checkDailyTarget();
    state.speed = computeSpeed(now);
    updateScoreboard();
    checkAchievements();
  }

  function handleBonusEat(now) {
    playTone(660, 180, 'square', 0.2);
    state.score += settings.bonusPoints;
    state.boostUntil = now + settings.boostDuration;
    state.streakExpiresAt = now + settings.streakWindow;
    showToast(`Bonus +${settings.bonusPoints}!`, 'bonus');
    state.speed = computeSpeed(now);
    updateScoreboard();
    checkAchievements();
  }

  function handlePoisonEat() {
    playTone(220, 220, 'sawtooth', 0.2);
    state.score = Math.max(0, state.score - settings.poisonPoints);
    state.streak = 0;
    state.streakExpiresAt = 0;
    state.poisonEaten += 1;
    showToast(`Poison -${settings.poisonPoints}`, 'poison');
  }

  function moveEnemies() {
    if (!state.enemies.length || state.status !== 'running') {
      return;
    }

    state.enemyStep += 1;
    if (state.enemyStep % settings.enemyMoveEvery !== 0) {
      return;
    }

    const blocked = new Set(state.snake.map(segment => `${segment.x},${segment.y}`));
    if (state.food) {
      blocked.add(`${state.food.x},${state.food.y}`);
    }
    if (state.bonus) {
      blocked.add(`${state.bonus.x},${state.bonus.y}`);
    }
    if (state.poison) {
      blocked.add(`${state.poison.x},${state.poison.y}`);
    }

    const occupied = new Set(state.enemies.map(enemy => `${enemy.x},${enemy.y}`));

    for (const enemy of state.enemies) {
      const currentKey = `${enemy.x},${enemy.y}`;
      occupied.delete(currentKey);

      const candidates = getDirectionOptions(enemy.dir);
      let moved = false;

      for (const dir of candidates) {
        const nextCell = getNextCell(enemy.x, enemy.y, dir);
        if (!nextCell.valid) {
          continue;
        }
        const key = `${nextCell.x},${nextCell.y}`;
        if (blocked.has(key) || occupied.has(key)) {
          continue;
        }
        enemy.x = nextCell.x;
        enemy.y = nextCell.y;
        enemy.dir = dir;
        moved = true;
        break;
      }

      const nextKey = `${enemy.x},${enemy.y}`;
      occupied.add(nextKey);

      if (enemy.x === state.snake[0].x && enemy.y === state.snake[0].y) {
        endGame('Caught by an enemy');
        return;
      }

      if (!moved) {
        enemy.dir = randomDirection();
      }
    }
  }

  function endGame(message) {
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      showToast('New best!', 'streak');
    }
    playTone(140, 320, 'triangle', 0.22);
    if (state.dailyActive) {
      if (state.fruits > state.dailyBest) {
        state.dailyBest = state.fruits;
        saveDailyBest(state.dailyDateKey, state.dailyBest);
      }
      updateDailyUI();
    }
    updateScoreboard();
    vibrateCrash();
    setOver(message);
    recordRun();
    awardShards();
    renderUpgrades();
    checkAchievements();
  }

  function advance(now) {
    state.direction = { x: state.nextDirection.x, y: state.nextDirection.y };
    const head = state.snake[0];
    const next = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y
    };

    if (settings.wrapWalls) {
      if (next.x < 0) {
        next.x = gridSize - 1;
      } else if (next.x >= gridSize) {
        next.x = 0;
      }

      if (next.y < 0) {
        next.y = gridSize - 1;
      } else if (next.y >= gridSize) {
        next.y = 0;
      }
    } else if (
      next.x < 0 ||
      next.x >= gridSize ||
      next.y < 0 ||
      next.y >= gridSize
    ) {
      endGame('Crashed into the wall');
      return;
    }

    const willEatFood = state.food && next.x === state.food.x && next.y === state.food.y;
    const willEatBonus = state.bonus && next.x === state.bonus.x && next.y === state.bonus.y;
    const willEatPoison = state.poison && next.x === state.poison.x && next.y === state.poison.y;
    const limit = willEatFood || willEatBonus ? state.snake.length : state.snake.length - 1;

    if (state.enemies.length) {
      const willHitEnemy = state.enemies.some(
        enemy => enemy.x === next.x && enemy.y === next.y
      );
      if (willHitEnemy) {
        endGame('Crashed into an enemy');
        return;
      }
    }
    if (state.blocks.length) {
      const willHitBlock = state.blocks.some(
        block => block.x === next.x && block.y === next.y
      );
      if (willHitBlock) {
        endGame('Crashed into a block');
        return;
      }
    }

    for (let i = 0; i < limit; i += 1) {
      const segment = state.snake[i];
      if (segment.x === next.x && segment.y === next.y) {
        endGame('Crashed into the tail');
        return;
      }
    }

    state.snake.unshift(next);

    let growthAdd = 0;

    if (willEatFood) {
      growthAdd += 1;
      handleFoodEat(now);
      state.food = placeFood();
      if (!state.food) {
        endGame('You filled the board');
        return;
      }
    }

    if (willEatBonus) {
      growthAdd += settings.bonusGrowth;
      handleBonusEat(now);
      state.bonus = null;
    }

    let poisonShrink = 0;
    if (willEatPoison) {
      handlePoisonEat();
      state.poison = null;
      poisonShrink = settings.poisonShrink;
    }

    state.growth += growthAdd;
    if (state.growth > 0) {
      state.growth -= 1;
    } else {
      state.snake.pop();
    }

    if (poisonShrink > 0) {
      let remaining = poisonShrink;
      while (remaining > 0 && state.snake.length > settings.minLength) {
        state.snake.pop();
        remaining -= 1;
      }
      updateScoreboard();
    }

    moveEnemies();
    if (state.status !== 'running') {
      return;
    }

    if (state.bonus && now > state.bonus.expiresAt) {
      state.bonus = null;
    }

    if (state.poison && now > state.poison.expiresAt) {
      state.poison = null;
    }
  }

  function handleStartClick() {
    unlockAudio();
    playTone(300, 90, 'square', 0.14);
    if (state.status === 'running') {
      setPaused();
      return;
    }
    if (state.status === 'paused') {
      state.lastTime = performance.now();
      setRunning();
      return;
    }
    newGame();
  }

  function toggleAutoplay() {
    state.autoplay = !state.autoplay;
    updateAutoButton();
    showToast(state.autoplay ? 'Autoplay on' : 'Autoplay off', '');
    if (state.autoplay && (state.status === 'ready' || state.status === 'over')) {
      newGame();
    }
  }

  function handleResetClick() {
    state.dailyActive = false;
    setModePill();
    resetState();
    setReady();
  }

  function drawGrid() {
    if (state.cellSize < 14) {
      return;
    }
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < gridSize; i += 1) {
      const pos = i * state.cellSize;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, state.boardSize);
      ctx.moveTo(0, pos);
      ctx.lineTo(state.boardSize, pos);
    }
    ctx.stroke();
  }

  function drawBlocks() {
    if (!state.blocks.length) {
      return;
    }
    const size = state.cellSize;
    ctx.save();
    ctx.fillStyle = colors.block;
    ctx.shadowColor = colors.blockGlow;
    ctx.shadowBlur = size * 0.4;
    state.blocks.forEach(block => {
      const x = block.x * size + 2;
      const y = block.y * size + 2;
      const cell = size - 4;
      fillRoundedRect(x, y, cell, Math.max(3, size * 0.2));
    });
    ctx.restore();
  }

  function fillRoundedRect(x, y, size, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
      return;
    }
    ctx.fillRect(x, y, size, size);
  }

  function drawFood() {
    if (!state.food) {
      return;
    }
    const size = state.cellSize;
    const cx = state.food.x * size + size / 2;
    const cy = state.food.y * size + size / 2;
    const radius = size * 0.38;

    ctx.save();
    ctx.fillStyle = colors.food;
    ctx.shadowColor = colors.foodGlow;
    ctx.shadowBlur = size * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBonus() {
    if (!state.bonus) {
      return;
    }
    const size = state.cellSize;
    const cx = state.bonus.x * size + size / 2;
    const cy = state.bonus.y * size + size / 2;
    const pulse = 0.05 * Math.sin(performance.now() / 180);
    const radius = size * (0.32 + pulse);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = colors.bonus;
    ctx.shadowColor = colors.bonusGlow;
    ctx.shadowBlur = size * 0.9;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function drawPoison() {
    if (!state.poison) {
      return;
    }
    const size = state.cellSize;
    const cx = state.poison.x * size + size / 2;
    const cy = state.poison.y * size + size / 2;
    const radius = size * 0.34;

    ctx.save();
    ctx.fillStyle = colors.poison;
    ctx.shadowColor = colors.poisonGlow;
    ctx.shadowBlur = size * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(17, 24, 39, 0.75)';
    ctx.lineWidth = Math.max(1, size * 0.08);
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.6, cy - radius * 0.6);
    ctx.lineTo(cx + radius * 0.6, cy + radius * 0.6);
    ctx.moveTo(cx + radius * 0.6, cy - radius * 0.6);
    ctx.lineTo(cx - radius * 0.6, cy + radius * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemies() {
    if (!state.enemies.length) {
      return;
    }
    const size = state.cellSize;

    state.enemies.forEach(enemy => {
      const cx = enemy.x * size + size / 2;
      const cy = enemy.y * size + size / 2;
      const radius = size * 0.34;

      ctx.save();
      ctx.fillStyle = colors.enemy;
      ctx.shadowColor = colors.enemyGlow;
      ctx.shadowBlur = size * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(17, 24, 39, 0.75)';
      ctx.lineWidth = Math.max(1, size * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.7, cy);
      ctx.lineTo(cx + radius * 0.7, cy);
      ctx.moveTo(cx, cy - radius * 0.7);
      ctx.lineTo(cx, cy + radius * 0.7);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawEyes(head, size) {
    const cx = head.x * size + size / 2;
    const cy = head.y * size + size / 2;
    const offset = size * 0.18;
    const spread = size * 0.22;

    let eye1 = { x: cx - spread, y: cy - spread };
    let eye2 = { x: cx + spread, y: cy - spread };

    if (state.direction.x === 1) {
      eye1 = { x: cx + offset, y: cy - spread };
      eye2 = { x: cx + offset, y: cy + spread };
    } else if (state.direction.x === -1) {
      eye1 = { x: cx - offset, y: cy - spread };
      eye2 = { x: cx - offset, y: cy + spread };
    } else if (state.direction.y === 1) {
      eye1 = { x: cx - spread, y: cy + offset };
      eye2 = { x: cx + spread, y: cy + offset };
    } else if (state.direction.y === -1) {
      eye1 = { x: cx - spread, y: cy - offset };
      eye2 = { x: cx + spread, y: cy - offset };
    }

    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(eye1.x, eye1.y, size * 0.08, 0, Math.PI * 2);
    ctx.arc(eye2.x, eye2.y, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSnake() {
    const size = state.cellSize;
    state.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * size + 1;
      const y = segment.y * size + 1;
      const cell = size - 2;
      const radius = Math.max(4, size * 0.25);

      ctx.save();
      ctx.fillStyle = isHead ? colors.head : colors.snake;
      if (!isHead) {
        ctx.shadowColor = colors.snakeGlow;
        ctx.shadowBlur = size * 0.45;
      }
      fillRoundedRect(x, y, cell, radius);
      ctx.restore();

      if (isHead) {
        drawEyes(segment, size);
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, state.boardSize, state.boardSize);
    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, state.boardSize, state.boardSize);
    drawGrid();
    drawBlocks();
    drawFood();
    drawPoison();
    drawBonus();
    drawEnemies();
    drawSnake();
  }

  function loop(timestamp) {
    if (!state.lastTime) {
      state.lastTime = timestamp;
    }
    const delta = timestamp - state.lastTime;
    state.lastTime = timestamp;

    if (state.status === 'running') {
      updateStreak(timestamp);
      const nextSpeed = computeSpeed(timestamp);
      if (nextSpeed !== state.speed) {
        state.speed = nextSpeed;
        updateScoreboard();
      }
      const boostActive = timestamp < state.boostUntil;
      if (boostActive !== state.boostActive) {
        state.boostActive = boostActive;
        if (boardWrap) {
          boardWrap.classList.toggle('is-boost', boostActive);
        }
      }

      state.accumulator += delta;
      const step = 1000 / state.speed;
      while (state.accumulator >= step) {
        if (state.autoplay) {
          const autoDir = computeAutoplayDirection();
          if (autoDir) {
            queueDirection(autoDir);
          }
        }
        state.accumulator -= step;
        advance(timestamp);
        if (state.status !== 'running') {
          break;
        }
      }
    }

    updateMeters(timestamp);
    draw();
    requestAnimationFrame(loop);
  }

  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    unlockAudio();

    if (key === ' ' || event.code === 'Space') {
      event.preventDefault();
      if (state.status === 'running') {
        setPaused();
      } else if (state.status === 'paused') {
        state.lastTime = performance.now();
        setRunning();
      }
      return;
    }

    if (key === 'r') {
      event.preventDefault();
      handleResetClick();
      return;
    }

    if (state.autoplay) {
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright' ||
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd'
      ) {
        event.preventDefault();
        return;
      }
    }

    let next = null;
    if (key === 'arrowup' || key === 'w') {
      next = directionMap.up;
    } else if (key === 'arrowdown' || key === 's') {
      next = directionMap.down;
    } else if (key === 'arrowleft' || key === 'a') {
      next = directionMap.left;
    } else if (key === 'arrowright' || key === 'd') {
      next = directionMap.right;
    }

    if (next) {
      event.preventDefault();
      if (state.status === 'ready') {
        newGame();
      }
      queueDirection(next);
    }
  }

  function handlePad(directionKey) {
    unlockAudio();
    if (state.autoplay) {
      return;
    }
    const next = directionMap[directionKey];
    if (!next) {
      return;
    }
    if (state.status === 'ready') {
      newGame();
    }
    queueDirection(next);
  }

  function getSwipeThreshold() {
    return Math.max(18, state.cellSize * 0.45);
  }

  function handleTouchStart(event) {
    if (!event.touches || !event.touches.length) {
      return;
    }
    unlockAudio();
    const touch = event.touches[0];
    touchState.active = true;
    touchState.moved = false;
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
  }

  function handleTouchMove(event) {
    if (!touchState.active || !event.touches || !event.touches.length) {
      return;
    }

    const touch = event.touches[0];
    const dx = touch.clientX - touchState.startX;
    const dy = touch.clientY - touchState.startY;
    const threshold = getSwipeThreshold();

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return;
    }

    event.preventDefault();
    touchState.moved = true;

    if (Math.abs(dx) > Math.abs(dy)) {
      handlePad(dx > 0 ? 'right' : 'left');
    } else {
      handlePad(dy > 0 ? 'down' : 'up');
    }

    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
  }

  function handleTouchEnd() {
    if (touchState.active && !touchState.moved) {
      tapState.lastTouchTime = Date.now();
      handleStartClick();
    }
    touchState.active = false;
    touchState.moved = false;
  }

  loadPrefs();
  applyPrefsToUI();
  syncPrefsFromControls();
  savePrefs();
  applyPrefsToDocument();
  applySetupFromControls();
  applySpeedFromControl();
  loadShards();
  loadUpgrades();
  applyUpgrades();
  loadAchievements();
  loadLeaderboard();
  loadDailyInfo();
  renderKeybinds();
  renderAchievements();
  renderLeaderboard();
  updateShardsUI();
  renderUpgrades();

  if (speedSelect) {
    const preset = speedPresets[speedSelect.value] || speedPresets.cruise;
    state.baseSpeed = preset;
  }

  syncColors();
  loadBest();
  resizeCanvas();
  resetState();
  setReady();
  updateScoreboard();
  updateControls();
  requestAnimationFrame(loop);

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', handleKeydown);

  if (startBtn) {
    startBtn.addEventListener('click', handleStartClick);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetClick);
  }

  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      toggleAutoplay();
    });
  }

  if (speedSelect) {
    speedSelect.addEventListener('change', () => {
      const preset = speedPresets[speedSelect.value] || speedPresets.cruise;
      state.baseSpeed = preset;
      state.speed = computeSpeed(performance.now());
      updateScoreboard();
      syncPrefsFromControls();
      savePrefs();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      syncPrefsFromControls();
      savePrefs();
      applyPrefsToDocument();
    });
  }

  if (colorblindToggle) {
    colorblindToggle.addEventListener('change', () => {
      syncPrefsFromControls();
      savePrefs();
      applyPrefsToDocument();
    });
  }

  if (sfxToggle) {
    sfxToggle.addEventListener('change', () => {
      syncPrefsFromControls();
      savePrefs();
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      syncPrefsFromControls();
      savePrefs();
      unlockAudio();
      updateMusic();
    });
  }

  if (wrapToggle) {
    wrapToggle.addEventListener('change', handleSetupChange);
  }

  if (enemiesSelect) {
    enemiesSelect.addEventListener('change', handleSetupChange);
  }

  if (poisonSelect) {
    poisonSelect.addEventListener('change', handleSetupChange);
  }

  if (blocksSelect) {
    blocksSelect.addEventListener('change', handleSetupChange);
  }

  if (dailyBtn) {
    dailyBtn.addEventListener('click', () => {
      startDailyRun();
    });
  }

  if (upgradesEl) {
    upgradesEl.addEventListener('click', event => {
      const button = event.target.closest('[data-upgrade]');
      if (!button) {
        return;
      }
      handleUpgradePurchase(button.dataset.upgrade);
    });
  }

  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      handleShareClick();
    });
  });

  padButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (Date.now() - tapState.lastTouchTime < 500) {
        return;
      }
      const directionKey = button.dataset.dir;
      handlePad(directionKey);
    });
    button.addEventListener(
      'touchstart',
      event => {
        event.preventDefault();
        tapState.lastTouchTime = Date.now();
        const directionKey = button.dataset.dir;
        handlePad(directionKey);
      },
      { passive: false }
    );
  });

  if (boardWrap) {
    boardWrap.addEventListener('touchstart', handleTouchStart, { passive: true });
    boardWrap.addEventListener('touchmove', handleTouchMove, { passive: false });
    boardWrap.addEventListener('touchend', handleTouchEnd);
    boardWrap.addEventListener('touchcancel', handleTouchEnd);
    boardWrap.addEventListener('click', event => {
      if (Date.now() - tapState.lastTouchTime < 500) {
        event.preventDefault();
        return;
      }
      handleStartClick();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.status === 'running') {
      setPaused();
    }
  });
})();
