import { createAudioPlayer } from 'expo-audio';
import { PLAYER_OPTIONS } from './audioSession';

const tracks = {
  mainMenu: createAudioPlayer(require('../../assets/backgroundSoundIntro2.mp3'), PLAYER_OPTIONS),
  questionMenu: createAudioPlayer(require('../../assets/backgroundSoundQuestions.mp3'), PLAYER_OPTIONS),
  evaluationMenu: createAudioPlayer(require('../../assets/backgroundSoundEvaluation.mp3'), PLAYER_OPTIONS),
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
  player.seekTo(0);
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

let fadeTimer = null;
let fadeResolve = null;

const cancelFade = () => {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
  if (fadeResolve) {
    fadeResolve();
    fadeResolve = null;
  }
};

export const playFadeOut = (duration = 1) =>
  new Promise((resolve) => {
    cancelFade(); // laufenden Fade abbrechen

    const player = tracks[currentName];
    if (!player || !player.playing) {
      resolve();
      return;
    }

    fadeResolve = resolve;

    const startVolume = player.volume;
    const stepMs = 50;
    const steps = Math.max(1, Math.round((duration * 1000) / stepMs));
    let step = 0;

    fadeTimer = setInterval(() => {
      step += 1;
      player.volume = Math.max(0, startVolume * (1 - step / steps));

      if (step >= steps) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        player.pause();
        player.volume = volume; // Lautstärke für den nächsten Start zurücksetzen
        currentName = null;
        fadeResolve = null;
        resolve();
      }
    }, stepMs);
  });