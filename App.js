import React, { use, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

import { COLOR_OPTIONS } from './src/constants/colors';
import MainScreen from './src/screens/MainScreen';
import OptionsScreen from './src/screens/OptionsScreen';
import GameSettingsScreen from './src/screens/GameSettingsScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';
import GameScreen from './src/screens/GameScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';

export default function App() {
  // Screen Steuerung: 'main', 'options', oder 'game'
  const [currentScreen, setCurrentScreen] = useState('main');
  const [volume, setVolume] = useState(80);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [duration, setDuration] = useState(60);
  const [playerCount, setPlayerCount] = useState(3);
  // Logik für Spieler Setup
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerName, setPlayerName] = useState(`Spieler ${currentPlayerIndex + 1}`);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isOnline, setOnlineStatus] = useState(false);
  //Logik für Antwort Setup
  const [firstAnswers, setFirstAnswer] = useState([]);
  const [textValue, setTextValue] = useState('');

  const resetPlayerSetup = () => {
    setPlayerCount(3);
    setCurrentPlayerIndex(0);
    setPlayerName(`Spieler ${currentPlayerIndex + 1}`);
    setSelectedColor(COLOR_OPTIONS[0]);
    setPlayers([]);
  }

  const handleNextPlayer = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      name: playerName.trim() || `Spieler ${currentPlayerIndex + 1}`,
      color: selectedColor,
    };
    setPlayers(updatedPlayers);

  if (currentPlayerIndex < playerCount - 1) {
    const nextIndex = currentPlayerIndex + 1;
    setCurrentPlayerIndex(nextIndex);
    setPlayerName(`Spieler ${nextIndex + 1}`);

    const usedColors = updatedPlayers.slice(0, nextIndex).map((p) => p.color);
    const nextFreeColor = COLOR_OPTIONS.find((c) => !usedColors.includes(c)) || COLOR_OPTIONS[0];

    setSelectedColor(nextFreeColor);
    }
    else {

      setCurrentPlayerIndex(0);
      setCurrentScreen('game')
    }
  }

  const handlePrevPlayer = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      name: playerName.trim() || `Spieler ${currentPlayerIndex + 1}`,
      color: selectedColor,
    };
    setPlayers(updatedPlayers);

    if (currentPlayerIndex > 0) {
      const prevIndex = currentPlayerIndex - 1;
      setCurrentPlayerIndex(prevIndex);
      const prevPlayer = updatedPlayers[prevIndex];
      setPlayerName(prevPlayer.name);
      setSelectedColor(prevPlayer.color);
    } else {

      setCurrentPlayerIndex(0);
      setCurrentScreen('gameSettings');
    }
  }

  const nextQuestion = () => {
    const updatedAnswers = [...firstAnswers, textValue];
    setFirstAnswer(updatedAnswers);
    
    setTextValue('');

    if (currentPlayerIndex < playerCount - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
        setCurrentPlayerIndex(0);
        setCurrentScreen('main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* HINTERGRUND-VIDEO */}
      <Video
        source={ 
          require('./assets/background2.mp4') 
        }
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* ABDUNKELNDES OVERLAY (für bessere Lesbarkeit des Menüs) */}
      <View style={styles.videoOverlay} />

      <View style={styles.screenContainer}>
        {currentScreen === 'main' && (
          <MainScreen
            local={() => {
              setCurrentScreen('gameSettings');
              setOnlineStatus(false);
            }}
            online={() => {
              setCurrentScreen('gameSettings');
              setOnlineStatus(true);
            }}
            options={() => setCurrentScreen('options')}
          />
        )}

        {currentScreen === 'options' && (
          <OptionsScreen 
            volume={volume} setVolume={setVolume}
            soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
            onBack={() => {
              resetPlayerSetup();
              setCurrentScreen('main');
            }}
          />
        )}

        {currentScreen === 'playerSetup' && (
          <PlayerSetupScreen
            currentPlayerIndex={currentPlayerIndex}
            playerCount={playerCount}
            playerName={playerName}
            setPlayerName={setPlayerName}
            players={players}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            onNext={handleNextPlayer}
            onPrev={handlePrevPlayer}
          />
        )}

        {currentScreen === 'gameSettings' && (
          <GameSettingsScreen
            isOnline={isOnline}
            duration={duration}
            setDuration={setDuration}
            playerCount={playerCount}
            setPlayerCount={setPlayerCount}
            onNextCreate={() => {}}
            onNextJoin={() => {}}
            onNext={() => setCurrentScreen('playerSetup')}
            onBack={() => {
              resetPlayerSetup();
              setCurrentScreen('main');
            }}

          />
        )}

        {currentScreen === 'game' && (
            <GameScreen
                onBack={() => {
                    resetPlayerSetup();
                    setCurrentScreen('main');
                }}
                duration={duration}
                players={players}
                playerCount={playerCount}
                currentPlayerIndex={currentPlayerIndex}
                onNext={nextQuestion} // Ruft die korrigierte Funktion auf
                textValue={textValue}
                setTextValue={setTextValue}
            />
        )}

        {/* Weitere Screens hier rendern... */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ 
    flex: 1, 
    backgroundColor: 
    '#3799d1' 
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)' 
  },
  screenContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
});