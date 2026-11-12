const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);   // Express in einen HTTP-Server packen
const io = new Server(server, {
  cors: { origin: '*' },                 // nur für die Web-Version nötig
});
const PORT = 3000;
let connectionCount = 0;
const MIN_PLAYERS = 3;

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

function removePlayerFromRoom(socket) {
  // 1. In welchem Raum ist dieser Spieler? Steht auf dem Merkzettel
  const code = socket.data.roomCode;
  if (!code) return;                  // in keinem Raum: nichts zu tun

  const room = rooms.get(code);
  if (!room) return;                  // Raum gibt es nicht mehr

  // 2. Spieler aus der Liste entfernen
  room.players = room.players.filter((p) => p.id !== socket.id);

  // 3. Aus dem Socket.IO-Raum nehmen und Merkzettel löschen
  socket.leave(code);
  socket.data.roomCode = null;

  console.log(`Spieler ${socket.id} hat Raum ${code} verlassen`);

  // 4. Raum leer? Dann löschen
  if (room.players.length === 0) {
    rooms.delete(code);
    console.log(`Raum ${code} gelöscht`);
    return;
  }

  // 5. Wenn der Host geht dann direkt Raum löschen
  if (room.hostId === socket.id) {
    io.to(code).emit('roomClosed');     // allen Bescheid geben
    io.in(code).socketsLeave(code);     // alle aus dem Socket.IO-Raum nehmen
    rooms.delete(code);
    return;
  }

  // 6. Sonst: den Übrigen die neue Spielerliste schicken
  io.to(code).emit('roomUpdate', room);
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
  res.json([...rooms.values()]);
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
    const room = {
      code,
      hostId: socket.id,
      phase: 'lobby',
      players: [
        { id: socket.id, name: trimmedName, color: COLORS[0], isHost: true },
      ],
    };
    rooms.set(code, room);

    // 3. Dieses Gerät in den Socket.IO-Raum aufnehmen
    socket.join(code);
    socket.data.roomCode = code;

    console.log(`Raum ${code} erstellt von ${trimmedName}`);

    // 4. Dem Ersteller antworten und dem Raum den aktuellen Stand schicken
    callback({ ok: true, code });
    io.to(code).emit('roomUpdate', room);
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

    socket.join(trimmedCode);
    socket.data.roomCode = trimmedCode;
    room.players.push({
      name: trimmedName,
      id: id,
      color: freeColor,
      isHost: false,  
    });
    console.log(`${trimmedName} ist Raum ${trimmedCode} beigetreten`);

    callback({ ok: true, code: trimmedCode });
    io.to(trimmedCode).emit('roomUpdate', room);
  });

  socket.on('disconnect', () => {
    console.log('Getrennt:', socket.id);
    connectionCount--;
    io.emit('playerCount', connectionCount);
    removePlayerFromRoom(socket);
  });

  socket.on('leaveRoom', () => {
    removePlayerFromRoom(socket);
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
    io.to(room.code).emit('roomUpdate', room);
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
    console.log(`Spiel in Raum ${room.code} gestartet`);

    //An alle Geräte in diesem Raum weiterleiten, inkl. Spielerliste für die Index-Zuordnung
    callback({ ok: true });
    io.to(room.code).emit('gameStarted', { phase: room.phase, ...room.game, players: room.players });
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

    room.game.answers[index] = String(answer ?? '').slice(0, 100);
    room.game.facebookOptions[index] = Number.isInteger(facebookOption) ? facebookOption : null;
    room.game.submitted[index] = true;
    callback({ ok: true });
    console.log(`Raum ${room.code}: Antwort von ${room.players[index].name}`);

    // Alle fertig? Dann allen Geräten die gesammelten Antworten schicken
    if (room.game.submitted.every(Boolean)) {
      room.phase = 'answer';

      // Facebook: Bild-Key der gewählten Option je Spieler (ohne Auswahl die erste)
      const facebookImages = room.game.answers.map((_, i) => {
        const options = room.game.facebookQuestions[i]?.options || [];
        return options[room.game.facebookOptions[i] ?? 0]?.image ?? null;
      });

      io.to(room.code).emit('allAnswersSubmitted', {
        answers: room.game.answers,
        facebookImages,
      });
    }
  });

});

// WICHTIG: server.listen statt app.listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});