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


    console.log('AKTUELLER SPIELER:', currentPlayer);
    console.log('BILD:', currentPlayer?.image);

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
                                            styles.googleMapsBar,
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
                                            <Text style={styles.evaluatingText}>
                                                {answers[currentPlayerIndex]}
                                            </Text>

                                        {/* Datum */}
                                        <Text style={styles.googleMapsDate}>
                                            {getCurrentDateTime()}
                                        </Text>

                                        {/* Eingecheckt bei */}
                                        <Text style={styles.googleMapsLabel}>
                                            Eingecheckt bei:
                                        </Text>

                                        {/* Ort */}
                                        <Text style={styles.googleMapsLocation}>
                                            📍{questions[currentPlayerIndex]}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {gameMode === 'Reddit' && (
                                <Text style={styles.evaluatingText}>
                                    Test2
                                </Text>
                            )}
                            {gameMode === 'Youtube' && (
                                <Text style={styles.evaluatingText}>
                                    Test3
                                </Text>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1c1c1e',
        textAlign: 'center',
        letterSpacing: 2,
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
        paddingBottom: 30,
    },

    googleMapsDate: {
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
        fontSize: 36,
        fontWeight: '900',
        color: '#000000',
        marginTop: 20,
    },
        googleMapsBar: {
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

});