import React, { useEffect, useRef, useState, useMemo, useLayoutEffect, use } from 'react';
import tinycolor from 'tinycolor2';
import { COLOR_OPTIONS, COLOR_IMAGES } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
StyleSheet,
Text,
View,
TouchableOpacity,
Animated,
Image,
SafeAreaView,
Dimensions,
PanResponder,
Pressable,
} from 'react-native';

function AutoSizeText({ text, style, minFontSize = 16, maxFontSize = 100 }) {
const [containerSize, setContainerSize] = useState(null);

const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
};

const fontSize = containerSize
    ? Math.min(
          maxFontSize,
          Math.max(
              minFontSize,
              Math.sqrt((containerSize.width * containerSize.height * 1.3) / Math.max(text.length, 1))
          )
      )
    : minFontSize;

return (
    <View style={{ flex: 1, width: '100%' }} onLayout={onLayout}>
        <Text
            style={[style, { fontSize }]}
            adjustsFontSizeToFit
            numberOfLines={6}
            minimumFontScale={0.3}
        >
            {text}
        </Text>
    </View>
);

}

export default function EvaluationScreen({
onShowResult,
players,
playerCount,
currentPlayerIndex,
onNext,
evaluationData,
evaluationOrder,
currentLogo,
primaryColor,
secondaryColor,
gameMode,
onVote,

}) {

const [showResult, setShowResult] = useState(false);

const [allRevealed, setAllRevealed] = useState(false);
const [revealIndex, setRevealIndex] = useState(0);

const [isVoting, setIsVoting] = useState(false);
const [votesLeft, setVotesLeft] = useState(playerCount);
const votingDone = votesLeft <= 0;
const votesCast = playerCount - votesLeft;
const voter = players[Math.min(votesCast, playerCount - 1)];

const stampScale = useRef(new Animated.Value(0.3)).current;
const stampOpacity = useRef(new Animated.Value(0)).current;
const pressScale = useRef(new Animated.Value(1)).current;
const voteAnim = useRef(null);

const playVoteFeedback = () => {
    // laufende Animation stoppen, falls jemand schnell mehrfach tippt
    voteAnim.current?.stop();
    stampScale.setValue(0.3);
    stampOpacity.setValue(0);
    pressScale.setValue(1);

    voteAnim.current = Animated.parallel([
        // Stempel poppt auf
        Animated.spring(stampScale, {
            toValue: 1,
            friction: 4,
            tension: 120,
            useNativeDriver: true,
        }),
        // Stempel ein- und wieder ausblenden
        Animated.sequence([
            Animated.timing(stampOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
            Animated.delay(450),
            Animated.timing(stampOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]),
        // Karte drückt sich kurz ein
        Animated.sequence([
            Animated.timing(pressScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.spring(pressScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        ]),

    ]);
    voteAnim.current.start();
};

const handleVote = () => {
    if (isSwiping.current || votesLeft <= 0) return;
    if (isOwnCard) {
        playDenyFeedback();
        return;
    }
    onVote(evaluationOrder[displayIndex]);
    setVotesLeft((v) => v - 1);
    playVoteFeedback();
};

const logoHeight = useRef(new Animated.Value(256)).current;
const logoOpacity = useRef(new Animated.Value(1)).current;

const votingBarTranslateY = useRef(new Animated.Value(-300)).current;
const voteButtonTranslateY = useRef(new Animated.Value(300)).current;

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const resultTranslateY = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
const resultTranslateX = useRef(new Animated.Value(0)).current;

const cardOpacity = useRef(new Animated.Value(0)).current;
const cardScale = useRef(new Animated.Value(0.9)).current;

const displayIndex = allRevealed ? revealIndex : currentPlayerIndex;
const isOwnCard = !votingDone && evaluationOrder[displayIndex] === votesCast;

const currentPlayer = players[evaluationData[evaluationOrder[displayIndex]].originalIndex];
const playerColor = currentPlayer?.color;
const lightPlayerColor = tinycolor(playerColor).lighten(25).brighten(10).toHexString();

const STEP = SCREEN_WIDTH;
const SWIPE_THRESHOLD = 100;

const scrollX = useRef(new Animated.Value(0)).current;
const revealIndexRef = useRef(0);
const isSwiping = useRef(false);
const shakeX = useRef(new Animated.Value(0)).current;

const cardX = useMemo(
    () => evaluationOrder.map((_, i) => Animated.add(scrollX, i * STEP)),
    [evaluationOrder.length, scrollX]
);

const playDenyFeedback = () => {
    shakeX.setValue(0);
    Animated.sequence([
        Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
};
//Vote beendet
useEffect(() => {
    if (!votingDone) return;
    const t = setTimeout(onShowResult, 900);
    return () => clearTimeout(t);
}, [votingDone]);

useEffect(() => {
    Animated.parallel([
        Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
        }),
    ]).start();
}, []);
useEffect(() => {
    Animated.timing(scrollX, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
    }).start();
}, []);
//Anfangsanimation
useEffect(() => {
    if (!showResult) return;
    if (allRevealed) return;

    // Neue Box links außerhalb des Screens starten
    resultTranslateX.setValue(SCREEN_WIDTH);

    // Von links nach innen animieren
    Animated.timing(resultTranslateX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
    }).start();

}, [showResult, currentPlayerIndex, allRevealed]);
//Animation für das Showcase
useEffect(() => {
    if (!showResult) return;
    if (allRevealed) return;
    if (isVoting) return;

    const timer = setTimeout(() => {

        if (currentPlayerIndex >= playerCount - 1) {
            setAllRevealed(true);
            revealIndexRef.current = currentPlayerIndex;
            scrollX.setValue(-currentPlayerIndex * STEP);
            setRevealIndex(currentPlayerIndex);
            return;
        }

        Animated.timing(resultTranslateX, {
            toValue: -SCREEN_WIDTH,
            duration: 350,
            useNativeDriver: true,
        }).start(({ finished }) => {

            if (finished) {
                resultTranslateX.setValue(-SCREEN_WIDTH);
                onNext();
            }

        });

    }, 1000);

    return () => clearTimeout(timer);

}, [
    showResult,
    allRevealed,
    isVoting,
    currentPlayerIndex,
    playerCount,
    onNext
]);

const handleShowResult = () => {
    setShowResult(true);
};
//Logo raus, VotingBar , VotingButton und WeiterButton rein.
useEffect(() => {
    if (!allRevealed) return;

    Animated.parallel([
        Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
        }),
        Animated.timing(logoHeight, {
            toValue: 120,
            duration: 600,
            useNativeDriver: false,
        }),
    ]).start();

    // Voting-Bar von oben
    Animated.sequence([
        Animated.delay(400),
        Animated.spring(votingBarTranslateY, {
            toValue: 0,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
        }),
    ]).start();

    // Abstimmen-Button von unten
    Animated.sequence([
        Animated.delay(600),
        Animated.spring(voteButtonTranslateY, {
            toValue: 0,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
        }),
    ]).start();

}, [allRevealed]);

const panResponder = useMemo(() => {
    const snapTo = (target) => {
        isSwiping.current = true;
        Animated.timing(scrollX, {
            toValue: -target * STEP,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            revealIndexRef.current = target;
            setRevealIndex(target);
            isSwiping.current = false;
        });
    };

    return PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
            !isSwiping.current && Math.abs(g.dx) > Math.abs(g.dy),

        onPanResponderMove: (_, g) => {
            if (isSwiping.current) return;
            const i = revealIndexRef.current;
            let dx = g.dx;
            if ((i === 0 && dx > 0) || (i === playerCount - 1 && dx < 0)) {
                dx *= 0.25; // Gummiband an den Rändern
            }
            scrollX.setValue(-i * STEP + dx);
        },

        onPanResponderRelease: (_, g) => {
            if (isSwiping.current) return;
            const i = revealIndexRef.current;
            let target = i;
            if (g.dx < -SWIPE_THRESHOLD && i < playerCount - 1) target = i + 1;
            else if (g.dx > SWIPE_THRESHOLD && i > 0) target = i - 1;
            snapTo(target);
        },

        onPanResponderTerminate: () => snapTo(revealIndexRef.current),
    });
}, [playerCount]);

