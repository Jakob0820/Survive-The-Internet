import { io } from 'socket.io-client';
import { SERVER_URL } from './config';

export const socket = io(SERVER_URL, {
  transports: ['websocket'],
  autoConnect: false,   // erst verbinden, wenn jemand "Online" wählt
});

const REQUEST_TIMEOUT = 5000;

// Schickt eine Anfrage an den Server und wartet auf seine Antwort.
// Gibt immer ein Objekt zurück: die Antwort des Servers ({ ok: true, ... } oder { ok: false, error }),
// oder { ok: false, unreachable: true }, wenn keine Verbindung besteht bzw. nach 5 s keine Antwort kam.
export const request = (event, data = {}) =>
  new Promise((resolve) => {
    // Nicht verbunden: sofort melden, statt die Anfrage zu puffern
    if (!socket.connected) {
      resolve({ ok: false, unreachable: true });
      return;
    }
    socket.timeout(REQUEST_TIMEOUT).emit(event, data, (err, response) => {
      resolve(err ? { ok: false, unreachable: true } : response);
    });
  });
