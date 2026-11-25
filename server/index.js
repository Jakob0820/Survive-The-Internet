const path = require('path');
const http = require('http');
const express = require('express');
const crypto = require('crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);   // Express in einen HTTP-Server packen
const io = new Server(server, {
  cors: { origin: '*' },                 // nur für die Web-Version nötig
});
const PORT = process.env.PORT || 3000;   // Hoster geben den Port per Umgebungsvariable vor
let connectionCount = 0;
const MIN_PLAYERS = 3;
const RECONNECT_GRACE_MS = 30000;
const TRANSITION_MS = 3000;     // Puffer für den Rundenübergang in der App
const ANSWER_INTRO_MS = 3000;   // "Geschafft!"-Einblendung vor der Antwortphase (wie im AnswerScreen)
const GRACE_MS = 2000;          // Puffer für Antworten, die genau bei 0 unterwegs sind   // so lange bleibt ein getrennter Spieler im Raum (z. B. Seite neu geladen)

// Timer für getrennte Spieler: playerId → Timeout (bewusst NICHT im Raum-Objekt, weil Timeouts nicht verschickt werden können)
const disconnectTimers = new Map();

// Alle Räume: Raumcode → Raum-Objekt
const rooms = new Map();

// Kopie der Farben aus colors.js
const COLORS = [
  '#d40e0e', '#ff8000', '#dde01b', '#28b428',
  '#37b5d4', '#2e579e', '#642590', '#c860ca',
];

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRoomCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
      code += ROOM_CODE_CHARS[randomIndex];
    }
  } while (rooms.has(code));   // falls es den Code schon gibt: neu würfeln
  return code;
}

// Raum ohne Timer und ohne geheime playerIds, damit er per Socket.IO verschickt werden kann
// (room.timer ist ein Timeout-Objekt mit Zirkelbezügen → sonst "Maximum call stack size exceeded")
function publicPlayers(players) {
  return players.map(({ playerId, ...rest }) => rest);
}

function publicRoom(room) {
  const { timer, ...rest } = room;
  return { ...rest, players: publicPlayers(room.players) };
}

function emitRoomUpdate(room) {
  io.to(room.code).emit('roomUpdate', publicRoom(room));
}

// Spielstand, so wie ihn ein (wieder) verbundenes Gerät braucht
function gameStateFor(room) {
  if (!room.game) return null;
  const { endsAt, ...game } = room.game;
  return {
    phase: room.phase,
    ...game,
    timeLeftMs: endsAt ? Math.max(0, endsAt - Date.now()) : undefined,
    players: publicPlayers(room.players),
  };
}

function clearDisconnectTimer(playerId) {
  clearTimeout(disconnectTimers.get(playerId));
  disconnectTimers.delete(playerId);
}

function deleteRoom(room, notify) {
  clearTimeout(room.timer);
  room.players.forEach((p) => clearDisconnectTimer(p.playerId));
  if (notify) io.to(room.code).emit('roomClosed');
  io.in(room.code).socketsLeave(room.code);
  rooms.delete(room.code);
  console.log(`Raum ${room.code} gelöscht`);
}

function findPlayerBySocket(socket) {
  const room = rooms.get(socket.data.roomCode);
  const player = room?.players.find((p) => p.id === socket.id);
  return { room, player };
}

// Spieler endgültig entfernen (verlassen oder nicht rechtzeitig zurückgekommen)
function removePlayer(room, player) {
  clearDisconnectTimer(player.playerId);
  console.log(`${player.name} hat Raum ${room.code} verlassen`);

  // Wenn der Host geht, wird der Raum geschlossen
  if (player.isHost) {
    deleteRoom(room, true);
    return;
  }

  if (room.phase === 'lobby') {
    room.players = room.players.filter((p) => p !== player);
  } else {
    // Im Spiel bleibt der Spieler in der Liste, damit answers[i] ↔ players[i] stimmt
    player.connected = false;
    player.left = true;
    const index = room.players.indexOf(player);
    // Leere Antwort eintragen, damit niemand auf ihn wartet
    if (room.phase === 'question' && !room.game.submitted[index]) {
      recordAnswer(room, index, '', null);
    } else if (room.phase === 'answer' && !room.game.responseSubmitted[index]) {
      recordResponse(room, index, '');
    }
  }

  if (!room.players.some((p) => p.connected)) {
    deleteRoom(room, false);
    return;
  }
  emitRoomUpdate(room);
}

function recordAnswer(room, index, answer, facebookOption) {
  room.game.answers[index] = String(answer ?? '').slice(0, 100);
  room.game.facebookOptions[index] = Number.isInteger(facebookOption) ? facebookOption : null;
  room.game.submitted[index] = true;
  console.log(`Raum ${room.code}: Antwort von ${room.players[index].name}`);

  // Alle fertig? Dann allen Geräten die gesammelten Antworten schicken
  if (room.game.submitted.every(Boolean)) {
    finishQuestionPhase(room);
  }
}

