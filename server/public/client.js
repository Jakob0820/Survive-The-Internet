const MIN_PLAYERS = 3; // Host + mindestens zwei weitere Spieler

// Kopie der Farben aus colors.js
const COLORS = [
  '#d40e0e', '#ff8000', '#dde01b', '#28b428',
  '#37b5d4', '#2e579e', '#642590', '#c860ca',
];

// Kopie aus questions.js: Logo und Farben (color[0], color[1], color[2]) je Rundentyp
const ROUND_INFO = {
  google_maps: { logo: 'logos/googlemaps.png', color: '#79acff', secondary: '#1a55b5', tertiary: '#5a97f9' },
  reddit:      { logo: 'logos/reddit.png',     color: '#ff9772', secondary: '#be4012', tertiary: '#f97d50' },
  youtube:     { logo: 'logos/youtube.png',    color: '#ffb8b8', secondary: '#bb1f1f', tertiary: '#f79393' },
  linkedin:    { logo: 'logos/linkedin.png',   color: '#8bd3ff', secondary: '#1673ad', tertiary: '#51b8f8' },
  tagesschau:  { logo: 'logos/tagesschau.png', color: '#adccff', secondary: '#2160c5', tertiary: '#7babf9' },
  gutefrage:   { logo: 'logos/gutefrage.png',  color: '#6cceff', secondary: '#1a8dc7', tertiary: '#3fb9f6' },
  gofundme:    { logo: 'logos/gofundme.png',   color: '#59e59f', secondary: '#00ab55', tertiary: '#42a975' },
  twitter:     { logo: 'logos/twitter.png',    color: '#ade0ff', secondary: '#1484c9', tertiary: '#94d6ff' },
  ebay:        { logo: 'logos/ebay.png',       color: '#c8f364', secondary: '#668e08', tertiary: '#beeb53' },
  facebook:    { logo: 'logos/facebook.png',   color: '#8fb3ff', secondary: '#1877f2', tertiary: '#6a9cf7' },
};

// Fallback, falls der Server keine Restzeit schickt (Timer aus): so lange wie in der App
const DEFAULT_TRANSITION_MS = 3000;
const ANSWER_INTRO_MS = 3000;   // "Geschafft!"-Einblendung, falls der Server keine Restzeit schickt

let currentRoom = null;

// Spielzustand (Fragephase)
let answerSubmitted = false;
let selectedFacebookOption = null;
let timerInterval = null;
let responseSubmitted = false;   // Antwortphase: eigener Kommentar abgeschickt
let transitionTimeout = null;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 24;

const socket = io();

// Raumcode + playerId pro Tab merken, damit man nach dem Neuladen wieder im Spiel ist
const SESSION_KEY = 'sti-session';

function saveSession(code, playerId) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, playerId })); } catch {}
}

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

const joinView = document.getElementById('joinView');
const roomView = document.getElementById('roomView');
const nameInput = document.getElementById('nameInput');
const codeInput = document.getElementById('codeInput');
const joinError = document.getElementById('joinError');
const joinButton = document.getElementById('joinButton');
const playerList = document.getElementById('playerList');
const leaveConfirm = document.getElementById('leaveConfirm');
const colorPicker = document.getElementById('colorPicker');
const colorGrid = document.getElementById('colorGrid');

const gameView = document.getElementById('gameView');
const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const facebookOptions = document.getElementById('facebookOptions');
const submitAnswerButton = document.getElementById('submitAnswerButton');
const gameError = document.getElementById('gameError');
const gameWaiting = document.getElementById('gameWaiting');
const timerRing = document.getElementById('timerRing');
const timerText = document.getElementById('timerText');
const transitionView = document.getElementById('transitionView');

const answerSplashView = document.getElementById('answerSplashView');
const answerView = document.getElementById('answerView');
const responseForm = document.getElementById('responseForm');
const responseInput = document.getElementById('responseInput');
const submitResponseButton = document.getElementById('submitResponseButton');
const answerError = document.getElementById('answerError');
const answerWaiting = document.getElementById('answerWaiting');

const ALL_VIEWS = [joinView, roomView, transitionView, gameView, answerSplashView, answerView];

// Timer-Elemente der Frage- und der Antwortansicht
const questionTimerUi = {
  timer: document.getElementById('timer'),
  ring: timerRing,
  text: timerText,
};
const answerTimerUi = {
  timer: document.getElementById('answerTimer'),
  ring: document.getElementById('answerTimerRing'),
  text: document.getElementById('answerTimerText'),
};

