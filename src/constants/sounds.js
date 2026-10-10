import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

setAudioModeAsync({ playsInSilentMode: true });

const soundPlayers = {
    click: createAudioPlayer(require('../../assets/clickSound.mp3')),
    stamp: createAudioPlayer(require('../../assets/punchSound.mp3')),
    typing: createAudioPlayer(require('../../assets/typingSound.mp3')),
    vote: createAudioPlayer(require('../../assets/voteSound.mp3')),
    //weitere Sounds hier
};

let enabled = true;
let volume = 0.8;

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

export const playClickSound = () => play(soundPlayers.click);
export const playStampSound = () => play(soundPlayers.stamp);
export const playTypingSound = () => play(soundPlayers.typing);
export const playVoteSound = () => play(soundPlayers.vote);
//weitere Sounds hier