function recordResponse(room, index, response) {
  room.game.responses[index] = String(response ?? '').slice(0, 100);
  room.game.responseSubmitted[index] = true;
  console.log(`Raum ${room.code}: Kommentar von ${room.players[index].name}`);

  if (room.game.responseSubmitted.every(Boolean)) {
    finishAnswerPhase(room);
  }
}

// Startet den Server-Timer einer Phase: Vorlauf (Übergang/Einblendung) + Spielzeit + Puffer
function startPhaseTimer(room, leadInMs, onTimeout) {
  clearTimeout(room.timer);
  room.timer = null;
  room.game.endsAt = null;
  if (!(room.game.duration > 0)) return;   // Timer aus: es wird gewartet, bis alle fertig sind

  const timeLeftMs = leadInMs + room.game.duration * 1000;
  room.game.endsAt = Date.now() + timeLeftMs;
  room.timer = setTimeout(() => onTimeout(room), timeLeftMs + GRACE_MS);
}

function finishQuestionPhase(room) {
  if (room.phase !== 'question') return;

  clearTimeout(room.timer);
  room.timer = null;
  room.phase = 'shuffle';   // jetzt mischt die Host-App die Antworten (siehe 'startAnswerPhase')

  //Wer nichts abgeschickt hat schickt einen leeren Text
  room.game.answers = room.game.answers.map((a) => a ?? '');

  const facebookImages = room.game.answers.map((_, i) => {
      const options = room.game.facebookQuestions[i]?.options || [];
      return options[room.game.facebookOptions[i] ?? 0]?.image ?? null;
    });
  room.game.facebookImages = facebookImages;
  io.to(room.code).emit('allAnswersSubmitted', { answers: room.game.answers, facebookImages });
}

function finishAnswerPhase(room) {
  if (room.phase !== 'answer') return;

  clearTimeout(room.timer);
  room.timer = null;
  room.game.endsAt = null;
  room.phase = 'evaluation';

  room.game.responses = room.game.responses.map((r) => r ?? '');
  // responses[i] stammt von players[i] und kommentiert answers[shuffledIndices[i]]
  io.to(room.code).emit('allResponsesSubmitted', {
    responses: room.game.responses ,
    answers: room.game.answers,
    shuffledIndices: room.game.shuffledIndices,
    facebookImages: room.game.facebookImages,
    isFacebookRound: room.game.rounds[room.game.roundIndex] === 'facebook',
  });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // liefert die Test-Webseite aus
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() });
});

app.post('/answer', (req, res) => {
  console.log('Neue Antwort:', req.body);
  res.json({ ok: true });
});

// Nur zum Entwickeln: zeigt alle Räume im Browser an
app.get('/rooms', (req, res) => {
  res.json([...rooms.values()].map(publicRoom));
});