function hideAllViews() {
  ALL_VIEWS.forEach((view) => view.classList.add('hidden'));
}

function showJoinView(errorText = '') {
  stopTimer();
  stopTransition();
  hideAllViews();
  joinView.classList.remove('hidden');
  joinError.textContent = errorText;
  joinButton.disabled = false;
}

function showRoomView() {
  hideAllViews();
  roomView.classList.remove('hidden');
}

function renderRoom(room) {
  currentRoom = room;
  document.getElementById('roomCode').textContent = room.code;
  playerList.innerHTML = '';

  room.players.forEach((player) => {
    const box = document.createElement('div');
    box.className = 'player-box' + (player.id === socket.id ? ' own' : '');

    const text = document.createElement('div');
    text.className = 'player-text';

    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;   // textContent: kein HTML aus Namen
    text.appendChild(name);

    const subtitleParts = [];
    if (player.isHost) subtitleParts.push('Host');
    if (player.id === socket.id) subtitleParts.push('Du');
    if (player.connected === false) subtitleParts.push('Verbindung getrennt');
    if (subtitleParts.length) {
      const subtitle = document.createElement('div');
      subtitle.className = 'player-subtitle';
      subtitle.textContent = subtitleParts.join(' · ');
      text.appendChild(subtitle);
    }

    // Nur der eigene Farbkreis ist anklickbar
    const isOwn = player.id === socket.id;
    const circle = document.createElement(isOwn ? 'button' : 'div');
    circle.className = 'color-circle';
    circle.style.backgroundColor = player.color;
    if (isOwn) {
      circle.type = 'button';
      circle.setAttribute('aria-label', 'Farbe wählen');
      circle.onclick = openColorPicker;
    }

    box.append(text, circle);
    playerList.appendChild(box);
  });

  // Offenes Farbauswahl-Popup aktuell halten (z. B. wenn jemand anderes eine Farbe nimmt)
  if (!colorPicker.classList.contains('hidden')) renderColorGrid();

  // "Warte auf Spieler"-Boxen, bis die Mindestanzahl erreicht ist
  const waitingSlots = Math.max(0, MIN_PLAYERS - room.players.length);
  for (let i = 0; i < waitingSlots; i++) {
    const box = document.createElement('div');
    box.className = 'player-box waiting';
    box.innerHTML = '<span class="waiting-text">Warte auf Spieler...</span><div class="spinner"></div>';
    playerList.appendChild(box);
  }
}

function renderColorGrid() {
  const me = currentRoom.players.find((p) => p.id === socket.id);
  const takenColors = currentRoom.players
    .filter((p) => p.id !== socket.id)
    .map((p) => p.color);

  colorGrid.innerHTML = '';
  COLORS.forEach((color) => {
    const isTaken = takenColors.includes(color);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picker-circle' + (me && me.color === color ? ' selected' : '');
    button.style.backgroundColor = color;
    button.disabled = isTaken;
    button.textContent = isTaken ? '✕' : '';
    button.onclick = () => {
      socket.emit('changeColor', { color });
      closeColorPicker();
    };
    colorGrid.appendChild(button);
  });
}

function openColorPicker() {
  if (!currentRoom) return;
  renderColorGrid();
  colorPicker.classList.remove('hidden');
}

function closeColorPicker() {
  colorPicker.classList.add('hidden');
}

document.getElementById('colorPickerBack').onclick = closeColorPicker;

// ---------- Rundenübergang (wie GameTransitionScreen) ----------

function showTransitionView(game) {
  const roundIndex = game.roundIndex ?? 0;
  const info = ROUND_INFO[game.rounds[roundIndex]] ?? ROUND_INFO.google_maps;
  //Falls null ist roundIndex = 0 und game.rounds = google_maps

  closeColorPicker(); //Falls gerade noch eine Farbe ausgewählt wird
  leaveConfirm.classList.add('hidden');
  hideAllViews();

  document.getElementById('transitionRound').textContent = 'Runde ' + (roundIndex + 1);
  document.getElementById('transitionLogo').src = info.logo;

  // Rundenfarbe für Logo-Fläche und Rahmen
  transitionView.style.setProperty('--round-color', info.color);
  transitionView.style.setProperty('--round-tint', info.color + '33'); // 20 % Deckkraft, wie die Frage-Box

  // Fortschrittspunkte: erledigte und aktuelle Runde in der Rundenfarbe
  const dots = document.getElementById('transitionDots');
  dots.innerHTML = '';
  game.rounds.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === roundIndex ? ' active' : '');
    if (i <= roundIndex) dot.style.backgroundColor = info.color;
    dots.appendChild(dot);
  });

  // Klasse kurz entfernen und neu setzen, damit die Logo-Animation jede Runde neu startet
  transitionView.classList.add('hidden');
  void transitionView.offsetWidth;
  transitionView.classList.remove('hidden');
}

