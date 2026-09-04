import React, {useState } from 'react';
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
import { VideoView, useVideoPlayer } from 'expo-video';
 
import { COLOR_OPTIONS, COLOR_IMAGES } from './src/constants/colors';
import MainScreen from './src/screens/MainScreen';
import OptionsScreen from './src/screens/OptionsScreen';
import GameSettingsScreen from './src/screens/GameSettingsScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';
import GameScreen from './src/screens/GameScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import { QUESTIONS, ROUND_TYPE } from './src/constants/questions';
import GameTransitionScreen from './src/screens/GameTransitionScreen';
import AnswerScreen from './src/screens/AnswerScreen';
import EvaluationScreen from './src/screens/EvaluationScreen';
 
export default function App() {
  // Screen Steuerung: 'main', 'options', oder 'game'
  const [currentScreen, setCurrentScreen] = useState('evaluation');
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
  const [secoundAnswers, setSecondAnswer] = useState([]);
  const [textValue, setTextValue] = useState('');
 
  const [gameRounds, setGameRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
 
  const currentType = gameRounds[currentRoundIndex];
  const currentRoundObj = QUESTIONS.find((q) => q.type === currentType);
  const currentCategoryName = currentRoundObj?.categoryName || 'Nächste Runde';
  const [currentQuestions, setCurrentQuestions ] = useState([]);

  const [answerText, setAnswerText] = useState('');
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  const currentLogo = currentRoundObj?.logo;
  const colorIndex = COLOR_OPTIONS.indexOf(selectedColor);


  //Test Modus
  const TEST_MODE = true;
  const TEST_SCREEN = 'evaluation';

  React.useEffect(() => {
    if (!TEST_MODE) return;

    const testPlayers = [
        {
            name: 'Spieler 1',
            color: COLOR_OPTIONS[0],
            image: COLOR_IMAGES[0],
        },
        {
            name: 'Spieler 2',
            color: COLOR_OPTIONS[1],
            image: COLOR_IMAGES[1],
        },
        {
            name: 'Spieler 3',
            color: COLOR_OPTIONS[2],
            image: COLOR_IMAGES[2],
        },
    ];

    const testRound = ROUND_TYPE.GOOGLE_MAPS;

    setPlayers(testPlayers);
    setPlayerCount(3);
    setCurrentPlayerIndex(0);

    setGameRounds([testRound]);
    setCurrentRoundIndex(0);

    setCurrentQuestions(
        generateQuestions(testRound, 3)
    );

    setFirstAnswer([
        'Voll langweilig, bin fast eingeschlafen',
        'Der Service war absolut katastrophal.',
        'Ich würde hier nie wieder hingehen.'
    ]);

    setSecondAnswer([
        'Pik Dame',
        'Geht so',
        'Ne man lass lieber'
    ]);

    setCurrentScreen(TEST_SCREEN);

  }, []);

  //Test Modus ende
  
  const player = useVideoPlayer(
    require('./assets/background2_fixed.mp4'),
    player => {
      player.loop = true;
    }
  );
 
  React.useEffect(() => {
    player.play();
  }, [player]);
    
  const resetPlayerSetup = () => {
    setPlayerCount(3);
    setCurrentPlayerIndex(0);
    setPlayerName(`Spieler 1`);
    setSelectedColor(COLOR_OPTIONS[0]);
    setPlayers([]);
    setFirstAnswer([]);
    setShuffledAnswers([]);
    setTextValue('');
    setAnswerText('');
  }
 
  const handleNextPlayer = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      name: playerName.trim() || `Spieler ${currentPlayerIndex + 1}`,
      color: selectedColor,
      image: COLOR_IMAGES[colorIndex],
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
      const rounds = generateGameRounds(5);
      setGameRounds(rounds);
      setCurrentRoundIndex(0);
      setCurrentPlayerIndex(0);
 
      const firstRoundQuestion = generateQuestions(rounds[0], playerCount);
      setCurrentQuestions(firstRoundQuestion);
 
      setCurrentScreen('transition');
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
 
  const handleNextRound = () => {
    const nextIndex = currentRoundIndex + 1;
    if (nextIndex < gameRounds.length){
      setCurrentRoundIndex(nextIndex);
      setCurrentPlayerIndex(0);
 
      const nextRoundType = gameRounds[nextIndex];
      const nextQuestions = generateQuestions(nextRoundType, playerCount);
      setCurrentQuestions(nextQuestions);

      setTextValue('');
      setFirstAnswer([]);
      setShuffledAnswers([]);
 
      setCurrentScreen('transition');
    } else {
      setCurrentScreen('main');
      setCurrentRoundIndex(0);
      setCurrentPlayerIndex(0);
      //später results
    }
  }
 
  const generateGameRounds = (count = 5) => {
    const allTypes = Object.values(ROUND_TYPE);
    const shuffledTypes = shuffleArray(allTypes);
    return shuffledTypes.slice(0, count);
  }
 
  const generateQuestions = (roundType, count = playerCount) => {
    const roundObj = QUESTIONS.find((q) => q.type === roundType);
 
    const availableQuestions = roundObj?.questions || [];
    const shuffledQuestions = shuffleArray(availableQuestions);
 
    return shuffledQuestions.slice(0, count);
 
  }
 
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for(let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const shuffleAnswers = (array) => {
    let answerCpy;

    do {
        answerCpy = shuffleArray(array);
    } while (answerCpy.some((answer, index) => answer === array[index]));

    return answerCpy;
  };

 
  const nextQuestion = () => {
    const updatedAnswers = [...firstAnswers, textValue];
    setFirstAnswer(updatedAnswers);
    setTextValue('');
 
    if (currentPlayerIndex < playerCount - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setShuffledAnswers(shuffleAnswers(updatedAnswers));

      setCurrentPlayerIndex(0);
      setCurrentScreen('answer');
    }
  };

  const nextAnswer = () => {
    const updatedResponses = [...secoundAnswers, answerText];
    setSecondAnswer(updatedResponses);
    setAnswerText('');
    
    if (currentPlayerIndex < playerCount - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      
      setCurrentPlayerIndex(0);
      setCurrentScreen('evaluation');
    }
  }

  const nextEvaluation = () => {
      if(currentPlayerIndex < playerCount - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
      } else {
        handleNextRound();
      }
  }
  
 
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
 
      <View style={styles.videoOverlay} />
      
      {currentScreen === 'evaluation' && (
        <EvaluationScreen
          players = {players}
          playerCount = {playerCount}
          currentPlayerIndex = {currentPlayerIndex}
          onNext = {nextEvaluation}
          answers = {firstAnswers}
          questions = {secoundAnswers}
          currentLogo={currentLogo}
          primaryColor={currentRoundObj?.color[0]}
          secondaryColor={currentRoundObj?.color[1]}
          textColor={currentRoundObj?.color[2]}
          gameMode={currentRoundObj?.categoryName}
        />
      )}

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
                onNext={nextQuestion}
                textValue={textValue}
                setTextValue={setTextValue}
                currentQuestion={currentQuestions[currentPlayerIndex]}
            />
        )}

        {currentScreen === 'answer' && (
          <AnswerScreen
            onBack={() => {
              resetPlayerSetup();
              setCurrentScreen('main');
            }}
            players = {players}
            playerCount = {playerCount}
            duration = {duration}
            currentPlayerIndex={currentPlayerIndex}
            answerText={answerText}
            setAnswerText={setAnswerText}
            shuffledAnswers={shuffledAnswers}
            onNext={nextAnswer}
            answerPrompt={currentRoundObj?.answer?.[0]}
          />
        )}
 
        {currentScreen === 'transition' && (
            <GameTransitionScreen 
                onFinish={() => setCurrentScreen('game')}
                roundName={currentCategoryName} 
            />
        )}
 
      </View>
    </SafeAreaView>
  );

}
 
const styles = StyleSheet.create({
  container:{ 
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#3799d1', 
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  screenContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
});