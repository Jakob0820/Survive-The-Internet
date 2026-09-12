import React, { useEffect, useRef, useState } from 'react';
import tinycolor from 'tinycolor2';
import { COLOR_OPTIONS, COLOR_IMAGES } from '../constants/colors';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    Image,
    SafeAreaView,
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
    answers,
    questions,
    currentLogo,
    primaryColor,
    secondaryColor,
    textColor,
    gameMode,
}) {

    const [showResult, setShowResult] = useState(false);

    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.9)).current;

    const resultOpacity = useRef(new Animated.Value(0)).current;
    const resultScale = useRef(new Animated.Value(1.05)).current;

    const currentPlayer = players[currentPlayerIndex];
    const playerColor = currentPlayer?.color;
    const lightPlayerColor = tinycolor(playerColor).lighten(25).brighten(10).toHexString();

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

    const handleShowResult = () => {
        setShowResult(true);

        Animated.parallel([
            Animated.timing(resultOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(resultScale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    };
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
    

    if (showResult) {
        return (
            <View style={[
                styles.resultContainer, {backgroundColor: primaryColor}]}>
                <Animated.View
                    style={[
                        styles.resultScreen,
                        {
                            opacity: resultOpacity,
                            transform: [{ scale: resultScale }],
                        },
                    ]}
                >
                    <SafeAreaView style={styles.resultContent}>
                        <Image
                            source={currentLogo}
                            style={styles.resultLogo}
                            resizeMode="contain"
                        />
                        <View style={[styles.evaluationBox,{backgroundColor: secondaryColor}]}>

                            {gameMode === 'Google Maps' && (
                                <View style={styles.googleMapsInterface}>
                                    
                                    <View
                                        style={[
                                            styles.topBar,
                                            { backgroundColor: lightPlayerColor }
                                        ]}
                                    >
                                        <View style={styles.titleRow}>
                                            <Image
                                                source={currentPlayer?.image}
                                                style={styles.playerImage}
                                                resizeMode="contain"
                                            />
                                            <Text style={[styles.playerName, {color: playerColor}]}>
                                                {currentPlayer?.name}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.googleMapsContent}>
                                        {/* Text oben */}
                                        <View style={styles.googleMapsQuestionBox}>
                                            <AutoSizeText
                                                text={answers[currentPlayerIndex]}
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
                                                        text = {questions[currentPlayerIndex]}
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
                                                text={questions[currentPlayerIndex]}
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
                                                source={currentPlayer?.image}
                                                style={styles.redditSecondaryAvatar}
                                                resizeMode="contain"
                                            />
                                            <View style={styles.redditCommentInfo}>
                                                <Text style={styles.redditSecondaryUsername}>
                                                    {currentPlayer?.name}
                                                </Text>

                                                <View style={styles.redditCommentBox}>
                                                    <AutoSizeText
                                                        text = {answers[currentPlayerIndex]}
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
                                    <View style={[styles.youtubeVideoBar, { backgroundColor: lightPlayerColor }]}>
                                        <Text style={styles.youtubeControlIcon}>⏸</Text>
                                        <Text style={styles.youtubeControlIcon}>🔊</Text>
                                        <View style={styles.youtubeProgressTrack}>
                                            <View style={[styles.youtubeProgressFill, {backgroundColor: playerColor}]} />
                                            <View style={[styles.youtubeProgressThumb, {backgroundColor: playerColor}]} />
                                        </View>
                                    </View>

                                    {/* Titel + Stats */}
                                    <View style={styles.youtubeTitleSection}>
                                        <View style={styles.youtubeTitleBox}>
                                            <AutoSizeText
                                                text={questions[currentPlayerIndex]}
                                                style={styles.youtubeTitle}
                                                minFontSize={42}
                                                maxFontSize={52}
                                            />
                                        </View>

                                        <View style={styles.youtubeStatsRow}>
                                            <Text style={styles.youtubeStatIcon}>👍</Text>
                                            <Text style={styles.youtubeStatText}>1658</Text>

                                            <Text style={styles.youtubeStatIcon}>👎</Text>
                                            <Text style={styles.youtubeStatText}>3623</Text>

                                            <Text style={styles.youtubeViewsText}>95.807 Aufrufe</Text>
                                        </View>
                                    </View>

                                    {/* Kanal + Kommentar */}
                                    <View style={styles.youtubeChannelSection}>
                                        <Image
                                            source={currentPlayer?.image}
                                            style={styles.youtubeChannelAvatar}
                                            resizeMode="contain"
                                        />

                                        <View style={styles.youtubeChannelInfo}>
                                            <Text style={[styles.youtubeChannelName, { color: playerColor }]}>
                                                {currentPlayer?.name}
                                            </Text>

                                            <View style={styles.youtubeDescriptionBox}>
                                                <AutoSizeText
                                                    text={answers[currentPlayerIndex]}
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
                                <Text style={styles.evaluatingText}>
                                    Test4
                                </Text>
                            )}
                            {gameMode === 'Tagesschau' && (
                                <Text style={styles.evaluatingText}>
                                    Test5
                                </Text>
                            )}
                            {gameMode === 'Gutefrage.net' && (
                                <Text style={styles.evaluatingText}>
                                    Test6
                                </Text>
                            )}
                            {gameMode === 'GoFundMe' && (
                                <Text style={styles.evaluatingText}>
                                    Test7
                                </Text>
                            )}
                            {gameMode === 'Twitter' && (
                                <Text style={styles.evaluatingText}>
                                    Test8
                                </Text>
                            )}
                            {gameMode === 'Ebay' && (
                                <Text style={styles.evaluatingText}>
                                    Test9
                                </Text>
                            )}
                        </View>
                    </SafeAreaView>
                </Animated.View>
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

const styles = StyleSheet.create({

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

});