// Wird für jedes Gerät aufgerufen, das sich verbindet
io.on('connection', (socket) => {
  console.log('Verbunden:', socket.id);

  connectionCount++;
  io.emit('playerCount', connectionCount);

  socket.on('message', (text) => {
    console.log(`${socket.id}: ${text}`);
    io.emit('message', { from: socket.id, text });   // an ALLE weiterleiten
  });

  socket.on('notification', (messageInput) => {
    io.emit('notification', {from: socket.id, messageInput});
  })

  socket.on('createRoom', ({ name }, callback) => {

    // 1. Eingabe prüfen: Wenn kein Name eingegeben wurde return
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      callback({ ok: false, error: 'Bitte gib einen Namen ein' });
      return;
    }

    // 2. Raum anlegen
    const code = generateRoomCode();
    const playerId = crypto.randomUUID();   // geheimer Schlüssel zum Wiederverbinden
    const room = {
      code,
      hostId: socket.id,
      phase: 'lobby',
      players: [
        { id: socket.id, playerId, name: trimmedName, color: COLORS[0], isHost: true, connected: true },
      ],
    };
    rooms.set(code, room);

    // 3. Dieses Gerät in den Socket.IO-Raum aufnehmen
    socket.join(code);
    socket.data.roomCode = code;

    console.log(`Raum ${code} erstellt von ${trimmedName}`);

    // 4. Dem Ersteller antworten und dem Raum den aktuellen Stand schicken
    callback({ ok: true, code, playerId });
    emitRoomUpdate(room);
  });

  //Raum beitreten
  socket.on('joinRoom', ({name, code}, callback) => {
    const trimmedName = (name || '').trim();
    const trimmedCode = (code || '').trim().toUpperCase();
    const room = rooms.get(trimmedCode);
    const id = socket.id;

    if (!trimmedName) {
      callback({ ok: false, error: 'Bitte gib einen Namen ein' });
      return;
    }
    if (!trimmedCode || code.length != 4) {
      callback({ ok: false, error: 'Bitte gib einen gültigen Code ein' });
      return;
    }
    if (!room) {
      callback({ ok: false, error: 'Der Raum existiert nicht'});
      return;
    }
    if (room.phase !== 'lobby'){
      callback({ ok: false, error: 'Das Spiel läuft bereits' });
      return;
    }
    if (room.players.some((p) => p.name === trimmedName)){
      callback({ ok: false, error: 'Der Name ist bereits vergeben' });
      return;
    }
    if (room.players.length >= COLORS.length){
      callback({ ok: false, error: 'Der angegebene Raum ist voll' });
      return;
    }

    const freeColor = COLORS.find(
      (color) => !room.players.some((p) => p.color === color)
    );

    const playerId = crypto.randomUUID();
    socket.join(trimmedCode);
    socket.data.roomCode = trimmedCode;
    room.players.push({
      name: trimmedName,
      id: id,
      playerId,
      color: freeColor,
      isHost: false,
      connected: true,
    });
    console.log(`${trimmedName} ist Raum ${trimmedCode} beigetreten`);

    callback({ ok: true, code: trimmedCode, playerId });
    emitRoomUpdate(room);
  });

  socket.on('disconnect', () => {
    console.log('Getrennt:', socket.id);
    connectionCount--;
    io.emit('playerCount', connectionCount);

    // Nicht sofort entfernen: Der Spieler hat RECONNECT_GRACE_MS Zeit, um zurückzukommen
    const { room, player } = findPlayerBySocket(socket);
    if (!room || !player) return;
    player.connected = false;
    emitRoomUpdate(room);
    clearDisconnectTimer(player.playerId);
    disconnectTimers.set(player.playerId, setTimeout(() => {
      disconnectTimers.delete(player.playerId);
      if (!player.connected && rooms.get(room.code) === room) removePlayer(room, player);
    }, RECONNECT_GRACE_MS));
  });

  socket.on('leaveRoom', () => {
    const { room, player } = findPlayerBySocket(socket);
    socket.leave(socket.data.roomCode);
    socket.data.roomCode = null;
    if (room && player) removePlayer(room, player);
  });

  // Nach dem Neuladen / Verbindungsabbruch: mit der gespeicherten playerId zurück in den Raum
  socket.on('rejoinRoom', ({ code, playerId } = {}, callback = () => {}) => {
    const room = rooms.get(String(code || '').toUpperCase());
    const player = playerId && room?.players.find((p) => p.playerId === playerId);
    if (!room || !player || player.left) {
      callback({ ok: false, error: 'Der Raum existiert nicht mehr' });
      return;
    }

    clearDisconnectTimer(playerId);

    // Alte Verbindung (falls noch nicht als getrennt erkannt) aus dem Raum nehmen
    const oldId = player.id;
    const oldSocket = io.sockets.sockets.get(oldId);
    if (oldSocket && oldSocket !== socket) {
      oldSocket.leave(room.code);
      oldSocket.data.roomCode = null;
    }

    player.id = socket.id;
    player.connected = true;
    if (room.hostId === oldId) room.hostId = socket.id;
    socket.join(room.code);
    socket.data.roomCode = room.code;

    console.log(`${player.name} ist Raum ${room.code} wieder beigetreten`);
    callback({ ok: true, room: publicRoom(room), game: gameStateFor(room) });
    emitRoomUpdate(room);
  });

  // Farbe des eigenen Spielers ändern
  socket.on('changeColor', ({ color }, callback = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) {
      callback({ ok: false, error: 'Du bist in keinem Raum' });
      return;
    }
    if (!COLORS.includes(color)) {
      callback({ ok: false, error: 'Ungültige Farbe' });
      return;
    }
    if (room.players.some((p) => p.id !== socket.id && p.color === color)) {
      callback({ ok: false, error: 'Die Farbe ist bereits vergeben' });
      return;
    }

    const player = room.players.find((p) => p.id === socket.id);
    player.color = color;

    callback({ ok: true });
    emitRoomUpdate(room);
  });

  // Der Host schickt die bereits gemischten Runden und Fragen mit, der Server verteilt sie an alle
  socket.on('startGame', (data = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    const { rounds, questions, facebookQuestions = [], duration } = data;

    if(!room){
      callback({ ok: false, error: 'Der Raum existiert nicht mehr'});
      return;
    }
    if(room.hostId !== socket.id){
      callback({ ok: false, error: 'Du bist nicht der Host'});
      return;
    }
    if(room.players.length < MIN_PLAYERS){
      callback({ ok: false, error: 'Zu wenige Spieler'});
      return;
    }
    if(room.phase !== 'lobby'){
      callback({ ok: false, error: 'Spiel wurde bereits gestartet'});
      return;
    }
    // Für jeden Spieler muss genau eine Frage dabei sein
    if(!Array.isArray(rounds) || rounds.length === 0 || !Array.isArray(questions) || questions.length !== room.players.length){
      callback({ ok: false, error: 'Ungültige Spieldaten'});
      return;
    }

    room.phase = 'question';
    room.game = {
      rounds,
      roundIndex: 0,
      questions,          // questions[i] gehört room.players[i]
      facebookQuestions,
      duration,
      answers: Array(room.players.length).fill(null),        // answers[i] stammt von room.players[i]
      facebookOptions: Array(room.players.length).fill(null),
      submitted: Array(room.players.length).fill(false),
    };

    startPhaseTimer(room, TRANSITION_MS, finishQuestionPhase);

    console.log(`Spiel in Raum ${room.code} gestartet`);

    //An alle Geräte in diesem Raum weiterleiten, inkl. Spielerliste für die Index-Zuordnung
    callback({ ok: true });
    io.to(room.code).emit('gameStarted', gameStateFor(room));
  });

  // Ein Spieler schickt seine Antwort (per Knopf oder weil sein Timer abgelaufen ist)
  socket.on('submitAnswer', ({ answer, facebookOption } = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.game) {
      callback({ ok: false, error: 'Du bist in keinem laufenden Spiel' });
      return;
    }
    if (room.phase !== 'question') {
      callback({ ok: false, error: 'Gerade werden keine Antworten angenommen' });
      return;
    }
    const index = room.players.findIndex((p) => p.id === socket.id);
    if (index === -1) {
      callback({ ok: false, error: 'Du bist nicht in diesem Raum' });
      return;
    }
    if (room.game.submitted[index]) {
      callback({ ok: true }); // doppelt geschickt: einfach ignorieren
      return;
    }

    callback({ ok: true });
    recordAnswer(room, index, answer, facebookOption);
  });

  // Der Host hat die Antworten gemischt (wie im lokalen Modus): Spieler i kommentiert answers[shuffledIndices[i]]
  socket.on('startAnswerPhase', ({ shuffledIndices, answerPrompt } = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.game) {
      callback({ ok: false, error: 'Du bist in keinem laufenden Spiel' });
      return;
    }
    if (room.hostId !== socket.id) {
      callback({ ok: false, error: 'Du bist nicht der Host' });
      return;
    }
    if (room.phase !== 'shuffle') {
      callback({ ok: false, error: 'Die Antworten können gerade nicht gemischt werden' });
      return;
    }
    // Muss eine Permutation von 0..n-1 sein, in der niemand seine eigene Antwort bekommt
    const n = room.players.length;
    const isValid = Array.isArray(shuffledIndices)
      && shuffledIndices.length === n
      && new Set(shuffledIndices).size === n
      && shuffledIndices.every((v, i) => Number.isInteger(v) && v >= 0 && v < n && v !== i);
    if (!isValid) {
      callback({ ok: false, error: 'Ungültige Reihenfolge' });
      return;
    }

    room.phase = 'answer';
    room.game.shuffledIndices = shuffledIndices;
    room.game.answerPrompt = String(answerPrompt ?? '');
    room.game.responses = Array(n).fill(null);
    room.game.responseSubmitted = Array(n).fill(false);

    // Wer das Spiel schon verlassen hat, kommentiert nichts
    room.players.forEach((p, i) => {
      if (p.left) {
        room.game.responses[i] = '';
        room.game.responseSubmitted[i] = true;
      }
    });

    startPhaseTimer(room, ANSWER_INTRO_MS, finishAnswerPhase);

    console.log(`Raum ${room.code}: Antwortphase gestartet`);
    callback({ ok: true });
    io.to(room.code).emit('answerPhaseStarted', gameStateFor(room));

    if (room.game.responseSubmitted.every(Boolean)) finishAnswerPhase(room);
  });

  // Ein Spieler schickt seinen Kommentar zur zugelosten Antwort
  socket.on('submitResponse', ({ response } = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || !room.game) {
      callback({ ok: false, error: 'Du bist in keinem laufenden Spiel' });
      return;
    }
    if (room.phase !== 'answer') {
      callback({ ok: false, error: 'Gerade werden keine Kommentare angenommen' });
      return;
    }
    const index = room.players.findIndex((p) => p.id === socket.id);
    if (index === -1) {
      callback({ ok: false, error: 'Du bist nicht in diesem Raum' });
      return;
    }
    if (room.game.responseSubmitted[index]) {
      callback({ ok: true });
      return;
    }

    callback({ ok: true });
    recordResponse(room, index, response);
  });

  socket.on('nextRound', (data = {}, callback = () => {}) => {
    return;
    //TODO: nächste Runde beginnen
  });

});

// WICHTIG: server.listen statt app.listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});