function stopTransition() {
  clearTimeout(transitionTimeout);
  transitionTimeout = null;
  transitionView.classList.add('hidden');
}

// ---------- Spiel: eigene Frage beantworten (GameScreen in der App selbst) ----------

function showGameView(game, timerEndsAt) {
  const myIndex = game.players.findIndex((p) => p.id === socket.id);
  const me = game.players[myIndex];
  if (!me) return;

  stopTransition();
  closeColorPicker();
  leaveConfirm.classList.add('hidden');
  hideAllViews();
  gameView.classList.remove('hidden');

  // Eigene Farbe als Akzent (Frage-Box, Timer-Ring, Auswahl)
  gameView.style.setProperty('--player-color', me.color);
  document.getElementById('questionBox').style.backgroundColor = me.color + '33'; // 20 % Deckkraft
  timerRing.setAttribute('stroke', me.color);

  document.getElementById('gameTitle').textContent = 'Du bist dran!';
  document.getElementById('questionText').textContent = game.questions[myIndex] ?? '';

  answerSubmitted = false;
  selectedFacebookOption = null;
  answerInput.value = '';
  gameError.textContent = '';
  submitAnswerButton.disabled = false;
  answerForm.classList.remove('hidden');
  gameWaiting.classList.add('hidden');

  // Facebook-Runde: Antwortmöglichkeiten statt Textfeld
  const fbQuestion = game.facebookQuestions?.[myIndex];
  const isFacebook = Boolean(fbQuestion?.options?.length);
  answerInput.classList.toggle('hidden', isFacebook);
  facebookOptions.classList.toggle('hidden', !isFacebook);
  facebookOptions.innerHTML = '';
  if (isFacebook) {
    fbQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-btn';
      button.textContent = option.label;
      button.onclick = () => {
        selectedFacebookOption = index;
        [...facebookOptions.children].forEach((b, i) => b.classList.toggle('selected', i === index));
      };
      facebookOptions.appendChild(button);
    });
  }

  // Nach dem Wiederbeitreten: schon abgeschickt oder Fragephase vorbei → nur noch warten
  const alreadyDone = game.phase !== 'question' || game.submitted?.[myIndex];
  if (alreadyDone) {
    answerSubmitted = true;
    stopTimer();
    document.getElementById('timer').classList.add('hidden');
    answerForm.classList.add('hidden');
    gameWaiting.classList.remove('hidden');
    return;
  }

  startTimer(game.duration, timerEndsAt, questionTimerUi, submitAnswer);
}

// Läuft bis zum Endzeitpunkt des Servers herunter und ruft bei 0 onExpire auf (duration 0 = unbegrenzt)
function startTimer(duration, endsAt, ui, onExpire) {
  stopTimer();
  if (!duration) {
    ui.timer.classList.add('hidden');
    return;
  }
  ui.timer.classList.remove('hidden');

  const totalMs = duration * 1000;
  const end = endsAt ?? Date.now() + totalMs;
  ui.ring.setAttribute('stroke-dasharray', TIMER_CIRCUMFERENCE);

  const tick = () => {
    // nie mehr als die volle Dauer anzeigen (falls der Übergang etwas früher endet)
    const leftMs = Math.max(0, Math.min(totalMs, end - Date.now()));
    ui.text.textContent = Math.ceil(leftMs / 1000);
    ui.ring.setAttribute('stroke-dashoffset', TIMER_CIRCUMFERENCE * (1 - leftMs / totalMs));
    if (leftMs <= 0) {
      stopTimer();
      onExpire();
    }
  };
  tick();
  timerInterval = setInterval(tick, 250);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function submitAnswer() {
  if (answerSubmitted) return;
  answerSubmitted = true;
  submitAnswerButton.disabled = true;
  gameError.textContent = '';

  const isFacebook = !facebookOptions.classList.contains('hidden');
  const payload = {
    answer: isFacebook ? '' : answerInput.value,
    facebookOption: isFacebook ? (selectedFacebookOption ?? 0) : null,
  };

  socket.timeout(5000).emit('submitAnswer', payload, (err, response) => {
    if (err || !response.ok) {
      // Nicht angekommen: wieder freigeben, damit man es erneut versuchen kann
      answerSubmitted = false;
      submitAnswerButton.disabled = false;
      gameError.textContent = err ? 'Server nicht erreichbar' : response.error;
      return;
    }
    answerForm.classList.add('hidden');
    gameWaiting.classList.remove('hidden');
  });
}

answerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAnswer();
});

