import Constants from 'expo-constants';

// Adresse des echten Servers (Platzhalter) – später eintragen
const PRODUCTION_URL = 'https://survive-the-internet.example.com';

// Beim Entwickeln: IP des Rechners, auf dem `expo start` läuft (z. B. "192.168.178.48:8081").
// Der Socket-Server muss dafür auf demselben Rechner laufen.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

// Reihenfolge:
// 1. EXPO_PUBLIC_SERVER_URL aus einer .env (z. B. um im Dev-Modus den echten Server zu testen)
// 2. Dev-Modus: lokaler Server auf dem Entwicklungsrechner
// 3. Release-Build: echter Server
export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ??
  (__DEV__ && devHost ? `http://${devHost}:3000` : PRODUCTION_URL);
