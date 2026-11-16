const MIN_PLAYERS = 3; // Host + mindestens zwei weitere Spieler

// Kopie der Farben aus colors.js
const COLORS = [
  '#d40e0e', '#ff8000', '#dde01b', '#28b428',
  '#37b5d4', '#2e579e', '#642590', '#c860ca',
];

let currentRoom = null;

// Spielzustand (Fragephase)
let answerSubmitted = false;
let selectedFacebookOption = null;
let timerInterval = null;
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

function showJoinView(errorText = '') {
  stopTimer();
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

// ---------- Spiel: eigene Frage beantworten ----------

function showGameView(game) {
  const myIndex = game.players.findIndex((p) => p.id === socket.id);
  const me = game.players[myIndex];
  if (!me) return;

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

  startTimer(game.duration);
}

// Läuft wie in der App lokal herunter und schickt bei 0 automatisch ab (duration 0 = unbegrenzt)
function startTimer(duration) {
  stopTimer();
  const timer = document.getElementById('timer');
  if (!duration) {
    timer.classList.add('hidden');
    return;
  }
  timer.classList.remove('hidden');

  const endsAt = Date.now() + duration * 1000;
  timerRing.setAttribute('stroke-dasharray', TIMER_CIRCUMFERENCE);

  const tick = () => {
    const leftMs = Math.max(0, endsAt - Date.now());
    timerText.textContent = Math.ceil(leftMs / 1000);
    timerRing.setAttribute('stroke-dashoffset', TIMER_CIRCUMFERENCE * (1 - leftMs / (duration * 1000)));
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
    stopTimer();
    answerForm.classList.add('hidden');
    gameWaiting.classList.remove('hidden');
  });
}

answerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAnswer();
});

socket.on('gameStarted', (game) => {
  showGameView(game);
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
  if (!roomView.classList.contains('hidden') || !gameView.classList.contains('hidden')) {
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