// Zeigt erst die Transition und dann die Frage
function enterGame(game, fallbackTransitionMs = DEFAULT_TRANSITION_MS) {
  // Der Server schickt die Restzeit inklusive Übergang
  const hasTimer = game.timeLeftMs != null;
  const timerEndsAt = hasTimer ? Date.now() + game.timeLeftMs : null;
  const transitionMs = hasTimer ? Math.max(0, game.timeLeftMs - game.duration * 1000) : fallbackTransitionMs;

  clearTimeout(transitionTimeout);
  if (transitionMs > 0 && game.phase === 'question') {
    showTransitionView(game);
    transitionTimeout = setTimeout(() => showGameView(game, timerEndsAt), transitionMs);
  } else {
    showGameView(game, timerEndsAt);
  }
}

socket.on('gameStarted', (game) => enterGame(game));

// Server hat abgeschlossen (alle fertig oder Zeit um): Formular schließen, auf die Antwortphase warten
socket.on('allAnswersSubmitted', () => {
  if (gameView.classList.contains('hidden')) return;
  answerSubmitted = true;
  stopTimer();
  questionTimerUi.timer.classList.add('hidden');
  answerForm.classList.add('hidden');
  gameWaiting.classList.remove('hidden');
});

// ---------- Antwortphase (wie AnswerScreen im Online-Modus) ----------

function showAnswerSplash(info) {
  hideAllViews();
  answerSplashView.style.setProperty('--round-color', info.color);
  answerSplashView.style.setProperty('--round-secondary', info.secondary);
  answerSplashView.style.setProperty('--round-tertiary', info.tertiary);
  document.getElementById('splashLogo').src = info.logo;

  // Klasse kurz entfernen und neu setzen, damit die Animationen neu starten
  void answerSplashView.offsetWidth;
  answerSplashView.classList.remove('hidden');
}

function showAnswerWaiting() {
  responseSubmitted = true;
  stopTimer();
  answerTimerUi.timer.classList.add('hidden');
  responseForm.classList.add('hidden');
  answerWaiting.classList.remove('hidden');
}

function showAnswerView(game, myIndex, timerEndsAt) {
  const me = game.players[myIndex];
  const isFacebook = game.rounds[game.roundIndex] === 'facebook';

  stopTransition();
  hideAllViews();
  answerView.classList.remove('hidden');

  // Eigene Farbe als Akzent (Frage-Knopf, aufgeklappter Bereich, Timer-Ring)
  answerView.style.setProperty('--player-color', me.color);
  answerView.style.setProperty(
    '--player-color-light',
    tinycolor(me.color).lighten(25).brighten(10).toHexString()
  );
  answerTimerUi.ring.setAttribute('stroke', me.color);
  document.getElementById('responseBox').style.backgroundColor = me.color + '33';

  // Spieler myIndex kommentiert die Antwort von Spieler shuffledIndices[myIndex]
  const answerIndex = game.shuffledIndices[myIndex];
  const imageKey = game.facebookImages?.[answerIndex];
  const answerImage = document.getElementById('answerImage');
  const answerBubble = document.getElementById('answerBubble');

  answerImage.classList.toggle('hidden', !(isFacebook && imageKey));
  answerBubble.classList.toggle('hidden', isFacebook);
  if (isFacebook && imageKey) answerImage.src = 'facebook_images/' + imageKey + 'Image.png';
  document.getElementById('answerBubbleText').textContent = game.answers[answerIndex] ?? '';

  // Facebook: Name des Spielers, dessen Bild es ist, vor den Antworttext
  const author = game.players[answerIndex]?.name ?? '';
  document.getElementById('answerPrompt').textContent =
    (isFacebook ? author + ' ' : '') + (game.answerPrompt ?? '');

  responseSubmitted = false;
  responseInput.value = '';
  answerError.textContent = '';
  submitResponseButton.disabled = false;
  responseForm.classList.remove('hidden');
  answerWaiting.classList.add('hidden');

  // Nach dem Wiederbeitreten: schon abgeschickt oder Antwortphase vorbei → nur noch warten
  if (game.phase !== 'answer' || game.responseSubmitted?.[myIndex]) {
    showAnswerWaiting();
    return;
  }

  startTimer(game.duration, timerEndsAt, answerTimerUi, submitResponse);
}

