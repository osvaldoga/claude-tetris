'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const POWER_UP_INTERVAL = 5;

const COLORS = [
  null,
  '#4dd0e1', // 1 I - cyan
  '#ffd54f', // 2 O - yellow
  '#ba68c8', // 3 T - purple
  '#81c784', // 4 S - green
  '#e57373', // 5 Z - red
  '#90caf9', // 6 J - pale blue
  '#ffb74d', // 7 L - orange
  '#90a4ae', // 8 Tuerca - metallic blue-grey
  '#ff5722', // 9 Bomba
  '#ffeb3b', // 10 Rayo
  '#e040fb', // 11 Tinte
  '#66bb6a', // 12 Gravedad
  '#80deea', // 13 Congelar
  '#ffffff',  // 14 Wildcard (rainbow)
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // Tuerca
  [[0,9,0],[9,9,9],[0,9,0]],                  // Bomba - plus
  [[10,0,10],[0,10,0],[10,0,10]],             // Rayo - X
  [[11,11],[11,11]],                           // Tinte - square
  [[12],[12],[12],[12]],                       // Gravedad - tall bar
  [[13,13,13]],                                // Congelar - short bar
];

const POWER_NAMES = {9:'BOMBA', 10:'RAYO', 11:'TINTE', 12:'GRAVEDAD', 13:'CONGELAR'};
const POWER_DESC  = {
  9: 'Destruye area 3x3',
  10: 'Limpia fila+columna',
  11: 'Convierte color a comodin',
  12: 'Compacta el tablero',
  13: 'Pausa caida 5s',
};

const LINE_SCORES = [0, 100, 300, 500, 800];

const SKIN_RETRO_COLORS = [
  null,
  '#4dd0e1','#ffd54f','#ba68c8','#81c784','#e57373','#90caf9','#ffb74d',
  '#90a4ae','#ff5722','#ffeb3b','#e040fb','#66bb6a','#80deea','#ffffff',
];

const SKIN_NEON_COLORS = [
  null,
  '#00fff5','#ffe600','#bf00ff','#00ff87','#ff003c','#00b4ff','#ff8800',
  '#aaaaff','#ff4400','#ffee00','#dd00ff','#00ee55','#00ddee','#ffffff',
];

const SKIN_PASTEL_COLORS = [
  null,
  '#b2ebf2','#fff9c4','#e1bee7','#c8e6c9','#ffcdd2','#bbdefb','#ffe0b2',
  '#cfd8dc','#ffab91','#fff59d','#f48fb1','#a5d6a7','#b2dfdb','#f5f5f5',
];

const SKIN_PIXEL_COLORS = [
  null,
  '#26c6da','#ffca28','#ab47bc','#66bb6a','#ef5350','#42a5f5','#ffa726',
  '#78909c','#f4511e','#fdd835','#ce93d8','#43a047','#4dd0e1','#eeeeee',
];

