import { setAudioModeAsync } from 'expo-audio';

// Audio-Modus nur hier einmal für die ganze App setzen
setAudioModeAsync({
  playsInSilentMode: true,
  interruptionMode: 'mixWithOthers',
  shouldPlayInBackground: false,
}).catch((e) => {
  console.warn('Audio-Modus konnte nicht gesetzt werden', e);
});

// Session bleibt aktiv, wenn ein Player pausiert oder fertig ist.
// Sonst muss iOS sie vor jedem Sound neu starten (Verzögerung) und unterbricht dabei das Video.
export const PLAYER_OPTIONS = { keepAudioSessionActive: true };
