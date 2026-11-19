const MIN_PLAYERS = 3; // Host + mindestens zwei weitere Spieler

// Kopie der Farben aus colors.js
const COLORS = [
  '#d40e0e', '#ff8000', '#dde01b', '#28b428',
  '#37b5d4', '#2e579e', '#642590', '#c860ca',
];

// Kopie aus questions.js: Logo und Hauptfarbe (color[0]) je Rundentyp für den Rundenübergang
const ROUND_INFO = {
  google_maps: { logo: 'logos/googlemaps.png', color: '#79acff' },
  reddit:      { logo: 'logos/reddit.png',     color: '#ff9772' },
  youtube:     { logo: 'logos/youtube.png',    color: '#ffb8b8' },
  linkedin:    { logo: 'logos/linkedin.png',   color: '#8bd3ff' },
  tagesschau:  { logo: 'logos/tagesschau.png', color: '#adccff' },
  gutefrage:   { logo: 'logos/gutefrage.png',  color: '#6cceff' },
  gofundme:    { logo: 'logos/gofundme.png',   color: '#59e59f' },
  twitter:     { logo: 'logos/twitter.png',    color: '#ade0ff' },
  ebay:        { logo: 'logos/ebay.png',       color: '#c8f364' },
  facebook:    { logo: 'logos/facebook.png',   color: '#8fb3ff' },
};

// Fallback, falls der Server keine Restzeit schickt (Timer aus): so lange wie in der App
const DEFAULT_TRANSITION_MS = 3000;

let currentRoom = null;

// Spielzustand (Fragephase)
let answerSubmitted = false;
let selectedFacebookOption = null;
let timerInterval = null;
let transitionTimeout = null;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 24;

const socket = io();

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

function showJoinView(errorText = '') {
  stopTimer();
  stopTransition();
  gameView.classList.add('hidden');
  roomView.classList.add('hidden');
  joinView.classList.remove('hidden');
  joinError.textContent = errorText;
  joinButton.disabled = false;
}

function showRoomView() {
  joinView.classList.add('hidden');
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

  closeColorPicker();
  leaveConfirm.classList.add('hidden');
  joinView.classList.add('hidden');
  roomView.classList.add('hidden');
  gameView.classList.add('hidden');

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

// ---------- Spiel: eigene Frage beantworten ----------

function showGameView(game, timerEndsAt) {
  const myIndex = game.players.findIndex((p) => p.id === socket.id);
  const me = game.players[myIndex];
  if (!me) return;

  stopTransition();
  closeColorPicker();
  leaveConfirm.classList.add('hidden');
  joinView.classList.add('hidden');
  roomView.classList.add('hidden');
  gameView.classList.remove('hidden');

  // Eigene Farbe als Akzent (Frage-Box, Timer-Ring, Auswahl)
  gameView.style.setProperty('--player-color', me.color);
  document.getElementById('questionBox').style.backgroundColor = me.color + '33'; // 20 % Deckkraft
  timerRing.setAttribute('stroke', me.color);

  document.getElementById('gameTitle').textContent = me.name + ' ist dran!';
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

  startTimer(game.duration, timerEndsAt);
}

// Läuft bis zum Endzeitpunkt des Servers herunter und schickt bei 0 automatisch ab (duration 0 = unbegrenzt)
function startTimer(duration, endsAt) {
  stopTimer();
  const timer = document.getElementById('timer');
  if (!duration) {
    timer.classList.add('hidden');
    return;
  }
  timer.classList.remove('hidden');

  const totalMs = duration * 1000;
  const end = endsAt ?? Date.now() + totalMs;
  timerRing.setAttribute('stroke-dasharray', TIMER_CIRCUMFERENCE);

  const tick = () => {
    // nie mehr als die volle Dauer anzeigen (falls der Übergang etwas früher endet)
    const leftMs = Math.max(0, Math.min(totalMs, end - Date.now()));
    timerText.textContent = Math.ceil(leftMs / 1000);
    timerRing.setAttribute('stroke-dashoffset', TIMER_CIRCUMFERENCE * (1 - leftMs / totalMs));
    if (leftMs <= 0) {
      stopTimer();
      submitAnswer();
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

socket.on('gameStarted', (game) => {
  // Zeit beim Empfang festhalten: Der Server schickt die Restzeit inkl. Übergang,
  // so endet der Timer im Browser zur selben Zeit wie in der App
  const receivedAt = Date.now();
  const timerEndsAt = game.timeLeftMs ? receivedAt + game.timeLeftMs : null;
  const transitionMs = game.timeLeftMs ? game.timeLeftMs - game.duration * 1000 : DEFAULT_TRANSITION_MS;

  showTransitionView(game);
  clearTimeout(transitionTimeout);
  transitionTimeout = setTimeout(() => showGameView(game, timerEndsAt), transitionMs);
});

joinView.addEventListener('submit', (event) => {
  event.preventDefault();
  joinError.textContent = '';
  joinButton.disabled = true;

  const name = nameInput.value;
  const code = codeInput.value.trim().toUpperCase();

  socket.emit('joinRoom', { name, code }, (response) => {
    if (response.ok) {
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
  leaveConfirm.classList.add('hidden');
  closeColorPicker();
  showJoinView('Der Host hat den Raum geschlossen');
});

socket.on('disconnect', () => {
  const inRoom = [roomView, transitionView, gameView].some((view) => !view.classList.contains('hidden'));
  if (inRoom) {
    closeColorPicker();
    showJoinView('Verbindung zum Server verloren');
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
  socket.emit('leaveRoom');
  showJoinView();
};