const SKINS = {
  retro: {
    id: 'retro',
    label: 'RETRO',
    colors: SKIN_RETRO_COLORS,
    drawBlock(ctx, x, y, colorIdx, size, alpha) {
      if (!colorIdx) return;
      let color;
      if (colorIdx === 14) {
        const hue = (performance.now() / 15 + x * 37 + y * 23) % 360;
        color = `hsl(${hue}, 100%, 65%)`;
      } else {
        color = this.colors[colorIdx];
      }
      ctx.globalAlpha = alpha ?? 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      ctx.globalAlpha = 1;
    }
  },
  neon: {
    id: 'neon',
    label: 'NEON',
    colors: SKIN_NEON_COLORS,
    drawBlock(ctx, x, y, colorIdx, size, alpha) {
      if (!colorIdx) return;
      let color;
      if (colorIdx === 14) {
        const hue = (performance.now() / 15 + x * 37 + y * 23) % 360;
        color = `hsl(${hue}, 100%, 65%)`;
      } else {
        color = this.colors[colorIdx];
      }
      ctx.globalAlpha = alpha ?? 1;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x * size + 2, y * size + 2, size - 4, 3);
      ctx.globalAlpha = 1;
    }
  },
  pastel: {
    id: 'pastel',
    label: 'PASTEL',
    colors: SKIN_PASTEL_COLORS,
    drawBlock(ctx, x, y, colorIdx, size, alpha) {
      if (!colorIdx) return;
      let color;
      if (colorIdx === 14) {
        const hue = (performance.now() / 15 + x * 37 + y * 23) % 360;
        color = `hsl(${hue}, 70%, 80%)`;
      } else {
        color = this.colors[colorIdx];
      }
      ctx.globalAlpha = alpha ?? 1;
      const r = 4;
      const bx = x * size + 2, by = y * size + 2, bw = size - 4, bh = size - 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bw, bh, r);
      } else {
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
        ctx.lineTo(bx + r, by + bh);
        ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
        ctx.lineTo(bx, by + r);
        ctx.arcTo(bx, by, bx + r, by, r);
        ctx.closePath();
      }
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bw, 4, [r, r, 0, 0]);
      } else {
        ctx.rect(bx, by, bw, 4);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },
  pixel: {
    id: 'pixel',
    label: 'PIXEL',
    colors: SKIN_PIXEL_COLORS,
    drawBlock(ctx, x, y, colorIdx, size, alpha) {
      if (!colorIdx) return;
      let color;
      if (colorIdx === 14) {
        const hue = (performance.now() / 15 + x * 37 + y * 23) % 360;
        color = `hsl(${hue}, 100%, 55%)`;
      } else {
        color = this.colors[colorIdx];
      }
      ctx.globalAlpha = alpha ?? 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // pixel dot texture: 2x2 dots every 4px
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let dy = 2; dy < size - 2; dy += 4) {
        for (let dx = 2; dx < size - 2; dx += 4) {
          ctx.fillRect(x * size + dx, y * size + dy, 2, 2);
        }
      }
      // bright top-left pixel border
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, 2);
      ctx.fillRect(x * size + 1, y * size + 1, 2, size - 2);
      ctx.globalAlpha = 1;
    }
  }
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const powerCountdownEl = document.getElementById('power-countdown');
const pauseBox = document.getElementById('pause-box');
const gameoverBox = document.getElementById('gameover-box');
const controlsBox = document.getElementById('controls-box');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let currentSkin;
let powerUpCountdown, nextPowerUpQueued, frozenUntil, effectMsg, effectMsgUntil, effectMsgColor;
let startLevel = 1;
let currentCombo, maxCombo, maxLines, newHsIndex;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 8) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function randomPowerUp() {
  const type = Math.floor(Math.random() * 5) + 9;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }

  // Wildcard-assisted: row with wildcard + at most 2 empty cells clears
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].some(v => v === 14) && board[r].filter(v => v === 0).length <= 2) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }

  if (cleared) {
    if (cleared > maxLines) maxLines = cleared;
    lines += cleared;
    score += (LINE_SCORES[Math.min(cleared, 4)] || 0) * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    powerUpCountdown -= cleared;
    if (powerUpCountdown <= 0) {
      powerUpCountdown = POWER_UP_INTERVAL;
      nextPowerUpQueued = true;
    }
    updateHUD();
  }
}

function activatePowerUp(type) {
  const cy = Math.min(ROWS - 1, current.y + Math.floor(current.shape.length / 2));
  const cx = Math.min(COLS - 1, Math.max(0, current.x + Math.floor(current.shape[0].length / 2)));

  switch (type) {
    case 9: { // Bomba - destroys 3x3
      for (let r = cy - 1; r <= cy + 1; r++)
        for (let c = cx - 1; c <= cx + 1; c++)
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
            board[r][c] = 0;
      showEffect('BOMBA!', COLORS[9]);
      break;
    }
    case 10: { // Rayo - clears row + column
      board[cy] = new Array(COLS).fill(0);
      for (let r = 0; r < ROWS; r++) board[r][cx] = 0;
      showEffect('RAYO!', COLORS[10]);
      break;
    }
    case 11: { // Tinte - most common color becomes wildcard
      const count = new Array(9).fill(0);
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (board[r][c] >= 1 && board[r][c] <= 8) count[board[r][c]]++;
      let best = 0;
      for (let i = 1; i <= 8; i++) if (count[i] > count[best]) best = i;
      if (best > 0)
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (board[r][c] === best) board[r][c] = 14;
      showEffect('TINTE!', COLORS[11]);
      break;
    }
    case 12: { // Gravedad - column gravity compaction
      for (let c = 0; c < COLS; c++) {
        const col = [];
        for (let r = 0; r < ROWS; r++)
          if (board[r][c] !== 0) col.push(board[r][c]);
        for (let r = ROWS - 1; r >= 0; r--)
          board[r][c] = col.length > 0 ? col.pop() : 0;
      }
      showEffect('GRAVEDAD!', COLORS[12]);
      break;
    }
    case 13: { // Congelar - freeze drop for 5s
      frozenUntil = performance.now() + 5000;
      showEffect('CONGELADO!', COLORS[13]);
      break;
    }
  }
}