// Zeigt erst die "Geschafft!"-Einblendung (falls noch nicht vorbei) und dann die zugeloste Antwort
function enterAnswerPhase(game, fallbackIntroMs = ANSWER_INTRO_MS) {
  const myIndex = game.players.findIndex((p) => p.id === socket.id);
  if (myIndex === -1) return;

  const info = ROUND_INFO[game.rounds[game.roundIndex]] ?? ROUND_INFO.google_maps;
  const hasTimer = game.timeLeftMs != null;
  const timerEndsAt = hasTimer ? Date.now() + game.timeLeftMs : null;
  const introMs = hasTimer ? Math.max(0, game.timeLeftMs - game.duration * 1000) : fallbackIntroMs;

  stopTimer();
  closeColorPicker();
  leaveConfirm.classList.add('hidden');
  clearTimeout(transitionTimeout);

  if (introMs > 0 && game.phase === 'answer') {
    showAnswerSplash(info);
    transitionTimeout = setTimeout(() => showAnswerView(game, myIndex, timerEndsAt), introMs);
  } else {
    showAnswerView(game, myIndex, timerEndsAt);
  }
}

function submitResponse() {
  if (responseSubmitted) return;
  responseSubmitted = true;
  submitResponseButton.disabled = true;
  answerError.textContent = '';

  socket.timeout(5000).emit('submitResponse', { response: responseInput.value }, (err, response) => {
    if (err || !response.ok) {
      // Nicht angekommen: wieder freigeben, damit man es erneut versuchen kann
      responseSubmitted = false;
      submitResponseButton.disabled = false;
      answerError.textContent = err ? 'Server nicht erreichbar' : response.error;
      return;
    }
    showAnswerWaiting();
  });
}

responseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitResponse();
});

socket.on('answerPhaseStarted', (game) => enterAnswerPhase(game));

// Alle Kommentare sind da (oder Zeit um)
socket.on('allResponsesSubmitted', () => {
  if (!answerView.classList.contains('hidden')) showAnswerWaiting();
  // TODO: nächster Schritt – Auswertung
});

// Bei jeder (Neu-)Verbindung: falls wir schon in einem Raum waren, wieder beitreten
socket.on('connect', () => {
  const session = loadSession();
  if (!session) return;

  socket.emit('rejoinRoom', session, (response) => {
    if (!response.ok) {
      clearSession();
      showJoinView(response.error);
      return;
    }
    renderRoom(response.room);
    const phase = response.room.phase;
    if (response.game && (phase === 'answer' || phase === 'evaluation')) {
      enterAnswerPhase(response.game, 0);
    } else if (response.game && phase !== 'lobby') {
      enterGame(response.game, 0);
    } else {
      stopTimer();
      stopTransition();
      showRoomView();
    }
  });
});

joinView.addEventListener('submit', (event) => {
  event.preventDefault();
  joinError.textContent = '';
  joinButton.disabled = true;

  const name = nameInput.value;
  const code = codeInput.value.trim().toUpperCase();

  socket.emit('joinRoom', { name, code }, (response) => {
    if (response.ok) {
      saveSession(response.code, response.playerId);
      showRoomView();
    } else {
      showJoinView(response.error);
    }
  });
});

socket.on('roomUpdate', (room) => {
  renderRoom(room);
});

socket.on('roomClosed', () => {
  clearSession();
  leaveConfirm.classList.add('hidden');
  closeColorPicker();
  showJoinView('Der Host hat den Raum geschlossen');
});

socket.on('disconnect', () => {
  const inRoom = ALL_VIEWS.some((view) => view !== joinView && !view.classList.contains('hidden'));
  if (inRoom) {
    closeColorPicker();
    // Socket.IO verbindet automatisch neu, danach tritt 'connect' wieder bei
    showJoinView(loadSession() ? 'Verbindung verloren – verbinde neu...' : 'Verbindung zum Server verloren');
  }
});

document.getElementById('leaveButton').onclick = () => {
  leaveConfirm.classList.remove('hidden');
};

document.getElementById('confirmNo').onclick = () => {
  leaveConfirm.classList.add('hidden');
};

document.getElementById('confirmYes').onclick = () => {
  leaveConfirm.classList.add('hidden');
  clearSession();
  socket.emit('leaveRoom');
  showJoinView();
};