useEffect(() => {
    if (!showResult) {
        setAllRevealed(false);
        logoHeight.setValue(256);
        logoOpacity.setValue(1);
        votingBarTranslateY.setValue(-300);
        voteButtonTranslateY.setValue(300);
    }
}, [showResult]);


const getCurrentDateTime = () => {
    const now = new Date();

    const date = now.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const time = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${date}, ${time} Uhr`;
};

const renderCardContent = (entry) => {
    const player = players[entry.originalIndex];
    const answer = entry.originalAnswer;
    const response = entry.response;
    const pColor = player?.color;
    const lightPColor = tinycolor(pColor).lighten(25).brighten(10).toHexString();
    const s = entry.stats;

    return (
        <>
            {gameMode === 'Google Maps' && (
                <View style={styles.googleMapsInterface}>
                    
                    <View
                        style={[
                            styles.topBar,
                            { backgroundColor: lightPColor }
                        ]}
                    >
                        <View style={styles.titleRow}>
                            <Image
                                source={player?.image}
                                style={styles.playerImage}
                                resizeMode="contain"
                            />
                            <Text style={[styles.playerName, {color: pColor}]}>
                                {player?.name}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.googleMapsContent}>
                        {/* Text oben */}
                        <View style={styles.googleMapsQuestionBox}>
                            <AutoSizeText
                                text={answer}
                                style={styles.googleMapsEvaluationText}
                                minFontSize={38}
                                maxFontSize={52}
                            />
                        </View>

                        {/* Datum */}
                        <Text style={styles.date}>
                            {getCurrentDateTime()}
                        </Text>

                        {/* Eingecheckt bei */}
                        <Text style={styles.googleMapsLabel}>
                            Eingecheckt bei:
                        </Text>

                        {/* Ort */}
                        <View style={styles.googleMapsAnswerBox}>
                            <View style={styles.googleMapsLocationRow}>
                                <Text style={styles.googleMapsPin}>📍</Text>
                                <View style={styles.redditCommentBox}>
                                    <AutoSizeText
                                        text = {response}
                                        style={styles.googleMapsLocation}
                                        minFontSize={32}
                                        maxFontSize={42}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}
            {gameMode === 'Reddit' && (
                <View style={styles.redditInterface}>
                    <View style={styles.redditInner}>

                    {/* Reddit Post */}
                    <View style={styles.redditPost}>

                        <View style={styles.redditHeader}>
                            <Image
                                source={COLOR_IMAGES[8]}
                                style={styles.redditAvatar}
                                resizeMode="contain"
                            />

                            <View style={styles.redditHeaderText}>
                                <Text style={styles.redditUsername}>
                                    ████
                                </Text>

                                <Text
                                    style={styles.redditDate}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit={true}
                                    minimumFontScale={0.6}
                                >
                                    {getCurrentDateTime()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.redditPostTitleBox}>
                            <AutoSizeText
                                text = {response}
                                style={styles.redditPostTitle}
                                minFontSize={36}
                                maxFontSize={42}
                            />
                        </View>

                        <View style={styles.redditActions}>
                            <Text style={styles.redditAction}>👍 Like</Text>
                            <Text style={styles.redditAction}>💬 Kommentar</Text>
                            <Text style={styles.redditAction}>↗ Teilen</Text>
                        </View>

                    </View>

                    <View style={styles.redditDivider} />

                    {/* Kommentar */}
                    <View style={styles.redditComment}>

                        <View style={styles.secondaryHeader}>
                            <Image
                                source={player?.image}
                                style={styles.redditSecondaryAvatar}
                                resizeMode="contain"
                            />
                            <View style={styles.redditCommentInfo}>
                                <Text style={styles.redditSecondaryUsername}>
                                    {player?.name}
                                </Text>

                                <View style={styles.redditCommentBox}>
                                    <AutoSizeText
                                        text={answer}
                                        style={styles.redditCommentText}
                                        minFontSize={20}
                                        maxFontSize={32}
                                    />
                                </View>
                            </View>
                        </View>

                    </View>
                    </View>

                </View>
            )}
            {gameMode === 'Youtube' && (
                <View style={styles.youtubeInterface}>

                    {/* Video-Leiste mit Fortschrittsbalken */}
                    <View style={[styles.youtubeVideoBar, { backgroundColor: pColor }]}>
                        <Ionicons name="pause" size={28} color="#FFFFFF" paddingHorizontal='5' />
                        <Ionicons name="volume-high" size={28} color="#FFFFFF" paddingHorizontal='5' />
                        <View style={styles.youtubeProgressTrack}>
                            <View style={[styles.youtubeProgressFill, {backgroundColor: lightPColor}]} />
                            <View style={[styles.youtubeProgressThumb, {backgroundColor: lightPColor}]} />
                        </View>
                    </View>

                    {/* Titel + Stats */}
                    <View style={styles.youtubeTitleSection}>
                        <View style={styles.youtubeTitleBox}>
                            <AutoSizeText
                                text={response}
                                style={styles.youtubeTitle}
                                minFontSize={42}
                                maxFontSize={52}
                            />
                        </View>

                        <View style={styles.youtubeStatsRow}>
                            <Text style={styles.youtubeStatIcon}>👍</Text>
                            <Text style={styles.youtubeStatText}>{s.likes}</Text>

                            <Text style={styles.youtubeStatIcon}>👎</Text>
                            <Text style={styles.youtubeStatText}>{s.dislikes}</Text>

                            <Text style={styles.youtubeViewsText}>{s.views} Aufrufe</Text>
                        </View>
                    </View>

                    {/* Kanal + Kommentar */}
                    <View style={styles.youtubeChannelSection}>
                        <Image
                            source={player?.image}
                            style={styles.youtubeChannelAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.youtubeChannelInfo}>
                            <Text style={[styles.youtubeChannelName, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.youtubeDescriptionBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.youtubeDescription}
                                    minFontSize={32}
                                    maxFontSize={42}
                                />
                            </View>
                        </View>
                    </View>

                </View>
            )}
            {gameMode === 'LinkedIN' && (
                <View style={styles.linkedinInterface}>

                    {/* Header: Avatar + Name + "empfiehlt" + empfohlene Person/Sache */}
                    <View style={styles.linkedinHeader}>
                        <Image
                            source={player?.image}
                            style={styles.linkedinAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.linkedinHeaderText}>
                            <Text style={[styles.linkedinName, { color: pColor }]}>
                                {player?.name}
                            </Text>
                            <Text style={styles.linkedinRecommends}>
                                empfiehlt
                            </Text>

                            <View style={styles.linkedinSubjectBox}>
                                <AutoSizeText
                                    text={response}
                                    style={styles.linkedinSubject}
                                    minFontSize={32}
                                    maxFontSize={64}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Zitat-Box */}
                    <View style={[styles.linkedinQuoteBox, { backgroundColor: pColor }]}>
                        <Text style={styles.linkedinQuoteMark}>❝</Text>

                        <View style={styles.linkedinQuoteTextBox}>
                            <AutoSizeText
                                text={answer}
                                style={styles.linkedinQuoteText}
                                minFontSize={26}
                                maxFontSize={40}
                            />
                        </View>

                        <Text style={[styles.linkedinQuoteMark, styles.linkedinQuoteMarkEnd]}>❞</Text>
                    </View>

                </View>
            )}
            {gameMode === 'Tagesschau' && (
                <View style={styles.tagesschauInterface}>

                    {/* Navigationsleiste */}
                    <View style={styles.tagesschauNavBar}>
                        <View style={[styles.tagesschauLogoBox, { backgroundColor: lightPColor }]}>
                            <Text style={[styles.tagesschauLogoNews, { color: pColor }]}>
                                NEWS
                            </Text>
                            <Text style={styles.tagesschauLogoToday}>
                                Today
                            </Text>
                        </View>

                        <View style={[styles.tagesschauNavItems, { backgroundColor: pColor }]}>
                            <Text style={styles.tagesschauNavItem}>Welt</Text>
                            <Text style={styles.tagesschauNavItem}>Geld</Text>
                            <Text style={styles.tagesschauNavItem}>Essen</Text>
                        </View>
                    </View>

                    {/* Schlagzeile + Datum */}
                    <View style={styles.tagesschauHeadlineSection}>
                        <View style={styles.tagesschauHeadlineBox}>
                            <AutoSizeText
                                text={response}
                                style={styles.tagesschauHeadline}
                                minFontSize={54}
                                maxFontSize={72}
                            />
                        </View>

                        <Text style={styles.tagesschauDate}>
                            {getCurrentDateTime()}
                        </Text>
                    </View>

                    {/* Kommentar */}
                    <View style={styles.tagesschauCommentSection}>
                        <Image
                            source={player?.image}
                            style={styles.tagesschauAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.tagesschauCommentInfo}>
                            <Text style={[styles.tagesschauUsername, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.tagesschauCommentBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.tagesschauCommentText}
                                    minFontSize={26}
                                    maxFontSize={36}
                                />
                            </View>
                        </View>
                    </View>

                </View>
            )}
            {gameMode === 'Gutefrage.net' && (
                <View style={styles.gutefrageInterface}>

                    {/* Header */}
                    <View style={[styles.gutefrageHeader, { backgroundColor: pColor }]}>
                        <Text style={[styles.gutefrageHeaderTitle, {color: lightPColor}]}>
                            Frag {player?.name} etwas!
                        </Text>
                    </View>

                    {/* Frage-Box */}
                    <View style={styles.gutefrageQuestionCard}>
                        <View style={[styles.gutefrageTimeBar, { backgroundColor: lightPColor }]}>
                            <Text style={styles.gutefrageTimeText}>
                                Vor {s.hoursAgo} Stunden gestellt
                            </Text>
                        </View>

                        <View style={styles.gutefrageQuestionRow}>
                            <View style={styles.gutefrageVotes}>
                                <Ionicons name="thumbs-up" size={26} color="#AAAAAA" style={{ marginBottom: 10 }} />
                                <Text style={styles.gutefrageVoteCount}>{s.votes}</Text>
                                <Ionicons name="thumbs-down" size={26} color="#AAAAAA" style={{ marginTop: 10 }} />
                            </View>

                            <View style={styles.gutefrageQuestionBox}>
                                <AutoSizeText
                                    text={response}
                                    style={styles.gutefrageQuestionText}
                                    minFontSize={28}
                                    maxFontSize={48}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Antwort */}
                    <View style={styles.gutefrageAnswerSection}>
                        <Image
                            source={player?.image}
                            style={styles.gutefrageAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.gutefrageAnswerInfo}>
                            <Text style={[styles.gutefrageAnswerName, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.gutefrageAnswerBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.gutefrageAnswerText}
                                    minFontSize={32}
                                    maxFontSize={44}
                                />
                            </View>
                        </View>
                    </View>

                </View>
            )}
            {gameMode === 'GoFundMe' && (
                <View style={styles.gofundmeInterface}>

                    {/* Header */}
                    <View style={[styles.gofundmeHeader, { backgroundColor: pColor }]}>
                        <View style={styles.gofundmeLogoBox}>
                            <Text style={styles.gofundmeLogoGo}>Go</Text>
                            <Text style={styles.gofundmeLogoFundMe}>FundMe</Text>
                        </View>

                        <Ionicons name="menu" size={30} color="#FFFFFF" />
                    </View>

                    {/* Titel */}
                    <View style={styles.gofundmeTitleSection}>
                        <View style={styles.gofundmeTitleBox}>
                            <AutoSizeText
                                text={response}
                                style={styles.gofundmeTitle}
                                minFontSize={20}
                                maxFontSize={44}
                            />
                        </View>
                    </View>

                    {/* Stats + Button */}
                    <View style={styles.gofundmeStatsRow}>
                        <View style={styles.gofundmeStatBlock}>
                            <Text style={[styles.gofundmeStatValue, { color: pColor }]}>
                                {s.funds}€
                            </Text>
                            <Text style={styles.gofundmeStatLabel}>
                                Bisher gesammelt
                            </Text>
                        </View>

                        <View style={styles.gofundmeStatBlock}>
                            <Text style={[styles.gofundmeStatValue, { color: pColor }]}>
                                {s.supporters}
                            </Text>
                            <Text style={styles.gofundmeStatLabel}>
                                Unterstützer
                            </Text>
                        </View>

                        <View style={[styles.gofundmeButton, { backgroundColor: lightPColor }]}>
                            <Text style={styles.gofundmeButtonText}>
                                JETZT{'\n'}HELFEN
                            </Text>
                        </View>
                    </View>

                    {/* Kommentar */}
                    <View style={styles.gofundmeCommentSection}>
                        <Image
                            source={player?.image}
                            style={styles.gofundmeAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.gofundmeCommentInfo}>
                            <Text style={[styles.gofundmeName, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.gofundmeCommentBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.gofundmeCommentText}
                                    minFontSize={24}
                                    maxFontSize={42}
                                />
                            </View>
                        </View>
                    </View>

                </View>
            )}
            {gameMode === 'Twitter' && (
                <View style={styles.twitterInterface}>

                    {/* Header: Avatar + Name + Text */}
                    <View style={styles.twitterHeader}>
                        <Image
                            source={player?.image}
                            style={styles.twitterAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.twitterHeaderInfo}>
                            <Text style={[styles.twitterName, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.twitterTextBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.twitterText}
                                    minFontSize={30}
                                    maxFontSize={35}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Hashtag */}
                    <View style={styles.twitterHashtagBox}>
                        <AutoSizeText
                            text={response}
                            style={[styles.twitterHashtag, { color: pColor}]}
                            minFontSize={30}
                            maxFontSize={48}
                        />
                    </View>

                    {/* Stats */}
                    <View style={styles.twitterStatsRow}>
                        <View style={styles.twitterStatBlock}>
                            <Ionicons name="arrow-undo-outline" size={22} color="#AAAAAA" />
                            <Text style={styles.twitterStatText}>{s.replies}</Text>
                        </View>

                        <View style={styles.twitterStatBlock}>
                            <Ionicons name="repeat-outline" size={22} color="#AAAAAA" />
                            <Text style={styles.twitterStatText}>{s.retweets}</Text>
                        </View>

                        <View style={styles.twitterStatBlock}>
                            <Ionicons name="heart-outline" size={22} color="#AAAAAA" />
                            <Text style={styles.twitterStatText}>{s.hearts}</Text>
                        </View>
                    </View>

                </View>
            )}
            {gameMode === 'Ebay' && (
                <View style={styles.ebayInterface}>

                    {/* Suchleiste */}
                    <View style={[styles.ebaySearchBar, { backgroundColor: pColor }]}>
                        <View style={styles.ebaySearchInput}>
                            <Text style={styles.ebaySearchPlaceholder}>Wonach suchst du?</Text>

                            <View style={[styles.ebaySearchButton, {backgroundColor: lightPColor}]}>
                                <Ionicons name="search" size={20} color="#FFFFFF" />
                            </View>
                        </View>

                        <Ionicons name="cart-outline" size={30} color="#FFFFFF" style={{ marginLeft: 15 }} />
                    </View>

                    {/* Titel */}
                    <View style={styles.ebayTitleSection}>
                        <View style={styles.ebayTitleBox}>
                            <AutoSizeText
                                text={response}
                                style={styles.ebayTitle}
                                minFontSize={32}
                                maxFontSize={52}
                            />
                        </View>
                    </View>

                    {/* Sterne + Menge + Warenkorb-Button */}
                    <View style={styles.ebayActionRow}>
                        <View style={styles.ebayStars}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Ionicons
                                    key={i}
                                    name={i <= s.rating ? 'star' : 'star-outline'}
                                    size={22}
                                    color={i <= s.rating ? '#F5C518' : '#CCCCCC'}
                                    style={{ marginRight: 2 }}
                                />
                            ))}
                        </View>

                        <View style={styles.ebayCartButton}>
                            <Text style={styles.ebayCartButtonText}>IN DEN WARENKORB</Text>
                        </View>
                    </View>

                    {/* Kommentar */}
                    <View style={styles.ebayCommentSection}>
                        <Image
                            source={player?.image}
                            style={styles.ebayAvatar}
                            resizeMode="contain"
                        />

                        <View style={styles.ebayCommentInfo}>
                            <Text style={[styles.ebayName, { color: pColor }]}>
                                {player?.name}
                            </Text>

                            <View style={styles.ebayCommentBox}>
                                <AutoSizeText
                                    text={answer}
                                    style={styles.ebayCommentText}
                                    minFontSize={26}
                                    maxFontSize={42}
                                />
                            </View>
                        </View>
                    </View>

                </View>
            )}
        </>
    );
};

if (showResult) {
    return (
        <View style={[styles.resultContainer, { backgroundColor: primaryColor }]}>
            <View style={styles.resultScreen}>
                <SafeAreaView style={styles.resultContent}>
                    <Animated.View style={{ width: '90%', height: logoHeight, opacity: logoOpacity, overflow: 'hidden' }}>
                        <Image
                            source={currentLogo}
                            style={{ width: '100%', height: 256 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <View
                        {...(allRevealed ? panResponder.panHandlers : {})}
                        style={styles.carouselWrapper}
                    >
                        {evaluationOrder.map((orderIdx, i) => {
                            const visible = allRevealed
                                ? Math.abs(i - revealIndex) <= 1
                                : i === currentPlayerIndex;
                            if (!visible) return null;

                            return (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.evaluationBox,
                                        styles.carouselCard,
                                        {
                                            backgroundColor: secondaryColor,
                                            transform: [
                                                { translateX: allRevealed ? cardX[i] : resultTranslateX },
                                                { scale: pressScale },
                                                { translateX: shakeX },
                                            ],
                                        },
                                    ]}
                                >
                                    <Pressable
                                        style={{ width: '100%', height: '100%' }}
                                        disabled={!allRevealed || votingDone || i !== revealIndex}
                                        onPress={handleVote}
                                    >
                                        {renderCardContent(evaluationData[orderIdx])}
                                    </Pressable>

                                </Animated.View>
                            );
                        })}
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.voteStamp,
                                {
                                    opacity: stampOpacity,
                                    transform: [
                                        { scale: stampScale },
                                        { rotate: '-10deg' },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.voteStampEmoji}>🔥</Text>
                            <View style={styles.voteStampLabelBox}>
                                <Text style={styles.voteStampLabel}>ABGESTIMMT!</Text>
                            </View>
                        </Animated.View>
                    </View>
                </SafeAreaView>
            </View>
                {allRevealed && (
                    <Animated.View
                        style={[
                            styles.votingBar,
                            {
                                transform: [
                                    { translateY: votingBarTranslateY },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.votingBarText}>
                            Wähle für den Spieler, der am lächerlichsten aussieht!
                        </Text>
                    </Animated.View>
                )}
                {allRevealed && (
                    <Animated.View style={[styles.voteButtonContainer, { transform: [
                        { translateY: voteButtonTranslateY },
                    ]}]}>
                        <View style={styles.voterBox}>
                            <Image
                                source={voter?.image}
                                style={styles.voterAvatar}
                                resizeMode="contain"
                            />

                            <View style={styles.voterInfo}>
                                <Text style={styles.voterLabel} numberOfLines={1}>
                                    {votingDone
                                        ? 'Alle Stimmen vergeben!'
                                        : isOwnCard
                                            ? 'Das ist deine Karte – wisch weiter!'
                                            : 'Am Zug – Karte antippen'}
                                </Text>
                                <Text
                                    style={[styles.voterName, { color: voter?.color }]}
                                    numberOfLines={1}
                                >
                                    {voter?.name}
                                </Text>

                                <View style={styles.fireRow}>
                                    {Array.from({ length: playerCount }).map((_, i) => (
                                        <Text
                                            key={i}
                                            style={[styles.fireToken, i < votesCast && styles.fireTokenUsed]}
                                        >
                                            🔥
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}

        </View>
    );
}

return (
    <View style={styles.screenContainer}>
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }],
                },
            ]}
        >
            <Text style={styles.evaluatingText}>
                Auswertung
            </Text>
            

            <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                activeOpacity={0.8}
                onPress={handleShowResult}
            >
                <Text style={styles.btnText}>ERGEBNIS ANZEIGEN</Text>
            </TouchableOpacity>
        </Animated.View>
    </View>
);

}

// ── Shared / Grundgerüst ─────────────────────────────
const sharedStyles = {
screenContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
},

card: {
    width: '75%',
    maxWidth: 300,
    minHeight: 180,

    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,

    padding: 28,

    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
},

evaluatingText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1c1c1e',
    textAlign: 'center',
},

evaluationBox: {
    width: '90%',
    height: 500,

    marginTop: 'auto',
    marginBottom: 20,

    backgroundColor: '#FFFFFF',

    borderRadius: 30,

    padding: 0,

    justifyContent: 'flex-start',
    alignItems: 'stretch',

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
},

btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
},
btnSecondary: {
    backgroundColor: '#3799d1',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    marginTop: 'auto',
},
btnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
},

resultContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
},

resultContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
},

resultLogo: {
    width: '90%',
    height: 256,
},

votingBar: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 90,

    backgroundColor: '#000000',

    justifyContent: 'center',
    alignItems: 'center',


    zIndex: 100,
    elevation: 10,

    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderColor: '#E5E5E5'
},

votingBarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
},

voteButtonContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
},

voterBox: {
    width: '90%',
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
},

voterAvatar: {
    width: 56,
    height: 56,
    marginRight: 12,
},

voterInfo: {
    flex: 1,
    minWidth: 0,
},

voterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AAAAAA',
},

voterName: {
    fontSize: 24,
    fontWeight: '900',
},

voteStamp: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
},

voteStampEmoji: {
    fontSize: 140,
},

voteStampLabelBox: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 4,
},

voteStampLabel: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
},

fireRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
},

fireToken: {
    fontSize: 20,
    marginRight: 3,
},

fireTokenUsed: {
    opacity: 0.2,
},

carouselWrapper: {
    width: '100%',
    height: 500,
    marginTop: 'auto',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
},

carouselCard: {
    position: 'absolute',
    top: 0,
    left: '5%',
    width: '90%',
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
},

};

// ── Google Maps ──────────────────────────────────────
const googleMapsStyles = {
googleMapsInterface: {
width: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

googleMapsContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
},

date: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 15,
},

googleMapsLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 10,
},

googleMapsLocation: {
    fontWeight: '900',
    color: '#000000',
},

googleMapsQuestionBox: {
    width: '100%',
    height: 160,
    overflow: 'hidden',
},

googleMapsAnswerBox: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
},

googleMapsLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: '100%',
    marginTop: 10,
    marginBottom: 10,
},

googleMapsEvaluationText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1c1c1e',
    textAlign: 'left',
},

googleMapsPin: {
    fontSize: 36,
    marginRight: 10,
},

topBar: {
    width: '100%',
    height: 80,
},

titleRow: {
    width: '100%',
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
},

playerImage: {
    width: 70,
    height: 70,
    marginRight: 10,
},

playerName: {
    fontSize: 38,
    fontWeight: 'bold',
},

};

// ── Reddit ───────────────────────────────────────────
const redditStyles = {
redditInterface: {
width: '100%',
height: '100%',
backgroundColor: '#E5E5E5',
borderRadius: 30,
overflow: 'hidden',
},

redditInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
},

redditPost: {
    padding: 20,
},

redditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
},

secondaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
},

redditAvatar: {
    width: 90,
    height: 90,
    marginRight: 15,
},

redditSecondaryAvatar: {
    paddingTop: 5,
    width: 65,
    height: 65,
    marginRight: 10,
},

redditHeaderText: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
},

redditUsername: {
    fontSize: 32,
    fontWeight: '900',
    color: '#555555',
},

redditSecondaryUsername: {
    fontSize: 32,
    fontWeight: '900',
    color: '#555555',
},

redditDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 4,
    flexShrink: 1,
    lineHeight: 24,
},

redditPostTitle: {
    fontSize: '42',
    fontWeight: '900',
    color: '#000000',
    marginTop: 10,
},

redditPostTitleBox: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
},

redditActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
},

redditAction: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
},

redditDivider: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E5E5',
},

redditComment: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
    flex: 1,
},

redditCommentBox: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
},

redditCommentInfo: {
    flex: 1,
    marginLeft: 5,
},

redditCommentText: {
    width: '100%',
    height: '100%',
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'left',
},

};

// ── YouTube ──────────────────────────────────────────
const youtubeStyles = {
youtubeInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

youtubeVideoBar: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
},

youtubeControlIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginRight: 15,
},

youtubeProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginLeft: 10,
    justifyContent: 'center',
},

youtubeProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    borderRadius: 3,
},

youtubeProgressThumb: {
    position: 'absolute',
    left: '75%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
},

youtubeTitleSection: {
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#E5E5E5',
},

youtubeTitleBox: {
    width: '100%',
    height: 160,
    overflow: 'hidden',
},

youtubeTitle: {
    fontWeight: '900',
    color: '#000000',
},

youtubeStatsRow: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
},

youtubeStatIcon: {
    fontSize: 22,
    marginRight: 4,
},

youtubeStatText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#555555',
    marginRight: 15,
},

youtubeViewsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
    marginLeft: 'auto',
},

youtubeChannelSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 15,
},

youtubeChannelAvatar: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 8,
},

youtubeChannelInfo: {
    height: '100%',
    flex: 1,
    minWidth: 0,
},

youtubeChannelName: {
    fontSize: 26,
    fontWeight: '900',
},

youtubeDescriptionBox: {
    width: '100%',
    height: 120,
    marginTop: 5,
    overflow: 'hidden',
},

youtubeDescription: {
    fontWeight: '900',
    color: '#000000',
},

};

// ── LinkedIn ─────────────────────────────────────────
const linkedinStyles = {
linkedinInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

linkedinHeader: {
    width: '100%',
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
},

linkedinAvatar: {
    width: 90,
    height: 90,
    marginRight: 20,
},

linkedinHeaderText: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

linkedinName: {
    fontSize: 28,
    fontWeight: '900',
},

linkedinRecommends: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
},

linkedinSubjectBox: {
    width: '100%',
    flex: 1,
    marginTop: 5,
    overflow: 'hidden',
},

linkedinSubject: {
    fontWeight: '900',
    color: '#000000',
},

linkedinQuoteBox: {
    width: '90%',
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 0,
    marginBottom: 20,
},

linkedinQuoteMark: {
    fontSize: 50,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '900',
},

linkedinQuoteMarkEnd: {
    alignSelf: 'flex-end',
},

linkedinQuoteTextBox: {
    width: '100%',
    flex: 1,
    marginVertical: 5,
    overflow: 'hidden',
},

linkedinQuoteText: {
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
},

};

// ── Tagesschau ───────────────────────────────────────
const tagesschauStyles = {
tagesschauInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

tagesschauNavBar: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'stretch',
},

tagesschauLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
},

tagesschauLogoNews: {
    fontSize: 26,
    fontWeight: '900',
    marginRight: 6,
},

tagesschauLogoToday: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
},

tagesschauNavItems: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 10,
},

tagesschauNavItem: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
},

tagesschauHeadlineSection: {
    width: '100%',
    height: 250,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#E5E5E5',
},

tagesschauHeadlineBox: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
},

tagesschauHeadline: {
    fontWeight: '900',
    color: '#000000',
},

tagesschauDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 10,
    marginBottom: 15,
},

tagesschauCommentSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
},

tagesschauAvatar: {
    width: 60,
    height: 60,
    marginRight: 15,
},

tagesschauCommentInfo: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

tagesschauUsername: {
    fontSize: 26,
    fontWeight: '900',
},

tagesschauCommentBox: {
    width: '100%',
    height: 130,
    marginTop: 5,
    overflow: 'hidden',
},

tagesschauCommentText: {
    fontWeight: '900',
    color: '#000000',
},

};

// ── Gutefrage.net ────────────────────────────────────
const gutefrageStyles = {
gutefrageInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

gutefrageHeader: {
    width: '100%',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
},

gutefrageHeaderTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 0,
},

gutefrageQuestionCard: {
    width: '100%',
    height: 230,
    paddingHorizontal: 20,
    paddingTop: 15,
},

gutefrageTimeBar: {
    width: '100%',
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
},

gutefrageTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
},

gutefrageQuestionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderTopWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 10,
},

gutefrageVotes: {
    width: 60,
    alignItems: 'center',
    marginRight: 15,
},

gutefrageVoteCount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    marginVertical: 2,
},

gutefrageQuestionBox: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    minWidth: 0,
},

gutefrageQuestionText: {
    fontWeight: '900',
    color: '#000000',
},

gutefrageAnswerSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
},

gutefrageAvatar: {
    width: 80,
    height: 80,
    marginRight: 15,
},

gutefrageAnswerInfo: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

gutefrageAnswerName: {
    fontSize: 26,
    fontWeight: '900',
},

gutefrageAnswerBox: {
    width: '100%',
    flex: 1,
    marginTop: 5,
    overflow: 'hidden',
},

gutefrageAnswerText: {
    fontWeight: '700',
    color: '#000000',
},

};

// ── GoFundMe ─────────────────────────────────────────
const gofundmeStyles = {
gofundmeInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

gofundmeHeader: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
},

gofundmeLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
},

gofundmeLogoGo: {
    fontSize: 26,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
},

gofundmeLogoFundMe: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
},

gofundmeTitleSection: {
    width: '100%',
    height: 150,
    paddingHorizontal: 20,
    paddingTop: 15,
},

gofundmeTitleBox: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
},

gofundmeTitle: {
    fontWeight: '900',
    color: '#000000',
},

gofundmeStatsRow: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#E5E5E5',
},

gofundmeStatBlock: {
    marginRight: 15,
},

gofundmeStatValue: {
    fontSize: 24,
    fontWeight: '900',
},

gofundmeStatLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 2,
},

gofundmeButton: {
    marginLeft: 'auto',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
},

gofundmeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
},

gofundmeCommentSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
},

gofundmeAvatar: {
    width: 70,
    height: 70,
    marginRight: 15,
},

gofundmeCommentInfo: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

gofundmeName: {
    fontSize: 24,
    fontWeight: '900',
},

gofundmeCommentBox: {
    width: '100%',
    flex: 1,
    marginTop: 0,
    marginBottom: 5,
    overflow: 'hidden',
},

gofundmeCommentText: {
    fontWeight: '900',
    color: '#000000',
},

};

// ── Twitter ──────────────────────────────────────────
const twitterStyles = {
twitterInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

twitterHeader: {
    width: '100%',
    height: 180,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    overflow: 'hidden',
},

twitterAvatar: {
    width: 70,
    height: 70,
    marginRight: 15,
},

twitterHeaderInfo: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

twitterName: {
    fontSize: 28,
    fontWeight: '900',
},

twitterTextBox: {
    width: '100%',
    flex: 1,
    marginTop: 4,
    overflow: 'hidden',
},

twitterText: {
    fontWeight: '900',
    color: '#000000',
},

twitterHashtagBox: {
    width: '100%',
    flex: 1,
    marginTop: 5,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
},

twitterHashtag: {
    fontWeight: '900',
    textAlign: 'left',
},

twitterStatsRow: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
},

twitterStatBlock: {
    flexDirection: 'row',
    alignItems: 'center',
},

twitterStatText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AAAAAA',
    marginLeft: 8,
},

};

// ── Ebay ─────────────────────────────────────────────
const ebayStyles = {
ebayInterface: {
width: '100%',
height: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 30,
overflow: 'hidden',
},

ebaySearchBar: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
},

ebaySearchInput: {
    width: 280,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    minWidth: 0,
    overflow: 'hidden',
},

ebaySearchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999999',
    minWidth: 0,
},

ebaySearchIconWrapper: {
    marginLeft: 8,
},

ebayTitleSection: {
    width: '100%',
    height: 160,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
},

ebayTitleBox: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
},

ebayTitle: {
    fontWeight: '900',
    color: '#000000',
},

ebayActionRow: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#E5E5E5',
},

ebayStars: {
    flexDirection: 'row',
    alignItems: 'center',
},

ebayCartButton: {
    backgroundColor: '#AAAAAA',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
},

ebayCartButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
},

ebayCommentSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
},

ebayAvatar: {
    width: 70,
    height: 70,
    marginRight: 15,
},

ebayCommentInfo: {
    flex: 1,
    height: '100%',
    minWidth: 0,
},

ebayName: {
    fontSize: 26,
    fontWeight: '900',
},

ebayCommentBox: {
    width: '100%',
    height: 150,
    marginTop: 5,
    overflow: 'hidden',
},

ebayCommentText: {
    fontWeight: '900',
    color: '#000000',
},

ebaySearchButton: {
    height: '100%',
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
},

};

// ── Zusammenführen ───────────────────────────────────
const styles = StyleSheet.create({
...sharedStyles,
...googleMapsStyles,
...redditStyles,
...youtubeStyles,
...linkedinStyles,
...tagesschauStyles,
...gutefrageStyles,
...gofundmeStyles,
...twitterStyles,
...ebayStyles,
});