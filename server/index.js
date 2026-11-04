const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() });
});

app.post('/answer', (req, res) => {
  console.log('Neue Antwort:', req.body);
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});