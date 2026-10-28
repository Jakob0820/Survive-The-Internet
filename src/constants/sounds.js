import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { PLAYER_OPTIONS } from './audioSession';

const soundPlayers = {
    click: createAudioPlayer(require('../../assets/clickSound.mp3'), PLAYER_OPTIONS),
    stamp: createAudioPlayer(require('../../assets/punchSound.mp3'), PLAYER_OPTIONS),
    typing: createAudioPlayer(require('../../assets/typingSound.mp3'), PLAYER_OPTIONS),
    vote: createAudioPlayer(require('../../assets/voteSound.mp3'), PLAYER_OPTIONS),
    pop: createAudioPlayer(require('../../assets/popSound.mp3'), PLAYER_OPTIONS),
    count: createAudioPlayer(require('../../assets/countingSound.mp3'), PLAYER_OPTIONS),
    //weitere Sounds hier
};

let enabled = true;
let volume = 0.8;
let hapticsEnabled = true;

export const setHapticsEnabled = (value) => {
  hapticsEnabled = value;
};

// Kurzer Vibrationsimpuls, unabhängig davon ob Sounds an sind
const vibrate = (style) => {
  if (!hapticsEnabled) return;
  Haptics.impactAsync(style).catch((e) => {
    console.warn('Vibration konnte nicht ausgeführt werden', e);
  });
};

export const setSoundsMuted = (value) => {
  enabled = value;

  if (!value) {
    Object.values(soundPlayers).forEach((p) => p.pause());
  }
};

const play = async (player) => {
  if (!enabled) return;
  try {
    await player.seekTo(0);
    player.play();
  } catch (e) {
    console.warn('Sound konnte nicht abgespielt werden', e);
  }
};

export const stopSound = () => {
  Object.values(soundPlayers).forEach((p) => {
    try {
      p.pause();
    } catch (e) {
      console.warn('Sound konnte nicht gestoppt werden', e);
    }
  });
};

export const setSoundVolume = (value) => {
  volume = Math.min(1, Math.max(0, value)); // 0.0 bis 1.0
  Object.values(soundPlayers).forEach((p) => {
    p.volume = volume;
  });
};

export const playClickSound = () => {
  vibrate(Haptics.ImpactFeedbackStyle.Light);
  return play(soundPlayers.click);
};

// Feines Ticken bei jedem Schritt eines Sliders
export const playSliderHaptic = () => {
  if (!hapticsEnabled) return;
  Haptics.selectionAsync().catch((e) => {
    console.warn('Vibration konnte nicht ausgeführt werden', e);
  });
};
export const playStampSound = () => {
  vibrate(Haptics.ImpactFeedbackStyle.Heavy);
  return play(soundPlayers.stamp);
};
export const playTypingSound = () => play(soundPlayers.typing);
export const playVoteSound = () => {
  vibrate(Haptics.ImpactFeedbackStyle.Medium);
  return play(soundPlayers.vote);
};
export const playPopSound = () => {
  vibrate(Haptics.ImpactFeedbackStyle.Soft);
  return play(soundPlayers.pop);
};
export const playCountingSound = () => play(soundPlayers.count);
//weitere Sounds hier