function showEffect(msg, color) {
  effectMsg = msg;
  effectMsgColor = color;
  effectMsgUntil = performance.now() + 1500;
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  if (current.type >= 9) {
    activatePowerUp(current.type);
    clearLines();
    currentCombo = 0;
  } else {
    merge();
    const linesBefore = lines;
    clearLines();
    if (lines > linesBefore) {
      currentCombo++;
      if (currentCombo > maxCombo) maxCombo = currentCombo;
    } else {
      currentCombo = 0;
    }
  }
  spawn();
}

function spawn() {
  current = next;
  if (nextPowerUpQueued) {
    nextPowerUpQueued = false;
    next = randomPowerUp();
  } else {
    next = randomPiece();
  }
  if (collide(current.shape, current.x, current.y)) {
    endGame();
    return;
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
  powerCountdownEl.textContent = nextPowerUpQueued ? '!' : powerUpCountdown;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  currentSkin.drawBlock(context, x, y, colorIndex, size, alpha);
}

function drawGrid() {
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-grid').trim();
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);

  // Glow border for active power-up piece
  if (current.type >= 9) {
    ctx.strokeStyle = COLORS[current.type];
    ctx.lineWidth = 2;
    for (let r = 0; r < current.shape.length; r++)
      for (let c = 0; c < current.shape[r].length; c++)
        if (current.shape[r][c])
          ctx.strokeRect(
            (current.x + c) * BLOCK + 2,
            (current.y + r) * BLOCK + 2,
            BLOCK - 4, BLOCK - 4
          );
  }

  const now = performance.now();

  // Freeze overlay
  if (frozenUntil > 0 && now < frozenUntil) {
    ctx.fillStyle = 'rgba(128, 222, 234, 0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const remaining = Math.ceil((frozenUntil - now) / 1000);
    ctx.font = 'bold 13px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS[13];
    ctx.fillText(`CONGELADO ${remaining}s`, canvas.width / 2, 18);
    ctx.textAlign = 'left';
  }

  // Effect notification
  if (effectMsg && now < effectMsgUntil) {
    ctx.globalAlpha = Math.min(1, (effectMsgUntil - now) / 500);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, canvas.height / 2 - 34, canvas.width, 60);
    ctx.font = 'bold 30px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = effectMsgColor;
    ctx.fillText(effectMsg, canvas.width / 2, canvas.height / 2 + 10);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);

  if (next.type >= 9) {
    nextCtx.font = 'bold 9px Courier New';
    nextCtx.textAlign = 'center';
    nextCtx.fillStyle = COLORS[next.type];
    nextCtx.fillText(POWER_NAMES[next.type], nextCanvas.width / 2, nextCanvas.height - 4);
    nextCtx.textAlign = 'left';
  }
}

function loadScores() {
  try { return JSON.parse(localStorage.getItem('tetris_scores') || '[]'); } catch { return []; }
}

function saveScore(name) {
  const scores = loadScores();
  const entry = { name: name || 'AAA', score, combo: maxCombo, lines };
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  scores.splice(5);
  newHsIndex = scores.findIndex(e => e === entry);
  localStorage.setItem('tetris_scores', JSON.stringify(scores));
  return scores;
}

