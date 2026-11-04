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

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // liefert die Test-Webseite aus

app.get('/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() });
});

app.post('/answer', (req, res) => {
  console.log('Neue Antwort:', req.body);
  res.json({ ok: true });
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

  socket.on('disconnect', () => {
    console.log('Getrennt:', socket.id);
    connectionCount--;
    io.emit('playerCount', connectionCount);
  });
});

// WICHTIG: server.listen statt app.listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});