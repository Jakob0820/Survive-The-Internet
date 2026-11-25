import React, {useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  AppState,
  Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
 
import { COLOR_OPTIONS, COLOR_IMAGES } from './src/constants/colors';
import MainScreen from './src/screens/MainScreen';
import OptionsScreen from './src/screens/OptionsScreen';
import GameSettingsScreen from './src/screens/GameSettingsScreen';
import GameSettingsScreenOnline from './src/screens/GameSettingsScreenOnline';
import RoomSettingsScreen from './src/screens/RoomSettingsScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';
import GameScreen from './src/screens/GameScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import { QUESTIONS, ROUND_TYPE, FACEBOOK_IMAGES, getLocalizedRound } from './src/constants/questions';
import { DEFAULT_LANGUAGE, LanguageContext, translate } from './src/constants/translations';
import GameTransitionScreen from './src/screens/GameTransitionScreen';
import AnswerScreen from './src/screens/AnswerScreen';
import EvaluationScreen from './src/screens/EvaluationScreen';
import { createFakeStats } from './src/constants/stats';
import ResultScreen from './src/screens/ResultScreen';
import EvaluationWaitingScreen from './src/screens/EvaluationWaitingScreen';
import { setSoundsMuted, setSoundVolume, setHapticsEnabled } from './src/constants/sounds';
import { playMusic, stopMusic, applyMusicEnabled, setMusicVolume } from './src/constants/music';
import { socket, request } from './src/constants/socket';
import {
  TEST_MODE, TEST_SCREEN, TEST_PLAYERS, TEST_PLAYER_COUNT, TEST_ROUNDS,
  TEST_VOTES, TEST_BURNS, TEST_FIRST_ANSWERS, TEST_RESPONSES,
} from './src/dev/testData';
 
// Feste Infos zu allen Rundentypen für die Einstellungs-Screens (ändern sich nie)
const ROUND_INFO = {
  roundColors: QUESTIONS.map((question) => question.color[0]),
  roundNames: QUESTIONS.map((question) => question.categoryName),
  roundLogos: QUESTIONS.map((question) => question.logo),
};

// Welche Musik auf welchem Screen läuft (Screens ohne Eintrag: keine Musik)
const SCREEN_MUSIC = {
  main: 'mainMenu',
  options: 'mainMenu',
  gameSettings: 'mainMenu',
  gameSettingsOnline: 'mainMenu',
  roomSettings: 'mainMenu',
  playerSetup: 'mainMenu',
  game: 'questionMenu',
  answer: 'questionMenu',
  evaluation: 'evaluationMenu',
};

export default function App() {
  // Sprache
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const t = useCallback((key, params) => translate(language, key, params), [language]);

  // Screen Steuerung
  const [currentScreen, setCurrentScreen] = useState('main');
  const [volume, setVolume] = useState(80);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [duration, setDuration] = useState(90);
  const [timerEndsAt, setTimerEndsAt] = useState(null); //Online: Wann läuft der Server timer ab
  const [playerCount, setPlayerCount] = useState(3);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Logik für Spieler Setup
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerName, setPlayerName] = useState(t('common.player', { number: currentPlayerIndex + 1 }));
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isOnline, setOnlineStatus] = useState(false);
  const [onlineName, setOnlineName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [joinMessage, setJoinMessage] = useState(''); // Übersetzungs-Key, z. B. 'room.closed'
  const [onlineAnswerSubmitted, setOnlineAnswerSubmitted] = useState(false); // Online: eigene Antwort abgeschickt
  const [onlineResponseSubmitted, setOnlineResponseSubmitted] = useState(false); // Online: eigener Kommentar abgeschickt

  //Logik für Antwort Setup
  const [firstAnswers, setFirstAnswers] = useState([]);
  const [secondAnswers, setSecondAnswers] = useState([]);
  const [textValue, setTextValue] = useState('');
 
  const [gameRounds, setGameRounds] = useState([]);
  const [randomRounds, setRandomRounds] = useState(true);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [roundLength, setRoundLength] = useState(5);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
 
  const currentType = gameRounds[currentRoundIndex];
  const currentRoundObj = getLocalizedRound(QUESTIONS.find((q) => q.type === currentType), language);
  const currentCategoryName = currentRoundObj?.categoryName || t('common.nextRound');
  const [currentQuestions, setCurrentQuestions ] = useState([]);

  // Facebook Modus: true, sobald die aktuelle Runde eine Facebook-Runde ist
  const isFacebookMode = currentType === ROUND_TYPE.FACEBOOK;

  // Facebook Runde: Fragen mit Antwortmöglichkeiten und daraus resultierende Bilder
  const [facebookQuestions, setFacebookQuestions] = useState([]);
  const [selectedFacebookOption, setSelectedFacebookOption] = useState(null);
  const [facebookImages, setFacebookImages] = useState([]);
  const [shuffledFacebookImages, setShuffledFacebookImages] = useState([]);

  const [answerText, setAnswerText] = useState('');
  const [shuffledFirstAnswers, setShuffledFirstAnswers] = useState([]);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [evaluationData, setEvaluationData] = useState([]);
  const [evaluationOrder, setEvaluationOrder] = useState([]);

  const currentLogo = currentRoundObj?.logo;
  const colorIndex = COLOR_OPTIONS.indexOf(selectedColor);

  const [voteCount, setVoteCount] = useState([]);
  const [burnCount, setBurnCount] = useState([]);
  const [previousPoints, setPreviousPoints] = useState([]);

  // Aktuelle Werte für die Socket-Listener, die nur einmal (mit []) registriert werden
  const latestRef = useRef({});
  latestRef.current = { language, players, currentType };

  // Gemeinsame Props der drei Einstellungs-Screens (lokal, online, Raum)
  const roundSettings = {
    ...ROUND_INFO,
    duration, setDuration,
    randomRounds, setRandomRounds,
    selectedRounds, setSelectedRounds,
    roundLength, setRoundLength,
  };

  // Fehlertext für eine fehlgeschlagene Server-Anfrage (siehe request in socket.js)
  const requestErrorText = (response) =>
    response.unreachable ? t('room.serverUnreachable') : response.error;

  const showRequestError = (response) => {
    Alert.alert(t('room.error'), requestErrorText(response));
  };


  // Die Optionen sind nur vom Hauptmenü aus erreichbar, also läuft beim Wechsel kein Spiel
  const languageContext = useMemo(() => ({
    language,
    t,
    setLanguage: (nextLanguage) => {
      setLanguage(nextLanguage);
      setPlayerName(translate(nextLanguage, 'common.player', { number: 1 }));
    },
  }), [language, t]);

  // Test-Modus: springt mit Testdaten direkt in einen Screen (Daten in src/dev/testData.js)
  useEffect(() => {
    if (!TEST_MODE) return;

    setPlayers(TEST_PLAYERS);
    setPlayerCount(TEST_PLAYER_COUNT);
    setCurrentPlayerIndex(0);

    setVoteCount(TEST_VOTES);
    setBurnCount(TEST_BURNS);

    setGameRounds(TEST_ROUNDS);
    setCurrentRoundIndex(0);
    setupRoundQuestions(TEST_ROUNDS[0], TEST_PLAYER_COUNT);

    setShuffledFirstAnswers(TEST_FIRST_ANSWERS);
    setSecondAnswers(TEST_RESPONSES);

    setEvaluationData(TEST_FIRST_ANSWERS.map((originalAnswer, i) => ({
      originalIndex: i,
      originalAnswer,
      response: TEST_RESPONSES[i],
      stats: createFakeStats(),
    })));
    setEvaluationOrder(shuffleArray(TEST_FIRST_ANSWERS.map((_, i) => i)));

    setCurrentScreen(TEST_SCREEN);
  }, []);
  
  const player = useVideoPlayer(
    require('./assets/background2_fixed.mp4'),
    (p) => {
      p.loop = true;
      p.muted = true;
      p.audioMixingMode = 'mixWithOthers';
    }
  );

  useEffect(() => {
    player.play();

    // Nach Rückkehr in die App weiterspielen
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') player.play();
    });

    // Falls der Player von außen pausiert wird: wieder starten
    const playSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (!isPlaying && AppState.currentState === 'active') {
        setTimeout(() => player.play(), 100);
      }
    });

    // Fehler sichtbar machen
    const statusSub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') console.warn('Video-Fehler:', error);
    });

    return () => {
      appSub.remove();
      playSub.remove();
      statusSub.remove();
    };
  }, [player]);

  useEffect(() => {
    const track = SCREEN_MUSIC[currentScreen];
    if (track) playMusic(track);
    else stopMusic();
  }, [currentScreen]);

  useEffect(() => {
    applyMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    setSoundsMuted(soundEnabled);
  }, [soundEnabled])

  useEffect(() => {
    setHapticsEnabled(vibrationEnabled);
  }, [vibrationEnabled]);

  useEffect(() => {
    setMusicVolume(volume / 100);
    setSoundVolume(volume / 100);
  }, [volume]);

  //Raum aktualisiert sich von automatisch sobald jemand beitritt
  useEffect(() => {
    const handleRoomUpdate = (room) => {
      setRoomPlayers(room.players);
    };

    // Host hat den Raum geschlossen: zurück zum Beitreten-Dialog mit Hinweis
    const handleRoomClosed = () => {
      setRoomPlayers([]);
      setRoomCode('');
      setJoinMessage('room.closed');
      setCurrentScreen('gameSettingsOnline');
    };

    socket.on('roomUpdate', handleRoomUpdate);
    socket.on('roomClosed', handleRoomClosed);
    return () => {
      socket.off('roomUpdate', handleRoomUpdate);
      socket.off('roomClosed', handleRoomClosed);
    };
  }, []);

  useEffect(() => {
    // Kommt auf allen Geräten im Raum an. Die Runden und Fragen hat der Host
    // bereits gemischt, hier wird nur übernommen (nur Setter, daher reicht [] als Abhängigkeit).
    const handleGameStarted = (data) => {
      // Spieler wie im Offline-Modus aufbauen; das Bild ergibt sich aus der Farbe
      const gamePlayers = data.players.map((p) => ({
        ...p,
        image: COLOR_IMAGES[COLOR_OPTIONS.indexOf(p.color)],
      }));

      setPlayers(gamePlayers);
      setPlayerCount(gamePlayers.length);
      // Eigener Index
      setCurrentPlayerIndex(gamePlayers.findIndex((p) => p.id === socket.id));

      setGameRounds(data.rounds);
      setCurrentRoundIndex(0);
      setVoteCount(Array(gamePlayers.length).fill(0));
      setBurnCount(Array(gamePlayers.length).fill(0));

      setSelectedFacebookOption(null);
      setFacebookImages([]);
      setShuffledFacebookImages([]);
      setFacebookQuestions(data.facebookQuestions);
      setCurrentQuestions(data.questions);

      setFirstAnswers([]);
      setOnlineAnswerSubmitted(false);

      setDuration(data.duration);
      setTimerEndsAt(data.timeLeftMs ? Date.now() + data.timeLeftMs : null);
      setCurrentScreen('transition');
    }

    // Alle Spieler haben geantwortet (oder ihr Timer ist abgelaufen). Der Server schickt
    // alle Antworten in Spieler-Reihenfolge: answers[i] stammt von players[i].
    // Nur der Host mischt sie (wie im lokalen Modus) und schickt die Reihenfolge an den Server.
    const handleAllAnswersSubmitted = async (data) => {
      setFirstAnswers(data.answers);
      setFacebookImages(data.facebookImages.map((key) => (key ? FACEBOOK_IMAGES[key] : null)));

      console.log('Kommentare:', data.answers);

      const { language, players, currentType } = latestRef.current;
      const isHost = players.find((p) => p.id === socket.id)?.isHost;
      if (!isHost) return;

      const shuffledIndices = shuffleAnswers(data.answers.map((_, i) => i));
      // Der Antworttext kommt vom Host, damit ihn auch die Web-Version anzeigen kann
      const round = getLocalizedRound(QUESTIONS.find((q) => q.type === currentType), language);
      const response = await request('startAnswerPhase', {
        shuffledIndices,
        answerPrompt: round?.answer?.[0] ?? '',
      });
      if (!response.ok) {
        Alert.alert(
          translate(language, 'room.error'),
          response.unreachable ? translate(language, 'room.serverUnreachable') : response.error,
        );
      }
    }

    // Der Server hat die gemischte Reihenfolge verteilt: alle wechseln zum AnswerScreen.
    // Spieler i kommentiert die Antwort von Spieler shuffledIndices[i].
    const handleAnswerPhaseStarted = (data) => {
      const images = (data.facebookImages || []).map((key) => (key ? FACEBOOK_IMAGES[key] : null));
      const isFacebookRound = data.rounds[data.roundIndex] === ROUND_TYPE.FACEBOOK;

      setFirstAnswers(data.answers);
      setFacebookImages(images);
      setShuffledIndices(data.shuffledIndices);
      setShuffledFirstAnswers(data.shuffledIndices.map((i) => data.answers[i]));
      setShuffledFacebookImages(isFacebookRound ? data.shuffledIndices.map((i) => images[i]) : []);

      setAnswerText('');
      setOnlineResponseSubmitted(false);
      setTimerEndsAt(data.timeLeftMs != null ? Date.now() + data.timeLeftMs : null);
      setCurrentScreen('answer');
    }

    // Alle Kommentare sind da: responses[i] stammt von players[i] (gleiche Reihenfolge wie lokal secondAnswers)
    const handleAllResponsesSubmitted = (data) => {
      setSecondAnswers(data.responses);
      
      const { players } = latestRef.current;
      const isHost = players.find((p) => p.id === socket.id)?.isHost;

      if (!isHost) {
        setCurrentScreen('evaluationWaiting');
        return;
      }
      
      const combined = data.shuffledIndices.map((originalIndex, i) => ({
        originalIndex,
        originalAnswer: data.answers[originalIndex],
        response: data.responses[i],
        stats: createFakeStats(),
        image: data.isFacebookRound ? (FACEBOOK_IMAGES[data.facebookImages[originalIndex]] ?? null) : null,
      }));

      setEvaluationData(combined);

      const order = shuffleArray(combined.map((_, i) => i));
      setEvaluationOrder(order);
      setCurrentPlayerIndex(0);
      setIsEvaluating(true);
      setCurrentScreen('transition');
    }

    //Hier werden die Antworten von Server gehandled
    socket.on('gameStarted', handleGameStarted);
    socket.on('allAnswersSubmitted', handleAllAnswersSubmitted);
    socket.on('answerPhaseStarted', handleAnswerPhaseStarted);
    socket.on('allResponsesSubmitted', handleAllResponsesSubmitted);
    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('allAnswersSubmitted', handleAllAnswersSubmitted);
      socket.off('answerPhaseStarted', handleAnswerPhaseStarted);
      socket.off('allResponsesSubmitted', handleAllResponsesSubmitted);
    }
  }, []);
    
  // Antworten und Auswertung der aktuellen Runde leeren (vor jeder neuen Runde)
  const resetRoundState = () => {
    setFirstAnswers([]);
    setShuffledFirstAnswers([]);
    setSecondAnswers([]);
    setTextValue('');
    setAnswerText('');
    setShuffledIndices([]);
    setEvaluationOrder([]);
    setEvaluationData([]);
    setIsEvaluating(false);
  }

  // Zurück ins Hauptmenü: alles vom letzten Spiel verwerfen
  const resetPlayerSetup = () => {
    resetRoundState();
    setPlayerCount(3);
    setCurrentPlayerIndex(0);
    setCurrentRoundIndex(0);
    setPlayerName(t('common.player', { number: 1 }));
    setSelectedColor(COLOR_OPTIONS[0]);
    setPlayers([]);
    setVoteCount([]);
    setBurnCount([]);
    setPreviousPoints([]);
    setFacebookQuestions([]);
    setSelectedFacebookOption(null);
    setFacebookImages([]);
    setShuffledFacebookImages([]);
  }

  // Neues Spiel mit denselben Spielern: Runden auslosen, Punkte auf 0, erste Runde starten
  const startNewGame = () => {
    const rounds = generateGameRounds(roundLength);
    setGameRounds(rounds);
    setCurrentRoundIndex(0);
    setCurrentPlayerIndex(0);
    setVoteCount(Array(playerCount).fill(0));
    setBurnCount(Array(playerCount).fill(0));
    setPreviousPoints([]);

    setupRoundQuestions(rounds[0], playerCount);

    setCurrentScreen('transition');
  }
 
  const handleNextPlayer = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      name: playerName.trim() || t('common.player', { number: currentPlayerIndex + 1 }),
      color: selectedColor,
      image: COLOR_IMAGES[colorIndex],
    };
    setPlayers(updatedPlayers);
 
  if (currentPlayerIndex < playerCount - 1) {
    const nextIndex = currentPlayerIndex + 1;
    setCurrentPlayerIndex(nextIndex);
    setPlayerName(t('common.player', { number: nextIndex + 1 }));
 
    const usedColors = updatedPlayers.slice(0, nextIndex).map((p) => p.color);
    const nextFreeColor = COLOR_OPTIONS.find((c) => !usedColors.includes(c)) || COLOR_OPTIONS[0];
 
    setSelectedColor(nextFreeColor);
    }
    else {
      startNewGame();
    }
  }
 
  const handlePrevPlayer = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      name: playerName.trim() || t('common.player', { number: currentPlayerIndex + 1 }),
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
    resetRoundState();

    const nextIndex = currentRoundIndex + 1;
    // Letzte Runde vorbei: neues Spiel mit denselben Spielern
    if (nextIndex >= gameRounds.length) {
      startNewGame();
      return;
    }

    setPreviousPoints(
      players.map((_, i) => (voteCount[i] ?? 0) * 80 + (burnCount[i] ?? 0) * 30)
    );
    setCurrentRoundIndex(nextIndex);
    setCurrentPlayerIndex(0);
    setupRoundQuestions(gameRounds[nextIndex], playerCount);
    socket.emit('nextRound');

    setCurrentScreen('transition');
  }
 
  const generateGameRounds = (count) => {
    // Ohne gespeicherte manuelle Auswahl auf zufällige Runden ausweichen
    if(randomRounds || selectedRounds.length === 0){
      const allTypes = Object.values(ROUND_TYPE);
      const shuffledTypes = shuffleArray(allTypes);
      return shuffledTypes.slice(0, count);
    }
    else {
      return selectedRounds.map((index) => QUESTIONS[index].type);
    }
  }
 
  const generateQuestions = (roundType, count = playerCount) => {
    const roundObj = getLocalizedRound(QUESTIONS.find((q) => q.type === roundType), language);
 
    const availableQuestions = roundObj?.questions || [];
    const shuffledQuestions = shuffleArray(availableQuestions);
 
    return shuffledQuestions.slice(0, count);
 
  }

  // Mischt die Facebook-Fragen (inkl. Antwortmöglichkeiten). Gibt es weniger Fragen
  // als Spieler, werden sie der Reihe nach wiederholt.
  const generateFacebookQuestions = (count = playerCount) => {
    const roundObj = getLocalizedRound(QUESTIONS.find((q) => q.type === ROUND_TYPE.FACEBOOK), language);
    const shuffledQuestions = shuffleArray(roundObj?.questions || []);
    if (shuffledQuestions.length === 0) return [];

    return Array.from({ length: count }, (_, i) => shuffledQuestions[i % shuffledQuestions.length]);
  }

  // Erzeugt die gemischten Fragen für eine Runde, ohne State zu setzen.
  // Online schickt der Host das Ergebnis an den Server, der es an alle verteilt.
  const buildRoundQuestions = (roundType, count = playerCount) => {
    if (roundType === ROUND_TYPE.FACEBOOK) {
      const fbQuestions = generateFacebookQuestions(count);
      return { questions: fbQuestions.map((q) => q.question), facebookQuestions: fbQuestions };
    }
    return { questions: generateQuestions(roundType, count), facebookQuestions: [] };
  }

  // Setzt die Fragen für eine Runde; in der Facebook-Runde zusätzlich die Antwortmöglichkeiten
  const setupRoundQuestions = (roundType, count = playerCount) => {
    setSelectedFacebookOption(null);
    setFacebookImages([]);
    setShuffledFacebookImages([]);

    const { questions, facebookQuestions } = buildRoundQuestions(roundType, count);
    setFacebookQuestions(facebookQuestions);
    setCurrentQuestions(questions);
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
    setFirstAnswers(updatedAnswers);
    setTextValue('');

    // Facebook: Bild anhand der gewählten Antwort festlegen (ohne Auswahl, z.B. Timer abgelaufen: erste Option)
    let updatedImages = facebookImages;
    if (isFacebookMode) {
      const options = facebookQuestions[currentPlayerIndex]?.options || [];
      const chosenOption = options[selectedFacebookOption ?? 0];
      updatedImages = [...facebookImages, chosenOption ? FACEBOOK_IMAGES[chosenOption.image] : null];
      setFacebookImages(updatedImages);
      setSelectedFacebookOption(null);
    }

    if (currentPlayerIndex < playerCount - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      const indices = updatedAnswers.map((_, i) => i);
      const newShuffledIndices = shuffleAnswers(indices);

      setShuffledIndices(newShuffledIndices);
      setShuffledFirstAnswers(newShuffledIndices.map((i) => updatedAnswers[i]));
      setShuffledFacebookImages(isFacebookMode ? newShuffledIndices.map((i) => updatedImages[i]) : []);

      setCurrentPlayerIndex(0);
      setCurrentScreen('answer');
    }
  };

  // Online: eigene Antwort an den Server schicken; wird auch vom Timer aufgerufen
  const submitOnlineAnswer = async () => {
    if (onlineAnswerSubmitted) return; // schon abgeschickt (z. B. Timer läuft nach dem Klick ab)
    setOnlineAnswerSubmitted(true);

    const answer = textValue;
    const facebookOption = isFacebookMode ? (selectedFacebookOption ?? 0) : null;

    const response = await request('submitAnswer', { answer, facebookOption });
    if (!response.ok) {
      // Nicht angekommen: wieder bearbeitbar machen, damit man es erneut versuchen kann
      setOnlineAnswerSubmitted(false);
      showRequestError(response);
      return;
    }
    setTextValue('');
    setSelectedFacebookOption(null);
  };

  // Online: eigenen Kommentar an den Server schicken; wird auch vom Timer aufgerufen
  const submitOnlineResponse = async () => {
    if (onlineResponseSubmitted) return;
    setOnlineResponseSubmitted(true);

    const response = await request('submitResponse', { response: answerText });
    if (!response.ok) {
      setOnlineResponseSubmitted(false);
      showRequestError(response);
      return;
    }
    setAnswerText('');
  };

  const nextAnswer = () => {
    const updatedResponses = [...secondAnswers, answerText];
    setSecondAnswers(updatedResponses);
    setAnswerText('');

    if (currentPlayerIndex < playerCount - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      const combined = shuffledIndices.map((originalIndex, i) => ({
        originalIndex,
        originalAnswer: shuffledFirstAnswers[i],
        response: updatedResponses[i],
        stats: createFakeStats(),
        image: shuffledFacebookImages[i] ?? null, // Facebook: Bild des Spielers, der die erste Frage beantwortet hat
      }));

      setEvaluationData(combined);

      const order = shuffleArray(combined.map((_, i) => i));
      setEvaluationOrder(order);

      setCurrentPlayerIndex(0);
      setIsEvaluating(true);
      setCurrentScreen('transition');
    }
  };

  const nextEvaluation = () => {
    if (currentPlayerIndex < playerCount - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  }

  const previousEvaluation = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  }

  const handleVote = (entryIndex) => {
    const entry = evaluationData[entryIndex];
    const votedPlayer = entryIndex;
    const burner = entry.originalIndex;

    setVoteCount((prev) => prev.map((v, i) => (i === votedPlayer ? v + 1 : v)));
    setBurnCount((prev) => prev.map((v, i) => (i === burner ? v + 1 : v)));
  };

  const isLastRound = currentRoundIndex >= gameRounds.length - 1;
 
    return (
      <LanguageContext.Provider value={languageContext}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
        />

      {currentScreen === 'evaluation' && (
        <EvaluationScreen
          onShowResult={() => setCurrentScreen('result')}
          players = {players}
          playerCount = {playerCount}
          currentPlayerIndex = {currentPlayerIndex}
          onNext = {nextEvaluation}
          onPrev = {previousEvaluation}
          evaluationData = {evaluationData}
          evaluationOrder= {evaluationOrder}
          currentLogo={currentLogo}
          primaryColor={currentRoundObj?.color[0]}
          secondaryColor={currentRoundObj?.color[1]}
          tertiaryColor={currentRoundObj?.color[2]}
          gameMode={currentRoundObj?.categoryName}
          onVote={handleVote}
        />
      )}

      {currentScreen === 'result' && (
        <ResultScreen
          voteCount={voteCount}
          burnCount={burnCount}
          players={players}
          onNext={handleNextRound}
          isLastRound={isLastRound}
          onBack={() => {
            resetPlayerSetup();
            setCurrentScreen('main');            
          }}
          previousPoints={previousPoints}

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
              socket.connect();
              setCurrentScreen('gameSettingsOnline');
              setOnlineStatus(true);
            }}
            options={() => setCurrentScreen('options')}
          />
        )}
 
        {currentScreen === 'options' && (
          <OptionsScreen 
            volume={volume} setVolume={setVolume}
            soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
            musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled}
            vibrationEnabled={vibrationEnabled} setVibrationEnabled={setVibrationEnabled}
            onBack={() => {
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
            playerCount={playerCount}
            setPlayerCount={setPlayerCount}
            onNext={() => setCurrentScreen('playerSetup')}
            onBack={() => {
              resetPlayerSetup();
              setCurrentScreen('main');
            }}
            {...roundSettings}
          />
        )}

        {currentScreen === 'gameSettingsOnline' && (
          <GameSettingsScreenOnline
            onNextCreate={async () => {
              const response = await request('createRoom', { name: onlineName });
              if (!response.ok) {
                showRequestError(response);
                return;
              }
              setRoomCode(response.code);
              setCurrentScreen('roomSettings');
            }}

            // Gibt die Server-Antwort zurück, damit der RoomJoinScreen
            // eine Fehlermeldung direkt im Popup anzeigen kann
            onNextJoin={async () => {
              const response = await request('joinRoom', { code: roomCode, name: onlineName });
              if (!response.ok) {
                return { ok: false, error: requestErrorText(response) };
              }
              setJoinMessage('');
              setRoomCode(response.code);
              setCurrentScreen('roomSettings');
              return response;
            }}
            onBack={() => {
              setJoinMessage('');
              socket.disconnect();
              setOnlineStatus(false);
              setCurrentScreen('main');
            }}
            playerName={onlineName}
            setPlayerName={setOnlineName}
            {...roundSettings}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            joinMessage={joinMessage}
            clearJoinMessage={() => setJoinMessage('')}
          />
        )}
 
        {currentScreen === 'roomSettings' && (
          <RoomSettingsScreen
            players={roomPlayers}
            ownPlayerIndex={roomPlayers.findIndex((p) => p.id === socket.id)}
            onChangeColor={async (color) => {
              // Die Farbe wird erst angezeigt, wenn der Server sie per 'roomUpdate' bestätigt
              const response = await request('changeColor', { color });
              if (!response.ok) showRequestError(response);
            }}
            onStart={async () => {
              // Runden und Fragen nur einmal hier beim Host mischen; der Server verteilt sie an alle.
              // questions[i] gehört dem Spieler an Position i in der Spielerliste des Servers.
              const rounds = generateGameRounds(roundLength);
              const { questions, facebookQuestions } = buildRoundQuestions(rounds[0], roomPlayers.length);

              // Bei Erfolg wechselt der 'gameStarted'-Listener für alle den Screen
              const response = await request('startGame', { rounds, questions, facebookQuestions, duration });
              if (!response.ok) showRequestError(response);
            }}
            onLeave={() => {
              setRoomPlayers([]);
              socket.emit('leaveRoom');
              setRoomCode('');
              setCurrentScreen('gameSettingsOnline');
            }}
            roomCode={roomCode}
            isHost={roomPlayers.find((p) => p.id === socket.id)?.isHost ?? false}
            {...roundSettings}
          />
        )}

        {currentScreen === 'game' && (
            <GameScreen
                isOnline={isOnline}
                isWaiting={onlineAnswerSubmitted}
                onBack={() => {
                  if (isOnline) {
                      socket.emit('leaveRoom');   // Server schließt den Raum, wenn der Host geht
                      socket.disconnect();
                      setOnlineStatus(false);
                      setRoomPlayers([]);
                      setRoomCode('');
                  }
                  resetPlayerSetup();
                  setCurrentScreen('main');
              }}
                duration={duration}
                endsAt={isOnline ? timerEndsAt : null}
                players={players}
                playerCount={playerCount}
                currentPlayerIndex={currentPlayerIndex}
                onNext={isOnline ? submitOnlineAnswer : nextQuestion}
                textValue={textValue}
                setTextValue={setTextValue}
                currentQuestion={currentQuestions[currentPlayerIndex]}
                isFacebookMode={isFacebookMode}
                facebookQuestion={facebookQuestions[currentPlayerIndex]}
                selectedFacebookOption={selectedFacebookOption}
                setSelectedFacebookOption={setSelectedFacebookOption}
            />
        )}

        {currentScreen === 'answer' && (
          <AnswerScreen
            isOnline={isOnline}
            isWaiting={onlineResponseSubmitted}
            onBack={() => {
              if (isOnline) {
                  socket.emit('leaveRoom');   // Server schließt den Raum, wenn der Host geht
                  socket.disconnect();
                  setOnlineStatus(false);
                  setRoomPlayers([]);
                  setRoomCode('');
              }
              resetPlayerSetup();
              setCurrentScreen('main');
            }}
            players = {players}
            playerCount = {playerCount}
            duration = {duration}
            endsAt={isOnline ? timerEndsAt : null}
            currentPlayerIndex={currentPlayerIndex}
            answerText={answerText}
            setAnswerText={setAnswerText}
            shuffledAnswers={shuffledFirstAnswers}
            onNext={isOnline ? submitOnlineResponse : nextAnswer}
            answerPrompt={currentRoundObj?.answer?.[0]}
            currentLogo={currentLogo}
            primaryColor={currentRoundObj?.color[0]}
            secondaryColor={currentRoundObj?.color[1]}
            tertiaryColor={currentRoundObj?.color[2]}
            isFacebookMode={isFacebookMode}
            facebookImage={shuffledFacebookImages[currentPlayerIndex]}
            answerAuthor={players[shuffledIndices[currentPlayerIndex]]}
          />
        )}
 
        {currentScreen === 'transition' && (
            <GameTransitionScreen 
                onFinish={() => setCurrentScreen('game')}
                roundName={currentCategoryName} 
                currentLogo={currentLogo}
                primaryColor={currentRoundObj?.color[0]}
                secondaryColor={currentRoundObj?.color[2]}
                currentRoundNumber={currentRoundIndex}
                totalRounds={gameRounds.length}
                evaluation={isEvaluating}
                onNext={() => setCurrentScreen('evaluation')}
            />
        )}

        {currentScreen === 'evaluationWaiting' && (
          <EvaluationWaitingScreen
              playerColor={roomPlayers.find((p) => p.id === socket.id)?.color}
          />
        )}
 
      </View>
    </SafeAreaView>
    </LanguageContext.Provider>
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