function renderScores(scores, highlightIdx) {
  const tbody = document.querySelector('#scores-table tbody');
  tbody.innerHTML = '';
  if (!scores.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;opacity:0.5">Sin records aún</td></tr>';
    return;
  }
  scores.forEach((e, i) => {
    const tr = document.createElement('tr');
    if (i === highlightIdx) tr.classList.add('hs-new');
    [i + 1, e.name, typeof e.score === 'number' ? e.score.toLocaleString() : '0', e.lines].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function endGame() {
  gameOver = true;
  hsSubmitted = false;
  cancelAnimationFrame(animId);
  gameoverBox.classList.remove('hidden');
  pauseBox.classList.add('hidden');
  controlsBox.classList.add('hidden');
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;

  const nameForm = document.getElementById('hs-name-form');
  const nameInput = document.getElementById('hs-name-input');
  const scoresSection = document.getElementById('scores-section');

  const existing = loadScores();
  const qualifies = existing.length < 5 || score > (existing[4]?.score ?? 0);

  if (qualifies) {
    nameForm.classList.remove('hidden');
    scoresSection.classList.add('hidden');
    nameInput.value = '';
    nameInput.focus();
  } else {
    nameForm.classList.add('hidden');
    renderScores(existing, -1);
    scoresSection.classList.remove('hidden');
  }

  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    gameoverBox.classList.add('hidden');
    pauseBox.classList.add('hidden');
    controlsBox.classList.add('hidden');
    overlay.classList.add('hidden');
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    gameoverBox.classList.add('hidden');
    controlsBox.classList.add('hidden');
    pauseBox.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  const frozen = frozenUntil > 0 && ts < frozenUntil;
  if (!frozen) {
    dropAccum += dt;
    if (dropAccum >= dropInterval) {
      dropAccum = 0;
      if (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
      } else {
        lockPiece();
      }
    }
  } else {
    dropAccum = 0;
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function applySkin(id) {
  currentSkin = SKINS[id] || SKINS.retro;
  localStorage.setItem('tetris_skin', id);
  // update canvas bg for neon skin (black) vs default
  canvas.style.background = id === 'neon' ? '#000' : '';
  nextCanvas.style.background = id === 'neon' ? '#000' : '';
  // update skin button active states
  document.querySelectorAll('.skin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.skin === id);
  });
  if (typeof next !== 'undefined' && next) drawNext();
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = startLevel;
  paused = false;
  gameOver = false;
  dropInterval = Math.max(100, 1000 - (startLevel - 1) * 90);
  dropAccum = 0;
  lastTime = performance.now();
  powerUpCountdown = POWER_UP_INTERVAL;
  nextPowerUpQueued = false;
  frozenUntil = 0;
  effectMsg = null;
  effectMsgUntil = 0;
  effectMsgColor = null;
  currentCombo = 0;
  maxCombo = 0;
  maxLines = 0;
  newHsIndex = -1;
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);

document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('restart-pause-btn').addEventListener('click', init);
document.getElementById('controls-btn').addEventListener('click', () => {
  pauseBox.classList.add('hidden');
  controlsBox.classList.remove('hidden');
});
document.getElementById('controls-back-btn').addEventListener('click', () => {
  controlsBox.classList.add('hidden');
  pauseBox.classList.remove('hidden');
});
document.getElementById('start-level').addEventListener('change', e => {
  startLevel = parseInt(e.target.value, 10);
});

const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? 'MODO OSCURO' : 'MODO CLARO';
});

let hsSubmitted = false;

function submitHighScore() {
  if (hsSubmitted) return;
  hsSubmitted = true;
  const name = document.getElementById('hs-name-input').value.trim().slice(0, 12) || 'AAA';
  document.getElementById('hs-name-form').classList.add('hidden');
  const scores = saveScore(name);
  renderScores(scores, newHsIndex);
  document.getElementById('scores-section').classList.remove('hidden');
}

document.getElementById('hs-submit-btn').addEventListener('click', submitHighScore);

document.getElementById('hs-name-input').addEventListener('keydown', e => {
  if (e.code === 'Enter') submitHighScore();
});

document.getElementById('hs-reset-btn').addEventListener('click', () => {
  if (confirm('¿Borrar todos los records?')) {
    localStorage.removeItem('tetris_scores');
    renderScores([], -1);
  }
});

document.querySelectorAll('.skin-btn').forEach(btn => {
  btn.addEventListener('click', () => applySkin(btn.dataset.skin));
});

applySkin(localStorage.getItem('tetris_skin') || 'retro');

init();
