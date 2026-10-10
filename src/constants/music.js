import { createAudioPlayer } from 'expo-audio';

const tracks = {
  mainMenu: createAudioPlayer(require('../../assets/backgroundSoundIntro.mp3')),
};

Object.values(tracks).forEach((p) => {
  p.loop = true;
});

let enabled = true;
let volume = 0.8;
let currentName = null;

const pauseAll = () => {
  Object.values(tracks).forEach((p) => p.pause());
};

export const playMusic = (name) => {
  // Läuft schon dieser Song? Dann nichts neu starten
  if (name === currentName && tracks[name]?.playing) return;

  currentName = name;
  pauseAll();

  const player = tracks[name];
  if (!player || !enabled) return;

  player.volume = volume;
  player.play();
};

export const stopMusic = () => {
  currentName = null;
  pauseAll();
};

export const applyMusicEnabled = (value) => {
  enabled = value;
  if (!value) {
    pauseAll();
  } else if (currentName) {
    const player = tracks[currentName];
    player.volume = volume;
    player.play();
  }
};

export const setMusicVolume = (value) => {
  volume = Math.min(1, Math.max(0, value)); // 0.0 bis 1.0
  Object.values(tracks).forEach((p) => {
    p.volume = volume;
  });
};